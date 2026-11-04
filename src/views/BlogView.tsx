import React, { useState } from 'react';
import { BlogArticle } from '../types/cms';
import { Search, Calendar, Clock, Tag, ArrowRight, BookOpen, Share2 } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

interface BlogViewProps {
  articles: BlogArticle[];
  onSelectArticle: (article: BlogArticle) => void;
  onRequestProject: () => void;
}

export const BlogView: React.FC<BlogViewProps> = ({
  articles,
  onSelectArticle,
  onRequestProject
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const publishedArticles = (articles || []).filter((a) => a.published);

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(publishedArticles.map((a) => a.category).filter(Boolean)))];

  const filteredArticles = publishedArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.tags || []).some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticle = publishedArticles.find((a) => a.featured) || publishedArticles[0];
  const regularArticles = filteredArticles.filter((a) => a.id !== featuredArticle?.id || searchTerm || selectedCategory !== 'All');

  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead
        title="TesfayeTech Engineering Blog | Tech Trends & Ethiopian Digital Economy"
        description="In-depth engineering articles, fintech architecture guides, Telebirr integration tutorials, and digital transformation playbooks for businesses in Ethiopia and East Africa."
        keywords="Ethiopian Tech Blog, Software Engineering Insights, Telebirr Developer Guide, ERP in Ethiopia, Addis Ababa Tech News"
        canonicalPath="/blog"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Tech Blog & Insights', url: '/blog' }
        ]}
      />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white pt-14 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Engineering Insights & Technology Playbooks</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight max-w-4xl mx-auto mb-4">
            TesfayeTech <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Engineering Blog</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Architectural blueprints, fintech payment guides, and software strategy engineered to accelerate organizations across Ethiopia and East Africa.
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles by title, topic, or technology..."
              className="w-full pl-11 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Article (Hero Spotlight) - Only shown when not searching and category is All */}
        {featuredArticle && !searchTerm && selectedCategory === 'All' && (
          <div className="mb-12">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Featured Blueprint</div>
            <div 
              onClick={() => onSelectArticle(featuredArticle)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer grid grid-cols-1 lg:grid-cols-12 group"
            >
              <div className="lg:col-span-7 h-64 sm:h-80 lg:h-auto relative overflow-hidden bg-slate-900">
                <img
                  src={featuredArticle.coverImage}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="eager"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-md">
                    {featuredArticle.category}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {featuredArticle.publishedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {featuredArticle.readingTime}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-3 leading-snug">
                    {featuredArticle.title}
                  </h2>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-6">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{featuredArticle.author}</div>
                      <div className="text-[11px] text-slate-500">{featuredArticle.authorRole}</div>
                    </div>
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Articles Grid */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              {searchTerm ? `Search Results for "${searchTerm}"` : selectedCategory !== 'All' ? `${selectedCategory} Articles` : 'Latest Articles'}
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredArticles.length} article{filteredArticles.length === 1 ? '' : 's'}
            </span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No articles found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                We couldn't find any articles matching your search query. Try searching for different keywords or explore other categories.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Clear search filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  onClick={() => onSelectArticle(article)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer flex flex-col group"
                >
                  <div className="h-48 relative overflow-hidden bg-slate-900">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold rounded-full border border-white/20">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-2.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {article.publishedDate}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {article.readingTime}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 leading-snug">
                        {article.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>

                    <div>
                      {/* Tags */}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {article.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5 text-slate-400" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                        <span className="text-[11px] text-slate-600">{article.author}</span>
                        <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Read more <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Technical Consultation CTA Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">Need Custom Software?</div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Engineer Your Digital Solution with Addis Ababa's Leading Tech Team
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
              From enterprise ERP platforms with local tax compliance to high-converting Telebirr e-commerce stores and mobile apps, our senior architects turn your business requirements into reliable software.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onRequestProject}
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Schedule Technical Consultation →
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
