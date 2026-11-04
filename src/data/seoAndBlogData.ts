import { SeoPageConfig, BlogArticle } from '../types/cms';

export const DEFAULT_SEO_PAGES: SeoPageConfig[] = [
  {
    id: 'home',
    name: 'Home',
    path: '/',
    title: 'TesfayeTech | Premier Software Development & Digital Solutions Company in Ethiopia',
    metaDescription: 'TesfayeTech is a leading software engineering agency in Addis Ababa, Ethiopia. We build custom web applications, mobile platforms, enterprise ERP systems, and responsive websites.',
    keywords: 'Web Development Company in Ethiopia, Custom Software Development Addis Ababa, Mobile App Development Ethiopia, Enterprise ERP Solutions Addis Ababa, Software Company Addis Ababa',
    canonicalUrl: 'https://tesfayeteklu.com/',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    ogType: 'website'
  },
  {
    id: 'about',
    name: 'About Us',
    path: '/about',
    title: 'About TesfayeTech | Leading Tech Agency & Software Engineers in Addis Ababa',
    metaDescription: 'Discover TesfayeTech: our senior engineering team, technology philosophy, and proven record delivering digital transformation and custom software across Ethiopia and East Africa.',
    keywords: 'About TesfayeTech, Software Engineers Addis Ababa, Ethiopian Tech Agency, IT consulting Ethiopia, Addis Ababa Software House',
    canonicalUrl: 'https://tesfayeteklu.com/about',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    ogType: 'website'
  },
  {
    id: 'services',
    name: 'Services Overview',
    path: '/services',
    title: 'Software Engineering & Digital Solutions Services | TesfayeTech',
    metaDescription: 'Explore our comprehensive software services: corporate web design, native/cross-platform mobile apps, cloud web applications, enterprise ERP, UI/UX design, and DevOps automation.',
    keywords: 'Software Development Services Ethiopia, IT Services Addis Ababa, Web Design Services Ethiopia, Custom ERP Engineering, Mobile App Services',
    canonicalUrl: 'https://tesfayeteklu.com/services',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    ogType: 'website'
  },
  {
    id: 'websites',
    name: 'Website Design',
    path: '/services/website-design',
    title: 'Professional Website Design & Development Company in Ethiopia | TesfayeTech',
    metaDescription: 'High-converting corporate websites, e-commerce storefronts, and web portals built with cutting-edge performance, search optimization, and responsive design for Ethiopian businesses.',
    keywords: 'Website Design Ethiopia, Web Development Company Addis Ababa, Corporate Website Design Ethiopia, E-commerce Website Ethiopia, Responsive Web Design',
    canonicalUrl: 'https://tesfayeteklu.com/services/website-design',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    ogType: 'website'
  },
  {
    id: 'webapps',
    name: 'Web Applications',
    path: '/services/web-applications',
    title: 'Custom Web Application Development & SaaS Engineering | TesfayeTech',
    metaDescription: 'Engineering scalable, secure cloud web applications, SaaS platforms, internal management portals, and multi-tenant architectures engineered to handle enterprise workloads.',
    keywords: 'Web Application Development Ethiopia, SaaS Development Addis Ababa, Cloud Software Ethiopia, Enterprise Web Apps, Custom Portal Development',
    canonicalUrl: 'https://tesfayeteklu.com/services/web-applications',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    ogType: 'website'
  },
  {
    id: 'mobile',
    name: 'Mobile Application Development',
    path: '/services/mobile-apps',
    title: 'Mobile App Development Company in Ethiopia (iOS & Android) | TesfayeTech',
    metaDescription: 'Native and cross-platform Flutter and React Native mobile apps. We integrate Telebirr, CBE Birr, biometric authentication, offline synchronization, and push notifications.',
    keywords: 'Mobile App Development Ethiopia, Android App Developer Addis Ababa, iOS Development Ethiopia, Flutter Developers Ethiopia, Telebirr Mobile Integration',
    canonicalUrl: 'https://tesfayeteklu.com/services/mobile-apps',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
    ogType: 'website'
  },
  {
    id: 'uiux',
    name: 'UI/UX Product Design',
    path: '/services/ui-ux-design',
    title: 'UI/UX Product Design & User Research Agency | TesfayeTech',
    metaDescription: 'Data-driven UI/UX design, interactive wireframing, clickable design systems, and usability research that converts users into loyal brand advocates.',
    keywords: 'UI/UX Design Ethiopia, Product Design Addis Ababa, Figma UI Design Ethiopia, User Experience Consulting, Mobile UI UX',
    canonicalUrl: 'https://tesfayeteklu.com/services/ui-ux-design',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
    ogType: 'website'
  },
  {
    id: 'custom-software',
    name: 'Custom Enterprise Software & ERP',
    path: '/services/custom-software',
    title: 'Custom Enterprise Software & ERP Development in Addis Ababa | TesfayeTech',
    metaDescription: 'Tailored enterprise ERP, HRMS, warehouse management, accounting, and supply chain automation engineered specifically for Ethiopian business regulations and compliance.',
    keywords: 'Enterprise ERP Ethiopia, Custom Software Development Addis Ababa, HRMS Software Ethiopia, ERP Software Addis Ababa, Business Automation Systems',
    canonicalUrl: 'https://tesfayeteklu.com/services/custom-software',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    ogType: 'website'
  },
  {
    id: 'portfolio',
    name: 'Portfolio & Interactive Demos',
    path: '/portfolio',
    title: 'Software Portfolio & Live Interactive Demos | TesfayeTech',
    metaDescription: 'Test-drive live interactive simulators and inspect production case studies across healthcare, finance, logistics, real estate, and hospitality software engineered by TesfayeTech.',
    keywords: 'TesfayeTech Portfolio, Software Demos Ethiopia, Web App Case Studies, Interactive Software Simulator, Live Demo Marketplace',
    canonicalUrl: 'https://tesfayeteklu.com/portfolio',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    ogType: 'website'
  },
  {
    id: 'contact',
    name: 'Contact & Project Request',
    path: '/contact',
    title: 'Contact TesfayeTech | Request a Software Project Consultation in Addis Ababa',
    metaDescription: 'Ready to build your website, mobile app, or enterprise system? Contact our senior software architects at Bole Innovation District, Addis Ababa, or request a project quotation.',
    keywords: 'Contact TesfayeTech, Software Inquiry Addis Ababa, Hire Software Developers Ethiopia, Tech Consultation Ethiopia, Bole Innovation District',
    canonicalUrl: 'https://tesfayeteklu.com/contact',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1200&q=80',
    ogType: 'website'
  },
  {
    id: 'blog',
    name: 'Tech Blog & Insights',
    path: '/blog',
    title: 'TesfayeTech Engineering Blog | Tech Trends & Ethiopian Digital Economy',
    metaDescription: 'In-depth engineering articles, fintech architecture guides, Telebirr integration tutorials, and digital transformation playbooks for businesses in Ethiopia and East Africa.',
    keywords: 'Ethiopian Tech Blog, Software Engineering Insights, Telebirr Developer Guide, ERP in Ethiopia, Addis Ababa Tech News',
    canonicalUrl: 'https://tesfayeteklu.com/blog',
    robots: 'index, follow',
    ogImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    ogType: 'website'
  }
];

export const DEFAULT_BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'blog-1',
    slug: 'building-modern-e-commerce-in-ethiopia-telebirr-cbe-birr-integration',
    title: 'Building Modern E-Commerce Platforms in Ethiopia: Telebirr & CBE Birr Payment Integration Guide',
    excerpt: 'A comprehensive technical blueprint for integrating Telebirr, CBE Birr, and mobile money gateways into high-performance online stores with automated reconciliation and zero cart abandonment.',
    content: `The e-commerce landscape in Ethiopia is experiencing an unprecedented boom. With over 40 million active Telebirr users and the rapid expansion of CBE Birr and digital banking APIs, businesses no longer have to rely exclusively on cash-on-delivery.

### 1. The Shifting Payment Paradigm in Addis Ababa
Historically, over 85% of online transactions in Ethiopia were conducted using manual cash-on-delivery. This presented severe logistical friction: courier safety risks, high cancellation rates, and cumbersome physical cash reconciliation. Today, direct SDK and API integrations with Ethio Telecom's Telebirr platform and commercial banks allow merchants to verify settlements in sub-second intervals.

### 2. Architecture for Seamless Payment Webhooks
When engineering a robust payment flow for Ethiopian consumers, resilience is paramount:
- **Idempotency Keys**: Guarantee that intermittent mobile network dips do not trigger duplicate debits on customer accounts.
- **Asynchronous Webhook Receivers**: Rather than blocking the user's checkout session, dispatch status confirmations via signed webhook payloads verified with cryptographic HMAC-SHA256 signatures.
- **SMS & In-App Dual Confirmations**: Ethiopian consumers expect immediate SMS receipts. Your backend should automatically link the payment gateway reference code with your internal order identifier.

### 3. Mobile-First Optimization for 3G & 4G Connectivity
Despite significant fiber rollout in Addis Ababa, a vast segment of Ethiopian smartphone shoppers access websites over fluctuating cellular signals. Lightweight asset delivery, image WebP compression, and client-side caching ensure your store loads within 1.8 seconds.

At TesfayeTech, we build custom e-commerce engines designed specifically for local payment ecosystems and cross-border settlement.`,
    category: 'Fintech & E-Commerce',
    tags: ['Telebirr', 'E-Commerce', 'Fintech', 'Ethiopia', 'Payment Gateway'],
    author: 'Tesfaye Teklu',
    authorRole: 'Principal Software Architect',
    coverImage: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
    publishedDate: '2026-03-15',
    readingTime: '7 min read',
    published: true,
    featured: true,
    seoTitle: 'Building Modern E-Commerce Platforms in Ethiopia: Telebirr & CBE Birr Guide | TesfayeTech',
    seoDescription: 'Learn how to architect robust e-commerce platforms in Ethiopia with automated Telebirr and CBE Birr payment gateway integrations and offline resilience.'
  },
  {
    id: 'blog-2',
    slug: 'custom-erp-vs-off-the-shelf-software-for-ethiopian-enterprises',
    title: 'Custom ERP vs. Off-the-Shelf Software: What Ethiopian Mid-to-Large Enterprises Need to Know',
    excerpt: 'Why generic international ERP platforms often fail Ethiopian tax, withholding, and dual-calendar requirements, and how bespoke enterprise architecture solves operational bottlenecks.',
    content: `Selecting an Enterprise Resource Planning (ERP) platform is among the most consequential capital decisions an Ethiopian enterprise will undertake. While global brands such as SAP, Oracle, and Odoo offer extensive out-of-the-box features, Ethiopian businesses frequently discover expensive compliance and localization chasms.

### 1. The Ethiopian Regulatory & Tax Complexities
Standard international software suites are typically configured for Western accounting standards. However, operating within Ethiopia requires strict adherence to:
- **Ethiopian Calendar (EC) vs. Gregorian Calendar (GC)** dual synchronization across fiscal quarters, depreciation schedules, and payroll cycles.
- **ERCA (Ministry of Revenues) E-Invoicing & Withholding Regulations**: Direct 2% and 30% withholding rules, specialized VAT thresholds, and automated stamp duty calculations.
- **Foreign Currency (Forex) & National Bank of Ethiopia (NBE) tracking**: Multi-currency allocation, LC (Letter of Credit) document workflows, and customs clearance milestones.

### 2. Total Cost of Ownership (TCO) Breakdown
Off-the-shelf foreign software incurs heavy recurring licensing costs in US Dollars—a major challenge given foreign currency accessibility in Ethiopia. In contrast, a custom ERP engineered by a domestic technology partner like TesfayeTech offers:
- **One-time capital development with local currency settlement**.
- **100% source-code ownership** with zero per-seat licensing penalties as your headcount expands from 50 to 5,000 employees.
- **Customized role-based access control (RBAC)** aligned exactly with your company's hierarchical sign-off thresholds.

### 3. Making the Right Strategic Choice
If your business processes are strictly standard and your budget can sustain indefinite foreign exchange outflows, off-the-shelf software may suffice. However, for manufacturers, import/export houses, agricultural conglomerates, and healthcare providers in Ethiopia, tailored custom software yields superior ROI within 14 months.`,
    category: 'Enterprise Systems',
    tags: ['ERP', 'Enterprise Software', 'Addis Ababa', 'Business Automation', 'ERCA Compliance'],
    author: 'Tesfaye Teklu',
    authorRole: 'Principal Software Architect',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    publishedDate: '2026-03-02',
    readingTime: '8 min read',
    published: true,
    featured: false,
    seoTitle: 'Custom ERP vs Off-the-Shelf Software for Ethiopian Enterprises | TesfayeTech',
    seoDescription: 'Compare custom ERP development against off-the-shelf foreign software for Ethiopian companies. Understand ERCA tax compliance, dual calendars, and TCO.'
  },
  {
    id: 'blog-3',
    slug: 'why-ethiopian-businesses-must-invest-in-responsive-mobile-first-websites',
    title: 'Why Ethiopian Businesses Must Invest in Responsive, Mobile-First Web Architecture in 2026',
    excerpt: 'Over 82% of Ethiopian web traffic originates from smartphones. Discover how modern responsive design, Core Web Vitals, and localized UX convert visitors into high-value clients.',
    content: `The days of designing a website primarily for desktop monitors and treating mobile as an afterthought are definitively over in East Africa. In Ethiopia, smartphone penetration has exploded, with mobile devices generating more than 8 out of every 10 web visits.

### 1. The Mobile-First Imperative in Addis Ababa & Regional Hubs
Whether prospective clients are searching for architectural consultancies, medical diagnostics, logistics transport, or financial advisory services, their initial brand impression occurs on an Android or iOS screen. If your site exhibits tiny text, horizontal scrollbars, slow loading banners, or broken navigation dropdowns, potential clients immediately bounce to your competitors.

### 2. Search Engine Optimization (SEO) & Google's Mobile Index
Google now uses **Mobile-First Indexing** exclusively for all websites globally. This means:
- Googlebot evaluates your mobile viewport layout, font legibility, and tap targets when calculating search rankings for queries like *"Top software company in Addis Ababa"*.
- If your mobile version lacks metadata, is sluggish, or fails Google's Core Web Vitals (Largest Contentful Paint < 2.5s), your organic visibility plummets.

### 3. Engineering for Real-World Speed
To ensure peak mobile conversion, TesfayeTech implements:
- Zero-bloat JavaScript bundling and tree-shaking.
- Adaptive responsive images with srcset and WebP formatting.
- Thumb-friendly navigation drawer patterns with instantaneous touch responsiveness.
- One-tap WhatsApp and phone consultation shortcuts tailored to Ethiopian business communication norms.`,
    category: 'Web Engineering',
    tags: ['Website Design', 'Mobile-First', 'SEO', 'Core Web Vitals', 'Responsive Design'],
    author: 'Tesfaye Teklu',
    authorRole: 'Principal Software Architect',
    coverImage: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=1200&q=80',
    publishedDate: '2026-02-18',
    readingTime: '5 min read',
    published: true,
    featured: false,
    seoTitle: 'Why Ethiopian Businesses Must Invest in Mobile-First Websites | TesfayeTech',
    seoDescription: 'Discover why mobile-first, responsive web development is critical for Ethiopian companies to dominate Google rankings and convert mobile traffic into paying clients.'
  },
  {
    id: 'blog-4',
    slug: 'mobile-app-development-best-practices-for-low-bandwidth-environments',
    title: 'Designing Mobile Applications for Emerging Markets: Offline-First & Low-Bandwidth Best Practices',
    excerpt: 'How to build resilient iOS and Android applications that function flawlessly during connectivity dropouts, utilizing SQLite, background syncing, and delta updates.',
    content: `Deploying mobile apps in emerging markets like Ethiopia requires specialized engineering rigor that standard Western development templates overlook. Cellular networks can experience intermittent latency, power outages affect tower connectivity, and mobile data cost consciousness is high among end users.

### 1. The Offline-First Architectural Pattern
In an offline-first mobile application, local device storage (such as SQLite, WatermelonDB, or Realm) serves as the primary source of truth for the user interface, while the remote cloud server acts as a synchronization target:
- **Instant UI Rendering**: The user opens the app and immediately interacts with cached catalogs, customer records, or patient charts without waiting for network spinners.
- **Optimistic UI Updates**: When the user clicks "Submit Order" or "Record Transaction", the app records the entry immediately in the local queue and marks it with a pending sync indicator.
- **Background Sync Engine**: Once connectivity is detected, background workers reconcile transactions in sequential order using exponential backoff retry algorithms.

### 2. Minimizing Data Consumption
Data affordability is a major metric determining app retention in Africa:
- Use binary protocols like Protocol Buffers (Protobuf) or compressed JSON payloads instead of verbose XML.
- Implement delta syncing—transferring only changed records rather than re-downloading entire datasets.
- Cache high-resolution imagery aggressively and deliver thumbnails dynamically scaled to device pixel ratio.

At TesfayeTech, our cross-platform Flutter and React Native architectures are engineered with offline resilience baked into the core.`,
    category: 'Mobile Development',
    tags: ['Mobile Apps', 'Offline-First', 'Flutter', 'React Native', 'Emerging Markets'],
    author: 'Tesfaye Teklu',
    authorRole: 'Principal Software Architect',
    coverImage: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&w=1200&q=80',
    publishedDate: '2026-02-04',
    readingTime: '6 min read',
    published: true,
    featured: false,
    seoTitle: 'Mobile App Development for Low-Bandwidth & Offline Environments | TesfayeTech',
    seoDescription: 'Architecting offline-first mobile apps for Ethiopia and emerging markets with local database caching, delta synchronizations, and low data footprints.'
  },
  {
    id: 'blog-5',
    slug: 'digital-transformation-in-addis-ababa-how-automation-cuts-operational-costs',
    title: 'Digital Transformation in Addis Ababa: How Workflow Automation Cuts Operational Costs by 40%',
    excerpt: 'Real-world case studies and frameworks showing how mid-sized enterprises in Ethiopia eliminate manual paper routing, prevent inventory shrinkage, and accelerate revenue.',
    content: `Across Addis Ababa, from Hawassa industrial parks to Bole financial corridors, forward-thinking executives are recognizing that paper-based registers and manual spreadsheet tracking are crippling operational velocity.

### 1. The Hidden Costs of Manual Operations
Consider a typical wholesale distributor or private healthcare clinic operating in Ethiopia:
- **Manual Data Re-Entry**: Invoices generated in physical receipt books must be re-entered into accounting spreadsheets at end-of-day, creating high error rates and reconciliation delays.
- **Inventory Discrepancies**: Without real-time barcode scanning and automated warehouse tracking, stock theft and shrinkage can erode up to 8% of gross margins.
- **Approval Bottlenecks**: High-value purchase orders sit on managers' desks for days awaiting physical signatures while operations stall.

### 2. What Real Workflow Automation Delivers
By modernizing with customized web portals and integrated mobile audit tools:
1. **Automated Procurement Approval**: Department heads approve supply requisitions in one tap from their smartphones with timestamped audit logs.
2. **Point-of-Sale (POS) & Central Warehouse Sync**: When a store branch sells an item, the central inventory automatically recalculates safety stock and triggers reorder notifications.
3. **Executive BI Dashboards**: Business owners view real-time revenue, cashflow, and customer acquisition metrics on live dashboards instead of waiting 3 weeks for month-end reports.

TesfayeTech partners with growing organizations across Ethiopia to audit existing friction points and engineer high-impact business automation systems.`,
    category: 'Digital Transformation',
    tags: ['Digital Transformation', 'Automation', 'Addis Ababa', 'Business Intelligence', 'Cost Optimization'],
    author: 'Tesfaye Teklu',
    authorRole: 'Principal Software Architect',
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    publishedDate: '2026-01-20',
    readingTime: '6 min read',
    published: true,
    featured: false,
    seoTitle: 'Digital Transformation in Addis Ababa: Cut Operational Costs by 40% | TesfayeTech',
    seoDescription: 'Discover how business process automation, custom portals, and real-time inventory systems empower Ethiopian businesses to reduce overhead and scale rapidly.'
  }
];
