import { motion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, LayoutDashboard, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/src/lib/utils';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/#about' },
    { name: 'Features', path: '/#features' },
  ];

  const authLinks = [
    { name: 'Dashboard', path: `/${userRole}-dashboard`, icon: LayoutDashboard },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform shadow-sm">
              S
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">
              SmartDonation
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {!isAuthenticated ? (
              <>
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.path}
                    className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-sm"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                {authLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors",
                      location.pathname === link.path
                        ? "text-blue-600"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600 hover:text-slate-900"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-slate-100 px-4 py-6"
        >
          <div className="flex flex-col gap-4">
            {!isAuthenticated ? (
              <>
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.path}
                    className="text-lg font-medium text-slate-600"
                  >
                    {link.name}
                  </a>
                ))}
                <hr className="border-slate-100" />
                <Link to="/login" className="text-lg font-medium text-slate-600">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-slate-900 text-white text-center py-3 rounded-2xl font-medium"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                {authLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="flex items-center gap-3 text-lg font-medium text-slate-600"
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-lg font-medium text-red-500"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};
