import React from 'react';
import { CalendarDays, MapPin, ClipboardList, PhoneCall } from 'lucide-react';

interface QuickInfoProps {
  phone: string;
  onEnquireClick: () => void;
}

export const QuickInfo: React.FC<QuickInfoProps> = ({ phone, onEnquireClick }) => {
  return (
    <section id="quick-info" className="relative -mt-10 sm:-mt-12 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Event Venue */}
        <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-[#FAF7F2] text-[#7B1113] rounded-md border border-stone-200">
              <CalendarDays className="w-5 h-5 text-[#7B1113]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059]">Premises</span>
              <h3 className="text-base font-serif font-bold text-stone-900">Event Venue</h3>
            </div>
          </div>
          <p className="text-sm text-stone-600 leading-snug">
            For weddings, functions and celebrations
          </p>
        </div>

        {/* Card 2: Convenient Location */}
        <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-[#FAF7F2] text-[#7B1113] rounded-md border border-stone-200">
              <MapPin className="w-5 h-5 text-[#7B1113]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059]">Puttur, Karnataka</span>
              <h3 className="text-base font-serif font-bold text-stone-900">Convenient Location</h3>
            </div>
          </div>
          <p className="text-sm text-stone-600 leading-snug">
            Sona Bazar, Bolwar, Puttur
          </p>
        </div>

        {/* Card 3: Booking Enquiry */}
        <div 
          onClick={onEnquireClick}
          className="bg-white rounded-lg p-6 border border-stone-200 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer hover:border-[#7B1113]/40 group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-[#FAF7F2] text-[#7B1113] rounded-md border border-stone-200 group-hover:bg-[#7B1113] group-hover:text-white transition-colors">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059]">Reservations</span>
              <h3 className="text-base font-serif font-bold text-stone-900 group-hover:text-[#7B1113] transition-colors">Booking Enquiry</h3>
            </div>
          </div>
          <p className="text-sm text-stone-600 leading-snug">
            Contact the venue for availability
          </p>
        </div>

        {/* Card 4: Call Us */}
        <a
          href={`tel:${phone.replace(/\s+/g, '')}`}
          className="bg-[#7B1113] text-white rounded-lg p-6 shadow-md hover:bg-[#5E0D0F] hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/10 rounded-md border border-white/20">
              <PhoneCall className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059]">Direct Committee Line</span>
              <h3 className="text-base font-serif font-bold text-white">Call Us</h3>
            </div>
          </div>
          <p className="text-base font-semibold tracking-wide text-white">
            {phone}
          </p>
        </a>
      </div>
    </section>
  );
};
