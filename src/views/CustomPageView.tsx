import React from 'react';
import { CustomPage } from '../types/cms';
import { ArrowLeft, Clock } from 'lucide-react';

interface CustomPageViewProps {
  page: CustomPage;
  onBack: () => void;
  onRequestProject: () => void;
}

export const CustomPageView: React.FC<CustomPageViewProps> = ({
  page,
  onBack,
  onRequestProject
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Previous View</span>
      </button>

      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {page.title}
        </h1>
        {page.updatedAt && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Last revised: {new Date(page.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-4">
        {page.content.split('\n\n').map((paragraph, index) => {
          if (paragraph.startsWith('### ')) {
            return (
              <h3 key={index} className="text-base font-bold text-slate-900 pt-3">
                {paragraph.replace('### ', '')}
              </h3>
            );
          }
          if (paragraph.startsWith('## ')) {
            return (
              <h2 key={index} className="text-xl font-bold text-slate-900 pt-4">
                {paragraph.replace('## ', '')}
              </h2>
            );
          }
          return <p key={index}>{paragraph}</p>;
        })}
      </div>

      {/* Bottom CTA */}
      <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
        <span className="text-xs text-slate-500">Need specific custom enterprise licensing or legal agreements?</span>
        <button
          onClick={onRequestProject}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Contact Legal & Solutions Team
        </button>
      </div>

    </div>
  );
};
