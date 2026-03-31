'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface SubmitAppModalProps {
  onClose: () => void;
}

export default function SubmitAppModal({ onClose }: SubmitAppModalProps) {
  const [appName, setAppName] = useState('');
  const [url, setUrl] = useState('');
  const [creator, setCreator] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [usage, setUsage] = useState('');
  const [impact, setImpact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [agreedToShare, setAgreedToShare] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    nameRef.current?.focus();
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/submit-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName, url, creator, role, description, usage, impact }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      setSubmitting(false);
    } catch {
      setError('Failed to submit. Please try again.');
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm text-playlab-blue placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const labelClass = "block text-sm font-medium text-playlab-blue mb-1";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200 rounded-t-xl">
          <h2 className="font-heading text-lg font-semibold text-playlab-blue">Submit Your App</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {submitted ? (
          /* Success state */
          <div className="px-6 py-12 text-center">
            <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-playlab-blue mb-2">App Submitted!</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
              Thank you for sharing your app with the community. Our team will review it and add it to the showcase.
            </p>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <p className="text-sm text-slate-500 leading-relaxed">
              Share your Playlab app with the community! Fill in the details below and our team will review it for the showcase.
            </p>

            {/* App Name */}
            <div>
              <label htmlFor="submit-name" className={labelClass}>
                App Name <span className="text-red-400">*</span>
              </label>
              <input
                ref={nameRef}
                id="submit-name"
                type="text"
                className={inputClass}
                placeholder="e.g. Algebra Tutor Bot"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                required
              />
            </div>

            {/* URL */}
            <div>
              <label htmlFor="submit-url" className={labelClass}>
                Playlab URL <span className="text-red-400">*</span>
              </label>
              <input
                id="submit-url"
                type="url"
                className={inputClass}
                placeholder="https://playlab.ai/project/your-app"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <p className="text-xs text-slate-400 mt-1">Must be a playlab.ai/project/ link</p>
            </div>

            {/* Creator + Role row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="submit-creator" className={labelClass}>
                  Your Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="submit-creator"
                  type="text"
                  className={inputClass}
                  placeholder="Jane Smith"
                  value={creator}
                  onChange={(e) => setCreator(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="submit-role" className={labelClass}>Role / Organization</label>
                <input
                  id="submit-role"
                  type="text"
                  className={inputClass}
                  placeholder="Teacher, Building 21"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="submit-desc" className={labelClass}>
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="submit-desc"
                className={inputClass}
                rows={3}
                placeholder="What does your app do? How does it help educators or students?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* How It's Being Used */}
            <div>
              <label htmlFor="submit-usage" className={labelClass}>How It&apos;s Being Used</label>
              <textarea
                id="submit-usage"
                className={inputClass}
                rows={2}
                placeholder="How are you or others using this app in practice?"
                value={usage}
                onChange={(e) => setUsage(e.target.value)}
              />
            </div>

            {/* Impact */}
            <div>
              <label htmlFor="submit-impact" className={labelClass}>Impact</label>
              <textarea
                id="submit-impact"
                className={inputClass}
                rows={2}
                placeholder="What difference has this app made?"
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
              />
            </div>

            {/* Consent checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToShare}
                onChange={(e) => setAgreedToShare(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-2 border-slate-300 text-primary focus:ring-primary/20"
                required
              />
              <span className="text-sm text-slate-600 leading-snug">
                I agree to share this app publicly on the Playlab Community Explore page. My name and app details will be visible to all visitors.
              </span>
            </label>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting || !agreedToShare}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
              >
                <Send size={14} />
                {submitting ? 'Submitting...' : 'Submit App for Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
