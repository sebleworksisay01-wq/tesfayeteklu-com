import React from 'react';
import { ManagedService } from '../types/cms';
import { 
  Globe, Layout, Smartphone, Code2, Cpu, 
  Share2, Database, Cloud, ShieldCheck, ArrowRight, CheckCircle2 
} from 'lucide-react';

interface ServicesViewProps {
  services?: ManagedService[];
  onRequestQuoteForService: (serviceName: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  services = [],
  onRequestQuoteForService
}) => {
  const publishedServices = services
    .filter((s) => s.published !== false)
    .sort((a, b) => a.order - b.order);

  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'Globe': return <Globe className="w-6 h-6" />;
      case 'Layout': return <Layout className="w-6 h-6" />;
      case 'Smartphone': return <Smartphone className="w-6 h-6" />;
      case 'Code2': return <Code2 className="w-6 h-6" />;
      case 'Cpu': return <Cpu className="w-6 h-6" />;
      case 'Share2': return <Share2 className="w-6 h-6" />;
      case 'Database': return <Database className="w-6 h-6" />;
      case 'Cloud': return <Cloud className="w-6 h-6" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6" />;
      default: return <Code2 className="w-6 h-6" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          End-to-End Capabilities
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Software Development Services
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          From greenfield product discovery to high-availability enterprise migrations, TesfayeTech provides turnkey engineering services with guaranteed deliverables.
        </p>
      </div>

      {/* Dynamic Services List */}
      <div className="space-y-8">
        {publishedServices.map((service, idx) => (
          <div
            key={service.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:border-slate-300 transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left Col: Overview */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  {getServiceIcon(service.iconName)}
                </div>
                <div className="text-xs font-mono font-bold text-slate-400">
                  Service 0{idx + 1}
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                {service.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {service.fullDescription || service.shortDescription}
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onRequestQuoteForService(service.title)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{service.quoteCtaText || 'Request a Quote for This Service'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Col: Benefits & Deliverables */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 lg:pt-0 lg:border-l lg:border-slate-100 lg:pl-8">
              
              {/* Strategic Benefits */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Business Value & Benefits
                </h3>
                <ul className="space-y-2">
                  {service.benefits.map((benefit, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2 text-xs text-slate-600 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Concrete Deliverables */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Guaranteed Deliverables
                </h3>
                <ul className="space-y-2">
                  {service.deliverables.map((deliv, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2 text-xs text-slate-600 leading-snug">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                      <span>{deliv}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
