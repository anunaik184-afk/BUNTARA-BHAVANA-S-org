import React from 'react';
import { EventTypeItem } from '../types.ts';
import { Sparkles, CalendarPlus } from 'lucide-react';

interface EventTypesSectionProps {
  eventTypes: EventTypeItem[];
  onSelectEventType: (type: string) => void;
}

export const EventTypesSection: React.FC<EventTypesSectionProps> = ({ eventTypes, onSelectEventType }) => {
  return (
    <section id="events" className="py-20 sm:py-28 bg-white border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#7B1113] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Versatile Venue Capacities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4">
            Suitable Event Occasions
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Buntara Bhavana Kombettu provides an expansive, dignified setting for traditional, institutional, and personal celebrations. Select your occasion to enquire or begin a booking request.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {eventTypes.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectEventType(item.title)}
              className="group bg-[#FAF7F2] hover:bg-white rounded-lg p-6 border border-stone-200 hover:border-[#7B1113]/40 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl" role="img" aria-label={item.title}>
                    {getEmojiForType(item.title)}
                  </span>
                  <span className="text-[11px] font-medium text-[#7B1113] bg-[#7B1113]/10 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Book This <CalendarPlus className="w-3 h-3 inline" />
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold text-stone-900 mb-1.5 group-hover:text-[#7B1113] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs font-medium text-[#C5A059] mb-2">{item.tagline}</p>
                <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200/70 flex items-center justify-between text-xs text-stone-500">
                <span>Auditorium & Dining</span>
                <span className="font-semibold text-[#7B1113] group-hover:underline">Enquire Date →</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-stone-500">
            Note: Listed event types indicate appropriate venue utility. Please contact venue administration for specific staging, electrical, or ceremony guidelines.
          </p>
        </div>
      </div>
    </section>
  );
};

function getEmojiForType(title: string): string {
  switch (title.toLowerCase()) {
    case 'weddings':
      return '💍';
    case 'receptions':
      return '🎉';
    case 'family functions':
      return '👨‍👩‍👧';
    case 'college / academic events':
      return '🎓';
    case 'conferences & seminars':
    case 'conferences':
      return '🏢';
    case 'cultural programs':
      return '🎭';
    case 'celebrations':
      return '🎂';
    case 'community events':
      return '🤝';
    default:
      return '✨';
  }
}
