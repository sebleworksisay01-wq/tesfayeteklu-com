import { Project, Inquiry, SolutionType, DemoStatus } from './index';

export interface GlobalSiteIdentity {
  companyName: string;
  tagline: string;
  subtagline: string;
  logoText: string;
  logoUrl?: string;
  faviconUrl?: string;
  email: string;
  phone: string;
  whatsapp: string;
  secondaryPhone?: string;
  emergencyPhone?: string;
  address: string;
  businessLocation: string;
  businessHours?: string;
  googleMapsUrl?: string;
  socialLinks: {
    linkedin: string;
    github: string;
    twitter: string;
    youtube?: string;
    facebook?: string;
    instagram?: string;
    telegram?: string;
  };
  announcementBar: {
    enabled: boolean;
    text: string;
    linkUrl?: string;
    linkText?: string;
  };
  footer: {
    summary: string;
    copyrightText: string;
    showTrustBadges: boolean;
  };
}

export interface NavigationMenuItem {
  id: string;
  label: string;
  tab: string;
  url?: string;
  isExternal?: boolean;
  visible: boolean;
  order: number;
  children?: {
    id: string;
    label: string;
    tab?: string;
    url?: string;
  }[];
}

export interface NavigationConfig {
  items: NavigationMenuItem[];
  ctaButtonText: string;
  ctaDestination: 'inquiry' | 'contact' | 'custom';
  customCtaUrl?: string;
}

export interface ThemeConfig {
  primaryColor: string; // Hex code, e.g. #2563eb
  secondaryColor: string; // Hex code, e.g. #0f172a
  accentColor: string; // Hex code, e.g. #10b981
  mode: 'light' | 'dark';
  fontFamily: 'plus_jakarta' | 'inter' | 'system';
  buttonStyle: 'rounded-lg' | 'rounded-xl' | 'rounded-md' | 'rounded-full';
}

export interface HomePageSectionVisibility {
  hero: boolean;
  metrics: boolean;
  categories: boolean;
  featuredDemos: boolean;
  process: boolean;
  whyUs: boolean;
  testimonials: boolean;
  clients: boolean;
  faq: boolean;
  contactCta: boolean;
}

export interface HomePageHeroConfig {
  headline: string;
  subtitle: string;
  badgeText: string;
  primaryCtaText: string;
  primaryCtaTab: string;
  secondaryCtaText: string;
  secondaryCtaTab: string;
  imageUrl: string;
  imageCaption: string;
  secondaryImages?: string[];
}

export interface MetricItem {
  id: string;
  value: string;
  label: string;
  subtext?: string;
  order?: number;
}

export interface ProcessStepItem {
  id: string;
  num: string;
  title: string;
  desc: string;
}

export interface WhyUsPointItem {
  id: string;
  num: string;
  title: string;
  desc: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl?: string;
  rating?: number; // 1 to 5
  metric: string;
  isSample?: boolean;
  featured?: boolean;
  order?: number;
  published: boolean;
  createdAt?: string;
}

export interface ClientPartnerItem {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  industry: string;
  partnershipType: 'Client' | 'Tech Partner' | 'Certified Vendor';
  featured: boolean;
  order: number;
  published: boolean;
  createdAt: string;
}

export interface TeamMemberItem {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  department: 'Leadership' | 'Engineering' | 'Design' | 'Product' | 'Operations';
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  order: number;
  published: boolean;
  createdAt: string;
}

export interface AboutValueItem {
  id: string;
  title: string;
  description: string;
  iconName?: string;
}

export interface AboutAchievementItem {
  id: string;
  metric: string;
  label: string;
}

export interface AboutUsConfig {
  title: string;
  subtitle: string;
  badgeText: string;
  mission: string;
  vision: string;
  companyStory: string;
  corePillars: AboutValueItem[];
  achievements: AboutAchievementItem[];
  bannerImage?: string;
  technicalCapabilities?: {
    category: string;
    technologies: string;
  }[];
  updatedAt?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number; // in bytes
  folder: 'projects' | 'branding' | 'team' | 'clients' | 'blog' | 'documents';
  uploadedAt: string;
  uploadedBy?: string;
  altText?: string;
  caption?: string;
  dimensions?: string;
  assignedSection?: string;
}

export interface ContentRevision {
  id: string;
  version: number;
  timestamp: string;
  authorEmail: string;
  summary: string;
  snapshot: Partial<CmsConfig>;
}

export interface FaqItem {
  id: string;
  q: string;
  a: string;
  order?: number;
  published: boolean;
}

export interface HomePageConfig {
  sectionVisibility: HomePageSectionVisibility;
  hero: HomePageHeroConfig;
  metrics: MetricItem[];
  categoriesSection: {
    kicker: string;
    title: string;
    description: string;
  };
  featuredDemosSection: {
    kicker: string;
    title: string;
    description: string;
    maxDisplay: number;
  };
  processSection: {
    kicker: string;
    title: string;
    description: string;
    steps: ProcessStepItem[];
  };
  whyUsSection: {
    kicker: string;
    title: string;
    description: string;
    points: WhyUsPointItem[];
  };
  testimonialsSection: {
    kicker: string;
    title: string;
    description: string;
    items: TestimonialItem[];
  };
  clientsSection?: {
    kicker: string;
    title: string;
    description: string;
  };
  faqSection: {
    kicker: string;
    title: string;
    description: string;
    faqs: FaqItem[];
  };
  contactBanner: {
    kicker: string;
    headline: string;
    description: string;
    primaryButtonText: string;
    secondaryButtonText: string;
  };
}

export interface ManagedService {
  id: string;
  title: string;
  slug: string;
  iconName: string;
  shortDescription: string;
  fullDescription: string;
  serviceImage?: string;
  serviceCategory?: string;
  features?: string[];
  benefits: string[];
  deliverables: string[];
  quoteCtaText: string;
  seoTitle?: string;
  seoDescription?: string;
  order: number;
  published: boolean;
}

export interface ManagedIndustry {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  bannerImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  published: boolean;
  order: number;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  showInFooter: boolean;
  updatedAt: string;
}

export interface ContactFormConfig {
  fields: {
    fullName: { label: string; required: boolean };
    companyName: { label: string; required: boolean };
    email: { label: string; required: boolean };
    phone: { label: string; required: boolean };
    country: { label: string; required: boolean };
    solutionType: { label: string; required: boolean };
    industry: { label: string; required: boolean };
    projectDescription: { label: string; required: boolean };
    requiredFeatures: { label: string; required: boolean };
    budgetRange: { label: string; required: boolean };
    expectedDate: { label: string; required: boolean };
  };
  solutionOptions: string[];
  budgetOptions: string[];
  contactMethods: string[];
  confirmationMessage: string;
  privacyConsentText: string;
  notificationEmail: string;
}

export interface SeoPageConfig {
  id: string;
  name: string;
  path: string;
  title: string;
  metaDescription: string;
  keywords: string;
  focusKeyword?: string;
  searchEngineTitle?: string;
  canonicalUrl: string;
  robots: 'index, follow' | 'noindex, nofollow';
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  imageAltText?: string;
  structuredDataType?: string;
  structuredDataJson?: string;
  status?: 'published' | 'draft';
  targetType?: 'page' | 'service' | 'portfolio' | 'blog';
}

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  authorRole: string;
  coverImage: string;
  publishedDate: string;
  readingTime: string;
  published: boolean;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export interface SearchEngineIntegrationSettings {
  googlePropertyUrl: string;
  googleVerificationTag: string;
  googleDnsInstructions: string;
  googleVerificationStatus: 'verified' | 'pending' | 'unverified';
  googleSitemapSubmissionUrl: string;
  bingVerificationTag: string;
  bingDnsInstructions: string;
  bingVerificationStatus: 'verified' | 'pending' | 'unverified';
  bingSitemapSubmissionUrl: string;
  customRobotsTxt?: string;
  robotsTxtContent?: string;
  lastSitemapPing?: string;
}

export interface SeoSettings {
  defaultTitle: string;
  titleTemplate: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  canonicalUrl: string;
  robots?: 'index, follow' | 'noindex, nofollow';
  googleSearchConsoleVerification?: string;
  bingVerification?: string;
  bingWebmasterVerification?: string;
  googleAnalyticsId?: string;
  pages?: SeoPageConfig[];
  searchEngines?: SearchEngineIntegrationSettings;
  lastUpdated?: string;
}

export interface AuditLogItem {
  id: string;
  action: 'CONTENT_UPDATE' | 'MEDIA_UPLOAD' | 'MEDIA_DELETE' | 'SEO_UPDATE' | 'PAGE_PUBLISH' | 'SETTINGS_CHANGE' | 'SECURITY_UPDATE' | 'BACKUP_RESTORE';
  entityType: string;
  entityId?: string;
  entityName?: string;
  details: string;
  authorEmail: string;
  timestamp: string;
}

export interface CmsConfig {
  identity: GlobalSiteIdentity;
  navigation: NavigationConfig;
  theme: ThemeConfig;
  home: HomePageConfig;
  aboutUs?: AboutUsConfig;
  services: ManagedService[];
  industries: ManagedIndustry[];
  customPages: CustomPage[];
  testimonials?: TestimonialItem[];
  clients?: ClientPartnerItem[];
  teamMembers?: TeamMemberItem[];
  mediaLibrary?: MediaItem[];
  revisions?: ContentRevision[];
  contactForm: ContactFormConfig;
  seo: SeoSettings;
  blogArticles?: BlogArticle[];
  auditLogs?: AuditLogItem[];
  version: number;
  lastUpdated: string;
}
