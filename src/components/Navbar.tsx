import React, { useState } from 'react';
import { Menu, X, User as UserIcon, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  onOpenAuth: (initialTab?: 'login' | 'register') => void;
  onOpenAdmin: () => void;
  onSelectDateForBooking?: (date: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenAdmin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Facilities', href: '#facilities' },
    { label: 'Events', href: '#events' },
    { label: 'Availability', href: '#availability' },
    { label: 'Booking', href: '#booking' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-stone-200/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, '#home')}
          className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#7B1113] hover:text-[#5E0D0F] transition-colors shrink-0"
        >
          BUNTARA BHAVANA
        </a>

        {/* Zone 2: Navigation Links (Clean text links with hover state) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-700">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="hover:text-[#7B1113] transition-colors relative py-1 text-[13px] tracking-wide uppercase after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#7B1113] hover:after:w-full after:transition-all after:duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
                  title="Admin Dashboard"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-700" />
                  <span>Admin Panel</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-md hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                  <span className="truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
                </button>
              )}
              <button
                onClick={logout}
                className="p-2 text-stone-500 hover:text-[#7B1113] hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs font-medium text-stone-700 hover:text-[#7B1113] px-2.5 py-1.5 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-300 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer shadow-2xs"
                title="Open Venue Management Admin Portal"
              >
                <Shield className="w-3.5 h-3.5 text-[#7B1113]" />
                <span>Admin</span>
              </button>
            </div>
          )}

          <a
            href="#availability"
            onClick={(e) => handleNavClick(e, '#availability')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#7B1113] hover:bg-[#5E0D0F] border border-[#7B1113] rounded-md shadow-sm transition-all duration-150 whitespace-nowrap cursor-pointer hover:shadow-md"
          >
            Check Availability
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href="#availability"
            onClick={(e) => handleNavClick(e, '#availability')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#7B1113] rounded-md"
          >
            Availability
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-700 hover:text-stone-900 rounded-md hover:bg-stone-100"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-stone-200 bg-[#FAF7F2] px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="block px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100 rounded-md"
            >
              {link.label}
            </a>
          ))}

          <div className="pt-4 border-t border-stone-200 flex flex-col gap-2">
            {user ? (
              <>
                <div className="text-xs text-stone-500 px-3">Signed in as {user.name} ({user.role})</div>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdmin();
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-900 bg-amber-50 border border-amber-200 rounded-md"
                  >
                    <Shield className="w-4 h-4 text-amber-700" />
                    Open Admin Panel
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100 rounded-md"
                >
                  <UserIcon className="w-4 h-4 text-stone-600" />
                  My Bookings
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="flex-1 py-2 text-sm font-medium text-stone-800 border border-stone-300 rounded-md text-center bg-white"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('register');
                    }}
                    className="flex-1 py-2 text-sm font-medium text-white bg-[#7B1113] rounded-md text-center"
                  >
                    Register
                  </button>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-md text-center"
                >
                  <Shield className="w-3.5 h-3.5 text-[#7B1113]" />
                  <span>Admin Management Portal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
