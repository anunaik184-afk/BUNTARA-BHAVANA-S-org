import React from 'react';
import { ExternalLink, Check, ShieldCheck, MapPin } from 'lucide-react';

interface AboutSectionProps {
  googleMapsUrl: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ googleMapsUrl }) => {
  return (
    <section id="about" className="py-20 sm:py-28 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#7B1113]">
              <span className="w-8 h-[1px] bg-[#7B1113]"></span>
              <span>Distinguished Venue in Bolwar</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 leading-tight">
              About Buntara Bhavana
            </h2>

            {/* Verified text strictly as specified */}
            <p className="text-base sm:text-lg text-stone-700 leading-relaxed font-normal">
              Buntara Bhavana Kombettu is an event and auditorium venue located in Sona Bazar, Bolwar, Puttur. The venue is suitable for hosting weddings, family functions, community gatherings, celebrations, conferences and other events.
            </p>

            <div className="pt-2 pb-2 space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1 bg-stone-100 rounded text-[#7B1113]">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stone-900">Prime Bolwar Location</h4>
                  <p className="text-xs text-stone-600">Easily accessible for guests traveling across Puttur, Mangaluru, and Dakshina Kannada.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 p-1 bg-stone-100 rounded text-[#7B1113]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stone-900">Community & Cultural Heritage</h4>
                  <p className="text-xs text-stone-600">A dignified auditorium atmosphere honoring cultural customs and family celebrations.</p>
                </div>
              </div>
            </div>

            {/* Direct Google Maps Directions Button */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#7B1113] hover:bg-[#5E0D0F] rounded-md shadow-sm transition-all duration-150 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#C5A059]" />
                <span>Get Directions</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 text-white/70" />
              </a>

              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-md transition-all duration-150 cursor-pointer"
              >
                <span>Contact Venue</span>
              </a>
            </div>
          </div>

          {/* Right Image Showcase Column */}
          <div className="lg:col-span-6">
            <div className="relative">
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-stone-200 shadow-xl bg-stone-100">
                <img
                  src="/src/assets/images/hall_grand_interior_1791002979481.jpg"
                  alt="Interior of Buntara Bhavana Kombettu Puttur"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Verified Venue badge card */}
              <div className="absolute -bottom-6 -left-6 sm:bottom-6 sm:-left-8 bg-white/95 backdrop-blur-md p-5 rounded-lg border border-stone-200 shadow-xl max-w-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                  Venue Notice
                </div>
                <p className="text-xs text-stone-700 leading-snug">
                  Official bookings are verified directly by venue committee management. Contact for specifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
