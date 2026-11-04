import React from 'react';
import { ArrowLeft, Home, Search, Compass, PhoneCall } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

interface NotFoundViewProps {
  onGoHome: () => void;
  onSelectTab: (tab: string) => void;
  onRequestProject: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  onGoHome,
  onSelectTab,
  onRequestProject
}) => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 py-16">
      <SEOHead
        title="404 Page Not Found | TesfayeTech"
        description="The page you requested could not be found. Explore our software development services, mobile app demos, and enterprise systems."
        canonicalPath="/404"
        robots="noindex, follow"
      />

      <div className="max-w-xl w-full text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-3xl font-black mb-6 shadow-sm">
          404
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Page Not Found
        </h1>

        <p className="text-slate-600 text-sm leading-relaxed mb-8">
          The link you followed may be broken, outdated, or the page may have been moved. Explore our core services or return to the TesfayeTech homepage below.
        </p>

        {/* Quick navigation buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            onClick={onGoHome}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>

          <button
            onClick={onRequestProject}
            className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-blue-600" />
            <span>Contact Support</span>
          </button>
        </div>

        {/* Popular destinations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-left shadow-2xs">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Explore Popular Solutions</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => onSelectTab('websites')}
              className="p-3 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-colors cursor-pointer group"
            >
              <div className="font-semibold text-slate-900 group-hover:text-blue-600">Website Design</div>
              <div className="text-[11px] text-slate-500">Corporate & E-Commerce</div>
            </button>

            <button
              onClick={() => onSelectTab('mobile')}
              className="p-3 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-colors cursor-pointer group"
            >
              <div className="font-semibold text-slate-900 group-hover:text-blue-600">Mobile Apps</div>
              <div className="text-[11px] text-slate-500">iOS & Android with Telebirr</div>
            </button>

            <button
              onClick={() => onSelectTab('webapps')}
              className="p-3 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-colors cursor-pointer group"
            >
              <div className="font-semibold text-slate-900 group-hover:text-blue-600">Enterprise Web Apps</div>
              <div className="text-[11px] text-slate-500">Custom ERP & HRMS Suites</div>
            </button>

            <button
              onClick={() => onSelectTab('blog')}
              className="p-3 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-colors cursor-pointer group"
            >
              <div className="font-semibold text-slate-900 group-hover:text-blue-600">Tech Blog</div>
              <div className="text-[11px] text-slate-500">Engineering Blueprints</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
