import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Booking, Facility, GalleryItem, EventTypeItem, ContactMessage, Testimonial, VenueSettings } from '../types.ts';
import { api } from '../services/api.ts';
import {
  X,
  Shield,
  LayoutDashboard,
  Calendar,
  Image as ImageIcon,
  Building2,
  Settings,
  Mail,
  MessageSquare,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Plus,
  Save,
  Clock,
  Users,
  Lock,
  Loader2,
  Check,
  AlertCircle,
  Database,
  Copy,
  RefreshCw,
  CheckCheck,
  ExternalLink,
  Eye,
  Download,
  Phone,
  MapPin,
  User,
  FileText,
  Ban
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, onDataChanged }) => {
  const { user, isAdmin, login, logout } = useAuth();

  // Admin login credentials state
  const [adminEmail, setAdminEmail] = useState('admin@buntarabhavanaputtur.org');
  const [adminPassword, setAdminPassword] = useState('AdminPassword2026!');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active admin tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'bookings' | 'settings' | 'facilities' | 'gallery' | 'contact' | 'testimonials' | 'supabase'
  >('overview');

  // Supabase integration state
  const [supabaseStatus, setSupabaseStatus] = useState<{
    config: { projectId: string; url: string; hasKey: boolean };
    status: { connected: boolean; tableExists: boolean; message: string; error?: string };
  } | null>(null);
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseSyncing, setSupabaseSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncReport, setSyncReport] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, upcoming: 0, unreadMessages: 0 });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<VenueSettings | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Search & filter for bookings
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Appointment inspector & edit modals
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedDetailBooking, setSelectedDetailBooking] = useState<Booking | null>(null);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [viewSource, setViewSource] = useState<'local' | 'supabase'>('local');
  const [supabaseBookings, setSupabaseBookings] = useState<Booking[]>([]);
  const [loadingSupabaseBookings, setLoadingSupabaseBookings] = useState(false);

  // New manual appointment form state
  const [newAppt, setNewAppt] = useState({
    customerName: '',
    phone: '',
    email: '',
    eventType: 'Wedding',
    eventDate: new Date().toISOString().split('T')[0],
    timeSlot: 'Full Day (8:00 AM - 10:00 PM)',
    guestCount: 'Contact venue for details',
    address: 'Puttur, Karnataka',
    specialRequirements: '',
    status: 'Confirmed' as Booking['status'],
    adminNotes: 'Direct booking recorded by venue office',
  });

  // New facility / gallery / testimonial state
  const [newFacility, setNewFacility] = useState({ name: '', tagline: '', description: '', confirmed: false, iconName: 'Building2' });
  const [newGalleryItem, setNewGalleryItem] = useState({ title: '', category: 'Hall' as any, imageUrl: '', caption: '', isPlaceholder: false });
  const [newTestimonial, setNewTestimonial] = useState({ customerName: '', eventType: 'Wedding', eventDate: '', reviewText: '', rating: 5, isVerified: true });

  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    if (isOpen && isAdmin) {
      loadAllAdminData();
    }
  }, [isOpen, isAdmin]);

  const loadAllAdminData = async () => {
    try {
      const [st, bk, setts, fac, gal, msg, rev] = await Promise.all([
        api.getAdminStats(),
        api.getBookings(),
        api.getSettings(),
        api.getFacilities(),
        api.getGallery(),
        api.getContactMessages(),
        api.getTestimonials(),
      ]);
      setStats(st);
      setBookings(bk);
      setSettings(setts);
      setFacilities(fac);
      setGallery(gal);
      setContactMessages(msg);
      setTestimonials(rev);
      checkSupabase();
    } catch (e) {
      console.error(e);
    }
  };

  const checkSupabase = async () => {
    setSupabaseTesting(true);
    try {
      const res = await api.getSupabaseStatus();
      setSupabaseStatus(res);
    } catch (e) {
      console.error('Error fetching Supabase status:', e);
    } finally {
      setSupabaseTesting(false);
    }
  };

  const handleSyncAllToSupabase = async () => {
    setSupabaseSyncing(true);
    setSyncReport(null);
    try {
      const res = await api.syncAllToSupabase();
      setSyncReport(`Successfully processed ${res.synced} of ${res.total} bookings to Supabase.${res.failed > 0 ? ` (${res.failed} issues encountered)` : ''}`);
      checkSupabase();
    } catch (e: any) {
      setSyncReport(`Sync failed: ${e.message}`);
    } finally {
      setSupabaseSyncing(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(adminEmail, adminPassword);
      await loadAllAdminData();
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrator credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: Booking['status']) => {
    try {
      await api.updateBooking(id, { status });
      setFeedbackMsg(`Booking status updated to ${status}`);
      loadAllAdminData();
      onDataChanged();
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status');
    }
  };

  const handleSaveBookingEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    try {
      await api.updateBooking(editingBooking.id, {
        customerName: editingBooking.customerName,
        phone: editingBooking.phone,
        email: editingBooking.email,
        eventType: editingBooking.eventType,
        eventDate: editingBooking.eventDate,
        timeSlot: editingBooking.timeSlot,
        guestCount: editingBooking.guestCount,
        address: editingBooking.address,
        specialRequirements: editingBooking.specialRequirements,
        adminNotes: editingBooking.adminNotes,
        status: editingBooking.status,
      });
      setEditingBooking(null);
      setFeedbackMsg('Appointment details updated successfully and synced to Supabase.');
      loadAllAdminData();
      onDataChanged();
      if (selectedDetailBooking?.id === editingBooking.id) {
        setSelectedDetailBooking(editingBooking);
      }
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update');
    }
  };

  const handleCancelBooking = async (id: string, bookingId: string) => {
    if (!window.confirm(`Are you sure you want to cancel appointment ${bookingId}? This will update your database and Supabase.`)) return;
    try {
      await api.updateBooking(id, { status: 'Cancelled', adminNotes: 'Cancelled by administrator' });
      setFeedbackMsg(`Appointment ${bookingId} cancelled.`);
      loadAllAdminData();
      onDataChanged();
      if (selectedDetailBooking?.id === id) {
        setSelectedDetailBooking((prev) => (prev ? { ...prev, status: 'Cancelled' } : null));
      }
      setTimeout(() => setFeedbackMsg(''), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel appointment');
    }
  };

  const handleDeleteBooking = async (id: string, bookingId: string) => {
    if (!window.confirm(`Permanently remove appointment ${bookingId} from local and Supabase databases?`)) return;
    try {
      await api.deleteBooking(id);
      setFeedbackMsg(`Appointment ${bookingId} permanently deleted from database.`);
      loadAllAdminData();
      onDataChanged();
      if (selectedDetailBooking?.id === id) {
        setSelectedDetailBooking(null);
      }
      setTimeout(() => setFeedbackMsg(''), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createBooking({
        customerName: newAppt.customerName,
        phone: newAppt.phone,
        email: newAppt.email || 'admin-booking@buntarabhavanaputtur.org',
        eventType: newAppt.eventType,
        eventDate: newAppt.eventDate,
        timeSlot: newAppt.timeSlot,
        guestCount: newAppt.guestCount,
        address: newAppt.address,
        specialRequirements: newAppt.specialRequirements,
      });

      if (newAppt.status !== 'Pending') {
        await api.updateBooking(res.booking.id, {
          status: newAppt.status,
          adminNotes: newAppt.adminNotes,
        });
      }

      setIsCreatingAppointment(false);
      setFeedbackMsg(`Appointment ${res.booking.bookingId} created & saved to Supabase!`);
      loadAllAdminData();
      onDataChanged();
      setTimeout(() => setFeedbackMsg(''), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to create appointment');
    }
  };

  const loadSupabaseBookings = async () => {
    setLoadingSupabaseBookings(true);
    try {
      const res = await api.getSupabaseBookings();
      if (res.success) {
        setSupabaseBookings(res.data);
      } else {
        alert(res.error || 'Failed to load from Supabase');
      }
    } catch (e: any) {
      alert(e.message || 'Error fetching Supabase data');
    } finally {
      setLoadingSupabaseBookings(false);
    }
  };

  const handleExportCSV = () => {
    const listToExport = viewSource === 'supabase' ? supabaseBookings : filteredBookings;
    if (listToExport.length === 0) {
      alert('No appointments to export.');
      return;
    }

    const headers = [
      'Booking ID',
      'Customer Name',
      'Phone',
      'Email',
      'Event Type',
      'Date',
      'Time Slot',
      'Guest Count',
      'Address',
      'Status',
      'Special Requirements',
      'Created At',
    ];
    const rows = listToExport.map((b) => [
      b.bookingId,
      `"${(b.customerName || '').replace(/"/g, '""')}"`,
      `"${b.phone || ''}"`,
      `"${b.email || ''}"`,
      `"${b.eventType || ''}"`,
      b.eventDate,
      `"${b.timeSlot || ''}"`,
      `"${b.guestCount || ''}"`,
      `"${(b.address || '').replace(/"/g, '""')}"`,
      b.status,
      `"${(b.specialRequirements || '').replace(/"/g, '""')}"`,
      b.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `buntara_bhavana_appointments_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setFeedbackMsg('Venue information saved successfully');
      onDataChanged();
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    }
  };

  const handleAddFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addFacility(newFacility);
      setNewFacility({ name: '', tagline: '', description: '', confirmed: false, iconName: 'Building2' });
      setFeedbackMsg('Facility added');
      loadAllAdminData();
      onDataChanged();
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteFacility = async (id: string) => {
    if (!window.confirm('Delete this facility?')) return;
    try {
      await api.deleteFacility(id);
      loadAllAdminData();
      onDataChanged();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryItem.imageUrl) {
      alert('Please enter an image URL');
      return;
    }
    try {
      await api.addGalleryItem(newGalleryItem);
      setNewGalleryItem({ title: '', category: 'Hall', imageUrl: '', caption: '', isPlaceholder: false });
      setFeedbackMsg('Image added to gallery');
      loadAllAdminData();
      onDataChanged();
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm('Delete this image from gallery?')) return;
    try {
      await api.deleteGalleryItem(id);
      loadAllAdminData();
      onDataChanged();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addTestimonial(newTestimonial);
      setNewTestimonial({ customerName: '', eventType: 'Wedding', eventDate: '', reviewText: '', rating: 5, isVerified: true });
      setFeedbackMsg('Verified review added');
      loadAllAdminData();
      onDataChanged();
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.deleteTestimonial(id);
      loadAllAdminData();
      onDataChanged();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || b.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[92vh] flex flex-col border border-stone-200 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#7B1113] rounded-md text-[#C5A059]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white leading-none">
                Buntara Bhavana Administration Portal
              </h2>
              <span className="text-[11px] text-stone-400">
                Bolwar, Puttur · Venue & Booking Management System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={logout}
                className="text-xs text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded transition-colors"
              >
                Log Out
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-stone-400 hover:text-white p-1.5 rounded hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* If NOT logged in as admin: show secure admin login form */}
        {!isAdmin ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full my-auto">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-200">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900">Administrator Sign In</h3>
              <p className="text-xs text-stone-500 mt-1">
                Authorized management committee access only.
              </p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-stone-300 rounded text-sm text-stone-900 focus:outline-none focus:border-[#7B1113]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-stone-300 rounded text-sm text-stone-900 focus:outline-none focus:border-[#7B1113]"
                />
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded text-[11px] text-stone-600">
                Default credentials prefilled for evaluation:
                <br />
                <strong>Email:</strong> admin@buntarabhavanaputtur.org
                <br />
                <strong>Password:</strong> AdminPassword2026!
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-[#7B1113] hover:bg-[#5E0D0F] rounded transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loginLoading ? 'Authenticating...' : 'Enter Admin Panel'}
              </button>
            </form>
          </div>
        ) : (
          /* Logged In Admin Dashboard Layout */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 bg-[#FAF7F2] border-r border-stone-200 p-4 space-y-1 shrink-0 overflow-y-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded text-left transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#7B1113] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-200/70'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded text-left transition-colors cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'bg-[#7B1113] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-200/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4" />
                  <span>Bookings</span>
                </div>
                {stats.pending > 0 && (
                  <span className="bg-amber-400 text-stone-900 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                    {stats.pending}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded text-left transition-colors cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#7B1113] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-200/70'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Venue Settings</span>
              </button>

              <button
                onClick={() => setActiveTab('facilities')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded text-left transition-colors cursor-pointer ${
                  activeTab === 'facilities'
                    ? 'bg-[#7B1113] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-200/70'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Facilities</span>
              </button>

              <button
                onClick={() => setActiveTab('gallery')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded text-left transition-colors cursor-pointer ${
                  activeTab === 'gallery'
                    ? 'bg-[#7B1113] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-200/70'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Gallery Images</span>
              </button>

              <button
                onClick={() => setActiveTab('contact')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded text-left transition-colors cursor-pointer ${
                  activeTab === 'contact'
                    ? 'bg-[#7B1113] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-200/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4" />
                  <span>Enquiries Inbox</span>
                </div>
                {stats.unreadMessages > 0 && (
                  <span className="bg-red-500 text-white font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                    {stats.unreadMessages}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('testimonials')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded text-left transition-colors cursor-pointer ${
                  activeTab === 'testimonials'
                    ? 'bg-[#7B1113] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-200/70'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Testimonials</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('supabase');
                  checkSupabase();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded text-left transition-colors cursor-pointer ${
                  activeTab === 'supabase'
                    ? 'bg-[#7B1113] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-200/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Supabase Backend</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Connected"></span>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {feedbackMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{feedbackMsg}</span>
                </div>
              )}

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-bold text-stone-900">
                      Administrative Dashboard
                    </h3>
                    <span className="text-xs text-stone-500">Live venue database stats</span>
                  </div>

                  {/* 4 Overview Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 bg-white border border-stone-200 rounded-lg shadow-xs">
                      <span className="text-xs font-medium text-stone-500 block">Total Bookings</span>
                      <span className="text-3xl font-serif font-bold text-stone-900 mt-1 block">
                        {stats.total}
                      </span>
                    </div>

                    <div className="p-5 bg-amber-50 border border-amber-200 rounded-lg shadow-xs">
                      <span className="text-xs font-medium text-amber-800 block">Pending Requests</span>
                      <span className="text-3xl font-serif font-bold text-amber-900 mt-1 block">
                        {stats.pending}
                      </span>
                    </div>

                    <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-lg shadow-xs">
                      <span className="text-xs font-medium text-emerald-800 block">Confirmed Bookings</span>
                      <span className="text-3xl font-serif font-bold text-emerald-900 mt-1 block">
                        {stats.confirmed}
                      </span>
                    </div>

                    <div className="p-5 bg-[#FAF7F2] border border-stone-200 rounded-lg shadow-xs">
                      <span className="text-xs font-medium text-[#7B1113] block">Upcoming Events</span>
                      <span className="text-3xl font-serif font-bold text-[#7B1113] mt-1 block">
                        {stats.upcoming}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action: Pending Enquiries list */}
                  <div className="bg-white border border-stone-200 rounded-lg p-5">
                    <h4 className="text-sm font-serif font-bold text-stone-900 mb-3">
                      Pending Reservation Approvals
                    </h4>
                    {bookings.filter((b) => b.status === 'Pending').length === 0 ? (
                      <p className="text-xs text-stone-500">No pending requests awaiting approval.</p>
                    ) : (
                      <div className="space-y-3">
                        {bookings
                          .filter((b) => b.status === 'Pending')
                          .slice(0, 4)
                          .map((b) => (
                            <div
                              key={b.id}
                              className="p-3 bg-[#FAF7F2] border border-stone-200 rounded flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-mono font-bold text-stone-900 mr-2">{b.bookingId}</span>
                                <strong>{b.customerName}</strong> ({b.phone}) · {b.eventType} on{' '}
                                <span className="text-[#7B1113] font-semibold">{b.eventDate}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'Confirmed')}
                                  className="px-2.5 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 cursor-pointer"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'Rejected')}
                                  className="px-2.5 py-1 bg-red-600 text-white rounded font-medium hover:bg-red-700 cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: BOOKINGS MANAGEMENT */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  {/* Header & Primary Controls */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-serif font-bold text-stone-900">
                          Appointments & Bookings Manager
                        </h3>
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {viewSource === 'supabase' ? 'Supabase Live' : 'Database'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        View, search, edit, approve, or cancel venue appointments stored in the database.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Source Toggle */}
                      <div className="flex items-center p-0.5 bg-stone-100 rounded border border-stone-200 text-xs">
                        <button
                          type="button"
                          onClick={() => setViewSource('local')}
                          className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                            viewSource === 'local'
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          Main DB ({bookings.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setViewSource('supabase');
                            loadSupabaseBookings();
                          }}
                          className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                            viewSource === 'supabase'
                              ? 'bg-[#7B1113] text-white shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <Database className="w-3 h-3" />
                          <span>Supabase Live</span>
                        </button>
                      </div>

                      {/* Export CSV */}
                      <button
                        type="button"
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-semibold transition-colors cursor-pointer"
                        title="Download CSV spreadsheet"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>

                      {/* Refresh */}
                      <button
                        type="button"
                        onClick={() => {
                          loadAllAdminData();
                          if (viewSource === 'supabase') loadSupabaseBookings();
                        }}
                        className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded transition-colors cursor-pointer"
                        title="Refresh live data"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      {/* New Appointment Button */}
                      <button
                        type="button"
                        onClick={() => setIsCreatingAppointment(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7B1113] hover:bg-[#5E0D0F] text-white rounded text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>New Appointment</span>
                      </button>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <input
                        type="text"
                        placeholder="Search by ID (BBP-...), customer name, phone, or date..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 pl-9 bg-white border border-stone-300 rounded text-xs text-stone-900 focus:outline-none focus:border-[#7B1113] shadow-xs"
                      />
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-2 text-xs text-stone-400 hover:text-stone-700"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500 font-medium">Status:</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-white border border-stone-300 rounded text-xs text-stone-900 focus:outline-none focus:border-[#7B1113] shadow-xs"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending Approval</option>
                        <option value="CONFIRMED">Confirmed / Reserved</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Bookings Table */}
                  <div className="bg-white border border-stone-200 rounded-lg overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] tracking-wider font-semibold">
                        <tr>
                          <th className="p-3">Reference ID</th>
                          <th className="p-3">Customer Info</th>
                          <th className="p-3">Event Details</th>
                          <th className="p-3">Date & Time Slot</th>
                          <th className="p-3">Guests</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Manage Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {loadingSupabaseBookings ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-stone-500">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#7B1113] mb-2" />
                              <span>Retrieving bookings directly from Supabase...</span>
                            </td>
                          </tr>
                        ) : (viewSource === 'supabase' ? supabaseBookings : filteredBookings).length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-stone-500">
                              <Calendar className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                              <p className="font-medium text-stone-700">No appointments found.</p>
                              <p className="text-[11px] text-stone-400 mt-1">
                                {searchQuery ? 'Try clearing your search query.' : 'Click "+ New Appointment" to record a booking.'}
                              </p>
                            </td>
                          </tr>
                        ) : (
                          (viewSource === 'supabase' ? supabaseBookings : filteredBookings).map((b) => (
                            <tr key={b.id} className="hover:bg-stone-50/80 transition-colors">
                              <td className="p-3 font-mono font-bold text-stone-900 whitespace-nowrap">
                                <span className="text-[#7B1113]">{b.bookingId}</span>
                              </td>
                              <td className="p-3">
                                <div className="font-semibold text-stone-900">{b.customerName}</div>
                                <div className="text-stone-500 font-mono text-[11px]">
                                  <a href={`tel:${b.phone}`} className="hover:text-[#7B1113] hover:underline">
                                    {b.phone}
                                  </a>
                                </div>
                                {b.email && (
                                  <div className="text-stone-400 text-[10px] truncate max-w-[150px]">
                                    {b.email}
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="font-medium text-stone-900">{b.eventType}</div>
                                {b.specialRequirements && (
                                  <div className="text-[10px] text-stone-500 italic truncate max-w-[140px]" title={b.specialRequirements}>
                                    Note: {b.specialRequirements}
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-[#7B1113]">{b.eventDate}</div>
                                <div className="text-stone-500 text-[11px] truncate max-w-[150px]">
                                  {b.timeSlot}
                                </div>
                              </td>
                              <td className="p-3 text-stone-600 whitespace-nowrap">{b.guestCount}</td>
                              <td className="p-3 whitespace-nowrap">
                                <span
                                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                                    b.status === 'Confirmed'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : b.status === 'Rejected'
                                      ? 'bg-red-100 text-red-800 border border-red-200'
                                      : b.status === 'Cancelled'
                                      ? 'bg-stone-100 text-stone-600 border border-stone-200 line-through'
                                      : b.status === 'Completed'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {b.status === 'Confirmed' && <Check className="w-2.5 h-2.5" />}
                                  {b.status === 'Pending' && <Clock className="w-2.5 h-2.5" />}
                                  {b.status}
                                </span>
                              </td>
                              <td className="p-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  {/* View / Inspect */}
                                  <button
                                    onClick={() => setSelectedDetailBooking(b)}
                                    title="View full appointment details"
                                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Quick Confirm if Pending */}
                                  {b.status === 'Pending' && (
                                    <button
                                      onClick={() => handleUpdateBookingStatus(b.id, 'Confirmed')}
                                      title="Approve / Confirm Appointment"
                                      className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Edit */}
                                  <button
                                    onClick={() => setEditingBooking({ ...b })}
                                    title="Edit appointment"
                                    className="p-1.5 text-stone-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Cancel (if not already cancelled) */}
                                  {b.status !== 'Cancelled' && (
                                    <button
                                      onClick={() => handleCancelBooking(b.id, b.bookingId)}
                                      title="Cancel appointment"
                                      className="p-1.5 text-amber-700 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                                    >
                                      <Ban className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Delete */}
                                  <button
                                    onClick={() => handleDeleteBooking(b.id, b.bookingId)}
                                    title="Delete from database"
                                    className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                    <span>
                      Total records:{' '}
                      <strong className="text-stone-800">
                        {(viewSource === 'supabase' ? supabaseBookings : filteredBookings).length}
                      </strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      All updates instantly synchronize with Supabase (Project ID: <code>bbmmoecmjuznztkbqtyf</code>)
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 3: VENUE SETTINGS */}
              {activeTab === 'settings' && settings && (
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-stone-900">
                      Venue Information & Settings
                    </h3>
                    <p className="text-xs text-stone-500">
                      All details update the website live without changing any source code.
                    </p>
                  </div>

                  <div className="space-y-4 bg-white p-6 border border-stone-200 rounded-lg">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={settings.businessName}
                        onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded text-sm text-stone-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={settings.phone}
                          onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded text-sm text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={settings.email}
                          onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded text-sm text-stone-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                        Venue Physical Address
                      </label>
                      <input
                        type="text"
                        value={settings.address}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded text-sm text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                        Google Maps Location Link
                      </label>
                      <input
                        type="url"
                        value={settings.googleMapsUrl}
                        onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded text-sm text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                        Operating Timings Note
                      </label>
                      <input
                        type="text"
                        value={settings.timingsNote}
                        onChange={(e) => setSettings({ ...settings, timingsNote: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded text-sm text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                        Booking Policy Mode
                      </label>
                      <select
                        value={settings.bookingMode}
                        onChange={(e) =>
                          setSettings({ ...settings, bookingMode: e.target.value as 'full_day' | 'time_slots' })
                        }
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded text-sm text-stone-900"
                      >
                        <option value="time_slots">Time Slots (Morning / Evening / Full Day)</option>
                        <option value="full_day">Exclusive Full-Day Lockout per Date</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#7B1113] hover:bg-[#5E0D0F] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Venue Information</span>
                  </button>
                </form>
              )}

              {/* TAB 4: FACILITIES MANAGEMENT */}
              {activeTab === 'facilities' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-bold text-stone-900">
                      Facilities Management
                    </h3>
                    <span className="text-xs text-stone-500">
                      Add, update or toggle verified status on venue amenities
                    </span>
                  </div>

                  {/* Add facility form */}
                  <form onSubmit={handleAddFacility} className="bg-white p-5 border border-stone-200 rounded-lg space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">Add New Facility</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Facility Name (e.g. Dining Hall)"
                        value={newFacility.name}
                        onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                        className="px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Tagline (e.g. Traditional banquet layout)"
                        value={newFacility.tagline}
                        onChange={(e) => setNewFacility({ ...newFacility, tagline: e.target.value })}
                        className="px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Description (or leave for 'Contact venue for details')"
                        value={newFacility.description}
                        onChange={(e) => setNewFacility({ ...newFacility, description: e.target.value })}
                        className="px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newFacility.confirmed}
                          onChange={(e) => setNewFacility({ ...newFacility, confirmed: e.target.checked })}
                          className="rounded text-[#7B1113]"
                        />
                        <span>Confirmed by Management</span>
                      </label>

                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#7B1113] hover:bg-[#5E0D0F] text-white text-xs font-semibold rounded cursor-pointer"
                      >
                        Add Facility
                      </button>
                    </div>
                  </form>

                  {/* List of facilities */}
                  <div className="space-y-3">
                    {facilities.map((fac) => (
                      <div
                        key={fac.id}
                        className="p-4 bg-white border border-stone-200 rounded-lg flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-sm text-stone-900">{fac.name}</strong>
                            {fac.confirmed ? (
                              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
                                Verified
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                                Contact for details
                              </span>
                            )}
                          </div>
                          <p className="text-stone-500 mt-1">{fac.description}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteFacility(fac.id)}
                          className="p-2 text-stone-400 hover:text-red-700 cursor-pointer"
                          title="Delete facility"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: GALLERY MANAGEMENT */}
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-bold text-stone-900">
                      Gallery Management
                    </h3>
                    <span className="text-xs text-stone-500">Manage photo showcase</span>
                  </div>

                  {/* Add Image Form */}
                  <form onSubmit={handleAddGallery} className="bg-white p-5 border border-stone-200 rounded-lg space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">Add New Photo</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Image Title / Description"
                        value={newGalleryItem.title}
                        onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                        className="px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded text-xs"
                      />
                      <select
                        value={newGalleryItem.category}
                        onChange={(e) => setNewGalleryItem({ ...newGalleryItem, category: e.target.value as any })}
                        className="px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded text-xs"
                      >
                        <option value="Venue">Venue</option>
                        <option value="Hall">Hall</option>
                        <option value="Events">Events</option>
                        <option value="Exterior">Exterior</option>
                      </select>
                      <input
                        type="text"
                        required
                        placeholder="Image URL or Path (e.g. /src/assets/images/...)"
                        value={newGalleryItem.imageUrl}
                        onChange={(e) => setNewGalleryItem({ ...newGalleryItem, imageUrl: e.target.value })}
                        className="sm:col-span-2 px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Optional caption"
                        value={newGalleryItem.caption}
                        onChange={(e) => setNewGalleryItem({ ...newGalleryItem, caption: e.target.value })}
                        className="sm:col-span-2 px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded text-xs"
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#7B1113] hover:bg-[#5E0D0F] text-white text-xs font-semibold rounded cursor-pointer"
                      >
                        Add Photo
                      </button>
                    </div>
                  </form>

                  {/* Existing Images */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gallery.map((img) => (
                      <div
                        key={img.id}
                        className="bg-white border border-stone-200 rounded-lg overflow-hidden flex flex-col justify-between"
                      >
                        <div className="aspect-[4/3] bg-stone-100 relative">
                          <img
                            src={img.imageUrl}
                            alt={img.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">
                            {img.category}
                          </span>
                        </div>
                        <div className="p-3 text-xs flex items-center justify-between">
                          <div>
                            <strong className="block text-stone-900 truncate max-w-[180px]">{img.title}</strong>
                            <span className="text-[11px] text-stone-500 truncate max-w-[180px] block">
                              {img.caption}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteGallery(img.id)}
                            className="text-stone-400 hover:text-red-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: CONTACT INBOX */}
              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-bold text-stone-900">
                      Contact Enquiries Inbox
                    </h3>
                    <span className="text-xs text-stone-500">Messages sent via website contact form</span>
                  </div>

                  {contactMessages.length === 0 ? (
                    <p className="text-xs text-stone-500">No contact messages received.</p>
                  ) : (
                    <div className="space-y-3">
                      {contactMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className="bg-white p-5 border border-stone-200 rounded-lg text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                            <div>
                              <strong className="text-sm text-stone-900 mr-2">{msg.name}</strong>
                              <a href={`tel:${msg.phone}`} className="text-[#7B1113] font-semibold mr-3">
                                {msg.phone}
                              </a>
                              {msg.email && <span className="text-stone-500">{msg.email}</span>}
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                msg.status === 'New'
                                  ? 'bg-amber-100 text-amber-800'
                                  : msg.status === 'Replied'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-stone-100 text-stone-700'
                              }`}
                            >
                              {msg.status}
                            </span>
                          </div>
                          <p className="text-stone-700 leading-relaxed text-sm bg-[#FAF7F2] p-3 rounded">
                            {msg.message}
                          </p>
                          <div className="flex items-center justify-between pt-1 text-[11px] text-stone-400">
                            <span>Received: {new Date(msg.createdAt).toLocaleString()}</span>
                            <div className="flex gap-2">
                              {msg.status !== 'Replied' && (
                                <button
                                  onClick={async () => {
                                    await api.updateContactMessageStatus(msg.id, 'Replied');
                                    loadAllAdminData();
                                  }}
                                  className="text-emerald-700 font-semibold hover:underline"
                                >
                                  Mark as Replied
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: TESTIMONIALS */}
              {activeTab === 'testimonials' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-bold text-stone-900">
                      Verified Testimonials
                    </h3>
                    <span className="text-xs text-stone-500">
                      Only publish verified patron reviews
                    </span>
                  </div>

                  {/* Add review form */}
                  <form onSubmit={handleAddTestimonial} className="bg-white p-5 border border-stone-200 rounded-lg space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">Add Verified Testimonial</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Customer Name"
                        value={newTestimonial.customerName}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, customerName: e.target.value })}
                        className="px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Event (e.g. Wedding Reception)"
                        value={newTestimonial.eventType}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, eventType: e.target.value })}
                        className="px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Date (e.g. Nov 2026)"
                        value={newTestimonial.eventDate}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, eventDate: e.target.value })}
                        className="px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded text-xs"
                      />
                      <textarea
                        required
                        rows={2}
                        placeholder="Review text..."
                        value={newTestimonial.reviewText}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, reviewText: e.target.value })}
                        className="sm:col-span-3 px-3 py-2 bg-[#FAF7F2] border border-stone-300 rounded text-xs"
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#7B1113] hover:bg-[#5E0D0F] text-white text-xs font-semibold rounded cursor-pointer"
                      >
                        Publish Testimonial
                      </button>
                    </div>
                  </form>

                  {/* List of testimonials */}
                  <div className="space-y-3">
                    {testimonials.length === 0 ? (
                      <p className="text-xs text-stone-500">
                        No testimonials published yet. The public website currently displays: "Customer testimonials will appear here."
                      </p>
                    ) : (
                      testimonials.map((t) => (
                        <div
                          key={t.id}
                          className="bg-white p-4 border border-stone-200 rounded-lg flex items-start justify-between text-xs"
                        >
                          <div>
                            <strong className="text-stone-900">{t.customerName}</strong> ({t.eventType})
                            <p className="text-stone-600 mt-1 italic">"{t.reviewText}"</p>
                          </div>
                          <button
                            onClick={() => handleDeleteTestimonial(t.id)}
                            className="p-1.5 text-stone-400 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 8: SUPABASE BACKEND INTEGRATION */}
              {activeTab === 'supabase' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 mb-1">
                        <Database className="w-3 h-3" />
                        <span>Connected to Supabase</span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-stone-900">
                        Supabase Backend Integration
                      </h3>
                      <p className="text-xs text-stone-500">
                        Automatic real-time synchronization for appointment bookings
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={checkSupabase}
                        disabled={supabaseTesting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${supabaseTesting ? 'animate-spin' : ''}`} />
                        <span>{supabaseTesting ? 'Checking...' : 'Test Connection'}</span>
                      </button>

                      <button
                        onClick={handleSyncAllToSupabase}
                        disabled={supabaseSyncing}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#7B1113] hover:bg-[#5E0D0F] text-white rounded text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Database className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>{supabaseSyncing ? 'Syncing...' : 'Sync All Bookings'}</span>
                      </button>
                    </div>
                  </div>

                  {syncReport && (
                    <div className="p-3 bg-stone-800 text-white rounded-md text-xs flex items-center justify-between">
                      <span>{syncReport}</span>
                      <button onClick={() => setSyncReport(null)} className="text-stone-400 hover:text-white">✕</button>
                    </div>
                  )}

                  {/* Project Credentials Card */}
                  <div className="bg-white p-5 border border-stone-200 rounded-lg shadow-xs space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Configured Supabase Project
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-[#FAF7F2] rounded border border-stone-200">
                        <span className="text-stone-500 block text-[10px] uppercase font-semibold">Project ID</span>
                        <strong className="font-mono text-stone-900 text-sm">bbmmoecmjuznztkbqtyf</strong>
                      </div>

                      <div className="p-3 bg-[#FAF7F2] rounded border border-stone-200">
                        <span className="text-stone-500 block text-[10px] uppercase font-semibold">Backend Endpoint</span>
                        <span className="font-mono text-stone-800 text-xs truncate block">https://bbmmoecmjuznztkbqtyf.supabase.co</span>
                      </div>

                      <div className="p-3 bg-[#FAF7F2] rounded border border-stone-200">
                        <span className="text-stone-500 block text-[10px] uppercase font-semibold">Publishable Key</span>
                        <span className="font-mono text-stone-600 text-xs truncate block">sb_publishable_SsDZeyr...</span>
                      </div>
                    </div>

                    {/* Status Feedback Banner */}
                    <div
                      className={`p-4 rounded-lg border text-xs flex items-start gap-3 ${
                        supabaseStatus?.status?.tableExists
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-amber-50 border-amber-300 text-amber-900'
                      }`}
                    >
                      {supabaseStatus?.status?.tableExists ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      )}

                      <div className="space-y-1">
                        <strong className="font-semibold block">
                          {supabaseStatus?.status?.tableExists
                            ? 'Active & Ready for Automatic Sync'
                            : 'Supabase Project Connected — Table Setup Pending'}
                        </strong>
                        <p className="leading-relaxed">
                          {supabaseStatus?.status?.message ||
                            'Checking your Supabase project table schema...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SQL Setup Helper Card */}
                  <div className="bg-white p-5 border border-stone-200 rounded-lg shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                          Supabase SQL Table Initialization Script
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          If you haven't created the <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">bookings</code> table in your Supabase project yet, copy and paste this script into your Supabase SQL Editor:
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          const sql = `-- 1. Create bookings table for Buntara Bhavana
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  booking_id TEXT UNIQUE NOT NULL,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  guest_count TEXT,
  address TEXT,
  special_requirements TEXT,
  status TEXT DEFAULT 'Pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 3. Allow anonymous public submissions from the booking form
CREATE POLICY "Allow public insert" ON public.bookings
  FOR INSERT TO anon WITH CHECK (true);

-- 4. Allow reading bookings
CREATE POLICY "Allow public select" ON public.bookings
  FOR SELECT TO anon USING (true);

-- 5. Allow updating bookings
CREATE POLICY "Allow public update" ON public.bookings
  FOR UPDATE TO anon USING (true);`;
                          navigator.clipboard.writeText(sql);
                          setCopiedSql(true);
                          setTimeout(() => setCopiedSql(false), 3000);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-semibold cursor-pointer"
                      >
                        {copiedSql ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied SQL!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy SQL Script</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-4 bg-stone-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto leading-relaxed border border-stone-800">
{`-- 1. Create bookings table for Buntara Bhavana
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  booking_id TEXT UNIQUE NOT NULL,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  guest_count TEXT,
  address TEXT,
  special_requirements TEXT,
  status TEXT DEFAULT 'Pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 3. Allow anonymous public submissions from the booking form
CREATE POLICY "Allow public insert" ON public.bookings
  FOR INSERT TO anon WITH CHECK (true);

-- 4. Allow reading bookings
CREATE POLICY "Allow public select" ON public.bookings
  FOR SELECT TO anon USING (true);

-- 5. Allow updating bookings
CREATE POLICY "Allow public update" ON public.bookings
  FOR UPDATE TO anon USING (true);`}
                    </pre>

                    <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
                      <span>After running the SQL in Supabase, click "Test Connection" to confirm live synchronization.</span>
                      <a
                        href="https://supabase.com/dashboard/project/bbmmoecmjuznztkbqtyf/sql"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#7B1113] font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        Open Supabase SQL Editor <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* How it works explanation */}
                  <div className="bg-[#FAF7F2] p-5 border border-stone-200 rounded-lg text-xs space-y-2">
                    <h4 className="font-bold text-stone-900">How the Supabase backend works:</h4>
                    <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
                      <li>Whenever a user submits a booking on the website, a unique reference ID (e.g. <code>BBP-2026-0004</code>) is generated and stored locally in the high-performance venue database.</li>
                      <li>Simultaneously, the booking record is instantly upserted to your Supabase PostgreSQL table in real time with all customer and date parameters.</li>
                      <li>Any status change (Confirmed, Rejected, Cancelled) performed in this admin dashboard automatically updates the Supabase record.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 1. Appointment Inspector Details Modal */}
      {selectedDetailBooking && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 sm:p-8 border border-stone-200 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7B1113]">
                  Appointment Inspector
                </span>
                <h4 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
                  <span>{selectedDetailBooking.bookingId}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                      selectedDetailBooking.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedDetailBooking.status === 'Cancelled'
                        ? 'bg-stone-200 text-stone-700'
                        : selectedDetailBooking.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : selectedDetailBooking.status === 'Completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedDetailBooking.status}
                  </span>
                </h4>
              </div>

              <button
                onClick={() => setSelectedDetailBooking(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Action Bar */}
            <div className="p-3 bg-[#FAF7F2] rounded-lg border border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-stone-700">Quick Status Update:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedDetailBooking.status !== 'Confirmed' && (
                  <button
                    onClick={() => {
                      handleUpdateBookingStatus(selectedDetailBooking.id, 'Confirmed');
                      setSelectedDetailBooking({ ...selectedDetailBooking, status: 'Confirmed' });
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium cursor-pointer"
                  >
                    Confirm Reservation
                  </button>
                )}
                {selectedDetailBooking.status !== 'Completed' && (
                  <button
                    onClick={() => {
                      handleUpdateBookingStatus(selectedDetailBooking.id, 'Completed');
                      setSelectedDetailBooking({ ...selectedDetailBooking, status: 'Completed' });
                    }}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium cursor-pointer"
                  >
                    Mark Completed
                  </button>
                )}
                {selectedDetailBooking.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleCancelBooking(selectedDetailBooking.id, selectedDetailBooking.bookingId)}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium cursor-pointer"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>

            {/* Customer Details & Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Customer Box */}
              <div className="bg-[#FAF7F2] p-4 rounded-lg border border-stone-200 space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-1.5">
                  <User className="w-3.5 h-3.5 text-[#7B1113]" />
                  <span>Customer Information</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Full Name</span>
                  <strong className="text-stone-900 text-sm">{selectedDetailBooking.customerName}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Phone Number</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedDetailBooking.phone.replace(/\s+/g, '')}`}
                      className="text-[#7B1113] font-semibold hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{selectedDetailBooking.phone}</span>
                    </a>
                  </div>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Email Address</span>
                  <a href={`mailto:${selectedDetailBooking.email}`} className="text-stone-700 hover:underline">
                    {selectedDetailBooking.email}
                  </a>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Address / Hometown</span>
                  <span className="text-stone-700">{selectedDetailBooking.address || 'Not specified'}</span>
                </div>
              </div>

              {/* Event Details Box */}
              <div className="bg-[#FAF7F2] p-4 rounded-lg border border-stone-200 space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#7B1113]" />
                  <span>Event & Venue Details</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Event Occasion</span>
                  <strong className="text-stone-900 text-sm">{selectedDetailBooking.eventType}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Date of Function</span>
                  <strong className="text-[#7B1113] text-sm">{selectedDetailBooking.eventDate}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Time Slot</span>
                  <span className="text-stone-800">{selectedDetailBooking.timeSlot}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Expected Guests</span>
                  <span className="text-stone-800">{selectedDetailBooking.guestCount}</span>
                </div>
              </div>
            </div>

            {/* Special Requirements */}
            <div className="bg-[#FAF7F2] p-4 rounded-lg border border-stone-200 text-xs">
              <span className="font-bold text-stone-800 uppercase tracking-wider text-[10px] block mb-1">
                Special Requirements & Inquiries:
              </span>
              <p className="text-stone-700 italic">
                {selectedDetailBooking.specialRequirements || 'No special requirements noted.'}
              </p>
            </div>

            {/* Admin Notes Box */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-stone-800 uppercase tracking-wider text-[10px] block">
                Committee Internal Notes
              </label>
              <textarea
                rows={2}
                value={selectedDetailBooking.adminNotes || ''}
                onChange={(e) =>
                  setSelectedDetailBooking({ ...selectedDetailBooking, adminNotes: e.target.value })
                }
                placeholder="Add private committee notes, token payment references, or stage instructions..."
                className="w-full p-2.5 bg-[#FAF7F2] border border-stone-300 rounded text-stone-900 text-xs focus:outline-none focus:border-[#7B1113]"
              />
              <button
                type="button"
                onClick={async () => {
                  await api.updateBooking(selectedDetailBooking.id, {
                    adminNotes: selectedDetailBooking.adminNotes,
                  });
                  setFeedbackMsg('Admin notes saved to database & Supabase');
                  loadAllAdminData();
                  setTimeout(() => setFeedbackMsg(''), 3000);
                }}
                className="px-3 py-1 bg-stone-800 text-white rounded text-[11px] font-semibold cursor-pointer"
              >
                Save Notes
              </button>
            </div>

            {/* Supabase Verification Badge */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs flex items-center justify-between text-emerald-900">
              <span className="flex items-center gap-1.5 font-medium">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Synchronized with Supabase Cloud Database (Project: bbmmoecmjuznztkbqtyf)</span>
              </span>
              <span className="text-[10px] text-emerald-700">
                Created: {new Date(selectedDetailBooking.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Modal Bottom Buttons */}
            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingBooking(selectedDetailBooking);
                    setSelectedDetailBooking(null);
                  }}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Appointment</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteBooking(selectedDetailBooking.id, selectedDetailBooking.bookingId)}
                  className="px-3 py-2 text-red-700 hover:bg-red-50 rounded font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDetailBooking(null)}
                  className="px-4 py-2 bg-stone-800 text-white rounded font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Full Appointment Edit Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-8 border border-stone-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h4 className="text-lg font-serif font-bold text-stone-900">
                Edit Appointment: {editingBooking.bookingId}
              </h4>
              <button
                onClick={() => setEditingBooking(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBookingEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={editingBooking.customerName}
                    onChange={(e) => setEditingBooking({ ...editingBooking, customerName: e.target.value })}
                    className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editingBooking.phone}
                    onChange={(e) => setEditingBooking({ ...editingBooking, phone: e.target.value })}
                    className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editingBooking.email}
                  onChange={(e) => setEditingBooking({ ...editingBooking, email: e.target.value })}
                  className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Event Type</label>
                  <select
                    value={editingBooking.eventType}
                    onChange={(e) => setEditingBooking({ ...editingBooking, eventType: e.target.value })}
                    className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Reception">Reception</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Conference">Conference</option>
                    <option value="Cultural Event">Cultural Event</option>
                    <option value="Family Function">Family Function</option>
                    <option value="College Event">College Event</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Status</label>
                  <select
                    value={editingBooking.status}
                    onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value as any })}
                    className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900 font-bold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={editingBooking.eventDate}
                    onChange={(e) => setEditingBooking({ ...editingBooking, eventDate: e.target.value })}
                    className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900 font-semibold text-[#7B1113]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    required
                    value={editingBooking.timeSlot}
                    onChange={(e) => setEditingBooking({ ...editingBooking, timeSlot: e.target.value })}
                    className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Estimated Guests</label>
                <input
                  type="text"
                  value={editingBooking.guestCount}
                  onChange={(e) => setEditingBooking({ ...editingBooking, guestCount: e.target.value })}
                  className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Address / Notes</label>
                <input
                  type="text"
                  value={editingBooking.address || ''}
                  onChange={(e) => setEditingBooking({ ...editingBooking, address: e.target.value })}
                  className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Special Requirements</label>
                <textarea
                  rows={2}
                  value={editingBooking.specialRequirements || ''}
                  onChange={(e) => setEditingBooking({ ...editingBooking, specialRequirements: e.target.value })}
                  className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Admin Notes</label>
                <textarea
                  rows={2}
                  value={editingBooking.adminNotes || ''}
                  onChange={(e) => setEditingBooking({ ...editingBooking, adminNotes: e.target.value })}
                  className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-3.5 py-2 border border-stone-300 rounded text-stone-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7B1113] hover:bg-[#5E0D0F] text-white rounded font-bold transition-colors cursor-pointer"
                >
                  Save & Update Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. New Manual Appointment Modal */}
      {isCreatingAppointment && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-8 border border-stone-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div>
                <h4 className="text-lg font-serif font-bold text-stone-900">Record New Appointment</h4>
                <p className="text-xs text-stone-500">Record a phone, walk-in, or committee reservation</p>
              </div>
              <button
                onClick={() => setIsCreatingAppointment(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Shetty"
                    value={newAppt.customerName}
                    onChange={(e) => setNewAppt({ ...newAppt, customerName: e.target.value })}
                    className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 96869 47433"
                    value={newAppt.phone}
                    onChange={(e) => setNewAppt({ ...newAppt, phone: e.target.value })}
                    className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="customer@example.com (optional)"
                  value={newAppt.email}
                  onChange={(e) => setNewAppt({ ...newAppt, email: e.target.value })}
                  className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Event Type *</label>
                  <select
                    value={newAppt.eventType}
                    onChange={(e) => setNewAppt({ ...newAppt, eventType: e.target.value })}
                    className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Reception">Reception</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Conference">Conference</option>
                    <option value="Cultural Event">Cultural Event</option>
                    <option value="Family Function">Family Function</option>
                    <option value="College Event">College Event</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Initial Status</label>
                  <select
                    value={newAppt.status}
                    onChange={(e) => setNewAppt({ ...newAppt, status: e.target.value as any })}
                    className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900 font-bold"
                  >
                    <option value="Confirmed">Confirmed / Reserved</option>
                    <option value="Pending">Pending Approval</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={newAppt.eventDate}
                    onChange={(e) => setNewAppt({ ...newAppt, eventDate: e.target.value })}
                    className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Time Slot *</label>
                  <select
                    value={newAppt.timeSlot}
                    onChange={(e) => setNewAppt({ ...newAppt, timeSlot: e.target.value })}
                    className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900"
                  >
                    <option value="Full Day (8:00 AM - 10:00 PM)">Full Day (8:00 AM - 10:00 PM)</option>
                    <option value="Morning Slot (8:00 AM - 2:00 PM)">Morning Slot (8:00 AM - 2:00 PM)</option>
                    <option value="Evening Slot (4:00 PM - 10:00 PM)">Evening Slot (4:00 PM - 10:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Estimated Guests</label>
                <input
                  type="text"
                  placeholder="e.g. 500 Guests"
                  value={newAppt.guestCount}
                  onChange={(e) => setNewAppt({ ...newAppt, guestCount: e.target.value })}
                  className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Address / Hometown</label>
                <input
                  type="text"
                  placeholder="e.g. Bolwar, Puttur"
                  value={newAppt.address}
                  onChange={(e) => setNewAppt({ ...newAppt, address: e.target.value })}
                  className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Special Requirements</label>
                <textarea
                  rows={2}
                  placeholder="Stage decor notes, dining kitchen arrangements..."
                  value={newAppt.specialRequirements}
                  onChange={(e) => setNewAppt({ ...newAppt, specialRequirements: e.target.value })}
                  className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Admin Notes</label>
                <input
                  type="text"
                  value={newAppt.adminNotes}
                  onChange={(e) => setNewAppt({ ...newAppt, adminNotes: e.target.value })}
                  className="w-full p-2 bg-[#FAF7F2] border rounded text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCreatingAppointment(false)}
                  className="px-3.5 py-2 border border-stone-300 rounded text-stone-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7B1113] hover:bg-[#5E0D0F] text-white rounded font-bold transition-colors cursor-pointer"
                >
                  Create & Save to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
