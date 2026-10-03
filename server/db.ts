import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = path.resolve(process.cwd(), 'data', 'database.json');

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'admin' | 'customer';
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingId: string; // e.g. BBP-2026-0001
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

export interface DatabaseSchema {
  users: User[];
  bookings: Booking[];
  facilities: Facility[];
  gallery: GalleryItem[];
  eventTypes: EventTypeItem[];
  contactMessages: ContactMessage[];
  testimonials: Testimonial[];
  settings: VenueSettings;
  nextBookingSequence: number;
}

function getInitialData(): DatabaseSchema {
  const adminPasswordHash = bcrypt.hashSync('AdminPassword2026!', 10);

  return {
    users: [
      {
        id: 'usr_admin_1',
        name: 'Buntara Bhavana Administrator',
        email: 'admin@buntarabhavanaputtur.org',
        phone: '+91 96869 47433',
        passwordHash: adminPasswordHash,
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
    ],
    bookings: [
      {
        id: 'bk_sample_1',
        bookingId: 'BBP-2026-0001',
        customerId: null,
        customerName: 'Santhosh Rai',
        phone: '+91 98450 12345',
        email: 'santhosh.rai@example.com',
        eventType: 'Wedding',
        eventDate: '2026-10-18',
        timeSlot: 'Morning (8:00 AM - 2:00 PM)',
        guestCount: 'Contact venue for details',
        address: 'Puttur, Dakshina Kannada',
        specialRequirements: 'Stage setup & dining arrangement enquiry',
        status: 'Confirmed',
        adminNotes: 'Confirmed by committee management',
        createdAt: '2026-10-01T10:00:00.000Z',
        updatedAt: '2026-10-01T14:30:00.000Z',
      },
      {
        id: 'bk_sample_2',
        bookingId: 'BBP-2026-0002',
        customerId: null,
        customerName: 'Praveen Hegde',
        phone: '+91 94481 98765',
        email: 'praveen.hegde@example.com',
        eventType: 'Cultural Program',
        eventDate: '2026-10-25',
        timeSlot: 'Full Day (8:00 AM - 10:00 PM)',
        guestCount: 'Contact venue for details',
        address: 'Bolwar, Puttur',
        specialRequirements: 'Sound and lighting rehearsal in the morning',
        status: 'Pending',
        adminNotes: 'Awaiting token confirmation',
        createdAt: '2026-10-02T09:15:00.000Z',
        updatedAt: '2026-10-02T09:15:00.000Z',
      },
      {
        id: 'bk_sample_3',
        bookingId: 'BBP-2026-0003',
        customerId: null,
        customerName: 'Anil Kumar',
        phone: '+91 98860 55432',
        email: 'anilkumar@example.com',
        eventType: 'Reception',
        eventDate: '2026-11-05',
        timeSlot: 'Evening (4:00 PM - 10:00 PM)',
        guestCount: 'Contact venue for details',
        address: 'Kombettu, Puttur',
        specialRequirements: 'Reception stage floral decor enquiry',
        status: 'Confirmed',
        adminNotes: 'Reception reservation locked',
        createdAt: '2026-10-02T11:00:00.000Z',
        updatedAt: '2026-10-02T16:00:00.000Z',
      }
    ],
    facilities: [
      {
        id: 'fac_1',
        name: 'Venue Hall & Stage',
        tagline: 'Expansive auditorium space with wide ceremonial stage',
        description: 'Contact venue for details on exact seating capacity, acoustics, and stage layout.',
        confirmed: false,
        iconName: 'Building2',
      },
      {
        id: 'fac_2',
        name: 'Parking Facility',
        tagline: 'Dedicated vehicular access at Bolwar Kombettu',
        description: 'Contact venue for details on parking space capacity and vehicle entry arrangements.',
        confirmed: false,
        iconName: 'Car',
      },
      {
        id: 'fac_3',
        name: 'Banquet & Dining Space',
        tagline: 'Spacious dining hall area for traditional feasting',
        description: 'Contact venue for details regarding dining hall capacity and catering kitchen facilities.',
        confirmed: false,
        iconName: 'Utensils',
      },
      {
        id: 'fac_4',
        name: 'Accessibility & Entrances',
        tagline: 'Convenient ground-level & wide passage access',
        description: 'Contact venue for details regarding wheelchair accessibility and ramp entry points.',
        confirmed: false,
        iconName: 'CheckCircle2',
      },
      {
        id: 'fac_5',
        name: 'Green Rooms & Rest Areas',
        tagline: 'Private preparatory rooms for bridal parties and VIPs',
        description: 'Contact venue for details on the number of dressing rooms and dedicated amenities.',
        confirmed: false,
        iconName: 'DoorOpen',
      },
      {
        id: 'fac_6',
        name: 'Other Facilities',
        tagline: 'Generator backup & electrical arrangements',
        description: 'Contact venue for details on power backup, audio equipment, and venue guidelines.',
        confirmed: false,
        iconName: 'Sparkles',
      },
    ],
    gallery: [
      {
        id: 'gal_1',
        title: 'Buntara Bhavana Kombettu - Exterior View',
        category: 'Exterior',
        imageUrl: '/src/assets/images/hero_venue_facade_1791002966176.jpg',
        caption: 'Grand facade and entrance courtyard of Buntara Bhavana at Bolwar, Puttur.',
        isPlaceholder: false,
      },
      {
        id: 'gal_2',
        title: 'Grand Auditorium & Ceremony Stage',
        category: 'Hall',
        imageUrl: '/src/assets/images/hall_grand_interior_1791002979481.jpg',
        caption: 'Spacious main hall layout prepared for auspicious celebrations and wedding gatherings.',
        isPlaceholder: false,
      },
      {
        id: 'gal_3',
        title: 'Ceremonial Stage Setup',
        category: 'Venue',
        imageUrl: '/src/assets/images/reception_stage_decor_1791002992072.jpg',
        caption: 'Floral backdrop and ceremonial stage illumination for traditional functions.',
        isPlaceholder: false,
      },
      {
        id: 'gal_4',
        title: 'Banquet & Dining Hall',
        category: 'Events',
        imageUrl: '/src/assets/images/hall_banquet_dining_1791003007303.jpg',
        caption: 'Traditional dining hall setup for guest feasts and hospitality.',
        isPlaceholder: false,
      },
      {
        id: 'gal_5',
        title: 'Cultural Function Assembly',
        category: 'Events',
        imageUrl: '/src/assets/images/cultural_event_hall_1791003020545.jpg',
        caption: 'Auditorium seating arrangement suitable for cultural programs and community conferences.',
        isPlaceholder: false,
      },
    ],
    eventTypes: [
      {
        id: 'evt_1',
        title: 'Weddings',
        tagline: 'Auspicious muhurtham ceremonies & grand matrimony',
        description: 'A dignified setting for traditional wedding rituals, sacred mantras, and memorable moments with loved ones.',
        icon: 'Ring',
      },
      {
        id: 'evt_2',
        title: 'Receptions',
        tagline: 'Evening celebration galas & grand receptions',
        description: 'Spacious hall arrangements and stage decor support for entertaining friends, family, and dignitaries.',
        icon: 'PartyPopper',
      },
      {
        id: 'evt_3',
        title: 'Family Functions',
        tagline: 'Naming ceremonies, anniversaries & milestones',
        description: 'A comfortable, hospitable venue for cherished family milestones and private get-togethers.',
        icon: 'Users',
      },
      {
        id: 'evt_4',
        title: 'College / Academic Events',
        tagline: 'Graduations, seminars & inter-college meets',
        description: 'Auditorium facility equipped for academic convocations, student festivals, and conferences.',
        icon: 'GraduationCap',
      },
      {
        id: 'evt_5',
        title: 'Conferences & Seminars',
        tagline: 'Corporate meetings & institutional symposiums',
        description: 'Organized auditorium layout suitable for formal presentations, delegates, and keynote sessions.',
        icon: 'Briefcase',
      },
      {
        id: 'evt_6',
        title: 'Cultural Programs',
        tagline: 'Yakshagana, dance recitals & theatrical arts',
        description: 'Wide proscenium stage with clear sightlines suited for coastal Karnataka cultural arts and performances.',
        icon: 'Theater',
      },
      {
        id: 'evt_7',
        title: 'Celebrations',
        tagline: 'Birthdays, retirements & festivities',
        description: 'Versatile space that can be tailored to joyful personal achievements and community festivities.',
        icon: 'Cake',
      },
      {
        id: 'evt_8',
        title: 'Community Events',
        tagline: 'Samaja meetings, felicitation & gatherings',
        description: 'A central meeting place for community forums, youth assemblies, and public welfare meets.',
        icon: 'Handshake',
      },
    ],
    contactMessages: [
      {
        id: 'msg_1',
        name: 'Ramesh Shetty',
        phone: '+91 98451 22334',
        email: 'ramesh.shetty@example.com',
        message: 'Enquiring about booking availability for December 2026 wedding dates. Please contact with details.',
        status: 'New',
        createdAt: '2026-10-02T15:20:00.000Z',
      }
    ],
    testimonials: [], // Verified reviews only when added by administrator
    settings: {
      businessName: 'Buntara Bhavana Kombettu Puttur',
      category: 'Premium Auditorium / Convention Hall / Community Hall / Event Venue',
      address: 'Buntara Bhavana, Sona Bazar, Bolwar, Puttur, Dakshina Kannada, Karnataka – 574201, India',
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
    },
    nextBookingSequence: 4,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (e) {
      console.error('Error loading database, using default data:', e);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.data[key];
  }

  public update<K extends keyof DatabaseSchema>(key: K, value: DatabaseSchema[K]) {
    this.data[key] = value;
    this.saveData(this.data);
  }

  public generateBookingId(): string {
    const seq = this.data.nextBookingSequence || 1;
    this.data.nextBookingSequence = seq + 1;
    const year = new Date().getFullYear();
    const formattedSeq = String(seq).padStart(4, '0');
    const bookingId = `BBP-${year}-${formattedSeq}`;
    this.saveData(this.data);
    return bookingId;
  }
}

export const db = new Database();
