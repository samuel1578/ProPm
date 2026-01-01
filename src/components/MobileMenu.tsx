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
        hidden: { opacity: 0, x: 12 },
        visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: 0.06 * i, type: 'spring' as const, stiffness: 120 } }),
    };

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
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-start justify-end">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-350"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-250"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className={`w-full max-w-full sm:max-w-sm h-screen sm:h-full shadow-xl transition-colors duration-300 ${darkMode ? 'bg-[#050b1a]' : 'bg-white'}`}>
                                    <div className="p-5 h-full flex flex-col">
                                        <div className="relative mb-6 flex items-center justify-center">
                                            {logo ? <img src={logo} alt="Logo" className="h-14 w-auto transition-all" /> : <div className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>Brand</div>}

                                            <div className="absolute right-0 top-0">
                                                <button onClick={() => setOpen(false)} aria-label="Close menu" className={`p-2 rounded-md ${darkMode ? 'hover:bg-[#0d1f3b]' : 'hover:bg-gray-100'}`}>
                                                    <X className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
                                                </button>
                                            </div>
                                        </div>


                                        {user && (
                                            <div className={`mb-6 rounded-2xl border shadow-sm ${darkMode ? 'border-white/15 bg-white/5 text-white' : 'border-slate-200 bg-white text-gray-900'}`}>
                                                <div className="px-4 py-3">
                                                    <div className="flex flex-col items-center text-center mb-3">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-sky-500 to-indigo-600 text-lg font-semibold text-white shadow-lg mb-2">
                                                            {avatarInitial}
                                                        </div>
                                                        <span className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300/80' : 'text-slate-500'}`} style={{ fontFamily: "'Playfair Display', serif" }}>Welcome to ProPm</span>
                                                        <span className="block text-base font-semibold uppercase tracking-wide">{firstName || 'Explorer'}</span>
                                                    </div>
                                                    <p className={`text-xs leading-relaxed text-center ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                                                        Achieve PMP certification excellence and transform your career with expert-led training.
                                                    </p>
                                                </div>
                                                <div className={`flex gap-2 px-3 pb-3 ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                                                    <Link
                                                        to={isAdmin ? "/admin" : "/dashboard"}
                                                        onClick={() => setOpen(false)}
                                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${darkMode ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                                                            }`}
                                                    >
                                                        <BookOpen className="w-4 h-4" />
                                                        {isAdmin ? "Admin" : "Dashboard"}
                                                    </Link>

                                                    <Link
                                                        to={profileCompleted ? "/userprofile" : "/profile/onboarding"}
                                                        onClick={() => setOpen(false)}
                                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${darkMode ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                                                            }`}
                                                    >
                                                        <UserIcon className="w-4 h-4" />
                                                        {profileCompleted ? "View Profile" : "Edit Profile"}
                                                    </Link>
                                                    <button
                                                        onClick={handleSignOut}
                                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${darkMode ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300' : 'bg-red-50 hover:bg-red-100 text-red-700'
                                                            }`}
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Sign Out
                                                    </button>
                                                </div>
                                                <div className="px-3 pb-3">
                                                    <button
                                                        onClick={() => setShowPortalModal(true)}
                                                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${darkMode ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300' : 'bg-green-50 hover:bg-green-100 text-green-700'
                                                            }`}
                                                    >
                                                        <BookOpen className="w-4 h-4" />
                                                        Course Portal
                                                    </button>
                                                </div>
                                            </div>
                                        )}



                                        <nav className="mt-4 flex-1 overflow-auto">
                                            <div className="flex flex-col items-center justify-start h-full space-y-3 py-4">
                                                {navItems.map((l, idx) => (
                                                    <motion.div key={l.path} custom={idx} initial="hidden" animate="visible" variants={itemVariants}>
                                                        <Link
                                                            to={l.path}
                                                            onClick={() => setOpen(false)}
                                                            className={`block rounded-lg px-6 py-2.5 text-base font-semibold w-full max-w-md text-center transition border ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white border-blue-700' : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border-blue-300'}`}
                                                        >
                                                            {l.name}
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </nav>

                                        <div className="px-4">
                                            <button
                                                onClick={() => setDarkMode(!darkMode)}
                                                aria-label="Toggle color theme"
                                                className={`w-full max-w-md mx-auto flex items-center justify-center gap-3 rounded-lg py-3 px-4 text-sm font-semibold transition ${darkMode ? 'bg-[#0d1f3b] text-white hover:bg-[#123063]' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                                            >
                                                {darkMode ? <Sun className="w-5 h-5 text-blue-300" /> : <Moon className="w-5 h-5 text-gray-700" />}
                                                <span>{darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                                            </button>
                                        </div>

                                        <div className="mt-6 flex flex-col items-center gap-4">
                                            {!user && (
                                                <>
                                                    <Link to="/signup" onClick={() => setOpen(false)} className={`block text-center w-full max-w-md rounded-md py-4 px-6 transition font-semibold bg-blue-600 hover:bg-blue-700 text-white text-lg shadow-md`}>
                                                        Sign Up
                                                    </Link>
                                                    <Link to="/login" onClick={() => setOpen(false)} className={`block text-center w-full max-w-md rounded-md py-4 px-6 transition border-2 font-semibold border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-[#062233] text-lg`}>
                                                        Login
                                                    </Link>
                                                </>
                                            )}
                                        </div>

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
        </div>
    );
}
