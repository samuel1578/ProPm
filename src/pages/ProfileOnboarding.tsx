import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight } from 'lucide-react';
import Confetti from 'react-confetti';
import { useAuth } from '../context/AuthContext';
import { saveProfileProgress, completeProfile, getUserProfile } from '../lib/appwrite';
import type { UserProfile } from '../types/profile';
import ProfileStep1 from '../components/ProfileStep1';
import ProfileStep2 from '../components/ProfileStep2';
import ProfileStep3 from '../components/ProfileStep3';
import ProfileStep4 from '../components/ProfileStep4';

export default function ProfileOnboarding() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);
    const [formData, setFormData] = useState<Partial<UserProfile>>({
        displayName: user?.name || '',
        email: user?.email || '',
        currentStep: 1,
        profileCompleted: false,
    });
    const toastTimerRef = useRef<number | null>(null);
    const redirectTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Load existing progress
        (async () => {
            try {
                const res = await getUserProfile(user.$id);
                if (res?.document) {
                    setFormData((prev) => ({ ...prev, ...res.document }));
                    setCurrentStep(res.document.currentStep || 1);
                }
            } catch (err) {
                console.warn('No existing profile found, starting fresh');
            }
        })();
    }, [user, navigate]);

    useEffect(() => {
        if (!toast) {
            return;
        }
        const timer = window.setTimeout(() => setToast(null), 3000);
        toastTimerRef.current = timer;
        return () => window.clearTimeout(timer);
    }, [toast]);

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) {
                window.clearTimeout(toastTimerRef.current);
            }
            if (redirectTimerRef.current) {
                window.clearTimeout(redirectTimerRef.current);
            }
        };
    }, []);

    const showToast = (message: string, variant: 'success' | 'error') => {
        if (toastTimerRef.current) {
            window.clearTimeout(toastTimerRef.current);
        }
        setToast({ message, variant });
    };

    const handleChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await saveProfileProgress(user.$id, currentStep, formData);
            showToast('Progress saved ✓', 'success');
        } catch (err: any) {
            showToast(err?.message || 'Failed to save progress', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await saveProfileProgress(user.$id, currentStep + 1, formData);
            setCurrentStep((prev) => prev + 1);
        } catch (err: any) {
            showToast(err?.message || 'Failed to proceed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1));
    };

    const handleComplete = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await completeProfile(user.$id, formData);
            showToast('Profile completed! Redirecting…', 'success');
            setShowConfetti(true);
            if (redirectTimerRef.current) {
                window.clearTimeout(redirectTimerRef.current);
            }
            redirectTimerRef.current = window.setTimeout(() => {
                navigate('/userprofile', { replace: true });
            }, 3000);
        } catch (err: any) {
            showToast(err?.message || 'Failed to complete profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!user) return;
        setLoading(true);
        saveProfileProgress(user.$id, currentStep, formData)
            .then(() => {
                showToast('Progress saved. Redirecting…', 'success');
                if (redirectTimerRef.current) {
                    window.clearTimeout(redirectTimerRef.current);
                }
                redirectTimerRef.current = window.setTimeout(() => {
                    navigate('/', { replace: true });
                }, 3000);
            })
            .catch((err: any) => {
                showToast(err?.message || 'Failed to save progress', 'error');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const progress = (currentStep / 4) * 100;

    return (
        <>
            {toast && (
                <div
                    className={`fixed top-6 right-6 z-[60] rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-opacity ${toast.variant === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                        }`}
                >
                    {toast.message}
                </div>
            )}
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

                <div className="bg-white dark:bg-[#0b1b36] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="sticky top-0 bg-white dark:bg-[#0b1b36] border-b border-gray-200 dark:border-gray-700 p-6 z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Step {currentStep} of 4</p>
                            </div>
                            <button
                                onClick={handleClose}
                                disabled={loading}
                                className={`p-2 rounded-lg transition-all ${loading ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Progress bar */}
                        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Step indicators */}
                        <div className="flex items-center justify-between mt-4">
                            {[1, 2, 3, 4].map((step) => (
                                <div key={step} className="flex items-center">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step <= currentStep
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                            }`}
                                    >
                                        {step}
                                    </div>
                                    {step < 4 && (
                                        <ChevronRight
                                            className={`w-5 h-5 mx-2 ${step < currentStep ? 'text-blue-600' : 'text-gray-400'
                                                }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {currentStep === 1 && (
                            <ProfileStep1
                                formData={formData}
                                onChange={handleChange}
                                onNext={handleNext}
                                onSave={handleSave}
                                loading={loading}
                            />
                        )}
                        {currentStep === 2 && (
                            <ProfileStep2
                                formData={formData}
                                onChange={handleChange}
                                onNext={handleNext}
                                onBack={handleBack}
                                onSave={handleSave}
                                loading={loading}
                            />
                        )}
                        {currentStep === 3 && (
                            <ProfileStep3
                                formData={formData}
                                onChange={handleChange}
                                onNext={handleNext}
                                onBack={handleBack}
                                onSave={handleSave}
                                loading={loading}
                            />
                        )}
                        {currentStep === 4 && (
                            <ProfileStep4
                                formData={formData}
                                onChange={handleChange}
                                onBack={handleBack}
                                onSave={handleComplete}
                                loading={loading}
                                onComplete={handleComplete}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
