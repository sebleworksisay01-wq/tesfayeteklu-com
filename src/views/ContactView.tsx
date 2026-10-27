import React, { useState } from 'react';
import { GlobalSiteIdentity, ContactFormConfig, FaqItem } from '../types/cms';
import { submitInquiry } from '../services/api';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle, HelpCircle, MessageCircle } from 'lucide-react';
import { INDUSTRIES_LIST } from '../data/seedData';

interface ContactViewProps {
  identity?: GlobalSiteIdentity;
  contactFormConfig?: ContactFormConfig;
  faqs?: FaqItem[];
}

export const ContactView: React.FC<ContactViewProps> = ({
  identity,
  contactFormConfig,
  faqs = []
}) => {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('United States');
  const [solutionType, setSolutionType] = useState('Web Application Development');
  const [industry, setIndustry] = useState('Professional and Consulting Services');
  const [projectDescription, setProjectDescription] = useState('');
  const [requiredFeatures, setRequiredFeatures] = useState('');
  const [budgetRange, setBudgetRange] = useState('$10,000 - $25,000');
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'Email' | 'Phone' | 'WhatsApp' | 'Video Call'>('Email');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const solutionOptions = contactFormConfig?.solutionOptions || [
    'Website Design',
    'Mobile Application Development',
    'Web Application Development',
    'Business Automation Systems',
    'UI/UX Product Design'
  ];

  const budgetOptions = contactFormConfig?.budgetOptions || [
    '$3,000 - $7,000 (Standard Website / Small MVP)',
    '$7,000 - $15,000 (Commercial Web / Mobile App)',
    '$15,000 - $35,000 (Enterprise Portal / Multi-platform)',
    '$35,000+ (Full Custom ERP / Large Scale)',
    'Flexible / Needs Estimation'
  ];

  const contactMethods = contactFormConfig?.contactMethods || ['Email', 'Phone', 'WhatsApp', 'Video Call'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !projectDescription.trim()) {
      setError('Please fill in all required fields (Name, Email, Description).');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await submitInquiry({
        fullName,
        companyName,
        email,
        phone,
        country,
        solutionType,
        industry,
        projectDescription,
        requiredFeatures,
        budgetRange,
        expectedCompletionDate,
        preferredContactMethod
      });
      setSuccessMsg(res.message);
      // Reset form
      setFullName('');
      setCompanyName('');
      setEmail('');
      setPhone('');
      setProjectDescription('');
      setRequiredFeatures('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit inquiry';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const defaultFaqs = [
    {
      id: 'f1',
      q: 'How quickly will TesfayeTech respond to my project inquiry?',
      a: 'A dedicated solutions architect reviews your requirements and responds with preliminary feedback within 24 business hours.',
      published: true
    },
    {
      id: 'f2',
      q: 'Who owns the intellectual property and code upon project completion?',
      a: 'You own 100% of all intellectual property, source code repositories, databases, design assets, and deployment keys upon final milestone payment.',
      published: true
    },
    {
      id: 'f3',
      q: 'Can we test an interactive demo before committing to full production?',
      a: 'Yes. We frequently develop rapid click-through prototypes or interactive sandbox environments so stakeholders can validate user workflows early.',
      published: true
    },
    {
      id: 'f4',
      q: 'Do you provide ongoing support and SLA maintenance after deployment?',
      a: 'Yes. Every project includes a 30-day warranty against bugs, followed by optional monthly SLA maintenance plans covering security patches, backups, and feature iterations.',
      published: true
    }
  ];

  const displayFaqs = faqs && faqs.length > 0 ? faqs.filter(f => f.published !== false) : defaultFaqs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          Get in Touch
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Let's Build Something Exceptional Together
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Whether you require a custom enterprise web application, mobile app development, or a high-converting corporate website, our engineering team is here to assist.
        </p>
      </div>

      {/* Main Grid: Form + Contact Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Col: Contact Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Project Inquiry Form</h2>
          <p className="text-xs text-slate-500 mb-6">Fill out your parameters below to receive a formal scope estimate and technical proposal.</p>

          {successMsg ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">Inquiry Logged</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">{successMsg}</p>
              <button
                onClick={() => setSuccessMsg(null)}
                className="mt-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {contactFormConfig?.fields?.fullName?.label || 'Your Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {contactFormConfig?.fields?.companyName?.label || 'Company / Organization'}
                  </label>
                  <input
                    type="text"
                    placeholder="Company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {contactFormConfig?.fields?.email?.label || 'Email Address'} *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {contactFormConfig?.fields?.phone?.label || 'Phone / WhatsApp'}
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 555 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {contactFormConfig?.fields?.solutionType?.label || 'Solution Category'}
                  </label>
                  <select
                    value={solutionType}
                    onChange={(e) => setSolutionType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    {solutionOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {contactFormConfig?.fields?.industry?.label || 'Industry Sector'}
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    {INDUSTRIES_LIST.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {contactFormConfig?.fields?.projectDescription?.label || 'Project Description & Needs'} *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize your operational context, existing tech, or target capabilities..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {contactFormConfig?.fields?.budgetRange?.label || 'Estimated Budget'}
                  </label>
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    {budgetOptions.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Channel</label>
                  <select
                    value={preferredContactMethod}
                    onChange={(e) => setPreferredContactMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    {contactMethods.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {contactFormConfig?.privacyConsentText && (
                <div className="text-2xs text-slate-500 pt-1">
                  {contactFormConfig.privacyConsentText}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Submitting to Backend...' : 'Submit Project Brief'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Col: Office Info & FAQs */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-5">
            <h3 className="text-lg font-bold">Contact Details</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block">General & Technical Inquiries:</span>
                  <span className="text-white font-medium">{identity?.email || 'contact@tesfayetech.com'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block">Direct Line:</span>
                  <span className="text-white font-medium">{identity?.phone || '+1 (800) 456-7890'}</span>
                </div>
              </div>

              {identity?.whatsapp && (
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block">WhatsApp Business:</span>
                    <span className="text-white font-medium">{identity.whatsapp}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block">Innovation Office:</span>
                  <span className="text-white font-medium">{identity?.address || 'Innovation Hub, Level 4, Tech Innovation Corridor'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block">Engineering Hours:</span>
                  <span className="text-white font-medium">Monday – Friday: 08:30 – 18:00 (UTC+3)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Frequently Asked Questions</span>
            </div>

            <div className="space-y-3">
              {displayFaqs.map((f) => (
                <div key={f.id} className="text-xs space-y-1">
                  <div className="font-bold text-slate-900">{f.q}</div>
                  <p className="text-slate-600 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
