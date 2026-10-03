import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bbmmoecmjuznztkbqtyf.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_SsDZeyr6fA69dOC9t9Xyxg_slYBlmE4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const SUPABASE_CONFIG = {
  projectId: 'bbmmoecmjuznztkbqtyf',
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,
};

export interface SupabaseSyncResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function syncBookingToSupabase(booking: {
  id: string;
  bookingId: string;
  customerId?: string | null;
  customerName: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  timeSlot: string;
  guestCount: string;
  address?: string;
  specialRequirements?: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}): Promise<SupabaseSyncResult> {
  try {
    // 1. Try snake_case (standard PostgreSQL / Supabase convention)
    const payloadSnake = {
      id: booking.id,
      booking_id: booking.bookingId,
      customer_id: booking.customerId || null,
      customer_name: booking.customerName,
      phone: booking.phone,
      email: booking.email,
      event_type: booking.eventType,
      event_date: booking.eventDate,
      time_slot: booking.timeSlot,
      guest_count: booking.guestCount,
      address: booking.address || '',
      special_requirements: booking.specialRequirements || '',
      status: booking.status,
      admin_notes: booking.adminNotes || '',
      created_at: booking.createdAt,
      updated_at: booking.updatedAt,
    };

    const { error: errSnake } = await supabase.from('bookings').upsert(payloadSnake);

    if (!errSnake) {
      console.log(`[Supabase] Booking ${booking.bookingId} synced successfully (snake_case).`);
      return { success: true, message: `Synced to Supabase table 'bookings'` };
    }

    // 2. If column error, try camelCase in case the user created columns matching JS
    const payloadCamel = {
      id: booking.id,
      bookingId: booking.bookingId,
      customerId: booking.customerId || null,
      customerName: booking.customerName,
      phone: booking.phone,
      email: booking.email,
      eventType: booking.eventType,
      eventDate: booking.eventDate,
      timeSlot: booking.timeSlot,
      guestCount: booking.guestCount,
      address: booking.address || '',
      specialRequirements: booking.specialRequirements || '',
      status: booking.status,
      adminNotes: booking.adminNotes || '',
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };

    const { error: errCamel } = await supabase.from('bookings').upsert(payloadCamel);

    if (!errCamel) {
      console.log(`[Supabase] Booking ${booking.bookingId} synced successfully (camelCase).`);
      return { success: true, message: `Synced to Supabase table 'bookings'` };
    }

    console.warn(`[Supabase] Warning syncing booking ${booking.bookingId}:`, errSnake.message);
    return {
      success: false,
      error: errSnake.message,
    };
  } catch (err: any) {
    console.error(`[Supabase] Exception syncing booking:`, err);
    return {
      success: false,
      error: err?.message || 'Unknown network error connecting to Supabase',
    };
  }
}

export async function syncContactMessageToSupabase(msg: {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
}): Promise<void> {
  try {
    const { error } = await supabase.from('contact_messages').upsert({
      id: msg.id,
      name: msg.name,
      phone: msg.phone,
      email: msg.email || '',
      message: msg.message,
      status: msg.status,
      created_at: msg.createdAt,
    });
    if (error) {
      // It's optional if user didn't create contact_messages table
      console.log('[Supabase contact_messages]', error.message);
    }
  } catch (err) {
    // ignore optional table errors
  }
}

export async function deleteBookingFromSupabase(id: string, bookingId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    let query = supabase.from('bookings').delete();
    if (bookingId) {
      query = query.or(`id.eq.${id},booking_id.eq.${bookingId}`);
    } else {
      query = query.eq('id', id);
    }
    const { error } = await query;
    return { success: !error, error: error?.message };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchBookingsFromSupabase(): Promise<{ success: boolean; data: any[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message, data: [] };
    }

    const normalized = (data || []).map((row: any) => ({
      id: row.id || `sup_${row.booking_id || Date.now()}`,
      bookingId: row.booking_id || row.bookingId || 'BBP-RECORD',
      customerId: row.customer_id || row.customerId || null,
      customerName: row.customer_name || row.customerName || 'Valued Patron',
      phone: row.phone || '',
      email: row.email || '',
      eventType: row.event_type || row.eventType || 'Event',
      eventDate: row.event_date || row.eventDate || '',
      timeSlot: row.time_slot || row.timeSlot || 'Full Day',
      guestCount: row.guest_count || row.guestCount || 'Contact venue for details',
      address: row.address || '',
      specialRequirements: row.special_requirements || row.specialRequirements || '',
      status: row.status || 'Pending',
      adminNotes: row.admin_notes || row.adminNotes || '',
      createdAt: row.created_at || row.createdAt || new Date().toISOString(),
      updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
      source: 'supabase',
    }));

    return { success: true, data: normalized };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  tableExists: boolean;
  message: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.from('bookings').select('id').limit(1);
    if (!error) {
      return {
        connected: true,
        tableExists: true,
        message: 'Successfully connected to Supabase and verified "bookings" table access.',
      };
    }

    // If error code is 42P01 (relation does not exist)
    if (error.code === '42P01' || error.message.includes('does not exist')) {
      return {
        connected: true,
        tableExists: false,
        message:
          'Connected to Supabase project, but the "bookings" table has not been created yet in the database. Please run the provided SQL script in your Supabase SQL Editor.',
        error: error.message,
      };
    }

    // Check if error is related to RLS policy
    if (error.code === '42501' || error.message.includes('row-level security') || error.message.includes('policy')) {
      return {
        connected: true,
        tableExists: true,
        message:
          'Connected to Supabase, but Row Level Security (RLS) is blocking anon access. Please enable INSERT/SELECT policy for anon or run the setup SQL.',
        error: error.message,
      };
    }

    return {
      connected: false,
      tableExists: false,
      message: `Supabase query returned: ${error.message}`,
      error: error.message,
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      message: err.message || 'Failed to reach Supabase',
      error: err.message,
    };
  }
}
