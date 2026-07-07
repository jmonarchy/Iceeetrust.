import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/programs', label: 'Programs' },
    { path: '/impact-stories', label: 'Impact Stories' },
    { path: '/news-events', label: 'News & Events' },
    { path: '/volunteer', label: 'Volunteer' },
    { path: '/grant-maker-portal', label: 'Grant Maker Portal' },
    { path: '/transparency', label: 'Transparency' },
    { path: '/contact', label: 'Contact' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-2xl">IT</span>
            </div>
            <span className="font-bold text-2xl tracking-tight text-foreground hidden sm:block">ICEEE TRUST</span>
          </Link>

          <nav className="hidden xl:flex items-center space-x-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden xl:flex items-center space-x-4">
            {!isAuthenticated ? (
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Admin Login
              </Link>
            ) : (
              <>
                <Link to="/admin/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            )}
            <Link to="/donate">
              <Button className="gap-2 shadow-md hover:shadow-lg transition-all">
                <Heart className="w-4 h-4" />
                Donate
              </Button>
            </Link>
          </div>

          <button
            className="xl:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-border bg-background absolute w-full shadow-lg">
          <nav className="px-4 py-4 space-y-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-border space-y-4">
              <Link to="/donate" onClick={() => setMobileMenuOpen(false)} className="block">
                <Button className="w-full gap-2 h-12 text-lg">
                  <Heart className="w-5 h-5" />
                  Donate Now
                </Button>
              </Link>
              {!isAuthenticated ? (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-center py-2 text-muted-foreground font-medium">
                  Admin Login
                </Link>
              ) : (
                <>
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-center py-2 text-primary font-medium flex items-center justify-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                  <Button variant="outline" className="w-full" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                    Logout
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;