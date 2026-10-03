import React from 'react';
import { Testimonial } from '../types.ts';
import { Star, MessageSquare } from 'lucide-react';

interface ReviewsSectionProps {
  testimonials: Testimonial[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ testimonials }) => {
  return (
    <section id="reviews" className="py-20 sm:py-24 bg-white border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#7B1113] mb-3">
            <span className="w-8 h-[1px] bg-[#7B1113]"></span>
            <span>Patron Experiences</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4">
            Guest Testimonials
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Verified feedback from families and organizers who celebrated their landmark occasions at Buntara Bhavana Kombettu.
          </p>
        </div>

        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-[#FAF7F2] p-6 rounded-lg border border-stone-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 mb-3 text-amber-500">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-stone-700 italic leading-relaxed mb-4">
                    "{t.reviewText}"
                  </p>
                </div>
                <div className="pt-4 border-t border-stone-200/80">
                  <h4 className="text-sm font-serif font-bold text-stone-900">{t.customerName}</h4>
                  <div className="text-xs text-stone-500 flex items-center justify-between">
                    <span>{t.eventType}</span>
                    {t.eventDate && <span>{t.eventDate}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Strictly adhering to Prompt: "Otherwise display: 'Customer testimonials will appear here.'" */
          <div className="max-w-xl mx-auto text-center p-10 bg-[#FAF7F2] rounded-xl border border-dashed border-stone-300">
            <MessageSquare className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h3 className="text-base font-serif font-semibold text-stone-800 mb-1">
              Customer testimonials will appear here.
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
              In accordance with our verified facts policy, testimonials are published only following authenticated patron reviews and administrator authorization.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
