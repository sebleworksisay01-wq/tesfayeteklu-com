import React, { useState } from 'react';
import { BlogArticle } from '../types/cms';
import { Calendar, Clock, Tag, ArrowLeft, Share2, Check, Linkedin, Twitter, MessageCircle, ChevronRight, User } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

interface BlogPostViewProps {
  article: BlogArticle;
  allArticles: BlogArticle[];
  onBackToBlog: () => void;
  onSelectArticle: (article: BlogArticle) => void;
  onRequestProject: () => void;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({
  article,
  allArticles,
  onBackToBlog,
  onSelectArticle,
  onRequestProject
}) => {
  const [copied, setCopied] = useState(false);

  const articleUrl = `https://tesfayeteklu.com/blog/${article.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.title)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${article.title} - ${articleUrl}`)}`, '_blank');
  };

  const relatedArticles = (allArticles || [])
    .filter((a) => a.id !== article.id && a.published)
    .slice(0, 3);

  // Render paragraphs and markdown headings
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-4" />;
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xl sm:text-2xl font-bold text-slate-900 mt-8 mb-3 tracking-tight">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-10 mb-4 tracking-tight border-b border-slate-100 pb-2">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('- ')) {
        return (
          <li key={idx} className="text-slate-700 text-sm sm:text-base leading-relaxed ml-5 list-disc mb-2">
            {trimmed.replace('- ', '')}
          </li>
        );
      }
      if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ')) {
        return (
          <div key={idx} className="text-slate-700 text-sm sm:text-base leading-relaxed ml-4 mb-2 font-medium">
            {trimmed}
          </div>
        );
      }
      return (
        <p key={idx} className="text-slate-700 text-sm sm:text-base leading-relaxed mb-4">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead
        title={article.seoTitle || `${article.title} | TesfayeTech`}
        description={article.seoDescription || article.excerpt}
        canonicalPath={`/blog/${article.slug}`}
        ogImage={article.coverImage}
        ogType="article"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: article.title, url: `/blog/${article.slug}` }
        ]}
        articleData={{
          headline: article.title,
          description: article.excerpt,
          datePublished: article.publishedDate,
          author: article.author,
          image: article.coverImage,
          category: article.category
        }}
      />

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap" aria-label="Breadcrumb">
            <button
              onClick={onBackToBlog}
              className="hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Blog</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-slate-400">Blog</span>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-semibold truncate max-w-xs">{article.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Article Container */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        {/* Article Meta Header */}
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider mb-4">
            {article.category}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {article.author.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">{article.author}</div>
                <div className="text-slate-500 text-[11px]">{article.authorRole}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                {article.publishedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                {article.readingTime}
              </span>
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 mb-10 bg-slate-900 max-h-[480px]">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>

        {/* Lead Excerpt */}
        <div className="bg-blue-50/70 border-l-4 border-blue-600 p-5 rounded-r-xl mb-8">
          <p className="text-slate-800 text-sm sm:text-base font-medium leading-relaxed italic">
            "{article.excerpt}"
          </p>
        </div>

        {/* Formatted Article Body */}
        <div className="prose prose-slate max-w-none mb-12">
          {renderFormattedContent(article.content)}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-200 mb-10">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Tags:
            </span>
            {article.tags.map((tag) => (
              <span key={tag} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Social Share Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-12 shadow-xs">
          <div>
            <div className="text-xs font-bold text-slate-900 mb-0.5">Share this engineering article</div>
            <div className="text-[11px] text-slate-500">Spread knowledge across the Ethiopian tech community</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>
            <button
              onClick={handleShareLinkedIn}
              className="p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
              title="Share on LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareTwitter}
              className="p-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Share on X / Twitter"
            >
              <Twitter className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
              title="Share via WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Author Bio Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex items-start gap-4 mb-12 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
            {article.author.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 mb-1">{article.author}</div>
            <div className="text-xs text-blue-600 font-semibold mb-2">{article.authorRole} at TesfayeTech</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Specializing in enterprise ERP architectures, fintech payment integrations, and high-concurrency web systems engineered for African businesses and multinational corporations.
            </p>
          </div>
        </div>

        {/* Schedule Project CTA Card */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl mb-14">
          <div className="relative z-10">
            <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">Ready to Build?</div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Turn These Best Practices Into Real Software For Your Organization
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 max-w-xl">
              Get in touch with TesfayeTech's senior engineering team to design, build, and deploy your custom website, mobile app, or enterprise system.
            </p>
            <button
              onClick={onRequestProject}
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Request a Project Consultation →
            </button>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">Related Engineering Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    onSelectArticle(rel);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-4 cursor-pointer group shadow-2xs hover:shadow-md transition-all"
                >
                  <div className="h-32 rounded-lg overflow-hidden mb-3 bg-slate-900">
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-[11px] font-semibold text-blue-600 mb-1">{rel.category}</div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                    {rel.title}
                  </h4>
                  <div className="text-[10px] text-slate-400">{rel.readingTime}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </article>
    </div>
  );
};
