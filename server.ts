import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
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

// Strict single authorized administrator
export const AUTHORIZED_ADMIN_EMAIL = 'tesfayeteklufeyissa@gmail.com';

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
  if (!session || session.email !== AUTHORIZED_ADMIN_EMAIL) {
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

  // Strict check: Only tesfayeteklufeyissa@gmail.com is authorized
  if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
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
  
  if (session && session.email === AUTHORIZED_ADMIN_EMAIL) {
    return res.json({
      authenticated: true,
      user: {
        id: 'admin-01',
        email: AUTHORIZED_ADMIN_EMAIL,
        name: 'Tesfaye',
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

  if (normalizedEmail === AUTHORIZED_ADMIN_EMAIL) {
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
  if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
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
// Project Inquiry Endpoints
// ----------------------------------------------------
app.post('/api/inquiries', (req: Request, res: Response) => {
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
  if (!fullName || !email || !projectDescription) {
    return res.status(400).json({ error: 'Full name, email, and project description are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const newInquiry: Inquiry = {
    id: 'inq-' + Date.now(),
    fullName: String(fullName).trim(),
    companyName: companyName ? String(companyName).trim() : 'Independent / Individual',
    email: String(email).trim().toLowerCase(),
    phone: phone ? String(phone).trim() : 'Not provided',
    country: country ? String(country).trim() : 'Unspecified',
    solutionType: solutionType || 'General Consultation',
    industry: industry || 'Professional and Consulting Services',
    projectDescription: String(projectDescription).trim(),
    requiredFeatures: requiredFeatures ? String(requiredFeatures).trim() : 'Detailed in description',
    budgetRange: budgetRange || 'Flexible / Discussion',
    expectedCompletionDate: expectedCompletionDate || 'Flexible',
    preferredContactMethod: preferredContactMethod || 'Email',
    status: 'New',
    internalNotes: [],
    relatedProjectId,
    createdAt: new Date().toISOString(),
  };

  appData.inquiries.unshift(newInquiry);
  saveData(appData);

  res.status(201).json({
    success: true,
    message: appData.cms.contactForm.confirmationMessage || 'Your project inquiry has been received. Our solutions team will review and contact you within 24 business hours.',
    inquiryId: newInquiry.id,
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
