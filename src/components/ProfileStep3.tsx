import React, { useState } from 'react';
import { Shield, Upload } from 'lucide-react';
import type { ProfileStepProps } from '../types/profile';

export default function ProfileStep3({ formData, onChange, onNext, onBack, onSave, loading }: ProfileStepProps & { onFileChange?: (file: File | null) => void }) {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);
    };

    const handleNext = () => {
        onNext();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">KYC & Verification</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Verify your identity for course enrollment</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID Type</label>
                    <input
                        type="text"
                        value={formData.idtype || ''}
                        onChange={(e) => onChange('idtype', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g., National ID, Passport, Driver's License"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID Number</label>
                    <input
                        type="text"
                        value={formData.idNumber || ''}
                        onChange={(e) => onChange('idNumber', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-[#071330] dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Enter your ID number"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload ID Document</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-all">
                        <Upload className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                            className="hidden"
                            id="id-upload"
                        />
                        <label
                            htmlFor="id-upload"
                            className="cursor-pointer inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                        >
                            Choose File
                        </label>
                        {file && (
                            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                Selected: <span className="font-medium">{file.name}</span>
                            </p>
                        )}
                        {!file && <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">PNG, JPG, or PDF (max 5MB)</p>}
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Why we need this:</strong> Identity verification helps us maintain a secure learning environment and ensures certificate authenticity.
                </p>
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
                        Next: Learning Preferences →
                    </button>
                </div>
            </div>
        </div>
    );
}
