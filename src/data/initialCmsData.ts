import { CmsConfig } from '../types/cms';
import { INDUSTRIES_LIST } from './seedData';
import { DEFAULT_SEO_PAGES, DEFAULT_BLOG_ARTICLES } from './seoAndBlogData';

export const DEFAULT_CMS_CONFIG: CmsConfig = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  
  identity: {
    companyName: 'TesfayeTech',
    tagline: 'We Design and Build Digital Solutions for Your Business.',
    subtagline: 'Engineering high-performance websites, custom web applications, mobile platforms, and enterprise automation software designed to scale organizations.',
    logoText: 'TesfayeTech',
    logoUrl: '',
    faviconUrl: '',
    email: 'info@tesfayeteklu.com',
    phone: '+251-932083373',
    whatsapp: '+251-932083373',
    address: '',
    businessLocation: '',
    socialLinks: {
      linkedin: 'https://linkedin.com/company/tesfayetech',
      github: 'https://github.com/tesfayetech',
      twitter: 'https://twitter.com/tesfayetech',
      youtube: 'https://youtube.com/@tesfayetech'
    },
    announcementBar: {
      enabled: false,
      text: 'Now accepting enterprise Q1 software engineering contracts and custom ERP discovery audits.',
      linkUrl: '#inquiry',
      linkText: 'Inquire Now'
    },
    footer: {
      summary: 'Engineering high-performance websites, custom web applications, mobile platforms, and enterprise automation software designed to scale organizations.',
      copyrightText: '© 2026 TesfayeTech Solutions. All rights reserved. Professional software engineering and digital transformation.',
      showTrustBadges: false
    }
  },

  navigation: {
    items: [
      { id: 'nav-home', label: 'Home', tab: 'home', visible: true, order: 1 },
      { id: 'nav-services', label: 'Services', tab: 'services', visible: true, order: 2 },
      { id: 'nav-about', label: 'About Us', tab: 'about', visible: true, order: 3 },
      { id: 'nav-blog', label: 'Blog', tab: 'blog', visible: true, order: 4 },
      { id: 'nav-contact', label: 'Contact', tab: 'contact', visible: true, order: 5 }
    ],
    ctaButtonText: 'Request a Project',
    ctaDestination: 'inquiry'
  },

  theme: {
    primaryColor: '#2563eb', // Blue 600
    secondaryColor: '#0f172a', // Slate 900
    accentColor: '#10b981', // Emerald 500
    mode: 'light',
    fontFamily: 'plus_jakarta',
    buttonStyle: 'rounded-xl'
  },

  home: {
    sectionVisibility: {
      hero: true,
      metrics: true,
      categories: false,
      featuredDemos: true,
      process: true,
      whyUs: true,
      testimonials: true,
      clients: false,
      faq: true,
      contactCta: true
    },
    hero: {
      headline: 'We Design and Build Digital Solutions for Your Business.',
      subtitle: 'TesfayeTech engineers production-grade website design, native and cross-platform mobile apps, enterprise web applications, and intelligent business automation systems that accelerate growth.',
      badgeText: 'Custom Software & Digital Product Studio',
      primaryCtaText: 'Explore Our Demos',
      primaryCtaTab: 'webapps',
      secondaryCtaText: 'Start Your Project',
      secondaryCtaTab: 'inquiry',
      imageUrl: '/assets/aistudio/TesfayeTech_Digital_Solutions_Banner_3a47ef3c.png',
      imageCaption: ''
    },
    metrics: [
      { id: 'm-1', value: '18+', label: 'Industry Sectors Engineered', subtext: 'Proven custom domain models' },
      { id: 'm-2', value: '3-5x', label: 'Accelerated Time-to-Market', subtext: 'Modular enterprise architecture' },
      { id: 'm-3', value: '99.9%', label: 'Uptime SLA & Cloud Reliability', subtext: 'High-availability infrastructure' },
      { id: 'm-4', value: '100%', label: 'Source Code & IP Ownership', subtext: 'Zero platform lock-in' }
    ],
    categoriesSection: {
      kicker: 'Core Expertise',
      title: 'Specialized Software Solutions',
      description: 'Choose from our three foundational delivery disciplines or combine them into a unified omnichannel digital platform.'
    },
    featuredDemosSection: {
      kicker: 'Demo Marketplace',
      title: 'Featured Solution Prototypes',
      description: 'Interact directly with sample enterprise systems, test live interfaces, and see how our architectures solve real business bottlenecks.',
      maxDisplay: 6
    },
    processSection: {
      kicker: 'Proven Methodology',
      title: 'From Concept to Turnkey Production',
      description: 'We employ a disciplined 6-stage engineering lifecycle that ensures transparency, predictable delivery, and zero unexpected downtime.',
      steps: [
        { id: 'ps-1', num: '01', title: 'Discover', desc: 'Deep-dive feasibility workshops to analyze user workflows, business logic, system boundaries, and return on investment.' },
        { id: 'ps-2', num: '02', title: 'Design', desc: 'High-fidelity wireframes, interactive design systems, and responsive component libraries tailored for your target audience.' },
        { id: 'ps-3', num: '03', title: 'Develop', desc: 'Modern full-stack TypeScript engineering with modular microservices, clean API contracts, and robust database architecture.' },
        { id: 'ps-4', num: '04', title: 'Test', desc: 'Automated integration suites, cross-device QA, load testing, security audits, and WCAG AA accessibility verification.' },
        { id: 'ps-5', num: '05', title: 'Deploy', desc: 'Automated CI/CD pipelines, containerized cloud infrastructure, SSL certificate provisioning, and zero-downtime rollouts.' },
        { id: 'ps-6', num: '06', title: 'Support', desc: 'Proactive SLA maintenance, security patch management, performance monitoring, and iterative feature enhancements.' }
      ]
    },
    whyUsSection: {
      kicker: 'The TesfayeTech Standard',
      title: 'Why Forward-Thinking Businesses Partner With Us',
      description: 'We don\'t build generic cookie-cutter websites or unmaintainable prototypes. We architect scalable, secure software that becomes an enterprise asset for your business.',
      points: [
        { id: 'wp-1', num: '01', title: 'Direct Domain Experience', desc: 'Pre-built frameworks for banking, logistics, hospitality, clinic management, and retail point of sale.' },
        { id: 'wp-2', num: '02', title: 'Modern Code Quality & Security', desc: 'Strict TypeScript type safety, automated tests, role-based access control, and GDPR/data privacy standards.' },
        { id: 'wp-3', num: '03', title: 'Complete IP & Code Ownership', desc: 'No proprietary platform lock-in. You receive 100% full rights to your git repository, database schemas, and assets.' }
      ]
    },
    testimonialsSection: {
      kicker: 'Illustrative Case Studies',
      title: 'Simulated Client Impact Outcomes',
      description: 'Sample illustrative benchmarks based on standardized deployment metrics.',
      items: [
        {
          id: 'test-1',
          quote: 'Transitioning our 4 polyclinic branches to the unified mobile appointment and SMS queue system eliminated morning crowding and slashed patient no-shows in the first 90 days.',
          author: 'Dr. S. Bekele',
          role: 'Polyclinic Medical Director',
          company: 'MediConnect Health Polyclinics',
          metric: '-45% Patient Wait Time',
          isSample: true,
          published: true
        },
        {
          id: 'test-2',
          quote: 'Offline transaction queueing allowed our retail cashiers to ring up customers seamlessly during network dropouts without losing a single transaction or inventory sync record.',
          author: 'Dawit Mengistu',
          role: 'VP of Retail Operations',
          company: 'Apex Mart Chain',
          metric: '+38% Faster Lane Checkout',
          isSample: true,
          published: true
        }
      ]
    },
    faqSection: {
      kicker: 'Common Questions',
      title: 'Frequently Asked Questions',
      description: 'Everything you need to know about our engineering approach, delivery model, and contracts.',
      faqs: [
        {
          id: 'faq-1',
          q: 'How quickly will TesfayeTech respond to my project inquiry?',
          a: 'A dedicated solutions architect reviews your requirements and responds with preliminary feedback and architectural assessment within 24 business hours.',
          published: true
        },
        {
          id: 'faq-2',
          q: 'Who owns the intellectual property and code upon project completion?',
          a: 'You own 100% of all intellectual property, source code repositories, databases, design assets, and deployment keys upon final milestone payment. No hidden licensing fees.',
          published: true
        },
        {
          id: 'faq-3',
          q: 'Can we test an interactive prototype before committing to full production?',
          a: 'Yes. We frequently develop rapid click-through prototypes or interactive sandbox environments so stakeholders can validate user workflows early.',
          published: true
        },
        {
          id: 'faq-4',
          q: 'Do you provide ongoing support and SLA maintenance after deployment?',
          a: 'Yes. Every project includes a 30-day warranty against bugs, followed by optional monthly SLA maintenance plans covering security patches, backups, and feature iterations.',
          published: true
        }
      ]
    },
    contactBanner: {
      kicker: 'Start Your Engineering Journey',
      headline: 'Have a Specific Project in Mind? Let\'s Architect It Together.',
      description: 'Submit your requirements to receive a complimentary feasibility analysis, technology stack recommendation, and estimated development timeline within 24 hours.',
      primaryButtonText: 'Request Project Consultation',
      secondaryButtonText: 'Speak With an Architect'
    }
  },

  services: [
    {
      id: 'srv-1',
      title: 'Website Design and Development',
      slug: 'website-design',
      iconName: 'Globe',
      shortDescription: 'High-speed corporate portals, consulting websites, e-commerce stores, and responsive web experiences built for high conversion.',
      fullDescription: 'Custom, responsive websites built with modern front-end frameworks, high-speed architectures, and structured SEO for high business conversion.',
      benefits: [
        'Sub-second page load performance and Google Core Web Vitals optimization',
        'Intuitive CMS integration for non-technical team updates',
        'Accessible WCAG AA standards ensuring compliance and universal access'
      ],
      deliverables: [
        'Production website code repository',
        'Custom interactive component library',
        'SEO schema metadata and sitemap setup',
        'CMS administrative training guide'
      ],
      quoteCtaText: 'Request a Quote for Website Design',
      order: 1,
      published: true
    },
    {
      id: 'srv-2',
      title: 'Responsive UI/UX Design',
      slug: 'ui-ux-design',
      iconName: 'Layout',
      shortDescription: 'Human-centered user interface architecture and user experience research focused on minimizing friction and driving user conversion.',
      fullDescription: 'Human-centered user interface architecture and user experience research focused on minimizing user friction, reducing drop-offs, and driving task completion.',
      benefits: [
        'Interactive Figma prototypes tested with target user personas',
        'Comprehensive design tokens, typography scales, and color systems',
        'Cross-platform responsive layouts across mobile, tablet, and ultra-wide screens'
      ],
      deliverables: [
        'Figma high-fidelity interactive prototype',
        'Component design system & token specifications',
        'User journey flowcharts and wireframe wireframes',
        'Production asset export package'
      ],
      quoteCtaText: 'Request a Quote for UI/UX Design',
      order: 2,
      published: true
    },
    {
      id: 'srv-3',
      title: 'Android and iOS Application Development',
      slug: 'mobile-development',
      iconName: 'Smartphone',
      shortDescription: 'Native iOS and Android mobile apps featuring biometrics, real-time push messaging, background sync, and offline resilience.',
      fullDescription: 'Native and high-performance cross-platform mobile apps for iOS and Android featuring biometrics, real-time push messaging, and offline storage.',
      benefits: [
        'Frictionless performance with 60fps smooth animations',
        'Reliable offline data caching with background sync',
        'Seamless integration with native camera, GPS, and device biometrics'
      ],
      deliverables: [
        'iOS (App Store) and Android (Google Play) release builds',
        'Full mobile application source code',
        'Push notification server integration',
        'Store submission and approval management'
      ],
      quoteCtaText: 'Request a Quote for Mobile Apps',
      order: 3,
      published: true
    },
    {
      id: 'srv-4',
      title: 'Custom Web Application Development',
      slug: 'custom-web-apps',
      iconName: 'Code2',
      shortDescription: 'Enterprise full-stack web applications with complex workflows, role-based security, stateful sessions, and high data concurrency.',
      fullDescription: 'Full-stack enterprise web applications with complex business logic, role-based security, stateful user sessions, and real-time data flows.',
      benefits: [
        'Tailored exactly to your operational logic rather than rigid SaaS templates',
        'Zero per-seat licensing fees for internal employees',
        'High-concurrency data throughput and instant UI responsiveness'
      ],
      deliverables: [
        'Full-stack TypeScript codebase',
        'Automated unit and integration test suites',
        'REST / GraphQL API specifications',
        'Comprehensive technical architecture documentation'
      ],
      quoteCtaText: 'Request a Quote for Web Apps',
      order: 4,
      published: true
    },
    {
      id: 'srv-5',
      title: 'Business Management Software & Automation',
      slug: 'business-automation',
      iconName: 'Cpu',
      shortDescription: 'Custom ERP, HRMS, CRM, Point of Sale, and inventory systems engineered to automate clerical tasks and eliminate departmental silos.',
      fullDescription: 'Custom ERP, HRMS, CRM, Point of Sale, and inventory systems engineered to automate manual clerical tasks, calculate payroll, and eliminate data silos.',
      benefits: [
        'Save up to 30 hours per week in redundant manual spreadsheet entry',
        'Unified single source of truth across departments and branches',
        'Real-time executive KPI dashboards with actionable metrics'
      ],
      deliverables: [
        'Centralized business operations dashboard',
        'Automated reporting and PDF generator modules',
        'Multi-tiered role-based access management',
        'Legacy data import and schema migration scripts'
      ],
      quoteCtaText: 'Request a Quote for Business Software',
      order: 5,
      published: true
    },
    {
      id: 'srv-6',
      title: 'API and Third-Party Integrations',
      slug: 'api-integrations',
      iconName: 'Share2',
      shortDescription: 'Secure integration with payment gateways (Stripe, Telebirr, CBE Birr), ERPs, CRM systems, SMS gateways, and cloud webhooks.',
      fullDescription: 'Seamless integration with payment gateways, ERPs, CRM systems, SMS gateways, and cloud webhooks.',
      benefits: [
        'Secure token-based authentication and rate-limiting safeguards',
        'Resilient webhook listeners with automated retry mechanisms',
        'Two-way real-time data synchronization between external platforms'
      ],
      deliverables: [
        'Production webhook processing microservices',
        'Payment gateway checkout workflows',
        'Third-party ERP/CRM sync connectors',
        'API error logging and monitor alerting'
      ],
      quoteCtaText: 'Request a Quote for API Integrations',
      order: 6,
      published: true
    },
    {
      id: 'srv-7',
      title: 'Database Design and Implementation',
      slug: 'database-design',
      iconName: 'Database',
      shortDescription: 'Normalized relational schemas and document stores designed for ACID compliance, fast indexing, and zero data corruption.',
      fullDescription: 'Normalized relational schemas (PostgreSQL, MySQL) and scalable document stores (MongoDB, Firestore) designed for ACID compliance, speed, and integrity.',
      benefits: [
        'Optimal indexing strategies preventing query bottlenecks as data scales',
        'Rock-solid referential integrity and transaction rollbacks',
        'Automated snapshot backups and point-in-time disaster recovery'
      ],
      deliverables: [
        'Entity Relationship Diagrams (ERD) & schema migrations',
        'Automated database backup scripts',
        'Query optimization and indexing plan',
        'Data sanitization and privacy masking protocols'
      ],
      quoteCtaText: 'Request a Quote for Database Design',
      order: 7,
      published: true
    },
    {
      id: 'srv-9',
      title: 'Maintenance, Security, and Technical Support',
      slug: 'maintenance-support',
      iconName: 'ShieldCheck',
      shortDescription: 'Continuous system health monitoring, vulnerability patching, automated backups, and guaranteed SLA response times.',
      fullDescription: 'Ongoing software maintenance, proactive security patches, uptime monitoring, and priority technical assistance under guaranteed SLAs.',
      benefits: [
        'Guaranteed response times with dedicated engineering lead',
        'Proactive vulnerability scanning and dependency patching',
        'Monthly performance optimization and feature iteration support'
      ],
      deliverables: [
        'Monthly uptime and health reports',
        'Scheduled security and dependency updates',
        'Priority bug remediation ticket access',
        'Quarterly architecture review and roadmap planning'
      ],
      quoteCtaText: 'Request a Quote for Maintenance and Support',
      order: 8,
      published: true
    }
  ],

  industries: INDUSTRIES_LIST.map((name, idx) => ({
    id: `ind-${idx + 1}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    description: `Tailored digital architecture, automated operational workflows, and specialized transaction logic for ${name}.`,
    iconName: 'Building2',
    published: true,
    order: idx + 1
  })),

  customPages: [
    {
      id: 'page-privacy',
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: `## Privacy Policy for TesfayeTech

At TesfayeTech, we recognize that privacy is critical when developing bespoke software systems and processing confidential enterprise data.

### 1. Data Collection & Usage
We only collect project specifications, contact information, and business requirements voluntarily submitted through our inquiry forms or during architecture discovery meetings.

### 2. Client Confidentiality & Non-Disclosure
All proprietary workflows, source code, data schemas, and client business logic are treated under strict Non-Disclosure Agreements (NDAs). We never disclose, monetize, or repurpose proprietary client algorithms.

### 3. Source Code Ownership
Clients retain 100% intellectual property ownership of all custom software repositories, deployment configurations, and data stores created specifically for their engagement upon project completion.`,
      seoTitle: 'Privacy Policy | TesfayeTech Software Solutions',
      seoDescription: 'Review TesfayeTech client confidentiality, non-disclosure protocols, and intellectual property ownership policies.',
      published: true,
      showInFooter: true,
      updatedAt: '2026-10-20T00:00:00Z'
    },
    {
      id: 'page-terms',
      title: 'Terms of Service',
      slug: 'terms-of-service',
      content: `## Terms of Service & Software Development Engagement

### 1. Scope & Deliverables
All software engineering, UI/UX design, and deployment projects are governed by detailed Statements of Work (SOW) specifying milestones, acceptance criteria, and delivery timelines.

### 2. Warranty Period
Every delivered project includes a complimentary 30-day post-launch warranty covering defect remediation and configuration adjustments at zero additional fee.

### 3. Payment Milestones
Engagements follow structured milestone billing (e.g. Discovery & Design Approval, Core Development Complete, Final UAT & Production Cutover).`,
      seoTitle: 'Terms of Service | TesfayeTech',
      seoDescription: 'Read the terms governing software development contracts, milestone deliverables, and warranties at TesfayeTech.',
      published: true,
      showInFooter: true,
      updatedAt: '2026-10-20T00:00:00Z'
    }
  ],

  contactForm: {
    fields: {
      fullName: { label: 'Full Name', required: true },
      companyName: { label: 'Company / Organization', required: false },
      email: { label: 'Email Address', required: true },
      phone: { label: 'Phone / WhatsApp Number', required: false },
      country: { label: 'Country', required: false },
      solutionType: { label: 'Solution Category', required: true },
      industry: { label: 'Business Industry', required: true },
      projectDescription: { label: 'Project Description & Objectives', required: true },
      requiredFeatures: { label: 'Requested Features or Integrations', required: false },
      budgetRange: { label: 'Target Budget Range', required: false },
      expectedDate: { label: 'Target Completion Date', required: false }
    },
    solutionOptions: [
      'Website Design',
      'Mobile Application Development',
      'Web Application Development',
      'Business Automation Systems',
      'UI/UX Product Design'
    ],
    budgetOptions: [
      '10,000 ETB - 50,000 ETB',
      '50,000 ETB - 100,000 ETB',
      '100,000 ETB - 150,000 ETB'
    ],
    contactMethods: ['Email', 'Phone', 'WhatsApp', 'Video Call'],
    confirmationMessage: 'Your project inquiry has been received. Our solutions team will review and contact you within 24 business hours.',
    privacyConsentText: 'By submitting this inquiry, you agree to our privacy policy and consent to confidential correspondence from our engineering team.',
    notificationEmail: 'inquiries@tesfayetech.com'
  },

  seo: {
    defaultTitle: "TesfayeTech | Premier Software Development & Digital Solutions Company in Ethiopia",
    titleTemplate: "%s | TesfayeTech",
    metaDescription: "Top-tier software development company in Addis Ababa, Ethiopia. We engineer custom enterprise ERP software, high-converting websites, mobile apps, and cloud web applications.",
    keywords: "Web Development Company in Ethiopia, Custom Software Development Addis Ababa, Mobile App Development Ethiopia, Enterprise ERP Solutions Addis Ababa, UI/UX Design Agency Ethiopia, Software Company Addis Ababa, Bole Innovation District, Telebirr integration",
    ogImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    canonicalUrl: "https://tesfayeteklu.com",
    robots: "index, follow",
    googleSearchConsoleVerification: "google-site-verification=tesfayetech-search-console-verification-token",
    bingVerification: "msvalidate.01=tesfayetech-bing-verification-token",
    googleAnalyticsId: "G-TESFAYETECH",
    pages: DEFAULT_SEO_PAGES
  },
  blogArticles: DEFAULT_BLOG_ARTICLES,

  aboutUs: {
    title: 'Engineering High-Impact Digital Solutions for Growing Enterprises',
    subtitle: 'Full-stack software engineering and digital transformation consultancy based in Addis Ababa, Ethiopia.',
    badgeText: 'About TesfayeTech',
    mission: 'To eliminate operational friction and technical debt for East African and global enterprises through high-performance, maintainable software architecture.',
    vision: 'To be the preeminent software engineering partner across emerging markets, recognized globally for architectural integrity, flawless user experiences, and enduring business impact.',
    companyStory: 'Founded on the principle that modern software should be an enduring asset rather than a continuous liability, TesfayeTech pairs rigorous full-stack engineering with human-centered product design. Whether architecting real-time telemetry platforms or enterprise healthcare systems, we deliver performant, cloud-native solutions that empower organizations to scale with confidence.',
    corePillars: [
      {
        id: 'cp-1',
        title: 'Zero Vendor Lock-In',
        description: 'Clean code, open standards, and 100% repository and database ownership transferred to every client.',
        iconName: 'ShieldCheck'
      },
      {
        id: 'cp-2',
        title: 'Speed & Performance First',
        description: 'Sub-second page loads, 60fps mobile interfaces, and optimized database queries built for resilient low-bandwidth operation.',
        iconName: 'Zap'
      },
      {
        id: 'cp-3',
        title: 'Type-Safe Architecture',
        description: 'Strict TypeScript across frontend, backend, and database models preventing runtime defects before production deployment.',
        iconName: 'Code2'
      },
      {
        id: 'cp-4',
        title: 'Enterprise Security by Default',
        description: 'Role-based access controls, encrypted credential vaults, and zero-trust cloud data pipelines that protect proprietary business workflows.',
        iconName: 'Lock'
      }
    ],
    achievements: [
      { id: 'ach-1', metric: '18+', label: 'Enterprise Sectors Engineered' },
      { id: 'ach-2', metric: '99.9%', label: 'Uptime SLA & Cloud Reliability' },
      { id: 'ach-3', metric: '42M+ ETB', label: 'Telemetry & Transactions Handled' },
      { id: 'ach-4', metric: '100%', label: 'Source Code & IP Ownership' }
    ],
    technicalCapabilities: [
      { category: 'Front-End & Mobile', technologies: 'React 19, React Native, TypeScript, Tailwind CSS, Vite, Next.js' },
      { category: 'Back-End & APIs', technologies: 'Node.js, Express, Go, Python, RESTful Services, GraphQL, WebSockets' },
      { category: 'Databases & Storage', technologies: 'Cloud Firestore, PostgreSQL, Redis, Firebase Storage, MongoDB' },
      { category: 'Cloud & DevOps', technologies: 'Google Cloud Platform, Docker, Kubernetes, CI/CD Actions, Cloudflare' }
    ],
    updatedAt: new Date().toISOString()
  },

  clients: [
    {
      id: 'cli-1',
      name: 'Awash Intercity Logistics',
      logoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=240&q=80',
      websiteUrl: 'https://awashlogistics.example.com',
      industry: 'Transportation and Logistics',
      partnershipType: 'Client',
      featured: true,
      order: 1,
      published: true,
      createdAt: '2026-10-01T00:00:00Z'
    },
    {
      id: 'cli-2',
      name: 'Oasis Polyclinics Network',
      logoUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=240&q=80',
      websiteUrl: 'https://oasisclinics.example.com',
      industry: 'Healthcare and Pharmaceuticals',
      partnershipType: 'Client',
      featured: true,
      order: 2,
      published: true,
      createdAt: '2026-10-05T00:00:00Z'
    },
    {
      id: 'cli-3',
      name: 'Dashen Commercial Hub',
      logoUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=240&q=80',
      websiteUrl: 'https://dashenhub.example.com',
      industry: 'Retail and E-commerce',
      partnershipType: 'Client',
      featured: true,
      order: 3,
      published: true,
      createdAt: '2026-10-10T00:00:00Z'
    },
    {
      id: 'cli-4',
      name: 'Telebirr Integrations Hub',
      logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=240&q=80',
      websiteUrl: 'https://telebirr.et',
      industry: 'Financial Technology',
      partnershipType: 'Tech Partner',
      featured: true,
      order: 4,
      published: true,
      createdAt: '2026-10-12T00:00:00Z'
    },
    {
      id: 'cli-5',
      name: 'Addis Agro-Commodities Export',
      logoUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=240&q=80',
      websiteUrl: 'https://addisagro.example.com',
      industry: 'Agriculture and Agribusiness',
      partnershipType: 'Client',
      featured: true,
      order: 5,
      published: true,
      createdAt: '2026-10-15T00:00:00Z'
    },
    {
      id: 'cli-6',
      name: 'Serengeti Vista Hospitality',
      logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=240&q=80',
      websiteUrl: 'https://serengetivista.example.com',
      industry: 'Hospitality and Tourism',
      partnershipType: 'Client',
      featured: true,
      order: 6,
      published: true,
      createdAt: '2026-10-18T00:00:00Z'
    }
  ],

  teamMembers: [
    {
      id: 'tm-1',
      name: 'Tesfaye Teklu',
      role: 'Founder & Principal Software Architect',
      bio: 'Over 12 years of enterprise software architecture, full-stack systems engineering, and technology strategy across East Africa and international hubs.',
      photoUrl: '/assets/aistudio/tesimage-removebg-preview_af029598.png',
      department: 'Leadership',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/tesfayeteklu',
        github: 'https://github.com/tesfayeteklu',
        twitter: 'https://twitter.com/tesfayeteklu'
      },
      order: 1,
      published: true,
      createdAt: '2026-10-01T00:00:00Z'
    },
    {
      id: 'tm-2',
      name: 'Selamawit Bekele',
      role: 'Head of Engineering & Full-Stack Lead',
      bio: 'Specialist in high-throughput React systems, distributed Node.js backends, database query optimization, and resilient API gateways.',
      photoUrl: '',
      department: 'Engineering',
      socialLinks: {
        linkedin: 'https://linkedin.com/company/tesfayetech',
        github: 'https://github.com/tesfayetech'
      },
      order: 2,
      published: true,
      createdAt: '2026-10-05T00:00:00Z'
    },
    {
      id: 'tm-3',
      name: 'Dawit Haile',
      role: 'Lead UI/UX Product Designer',
      bio: 'Human-centered design leader crafting high-converting web applications, intuitive mobile experiences, and scalable design token systems.',
      photoUrl: '',
      department: 'Design',
      socialLinks: {
        linkedin: 'https://linkedin.com/company/tesfayetech'
      },
      order: 3,
      published: true,
      createdAt: '2026-10-10T00:00:00Z'
    },
    {
      id: 'tm-4',
      name: 'Almaz Kebede',
      role: 'DevOps & Cloud Systems Architect',
      bio: 'Cloud automation specialist managing container orchestration, automated CI/CD pipelines, Zero-Trust network security, and 99.9% uptime SLAs.',
      photoUrl: '',
      department: 'Engineering',
      socialLinks: {
        linkedin: 'https://linkedin.com/company/tesfayetech',
        github: 'https://github.com/tesfayetech'
      },
      order: 4,
      published: true,
      createdAt: '2026-10-15T00:00:00Z'
    }
  ],

  mediaLibrary: [
    {
      id: 'med-hero-banner',
      name: 'TesfayeTech Digital Solutions Hero Banner',
      fileName: 'TesfayeTech_Digital_Solutions_Banner_3a47ef3c.png',
      fileUrl: '/assets/aistudio/TesfayeTech_Digital_Solutions_Banner_3a47ef3c.png',
      fileType: 'image/png',
      fileSize: 1856031,
      folder: 'branding',
      uploadedAt: new Date().toISOString(),
      altText: 'TesfayeTech Digital Solutions Official Hero Banner'
    },
    {
      id: 'med-1',
      name: 'Hero Tech Agency Showcase',
      fileName: 'hero_tech_agency_1793079157707.jpg',
      fileUrl: '/src/assets/images/hero_tech_agency_1793079157707.jpg',
      fileType: 'image/jpeg',
      fileSize: 245000,
      folder: 'branding',
      uploadedAt: '2026-10-20T10:00:00Z',
      altText: 'TesfayeTech Software Architecture & Engineering'
    },
    {
      id: 'med-2',
      name: 'Website Design Showcase',
      fileName: 'website_design_showcase_1793079157923.jpg',
      fileUrl: '/src/assets/images/website_design_showcase_1793079157923.jpg',
      fileType: 'image/jpeg',
      fileSize: 310000,
      folder: 'projects',
      uploadedAt: '2026-10-20T10:05:00Z',
      altText: 'Corporate Website Design Showcase'
    },
    {
      id: 'med-3',
      name: 'Web App ERP Dashboard',
      fileName: 'web_app_dashboard_1793079158006.jpg',
      fileUrl: '/src/assets/images/web_app_dashboard_1793079158006.jpg',
      fileType: 'image/jpeg',
      fileSize: 285000,
      folder: 'projects',
      uploadedAt: '2026-10-20T10:10:00Z',
      altText: 'Enterprise Web Application and ERP Suite'
    },
    {
      id: 'med-4',
      name: 'Mobile App Mockup',
      fileName: 'mobile_app_mockup_1793079158082.jpg',
      fileUrl: '/src/assets/images/mobile_app_mockup_1793079158082.jpg',
      fileType: 'image/jpeg',
      fileSize: 260000,
      folder: 'projects',
      uploadedAt: '2026-10-20T10:15:00Z',
      altText: 'Cross-Platform Mobile Application Development'
    }
  ],

  revisions: [
    {
      id: 'rev-baseline',
      version: 1,
      timestamp: '2026-11-01T00:00:00Z',
      authorEmail: 'tesfayeteklufeyissa@gmail.com',
      summary: 'Initial System Deployment & Production CMS Baseline',
      snapshot: {
        version: 1,
        lastUpdated: '2026-11-01T00:00:00Z'
      }
    }
  ]
};
