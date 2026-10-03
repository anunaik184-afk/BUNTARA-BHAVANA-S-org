export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
}

export interface Booking {
  id: string;
  bookingId: string;
  customerId?: string | null;
  customerName: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string; // YYYY-MM-DD
  timeSlot: string;
  guestCount: string;
  address?: string;
  specialRequirements?: string;
  status: 'Pending' | 'Confirmed' | 'Rejected' | 'Cancelled' | 'Completed';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Facility {
  id: string;
  name: string;
  tagline: string;
  description: string;
  confirmed: boolean;
  iconName: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Venue' | 'Hall' | 'Events' | 'Exterior';
  imageUrl: string;
  caption: string;
  isPlaceholder?: boolean;
}

export interface EventTypeItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  imageUrl?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: 'New' | 'Read' | 'Replied';
  createdAt: string;
}

export interface Testimonial {
  id: string;
  customerName: string;
  eventType: string;
  eventDate: string;
  reviewText: string;
  rating: number;
  isVerified: boolean;
  createdAt: string;
}

export interface VenueSettings {
  businessName: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  googleMapsUrl: string;
  bookingMode: 'full_day' | 'time_slots';
  timingsNote: string;
  openingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

export interface AvailabilityData {
  bookingMode: 'full_day' | 'time_slots';
  availability: Record<
    string,
    {
      status: 'Confirmed' | 'Pending';
      count: number;
      slots: string[];
    }
  >;
}
