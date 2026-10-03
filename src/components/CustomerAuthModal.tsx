import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Booking } from '../types.ts';
import { api } from '../services/api.ts';
import { X, User, Lock, Mail, Phone, Calendar, Clock, AlertCircle, CheckCircle2, Loader2, Ban } from 'lucide-react';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
}) => {
  const { user, login, register, logout } = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'my-bookings'>(initialTab);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Bookings list state for logged in user
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setTab('my-bookings');
      loadMyBookings();
    } else {
      setTab(initialTab);
    }
  }, [user, initialTab, isOpen]);

  const loadMyBookings = async () => {
    setLoadingBookings(true);
    try {
      const list = await api.getBookings();
      setUserBookings(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBookings(false);
    }
  };

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await login(email, password);
      setTab('my-bookings');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await register(name, email, phone, password);
      setTab('my-bookings');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      await api.updateBooking(id, { action: 'cancel' });
      setSuccessMsg('Booking cancelled successfully');
      loadMyBookings();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-xl w-full p-6 sm:p-8 border border-stone-200 shadow-2xl relative">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1.5 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Header if NOT logged in */}
        {!user ? (
          <div className="flex border-b border-stone-200 mb-6">
            <button
              onClick={() => {
                setTab('login');
                setErrorMsg('');
              }}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                tab === 'login'
                  ? 'border-[#7B1113] text-[#7B1113]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Customer Sign In
            </button>
            <button
              onClick={() => {
                setTab('register');
                setErrorMsg('');
              }}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                tab === 'register'
                  ? 'border-[#7B1113] text-[#7B1113]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Create Account
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
            <div>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                Customer Dashboard
              </h3>
              <p className="text-xs text-stone-500">
                Logged in as <strong>{user.name}</strong> ({user.email})
              </p>
            </div>
            <button
              onClick={logout}
              className="text-xs text-stone-600 hover:text-red-700 underline font-medium cursor-pointer"
            >
              Log Out
            </button>
          </div>
        )}

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab: LOGIN */}
        {!user && tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:border-[#7B1113]"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:border-[#7B1113]"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-[#7B1113] hover:bg-[#5E0D0F] rounded-md transition-colors cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Tab: REGISTER */}
        {!user && tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Santhosh Rai"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:border-[#7B1113]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:border-[#7B1113]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                placeholder="+91 96869 47433"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:border-[#7B1113]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-stone-300 rounded-md text-sm text-stone-900 focus:outline-none focus:border-[#7B1113]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-[#7B1113] hover:bg-[#5E0D0F] rounded-md transition-colors cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        )}

        {/* Tab: MY BOOKINGS (Logged In Customer) */}
        {user && tab === 'my-bookings' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
              My Reservation Enquiries
            </h4>

            {loadingBookings ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#7B1113]" />
              </div>
            ) : userBookings.length === 0 ? (
              <div className="text-center p-8 bg-[#FAF7F2] rounded-lg border border-dashed border-stone-300">
                <Calendar className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-xs text-stone-600">You do not have any bookings submitted yet.</p>
                <a
                  href="#booking"
                  onClick={onClose}
                  className="mt-3 inline-block text-xs font-semibold text-[#7B1113] underline"
                >
                  Start a new booking request →
                </a>
              </div>
            ) : (
              userBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#FAF7F2] p-4 rounded-lg border border-stone-200 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                    <span className="font-mono font-bold text-stone-900">{b.bookingId}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        b.status === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'Cancelled'
                          ? 'bg-stone-200 text-stone-700'
                          : b.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-stone-700">
                    <div>
                      <span className="text-stone-500 block text-[10px]">Event Type:</span>
                      <strong>{b.eventType}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px]">Date:</span>
                      <strong>{b.eventDate}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-stone-500 block text-[10px]">Slot:</span>
                      <span>{b.timeSlot}</span>
                    </div>
                  </div>

                  {b.status === 'Pending' && (
                    <div className="pt-2 border-t border-stone-200 flex justify-end">
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="text-[11px] text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Ban className="w-3 h-3" />
                        Cancel Request
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
