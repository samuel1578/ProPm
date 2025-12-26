import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Toast = { id: string; message: string; variant?: 'success' | 'error' | 'info' };

const ToastContext = createContext<{ show: (message: string, variant?: Toast['variant']) => void } | undefined>(undefined);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const show = useCallback((message: string, variant: Toast['variant'] = 'info') => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setToasts((s) => [...s, { id, message, variant }]);
        // auto remove after 3.5s
        setTimeout(() => setToasts((s) => s.filter((t) => t.id !== id)), 3500);
    }, []);

    return (
        <ToastContext.Provider value={{ show }}>
            {children}
            <div className="fixed right-4 top-6 z-50 flex flex-col gap-3">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.18 }}
                        >
                            <div
                                className={`px-4 py-2 rounded shadow-lg max-w-xs text-sm ${t.variant === 'success' ? 'bg-green-50 text-green-800' : t.variant === 'error' ? 'bg-red-50 text-red-800' : 'bg-white dark:bg-[#071330] text-gray-900 dark:text-gray-100'
                                    }`}
                            >
                                {t.message}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
