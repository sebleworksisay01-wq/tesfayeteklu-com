import React from 'react';
import { ShieldCheck, Award, Zap, Code2, Users, ArrowRight } from 'lucide-react';

interface AboutViewProps {
  onRequestProject: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onRequestProject }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          About TesfayeTech
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Engineering High-Impact Digital Solutions for Growing Enterprises
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          TesfayeTech is a software development and digital transformation consultancy. We specialize in turning operational complexity into elegant, performant websites, native mobile applications, custom ERPs, and automated business platforms.
        </p>
      </div>

      {/* Narrative & Philosophy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            Founded on the principle that modern software should be an enduring asset rather than a source of continuous technical debt, TesfayeTech pairs rigorous full-stack engineering with human-centered product design.
          </p>
          <p>
            Whether helping an established logistics firm transition from paper manifests to real-time telemetry, or architecting a regional polyclinic network's telehealth application, our teams deliver solutions that are performant on day one and maintainable over decades.
          </p>
          <p>
            We believe in transparency: our prospective clients explore interactive working prototypes of our systems before signing scopes, and our clients receive 100% ownership of their source code, database architectures, and design tokens upon delivery.
          </p>
        </div>

        <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="text-xs uppercase font-mono tracking-wider text-blue-400">Our Core Principles</div>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Zero Vendor Lock-In:</strong>
                <span className="text-slate-300">Clean code, open standards, and full repository ownership for every client.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Speed & Performance First:</strong>
                <span className="text-slate-300">Sub-second page loads, 60fps mobile interfaces, and optimized database queries.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Code2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Type-Safe Architecture:</strong>
                <span className="text-slate-300">TypeScript across the entire stack preventing bugs before they reach production.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Pillars */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-900">Our Technical Capabilities</h2>
          <p className="text-xs text-slate-500">Modern technologies we actively deploy in enterprise production</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
            <div className="font-bold text-slate-900">Front-End & Mobile</div>
            <div className="text-slate-500">React 19, React Native, TypeScript, Tailwind CSS, Vite, Next.js</div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
            <div className="font-bold text-slate-900">Back-End & APIs</div>
            <div className="text-slate-500">Node.js, Express, Go, Python, RESTful Services, GraphQL, WebSockets</div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
            <div className="font-bold text-slate-900">Databases & Storage</div>
            <div className="text-slate-500">PostgreSQL, Redis, MySQL, Firestore, MongoDB, IndexedDB</div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
            <div className="font-bold text-slate-900">Cloud & DevOps</div>
            <div className="text-slate-500">Docker, Kubernetes, Google Cloud, AWS, CI/CD Actions, Cloudflare</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Ready to discuss your software roadmap?</h3>
          <p className="text-xs text-slate-600 mt-0.5">We review incoming briefs and respond with a technical assessment within 24 hours.</p>
        </div>
        <button
          onClick={onRequestProject}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
        >
          Request Project Consultation
        </button>
      </div>

    </div>
  );
};
