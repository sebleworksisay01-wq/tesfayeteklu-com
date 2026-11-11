import React, { useState } from 'react';
import { GlobalSiteIdentity, ContactFormConfig, FaqItem } from '../types/cms';
import { submitInquiry, submitContactMessage } from '../services/api';
import { Mail, Phone, Clock, Send, CheckCircle, AlertCircle, HelpCircle, MessageCircle, FileText, SendHorizontal } from 'lucide-react';
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
  const [activeFormTab, setActiveFormTab] = useState<'inquiry' | 'contact'>('inquiry');

  // Project Inquiry Form State
  const [inquiryFullName, setInquiryFullName] = useState('');
  const [inquiryCompany, setInquiryCompany] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryCountry, setInquiryCountry] = useState('United States');
  const [inquiryService, setInquiryService] = useState('Web Application Development');
  const [inquiryIndustry, setInquiryIndustry] = useState('Professional and Consulting Services');
  const [inquiryDescription, setInquiryDescription] = useState('');
  const [inquiryBudget, setInquiryBudget] = useState('10,000 ETB - 50,000 ETB');
  const [inquiryTimeline, setInquiryTimeline] = useState('1 - 2 Months');
  const [inquiryContactMethod, setInquiryContactMethod] = useState<'Email' | 'Phone' | 'WhatsApp' | 'Video Call'>('Email');
  const [inquiryHoneypot, setInquiryHoneypot] = useState('');

  // General Contact Form State
  const [contactFullName, setContactFullName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactHoneypot, setContactHoneypot] = useState('');

  // Submission States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const solutionOptions = contactFormConfig?.solutionOptions || [
    'Website Design & Development',
    'Mobile Application Development',
    'Web Application Development',
    'Business Software & CMS',
    'UI/UX Product Design',
    'Payment Integration (Telebirr)',
    'IT Consulting & Support'
  ];

  const budgetOptions = contactFormConfig?.budgetOptions || [
    '10,000 ETB - 50,000 ETB',
    '50,000 ETB - 100,000 ETB',
    '100,000 ETB - 250,000 ETB',
    '250,000+ ETB',
    'Custom / Enterprise Budget'
  ];

  const timelineOptions = [
    'Urgent (< 2 Weeks)',
    '1 Month',
    '1 - 2 Months',
    '3 - 6 Months',
    'Flexible / Milestone-based'
  ];

  const contactMethods = contactFormConfig?.contactMethods || ['Email', 'Phone', 'WhatsApp', 'Video Call'];

  const validateEmail = (emailStr: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!inquiryFullName.trim() || !inquiryEmail.trim() || !inquiryDescription.trim()) {
      setError('Please fill in all required fields (Full Name, Email Address, and Project Description).');
      return;
    }
    if (!validateEmail(inquiryEmail.trim())) {
      setError('Please provide a valid email address so we can reply to you.');
      return;
    }

    setLoading(true);
    try {
      const res = await submitInquiry({
        fullName: inquiryFullName.trim(),
        companyName: inquiryCompany.trim(),
        email: inquiryEmail.trim(),
        phone: inquiryPhone.trim(),
        country: inquiryCountry.trim(),
        solutionType: inquiryService,
        serviceInterestedIn: inquiryService,
        industry: inquiryIndustry,
        projectDescription: inquiryDescription.trim(),
        budgetRange: inquiryBudget,
        projectBudget: inquiryBudget,
        projectTimeline: inquiryTimeline,
        expectedCompletionDate: inquiryTimeline,
        preferredContactMethod: inquiryContactMethod,
        botCatch: inquiryHoneypot
      });

      setSuccessMsg(res.message || 'Your project inquiry has been sent to admin@tesfayeteklu.com. We will reply within 24 hours.');
      // Reset form
      setInquiryFullName('');
      setInquiryCompany('');
      setInquiryEmail('');
      setInquiryPhone('');
      setInquiryDescription('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit inquiry';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!contactFullName.trim() || !contactEmail.trim() || !contactSubject.trim() || !contactMessage.trim()) {
      setError('Please fill in all required fields (Full Name, Email Address, Subject, and Message).');
      return;
    }
    if (!validateEmail(contactEmail.trim())) {
      setError('Please provide a valid email address so we can reply to you.');
      return;
    }

    setLoading(true);
    try {
      const res = await submitContactMessage({
        fullName: contactFullName.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim(),
        subject: contactSubject.trim(),
        message: contactMessage.trim(),
        honeypot: contactHoneypot
      });

      setSuccessMsg(res.message || 'Your message has been sent to admin@tesfayeteklu.com. Thank you for reaching out!');
      // Reset form
      setContactFullName('');
      setContactEmail('');
      setContactPhone('');
      setContactSubject('');
      setContactMessage('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const defaultFaqs = [
    {
      id: 'f1',
      q: 'How quickly will TesfayeTech respond to my inquiry?',
      a: 'A dedicated solutions architect reviews your requirements and responds with preliminary feedback within 24 business hours directly from admin@tesfayeteklu.com.',
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
      a: 'Yes. Every project includes warranty against bugs, followed by optional monthly SLA maintenance plans covering security patches, backups, and feature iterations.',
      published: true
    }
  ];

  const displayFaqs = faqs && faqs.length > 0 ? faqs.filter(f => f.published !== false) : defaultFaqs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Mail className="w-3.5 h-3.5" />
          <span>Get in Touch with TesfayeTech</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Let's Build Something Exceptional Together
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Whether you require a custom enterprise web application, mobile app development, Telebirr payment integration, or a high-converting corporate website, our engineering team is here to assist.
        </p>
      </div>

      {/* Main Grid: Form + Contact Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Contact Form Card with Tabs */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          
          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => { setActiveFormTab('inquiry'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeFormTab === 'inquiry'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Project Inquiry Form</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveFormTab('contact'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeFormTab === 'contact'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <SendHorizontal className="w-4 h-4 text-blue-600" />
              <span>Contact Us Form</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {successMsg ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Notification Sent Successfully</h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">{successMsg}</p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setSuccessMsg(null)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-all"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : activeFormTab === 'inquiry' ? (
              /* TAB 1: PROJECT INQUIRY FORM */
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Project Inquiry Form</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Fill out your project parameters below to receive a formal scope estimate and technical proposal from our engineering architects.
                  </p>
                </div>

                {error && (
                  <div className="p-3 mb-4 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  {/* Honeypot anti-spam field */}
                  <input
                    type="text"
                    name="bot_protection_field"
                    value={inquiryHoneypot}
                    onChange={(e) => setInquiryHoneypot(e.target.value)}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dawit Haile"
                        value={inquiryFullName}
                        onChange={(e) => setInquiryFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Addis Commercial Group"
                        value={inquiryCompany}
                        onChange={(e) => setInquiryCompany(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+251 91 123 4567"
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Service Interested In <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={inquiryService}
                        onChange={(e) => setInquiryService(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                      >
                        {solutionOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Industry Sector
                      </label>
                      <select
                        value={inquiryIndustry}
                        onChange={(e) => setInquiryIndustry(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                      >
                        {INDUSTRIES_LIST.map((ind) => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Project Budget
                      </label>
                      <select
                        value={inquiryBudget}
                        onChange={(e) => setInquiryBudget(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                      >
                        {budgetOptions.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Project Timeline
                      </label>
                      <select
                        value={inquiryTimeline}
                        onChange={(e) => setInquiryTimeline(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                      >
                        {timelineOptions.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Project Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe your project goals, required integrations (e.g. Telebirr, SMS, Cloud), user roles, or key features..."
                      value={inquiryDescription}
                      onChange={(e) => setInquiryDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Contact Channel</label>
                      <select
                        value={inquiryContactMethod}
                        onChange={(e) => setInquiryContactMethod(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
                      >
                        {contactMethods.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Country / Region</label>
                      <input
                        type="text"
                        value={inquiryCountry}
                        onChange={(e) => setInquiryCountry(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{loading ? 'Sending Inquiry to admin@tesfayeteklu.com...' : 'Submit Project Inquiry'}</span>
                    </button>
                    <p className="text-center text-2xs text-slate-400 mt-2">
                      Submissions are delivered directly to <span className="font-medium text-slate-600">admin@tesfayeteklu.com</span> via secure SMTP.
                    </p>
                  </div>
                </form>
              </div>
            ) : (
              /* TAB 2: CONTACT US FORM */
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Contact Us Form</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Have a general inquiry, consultation question, or collaboration proposal? Send a direct message to our executive inbox.
                  </p>
                </div>

                {error && (
                  <div className="p-3 mb-4 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {/* Honeypot anti-spam field */}
                  <input
                    type="text"
                    name="bot_protection_field"
                    value={contactHoneypot}
                    onChange={(e) => setContactHoneypot(e.target.value)}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={contactFullName}
                        onChange={(e) => setContactFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="your.email@example.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Software Architecture Consultation"
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="+251 91 123 4567"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Write your message or inquiry in detail..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{loading ? 'Sending Message to admin@tesfayeteklu.com...' : 'Send Message'}</span>
                    </button>
                    <p className="text-center text-2xs text-slate-400 mt-2">
                      Delivered directly to <span className="font-medium text-slate-600">admin@tesfayeteklu.com</span> with reply-to routing.
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Contact Details & FAQs */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
            <h3 className="text-lg font-bold">Contact Details</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block">General & Technical Inquiries:</span>
                  <a href="mailto:admin@tesfayeteklu.com" className="text-white hover:text-blue-300 font-medium transition-colors">
                    admin@tesfayeteklu.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block">Direct Line:</span>
                  <span className="text-white font-medium">{identity?.phone || '+251 91 100 0000'}</span>
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
