import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface NavItem {
    name: string;
    path: string;
}

export default function MobileMenu({ navItems, logo }: { navItems: NavItem[]; logo?: string }) {
    const [open, setOpen] = useState(false);
    const { darkMode, setDarkMode } = useTheme();

    const itemVariants = {
        hidden: { opacity: 0, x: 12 },
        visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: 0.06 * i, type: 'spring' as const, stiffness: 120 } }),
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



                                        <nav className="mt-6 flex-1 overflow-auto">
                                            <div className="flex flex-col items-center justify-start h-full space-y-6 py-8">
                                                {navItems.map((l, idx) => (
                                                    <motion.div key={l.path} custom={idx} initial="hidden" animate="visible" variants={itemVariants}>
                                                        <Link
                                                            to={l.path}
                                                            onClick={() => setOpen(false)}
                                                            className={`block rounded-lg px-8 py-4 text-lg font-semibold w-full max-w-md text-center transition ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'}`}
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
                                            <Link to="/signup" onClick={() => setOpen(false)} className={`block text-center w-full max-w-md rounded-md py-4 px-6 transition font-semibold bg-blue-600 hover:bg-blue-700 text-white text-lg shadow-md`}>
                                                Sign Up
                                            </Link>
                                            <Link to="/login" onClick={() => setOpen(false)} className={`block text-center w-full max-w-md rounded-md py-4 px-6 transition border-2 font-semibold border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-[#062233] text-lg`}>
                                                Login
                                            </Link>
                                        </div>

                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
