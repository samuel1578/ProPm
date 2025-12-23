import React from 'react';
import { Target, CheckCircle } from 'lucide-react';
import type { ProfileStepProps } from '../types/profile';

export default function ProfileStep4({ formData, onChange, onBack, onSave, loading }: Omit<ProfileStepProps, 'onNext'> & { onComplete: () => void }) {
    const handleComplete = () => {
        if (!formData.learningStyle || !formData.availability) {
            alert('Please fill in your learning style and availability');
            return;
        }
        (onSave as any)(); // This will be the onComplete function
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                    <Target className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Preferences</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Help us personalize your learning experience</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Learning Style <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.learningStyle || ''}
                        onChange={(e) => onChange('learningStyle', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        required
                    >
                        <option value="">Select your preferred style</option>
                        <option value="visual">Visual (diagrams, videos, presentations)</option>
                        <option value="auditory">Auditory (lectures, discussions)</option>
                        <option value="reading">Reading/Writing (books, notes, documentation)</option>
                        <option value="kinesthetic">Hands-on/Kinesthetic (practice projects, labs)</option>
                        <option value="mixed">Mixed (combination of styles)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Weekly Availability <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.availability || ''}
                        onChange={(e) => onChange('availability', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        required
                    >
                        <option value="">Select your availability</option>
                        <option value="weekdays-morning">Weekdays - Morning (8am-12pm)</option>
                        <option value="weekdays-afternoon">Weekdays - Afternoon (12pm-5pm)</option>
                        <option value="weekdays-evening">Weekdays - Evening (5pm-9pm)</option>
                        <option value="weekends">Weekends</option>
                        <option value="flexible">Flexible</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instructor Preferences</label>
                    <textarea
                        value={formData.instructorPreferences || ''}
                        onChange={(e) => onChange('instructorPreferences', e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Any specific preferences for instructors or teaching style?"
                    />
                </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Almost Done!</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            You're about to complete your profile. Once you click "Complete Profile", we'll save all your information and you'll be able to:
                        </p>
                        <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>• Access all course materials</li>
                            <li>• Join live training sessions</li>
                            <li>• Connect with instructors and peers</li>
                            <li>• Track your PMP journey</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={onBack}
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                    ← Back
                </button>
                <button
                    onClick={handleComplete}
                    disabled={loading}
                    className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <CheckCircle className="w-5 h-5" />
                    {loading ? 'Completing...' : 'Complete Profile ✓'}
                </button>
            </div>
        </div>
    );
}
