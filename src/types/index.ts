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
  targetUsers: string[];
  keyFeatures: string[];
  technologies: string[];
  status: DemoStatus;
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
