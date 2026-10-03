import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, User, Booking, Facility, GalleryItem, EventTypeItem, ContactMessage, Testimonial, VenueSettings } from './server/db.ts';
import { supabase, syncBookingToSupabase, syncContactMessageToSupabase, testSupabaseConnection, fetchBookingsFromSupabase, deleteBookingFromSupabase, SUPABASE_CONFIG } from './server/supabase.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'buntara_bhavana_secret_key_2026';

app.use(express.json());
app.use(cookieParser());

// Auth helper middleware
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'customer';
    name: string;
  };
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.cookies?.token;

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (!err && decoded) {
      req.user = decoded;
    }
    next();
  });
}

function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required' });
  }
  next();
}

app.use(authenticateToken);

// ---------------- API ROUTES ----------------

// 1. Auth routes
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  const users = db.get('users');
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser: User = {
    id: `usr_${Date.now()}`,
    name,
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    passwordHash,
    role: 'customer',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  db.update('users', users);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, role: newUser.role },
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = db.get('users');
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
  });
});

app.get('/api/auth/me', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  const users = db.get('users');
  const user = users.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.json({ user: null });
  }
  res.json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// 2. Settings (Editable venue details)
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(db.get('settings'));
});

app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
  const current = db.get('settings');
  const updated: VenueSettings = {
    ...current,
    ...req.body,
    openingHours: {
      ...current.openingHours,
      ...(req.body.openingHours || {}),
    },
  };
  db.update('settings', updated);
  res.json({ success: true, settings: updated });
});

// 3. Availability Checker
app.get('/api/availability', (req: Request, res: Response) => {
  const bookings = db.get('bookings');
  // Return summary for calendar (dates and their booked / pending statuses)
  const availabilityMap: Record<string, { status: 'Confirmed' | 'Pending'; count: number; slots: string[] }> = {};

  bookings.forEach((b) => {
    if (b.status === 'Confirmed' || b.status === 'Pending') {
      if (!availabilityMap[b.eventDate]) {
        availabilityMap[b.eventDate] = {
          status: b.status,
          count: 1,
          slots: [b.timeSlot],
        };
      } else {
        // Confirmed takes visual precedence over Pending
        if (b.status === 'Confirmed') {
          availabilityMap[b.eventDate].status = 'Confirmed';
        }
        availabilityMap[b.eventDate].count++;
        availabilityMap[b.eventDate].slots.push(b.timeSlot);
      }
    }
  });

  res.json({
    bookingMode: db.get('settings').bookingMode,
    availability: availabilityMap,
  });
});

// 4. Bookings
app.get('/api/bookings', (req: AuthRequest, res: Response) => {
  const bookings = db.get('bookings');

  // If admin, return all
  if (req.user && req.user.role === 'admin') {
    return res.json(bookings);
  }

  // If customer, return only their bookings or matched by email/id
  if (req.user) {
    const userBookings = bookings.filter(
      (b) => b.customerId === req.user?.id || b.email.toLowerCase() === req.user?.email.toLowerCase()
    );
    return res.json(userBookings);
  }

  // If not logged in, forbid or check query by email and bookingId
  const { email, bookingId } = req.query;
  if (email && bookingId) {
    const matched = bookings.filter(
      (b) =>
        b.bookingId.toLowerCase() === String(bookingId).toLowerCase() &&
        b.email.toLowerCase() === String(email).toLowerCase()
    );
    return res.json(matched);
  }

  return res.status(401).json({ error: 'Please log in to view bookings' });
});

// Create Booking Request
app.post('/api/bookings', async (req: AuthRequest, res: Response) => {
  const {
    customerName,
    phone,
    email,
    eventType,
    eventDate,
    timeSlot,
    guestCount,
    address,
    specialRequirements,
  } = req.body;

  if (!customerName || !phone || !email || !eventType || !eventDate || !timeSlot) {
    return res.status(400).json({ error: 'Please provide all mandatory booking fields' });
  }

  const bookings = db.get('bookings');
  const settings = db.get('settings');

  // Prevent double booking for already confirmed bookings
  const conflicting = bookings.find((b) => {
    if (b.eventDate !== eventDate) return false;
    if (b.status !== 'Confirmed') return false;

    if (settings.bookingMode === 'full_day') {
      return true; // Full day collision
    }

    // Time slot collision
    if (b.timeSlot === 'Full Day (8:00 AM - 10:00 PM)' || timeSlot === 'Full Day (8:00 AM - 10:00 PM)') {
      return true;
    }
    return b.timeSlot === timeSlot;
  });

  if (conflicting) {
    return res.status(409).json({
      error: `The venue is already confirmed for this date (${eventDate}) and time slot. Please choose another date or contact the venue directly.`,
    });
  }

  const bookingId = db.generateBookingId();
  const newBooking: Booking = {
    id: `bk_${Date.now()}`,
    bookingId,
    customerId: req.user ? req.user.id : null,
    customerName: customerName.trim(),
    phone: phone.trim(),
    email: email.trim(),
    eventType,
    eventDate,
    timeSlot,
    guestCount: guestCount || 'Contact venue for details',
    address: address || '',
    specialRequirements: specialRequirements || '',
    status: 'Pending',
    adminNotes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  bookings.unshift(newBooking);
  db.update('bookings', bookings);

  // Automatically sync to Supabase backend in real-time
  let supabaseResult: { success: boolean; message?: string; error?: string } = { success: false, message: '' };
  try {
    supabaseResult = await syncBookingToSupabase(newBooking);
  } catch (err: any) {
    console.error('Supabase auto-sync failed:', err);
  }

  res.status(201).json({
    success: true,
    message: 'Booking request submitted successfully',
    booking: newBooking,
    supabase: supabaseResult,
  });
});

// Update Booking Status / Edit (Admin or Customer cancel)
app.put('/api/bookings/:id', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const bookings = db.get('bookings');
  const index = bookings.findIndex((b) => b.id === id || b.bookingId === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const booking = bookings[index];

  // Customer can only cancel their own booking
  if (req.user && req.user.role === 'customer') {
    const isOwner = booking.customerId === req.user.id || booking.email.toLowerCase() === req.user.email.toLowerCase();
    if (!isOwner) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    if (req.body.action === 'cancel') {
      booking.status = 'Cancelled';
      booking.updatedAt = new Date().toISOString();
      bookings[index] = booking;
      db.update('bookings', bookings);
      syncBookingToSupabase(booking).catch(() => {});
      return res.json({ success: true, booking });
    }
    return res.status(400).json({ error: 'Invalid customer action' });
  }

  // Admin has full control
  if (req.user && req.user.role === 'admin') {
    const {
      status,
      customerName,
      phone,
      email,
      eventType,
      eventDate,
      timeSlot,
      guestCount,
      address,
      specialRequirements,
      adminNotes,
    } = req.body;

    if (customerName) booking.customerName = customerName.trim();
    if (phone) booking.phone = phone.trim();
    if (email) booking.email = email.trim();
    if (eventType) booking.eventType = eventType;
    if (address !== undefined) booking.address = address;
    if (status) booking.status = status;
    if (eventDate) booking.eventDate = eventDate;
    if (timeSlot) booking.timeSlot = timeSlot;
    if (guestCount !== undefined) booking.guestCount = guestCount;
    if (specialRequirements !== undefined) booking.specialRequirements = specialRequirements;
    if (adminNotes !== undefined) booking.adminNotes = adminNotes;

    booking.updatedAt = new Date().toISOString();
    bookings[index] = booking;
    db.update('bookings', bookings);
    syncBookingToSupabase(booking).catch(() => {});
    return res.json({ success: true, booking });
  }

  return res.status(401).json({ error: 'Unauthorized' });
});

// Delete Booking (Admin only)
app.delete('/api/bookings/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const bookings = db.get('bookings');
  const index = bookings.findIndex((b) => b.id === id || b.bookingId === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const removed = bookings.splice(index, 1)[0];
  db.update('bookings', bookings);

  // Also delete from Supabase if present
  try {
    await deleteBookingFromSupabase(removed.id, removed.bookingId);
  } catch (e) {
    console.error('Error deleting from Supabase:', e);
  }

  res.json({ success: true, message: `Booking ${removed.bookingId} removed` });
});

// 5. Facilities
app.get('/api/facilities', (req: Request, res: Response) => {
  res.json(db.get('facilities'));
});

app.post('/api/facilities', requireAdmin, (req: Request, res: Response) => {
  const facilities = db.get('facilities');
  const newFacility: Facility = {
    id: `fac_${Date.now()}`,
    name: req.body.name,
    tagline: req.body.tagline || '',
    description: req.body.description || 'Contact venue for details',
    confirmed: Boolean(req.body.confirmed),
    iconName: req.body.iconName || 'CheckCircle2',
  };
  facilities.push(newFacility);
  db.update('facilities', facilities);
  res.status(201).json(newFacility);
});

app.put('/api/facilities/:id', requireAdmin, (req: Request, res: Response) => {
  const facilities = db.get('facilities');
  const index = facilities.findIndex((f) => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Facility not found' });

  facilities[index] = { ...facilities[index], ...req.body };
  db.update('facilities', facilities);
  res.json(facilities[index]);
});

app.delete('/api/facilities/:id', requireAdmin, (req: Request, res: Response) => {
  const facilities = db.get('facilities').filter((f) => f.id !== req.params.id);
  db.update('facilities', facilities);
  res.json({ success: true });
});

// 6. Gallery
app.get('/api/gallery', (req: Request, res: Response) => {
  res.json(db.get('gallery'));
});

app.post('/api/gallery', requireAdmin, (req: Request, res: Response) => {
  const gallery = db.get('gallery');
  const newItem: GalleryItem = {
    id: `gal_${Date.now()}`,
    title: req.body.title,
    category: req.body.category || 'Venue',
    imageUrl: req.body.imageUrl,
    caption: req.body.caption || '',
    isPlaceholder: Boolean(req.body.isPlaceholder),
  };
  gallery.unshift(newItem);
  db.update('gallery', gallery);
  res.status(201).json(newItem);
});

app.put('/api/gallery/:id', requireAdmin, (req: Request, res: Response) => {
  const gallery = db.get('gallery');
  const index = gallery.findIndex((g) => g.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Image not found' });

  gallery[index] = { ...gallery[index], ...req.body };
  db.update('gallery', gallery);
  res.json(gallery[index]);
});

app.delete('/api/gallery/:id', requireAdmin, (req: Request, res: Response) => {
  const gallery = db.get('gallery').filter((g) => g.id !== req.params.id);
  db.update('gallery', gallery);
  res.json({ success: true });
});

// 7. Event Types
app.get('/api/event-types', (req: Request, res: Response) => {
  res.json(db.get('eventTypes'));
});

app.put('/api/event-types/:id', requireAdmin, (req: Request, res: Response) => {
  const eventTypes = db.get('eventTypes');
  const index = eventTypes.findIndex((e) => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Event type not found' });

  eventTypes[index] = { ...eventTypes[index], ...req.body };
  db.update('eventTypes', eventTypes);
  res.json(eventTypes[index]);
});

// 8. Contact Messages
app.get('/api/contact', requireAdmin, (req: Request, res: Response) => {
  res.json(db.get('contactMessages'));
});

app.post('/api/contact', (req: Request, res: Response) => {
  const { name, phone, email, message } = req.body;
  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Name, phone, and message are required' });
  }

  const messages = db.get('contactMessages');
  const newMsg: ContactMessage = {
    id: `msg_${Date.now()}`,
    name: name.trim(),
    phone: phone.trim(),
    email: (email || '').trim(),
    message: message.trim(),
    status: 'New',
    createdAt: new Date().toISOString(),
  };

  messages.unshift(newMsg);
  db.update('contactMessages', messages);
  syncContactMessageToSupabase(newMsg).catch(() => {});
  res.status(201).json({ success: true, message: 'Your message has been sent to venue management.' });
});

app.put('/api/contact/:id', requireAdmin, (req: Request, res: Response) => {
  const messages = db.get('contactMessages');
  const index = messages.findIndex((m) => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Message not found' });

  messages[index] = { ...messages[index], ...req.body };
  db.update('contactMessages', messages);
  res.json(messages[index]);
});

// 9. Testimonials
app.get('/api/testimonials', (req: Request, res: Response) => {
  const testimonials = db.get('testimonials');
  res.json(testimonials);
});

app.post('/api/testimonials', requireAdmin, (req: Request, res: Response) => {
  const testimonials = db.get('testimonials');
  const newTestimonial: Testimonial = {
    id: `rev_${Date.now()}`,
    customerName: req.body.customerName,
    eventType: req.body.eventType,
    eventDate: req.body.eventDate || '',
    reviewText: req.body.reviewText,
    rating: req.body.rating || 5,
    isVerified: true,
    createdAt: new Date().toISOString(),
  };
  testimonials.unshift(newTestimonial);
  db.update('testimonials', testimonials);
  res.status(201).json(newTestimonial);
});

app.delete('/api/testimonials/:id', requireAdmin, (req: Request, res: Response) => {
  const testimonials = db.get('testimonials').filter((t) => t.id !== req.params.id);
  db.update('testimonials', testimonials);
  res.json({ success: true });
});

// 10. Admin Stats
app.get('/api/admin/stats', requireAdmin, (req: Request, res: Response) => {
  const bookings = db.get('bookings');
  const messages = db.get('contactMessages');
  const today = new Date().toISOString().split('T')[0];

  const total = bookings.length;
  const pending = bookings.filter((b) => b.status === 'Pending').length;
  const confirmed = bookings.filter((b) => b.status === 'Confirmed').length;
  const upcoming = bookings.filter((b) => b.status === 'Confirmed' && b.eventDate >= today).length;
  const unreadMessages = messages.filter((m) => m.status === 'New').length;

  res.json({
    total,
    pending,
    confirmed,
    upcoming,
    unreadMessages,
  });
});

// 11. Supabase Backend Integration
app.get('/api/supabase/status', async (req: Request, res: Response) => {
  const result = await testSupabaseConnection();
  res.json({
    config: {
      projectId: SUPABASE_CONFIG.projectId,
      url: SUPABASE_CONFIG.url,
      hasKey: Boolean(SUPABASE_CONFIG.key),
    },
    status: result,
  });
});

app.post('/api/supabase/sync-all', requireAdmin, async (req: Request, res: Response) => {
  const bookings = db.get('bookings');
  let successCount = 0;
  let failCount = 0;
  const errors: string[] = [];

  for (const b of bookings) {
    const resSync = await syncBookingToSupabase(b);
    if (resSync.success) {
      successCount++;
    } else {
      failCount++;
      if (resSync.error && !errors.includes(resSync.error)) {
        errors.push(resSync.error);
      }
    }
  }

  res.json({
    total: bookings.length,
    synced: successCount,
    failed: failCount,
    errors,
  });
});

app.get('/api/supabase/bookings', requireAdmin, async (req: Request, res: Response) => {
  const result = await fetchBookingsFromSupabase();
  res.json(result);
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Buntara Bhavana Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
