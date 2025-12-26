import { } from 'react';
import { User } from 'lucide-react';
import type { ProfileStepProps } from '../types/profile';

const COUNTRIES = ['Ghana', 'Nigeria', 'Kenya', 'South Africa', 'United States', 'United Kingdom', 'Canada', 'India'];

export default function ProfileStep1({ formData, onChange, onNext, onSave, onGoHome, loading }: ProfileStepProps) {
    const handleNext = () => {
        if (!formData.displayName || !formData.email || !formData.homeCountry) {
            alert('Please fill in all required fields (Name, Email, Country)');
            return;
        }
        onNext();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Basic Information</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Let's start with your personal details</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.displayName || ''}
                        onChange={(e) => onChange('displayName', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Enter your full name"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => onChange('email', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="you@example.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Home Country <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.homeCountry || ''}
                        onChange={(e) => onChange('homeCountry', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        required
                    >
                        <option value="">Select your country</option>
                        {COUNTRIES.map((country) => (
                            <option key={country} value={country}>
                                {country}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                    <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => onChange('phone', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="+1234567890"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
                    <input
                        type="date"
                        value={formData.dateOfBirth || ''}
                        onChange={(e) => onChange('dateOfBirth', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Professional Headline</label>
                    <input
                        type="text"
                        value={formData.headline || ''}
                        onChange={(e) => onChange('headline', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g., Project Manager | PMP Aspirant"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                    <textarea
                        value={formData.bio || ''}
                        onChange={(e) => onChange('bio', e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Tell us about yourself, your background, and career goals..."
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                    <textarea
                        value={formData.address || ''}
                        onChange={(e) => onChange('address', e.target.value)}
                        rows={2}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Full address"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                        onClick={onSave}
                        disabled={loading}
                        className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                        Save Progress
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
                    >
                        Next: Professional Background →
                    </button>
                </div>
                <div className="w-full sm:w-auto">
                    <button
                        onClick={onGoHome}
                        disabled={loading}
                        className="w-full px-6 py-2 border border-transparent text-sm rounded-lg text-blue-700 bg-white dark:bg-transparent dark:text-white hover:bg-blue-50 dark:hover:bg-white/5 transition-all"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
