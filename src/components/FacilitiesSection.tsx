import React from 'react';
import { Facility } from '../types.ts';
import { Building2, Car, Utensils, CheckCircle2, DoorOpen, Sparkles, HelpCircle, Phone } from 'lucide-react';

interface FacilitiesSectionProps {
  facilities: Facility[];
  phone: string;
}

export const FacilitiesSection: React.FC<FacilitiesSectionProps> = ({ facilities, phone }) => {
  return (
    <section id="facilities" className="py-20 sm:py-28 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#7B1113] mb-3">
            <span className="w-8 h-[1px] bg-[#7B1113]"></span>
            <span>Premises & Amenities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4">
            Venue Facilities
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Essential venue spaces and arrangements available at Buntara Bhavana Kombettu. Unconfirmed capacity or equipment details are verified directly upon booking consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className="bg-[#FAF7F2] rounded-lg p-6 border border-stone-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white text-[#7B1113] rounded-md border border-stone-200 shadow-xs">
                    {renderIcon(fac.iconName)}
                  </div>
                  {fac.confirmed ? (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Verified
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      Contact for details
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-serif font-bold text-stone-900 mb-1.5">
                  {fac.name}
                </h3>
                {fac.tagline && (
                  <p className="text-xs font-medium text-[#C5A059] mb-2">{fac.tagline}</p>
                )}
                <p className="text-sm text-stone-600 leading-relaxed">{fac.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
                <span>Facility Inquiry</span>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="font-medium text-[#7B1113] hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" /> Call Management
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-5 bg-[#FAF7F2] rounded-lg border border-stone-200 text-center max-w-2xl mx-auto">
          <p className="text-xs text-stone-600 leading-relaxed">
            <strong className="text-stone-900 font-semibold">Important note on venue specifics:</strong> In adherence to authentic representation, exact air-conditioning specs, seating capacities, power generator backup load, and catering guidelines are provided directly by venue administration during booking discussions.
          </p>
        </div>
      </div>
    </section>
  );
};

function renderIcon(iconName: string) {
  switch (iconName) {
    case 'Building2':
      return <Building2 className="w-5 h-5" />;
    case 'Car':
      return <Car className="w-5 h-5" />;
    case 'Utensils':
      return <Utensils className="w-5 h-5" />;
    case 'DoorOpen':
      return <DoorOpen className="w-5 h-5" />;
    case 'Sparkles':
      return <Sparkles className="w-5 h-5" />;
    default:
      return <CheckCircle2 className="w-5 h-5" />;
  }
}
