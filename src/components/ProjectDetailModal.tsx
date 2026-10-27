import React, { useState } from 'react';
import { Project } from '../types';
import { X, Play, ExternalLink, CheckCircle2, ArrowRight, Layers, Users, HelpCircle, Lightbulb } from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onLaunchDemo: (project: Project) => void;
  onRequestCustomization: (project: Project) => void;
  relatedProjects?: Project[];
  onSelectProject?: (project: Project) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onLaunchDemo,
  onRequestCustomization,
  relatedProjects = [],
  onSelectProject
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!project) return null;

  const allImages = project.screenshots && project.screenshots.length > 0 
    ? project.screenshots 
    : [project.thumbnail];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-semibold text-blue-400">{project.solutionType}</span>
            <span className="text-slate-600">|</span>
            <span className="text-xs text-slate-300 font-mono">{project.status}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="max-h-[80vh] overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* Main Title & Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {project.name}
              </h1>
              <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 mt-2">
                <span className="font-medium text-slate-700">{project.subCategory}</span>
                {project.industries && project.industries.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Industries: {project.industries.join(', ')}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {(project.interactiveSimulator || project.demoUrl) && (
                <button
                  onClick={() => onLaunchDemo(project)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Launch Live Simulation</span>
                </button>
              )}
              <button
                onClick={() => onRequestCustomization(project)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Request Similar Solution
              </button>
            </div>
          </div>

          {/* Screenshot Showcase & Gallery */}
          <div className="space-y-3">
            <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={allImages[activeImageIndex] || project.thumbnail}
                alt={project.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-md overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Architecture & Business Case Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Business Problem */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>The Business Problem</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {project.businessProblem}
              </p>
            </div>

            {/* Proposed Solution */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <span>TesfayeTech Engineered Solution</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {project.proposedSolution}
              </p>
            </div>

          </div>

          {/* Key Features & Functional Modules */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Core Capabilities & Functional Modules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {project.keyFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-white border border-slate-200 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium leading-snug">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Target Audience & Users */}
          {project.targetUsers && project.targetUsers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                <Users className="w-4 h-4 text-slate-700" />
                <span>Target User Roles</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                {project.targetUsers.map((user, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-800 px-3 py-1 rounded-md font-medium">
                    {user}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Technology Stack Specifications */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
            <div className="text-xs uppercase tracking-wider font-semibold text-blue-400">
              Technical Architecture & Stack
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-300">
              {project.technologies.map((tech, idx) => (
                <span key={idx} className="font-mono">
                  {tech} {idx < project.technologies.length - 1 && '·'}
                </span>
              ))}
            </div>
          </div>

          {/* Related Demo Solutions */}
          {relatedProjects.length > 0 && (
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Related Solutions in This Sector</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedProjects.slice(0, 3).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectProject && onSelectProject(rel)}
                    className="p-3 border border-slate-200 rounded-lg hover:border-blue-500 cursor-pointer transition-all group bg-slate-50"
                  >
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                      {rel.name}
                    </div>
                    <div className="text-2xs text-slate-500 mt-1 line-clamp-1">
                      {rel.shortDescription}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom CTA Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Have questions about adapting this system to your team? We provide custom scopes and turn-key deployment.
          </div>
          <button
            onClick={() => onRequestCustomization(project)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors shadow-sm"
          >
            Request Quotation & Timeline
          </button>
        </div>

      </div>
    </div>
  );
};
