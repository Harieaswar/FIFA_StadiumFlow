import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, Phone, Mail, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

const FAQ = [
  { q: 'What is StadiumFlow AI?', a: 'StadiumFlow AI is an intelligent stadium operations platform for FIFA World Cup 2026. It uses Google Gemini AI to help fans, staff, and organizers manage stadium navigation, crowd control, transportation, and emergency response.' },
  { q: 'How does FlowBot work?', a: 'FlowBot is powered by Google Gemini AI. In demo mode, it uses realistic pre-programmed responses. With a real Gemini API key, it provides live AI-powered answers about navigation, transport, and stadium operations.' },
  { q: 'Is the emergency reporting real?', a: 'No. This application runs in Demo Mode. Emergency reports are saved locally and do NOT contact real emergency services. For real emergencies, always call 911 and alert stadium marshals.' },
  { q: 'How do I change my accessibility settings?', a: 'Go to the Accessibility Centre in the sidebar. You can adjust font size, enable high contrast mode, reduce motion, and enable dyslexia-friendly fonts. Settings are saved automatically.' },
  { q: 'What demo accounts are available?', a: 'Fan: fan@stadiumflow.demo, Volunteer: volunteer@stadiumflow.demo, Staff: staff@stadiumflow.demo, Admin: admin@stadiumflow.demo. Any password works in demo mode.' },
  { q: 'How do I report a real incident?', a: 'Use the Emergency Support page to submit an incident report. For life-threatening emergencies, call 911 immediately. The incident report will notify the operations dashboard.' },
  { q: 'Can I use this on mobile?', a: 'Yes! StadiumFlow AI is fully responsive and works on desktop, tablet, and mobile. The sidebar collapses to a drawer on smaller screens.' },
];

export default function HelpSupport() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="section-header">Help & Support</h1>
      <p className="section-subheader">Frequently asked questions and support contacts</p>

      {/* FAQ */}
      <div className="card overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-200">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-slate-800">
          {FAQ.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-slate-800/30 transition-colors"
                aria-expanded={expanded === i}
                aria-controls={`faq-${i}`}
              >
                <span className="text-sm font-medium text-slate-200">{faq.q}</span>
                {expanded === i ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
              </button>
              {expanded === i && (
                <div id={`faq-${i}`} className="px-4 pb-4">
                  <p className="text-sm text-slate-400">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-slate-200 mb-4">Contact Support</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Phone, label: 'Emergency', value: '911', sub: 'Life-threatening', color: 'text-red-400' },
            { icon: Phone, label: 'Stadium Ops', value: '+1 (555) 0100', sub: 'Non-emergency', color: 'text-blue-400' },
            { icon: Mail, label: 'Email Support', value: 'support@stadiumflow.ai', sub: 'Response in 24h', color: 'text-teal-400' },
          ].map(c => (
            <div key={c.label} className="p-3 bg-slate-800/50 rounded-xl">
              <c.icon size={16} className={clsx('mb-2', c.color)} />
              <p className="text-xs text-slate-500">{c.label}</p>
              <p className={clsx('text-sm font-semibold', c.color)}>{c.value}</p>
              <p className="text-xs text-slate-600">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
