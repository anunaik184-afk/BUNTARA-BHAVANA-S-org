import React, { useState } from 'react';
import { VenueSettings } from '../types.ts';
import { api } from '../services/api.ts';
import { MapPin, Phone, Mail, Clock, Send, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';

interface ContactSectionProps {
  settings: VenueSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError('Please provide Name, Phone Number, and your Enquiry message.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.sendContactMessage({ name, phone, email, message });
      setSuccess(true);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to send enquiry. Please call us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-28 bg-[#FAF7F2] border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#7B1113] mb-3">
            <span className="w-8 h-[1px] bg-[#7B1113]"></span>
            <span>Get in Touch</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4">
            Contact & Location
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Reach out to our committee administration for availability enquiries, hall visits, and event bookings in Bolwar, Puttur.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Contact Information & Hours Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-lg p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <h3 className="text-2xl font-serif font-bold text-stone-900 border-b border-stone-100 pb-4">
                {settings.businessName}
              </h3>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-[#FAF7F2] text-[#7B1113] rounded-md border border-stone-200 mt-1">
                  <MapPin className="w-5 h-5 text-[#7B1113]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Address
                  </h4>
                  <p className="text-sm text-stone-800 leading-snug">
                    {settings.address}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-[#FAF7F2] text-[#7B1113] rounded-md border border-stone-200 mt-1">
                  <Phone className="w-5 h-5 text-[#7B1113]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Direct Phone Line
                  </h4>
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                    className="text-base font-semibold text-[#7B1113] hover:underline"
                  >
                    {settings.phone}
                  </a>
                </div>
              </div>

              {/* Opening Hours strictly as specified */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-[#FAF7F2] text-[#7B1113] rounded-md border border-stone-200 mt-1">
                  <Clock className="w-5 h-5 text-[#7B1113]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Operating Timings
                  </h4>
                  <p className="text-sm text-stone-800">
                    {settings.timingsNote}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-3">
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7B1113] hover:bg-[#5E0D0F] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-[#C5A059]" />
                  <span>Call Now</span>
                </a>

                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#7B1113]" />
                  <span>Get Directions</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </div>
            </div>

            {/* Google Maps Embed Container */}
            <div className="bg-white rounded-lg overflow-hidden border border-stone-200 shadow-sm">
              <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                  Location on Google Maps
                </span>
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#7B1113] font-semibold hover:underline inline-flex items-center gap-1"
                >
                  Open in Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="h-64 w-full bg-stone-100">
                <iframe
                  title="Buntara Bhavana Kombettu Puttur Map"
                  src="https://maps.google.com/maps?q=Buntara%20Bhavana%20Kombettu%20Puttur,Dakshina%20Kannada&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="lg:col-span-7 bg-white rounded-lg p-6 sm:p-8 border border-stone-200 shadow-sm">
            <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">
              Send an Enquiry
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mb-6">
              Have questions regarding function hall dates, catering areas, or decor guidelines? Fill out this enquiry form and our management will respond promptly.
            </p>

            {success ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-serif font-bold text-emerald-900">Enquiry Received</h4>
                <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
                  Thank you! Your message has been routed to the venue management committee. We will contact you at your provided phone number.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="mt-2 text-xs font-semibold text-emerald-900 underline cursor-pointer"
                >
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Shetty"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:border-[#7B1113] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 96869 47433"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:border-[#7B1113] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:border-[#7B1113] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Your Message / Query <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your event date, expected guests, or specific enquiries..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:border-[#7B1113] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-[#7B1113] hover:bg-[#5E0D0F] text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-[#C5A059]" />
                  <span>{loading ? 'Sending Enquiry...' : 'Send Enquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
