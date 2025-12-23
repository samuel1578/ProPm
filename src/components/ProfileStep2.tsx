import React from 'react';
import { Briefcase } from 'lucide-react';
import type { ProfileStepProps } from '../types/profile';

export default function ProfileStep2({ formData, onChange, onNext, onBack, onSave, loading }: ProfileStepProps) {
    const handleNext = () => {
        if (!formData.currentRole || !formData.learningGoals) {
            alert('Please fill in your current role and learning goals');
            return;
        }
        onNext();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Briefcase className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Professional Background</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Tell us about your PMP journey</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Role <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.currentRole || ''}
                        onChange={(e) => onChange('currentRole', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g., Assistant Project Manager"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Years of Experience</label>
                    <input
                        type="number"
                        value={formData.yearsExperience || ''}
                        onChange={(e) => onChange('yearsExperience', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g., 3"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Certifications (comma separated)
                    </label>
                    <input
                        type="text"
                        value={formData.certifications || ''}
                        onChange={(e) => onChange('certifications', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g., CAPM, CSM, Prince2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Training Completion Date</label>
                    <input
                        type="date"
                        value={formData.targetTrainingDate || ''}
                        onChange={(e) => onChange('targetTrainingDate', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Readiness Level</label>
                    <select
                        value={formData.readinessLevel || 'unknown'}
                        onChange={(e) => onChange('readinessLevel', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                        <option value="unknown">Select level</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Learning Goals <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.learningGoals || ''}
                        onChange={(e) => onChange('learningGoals', e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="What do you hope to achieve through this PMP training?"
                        required
                    />
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
                <div className="flex flex-col gap-3 sm:flex-row">
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
                        Next: KYC & Verification →
                    </button>
                </div>
            </div>
        </div>
    );
}
