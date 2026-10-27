import React from 'react';
import { Project } from '../types';
import { CmsConfig } from '../types/cms';
import { ProjectCard } from '../components/ProjectCard';
import { 
  ArrowRight, CheckCircle2, Code2, Smartphone, Globe, 
  HelpCircle, ChevronDown, Sparkles 
} from 'lucide-react';

interface HomeViewProps {
  projects: Project[];
  cms: CmsConfig;
  onSelectTab: (tab: string) => void;
  onRequestProject: () => void;
  onViewDetails: (project: Project) => void;
  onLaunchDemo: (project: Project) => void;
  onRequestSimilar: (project: Project) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  projects,
  cms,
  onSelectTab,
  onRequestProject,
  onViewDetails,
  onLaunchDemo,
  onRequestSimilar
}) => {
  const home = cms.home;
  const visibility = home?.sectionVisibility || {
    hero: true,
    metrics: true,
    categories: true,
    featuredDemos: true,
    process: true,
    whyUs: true,
    testimonials: true,
    faq: true,
    contactCta: true
  };

  const featuredLimit = home?.featuredDemosSection?.maxDisplay || 6;
  const featuredProjects = projects.filter((p) => p.featured && p.published !== false).slice(0, featuredLimit);

  return (
    <div className="space-y-20 sm:space-y-28">
      
      {/* ==============================================================
       * 1. HERO SECTION
       * ============================================================*/}
      {visibility.hero !== false && (
        <section className="relative pt-6 sm:pt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Copy & Primary CTAs */}
              <div className="lg:col-span-7 space-y-6">
                
                {home?.hero?.badgeText && (
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 tracking-wide uppercase">
                    <span>{home.hero.badgeText}</span>
                  </div>
                )}

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] text-balance">
                  {home?.hero?.headline || 'We Design and Build Digital Solutions for Your Business.'}
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  {home?.hero?.subtitle || 'TesfayeTech engineers production-grade website design, native and cross-platform mobile apps, enterprise web applications, and intelligent business automation systems that accelerate growth.'}
                </p>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => {
                      const tab = home?.hero?.primaryCtaTab || 'webapps';
                      if (tab === 'inquiry') onRequestProject();
                      else onSelectTab(tab);
                    }}
                    className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{home?.hero?.primaryCtaText || 'Explore Our Demos'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      const tab = home?.hero?.secondaryCtaTab || 'inquiry';
                      if (tab === 'inquiry') onRequestProject();
                      else onSelectTab(tab);
                    }}
                    className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    {home?.hero?.secondaryCtaText || 'Start Your Project'}
                  </button>
                </div>

                {/* Zero-Pill Quiet Trust Indicators */}
                <div className="pt-4 flex items-center flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Interactive prototypes ready to test</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>18 Business industries covered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100% turnkey deployment</span>
                  </div>
                </div>

              </div>

              {/* Right Hero Image Card */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900 aspect-4/3 group">
                  <img
                    src={home?.hero?.imageUrl || '/src/assets/images/hero_tech_agency_1793079157707.jpg'}
                    alt="TesfayeTech Software Studio"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  {home?.hero?.imageCaption && (
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                      <div className="text-2xs uppercase tracking-wider font-semibold text-blue-400">Software Architecture & Engineering</div>
                      <div className="text-sm font-bold mt-1">{home.hero.imageCaption}</div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Configurable Metrics Strip */}
            {visibility.metrics !== false && home?.metrics && home.metrics.length > 0 && (
              <div className="mt-14 pt-8 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-800">
                {home.metrics.map((m) => (
                  <div key={m.id}>
                    <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">{m.value}</div>
                    <div className="text-xs text-slate-600 font-medium mt-1">{m.label}</div>
                    {m.subtext && <div className="text-2xs text-slate-400 mt-0.5">{m.subtext}</div>}
                  </div>
                ))}
              </div>
            )}

          </div>
        </section>
      )}

      {/* ==============================================================
       * 2. SOLUTION CATEGORIES TRIAD
       * ============================================================*/}
      {visibility.categories !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              {home?.categoriesSection?.kicker || 'Core Expertise'}
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {home?.categoriesSection?.title || 'Specialized Software Solutions'}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {home?.categoriesSection?.description || 'Choose from our three foundational delivery disciplines or combine them into a unified omnichannel digital platform.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Website Design */}
            <div 
              onClick={() => onSelectTab('websites')}
              className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Website Design & Development
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Corporate portals, consulting websites, e-commerce storefronts, hotel booking systems, and educational platforms engineered for high conversions and SEO.
                </p>
                <div className="pt-2 space-y-1.5 text-2xs text-slate-500">
                  <div>· High-speed sub-second load times</div>
                  <div>· Responsive desktop, tablet, and mobile layouts</div>
                  <div>· Integrated CMS & multi-lingual support</div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>Explore Website Demos</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Mobile Apps */}
            <div 
              onClick={() => onSelectTab('mobile')}
              className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Mobile Application Development
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Native iOS, Android, and cross-platform apps for fintech banking, food delivery, doctor appointments, customer loyalty, and logistics tracking.
                </p>
                <div className="pt-2 space-y-1.5 text-2xs text-slate-500">
                  <div>· Biometric face/fingerprint authentication</div>
                  <div>· Push notification & real-time messaging engines</div>
                  <div>· Offline caching and background synchronization</div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>Explore Mobile Demos</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Web Apps & ERP */}
            <div 
              onClick={() => onSelectTab('webapps')}
              className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Code2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Web Application & ERP Systems
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mission-critical enterprise software: HRMS, Inventory control, CRM, Point of Sale, Reinsurance, Hospital management, and Business Intelligence dashboards.
                </p>
                <div className="pt-2 space-y-1.5 text-2xs text-slate-500">
                  <div>· Role-based access control (RBAC) security</div>
                  <div>· Automated payroll, inventory, and ledger processing</div>
                  <div>· Enterprise database integrity and REST/GraphQL APIs</div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>Explore Web App Demos</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ==============================================================
       * 3. FEATURED DEMO MARKETPLACE SHOWCASE
       * ============================================================*/}
      {visibility.featuredDemos !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                {home?.featuredDemosSection?.kicker || 'Demo Marketplace'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                {home?.featuredDemosSection?.title || 'Featured Solution Prototypes'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                {home?.featuredDemosSection?.description || 'Interact directly with sample enterprise systems, test live interfaces, and see how our architectures solve real business bottlenecks.'}
              </p>
            </div>

            <button
              onClick={() => onSelectTab('webapps')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap cursor-pointer"
            >
              <span>View All Demo Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewDetails={onViewDetails}
                onLaunchDemo={onLaunchDemo}
                onRequestSimilar={onRequestSimilar}
              />
            ))}
          </div>
        </section>
      )}

      {/* ==============================================================
       * 4. OUR 6-STAGE DEVELOPMENT PROCESS
       * ============================================================*/}
      {visibility.process !== false && home?.processSection && (
        <section className="bg-slate-900 text-white py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                {home.processSection.kicker || 'Proven Methodology'}
              </span>
              <h2 className="text-3xl font-bold tracking-tight">
                {home.processSection.title || 'From Concept to Turnkey Production'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {home.processSection.description || 'We employ a disciplined 6-stage engineering lifecycle that ensures transparency, predictable delivery, and zero unexpected downtime.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {home.processSection.steps.map((step) => (
                <div 
                  key={step.id || step.num}
                  className="p-6 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3"
                >
                  <div className="text-xs font-mono font-bold text-blue-400">
                    Step {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ==============================================================
       * 5. WHY CHOOSE TESFAYETECH & TESTIMONIALS
       * ============================================================*/}
      {(visibility.whyUs !== false || visibility.testimonials !== false) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Why Us Column */}
            {visibility.whyUs !== false && home?.whyUsSection && (
              <div className="lg:col-span-6 space-y-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  {home.whyUsSection.kicker || 'The TesfayeTech Standard'}
                </div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {home.whyUsSection.title || 'Why Forward-Thinking Businesses Partner With Us'}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {home.whyUsSection.description || 'We architect scalable, secure software that becomes an enterprise asset for your business.'}
                </p>

                <div className="pt-2 space-y-4">
                  {home.whyUsSection.points.map((pt) => (
                    <div key={pt.id || pt.num} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">
                        {pt.num}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{pt.title}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">{pt.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonials Column */}
            {visibility.testimonials !== false && home?.testimonialsSection && (
              <div className="lg:col-span-6">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
                  <div className="border-b border-slate-200 pb-4">
                    <span className="text-2xs uppercase tracking-wider text-slate-400 font-semibold">
                      {home.testimonialsSection.kicker || 'Illustrative Case Studies'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {home.testimonialsSection.title || 'Simulated Client Impact Outcomes'}
                    </h3>
                    <p className="text-2xs text-slate-500 italic mt-0.5">
                      {home.testimonialsSection.description || 'Sample illustrative benchmarks based on standardized deployment metrics.'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {home.testimonialsSection.items.filter((t) => t.published !== false).map((item) => (
                      <div key={item.id} className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{item.company}</span>
                          <span className="text-emerald-700 font-bold font-mono">{item.metric}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          "{item.quote}"
                        </p>
                        <div className="text-2xs text-slate-400">
                          · {item.author}, {item.role} {item.isSample && '(Sample Demonstration)'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>
      )}

      {/* ==============================================================
       * 6. FREQUENTLY ASKED QUESTIONS SECTION
       * ============================================================*/}
      {visibility.faq !== false && home?.faqSection?.faqs && home.faqSection.faqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              {home.faqSection.kicker || 'Common Questions'}
            </span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {home.faqSection.title || 'Frequently Asked Questions'}
            </h2>
            <p className="text-sm text-slate-600">
              {home.faqSection.description || 'Everything you need to know about our engineering approach, delivery model, and contracts.'}
            </p>
          </div>

          <div className="space-y-3">
            {home.faqSection.faqs.filter((f) => f.published !== false).map((faq) => (
              <div key={faq.id} className="p-5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <h3 className="text-sm font-bold text-slate-900">{faq.q}</h3>
                </div>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==============================================================
       * 7. BOTTOM CONVERSION BANNER
       * ============================================================*/}
      {visibility.contactCta !== false && home?.contactBanner && (
        <section className="bg-linear-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 sm:p-12 text-white max-w-7xl mx-auto shadow-xl">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              {home.contactBanner.kicker || 'Start Your Engineering Journey'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {home.contactBanner.headline || 'Have a Specific Project in Mind? Let\'s Architect It Together.'}
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed">
              {home.contactBanner.description || 'Submit your requirements to receive a complimentary feasibility analysis, technology stack recommendation, and estimated development timeline within 24 hours.'}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={onRequestProject}
                className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {home.contactBanner.primaryButtonText || 'Request Project Consultation'}
              </button>
              <button
                onClick={() => onSelectTab('contact')}
                className="px-6 py-3 border border-white/40 hover:bg-white/10 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                {home.contactBanner.secondaryButtonText || 'Speak With an Architect'}
              </button>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
