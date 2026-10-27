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
  address: string;
  businessLocation: string;
  socialLinks: {
    linkedin: string;
    github: string;
    twitter: string;
    youtube?: string;
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

export interface NavigationConfig {
  items: {
    id: string;
    label: string;
    tab: string;
    visible: boolean;
    order: number;
  }[];
  ctaButtonText: string;
  ctaDestination: 'inquiry' | 'contact' | 'custom';
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
}

export interface MetricItem {
  id: string;
  value: string;
  label: string;
  subtext?: string;
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
  metric: string;
  isSample: boolean;
  published: boolean;
}

export interface FaqItem {
  id: string;
  q: string;
  a: string;
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
  benefits: string[];
  deliverables: string[];
  quoteCtaText: string;
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

export interface SeoSettings {
  defaultTitle: string;
  titleTemplate: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  canonicalUrl: string;
}

export interface CmsConfig {
  identity: GlobalSiteIdentity;
  navigation: NavigationConfig;
  theme: ThemeConfig;
  home: HomePageConfig;
  services: ManagedService[];
  industries: ManagedIndustry[];
  customPages: CustomPage[];
  contactForm: ContactFormConfig;
  seo: SeoSettings;
  version: number;
  lastUpdated: string;
}
