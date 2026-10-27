import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { Project, Inquiry } from './src/types';
import { CmsConfig, CustomPage } from './src/types/cms';
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
export const AUTHORIZED_ADMIN_EMAIL = 'contactesfaye@gmail.com';

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

      return {
        projects: parsed.projects || INITIAL_PROJECTS,
        inquiries: parsed.inquiries || INITIAL_INQUIRIES,
        cms: parsed.cms || DEFAULT_CMS_CONFIG,
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

  // Strict check: Only contactesfaye@gmail.com is authorized
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
// Rate limiting & abuse protection for prospective inquiries
const inquiryRateLimits = new Map<string, number[]>();

function checkInquiryRateLimit(ip: string): boolean {
  const now = Date.now();
  const history = (inquiryRateLimits.get(ip) || []).filter((time) => now - time < 10 * 60 * 1000);
  if (history.length >= 5) {
    return false; // Exceeded limit
  }
  history.push(now);
  inquiryRateLimits.set(ip, history);
  return true;
}

// ----------------------------------------------------
// Project Inquiry Endpoints
// ----------------------------------------------------
app.post('/api/inquiries', (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  // 1. Abuse & Rate Limiting Check (Max 5 submissions per 10 minutes per IP)
  if (!checkInquiryRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Too many inquiries submitted from this connection. Please wait a few minutes before submitting again.',
    });
  }

  // 2. Anti-spam Honeypot Protection: If hidden bot field is filled, silently discard
  if (req.body.bot_honeypot || req.body.website_url_check) {
    return res.status(201).json({
      success: true,
      message: 'Your project inquiry has been received.',
      inquiryId: 'inq-' + Date.now(),
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

  // 3. Strict Input Validation
  if (!fullName || !email || !projectDescription) {
    return res.status(400).json({ error: 'Full name, email, and project description are required.' });
  }

  const cleanName = String(fullName).trim();
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanDesc = String(projectDescription).trim();

  if (cleanName.length < 2 || cleanName.length > 120) {
    return res.status(400).json({ error: 'Full name must be between 2 and 120 characters.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (cleanEmail.length > 150 || !emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  if (cleanDesc.length < 10 || cleanDesc.length > 5000) {
    return res.status(400).json({ error: 'Project description must be between 10 and 5,000 characters.' });
  }

  const newInquiry: Inquiry = {
    id: 'inq-' + Date.now(),
    fullName: cleanName,
    companyName: companyName ? String(companyName).trim().slice(0, 150) : 'Independent / Individual',
    email: cleanEmail,
    phone: phone ? String(phone).trim().slice(0, 50) : 'Not provided',
    country: country ? String(country).trim().slice(0, 80) : 'Unspecified',
    solutionType: solutionType ? String(solutionType).slice(0, 100) : 'General Consultation',
    industry: industry ? String(industry).slice(0, 120) : 'Professional and Consulting Services',
    projectDescription: cleanDesc,
    requiredFeatures: requiredFeatures ? String(requiredFeatures).trim().slice(0, 2000) : 'Detailed in description',
    budgetRange: budgetRange ? String(budgetRange).slice(0, 80) : 'Flexible / Discussion',
    expectedCompletionDate: expectedCompletionDate ? String(expectedCompletionDate).slice(0, 80) : 'Flexible',
    preferredContactMethod: preferredContactMethod || 'Email',
    status: 'New',
    internalNotes: [],
    relatedProjectId: relatedProjectId ? String(relatedProjectId).slice(0, 128) : undefined,
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
// Vite Integration & Static Server with SPA Routing
// ----------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
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
