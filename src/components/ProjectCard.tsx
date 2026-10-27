import React, { useState } from 'react';
import { Project } from '../types';
import { ExternalLink, Play, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onViewDetails: (project: Project) => void;
  onLaunchDemo: (project: Project) => void;
  onRequestSimilar: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewDetails,
  onLaunchDemo,
  onRequestSimilar
}) => {
  const [imgError, setImgError] = useState(false);

  // Status label styling as clean unboxed text
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'Live Demo':
        return 'text-emerald-700 font-semibold';
      case 'Interactive Prototype':
        return 'text-blue-700 font-semibold';
      case 'Production Project':
        return 'text-indigo-700 font-semibold';
      case 'Concept':
      default:
        return 'text-slate-600 font-semibold';
    }
  };

  return (
    <article className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col overflow-hidden">
      
      {/* Thumbnail Container */}
      <div className="relative aspect-16/10 bg-slate-100 overflow-hidden border-b border-slate-100">
        {!imgError && project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-linear-to-br from-slate-100 to-slate-200 text-slate-500">
            <Layers className="w-8 h-8 mb-2 text-slate-400" />
            <span className="text-xs font-semibold text-center">{project.name}</span>
          </div>
        )}

        {/* Quick Launch Demo Overlay Button on image hover if demo exists */}
        {(project.interactiveSimulator || project.demoUrl) && (
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
            <button
              onClick={() => onLaunchDemo(project)}
              className="px-3.5 py-2 bg-white/95 text-slate-900 rounded-lg text-xs font-bold shadow-lg hover:bg-white flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
              <span>Launch Prototype</span>
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2.5">
          {/* Zero-Pill Unboxed Clean Metadata */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-800">{project.solutionType}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className={getStatusColor(project.status)}>{project.status}</span>
            {project.industries && project.industries.length > 0 && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="truncate max-w-[150px]">{project.industries[0]}</span>
              </>
            )}
          </div>

          {/* Project Title */}
          <h3 
            onClick={() => onViewDetails(project)}
            className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors leading-snug line-clamp-1"
          >
            {project.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {project.shortDescription}
          </p>

          {/* Key Features Highlights (first 2) */}
          <div className="space-y-1 pt-1">
            {project.keyFeatures.slice(0, 2).map((feat, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-2xs text-slate-600">
                <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{feat}</span>
              </div>
            ))}
          </div>

          {/* Technologies used (unboxed text) */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="pt-2 text-2xs text-slate-500 line-clamp-1">
              <span className="font-semibold text-slate-700">Stack: </span>
              {project.technologies.slice(0, 4).join(' · ')}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => onViewDetails(project)}
            className="text-xs font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1.5">
            {(project.interactiveSimulator || project.demoUrl) && (
              <button
                onClick={() => onLaunchDemo(project)}
                title="Launch Interactive Prototype"
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-md flex items-center gap-1 transition-colors"
              >
                <Play className="w-3 h-3 fill-blue-700" />
                <span>Demo</span>
              </button>
            )}

            <button
              onClick={() => onRequestSimilar(project)}
              title="Request Similar Project"
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md transition-colors"
            >
              Request Build
            </button>
          </div>
        </div>

      </div>
    </article>
  );
};
