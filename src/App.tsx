import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { QuickInfo } from './components/QuickInfo.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { EventTypesSection } from './components/EventTypesSection.tsx';
import { FacilitiesSection } from './components/FacilitiesSection.tsx';
import { AvailabilityCalendar } from './components/AvailabilityCalendar.tsx';
import { BookingForm } from './components/BookingForm.tsx';
import { GallerySection } from './components/GallerySection.tsx';
import { ReviewsSection } from './components/ReviewsSection.tsx';
import { ContactSection } from './components/ContactSection.tsx';
import { Footer } from './components/Footer.tsx';
import { CustomerAuthModal } from './components/CustomerAuthModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { BookingConfirmationModal } from './components/BookingConfirmationModal.tsx';
import { api } from './services/api.ts';
import { VenueSettings, AvailabilityData, Facility, GalleryItem, EventTypeItem, Testimonial, Booking } from './types.ts';

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

function MainApp() {
  const [settings, setSettings] = useState<VenueSettings>({
    businessName: 'Buntara Bhavana Kombettu Puttur',
    category: 'Premium Auditorium / Convention Hall / Community Hall / Event Venue',
    address: 'Buntara Bhavana, Sona Bazar, Bolwar, Puttur, Karnataka 574201',
    phone: '+91 96869 47433',
    email: 'contact@buntarabhavanaputtur.org',
    googleMapsUrl: 'https://www.google.com/maps/place/Buntara+Bhavana+Kombettu+Puttur,Dakshina+Kannada/',
    bookingMode: 'time_slots',
    timingsNote: 'Venue timings: Please contact us for availability.',
    openingHours: {
      monday: 'Contact venue for details',
      tuesday: 'Contact venue for details',
      wednesday: 'Contact venue for details',
      thursday: 'Contact venue for details',
      friday: 'Contact venue for details',
      saturday: 'Contact venue for details',
      sunday: 'Contact venue for details',
    },
  });

  const [availabilityData, setAvailabilityData] = useState<AvailabilityData | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Selected state for booking orchestration
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedEventType, setSelectedEventType] = useState<string>('');

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const loadData = async () => {
    try {
      const [st, av, fac, gal, evts, rev] = await Promise.all([
        api.getSettings(),
        api.getAvailability(),
        api.getFacilities(),
        api.getGallery(),
        api.getEventTypes(),
        api.getTestimonials(),
      ]);
      setSettings(st);
      setAvailabilityData(av);
      setFacilities(fac);
      setGalleryItems(gal);
      setEventTypes(evts);
      setTestimonials(rev);
    } catch (e) {
      console.error('Error loading initial data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectDateFromCalendar = (dateStr: string) => {
    setSelectedDate(dateStr);
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectEventType = (type: string) => {
    setSelectedEventType(type);
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookingCreated = (booking: Booking) => {
    setConfirmedBooking(booking);
    // Refresh availability
    api.getAvailability().then(setAvailabilityData).catch(console.error);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-900">
      {/* Sticky Responsive Navbar */}
      <Navbar
        onOpenAuth={(tab) => {
          setAuthInitialTab(tab || 'login');
          setAuthModalOpen(true);
        }}
        onOpenAdmin={() => setAdminModalOpen(true)}
      />

      <main className="flex-1">
        {/* Large Cinematic Hero Section */}
        <Hero
          onCheckAvailability={() => {
            document.getElementById('availability')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onViewGallery={() => {
            document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 4 Premium Information Cards */}
        <QuickInfo
          phone={settings.phone}
          onEnquireClick={() => {
            document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* About Section */}
        <AboutSection googleMapsUrl={settings.googleMapsUrl} />

        {/* Event Types Section */}
        <EventTypesSection
          eventTypes={eventTypes}
          onSelectEventType={handleSelectEventType}
        />

        {/* Facilities Section */}
        <FacilitiesSection facilities={facilities} phone={settings.phone} />

        {/* Availability Checker & Calendar */}
        <AvailabilityCalendar
          availabilityData={availabilityData}
          onSelectDate={handleSelectDateFromCalendar}
          selectedDate={selectedDate}
        />

        {/* Multi-Step Booking Form */}
        <BookingForm
          initialDate={selectedDate}
          initialEventType={selectedEventType}
          onBookingCreated={handleBookingCreated}
        />

        {/* Gallery Section with Fullscreen Lightbox */}
        <GallerySection galleryItems={galleryItems} />

        {/* Patrons Testimonials */}
        <ReviewsSection testimonials={testimonials} />

        {/* Contact & Map Section */}
        <ContactSection settings={settings} />
      </main>

      {/* Footer */}
      <Footer
        phone={settings.phone}
        address={settings.address}
        onOpenAdmin={() => setAdminModalOpen(true)}
      />

      {/* Customer Auth / Dashboard Modal */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authInitialTab}
      />

      {/* Admin Management Dashboard Modal */}
      <AdminDashboard
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onDataChanged={loadData}
      />

      {/* Booking Submission Confirmation Modal */}
      <BookingConfirmationModal
        booking={confirmedBooking}
        phone={settings.phone}
        onClose={() => setConfirmedBooking(null)}
      />
    </div>
  );
}
