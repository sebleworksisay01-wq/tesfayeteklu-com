import React from 'react';
import { Project } from '../types';
import { ManagedIndustry } from '../types/cms';
import { 
  Building2, Landmark, HeartPulse, GraduationCap, ShoppingBag, 
  Factory, Hotel, Home, Truck, Sprout, HandHeart, 
  Briefcase, Radio, Users2, Clapperboard, UtensilsCrossed, Scale, ArrowRight 
} from 'lucide-react';

interface IndustriesViewProps {
  projects: Project[];
  industries?: ManagedIndustry[];
  onSelectIndustry: (industry: string) => void;
  onRequestProject: () => void;
}

export const IndustriesView: React.FC<IndustriesViewProps> = ({
  projects,
  industries = [],
  onSelectIndustry,
  onRequestProject
}) => {
  const publishedIndustries = industries
    .filter((ind) => ind.published !== false)
    .sort((a, b) => a.order - b.order);

  const getIndustryIcon = (name: string) => {
    switch (name) {
      case 'Banking and Financial Services': return <Landmark className="w-5 h-5" />;
      case 'Insurance and Reinsurance': return <Building2 className="w-5 h-5" />;
      case 'Healthcare and Pharmaceuticals': return <HeartPulse className="w-5 h-5" />;
      case 'Education and Training': return <GraduationCap className="w-5 h-5" />;
      case 'Retail and E-commerce': return <ShoppingBag className="w-5 h-5" />;
      case 'Manufacturing and Distribution': return <Factory className="w-5 h-5" />;
      case 'Hospitality, Hotels and Tourism': return <Hotel className="w-5 h-5" />;
      case 'Real Estate and Construction': return <Home className="w-5 h-5" />;
      case 'Transportation and Logistics': return <Truck className="w-5 h-5" />;
      case 'Agriculture and Agribusiness': return <Sprout className="w-5 h-5" />;
      case 'NGOs and Development Organizations': return <HandHeart className="w-5 h-5" />;
      case 'Professional and Consulting Services': return <Briefcase className="w-5 h-5" />;
      case 'Telecommunications and Technology': return <Radio className="w-5 h-5" />;
      case 'Human Resources and Recruitment': return <Users2 className="w-5 h-5" />;
      case 'Media and Entertainment': return <Clapperboard className="w-5 h-5" />;
      case 'Restaurants and Food Services': return <UtensilsCrossed className="w-5 h-5" />;
      case 'Legal and Business Services': return <Scale className="w-5 h-5" />;
      default: return <Building2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          Cross-Sector Engineering
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Solutions by Industry
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Every industry has specific data models, regulatory mandates, and operational tempos. Explore how TesfayeTech adapts custom web applications, mobile platforms, and websites to 18 distinct commercial and public sectors.
        </p>
      </div>

      {/* Industries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {publishedIndustries.map((ind) => {
          const count = projects.filter((p) => p.industries?.includes(ind.name)).length;
          return (
            <div
              key={ind.id}
              onClick={() => onSelectIndustry(ind.name)}
              className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {getIndustryIcon(ind.name)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {ind.name}
                  </h3>
                  <div className="text-2xs text-slate-500 font-mono mt-0.5">
                    {count} active {count === 1 ? 'solution demo' : 'solution demos'} available
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {ind.description || `Tailored workflow automation, customized dashboards, customer-facing portals, and specialized transaction logic for ${ind.name}.`}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>Explore {ind.name} Demos</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Callout */}
      <div className="p-8 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold">Don't see your specific niche listed?</h3>
          <p className="text-xs text-slate-400">
            Our modular engineering architecture adapts to proprietary domain models and specialized business requirements.
          </p>
        </div>
        <button
          onClick={onRequestProject}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer"
        >
          Discuss Custom Architecture
        </button>
      </div>

    </div>
  );
};
