import { Project, SiteSettings, Inquiry } from '../types';

export const INDUSTRIES_LIST: string[] = [
  'Banking and Financial Services',
  'Insurance and Reinsurance',
  'Healthcare and Pharmaceuticals',
  'Education and Training',
  'Retail and E-commerce',
  'Manufacturing and Distribution',
  'Hospitality, Hotels and Tourism',
  'Real Estate and Construction',
  'Transportation and Logistics',
  'Agriculture and Agribusiness',
  'NGOs and Development Organizations',
  'Government and Public Services',
  'Professional and Consulting Services',
  'Telecommunications and Technology',
  'Human Resources and Recruitment',
  'Media and Entertainment',
  'Restaurants and Food Services',
  'Legal and Business Services'
];

export const SOLUTION_TYPES: { type: string; description: string }[] = [
  {
    type: 'Website Design',
    description: 'Corporate portfolios, digital brand experiences, modern e-commerce stores, hospitality, educational, and institutional websites engineered for speed, conversions, and SEO.'
  },
  {
    type: 'Mobile Application Development',
    description: 'Native and cross-platform iOS & Android mobile apps featuring offline caching, instant biometrics, real-time push messaging, and smooth interactive micro-animations.'
  },
  {
    type: 'Web Application Development',
    description: 'Mission-critical enterprise software, ERP, HRMS, CRM, clinical and inventory management systems built with rock-solid security, data integrity, and automated workflows.'
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  companyName: 'TesfayeTech',
  tagline: 'We Design and Build Digital Solutions for Your Business.',
  subtagline: 'Engineering high-performance websites, custom web applications, mobile platforms, and enterprise automation software designed to scale organizations.',
  email: 'info@tesfayetech.com',
  phone: '+1 (800) 456-7890 / +251 911 234 567',
  address: 'Tesfaye Innovation Tower, Level 4, Tech Innovation Corridor',
  socialLinks: {
    linkedin: 'https://linkedin.com/company/tesfayetech',
    github: 'https://github.com/tesfayetech',
    twitter: 'https://twitter.com/tesfayetech'
  },
  featuredProjectIds: [
    'demo-1-corporate-website',
    'demo-2-online-shopping',
    'demo-8-clinic-appointment',
    'demo-5-hrms-suite'
  ]
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'demo-1-corporate-website',
    slug: 'nexus-holding-corporate-portal',
    name: 'Nexus Holdings Corporate Portal',
    solutionType: 'Website Design',
    subCategory: 'Corporate and company profile websites',
    industries: ['Professional and Consulting Services', 'Telecommunications and Technology', 'Banking and Financial Services'],
    shortDescription: 'Modern corporate architecture showcase with multi-branch directory, investor relations portal, and interactive service catalog.',
    overview: 'A premium digital presence built for an international investment and holding conglomerate. Engineered to project institutional credibility, streamline stakeholder communications, and deliver investor reports.',
    businessProblem: 'The client possessed disjointed sub-brand identities across 4 countries with poor mobile responsiveness and no unified investor communication mechanism.',
    proposedSolution: 'Developed an editorial, high-speed corporate web portal with localized subsidiary directories, interactive financial disclosures, and modular leadership showcases.',
    targetUsers: ['Corporate Institutional Investors', 'Board Members', 'Enterprise Clients', 'Media Relations'],
    keyFeatures: [
      'Interactive multi-entity directory & branch locator',
      'Secure quarterly investor financial reporting repository',
      'Sub-second page load speeds with accessible WCAG AA design',
      'Dynamic case study library with filtered business domains',
      'Integrated corporate press room and media distribution feed'
    ],
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'Vite', 'Headless CMS API', 'Cloudflare CDN'],
    status: 'Live Demo',
    featured: true,
    published: true,
    thumbnail: '/src/assets/images/website_design_showcase_1793079157923.jpg',
    screenshots: [
      '/src/assets/images/website_design_showcase_1793079157923.jpg',
      '/src/assets/images/hero_tech_agency_1793079157707.jpg'
    ],
    demoUrl: 'https://demo.tesfayetech.com/corporate-portal',
    interactiveSimulator: 'corporate',
    createdAt: '2026-03-10T09:00:00Z',
    updatedAt: '2026-10-15T14:30:00Z'
  },
  {
    id: 'demo-2-online-shopping',
    slug: 'lumina-retail-ecommerce-platform',
    name: 'Lumina Omnichannel E-commerce Platform',
    solutionType: 'Website Design',
    subCategory: 'E-commerce websites',
    industries: ['Retail and E-commerce'],
    shortDescription: 'High-conversion retail marketplace with frictionless instant checkout, real-time SKU inventory sync, and personalized recommendations.',
    overview: 'Built for high-volume retail merchants requiring real-time warehouse inventory synchronization, fast checkout flows, and automated shipping partner integrations.',
    businessProblem: 'Legacy checkout cart abandonment exceeded 72% due to sluggish page speeds, rigid payment options, and disconnected stock balances.',
    proposedSolution: 'Designed a headless microservices storefront with sub-100ms faceted filtering, guest 1-click checkout, and automated multi-currency pricing.',
    targetUsers: ['Online Retail Shoppers', 'Store Managers', 'Fulfillment Staff', 'Merchandising Team'],
    keyFeatures: [
      'Faceted instant category and attribute filters',
      'One-page streamlined guest & member checkout',
      'Real-time warehouse SKU inventory availability indicators',
      'Stripe & local mobile money payment gateway integrations',
      'Automated dispatch label and invoice generation'
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe API', 'Tailwind CSS'],
    status: 'Interactive Prototype',
    featured: true,
    published: true,
    thumbnail: '/src/assets/images/web_app_dashboard_1793079158006.jpg',
    screenshots: [
      '/src/assets/images/web_app_dashboard_1793079158006.jpg',
      '/src/assets/images/website_design_showcase_1793079157923.jpg'
    ],
    demoUrl: 'https://demo.tesfayetech.com/lumina-ecommerce',
    interactiveSimulator: 'ecommerce',
    createdAt: '2026-04-12T11:00:00Z',
    updatedAt: '2026-10-18T10:15:00Z'
  },
  {
    id: 'demo-3-hotel-booking',
    slug: 'serengeti-safari-hotel-booking',
    name: 'Serengeti Vista Hotel & Resort Booking System',
    solutionType: 'Website Design',
    subCategory: 'Hotel and tourism websites',
    industries: ['Hospitality, Hotels and Tourism'],
    shortDescription: 'Immersive lodge and resort booking website with interactive room visualizer, availability calendar, and curated safari itinerary builder.',
    overview: 'Engineered for luxury hospitality operators seeking to capture direct, commission-free guest reservations with rich visual storytelling and seasonal pricing engines.',
    businessProblem: 'Over-reliance on Online Travel Agencies (OTAs) charging 18-25% commissions, coupled with manual double-booking headaches across multiple reservation channels.',
    proposedSolution: 'Direct-to-guest booking engine with calendar date pickers, real-time room lockouts, localized activity add-ons, and multi-language support.',
    targetUsers: ['International Tourists', 'Corporate Retreat Coordinators', 'Front Desk Staff', 'Reservation Managers'],
    keyFeatures: [
      'Interactive visual room picker with 360° virtual tours',
      'Instant date range availability and seasonal rate engine',
      'Curated itinerary bundle add-on builder (Spa, Safari, Airport Transfer)',
      'Automated guest itinerary confirmation via Email and SMS',
      'iCal/Channel Manager synchronization with global OTAs'
    ],
    technologies: ['React 19', 'Tailwind CSS', 'Express', 'Vite', 'Google Maps API'],
    status: 'Interactive Prototype',
    featured: false,
    published: true,
    thumbnail: '/src/assets/images/website_design_showcase_1793079157923.jpg',
    screenshots: [
      '/src/assets/images/website_design_showcase_1793079157923.jpg'
    ],
    demoUrl: 'https://demo.tesfayetech.com/serengeti-resort',
    interactiveSimulator: 'hotel',
    createdAt: '2026-05-01T08:30:00Z',
    updatedAt: '2026-09-20T16:00:00Z'
  },
  {
    id: 'demo-4-school-management',
    slug: 'academiq-school-management-system',
    name: 'AcademiQ K-12 & University Portal',
    solutionType: 'Web Application Development',
    subCategory: 'School management systems',
    industries: ['Education and Training', 'Government and Public Services'],
    shortDescription: 'Comprehensive academic ERP handling student enrollment, automated grading rubrics, parent portals, and timetable scheduling.',
    overview: 'A full-stack campus management platform that bridges administrative staff, educators, students, and parents into one unified academic workflow.',
    businessProblem: 'Paper-based attendance, delayed grade report cards, and chaotic fee reconciliation across hundreds of active student accounts.',
    proposedSolution: 'Unified web portal featuring automated biometric attendance, automated transcript generation, fee balance alerts, and digital assignment submission.',
    targetUsers: ['Principals & Headmasters', 'Academic Teachers', 'Students', 'Guardians and Parents'],
    keyFeatures: [
      'Student information management & admissions tracking',
      'Automated gradebook and cumulative GPA calculation engine',
      'Parent portal with real-time attendance and fee statements',
      'Automated conflict-free timetable and exam scheduler',
      'Digital assignment submission and teacher feedback grading'
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Express', 'Tailwind CSS'],
    status: 'Live Demo',
    featured: false,
    published: true,
    thumbnail: '/src/assets/images/web_app_dashboard_1793079158006.jpg',
    screenshots: [
      '/src/assets/images/web_app_dashboard_1793079158006.jpg'
    ],
    demoUrl: 'https://demo.tesfayetech.com/academiq-school',
    createdAt: '2026-05-18T14:00:00Z',
    updatedAt: '2026-10-02T11:45:00Z'
  },
  {
    id: 'demo-5-hrms-suite',
    slug: 'pulse-hrms-enterprise-suite',
    name: 'PulseHR Enterprise Workforce Platform',
    solutionType: 'Web Application Development',
    subCategory: 'Human Resource Management Systems (HRMS)',
    industries: ['Human Resources and Recruitment', 'Professional and Consulting Services', 'Manufacturing and Distribution'],
    shortDescription: 'Complete human resource management suite with biometric attendance, automated multi-tax payroll calculation, and KPI appraisal reviews.',
    overview: 'Engineered for enterprises with 50 to 5,000+ employees to automate leave balances, tax compliance deductions, shifts, and internal talent mobility.',
    businessProblem: 'HR teams spending over 80 hours monthly calculating overtime, leave accruals, and manual tax tables across multi-tiered regional offices.',
    proposedSolution: 'Automated rules engine that processes payroll in under 3 minutes, tracks leave requests with hierarchical approvals, and generates bank disbursement files.',
    targetUsers: ['Chief People Officers', 'Payroll Accountants', 'Department Leads', 'Company Employees'],
    keyFeatures: [
      '1-click automated multi-bracket payroll & payslip distribution',
      'Interactive organizational chart and department hierarchy builder',
      'Employee self-service leave requests with multi-tier approval',
      'Biometric clock-in integration with shift roster management',
      'Performance 360-degree review and KPI goal tracking modules'
    ],
    technologies: ['React 19', 'TypeScript', 'Node.js', 'Tailwind CSS', 'REST API', 'PDF Generation'],
    status: 'Interactive Prototype',
    featured: true,
    published: true,
    thumbnail: '/src/assets/images/web_app_dashboard_1793079158006.jpg',
    screenshots: [
      '/src/assets/images/web_app_dashboard_1793079158006.jpg',
      '/src/assets/images/hero_tech_agency_1793079157707.jpg'
    ],
    demoUrl: 'https://demo.tesfayetech.com/pulse-hrms',
    interactiveSimulator: 'hrms',
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-10-20T08:30:00Z'
  },
  {
    id: 'demo-6-inventory-erp',
    slug: 'stockvault-inventory-management-system',
    name: 'StockVault Warehouse & Inventory Management System',
    solutionType: 'Web Application Development',
    subCategory: 'Inventory Management Systems',
    industries: ['Manufacturing and Distribution', 'Retail and E-commerce', 'Transportation and Logistics'],
    shortDescription: 'Multi-warehouse stock control system featuring barcode scanning, low-stock predictive replenishment, and automated vendor purchase orders.',
    overview: 'A mission-critical logistics and warehouse inventory application built to eliminate stock-outs, minimize holding overhead, and track bin locations.',
    businessProblem: 'Over $120,000 in annual dead stock and recurring order fulfillment errors due to manual spreadsheet tallying and delayed receiving docks.',
    proposedSolution: 'Real-time perpetual inventory system with handheld barcode scanning support, supplier lead-time modeling, and batch expiry tracking.',
    targetUsers: ['Warehouse Supervisors', 'Procurement Managers', 'Pick-and-Pack Operators', 'Supply Chain VPs'],
    keyFeatures: [
      'Multi-warehouse and aisle/shelf/bin location tracking',
      'Instant barcode scanning and label printing integration',
      'Predictive safety stock threshold notifications and reorder triggers',
      'Supplier purchase order lifecycle and automated receiving verification',
      'FIFO/LIFO stock valuation audit reports'
    ],
    technologies: ['React', 'TypeScript', 'Express', 'PostgreSQL', 'Web Barcode API'],
    status: 'Live Demo',
    featured: false,
    published: true,
    thumbnail: '/src/assets/images/web_app_dashboard_1793079158006.jpg',
    screenshots: [
      '/src/assets/images/web_app_dashboard_1793079158006.jpg'
    ],
    demoUrl: 'https://demo.tesfayetech.com/stockvault',
    createdAt: '2026-06-25T13:00:00Z',
    updatedAt: '2026-09-14T11:20:00Z'
  },
  {
    id: 'demo-7-insurance-portal',
    slug: 'insurashield-policy-claims-portal',
    name: 'InsuraShield Policy & Reinsurance Claims Portal',
    solutionType: 'Web Application Development',
    subCategory: 'Insurance and reinsurance management systems',
    industries: ['Insurance and Reinsurance', 'Banking and Financial Services', 'Legal and Business Services'],
    shortDescription: 'Enterprise underwriting and claims assessment system with digital policy issuance, fraud detection heuristics, and risk treaties.',
    overview: 'Built for insurance underwriters and brokers handling retail policies (auto, life, health) as well as commercial reinsurance treaty allocations.',
    businessProblem: 'Claims processing cycles averaged 21 business days, creating customer dissatisfaction and high vulnerability to undetected fraudulent filings.',
    proposedSolution: 'Modernized policy portal that reduces simple claim approvals to under 4 hours using algorithmic validation and straight-through processing.',
    targetUsers: ['Insurance Underwriters', 'Claims Adjusters', 'Policyholders', 'Reinsurance Brokers'],
    keyFeatures: [
      'Digital policy quoting and instant bind with electronic signatures',
      'Step-by-step FNOL (First Notice of Loss) claims filing wizard',
      'Automated fraud score heuristics and document tamper check',
      'Treaty quota share and excess-of-loss reinsurance ledger',
      'Automated reserve fund calculation and settlement dispatch'
    ],
    technologies: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL', 'Document Vault'],
    status: 'Production Project',
    featured: false,
    published: true,
    thumbnail: '/src/assets/images/web_app_dashboard_1793079158006.jpg',
    screenshots: [
      '/src/assets/images/web_app_dashboard_1793079158006.jpg'
    ],
    demoUrl: 'https://demo.tesfayetech.com/insurashield',
    createdAt: '2026-07-04T09:00:00Z',
    updatedAt: '2026-10-10T15:00:00Z'
  },
  {
    id: 'demo-8-clinic-appointment',
    slug: 'mediconnect-clinic-appointment-app',
    name: 'MediConnect Patient & Clinic Appointment App',
    solutionType: 'Mobile Application Development',
    subCategory: 'Healthcare and appointment apps',
    industries: ['Healthcare and Pharmaceuticals'],
    shortDescription: 'Patient mobile app for specialist doctor bookings, telemedicine consultations, prescription renewals, and digital lab results.',
    overview: 'A patient-first healthcare mobile application created to optimize clinic queue times, reduce no-shows by 45%, and secure patient health data.',
    businessProblem: 'Overcrowded clinic waiting rooms, 30% patient appointment no-show rate, and lost physical laboratory result paper slips.',
    proposedSolution: 'Native-feel mobile app providing instant specialist discovery, real-time consultation slot reservation, SMS/Push reminders, and lab result sync.',
    targetUsers: ['Patients and Families', 'Specialist Physicians', 'Clinic Receptionists', 'Lab Technicians'],
    keyFeatures: [
      'Specialist doctor directory filtered by symptoms and department',
      'Real-time doctor calendar booking with instant confirmation',
      'In-app encrypted tele-health video consult room',
      'Digital health vault for lab tests, blood panels, and prescriptions',
      'Automated SMS & push notifications for upcoming appointments'
    ],
    technologies: ['React Native / React Mobile', 'TypeScript', 'Tailwind', 'WebRTC', 'HIPAA-compliant Data Store'],
    status: 'Interactive Prototype',
    featured: true,
    published: true,
    thumbnail: '/src/assets/images/mobile_app_mockup_1793079158082.jpg',
    screenshots: [
      '/src/assets/images/mobile_app_mockup_1793079158082.jpg',
      '/src/assets/images/web_app_dashboard_1793079158006.jpg'
    ],
    demoUrl: 'https://demo.tesfayetech.com/mediconnect-app',
    interactiveSimulator: 'clinic',
    createdAt: '2026-07-19T10:15:00Z',
    updatedAt: '2026-10-22T17:40:00Z'
  },
  {
    id: 'demo-9-restaurant-ordering',
    slug: 'tastecraft-restaurant-ordering-app',
    name: 'TasteCraft Food Ordering & Table Delivery App',
    solutionType: 'Mobile Application Development',
    subCategory: 'Food ordering and delivery apps',
    industries: ['Restaurants and Food Services', 'Retail and E-commerce'],
    shortDescription: 'Custom culinary ordering app supporting contactless table QR ordering, curbside delivery tracking, and loyalty rewards.',
    overview: 'Created for restaurant chains and independent cafes seeking their own branded delivery channel without paying 30% marketplace middleman fees.',
    businessProblem: 'Heavy third-party aggregator commissions eroded food profit margins, while front-of-house staff struggled with order transcription mistakes.',
    proposedSolution: 'Direct branded mobile app allowing patrons to customize dishes, split bills, earn reward points, and track live kitchen prep status.',
    targetUsers: ['Dine-in and Takeout Guests', 'Head Chefs & Kitchen Staff', 'Delivery Drivers', 'Restaurant Owners'],
    keyFeatures: [
      'Interactive visual digital menu with dietary tags and modifiers',
      'Dine-in table QR ordering and split-check mobile payments',
      'Live kitchen preparation status tracker (Order Placed -> In Oven -> Ready)',
      'Automated driver dispatch and real-time GPS delivery map',
      'Gamified loyalty points and exclusive birthday perks program'
    ],
    technologies: ['React Mobile', 'TypeScript', 'Node.js', 'Socket.io', 'Google Maps API'],
    status: 'Interactive Prototype',
    featured: false,
    published: true,
    thumbnail: '/src/assets/images/mobile_app_mockup_1793079158082.jpg',
    screenshots: [
      '/src/assets/images/mobile_app_mockup_1793079158082.jpg'
    ],
    demoUrl: 'https://demo.tesfayetech.com/tastecraft',
    createdAt: '2026-08-05T12:00:00Z',
    updatedAt: '2026-09-28T09:10:00Z'
  },
  {
    id: 'demo-10-real-estate-portal',
    slug: 'habitat-real-estate-platform',
    name: 'Habitat Prime Real Estate & Property Portal',
    solutionType: 'Website Design',
    subCategory: 'Real estate websites',
    industries: ['Real Estate and Construction', 'Banking and Financial Services'],
    shortDescription: 'High-end property showcase with interactive masterplan maps, mortgage affordability calculator, and automated viewing scheduler.',
    overview: 'A luxury property brokerage and developer portal showcasing commercial towers, gated residential developments, and leasing portfolios.',
    businessProblem: 'Static property PDF brochures resulted in poor lead qualification and low conversion of overseas diaspora buyers.',
    proposedSolution: 'Dynamic property portal with filterable neighborhood amenities, embedded floor plans, mortgage simulators, and WhatsApp agent booking.',
    targetUsers: ['Property Buyers', 'Real Estate Brokers', 'Property Developers', 'Mortgage Officers'],
    keyFeatures: [
      'Interactive map search with school, transit, and shopping overlays',
      'High-resolution floorplan viewer and unit availability matrix',
      'Real-time mortgage amortization and down-payment calculator',
      'One-click agent viewing tour booking with calendar sync',
      'Investor ROI and projected rental yield forecasting charts'
    ],
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'Vite', 'MapLibre'],
    status: 'Live Demo',
    featured: false,
    published: true,
    thumbnail: '/src/assets/images/website_design_showcase_1793079157923.jpg',
    screenshots: [
      '/src/assets/images/website_design_showcase_1793079157923.jpg'
    ],
    demoUrl: 'https://demo.tesfayetech.com/habitat-realestate',
    createdAt: '2026-08-20T15:30:00Z',
    updatedAt: '2026-10-05T13:20:00Z'
  },
  {
    id: 'demo-11-logistics-dashboard',
    slug: 'fleetpulse-logistics-tracking-dashboard',
    name: 'FleetPulse Freight & Logistics Command Dashboard',
    solutionType: 'Web Application Development',
    subCategory: 'Transport and logistics apps',
    industries: ['Transportation and Logistics', 'Manufacturing and Distribution', 'Agriculture and Agribusiness'],
    shortDescription: 'Real-time telemetry and shipment dispatch dashboard tracking freight fleets, driver duty hours, fuel consumption, and cargo temperature.',
    overview: 'Designed for logistics carriers, cold-chain distributors, and 3PL providers managing cross-country truck fleets and freight consignments.',
    businessProblem: 'Delayed cargo tracking updates, high fuel pilferage, and lack of temperature auditing causing perishable food and medicine spoilage.',
    proposedSolution: 'Centralized telemetry dashboard with geofence breach alerts, cold-chain sensor graphs, automated dispatch routing, and digital bill of lading.',
    targetUsers: ['Fleet Dispatchers', 'Supply Chain Directors', 'Safety Officers', 'Consignee Clients'],
    keyFeatures: [
      'Live GPS fleet map with speed, route deviation, and idle alerts',
      'Cold-chain IoT temperature and humidity real-time sensor charts',
      'Automated digital Bill of Lading (eBOL) and electronic proof of delivery',
      'Driver Hours-of-Service (HOS) regulatory compliance monitoring',
      'Automated fuel consumption and maintenance reminder schedule'
    ],
    technologies: ['React 19', 'TypeScript', 'Express', 'WebSockets', 'Chart.js', 'Tailwind CSS'],
    status: 'Production Project',
    featured: false,
    published: true,
    thumbnail: '/src/assets/images/web_app_dashboard_1793079158006.jpg',
    screenshots: [
      '/src/assets/images/web_app_dashboard_1793079158006.jpg',
      '/src/assets/images/hero_tech_agency_1793079157707.jpg'
    ],
    demoUrl: 'https://demo.tesfayetech.com/fleetpulse',
    createdAt: '2026-09-02T08:00:00Z',
    updatedAt: '2026-10-14T10:00:00Z'
  },
  {
    id: 'demo-12-enterprise-crm',
    slug: 'relatify-enterprise-crm-system',
    name: 'Relatify B2B Customer Relationship Management System',
    solutionType: 'Web Application Development',
    subCategory: 'Customer Relationship Management (CRM)',
    industries: ['Professional and Consulting Services', 'Telecommunications and Technology', 'Banking and Financial Services'],
    shortDescription: 'End-to-end sales pipeline CRM with deal stage automation, communication timeline logging, contract generation, and revenue forecasting.',
    overview: 'A focused, high-speed CRM platform customized for B2B enterprises that want clear pipeline visibility without the bloat of legacy platforms.',
    businessProblem: 'Sales reps losing track of high-value prospects across messy inboxes, leading to slipped deals and inaccurate quarterly forecasts.',
    proposedSolution: 'Visual drag-and-drop deal board with email thread synchronization, automated follow-up reminders, and AI-assisted proposal drafting.',
    targetUsers: ['VP of Sales', 'Account Executives', 'Customer Success Managers', 'Revenue Operations'],
    keyFeatures: [
      'Visual Kanban deal pipeline with custom stages and win probabilities',
      'Complete contact timeline logging calls, emails, and meetings',
      'Automated quote and commercial proposal PDF generation',
      'Weighted revenue forecasting and team quota leaderboards',
      'Integration with Google Workspace, Microsoft 365, and Slack'
    ],
    technologies: ['React 19', 'TypeScript', 'Express', 'PostgreSQL', 'Tailwind CSS'],
    status: 'Live Demo',
    featured: false,
    published: true,
    thumbnail: '/src/assets/images/web_app_dashboard_1793079158006.jpg',
    screenshots: [
      '/src/assets/images/web_app_dashboard_1793079158006.jpg'
    ],
    demoUrl: 'https://demo.tesfayetech.com/relatify-crm',
    createdAt: '2026-09-15T11:30:00Z',
    updatedAt: '2026-10-24T16:15:00Z'
  },
  {
    id: 'demo-13-pos-retail',
    slug: 'apex-pos-retail-checkout',
    name: 'Apex Modern Point of Sale (POS) System',
    solutionType: 'Web Application Development',
    subCategory: 'Point of Sale (POS) systems',
    industries: ['Retail and E-commerce', 'Restaurants and Food Services'],
    shortDescription: 'High-speed touch-first POS register system with offline queueing, barcode scanning, split payments, and end-of-day register balancing.',
    overview: 'Engineered for high-throughput retail stores, boutiques, and multi-lane supermarkets needing instant checkout and offline resilience.',
    businessProblem: 'Slow checkout queues, network drops causing register freezes, and cash drawer discrepancies during shift handovers.',
    proposedSolution: 'Local-first touch register with 1-tap fast keys, offline transaction caching, multi-tender split payments, and automated thermal receipt printing.',
    targetUsers: ['Store Cashiers', 'Retail Managers', 'Store Owners', 'Inventory Auditors'],
    keyFeatures: [
      'Touch-optimized barcode checkout with instant subtotal and tax calculation',
      'Full offline resilience with automatic sync when connectivity restores',
      'Split tender support (Cash, Card, Mobile Payment, Store Credit)',
      'Digital receipt delivery via SMS/Email and thermal printer integration',
      'Shift cash drawer opening/closing reconciliation reports'
    ],
    technologies: ['React 19', 'TypeScript', 'IndexedDB', 'Tailwind CSS', 'Web Serial API'],
    status: 'Interactive Prototype',
    featured: true,
    published: true,
    thumbnail: '/src/assets/images/web_app_dashboard_1793079158006.jpg',
    screenshots: [
      '/src/assets/images/web_app_dashboard_1793079158006.jpg'
    ],
    demoUrl: 'https://demo.tesfayetech.com/apex-pos',
    interactiveSimulator: 'pos',
    createdAt: '2026-09-22T14:00:00Z',
    updatedAt: '2026-10-25T11:00:00Z'
  }
];

export const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-101',
    fullName: 'Abebe Tadesse',
    companyName: 'Horn Heritage Logistics',
    email: 'abebe.t@hornlogistics.et',
    phone: '+251 911 556 789',
    country: 'Ethiopia',
    solutionType: 'Web Application Development',
    industry: 'Transportation and Logistics',
    projectDescription: 'We need a custom freight tracking and dispatch dashboard to monitor our fleet of 65 intercity transport trucks, integrate IoT fuel sensors, and replace manual paper manifests.',
    requiredFeatures: 'GPS fleet tracking, IoT fuel monitor integration, driver trip logs, automated billing, SMS notification to cargo consignees.',
    budgetRange: '$15,000 - $30,000',
    expectedCompletionDate: '2027-02-15',
    preferredContactMethod: 'Email',
    status: 'New',
    internalNotes: [
      {
        id: 'note-1',
        author: 'Lead Solutions Architect',
        text: 'Reviewed initial brief. High similarity with FleetPulse architecture. Prepared preliminary scope deck.',
        date: '2026-10-25T14:20:00Z'
      }
    ],
    relatedProjectId: 'demo-11-logistics-dashboard',
    createdAt: '2026-10-25T12:30:00Z'
  },
  {
    id: 'inq-102',
    fullName: 'Sara Al-Mansoor',
    companyName: 'Oasis Health Clinics Group',
    email: 'sara.mansoor@oasisclinics.ae',
    phone: '+971 50 123 4567',
    country: 'United Arab Emirates',
    solutionType: 'Mobile Application Development',
    industry: 'Healthcare and Pharmaceuticals',
    projectDescription: 'Looking to develop a bilingual (English/Arabic) patient mobile application for booking 4 multi-specialty polyclinics in Dubai, with lab test result downloads and telehealth.',
    requiredFeatures: 'Doctor booking calendar, bilingual RTL support, patient medical records vault, insurance card scan, Apple Pay / Card payments.',
    budgetRange: '$25,000 - $50,000',
    expectedCompletionDate: '2027-04-01',
    preferredContactMethod: 'Video Call',
    status: 'In Progress',
    internalNotes: [
      {
        id: 'note-2',
        author: 'TesfayeTech PM',
        text: 'Discovery call held on Oct 24. Client impressed with MediConnect demo. Preparing detailed technical proposal.',
        date: '2026-10-24T16:00:00Z'
      }
    ],
    relatedProjectId: 'demo-8-clinic-appointment',
    createdAt: '2026-10-23T08:15:00Z'
  }
];
