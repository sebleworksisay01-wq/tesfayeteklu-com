import React, { useState, useMemo } from 'react';
import { Project, SolutionType, DemoStatus } from '../types';
import { ProjectCard } from '../components/ProjectCard';
import { Search, Filter, RotateCcw, Play, CheckCircle2, ChevronDown } from 'lucide-react';
import { INDUSTRIES_LIST, SOLUTION_TYPES } from '../data/seedData';

interface PortfolioViewProps {
  projects: Project[];
  defaultSolutionType?: string;
  onViewDetails: (project: Project) => void;
  onLaunchDemo: (project: Project) => void;
  onRequestSimilar: (project: Project) => void;
  title?: string;
  description?: string;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  projects,
  defaultSolutionType = 'All',
  onViewDetails,
  onLaunchDemo,
  onRequestSimilar,
  title = 'Demo Marketplace & Solutions Portfolio',
  description = 'Explore interactive prototypes, enterprise web applications, and live digital products categorized by solution type and industry.'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSolution, setSelectedSolution] = useState<string>(defaultSolutionType);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'name'>('featured');

  // Multi-filtering logic
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Visibility
      if (project.published === false) return false;

      // Solution Type
      if (selectedSolution !== 'All' && project.solutionType !== selectedSolution) {
        return false;
      }

      // Industry
      if (selectedIndustry !== 'All' && !project.industries?.includes(selectedIndustry)) {
        return false;
      }

      // Demo Status
      if (selectedStatus !== 'All' && project.status !== selectedStatus) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = project.name.toLowerCase().includes(q);
        const inDesc = project.shortDescription.toLowerCase().includes(q);
        const inSub = project.subCategory.toLowerCase().includes(q);
        const inTech = project.technologies?.some((t) => t.toLowerCase().includes(q));
        const inFeat = project.keyFeatures?.some((f) => f.toLowerCase().includes(q));
        const inInd = project.industries?.some((ind) => ind.toLowerCase().includes(q));

        if (!inName && !inDesc && !inSub && !inTech && !inFeat && !inInd) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [projects, selectedSolution, selectedIndustry, selectedStatus, searchQuery, sortBy]);

  const hasActiveFilters = 
    selectedSolution !== 'All' || 
    selectedIndustry !== 'All' || 
    selectedStatus !== 'All' || 
    searchQuery.trim().length > 0;

  const handleClearFilters = () => {
    setSelectedSolution('All');
    setSelectedIndustry('All');
    setSelectedStatus('All');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Description */}
      <div className="max-w-3xl space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          TesfayeTech Demo Repository
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Filter Bar Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        
        {/* Row 1: Search & Solution Type Segmented Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Solution Type Functional Segmented Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto shrink-0">
            <button
              onClick={() => setSelectedSolution('All')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedSolution === 'All'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Solutions
            </button>
            <button
              onClick={() => setSelectedSolution('Website Design')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedSolution === 'Website Design'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Websites
            </button>
            <button
              onClick={() => setSelectedSolution('Mobile Application Development')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedSolution === 'Mobile Application Development'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mobile Apps
            </button>
            <button
              onClick={() => setSelectedSolution('Web Application Development')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedSolution === 'Web Application Development'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Web Applications & ERP
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by keyword, technology, or feature..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
          </div>

        </div>

        {/* Row 2: Secondary Dropdown Filters (Industry, Status, Sorting) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Industry Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Industry:</span>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
              >
                <option value="All">All 18 Industries</option>
                {INDUSTRIES_LIST.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="Live Demo">Live Demo</option>
                <option value="Interactive Prototype">Interactive Prototype</option>
                <option value="Production Project">Production Project</option>
                <option value="Concept">Concept</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors ml-2 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-500 font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Added</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

        </div>

      </div>

      {/* Projects Grid Display */}
      <div>
        <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
          <span>Showing <strong className="text-slate-800">{filteredProjects.length}</strong> solutions</span>
          {selectedSolution !== 'All' && <span>Category: {selectedSolution}</span>}
        </div>

        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No matching projects found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find any demos matching your filter combination. Try clearing your filters or searching with different keywords.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewDetails={onViewDetails}
                onLaunchDemo={onLaunchDemo}
                onRequestSimilar={onRequestSimilar}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
