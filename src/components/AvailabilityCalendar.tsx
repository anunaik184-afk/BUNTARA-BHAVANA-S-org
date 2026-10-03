import React, { useState } from 'react';
import { AvailabilityData } from '../types.ts';
import { ChevronLeft, ChevronRight, CalendarCheck, Clock, AlertCircle, ArrowRight } from 'lucide-react';

interface AvailabilityCalendarProps {
  availabilityData: AvailabilityData | null;
  onSelectDate: (dateStr: string) => void;
  selectedDate: string;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availabilityData,
  onSelectDate,
  selectedDate,
}) => {
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth()); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Days calculations
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const formatDateStr = (day: number) => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${currentYear}-${mm}-${dd}`;
  };

  const getDateStatus = (dateStr: string): { status: 'AVAILABLE' | 'PENDING' | 'BOOKED'; details?: any } => {
    if (!availabilityData || !availabilityData.availability) {
      return { status: 'AVAILABLE' };
    }
    const info = availabilityData.availability[dateStr];
    if (!info) {
      return { status: 'AVAILABLE' };
    }
    if (info.status === 'Confirmed') {
      return { status: 'BOOKED', details: info };
    }
    return { status: 'PENDING', details: info };
  };

  const selectedDateInfo = selectedDate ? getDateStatus(selectedDate) : null;

  return (
    <section id="availability" className="py-20 sm:py-28 bg-[#FAF7F2] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#7B1113] mb-3">
            <CalendarCheck className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Real-Time Calendar</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4">
            Venue Availability
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Check open dates for auspicious muhurthams, weekend ceremonies, or conference schedules. Click any available or pending date to begin your booking enquiry.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-xs font-medium text-stone-700">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 border border-emerald-500 inline-block"></span>
            <span>Available Date</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-100 border border-amber-500 inline-block"></span>
            <span>Pending Enquiry</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#7B1113] border border-[#5E0D0F] inline-block"></span>
            <span>Booked (Confirmed)</span>
          </div>
        </div>

        {/* Calendar Card and Details Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Calendar Grid Container */}
          <div className="lg:col-span-8 bg-white rounded-lg p-6 sm:p-8 border border-stone-200 shadow-md">
            {/* Calendar Month Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md border border-stone-200 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md border border-stone-200 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Day of Week Header */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-stone-500 tracking-wider">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
              {blankDays.map((_, idx) => (
                <div key={`blank-${idx}`} className="h-14 sm:h-16 rounded-md bg-stone-50/50" />
              ))}

              {daysArray.map((day) => {
                const dateStr = formatDateStr(day);
                const { status } = getDateStatus(dateStr);
                const isSelected = selectedDate === dateStr;

                let stateClasses = 'bg-[#FAF7F2] text-stone-800 hover:border-emerald-400 border border-stone-200';
                let indicator = <span className="text-[10px] text-emerald-700 font-medium">Available</span>;

                if (status === 'BOOKED') {
                  stateClasses = 'bg-[#7B1113]/10 border border-[#7B1113]/30 text-[#7B1113] hover:border-[#7B1113]';
                  indicator = <span className="text-[9px] sm:text-[10px] text-[#7B1113] font-bold">Booked</span>;
                } else if (status === 'PENDING') {
                  stateClasses = 'bg-amber-50 border border-amber-300 text-amber-900 hover:border-amber-400';
                  indicator = <span className="text-[9px] sm:text-[10px] text-amber-700 font-semibold">Pending</span>;
                }

                if (isSelected) {
                  stateClasses += ' ring-2 ring-[#7B1113] ring-offset-2 font-bold shadow-sm';
                }

                return (
                  <button
                    key={day}
                    onClick={() => onSelectDate(dateStr)}
                    className={`h-14 sm:h-16 p-1.5 sm:p-2 rounded-md flex flex-col justify-between items-start text-left transition-all cursor-pointer ${stateClasses}`}
                  >
                    <span className="text-sm font-semibold tabular-nums leading-none">
                      {day}
                    </span>
                    <div className="w-full truncate">{indicator}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Insight Card */}
          <div className="lg:col-span-4 bg-white rounded-lg p-6 border border-stone-200 shadow-md flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                Selected Date Insight
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-4">
                {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Select a date on the calendar'}
              </h3>

              {selectedDate ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-md border flex items-center gap-3 bg-[#FAF7F2]">
                    <Clock className="w-5 h-5 text-[#7B1113] shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-stone-900">
                        Status:{' '}
                        <span
                          className={
                            selectedDateInfo?.status === 'BOOKED'
                              ? 'text-[#7B1113] font-bold'
                              : selectedDateInfo?.status === 'PENDING'
                              ? 'text-amber-700 font-bold'
                              : 'text-emerald-700 font-bold'
                          }
                        >
                          {selectedDateInfo?.status || 'AVAILABLE'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">
                        {selectedDateInfo?.status === 'BOOKED'
                          ? 'This date is already reserved for a confirmed function.'
                          : selectedDateInfo?.status === 'PENDING'
                          ? 'An enquiry is currently pending committee review. Alternative slots may be open.'
                          : 'Open for weddings, receptions, and gatherings.'}
                      </p>
                    </div>
                  </div>

                  {selectedDateInfo?.status === 'BOOKED' ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>
                        Confirmed dates cannot accept duplicate reservations. You may browse adjacent dates or call management at +91 96869 47433 for enquiries.
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Ready to reserve this date? Proceed directly to our multi-step booking request form.
                      </p>
                      <a
                        href="#booking"
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#7B1113] hover:bg-[#5E0D0F] text-white text-xs font-bold uppercase tracking-wider rounded-md transition-colors"
                      >
                        <span>Proceed to Booking</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-stone-500 leading-relaxed">
                  Click on any day in the calendar to inspect slot availability or lock in your event date.
                </p>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
              <span>Mode: {availabilityData?.bookingMode === 'full_day' ? 'Full-Day Reservation' : 'Flexible Time-Slots'}</span>
              <a href="#contact" className="text-[#7B1113] font-medium hover:underline">
                Contact Committee
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
