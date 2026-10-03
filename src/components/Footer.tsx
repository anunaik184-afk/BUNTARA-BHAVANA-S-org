import React from 'react';
import { MapPin, Phone, Shield, ArrowUp } from 'lucide-react';

interface FooterProps {
  phone: string;
  address: string;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ phone, address, onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Brand & Introduction */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-bold text-white tracking-wide">
              BUNTARA BHAVANA
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Distinguished auditorium and community convention hall located in Sona Bazar, Bolwar, Puttur. Hosting weddings, cultural functions, family milestones and gatherings.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#C5A059] block mb-1">
                Local Event Venue
              </span>
              <p className="text-xs text-stone-400">Puttur, Dakshina Kannada, Karnataka</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <a href="#home" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About Venue
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-white transition-colors">
                  Photo Gallery
                </a>
              </li>
              <li>
                <a href="#facilities" className="hover:text-white transition-colors">
                  Venue Facilities
                </a>
              </li>
              <li>
                <a href="#availability" className="hover:text-white transition-colors">
                  Check Availability
                </a>
              </li>
              <li>
                <a href="#booking" className="hover:text-white transition-colors">
                  Booking Request
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact & Map
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Contact
            </h4>
            <div className="space-y-3 text-xs text-stone-400">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-stone-500 text-[11px]">Enquiry Phone</span>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-white hover:underline text-sm font-semibold">
                    {phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-stone-500 text-[11px]">Venue Location</span>
                  <p className="text-stone-300 leading-snug">{address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Administration & Guidelines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Venue Portal
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              All bookings and hall access are regulated by the venue administrative management.
            </p>

            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 hover:text-white border border-stone-700 rounded transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Admin Management Portal</span>
            </button>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 Buntara Bhavana Kombettu. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <span className="text-[11px] text-stone-500">Puttur, Dakshina Kannada – 574201</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-stone-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Back to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
