import { User, Booking, Facility, GalleryItem, EventTypeItem, ContactMessage, Testimonial, VenueSettings, AvailabilityData } from '../types.ts';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('bbp_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Failed to login');
    }
    const data = await res.json();
    localStorage.setItem('bbp_token', data.token);
    return data;
  },

  async register(name: string, email: string, phone: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Failed to register');
    }
    const data = await res.json();
    localStorage.setItem('bbp_token', data.token);
    return data;
  },

  async getMe(): Promise<User | null> {
    const token = localStorage.getItem('bbp_token');
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('bbp_token');
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch (e) {
      // ignore
    }
  },

  // Settings
  async getSettings(): Promise<VenueSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  async updateSettings(settings: Partial<VenueSettings>): Promise<VenueSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Update failed' }));
      throw new Error(err.error || 'Failed to update settings');
    }
    const data = await res.json();
    return data.settings;
  },

  // Availability
  async getAvailability(): Promise<AvailabilityData> {
    const res = await fetch(`${API_BASE}/availability`);
    if (!res.ok) throw new Error('Failed to load availability');
    return res.json();
  },

  // Bookings
  async getBookings(email?: string, bookingId?: string): Promise<Booking[]> {
    let url = `${API_BASE}/bookings`;
    if (email && bookingId) {
      url += `?email=${encodeURIComponent(email)}&bookingId=${encodeURIComponent(bookingId)}`;
    }
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  },

  async createBooking(bookingData: {
    customerName: string;
    phone: string;
    email: string;
    eventType: string;
    eventDate: string;
    timeSlot: string;
    guestCount?: string;
    address?: string;
    specialRequirements?: string;
  }): Promise<{ success: boolean; booking: Booking; message: string }> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Booking submission failed' }));
      throw new Error(err.error || 'Failed to submit booking');
    }
    return res.json();
  },

  async updateBooking(id: string, updateData: Partial<Booking> | { action: string }): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Update failed' }));
      throw new Error(err.error || 'Failed to update booking');
    }
    const data = await res.json();
    return data.booking;
  },

  async deleteBooking(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Delete failed' }));
      throw new Error(err.error || 'Failed to delete booking');
    }
  },

  // Facilities
  async getFacilities(): Promise<Facility[]> {
    const res = await fetch(`${API_BASE}/facilities`);
    if (!res.ok) throw new Error('Failed to load facilities');
    return res.json();
  },

  async addFacility(facility: Omit<Facility, 'id'>): Promise<Facility> {
    const res = await fetch(`${API_BASE}/facilities`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(facility),
    });
    if (!res.ok) throw new Error('Failed to add facility');
    return res.json();
  },

  async updateFacility(id: string, facility: Partial<Facility>): Promise<Facility> {
    const res = await fetch(`${API_BASE}/facilities/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(facility),
    });
    if (!res.ok) throw new Error('Failed to update facility');
    return res.json();
  },

  async deleteFacility(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/facilities/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete facility');
  },

  // Gallery
  async getGallery(): Promise<GalleryItem[]> {
    const res = await fetch(`${API_BASE}/gallery`);
    if (!res.ok) throw new Error('Failed to load gallery');
    return res.json();
  },

  async addGalleryItem(item: Omit<GalleryItem, 'id'>): Promise<GalleryItem> {
    const res = await fetch(`${API_BASE}/gallery`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add gallery item');
    return res.json();
  },

  async updateGalleryItem(id: string, item: Partial<GalleryItem>): Promise<GalleryItem> {
    const res = await fetch(`${API_BASE}/gallery/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update gallery item');
    return res.json();
  },

  async deleteGalleryItem(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/gallery/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete gallery item');
  },

  // Event Types
  async getEventTypes(): Promise<EventTypeItem[]> {
    const res = await fetch(`${API_BASE}/event-types`);
    if (!res.ok) throw new Error('Failed to load event types');
    return res.json();
  },

  async updateEventType(id: string, data: Partial<EventTypeItem>): Promise<EventTypeItem> {
    const res = await fetch(`${API_BASE}/event-types/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update event type');
    return res.json();
  },

  // Contact
  async sendContactMessage(msg: { name: string; phone: string; email?: string; message: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to send enquiry' }));
      throw new Error(err.error || 'Failed to send message');
    }
  },

  async getContactMessages(): Promise<ContactMessage[]> {
    const res = await fetch(`${API_BASE}/contact`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load contact messages');
    return res.json();
  },

  async updateContactMessageStatus(id: string, status: 'New' | 'Read' | 'Replied'): Promise<void> {
    const res = await fetch(`${API_BASE}/contact/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
  },

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    const res = await fetch(`${API_BASE}/testimonials`);
    if (!res.ok) throw new Error('Failed to load testimonials');
    return res.json();
  },

  async addTestimonial(testimonial: Omit<Testimonial, 'id' | 'createdAt'>): Promise<Testimonial> {
    const res = await fetch(`${API_BASE}/testimonials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(testimonial),
    });
    if (!res.ok) throw new Error('Failed to add testimonial');
    return res.json();
  },

  async deleteTestimonial(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/testimonials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete testimonial');
  },

  // Admin Stats
  async getAdminStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    upcoming: number;
    unreadMessages: number;
  }> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load admin stats');
    return res.json();
  },

  // Supabase Backend
  async getSupabaseStatus(): Promise<{
    config: { projectId: string; url: string; hasKey: boolean };
    status: { connected: boolean; tableExists: boolean; message: string; error?: string };
  }> {
    const res = await fetch(`${API_BASE}/supabase/status`);
    if (!res.ok) throw new Error('Failed to fetch Supabase status');
    return res.json();
  },

  async syncAllToSupabase(): Promise<{
    total: number;
    synced: number;
    failed: number;
    errors: string[];
  }> {
    const res = await fetch(`${API_BASE}/supabase/sync-all`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to run Supabase sync');
    return res.json();
  },

  async getSupabaseBookings(): Promise<{
    success: boolean;
    data: Booking[];
    error?: string;
  }> {
    const res = await fetch(`${API_BASE}/supabase/bookings`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch bookings from Supabase');
    return res.json();
  },
};
