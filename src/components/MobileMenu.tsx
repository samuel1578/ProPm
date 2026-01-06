import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Menu, X, Moon, Sun, User as UserIcon, LogOut, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../lib/appwrite';

interface NavItem {
    name: string;
    path: string;
}

export default function MobileMenu({ navItems, logo }: { navItems: NavItem[]; logo?: string }) {
    const [open, setOpen] = useState(false);
    const [showPortalModal, setShowPortalModal] = useState(false);
    const [profileCompleted, setProfileCompleted] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const { darkMode, setDarkMode } = useTheme();
    const { user, signOut } = useAuth();

    const itemVariants = {
        hidden: { opacity: 0, x: 16 },
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: { delay: 0.05 * i, duration: 0.28, ease: [0.4, 0, 0.2, 1] },
        }),
    };
    const MotionLink = motion(Link);

    const fullName = user?.name?.trim() || user?.email?.split('@')[0] || '';
    const firstName = fullName ? fullName.split(' ')[0] : '';
    const avatarInitial = firstName ? firstName.charAt(0).toUpperCase() : user?.email?.charAt(0)?.toUpperCase() || '?';

    useEffect(() => {
        if (user?.$id) {
            // Check if user is admin (based on Appwrite labels or prefs)
            const adminCheck = user?.labels?.includes('admin') || user?.prefs?.role === 'admin';
            console.log('Admin check in MobileMenu:', {
                userId: user.$id,
                labels: user?.labels,
                prefs: user?.prefs,
                adminCheck
            });
            setIsAdmin(adminCheck);

            getUserProfile(user.$id)
                .then(res => {
                    if (res?.document) {
                        setProfileCompleted(res.document.profileCompleted || false);
                        // Check if profile has isAdmin flag
                        if (res.document.isAdmin === true) {
                            console.log('User is admin from profile');
                            setIsAdmin(true);
                        }
                    }
                })
                .catch(err => console.error('Failed to load profile status', err));
        }
    }, [user]);

    const handleSignOut = async () => {
        try {
            await signOut();
            setOpen(false);
        } catch (err) {
            console.error('Failed to sign out', err);
            alert('Unable to sign out right now. Please try again.');
        }
    };

    return (
        <div className="md:hidden">
            <button
                aria-label={open ? 'Close menu' : 'Open menu'}
                onClick={() => setOpen(true)}
                className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                <span className="relative w-6 h-6 inline-block">
                    <Menu className={`block w-6 h-6 transform transition-opacity duration-200 ${open ? 'opacity-0' : 'opacity-100'}`} />
                    <X className={`absolute inset-0 w-6 h-6 transform transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`} />
                </span>
            </button>

            <Transition show={open} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-50" onClose={setOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition ease-[cubic-bezier(0.4,0,0.2,1)] duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition ease-[cubic-bezier(0.4,0,0.2,1)] duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/55 backdrop-blur-md" aria-hidden="true" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-start justify-end">
                            <Transition.Child
                                as={Fragment}
                                enter="transition-transform ease-[cubic-bezier(0.4,0,0.2,1)] duration-300"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transition-transform ease-[cubic-bezier(0.4,0,0.2,1)] duration-250"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className={`w-full max-w-full sm:max-w-sm h-screen flex flex-col shadow-xl transition-colors duration-300 ${darkMode ? 'bg-[#050b1a]' : 'bg-white'}`}>
                                    <div className="flex-1 overflow-y-auto">
                                        {/* Header - Fixed at top */}
                                        <div className={`sticky top-0 z-10 p-5 mb-4 ${darkMode ? 'bg-[#050b1a]' : 'bg-white'}`}>
                                            <div className="relative flex items-center justify-center">
                                                {logo ? <img src={logo} alt="Logo" className="h-12 w-auto transition-all" /> : <div className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>Brand</div>}
                                                <div className="absolute right-0 top-0">
                                                    <button onClick={() => setOpen(false)} aria-label="Close menu" className={`p-2 rounded-md ${darkMode ? 'hover:bg-[#0d1f3b]' : 'hover:bg-gray-100'}`}>
                                                        <X className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Scrollable Content */}
                                        <div className="px-5 pb-6 space-y-8">
                                            {user ? (
                                                <section className={`relative overflow-hidden rounded-3xl border ${darkMode ? 'border-white/10 bg-gradient-to-br from-[#162850] via-[#0b1730] to-[#050b1a] text-white' : 'border-slate-200 bg-gradient-to-br from-white via-white to-blue-50 text-gray-900'}`}>
                                                    <div className="absolute inset-0 bg-white/5 mix-blend-overlay" aria-hidden="true" />
                                                    <div className="relative p-6 sm:p-7">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-sky-500 to-indigo-600 text-lg sm:text-xl font-semibold text-white shadow-lg">
                                                                {avatarInitial}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[18px] sm:text-[20px] font-semibold leading-tight truncate" style={{ fontFamily: "'Quintessential', cursive" }}>Hello, {firstName || 'Explorer'}</p>
                                                                <p className="text-sm opacity-80 truncate">{user?.email}</p>
                                                            </div>
                                                        </div>

                                                        <div className="mt-6 space-y-3">
                                                            <MotionLink
                                                                to={isAdmin ? '/admin' : '/dashboard'}
                                                                onClick={() => setOpen(false)}
                                                                className={`w-full min-h-[56px] rounded-2xl px-5 flex items-center justify-between text-sm sm:text-base font-semibold ${darkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-blue-600 text-white hover:bg-blue-500'} transition`}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                <span>{isAdmin ? 'Go to Admin Console' : 'Open Dashboard'}</span>
                                                                <BookOpen className="w-5 h-5" />
                                                            </MotionLink>

                                                            <motion.button
                                                                type="button"
                                                                onClick={() => setShowPortalModal(true)}
                                                                className={`w-full min-h-[56px] rounded-2xl px-5 flex items-center justify-between text-sm sm:text-base font-semibold ${darkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-white text-blue-700 border border-blue-100 hover:border-blue-200'} transition`}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                <span>Open Course Portal</span>
                                                                <BookOpen className={`w-5 h-5 ${darkMode ? '' : 'text-blue-500'}`} />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </section>
                                            ) : (
                                                <section className={`rounded-3xl border p-6 sm:p-7 text-center ${darkMode ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white text-gray-900'}`}>
                                                    <div className="space-y-3">
                                                        <p className="text-xs uppercase tracking-[0.3em] opacity-60">Welcome</p>
                                                        <h2 className="text-2xl font-semibold">Unlock premium PMP prep</h2>
                                                        <p className="text-sm opacity-75">Join ProPM to access expert-led courses and personalised mentorship.</p>
                                                    </div>
                                                    <div className="mt-6 space-y-3">
                                                        <MotionLink
                                                            to="/signup"
                                                            onClick={() => setOpen(false)}
                                                            className={`w-full min-h-[56px] rounded-2xl px-5 flex items-center justify-center text-sm sm:text-base font-semibold ${darkMode ? 'bg-blue-500 text-white hover:bg-blue-400' : 'bg-blue-600 text-white hover:bg-blue-500'} transition`}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            Create an account
                                                        </MotionLink>
                                                        <MotionLink
                                                            to="/login"
                                                            onClick={() => setOpen(false)}
                                                            className={`w-full min-h-[56px] rounded-2xl px-5 flex items-center justify-center text-sm sm:text-base font-semibold ${darkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'} transition`}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            I already have an account
                                                        </MotionLink>
                                                    </div>
                                                </section>
                                            )}

                                            <section>
                                                <div className="space-y-2 sm:space-y-3">
                                                    {navItems.map((l, idx) => (
                                                        <MotionLink
                                                            key={l.path}
                                                            to={l.path}
                                                            onClick={() => setOpen(false)}
                                                            className={`min-h-[60px] w-full rounded-2xl px-5 flex items-center justify-between text-[20px] font-medium border transition ${darkMode ? 'border-white/10 bg-white/[0.04] text-white hover:bg-white/10' : 'border-blue-100 bg-white text-gray-900 hover:border-blue-200'}`}
                                                            style={{ fontFamily: "'VT323', monospace" }}
                                                            initial="hidden"
                                                            animate="visible"
                                                            variants={itemVariants}
                                                            custom={idx}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <span className="normal-case">{l.name}</span>
                                                            <span className={`text-xs font-medium uppercase tracking-widest ${darkMode ? 'text-blue-300' : 'text-blue-500'}`}>View</span>
                                                        </MotionLink>
                                                    ))}
                                                </div>
                                            </section>

                                            {user && (
                                                <section className={`rounded-2xl border px-4 py-5 sm:px-5 sm:py-6 space-y-3 ${darkMode ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white text-gray-900'}`}>
                                                    <p className={`text-xs sm:text-sm opacity-70 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                                        Completing your profile helps us tailor your learning path and unlock premium resources.
                                                    </p>
                                                    <MotionLink
                                                        to={profileCompleted ? '/userprofile' : '/profile/onboarding'}
                                                        onClick={() => setOpen(false)}
                                                        className={`min-h-[56px] w-full rounded-xl px-4 flex items-center justify-between text-sm sm:text-base font-semibold uppercase ${darkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'} transition`}
                                                        style={{ fontFamily: "'VT323', monospace" }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <span>{profileCompleted ? 'View your profile' : 'Complete your profile'}</span>
                                                        <UserIcon className="w-5 h-5" />
                                                    </MotionLink>
                                                </section>
                                            )}

                                            {user && (
                                                <section>
                                                    <motion.button
                                                        type="button"
                                                        onClick={handleSignOut}
                                                        className={`w-full min-h-[56px] rounded-2xl px-5 flex items-center justify-between text-sm sm:text-base font-semibold border transition ${darkMode ? 'border-red-500/20 bg-red-500/10 text-red-200 hover:bg-red-500/20' : 'border-red-100 bg-red-50 text-red-600 hover:bg-red-100'}`}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <span>Sign Out</span>
                                                        <LogOut className="w-5 h-5" />
                                                    </motion.button>
                                                </section>
                                            )}
                                        </div>
                                    </div>

                                    {/* Theme Toggle - Sticky at bottom, Responsive */}
                                    <div
                                        className={`sticky bottom-0 border-t ${darkMode ? 'bg-[#050b1a] border-white/10' : 'bg-white border-gray-200'}`}
                                        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)', paddingTop: '1rem', paddingLeft: '1.25rem', paddingRight: '1.25rem' }}
                                    >
                                        <motion.button
                                            onClick={() => setDarkMode(!darkMode)}
                                            aria-label="Toggle color theme"
                                            className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${darkMode ? 'bg-[#0d1f3b] text-white hover:bg-[#123063]' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <span>Theme</span>
                                            {darkMode ? <Sun className="w-5 h-5 text-blue-300" /> : <Moon className="w-5 h-5 text-gray-700" />}
                                        </motion.button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Course Portal Modal */}
            <Transition show={showPortalModal} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-[60]" onClose={() => setShowPortalModal(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition ease-[cubic-bezier(0.4,0,0.2,1)] duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition ease-[cubic-bezier(0.4,0,0.2,1)] duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="transition ease-[cubic-bezier(0.4,0,0.2,1)] duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="transition ease-[cubic-bezier(0.4,0,0.2,1)] duration-200"
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
        </div>
    );
}
