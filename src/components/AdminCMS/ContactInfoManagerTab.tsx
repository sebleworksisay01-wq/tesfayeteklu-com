import React, { useState } from 'react';
import { CmsConfig, GlobalSiteIdentity } from '../../types/cms';
import { 
  Save, Phone, Mail, MapPin, Clock, MessageSquare, 
  Sparkles, CheckCircle2, Globe, AlertCircle, ExternalLink
} from 'lucide-react';

interface ContactInfoManagerTabProps {
  cms: CmsConfig;
  onSaveCms: (partial: Partial<CmsConfig>, message?: string) => Promise<void>;
  saving: boolean;
}

export const ContactInfoManagerTab: React.FC<ContactInfoManagerTabProps> = ({
  cms,
  onSaveCms,
  saving,
}) => {
  const [identity, setIdentity] = useState<GlobalSiteIdentity>(cms.identity);

  const handleSave = async () => {
    await onSaveCms(
      {
        identity,
      },
      'Contact information successfully updated and published.'
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-2xs font-bold uppercase tracking-wider mb-1">
            <Phone className="w-3 h-3" />
            Module 10 &bull; Communication Channels
          </div>
          <h2 className="text-xl font-bold text-slate-900">Contact Information Management</h2>
          <p className="text-xs text-slate-500">
            Configure primary communications, business location, operating hours, and customer touchpoints.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Publishing...' : 'Publish Contact Info'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Direct Communication Channels */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            Direct Communication Channels
          </h3>

          <div>
            <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Official Inquiries Email *
            </label>
            <input
              type="email"
              value={identity.email || ''}
              onChange={(e) => setIdentity({ ...identity, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
              placeholder="info@tesfayeteklu.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Primary Phone *
              </label>
              <input
                type="text"
                value={identity.phone || ''}
                onChange={(e) => setIdentity({ ...identity, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                placeholder="+251-932083373"
              />
            </div>
            <div>
              <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                WhatsApp Business
              </label>
              <input
                type="text"
                value={identity.whatsapp || ''}
                onChange={(e) => setIdentity({ ...identity, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                placeholder="+251932083373"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Secondary / Office Phone
              </label>
              <input
                type="text"
                value={identity.secondaryPhone || ''}
                onChange={(e) => setIdentity({ ...identity, secondaryPhone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                placeholder="+251-11-..."
              />
            </div>
            <div>
              <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Emergency Hotline
              </label>
              <input
                type="text"
                value={identity.emergencyPhone || ''}
                onChange={(e) => setIdentity({ ...identity, emergencyPhone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                placeholder="+251-9..."
              />
            </div>
          </div>
        </div>

        {/* Physical Office & Hours */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Physical Headquarters & Location
          </h3>

          <div>
            <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Physical Street Address
            </label>
            <input
              type="text"
              value={identity.address || ''}
              onChange={(e) => setIdentity({ ...identity, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              placeholder="Bole Sub-City, Addis Ababa, Ethiopia"
            />
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Business Location / Region Description
            </label>
            <input
              type="text"
              value={identity.businessLocation || ''}
              onChange={(e) => setIdentity({ ...identity, businessLocation: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              placeholder="Addis Ababa, Ethiopia & Global Remote Delivery"
            />
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Business Hours & SLA Availability
            </label>
            <input
              type="text"
              value={identity.businessHours || ''}
              onChange={(e) => setIdentity({ ...identity, businessHours: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              placeholder="Monday - Friday: 8:30 AM - 5:30 PM EAT | 24/7 Incident Escalation"
            />
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Google Maps Embed or Place URL
            </label>
            <input
              type="url"
              value={identity.googleMapsUrl || ''}
              onChange={(e) => setIdentity({ ...identity, googleMapsUrl: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>

      </div>

    </div>
  );
};
