import React from 'react';
import { MapPin, ChevronDown, Calendar, Image as ImageIcon } from 'lucide-react';

interface HeroProps {
  onCheckAvailability: () => void;
  onViewGallery: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onCheckAvailability, onViewGallery }) => {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Measured Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_venue_facade_1791002966176.jpg"
          alt="Buntara Bhavana Kombettu Puttur Venue Facade"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Measured dark overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/35" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-24 sm:py-32">
        {/* Location Indicator */}
        <div className="inline-flex items-center gap-1.5 text-stone-200 text-xs sm:text-sm font-medium tracking-wide mb-6 bg-black/30 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/15">
          <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Sona Bazar, Bolwar, Puttur, Karnataka</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-white mb-6 leading-tight max-w-3xl mx-auto drop-shadow-sm">
          Celebrate Every Occasion at Buntara Bhavana
        </h1>

        {/* Subheading */}
        <p className="text-base sm:text-lg md:text-xl text-stone-200/90 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
          A distinguished event venue in Puttur for weddings, celebrations, gatherings, functions and special occasions.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={onCheckAvailability}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-[#7B1113] hover:bg-[#5E0D0F] border border-[#911b1d] rounded-md shadow-lg shadow-black/30 hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#C5A059]" />
            <span>Check Availability</span>
          </button>

          <button
            onClick={onViewGallery}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-stone-100 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/25 rounded-md transition-all duration-200 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-stone-300" />
            <span>View Gallery</span>
          </button>
        </div>
      </div>

      {/* Subtle Scroll Down Indicator */}
      <a
        href="#quick-info"
        aria-label="Scroll to details"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/70 hover:text-white flex flex-col items-center gap-1 transition-colors animate-bounce"
      >
        <span className="text-[11px] uppercase tracking-widest text-stone-300 font-medium">Explore</span>
        <ChevronDown className="w-4 h-4" />
      </a>
    </section>
  );
};
