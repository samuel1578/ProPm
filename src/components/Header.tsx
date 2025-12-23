import { useEffect, useState, Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, ChevronDown, User as UserIcon, LogOut, BookOpen, X } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import lightLogo from '../assets/logo-light.png';
import darkLogo from '../assets/logo-dark.png';
import MobileMenu from './MobileMenu';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Courses', path: '/courses' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Contact', path: '/contact' },
];

export default function Header() {
  const location = useLocation();
  const { darkMode, setDarkMode } = useTheme();
  const logo = darkMode ? darkLogo : lightLogo;
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const { user, signOut, initializing } = useAuth();

  const fullName = user?.name?.trim() || user?.email?.split('@')[0] || '';
  const firstName = fullName ? fullName.split(' ')[0] : '';
  const avatarInitial = firstName ? firstName.charAt(0).toUpperCase() : user?.email?.charAt(0)?.toUpperCase() || '?';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Failed to sign out', err);
      alert('Unable to sign out right now. Please try again.');
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      style={{ fontFamily: "'Poppins', 'Inter', 'SF Pro Display', 'Helvetica Neue', sans-serif" }}
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ease-out ${isScrolled
        ? 'bg-white sm:bg-white/75 dark:bg-[#080A12] backdrop-blur-2xl border-white/20 shadow-[0_12px_40px_rgba(3,9,30,0.45)]'
        : 'bg-white sm:bg-white/60 dark:bg-[#080A12] backdrop-blur-xl border-white/10 shadow-[0_25px_65px_rgba(4,10,25,0.55)]'
        }`}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isScrolled ? 'py-2.5' : 'py-4'
          }`}
      >
        <div className="flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center" aria-label="ProPM home">
            <img src={logo} alt="ProPM" className="site-logo object-contain md:block transition-all duration-150" />
          </Link>

          <nav className="hidden flex-1 justify-center md:flex">
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#0c1a37]/60 px-3 py-2 shadow-[0_20px_60px_rgba(5,10,45,0.45)] backdrop-blur-md">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={active ? 'page' : undefined}
                    className={`group relative px-4 py-2 text-base font-medium tracking-tight transition-all duration-200 ease-out ${active ? 'text-white' : 'text-slate-200/80 hover:text-white'
                      }`}
                  >
                    <span className="relative z-10">{item.name}</span>
                    <span
                      className={`absolute inset-0 rounded-2xl transition-all duration-300 ease-out ${active
                        ? 'opacity-100 bg-white/10'
                        : 'opacity-0 group-hover:opacity-100 group-hover:bg-white/5'
                        }`}
                    />
                    <span
                      className={`pointer-events-none absolute left-1/2 top-full w-8 -translate-x-1/2 transform rounded-full transition-all duration-300 ease-out ${active
                        ? 'h-1.5 bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-600 shadow-[0_12px_25px_rgba(56,189,248,0.55)]'
                        : 'h-px scale-x-50 bg-sky-300/0 opacity-0 group-hover:scale-100 group-hover:bg-sky-300/70 group-hover:opacity-100'
                        }`}
                    />
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {!initializing && user && (
              <div
                className="relative"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/80 px-4 py-2 text-slate-800 shadow-sm backdrop-blur dark:border-white/20 dark:bg-white/10 dark:text-white cursor-pointer">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-sky-500 to-indigo-600 text-base font-semibold text-white shadow-lg">
                    {avatarInitial}
                  </div>
                  <div className="leading-tight">
                    <span className="block text-xs font-medium text-slate-500 dark:text-slate-300/80">Welcome</span>
                    <span className="block text-sm font-semibold uppercase tracking-wide">{firstName || 'Explorer'}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                </div>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0b1b36] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2 z-50">
                    <Link
                      to="/userprofile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#0d2244] transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Edit Your Profile</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={() => {
                        setShowPortalModal(true);
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Course Portal</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {!initializing && !user && (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 text-base font-semibold tracking-tight rounded-xl border border-cyan-400/70 text-cyan-100/90 transition duration-200 ease-out hover:border-cyan-300 hover:bg-cyan-400/10 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 text-base font-semibold tracking-tight text-slate-900 rounded-xl bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-600 shadow-[0_18px_40px_rgba(56,189,248,0.5)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_26px_55px_rgba(56,189,248,0.65)]"
                >
                  Sign Up
                </Link>
              </>
            )}

            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle color theme"
              className="p-2 rounded-2xl border border-white/15 text-slate-600 transition duration-200 ease-out hover:bg-white/15 hover:text-white dark:text-white/90"
            >
              {darkMode ? <Sun className="w-5 h-5 text-cyan-200" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>

          <div className="md:hidden">
            <MobileMenu navItems={navItems} logo={logo} />
          </div>
        </div>
      </div>

      {/* Course Portal Modal */}
      <Transition show={showPortalModal} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-[60]" onClose={() => setShowPortalModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl p-8 text-center shadow-2xl transition-all ${darkMode ? 'bg-[#0b1b36]' : 'bg-white'}`}>
                  <div className="mb-6">
                    <img src={logo} alt="ProPM" className="h-16 w-auto mx-auto mb-4" />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Coming Soon
                  </h3>
                  <p className={`text-sm mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    The Course Portal is still under development and will be released in Phase 2.
                  </p>
                  <button
                    onClick={() => setShowPortalModal(false)}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </header>
  );
}
