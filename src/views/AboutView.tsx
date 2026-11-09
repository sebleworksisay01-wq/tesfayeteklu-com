import React from 'react';
import { ShieldCheck, Award, Zap, Code2, Users, ArrowRight, Linkedin, Github, Twitter } from 'lucide-react';
import { CmsConfig } from '../types/cms';

interface AboutViewProps {
  onRequestProject: () => void;
  cms?: CmsConfig;
}

export const AboutView: React.FC<AboutViewProps> = ({ onRequestProject, cms }) => {
  const about = cms?.aboutUs;
  const team = (cms?.teamMembers || []).filter((m) => m.published !== false);

  const pillars = about?.corePillars && about.corePillars.length > 0
    ? about.corePillars
    : [
        { id: '1', title: 'Zero Vendor Lock-In', description: 'Clean code, open standards, and full repository ownership for every client.' },
        { id: '2', title: 'Speed & Performance First', description: 'Sub-second page loads, 60fps mobile interfaces, and optimized database queries.' },
        { id: '3', title: 'Type-Safe Architecture', description: 'TypeScript across the entire stack preventing bugs before they reach production.' },
      ];

  const techList = about?.technicalCapabilities && about.technicalCapabilities.length > 0
    ? about.technicalCapabilities
    : [
        { category: 'Front-End & Mobile', technologies: 'React 19, React Native, TypeScript, Tailwind CSS, Vite, Next.js' },
        { category: 'Back-End & APIs', technologies: 'Node.js, Express, Go, Python, RESTful Services, GraphQL, WebSockets' },
        { category: 'Databases & Storage', technologies: 'PostgreSQL, Redis, MySQL, Firestore, MongoDB, IndexedDB' },
        { category: 'Cloud & DevOps', technologies: 'Docker, Kubernetes, Google Cloud, AWS, CI/CD Actions, Cloudflare' },
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          {about?.badgeText || 'About TesfayeTech'}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {about?.title || 'Engineering High-Impact Digital Solutions for Growing Enterprises'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {about?.subtitle || 'TesfayeTech is a software development and digital transformation consultancy. We specialize in turning operational complexity into elegant, performant websites, native mobile applications, custom ERPs, and automated business platforms.'}
        </p>
      </div>

      {/* Narrative & Philosophy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {about?.companyStory ? (
            about.companyStory.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))
          ) : (
            <>
              <p>
                Founded on the principle that modern software should be an enduring asset rather than a source of continuous technical debt, TesfayeTech pairs rigorous full-stack engineering with human-centered product design.
              </p>
              <p>
                Whether helping an established logistics firm transition from paper manifests to real-time telemetry, or architecting a regional polyclinic network's telehealth application, our teams deliver solutions that are performant on day one and maintainable over decades.
              </p>
              <p>
                We believe in transparency: our prospective clients explore interactive working prototypes of our systems before signing scopes, and our clients receive 100% ownership of their source code, database architectures, and design tokens upon delivery.
              </p>
            </>
          )}

          {(about?.mission || about?.vision) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
              {about.mission && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 text-xs">Our Mission</div>
                  <div className="text-2xs text-slate-600 leading-relaxed">{about.mission}</div>
                </div>
              )}
              {about.vision && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 text-xs">Our Vision</div>
                  <div className="text-2xs text-slate-600 leading-relaxed">{about.vision}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="text-xs uppercase font-mono tracking-wider text-blue-400">Our Core Principles</div>
          <div className="space-y-3.5 text-xs">
            {pillars.map((pillar) => (
              <div key={pillar.id} className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">{pillar.title}:</strong>
                  <span className="text-slate-300">{pillar.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements / Milestones Grid */}
      {about?.achievements && about.achievements.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {about.achievements.map((ach) => (
            <div key={ach.id} className="p-5 bg-white border border-slate-200 rounded-2xl text-center shadow-xs space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono">{ach.metric}</div>
              <div className="text-xs text-slate-600 font-medium">{ach.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Team & Leadership Showcase */}
      {team.length > 0 && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900">Leadership & Principal Engineers</h2>
            <p className="text-xs text-slate-500">The software architects and system designers behind TesfayeTech</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="aspect-square bg-slate-100 overflow-hidden relative">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 text-blue-600 font-extrabold text-3xl">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-white text-3xs font-medium">
                      {member.department}
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h3 className="font-bold text-slate-900 text-sm">{member.name}</h3>
                    <p className="text-2xs font-semibold text-blue-600">{member.role}</p>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed pt-1">{member.bio}</p>
                  </div>
                </div>

                {member.socialLinks && (
                  <div className="px-4 pb-4 pt-1 flex items-center gap-3 text-slate-400">
                    {member.socialLinks.linkedin && (
                      <a href={member.socialLinks.linkedin} target="_blank" rel="noreferrer" className="hover:text-blue-600">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {member.socialLinks.github && (
                      <a href={member.socialLinks.github} target="_blank" rel="noreferrer" className="hover:text-slate-900">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {member.socialLinks.twitter && (
                      <a href={member.socialLinks.twitter} target="_blank" rel="noreferrer" className="hover:text-sky-500">
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engineering Capabilities */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-900">Our Technical Capabilities</h2>
          <p className="text-xs text-slate-500">Modern technologies we actively deploy in enterprise production</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {techList.map((item, idx) => (
            <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
              <div className="font-bold text-slate-900">{item.category}</div>
              <div className="text-slate-500">{item.technologies}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Ready to discuss your software roadmap?</h3>
          <p className="text-xs text-slate-600 mt-0.5">We review incoming briefs and respond with a technical assessment within 24 hours.</p>
        </div>
        <button
          onClick={onRequestProject}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer"
        >
          Request Project Consultation
        </button>
      </div>

    </div>
  );
};
