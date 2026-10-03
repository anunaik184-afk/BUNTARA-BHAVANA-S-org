import React from 'react';
import { Booking } from '../types.ts';
import { CheckCircle2, Phone, Download, Home, Printer, Clock } from 'lucide-react';

interface BookingConfirmationModalProps {
  booking: Booking | null;
  phone: string;
  onClose: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  booking,
  phone,
  onClose,
}) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-8 border border-stone-200 shadow-2xl relative">
        {/* Printable Area */}
        <div id="printable-booking-confirmation" className="space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-xs font-semibold uppercase tracking-widest text-[#7B1113] mb-1">
              Buntara Bhavana Kombettu Puttur
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Booking Request Submitted
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Your reservation reference has been recorded in the venue database.
            </p>
          </div>

          {/* Reference Card */}
          <div className="bg-[#FAF7F2] rounded-lg p-5 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <span className="text-xs font-medium text-stone-500">Booking Reference ID</span>
              <span className="font-mono text-base font-bold text-[#7B1113] tracking-wide">
                {booking.bookingId}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-stone-500 block">Customer Name</span>
                <span className="font-semibold text-stone-900">{booking.customerName}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Event Type</span>
                <span className="font-semibold text-stone-900">{booking.eventType}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Event Date</span>
                <span className="font-semibold text-stone-900">{booking.eventDate}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Time Slot</span>
                <span className="font-semibold text-stone-900">{booking.timeSlot}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Estimated Guests</span>
                <span className="font-semibold text-stone-900">{booking.guestCount}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Booking Status</span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                  <Clock className="w-3 h-3" /> Pending Confirmation
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                <span>Database Sync:</span>
                <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Saved to Supabase Cloud
                </span>
              </div>
            </div>
          </div>

          {/* Verification Advisory Note */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-md text-xs text-stone-600 leading-relaxed">
            <strong className="text-stone-900 font-semibold block mb-0.5">Next Steps:</strong>
            This request is pending committee verification. Our venue administrative staff will contact you at <strong>{booking.phone}</strong> to confirm muhurtham timing, pricing, and ceremony arrangements.
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handlePrint}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-stone-600" />
            <span>Download Voucher</span>
          </button>

          <a
            href={`tel:${phone.replace(/\s+/g, '')}`}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-white bg-[#7B1113] hover:bg-[#5E0D0F] rounded-md transition-colors cursor-pointer"
          >
            <Phone className="w-4 h-4 text-[#C5A059]" />
            <span>Call Venue</span>
          </a>

          <button
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1 py-2.5 px-4 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-md transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
