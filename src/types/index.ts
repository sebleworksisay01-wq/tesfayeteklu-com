export type SolutionType = 
  | 'Website Design' 
  | 'Mobile Application Development' 
  | 'Web Application Development';

export type DemoStatus = 
  | 'Concept' 
  | 'Interactive Prototype' 
  | 'Live Demo' 
  | 'Production Project';

export interface Project {
  id: string;
  slug: string;
  name: string;
  solutionType: SolutionType;
  subCategory: string;
  industries: string[];
  shortDescription: string;
  overview: string;
  businessProblem: string;
  proposedSolution: string;
  targetUsers: string[] | string;
  keyFeatures: string[];
  technologies: string[];
  status: DemoStatus | string;
  featured: boolean;
  published: boolean;
  thumbnail: string;
  screenshots: string[];
  imageUrl?: string;
  imagePath?: string;
  gallery?: string[];
  title?: string;
  description?: string;
  category?: string;
  businessArea?: string | string[];
  sortOrder?: number;
  demoUrl?: string;
  interactiveSimulator?: 'clinic' | 'pos' | 'hrms' | 'hotel' | 'corporate' | 'ecommerce';
  client?: string;
  summary?: string;
  tags?: string[];
  features?: string[];
  industry?: string;
  completionDate?: string;
  problem?: string;
  solution?: string;
  sourceCodeUrl?: string;
  demoType?: string;
  createdAt: string;
  updatedAt: string;
}

export type InquiryStatus = 
  | 'New' 
  | 'Contacted' 
  | 'In Progress' 
  | 'Quoted' 
  | 'Won' 
  | 'Closed';

export interface Inquiry {
  id: string;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  solutionType: SolutionType | string;
  industry: string;
  projectDescription: string;
  requiredFeatures: string;
  budgetRange: string;
  expectedCompletionDate: string;
  preferredContactMethod: 'Email' | 'Phone' | 'WhatsApp' | 'Video Call';
  status: InquiryStatus;
  internalNotes: { id: string; author: string; text: string; date: string }[];
  relatedProjectId?: string;
  clientName?: string;
  company?: string;
  projectType?: string;
  description?: string;
  timeline?: string;
  notes?: string;
  createdAt: string;
}

export interface SiteSettings {
  companyName: string;
  tagline: string;
  subtagline: string;
  email: string;
  phone: string;
  address: string;
  socialLinks: {
    linkedin: string;
    github: string;
    twitter: string;
  };
  featuredProjectIds: string[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'project_manager' | 'solutions_architect';
}

export interface UserProfile {
  id?: string;
  uid: string;
  fullName: string;
  displayName?: string;
  name?: string;
  email: string;
  role: 'Administrator' | 'User' | 'admin' | 'editor' | 'user' | string;
  emailVerified: boolean;
  status?: string;
  accountStatus: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}
