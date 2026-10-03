import React, { useState, useEffect } from 'react';
import { Booking } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Check, ChevronRight, ChevronLeft, Calendar, Clock, User, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface BookingFormProps {
  initialDate?: string;
  initialEventType?: string;
  onBookingCreated: (booking: Booking) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  initialDate = '',
  initialEventType = '',
  onBookingCreated,
}) => {
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [eventType, setEventType] = useState<string>(initialEventType || 'Wedding');
  const [eventDate, setEventDate] = useState<string>(initialDate || '');
  const [timeSlot, setTimeSlot] = useState<string>('Full Day (8:00 AM - 10:00 PM)');
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [guestCount, setGuestCount] = useState<string>('Contact venue for details');
  const [address, setAddress] = useState<string>('');
  const [specialRequirements, setSpecialRequirements] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Sync if parent updates initialDate or initialEventType
  useEffect(() => {
    if (initialDate) setEventDate(initialDate);
  }, [initialDate]);

  useEffect(() => {
    if (initialEventType) setEventType(initialEventType);
  }, [initialEventType]);

  // Autofill user details if logged in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!email) setEmail(user.email);
      if (!phone) setPhone(user.phone);
    }
  }, [user]);

  const eventTypeOptions = [
    'Wedding',
    'Reception',
    'Birthday',
    'Conference',
    'Cultural Event',
    'Family Function',
    'College Event',
    'Other',
  ];

  const timeSlotOptions = [
    { label: 'Morning Slot (8:00 AM - 2:00 PM)', desc: 'Ideal for auspicious muhurtham & morning ceremonies' },
    { label: 'Evening Slot (4:00 PM - 10:00 PM)', desc: 'Ideal for evening wedding receptions & stage programs' },
    { label: 'Full Day (8:00 AM - 10:00 PM)', desc: 'Exclusive full-day venue reservation for large celebrations' },
  ];

  const guestCountOptions = [
    'Contact venue for details',
    '100 - 300 Guests',
    '300 - 600 Guests',
    '600 - 1000 Guests',
    '1000+ Guests',
  ];

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1 && !eventType) {
      setErrorMsg('Please select an event type');
      return;
    }
    if (step === 2 && !eventDate) {
      setErrorMsg('Please choose your event date');
      return;
    }
    if (step === 3 && !timeSlot) {
      setErrorMsg('Please choose a time slot');
      return;
    }
    if (step === 4) {
      if (!customerName.trim() || !phone.trim() || !email.trim()) {
        setErrorMsg('Full Name, Phone Number, and Email are required.');
        return;
      }
      if (!/^\+?[0-9\s-]{10,15}$/.test(phone.trim())) {
        setErrorMsg('Please enter a valid phone number (at least 10 digits).');
        return;
      }
      if (!email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.createBooking({
        customerName,
        phone,
        email,
        eventType,
        eventDate,
        timeSlot,
        guestCount,
        address,
        specialRequirements,
      });

      onBookingCreated(res.booking);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit booking request. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="booking" className="py-20 sm:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#7B1113] mb-3">
            <span className="w-8 h-[1px] bg-[#7B1113]"></span>
            <span>Reservation Request</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4">
            Book Buntara Bhavana
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Submit your event enquiry in 5 simple steps. Your submission will receive an instant unique reference ID and will be reviewed by venue management.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-200 -z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-[#7B1113] transition-all duration-300 -z-0"
              style={{ width: `${((step - 1) / 4) * 100}%` }}
            />

            {[1, 2, 3, 4, 5].map((s) => {
              const isDone = s < step;
              const isCurrent = s === step;
              return (
                <div key={s} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-[#7B1113] text-white shadow-sm'
                        : isCurrent
                        ? 'bg-[#7B1113] text-white ring-4 ring-[#7B1113]/20 shadow-md'
                        : 'bg-stone-100 text-stone-500 border border-stone-300'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : s}
                  </div>
                  <span
                    className={`text-[11px] font-medium mt-2 hidden sm:block ${
                      isCurrent ? 'text-[#7B1113] font-bold' : 'text-stone-500'
                    }`}
                  >
                    {s === 1 && 'Event Type'}
                    {s === 2 && 'Date'}
                    {s === 3 && 'Time'}
                    {s === 4 && 'Details'}
                    {s === 5 && 'Review'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-xs sm:text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">Attention Needed</strong>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Step Forms Container */}
        <div className="bg-[#FAF7F2] rounded-xl p-6 sm:p-10 border border-stone-200 shadow-sm">
          {/* STEP 1: Event Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-1">
                  Step 1: Select Event Type
                </h3>
                <p className="text-xs text-stone-600">
                  Select the category that best describes your upcoming gathering.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {eventTypeOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setEventType(opt)}
                    className={`p-4 rounded-lg text-left transition-all border cursor-pointer ${
                      eventType === opt
                        ? 'bg-white border-[#7B1113] text-[#7B1113] ring-2 ring-[#7B1113]/20 shadow-sm font-semibold'
                        : 'bg-white/80 border-stone-200 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <div className="text-sm">{opt}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Select Date */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-1">
                  Step 2: Select Event Date
                </h3>
                <p className="text-xs text-stone-600">
                  Choose your prospective ceremony or event date.
                </p>
              </div>

              <div className="max-w-md">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                  Event Date (YYYY-MM-DD)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={eventDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-stone-300 rounded-md text-stone-900 text-sm focus:outline-none focus:border-[#7B1113] focus:ring-1 focus:ring-[#7B1113]"
                  />
                  <Calendar className="w-4 h-4 text-stone-400 absolute right-4 top-3.5 pointer-events-none" />
                </div>
                <p className="text-[11px] text-stone-500 mt-2">
                  Tip: You can also inspect booked vs open dates in the Availability calendar above.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Select Time */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-1">
                  Step 3: Select Time Slot
                </h3>
                <p className="text-xs text-stone-600">
                  Choose between morning ceremonies, evening receptions, or full-day bookings.
                </p>
              </div>

              <div className="space-y-3">
                {timeSlotOptions.map((slot) => (
                  <div
                    key={slot.label}
                    onClick={() => setTimeSlot(slot.label)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer flex items-start justify-between ${
                      timeSlot === slot.label
                        ? 'bg-white border-[#7B1113] text-[#7B1113] ring-2 ring-[#7B1113]/20 shadow-sm'
                        : 'bg-white/80 border-stone-200 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-semibold">{slot.label}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">{slot.desc}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 ${
                        timeSlot === slot.label
                          ? 'border-[#7B1113] bg-[#7B1113] text-white'
                          : 'border-stone-300'
                      }`}
                    >
                      {timeSlot === slot.label && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Customer Details */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-1">
                  Step 4: Customer Details
                </h3>
                <p className="text-xs text-stone-600">
                  Provide your contact information so management can get in touch.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Santhosh Shetty"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-md text-stone-900 text-sm focus:outline-none focus:border-[#7B1113]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 96869 47433"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-md text-stone-900 text-sm focus:outline-none focus:border-[#7B1113]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-md text-stone-900 text-sm focus:outline-none focus:border-[#7B1113]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Estimated Guests
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-md text-stone-900 text-sm focus:outline-none focus:border-[#7B1113]"
                  >
                    {guestCountOptions.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Your Address / Hometown
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bolwar, Puttur / Mangaluru"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-md text-stone-900 text-sm focus:outline-none focus:border-[#7B1113]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Special Requirements or Questions
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Mention stage decoration needs, dining seating arrangements, or special ceremony notes..."
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-md text-stone-900 text-sm focus:outline-none focus:border-[#7B1113]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Review Booking */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-1">
                  Step 5: Review Booking Request
                </h3>
                <p className="text-xs text-stone-600">
                  Please verify your booking details before submission.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-stone-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-stone-500 block">Venue:</span>
                    <strong className="text-stone-900 font-semibold">
                      Buntara Bhavana Kombettu Puttur
                    </strong>
                  </div>

                  <div>
                    <span className="text-stone-500 block">Event Type:</span>
                    <strong className="text-stone-900 font-semibold">{eventType}</strong>
                  </div>

                  <div>
                    <span className="text-stone-500 block">Event Date:</span>
                    <strong className="text-[#7B1113] font-semibold">{eventDate}</strong>
                  </div>

                  <div>
                    <span className="text-stone-500 block">Time Slot:</span>
                    <strong className="text-stone-900 font-semibold">{timeSlot}</strong>
                  </div>

                  <div>
                    <span className="text-stone-500 block">Customer Name:</span>
                    <strong className="text-stone-900 font-semibold">{customerName}</strong>
                  </div>

                  <div>
                    <span className="text-stone-500 block">Phone Number:</span>
                    <strong className="text-stone-900 font-semibold">{phone}</strong>
                  </div>

                  <div>
                    <span className="text-stone-500 block">Email Address:</span>
                    <strong className="text-stone-900 font-semibold">{email}</strong>
                  </div>

                  <div>
                    <span className="text-stone-500 block">Estimated Guests:</span>
                    <strong className="text-stone-900 font-semibold">{guestCount}</strong>
                  </div>
                </div>

                {specialRequirements && (
                  <div className="pt-3 border-t border-stone-100 text-xs">
                    <span className="text-stone-500 block mb-0.5">Special Requirements:</span>
                    <p className="text-stone-700 italic">{specialRequirements}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-stone-100 text-xs text-amber-800 bg-amber-50 p-3 rounded">
                  <strong>Reservation Notice:</strong> Submitting this request creates an initial reservation enquiry with status <em>Pending Confirmation</em>. The venue management will contact you at <strong>{phone}</strong> to confirm scheduling and answer pricing/capacity queries.
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-stone-200/80 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-md transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-white bg-[#7B1113] hover:bg-[#5E0D0F] rounded-md transition-colors cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white bg-[#7B1113] hover:bg-[#5E0D0F] rounded-md shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                    <span>Submit Booking Request</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
