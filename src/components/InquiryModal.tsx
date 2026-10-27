import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { submitInquiry } from '../services/api';
import { X, CheckCircle, Send, AlertCircle, Sparkles } from 'lucide-react';
import { INDUSTRIES_LIST } from '../data/seedData';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillProject?: Project | null;
  prefillService?: string;
  onSuccess?: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  prefillProject,
  prefillService,
  onSuccess
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
  const [successData, setSuccessData] = useState<{ message: string; inquiryId: string } | null>(null);

  useEffect(() => {
    if (prefillProject) {
      setSolutionType(prefillProject.solutionType);
      if (prefillProject.industries && prefillProject.industries.length > 0) {
        setIndustry(prefillProject.industries[0]);
      }
      setProjectDescription(`We are interested in a customized solution similar to "${prefillProject.name}". Our requirements include adapted workflows for our team.`);
      setRequiredFeatures(prefillProject.keyFeatures.slice(0, 3).join(', '));
    } else if (prefillService) {
      setSolutionType('Custom Solution');
      setProjectDescription(`Requesting formal quotation and feasibility discovery for ${prefillService}.`);
    }
  }, [prefillProject, prefillService, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setError('Please provide a valid corporate or personal email address.');
      return;
    }
    if (!projectDescription.trim()) {
      setError('Please provide a brief description of your project objectives.');
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
        preferredContactMethod,
        relatedProjectId: prefillProject?.id,
      });

      setSuccessData({ message: res.message, inquiryId: res.inquiryId });
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit inquiry';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessData(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">TesfayeTech Solutions</span>
            <h2 className="text-xl font-bold tracking-tight mt-0.5">
              {prefillProject ? `Request Customization: ${prefillProject.name}` : 'Request a Project Consultation'}
            </h2>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 max-h-[75vh] overflow-y-auto">
          {successData ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Inquiry Logged Successfully</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {successData.message}
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 max-w-sm mx-auto font-mono">
                Tracking Reference: {successData.inquiryId}
              </div>
              <div className="pt-4">
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Return to Portfolio
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Row 1: Full Name & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Yohannes"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Logistics Group"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 555 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Row 3: Solution Type & Industry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Solution Category
                  </label>
                  <select
                    value={solutionType}
                    onChange={(e) => setSolutionType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  >
                    <option value="Website Design">Website Design & Development</option>
                    <option value="Mobile Application Development">Mobile Application (iOS / Android)</option>
                    <option value="Web Application Development">Web Application / ERP / CRM</option>
                    <option value="Business Automation Systems">Business Automation Systems</option>
                    <option value="UI/UX Product Design">UI/UX Product Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  >
                    {INDUSTRIES_LIST.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Description & Key Objectives <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your current operations, user audience, pain points, or target requirements..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              {/* Required Features */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Features or Third-Party Integrations
                </label>
                <input
                  type="text"
                  placeholder="e.g. Telehealth video, Stripe & Telebirr payments, multi-branch inventory, push alerts"
                  value={requiredFeatures}
                  onChange={(e) => setRequiredFeatures(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              {/* Budget Range & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Budget Range
                  </label>
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  >
                    <option value="$3,000 - $7,000">$3,000 - $7,000 (Standard Website / Small MVP)</option>
                    <option value="$7,000 - $15,000">$7,000 - $15,000 (Commercial Web / Mobile App)</option>
                    <option value="$15,000 - $35,000">$15,000 - $35,000 (Enterprise Portal / Multi-platform)</option>
                    <option value="$35,000+">$35,000+ (Full Custom ERP / Large Scale)</option>
                    <option value="Flexible / Needs Estimation">Flexible / Needs Estimation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Launch Date
                  </label>
                  <input
                    type="date"
                    value={expectedCompletionDate}
                    onChange={(e) => setExpectedCompletionDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Preferred Contact Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Follow-up Channel
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Email', 'Phone', 'WhatsApp', 'Video Call'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPreferredContactMethod(method)}
                      className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                        preferredContactMethod === method
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-all"
                >
                  {loading ? (
                    <span>Submitting to Backend...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Project Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
