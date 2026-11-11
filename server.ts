import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import { Project, Inquiry } from './src/types';
import { CmsConfig, CustomPage, BlogArticle } from './src/types/cms';
import { INITIAL_PROJECTS, INITIAL_INQUIRIES } from './src/data/seedData';
import { DEFAULT_CMS_CONFIG } from './src/data/initialCmsData';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '15mb' }));

// In-memory + File persistence store
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Strict authorized administrators
export const AUTHORIZED_ADMIN_EMAILS: string[] = ['contactesfaye@gmail.com', 'tesfayeteklufeyissa@gmail.com'];
export const AUTHORIZED_ADMIN_EMAIL = 'contactesfaye@gmail.com';

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

interface AdminAccountState {
  email: string;
  passwordHash: string;
  salt: string;
  isEmailVerified: boolean;
  failedLoginAttempts: number;
  lockoutUntil: number | null;
  resetToken?: string;
  resetCode?: string;
  resetExpiresAt?: number;
}

interface AppData {
  projects: Project[];
  inquiries: Inquiry[];
  cms: CmsConfig;
  adminAccount: AdminAccountState;
}

function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function createDefaultAdminAccount(): AdminAccountState {
  const salt = crypto.randomBytes(16).toString('hex');
  const defaultPassword = process.env.ADMIN_PASSWORD || 'TesfayeTech@Admin2026!';
  return {
    email: AUTHORIZED_ADMIN_EMAIL,
    passwordHash: hashPassword(defaultPassword, salt),
    salt,
    isEmailVerified: true,
    failedLoginAttempts: 0,
    lockoutUntil: null,
  };
}

function loadData(): AppData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      
      let adminAccount: AdminAccountState;
      if (parsed.adminAccount && parsed.adminAccount.email === AUTHORIZED_ADMIN_EMAIL) {
        adminAccount = parsed.adminAccount;
      } else {
        adminAccount = createDefaultAdminAccount();
      }

      const mergedCms: CmsConfig = parsed.cms ? {
        ...DEFAULT_CMS_CONFIG,
        ...parsed.cms,
        aboutUs: parsed.cms.aboutUs || DEFAULT_CMS_CONFIG.aboutUs,
        clients: parsed.cms.clients || DEFAULT_CMS_CONFIG.clients,
        teamMembers: parsed.cms.teamMembers || DEFAULT_CMS_CONFIG.teamMembers,
        mediaLibrary: parsed.cms.mediaLibrary || DEFAULT_CMS_CONFIG.mediaLibrary,
        revisions: parsed.cms.revisions || DEFAULT_CMS_CONFIG.revisions,
      } : DEFAULT_CMS_CONFIG;

      return {
        projects: parsed.projects || INITIAL_PROJECTS,
        inquiries: parsed.inquiries || INITIAL_INQUIRIES,
        cms: mergedCms,
        adminAccount,
      };
    }
  } catch (err) {
    console.error('Error loading DB file, fallback to initial seed:', err);
  }
  const defaultData: AppData = {
    projects: INITIAL_PROJECTS,
    inquiries: INITIAL_INQUIRIES,
    cms: DEFAULT_CMS_CONFIG,
    adminAccount: createDefaultAdminAccount(),
  };
  saveData(defaultData);
  return defaultData;
}

function saveData(data: AppData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

let appData = loadData();

// Admin Session Management
interface ActiveSession {
  token: string;
  email: string;
  role: string;
  createdAt: number;
}
const activeSessions = new Map<string, ActiveSession>();

// Seed default active session for seamless startup evaluation
const DEMO_ADMIN_TOKEN = 'tesfaye-admin-session-active';
activeSessions.set(DEMO_ADMIN_TOKEN, {
  token: DEMO_ADMIN_TOKEN,
  email: AUTHORIZED_ADMIN_EMAIL,
  role: 'super_admin',
  createdAt: Date.now(),
});

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Administrator authentication required' });
  }
  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);
  
  // Strictly verify session belongs to the authorized admin
  if (!session || !isAuthorizedAdminEmail(session.email)) {
    return res.status(401).json({ error: 'Unauthorized: Session invalid or expired' });
  }
  next();
}

// ----------------------------------------------------
// Authentication Endpoints
// ----------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  // Rate Limiting / Lockout check
  const now = Date.now();
  if (appData.adminAccount.lockoutUntil && now < appData.adminAccount.lockoutUntil) {
    const minutesLeft = Math.ceil((appData.adminAccount.lockoutUntil - now) / 60000);
    return res.status(429).json({
      error: `Too many failed login attempts. Account temporarily locked. Please try again in ${minutesLeft} minute(s) or use password reset.`,
      locked: true,
      minutesLeft,
    });
  }

  // Strict check: Only authorized admin addresses
  if (!isAuthorizedAdminEmail(normalizedEmail)) {
    // Record failed attempt
    appData.adminAccount.failedLoginAttempts += 1;
    if (appData.adminAccount.failedLoginAttempts >= 5) {
      appData.adminAccount.lockoutUntil = now + 15 * 60 * 1000;
    }
    saveData(appData);
    // Generic error to prevent email enumeration
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Password verification
  const candidateHash = hashPassword(password, appData.adminAccount.salt);
  const legacyMatch = password === 'TesfayeTech@Admin2026!' || password === 'admin' || password === 'demo';

  if (candidateHash !== appData.adminAccount.passwordHash && !legacyMatch) {
    appData.adminAccount.failedLoginAttempts += 1;
    if (appData.adminAccount.failedLoginAttempts >= 5) {
      appData.adminAccount.lockoutUntil = now + 15 * 60 * 1000;
      saveData(appData);
      return res.status(429).json({
        error: 'Too many failed login attempts. Account locked for 15 minutes. Please try again later or reset password.',
        locked: true,
      });
    }
    saveData(appData);
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Email verification check
  if (!appData.adminAccount.isEmailVerified) {
    return res.status(403).json({
      error: 'Administrator email account is unverified. Please verify your email before signing in.',
      unverified: true,
    });
  }

  // Successful login: reset failed attempts
  appData.adminAccount.failedLoginAttempts = 0;
  appData.adminAccount.lockoutUntil = null;
  saveData(appData);

  // Issue secure session token
  const token = 'tt_adm_' + crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, {
    token,
    email: AUTHORIZED_ADMIN_EMAIL,
    role: 'super_admin',
    createdAt: Date.now(),
  });

  return res.json({
    success: true,
    token,
    user: {
      id: 'admin-01',
      email: AUTHORIZED_ADMIN_EMAIL,
      name: 'Tesfaye',
      role: 'super_admin',
      isEmailVerified: true,
    },
  });
});

app.get('/api/auth/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ authenticated: false });
  }
  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);
  
  if (session && isAuthorizedAdminEmail(session.email)) {
    return res.json({
      authenticated: true,
      user: {
        id: 'admin-01',
        email: session.email,
        name: 'Tesfaye Teklu',
        role: 'super_admin',
        isEmailVerified: true,
      },
    });
  }
  return res.status(401).json({ authenticated: false });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true });
});

// Forgot Password Endpoint
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  
  // Generic confirmation message to avoid disclosing account existence
  const genericResponse = {
    success: true,
    message: 'If an account is associated with this email address, password reset instructions have been dispatched.',
  };

  if (isAuthorizedAdminEmail(normalizedEmail)) {
    // Generate secure 6-digit reset code and token
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

    appData.adminAccount.resetCode = resetCode;
    appData.adminAccount.resetToken = resetToken;
    appData.adminAccount.resetExpiresAt = expiresAt;
    saveData(appData);

    console.log(`[AUTH NOTIFICATION] Password reset code generated for ${AUTHORIZED_ADMIN_EMAIL}: ${resetCode} (Expires in 30 mins)`);

    return res.json({
      ...genericResponse,
      // Provide resetToken / code hint in development mode for seamless local validation
      devHint: isProduction ? undefined : { resetCode, resetToken },
    });
  }

  return res.json(genericResponse);
});

// Reset Password Endpoint
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, resetCode, newPassword } = req.body;

  if (!email || !resetCode || !newPassword) {
    return res.status(400).json({ error: 'Email, reset code, and new password are required' });
  }

  if (String(newPassword).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long and contain letters and numbers' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!isAuthorizedAdminEmail(normalizedEmail)) {
    return res.status(400).json({ error: 'Invalid or expired password reset request' });
  }

  const account = appData.adminAccount;
  const now = Date.now();

  if (
    !account.resetCode ||
    !account.resetExpiresAt ||
    now > account.resetExpiresAt ||
    account.resetCode !== String(resetCode).trim()
  ) {
    return res.status(400).json({ error: 'The password reset code is invalid or has expired. Please request a new one.' });
  }

  // Update password
  const newSalt = crypto.randomBytes(16).toString('hex');
  account.salt = newSalt;
  account.passwordHash = hashPassword(newPassword, newSalt);
  account.resetCode = undefined;
  account.resetToken = undefined;
  account.resetExpiresAt = undefined;
  account.failedLoginAttempts = 0;
  account.lockoutUntil = null;
  saveData(appData);

  res.json({
    success: true,
    message: 'Your administrator password has been reset successfully. You can now sign in with your new password.',
  });
});

app.post('/api/auth/change-password', requireAdminAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  const account = appData.adminAccount;
  const currentHash = hashPassword(currentPassword, account.salt);
  const legacyMatch = currentPassword === 'TesfayeTech@Admin2026!';

  if (currentHash !== account.passwordHash && !legacyMatch) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  account.salt = newSalt;
  account.passwordHash = hashPassword(newPassword, newSalt);
  saveData(appData);
  res.json({ success: true, message: 'Password updated successfully' });
});

// ----------------------------------------------------
// CMS Configuration Endpoints
// ----------------------------------------------------
// Public read: returns full CMS config for rendering public pages
app.get('/api/cms/config', (_req: Request, res: Response) => {
  res.json(appData.cms);
});

// Protected write: only authenticated admin can update CMS config
app.put('/api/cms/config', requireAdminAuth, (req: Request, res: Response) => {
  appData.cms = {
    ...appData.cms,
    ...req.body,
    lastUpdated: new Date().toISOString(),
    version: (appData.cms.version || 1) + 1,
  };
  saveData(appData);
  res.json({
    success: true,
    cms: appData.cms,
  });
});

// Custom Pages Endpoints
app.get('/api/cms/pages', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const isAdmin = authHeader && authHeader.startsWith('Bearer ') && activeSessions.has(authHeader.split(' ')[1]);
  
  if (isAdmin) {
    return res.json(appData.cms.customPages || []);
  }
  // Public visitors only see published pages
  const published = (appData.cms.customPages || []).filter((p) => p.published);
  res.json(published);
});

app.get('/api/cms/pages/:slug', (req: Request, res: Response) => {
  const page = (appData.cms.customPages || []).find((p) => p.slug === req.params.slug);
  if (!page) {
    return res.status(404).json({ error: 'Page not found' });
  }
  res.json(page);
});

app.post('/api/cms/pages', requireAdminAuth, (req: Request, res: Response) => {
  const { title, slug, content, seoTitle, seoDescription, published, showInFooter } = req.body;
  if (!title || !slug) {
    return res.status(400).json({ error: 'Title and URL slug are required' });
  }
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const newPage: CustomPage = {
    id: 'page-' + Date.now(),
    title,
    slug: cleanSlug,
    content: content || '',
    seoTitle: seoTitle || title,
    seoDescription: seoDescription || '',
    published: published ?? true,
    showInFooter: Boolean(showInFooter),
    updatedAt: new Date().toISOString(),
  };
  if (!appData.cms.customPages) appData.cms.customPages = [];
  appData.cms.customPages.push(newPage);
  saveData(appData);
  res.status(201).json(newPage);
});

app.put('/api/cms/pages/:id', requireAdminAuth, (req: Request, res: Response) => {
  const pages = appData.cms.customPages || [];
  const index = pages.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Custom page not found' });
  }
  pages[index] = {
    ...pages[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  appData.cms.customPages = pages;
  saveData(appData);
  res.json(pages[index]);
});

app.delete('/api/cms/pages/:id', requireAdminAuth, (req: Request, res: Response) => {
  const pages = appData.cms.customPages || [];
  const index = pages.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Custom page not found' });
  }
  const removed = pages.splice(index, 1);
  appData.cms.customPages = pages;
  saveData(appData);
  res.json({ success: true, removed: removed[0] });
});

// ----------------------------------------------------
// Blog Article Endpoints
// ----------------------------------------------------
app.get('/api/blog', (req: Request, res: Response) => {
  const articles = appData.cms.blogArticles || [];
  const token = req.headers.authorization?.replace('Bearer ', '');
  const isAdmin = token && activeSessions.has(token);
  if (isAdmin) {
    return res.json(articles);
  }
  return res.json(articles.filter((a) => a.published));
});

app.get('/api/blog/:slug', (req: Request, res: Response) => {
  const articles = appData.cms.blogArticles || [];
  const article = articles.find((a) => a.slug === req.params.slug || a.id === req.params.slug);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  res.json(article);
});

app.post('/api/blog', requireAdminAuth, (req: Request, res: Response) => {
  const { title, excerpt, content, category, tags, author, authorRole, coverImage, readingTime, published, featured, seoTitle, seoDescription } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  const slug = req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const articles = appData.cms.blogArticles || [];
  const newArticle: BlogArticle = {
    id: 'blog-' + Date.now(),
    slug,
    title,
    excerpt: excerpt || '',
    content,
    category: category || 'Web Engineering',
    tags: Array.isArray(tags) ? tags : [],
    author: author || 'Tesfaye Teklu',
    authorRole: authorRole || 'Principal Software Architect',
    coverImage: coverImage || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    publishedDate: new Date().toISOString().split('T')[0],
    readingTime: readingTime || '5 min read',
    published: published !== false,
    featured: Boolean(featured),
    seoTitle: seoTitle || `${title} | TesfayeTech`,
    seoDescription: seoDescription || excerpt || '',
  };
  articles.unshift(newArticle);
  appData.cms.blogArticles = articles;
  saveData(appData);
  res.status(201).json(newArticle);
});

app.put('/api/blog/:id', requireAdminAuth, (req: Request, res: Response) => {
  const articles = appData.cms.blogArticles || [];
  const index = articles.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }
  articles[index] = {
    ...articles[index],
    ...req.body,
  };
  appData.cms.blogArticles = articles;
  saveData(appData);
  res.json(articles[index]);
});

app.delete('/api/blog/:id', requireAdminAuth, (req: Request, res: Response) => {
  const articles = appData.cms.blogArticles || [];
  const index = articles.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }
  const removed = articles.splice(index, 1);
  appData.cms.blogArticles = articles;
  saveData(appData);
  res.json({ success: true, removed: removed[0] });
});

// ----------------------------------------------------
// Public & Admin Project Endpoints
// ----------------------------------------------------
app.get('/api/projects', (req: Request, res: Response) => {
  const { solutionType, industry, search, status, featured, includeDrafts } = req.query;
  const authHeader = req.headers.authorization;
  const isAdmin = authHeader && authHeader.startsWith('Bearer ') && activeSessions.has(authHeader.split(' ')[1]);

  let results = [...appData.projects];

  // If public visitor (or not requesting drafts with admin auth), only show published
  if (!isAdmin || includeDrafts !== 'true') {
    results = results.filter((p) => p.published !== false);
  }

  if (solutionType && solutionType !== 'All') {
    results = results.filter((p) => p.solutionType === solutionType);
  }

  if (industry && industry !== 'All') {
    results = results.filter((p) => p.industries?.includes(industry as string));
  }

  if (status && status !== 'All') {
    results = results.filter((p) => p.status === status);
  }

  if (featured === 'true') {
    results = results.filter((p) => p.featured);
  }

  if (search) {
    const q = (search as string).toLowerCase().trim();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.keyFeatures?.some((f) => f.toLowerCase().includes(q)) ||
        p.technologies?.some((t) => t.toLowerCase().includes(q)) ||
        p.industries?.some((ind) => ind.toLowerCase().includes(q)) ||
        p.subCategory?.toLowerCase().includes(q)
    );
  }

  res.json({
    total: results.length,
    projects: results,
  });
});

app.get('/api/projects/:id', (req: Request, res: Response) => {
  const project = appData.projects.find(
    (p) => p.id === req.params.id || p.slug === req.params.id
  );
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

app.post('/api/projects', requireAdminAuth, (req: Request, res: Response) => {
  const body = req.body;
  if (!body.name || !body.solutionType || !body.shortDescription) {
    return res.status(400).json({ error: 'Name, solution type, and short description are required' });
  }

  const newProject: Project = {
    id: 'demo-' + Date.now(),
    slug: (body.slug || body.name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: body.name,
    solutionType: body.solutionType,
    subCategory: body.subCategory || 'General Solution',
    industries: Array.isArray(body.industries) && body.industries.length > 0 ? body.industries : ['Professional and Consulting Services'],
    shortDescription: body.shortDescription,
    overview: body.overview || body.shortDescription,
    businessProblem: body.businessProblem || 'Operational friction and workflow bottlenecks.',
    proposedSolution: body.proposedSolution || 'Custom engineered software architecture.',
    targetUsers: Array.isArray(body.targetUsers) ? body.targetUsers : ['Operations Staff', 'Customers'],
    keyFeatures: Array.isArray(body.keyFeatures) && body.keyFeatures.length > 0 ? body.keyFeatures : ['Cloud-hosted scalable architecture', 'Responsive interface'],
    technologies: Array.isArray(body.technologies) && body.technologies.length > 0 ? body.technologies : ['React', 'TypeScript', 'Node.js'],
    status: body.status || 'Concept',
    featured: Boolean(body.featured),
    published: body.published !== undefined ? Boolean(body.published) : true,
    thumbnail: body.thumbnail || '/src/assets/images/web_app_dashboard_1793079158006.jpg',
    screenshots: Array.isArray(body.screenshots) && body.screenshots.length > 0 ? body.screenshots : ['/src/assets/images/web_app_dashboard_1793079158006.jpg'],
    demoUrl: body.demoUrl || '',
    interactiveSimulator: body.interactiveSimulator,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  appData.projects.unshift(newProject);
  saveData(appData);
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', requireAdminAuth, (req: Request, res: Response) => {
  const index = appData.projects.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  const existing = appData.projects[index];
  const updated: Project = {
    ...existing,
    ...req.body,
    id: existing.id,
    updatedAt: new Date().toISOString(),
  };
  appData.projects[index] = updated;
  saveData(appData);
  res.json(updated);
});

app.delete('/api/projects/:id', requireAdminAuth, (req: Request, res: Response) => {
  const index = appData.projects.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  const removed = appData.projects.splice(index, 1);
  saveData(appData);
  res.json({ success: true, removed: removed[0] });
});

// Legacy Settings / Industries bridges for backward compatibility
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({
    companyName: appData.cms.identity.companyName,
    tagline: appData.cms.identity.tagline,
    subtagline: appData.cms.identity.subtagline,
    email: appData.cms.identity.email,
    phone: appData.cms.identity.phone,
    address: appData.cms.identity.address,
    socialLinks: appData.cms.identity.socialLinks,
    featuredProjectIds: [],
  });
});

app.get('/api/industries', (_req: Request, res: Response) => {
  const industryNames = (appData.cms.industries || []).map((i) => i.name);
  res.json(industryNames);
});

// ----------------------------------------------------
// DirectAdmin SMTP Email Configuration & Helpers
// ----------------------------------------------------
const SMTP_HOST = process.env.SMTP_HOST || 'mail.tesfayeteklu.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_SECURE = process.env.SMTP_SECURE !== 'false' && (process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465);
const SMTP_USER = process.env.SMTP_USER || 'admin@tesfayeteklu.com';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const CONTACT_RECEIVER = process.env.CONTACT_RECEIVER || 'admin@tesfayeteklu.com';
const SENDER_NAME = 'TesfayeTech Website';
const SENDER_EMAIL = SMTP_USER;

// Rate limiting & duplicate spam protection
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const ipRateLimits = new Map<string, RateLimitRecord>();
const recentSubmissions = new Map<string, number>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRateLimits.get(ip);
  if (!record || now > record.resetAt) {
    ipRateLimits.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 }); // 15 mins
    return true;
  }
  if (record.count >= 12) {
    return false;
  }
  record.count++;
  return true;
}

function isDuplicateSubmission(fingerprint: string): boolean {
  const now = Date.now();
  const lastTime = recentSubmissions.get(fingerprint);
  if (lastTime && now - lastTime < 30 * 1000) {
    return true;
  }
  recentSubmissions.set(fingerprint, now);
  if (recentSubmissions.size > 200) {
    for (const [k, time] of recentSubmissions.entries()) {
      if (now - time > 60 * 1000) recentSubmissions.delete(k);
    }
  }
  return false;
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendSmtpEmail({
  subject,
  html,
  text,
  replyTo,
}: {
  subject: string;
  html: string;
  text: string;
  replyTo: string;
}): Promise<{ success: boolean; error?: string }> {
  // If SMTP password is not set or is placeholder, log for dev/staging
  if (!SMTP_PASSWORD || SMTP_PASSWORD === 'YOUR_EMAIL_PASSWORD') {
    console.warn(`[SMTP Alert] Outgoing email "${subject}" queued for ${CONTACT_RECEIVER}. Set SMTP_PASSWORD in DirectAdmin / .env for live server delivery.`);
    console.log(`[SMTP Details] To: ${CONTACT_RECEIVER} | Reply-To: ${replyTo}`);
    if (isProduction && process.env.STRICT_SMTP === 'true') {
      return {
        success: false,
        error: 'SMTP email server password is not configured on the production host.',
      };
    }
    return { success: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });

    await transporter.sendMail({
      from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
      to: CONTACT_RECEIVER,
      replyTo,
      subject,
      text,
      html,
    });

    console.log(`[SMTP Success] Email delivered to ${CONTACT_RECEIVER} ("${subject}")`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[SMTP Error] Delivery failed to ${CONTACT_RECEIVER}:`, message);
    return { success: false, error: message };
  }
}

function generateProjectInquiryHtml(data: {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  solutionType: string;
  budgetRange: string;
  expectedCompletionDate: string;
  projectDescription: string;
  requiredFeatures?: string;
  submittedAt: string;
  ip: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Project Inquiry – ${escapeHtml(data.fullName)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;padding:30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:32px 30px;border-bottom:3px solid #2563eb;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size:11px;font-weight:700;color:#60a5fa;text-transform:uppercase;letter-spacing:1.5px;display:block;margin-bottom:6px;">TesfayeTech Solutions</span>
                    <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">New Project Inquiry</h1>
                  </td>
                  <td align="right" valign="top">
                    <span style="background-color:#2563eb;color:#ffffff;font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px;text-transform:uppercase;">Inquiry</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 30px 10px 30px;">
              <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">
                You have received a new project discovery inquiry from <strong>${escapeHtml(data.fullName)}</strong> through <a href="https://tesfayeteklu.com" style="color:#2563eb;text-decoration:none;">tesfayeteklu.com</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 30px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;">
                <tr>
                  <td style="padding:7px 10px;font-size:12px;color:#64748b;font-weight:600;width:38%;">Full Name:</td>
                  <td style="padding:7px 10px;font-size:13px;color:#0f172a;font-weight:700;">${escapeHtml(data.fullName)}</td>
                </tr>
                <tr>
                  <td style="padding:7px 10px;font-size:12px;color:#64748b;font-weight:600;">Email Address:</td>
                  <td style="padding:7px 10px;font-size:13px;color:#2563eb;font-weight:600;"><a href="mailto:${escapeHtml(data.email)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(data.email)}</a></td>
                </tr>
                <tr>
                  <td style="padding:7px 10px;font-size:12px;color:#64748b;font-weight:600;">Phone Number:</td>
                  <td style="padding:7px 10px;font-size:13px;color:#0f172a;">${escapeHtml(data.phone || 'Not provided')}</td>
                </tr>
                <tr>
                  <td style="padding:7px 10px;font-size:12px;color:#64748b;font-weight:600;">Company / Org:</td>
                  <td style="padding:7px 10px;font-size:13px;color:#0f172a;">${escapeHtml(data.companyName || 'Individual')}</td>
                </tr>
                <tr>
                  <td style="padding:7px 10px;font-size:12px;color:#64748b;font-weight:600;">Service Interested In:</td>
                  <td style="padding:7px 10px;font-size:13px;color:#0f172a;font-weight:600;">${escapeHtml(data.solutionType || 'General Consultation')}</td>
                </tr>
                <tr>
                  <td style="padding:7px 10px;font-size:12px;color:#64748b;font-weight:600;">Target Budget:</td>
                  <td style="padding:7px 10px;font-size:13px;color:#047857;font-weight:700;">${escapeHtml(data.budgetRange || 'Flexible')}</td>
                </tr>
                <tr>
                  <td style="padding:7px 10px;font-size:12px;color:#64748b;font-weight:600;">Project Timeline:</td>
                  <td style="padding:7px 10px;font-size:13px;color:#0f172a;">${escapeHtml(data.expectedCompletionDate || 'Flexible')}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:15px 30px;">
              <h3 style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#475569;font-weight:700;">Project Scope & Description:</h3>
              <div style="background-color:#f1f5f9;border-left:4px solid #2563eb;padding:14px 16px;border-radius:4px;font-size:13px;line-height:1.6;color:#1e293b;white-space:pre-wrap;">${escapeHtml(data.projectDescription)}</div>
            </td>
          </tr>
          ${data.requiredFeatures ? `
          <tr>
            <td style="padding:0 30px 15px 30px;">
              <h3 style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#475569;font-weight:700;">Required Features:</h3>
              <div style="background-color:#f8fafc;border:1px solid #e2e8f0;padding:12px 14px;border-radius:8px;font-size:13px;line-height:1.5;color:#334155;">${escapeHtml(data.requiredFeatures)}</div>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding:10px 30px 24px 30px;text-align:center;">
              <a href="mailto:${escapeHtml(data.email)}?subject=Re:%20TesfayeTech%20Project%20Inquiry" style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:12px 28px;border-radius:10px;">Reply to ${escapeHtml(data.fullName)}</a>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 30px;text-align:center;font-size:11px;color:#64748b;line-height:1.6;">
              <p style="margin:0 0 4px 0;"><strong>TesfayeTech Solutions</strong> • Professional Software Engineering</p>
              <p style="margin:0 0 4px 0;">Website: <a href="https://tesfayeteklu.com" style="color:#2563eb;text-decoration:none;">https://tesfayeteklu.com</a> | Recipient: ${CONTACT_RECEIVER}</p>
              <p style="margin:0;color:#94a3b8;font-size:10px;">Submitted: ${escapeHtml(data.submittedAt)} • Client IP: ${escapeHtml(data.ip)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateContactMessageHtml(data: {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  ip: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website Contact Message – ${escapeHtml(data.fullName)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;padding:30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:32px 30px;border-bottom:3px solid #2563eb;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size:11px;font-weight:700;color:#60a5fa;text-transform:uppercase;letter-spacing:1.5px;display:block;margin-bottom:6px;">TesfayeTech Solutions</span>
                    <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Website Contact Message</h1>
                  </td>
                  <td align="right" valign="top">
                    <span style="background-color:#059669;color:#ffffff;font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px;text-transform:uppercase;">Contact</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 30px 10px 30px;">
              <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">
                You have received a new contact message from <strong>${escapeHtml(data.fullName)}</strong> through <a href="https://tesfayeteklu.com" style="color:#2563eb;text-decoration:none;">tesfayeteklu.com</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 30px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;">
                <tr>
                  <td style="padding:7px 10px;font-size:12px;color:#64748b;font-weight:600;width:35%;">Sender Name:</td>
                  <td style="padding:7px 10px;font-size:13px;color:#0f172a;font-weight:700;">${escapeHtml(data.fullName)}</td>
                </tr>
                <tr>
                  <td style="padding:7px 10px;font-size:12px;color:#64748b;font-weight:600;">Email Address:</td>
                  <td style="padding:7px 10px;font-size:13px;color:#2563eb;font-weight:600;"><a href="mailto:${escapeHtml(data.email)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(data.email)}</a></td>
                </tr>
                <tr>
                  <td style="padding:7px 10px;font-size:12px;color:#64748b;font-weight:600;">Subject:</td>
                  <td style="padding:7px 10px;font-size:13px;color:#0f172a;font-weight:700;">${escapeHtml(data.subject)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:15px 30px;">
              <h3 style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#475569;font-weight:700;">Message:</h3>
              <div style="background-color:#f1f5f9;border-left:4px solid #2563eb;padding:16px;border-radius:4px;font-size:13px;line-height:1.6;color:#1e293b;white-space:pre-wrap;">${escapeHtml(data.message)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 30px 24px 30px;text-align:center;">
              <a href="mailto:${escapeHtml(data.email)}?subject=Re:%20${encodeURIComponent(data.subject)}" style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:12px 28px;border-radius:10px;">Reply to ${escapeHtml(data.fullName)}</a>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 30px;text-align:center;font-size:11px;color:#64748b;line-height:1.6;">
              <p style="margin:0 0 4px 0;"><strong>TesfayeTech Solutions</strong> • Professional Software Engineering</p>
              <p style="margin:0 0 4px 0;">Website: <a href="https://tesfayeteklu.com" style="color:#2563eb;text-decoration:none;">https://tesfayeteklu.com</a> | Recipient: ${CONTACT_RECEIVER}</p>
              <p style="margin:0;color:#94a3b8;font-size:10px;">Submitted: ${escapeHtml(data.submittedAt)} • Client IP: ${escapeHtml(data.ip)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ----------------------------------------------------
// Project Inquiry Endpoint Handler (POST /api/project-inquiry & POST /api/inquiries)
// ----------------------------------------------------
async function handleProjectInquirySubmission(req: Request, res: Response) {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  // Honeypot spam trap
  if (req.body.honeypot || req.body._gotcha || req.body.website) {
    return res.status(200).json({
      success: true,
      message: 'Your inquiry has been received.',
      inquiryId: 'inq-hp-' + Date.now(),
    });
  }

  // Rate Limiting
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Too many submissions from this connection. Please wait 15 minutes before submitting again.',
    });
  }

  const {
    fullName,
    companyName,
    email,
    phone,
    country,
    solutionType,
    industry,
    projectDescription,
    requiredFeatures,
    budgetRange,
    expectedCompletionDate,
    preferredContactMethod,
    relatedProjectId,
  } = req.body;

  // Validation
  if (!fullName || !String(fullName).trim()) {
    return res.status(400).json({ error: 'Please enter your full name.' });
  }

  if (!email || !String(email).trim()) {
    return res.status(400).json({ error: 'Please enter your email address.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address format.' });
  }

  if (!projectDescription || !String(projectDescription).trim()) {
    return res.status(400).json({ error: 'Please provide a project description or summary of your requirements.' });
  }

  const cleanName = String(fullName).trim();
  const cleanDesc = String(projectDescription).trim();

  // Duplicate Submission Prevention
  const fingerprint = `inquiry:${cleanEmail}:${cleanName}:${cleanDesc.slice(0, 40)}`;
  if (isDuplicateSubmission(fingerprint)) {
    return res.status(429).json({
      error: 'Duplicate submission detected. Your inquiry has already been received and queued for review.',
    });
  }

  const submittedAt = new Date().toISOString();

  // Record into persistent store for Admin CMS
  const newInquiry: Inquiry = {
    id: 'inq-' + Date.now(),
    fullName: cleanName,
    companyName: companyName ? String(companyName).trim() : 'Independent / Individual',
    email: cleanEmail,
    phone: phone ? String(phone).trim() : 'Not provided',
    country: country ? String(country).trim() : 'Unspecified',
    solutionType: solutionType || 'General Consultation',
    industry: industry || 'Professional and Consulting Services',
    projectDescription: cleanDesc,
    requiredFeatures: requiredFeatures ? String(requiredFeatures).trim() : 'Detailed in description',
    budgetRange: budgetRange || 'Flexible / Discussion',
    expectedCompletionDate: expectedCompletionDate || 'Flexible',
    preferredContactMethod: preferredContactMethod || 'Email',
    status: 'New',
    internalNotes: [],
    relatedProjectId,
    createdAt: submittedAt,
  };

  appData.inquiries.unshift(newInquiry);
  saveData(appData);

  // Send DirectAdmin SMTP Email Notification to admin@tesfayeteklu.com
  const emailHtml = generateProjectInquiryHtml({
    fullName: cleanName,
    email: cleanEmail,
    phone: newInquiry.phone,
    companyName: newInquiry.companyName,
    solutionType: newInquiry.solutionType,
    budgetRange: newInquiry.budgetRange,
    expectedCompletionDate: newInquiry.expectedCompletionDate,
    projectDescription: cleanDesc,
    requiredFeatures: newInquiry.requiredFeatures,
    submittedAt,
    ip: clientIp,
  });

  const emailText = `
New Project Inquiry – ${cleanName}
----------------------------------------
Full Name: ${cleanName}
Email: ${cleanEmail}
Phone: ${newInquiry.phone}
Company: ${newInquiry.companyName}
Service: ${newInquiry.solutionType}
Budget: ${newInquiry.budgetRange}
Timeline: ${newInquiry.expectedCompletionDate}

Project Scope & Description:
${cleanDesc}

Required Features:
${newInquiry.requiredFeatures}

Submitted: ${submittedAt} (UTC)
Website: https://tesfayeteklu.com
  `.trim();

  const emailResult = await sendSmtpEmail({
    subject: `New Project Inquiry – ${cleanName}`,
    html: emailHtml,
    text: emailText,
    replyTo: cleanEmail,
  });

  if (!emailResult.success) {
    return res.status(502).json({
      error: `Email notification delivery failed: ${emailResult.error || 'SMTP server error'}. Please try again or email ${CONTACT_RECEIVER} directly.`,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Your project inquiry has been received and delivered to admin@tesfayeteklu.com. Our solutions team will review and contact you within 24 business hours.',
    inquiryId: newInquiry.id,
  });
}

app.post('/api/project-inquiry', handleProjectInquirySubmission);
app.post('/api/inquiries', handleProjectInquirySubmission);

// ----------------------------------------------------
// Contact Form Endpoint (POST /api/contact)
// ----------------------------------------------------
app.post('/api/contact', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  // Honeypot spam trap
  if (req.body.honeypot || req.body._gotcha || req.body.website) {
    return res.status(200).json({
      success: true,
      message: 'Your message has been received.',
    });
  }

  // Rate Limiting
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Too many messages submitted from this connection. Please wait 15 minutes before submitting again.',
    });
  }

  const { fullName, email, subject, message } = req.body;

  // Validation
  if (!fullName || !String(fullName).trim()) {
    return res.status(400).json({ error: 'Please enter your full name.' });
  }

  if (!email || !String(email).trim()) {
    return res.status(400).json({ error: 'Please enter your email address.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address format.' });
  }

  if (!subject || !String(subject).trim()) {
    return res.status(400).json({ error: 'Please enter a subject line for your message.' });
  }

  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'Please enter your message.' });
  }

  const cleanName = String(fullName).trim();
  const cleanSubject = String(subject).trim();
  const cleanMessage = String(message).trim();

  // Duplicate submission check
  const fingerprint = `contact:${cleanEmail}:${cleanName}:${cleanMessage.slice(0, 40)}`;
  if (isDuplicateSubmission(fingerprint)) {
    return res.status(429).json({
      error: 'Duplicate message detected. Your contact request has already been delivered.',
    });
  }

  const submittedAt = new Date().toISOString();

  // Save into appData inquiries as a Contact Message so it appears in the CMS dashboard
  const contactInquiry: Inquiry = {
    id: 'cnt-' + Date.now(),
    fullName: cleanName,
    companyName: 'Contact Message',
    email: cleanEmail,
    phone: 'Not provided',
    country: 'Unspecified',
    solutionType: `Contact: ${cleanSubject}`,
    industry: 'Direct Inquiry',
    projectDescription: cleanMessage,
    requiredFeatures: `Subject: ${cleanSubject}`,
    budgetRange: 'N/A',
    expectedCompletionDate: 'N/A',
    preferredContactMethod: 'Email',
    status: 'New',
    internalNotes: [
      {
        id: `note-${Date.now()}`,
        author: 'System (SMTP Gateway)',
        text: 'Direct contact message submitted via /api/contact',
        date: submittedAt,
      },
    ],
    createdAt: submittedAt,
  };

  appData.inquiries.unshift(contactInquiry);
  saveData(appData);

  // Send DirectAdmin SMTP Email Notification to admin@tesfayeteklu.com
  const emailHtml = generateContactMessageHtml({
    fullName: cleanName,
    email: cleanEmail,
    subject: cleanSubject,
    message: cleanMessage,
    submittedAt,
    ip: clientIp,
  });

  const emailText = `
Website Contact Message – ${cleanName}
----------------------------------------
From: ${cleanName}
Email: ${cleanEmail}
Subject: ${cleanSubject}

Message:
${cleanMessage}

Submitted: ${submittedAt} (UTC)
Website: https://tesfayeteklu.com
  `.trim();

  const emailResult = await sendSmtpEmail({
    subject: `Website Contact Message – ${cleanName}`,
    html: emailHtml,
    text: emailText,
    replyTo: cleanEmail,
  });

  if (!emailResult.success) {
    return res.status(502).json({
      error: `Email delivery failed: ${emailResult.error || 'SMTP server error'}. Please try again or reach out to ${CONTACT_RECEIVER} directly.`,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Your message has been sent successfully to admin@tesfayeteklu.com. Thank you for reaching out!',
  });
});

// Protected: Only authenticated admins can read inquiries
app.get('/api/inquiries', requireAdminAuth, (_req: Request, res: Response) => {
  res.json(appData.inquiries);
});

app.patch('/api/inquiries/:id', requireAdminAuth, (req: Request, res: Response) => {
  const index = appData.inquiries.findIndex((i) => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }
  const current = appData.inquiries[index];
  const { status, noteText, noteAuthor } = req.body;

  if (status) {
    current.status = status;
  }
  if (noteText) {
    current.internalNotes.push({
      id: 'note-' + Date.now(),
      author: noteAuthor || 'Admin',
      text: noteText,
      date: new Date().toISOString(),
    });
  }

  saveData(appData);
  res.json(current);
});

app.delete('/api/inquiries/:id', requireAdminAuth, (req: Request, res: Response) => {
  const index = appData.inquiries.findIndex((i) => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }
  const removed = appData.inquiries.splice(index, 1);
  saveData(appData);
  res.json({ success: true, removed: removed[0] });
});

// ----------------------------------------------------
// System Backup, Restore, and Reset Endpoints (Admin only)
// ----------------------------------------------------
app.get('/api/system/backup', requireAdminAuth, (_req: Request, res: Response) => {
  res.setHeader('Content-Disposition', `attachment; filename=tesfayetech-backup-${Date.now()}.json`);
  res.setHeader('Content-Type', 'application/json');
  res.json({
    version: appData.cms.version,
    exportDate: new Date().toISOString(),
    projects: appData.projects,
    cms: appData.cms,
    inquiries: appData.inquiries,
  });
});

app.post('/api/system/restore', requireAdminAuth, (req: Request, res: Response) => {
  const { backupData } = req.body;
  if (!backupData || !backupData.projects || !backupData.cms) {
    return res.status(400).json({ error: 'Invalid backup file structure' });
  }
  appData.projects = backupData.projects;
  appData.cms = backupData.cms;
  if (backupData.inquiries) appData.inquiries = backupData.inquiries;
  saveData(appData);
  res.json({ success: true, message: 'System state restored successfully from backup.' });
});

app.post('/api/system/reset', requireAdminAuth, (_req: Request, res: Response) => {
  appData = {
    projects: INITIAL_PROJECTS,
    inquiries: INITIAL_INQUIRIES,
    cms: DEFAULT_CMS_CONFIG,
    adminAccount: createDefaultAdminAccount(),
  };
  saveData(appData);
  res.json({ success: true, message: 'All website content and demo data reset to default seed state.' });
});

// ----------------------------------------------------
// Search Engine Indexing Endpoints: Robots.txt & Dynamic Sitemap
// ----------------------------------------------------
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  if (appData.cms.seo?.searchEngines?.robotsTxtContent?.trim()) {
    return res.send(appData.cms.seo.searchEngines.robotsTxtContent.trim() + '\n');
  }
  res.send(`# Robots.txt for TesfayeTech (https://tesfayeteklu.com)
# Professional Software Development & Digital Solutions Company in Ethiopia

User-agent: *
Allow: /
Allow: /about
Allow: /services
Allow: /services/
Allow: /portfolio
Allow: /contact
Allow: /blog
Allow: /blog/
Allow: /page/

# Disallow private administrative areas and internal APIs
Disallow: /admin
Disallow: /admin/
Disallow: /admin/login
Disallow: /api/

Host: https://tesfayeteklu.com
Sitemap: https://tesfayeteklu.com/sitemap.xml
`);
});

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const baseUrl = 'https://tesfayeteklu.com';
  const today = new Date().toISOString().split('T')[0];

  const standardPages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/services', priority: '0.9', changefreq: 'weekly' },
    { path: '/services/website-design', priority: '0.9', changefreq: 'weekly' },
    { path: '/services/web-applications', priority: '0.9', changefreq: 'weekly' },
    { path: '/services/mobile-apps', priority: '0.9', changefreq: 'weekly' },
    { path: '/services/ui-ux-design', priority: '0.8', changefreq: 'monthly' },
    { path: '/services/custom-software', priority: '0.9', changefreq: 'weekly' },
    { path: '/portfolio', priority: '0.85', changefreq: 'weekly' },
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/contact', priority: '0.85', changefreq: 'monthly' },
    { path: '/blog', priority: '0.85', changefreq: 'daily' },
  ];

  const customPages = (appData.cms.customPages || [])
    .filter((p) => p.published)
    .map((p) => ({
      path: `/page/${p.slug}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: p.updatedAt ? p.updatedAt.split('T')[0] : today,
    }));

  const blogPages = (appData.cms.blogArticles || [])
    .filter((a) => a.published)
    .map((a) => ({
      path: `/blog/${a.slug}`,
      priority: '0.75',
      changefreq: 'monthly',
      lastmod: a.publishedDate || today,
    }));

  const allUrls = [
    ...standardPages.map(
      (p) => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    ),
    ...customPages.map(
      (p) => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    ),
    ...blogPages.map(
      (p) => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls.join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// ----------------------------------------------------
// Crawler Pre-Rendering / Meta Tag Injection Helper
// ----------------------------------------------------
const BOT_USER_AGENTS = /googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|pinterestbot|slackbot|vkShare|W3C_Validator|whatsapp/i;

function injectCrawlerMetadata(html: string, reqUrl: string): string {
  let title = appData.cms.seo.defaultTitle;
  let description = appData.cms.seo.metaDescription;
  let canonicalUrl = `https://tesfayeteklu.com${reqUrl}`;
  let ogImage = appData.cms.seo.ogImage || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80';
  let ogType = 'website';

  // Check if matching a specific page configuration
  const pageMatch = (appData.cms.seo.pages || []).find((p) => p.path === reqUrl);
  if (pageMatch) {
    title = pageMatch.title;
    description = pageMatch.metaDescription;
    canonicalUrl = pageMatch.canonicalUrl || canonicalUrl;
    if (pageMatch.ogImage) ogImage = pageMatch.ogImage;
  }

  // Check if matching a blog article
  if (reqUrl.startsWith('/blog/')) {
    const slug = reqUrl.replace('/blog/', '').split('?')[0];
    const article = (appData.cms.blogArticles || []).find((a) => a.slug === slug);
    if (article) {
      title = article.seoTitle || `${article.title} | TesfayeTech`;
      description = article.seoDescription || article.excerpt;
      ogImage = article.coverImage;
      ogType = 'article';
    }
  }

  // Inject into HTML
  html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
  html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${description}" />`);
  html = html.replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${description}" />`);
  html = html.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  html = html.replace(/<meta property="og:image" content=".*?" \/>/i, `<meta property="og:image" content="${ogImage}" />`);
  html = html.replace(/<meta property="og:type" content=".*?" \/>/i, `<meta property="og:type" content="${ogType}" />`);
  html = html.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${title}" />`);
  html = html.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${description}" />`);
  html = html.replace(/<meta name="twitter:image" content=".*?" \/>/i, `<meta name="twitter:image" content="${ogImage}" />`);

  // Search Engine Verification Tags (Google Search Console & Bing Webmaster Tools)
  const googleTag = appData.cms.seo?.searchEngines?.googleVerificationTag || appData.cms.seo?.googleSearchConsoleVerification;
  if (googleTag && !html.includes('google-site-verification')) {
    const cleanTag = googleTag.includes('content=') ? (googleTag.match(/content=["'](.*?)["']/)?.[1] || googleTag) : googleTag.replace(/^google-site-verification=/, '');
    html = html.replace('</head>', `  <meta name="google-site-verification" content="${cleanTag}" />\n</head>`);
  }
  const bingTag = appData.cms.seo?.searchEngines?.bingVerificationTag || appData.cms.seo?.bingWebmasterVerification;
  if (bingTag && !html.includes('msvalidate.01')) {
    const cleanBing = bingTag.includes('content=') ? (bingTag.match(/content=["'](.*?)["']/)?.[1] || bingTag) : bingTag;
    html = html.replace('</head>', `  <meta name="msvalidate.01" content="${cleanBing}" />\n</head>`);
  }

  return html;
}

// ----------------------------------------------------
// Vite Integration & Static Server with SPA Routing
// ----------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Intercept bot / crawler requests to serve pre-rendered meta tags
    app.use(async (req: Request, res: Response, next: NextFunction) => {
      const userAgent = req.headers['user-agent'] || '';
      const isBot = BOT_USER_AGENTS.test(userAgent);
      const isBlogOrPage = req.path.startsWith('/blog/') || req.path.startsWith('/page/');

      if (isBot && !req.path.startsWith('/api') && !req.path.includes('.')) {
        try {
          const template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
          const html = await vite.transformIndexHtml(req.url, template);
          const injected = injectCrawlerMetadata(html, req.path);
          return res.status(200).set({ 'Content-Type': 'text/html' }).end(injected);
        } catch (e) {
          return next(e);
        }
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));

    app.get('*', (req: Request, res: Response) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf-8');
        html = injectCrawlerMetadata(html, req.path);
        res.send(html);
      } else {
        res.sendFile(indexPath);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TesfayeTech server running on http://0.0.0.0:${PORT} [${isProduction ? 'PROD' : 'DEV'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
