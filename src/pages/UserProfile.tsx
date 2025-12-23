import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Briefcase, FileText, Shield, Edit2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../lib/appwrite';
import type { UserProfile as UserProfileType } from '../types/profile';

const COUNTRIES = [
    'Ghana',
    'Nigeria',
    'Kenya',
    'United States',
    'United Kingdom',
];

export default function UserProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfileType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        (async () => {
            try {
                const res = await getUserProfile(user.$id);
                if (!res?.document) {
                    // No profile exists, redirect to onboarding
                    navigate('/profile/onboarding');
                    return;
                }

                const profileData = res.document as UserProfileType;
                setProfile(profileData);

                // If profile incomplete, redirect to onboarding
                if (!profileData.profileCompleted) {
                    navigate('/profile/onboarding');
                }
            } catch (err: any) {
                console.error('Failed to load profile', err);
                navigate('/profile/onboarding');
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    if (loading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <header className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Profile</h1>
                        <p className="text-gray-600 dark:text-gray-400">View and manage your information</p>
                    </div>
                    <Link
                        to="/profile/onboarding"
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                    </Link>
                </div>

                {!profile.profileCompleted && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Profile Incomplete</p>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                Complete your profile to unlock all features.
                            </p>
                        </div>
                    </div>
                )}
            </header>

            {/* Section 1: Basic Information */}
            <section className="bg-white dark:bg-[#0b1b36] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                </div>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white">{profile.displayName || '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white">{profile.email || '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Country</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white">{profile.homeCountry || '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white">{profile.phone || '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white">{profile.dateOfBirth || '—'}</dd>
                    </div>
                    <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Headline</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white">{profile.headline || '—'}</dd>
                    </div>
                    <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white whitespace-pre-wrap">{profile.bio || '—'}</dd>
                    </div>
                    <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white whitespace-pre-wrap">{profile.address || '—'}</dd>
                    </div>
                </dl>
            </section>

            {/* Section 2: PMP Training & Professional Background */}
            <section className="bg-white dark:bg-[#0b1b36] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Professional Background</h2>
                </div>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Role</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white">{profile.currentRole || '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Years of Experience</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white">{profile.yearsExperience || '—'}</dd>
                    </div>
                    <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Certifications</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white">{profile.certifications || '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Training Date</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white">{profile.targetTrainingDate || '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Readiness Level</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white capitalize">{profile.readinessLevel || '—'}</dd>
                    </div>
                    <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Learning Goals</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white whitespace-pre-wrap">{profile.learningGoals || '—'}</dd>
                    </div>
                </dl>
            </section>

            {/* Section 3: Learning Preferences */}
            <section className="bg-white dark:bg-[#0b1b36] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Learning Preferences</h2>
                </div>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Learning Style</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white capitalize">{profile.learningStyle || '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Availability</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white">{profile.availability || '—'}</dd>
                    </div>
                    <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Instructor Preferences</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white whitespace-pre-wrap">{profile.instructorPreferences || '—'}</dd>
                    </div>
                </dl>
            </section>

            {/* Section 4: KYC */}
            <section className="bg-white dark:bg-[#0b1b36] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">KYC & Verification</h2>
                </div>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">ID Type</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white">{profile.idtype || '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">ID Number</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white">
                            {profile.idNumber ? '••••' + profile.idNumber.slice(-4) : '—'}
                        </dd>
                    </div>
                    <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Document Status</dt>
                        <dd className="mt-1 text-base text-gray-900 dark:text-white">
                            {profile.idField ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                    ✓ Uploaded
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    Not uploaded
                                </span>
                            )}
                        </dd>
                    </div>
                </dl>
            </section>
        </div>
    );
}
