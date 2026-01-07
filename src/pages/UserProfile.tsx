import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Briefcase, FileText, Shield, Edit2, AlertCircle, BookOpen, ChevronRight, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getUserEnrollments, createUnenrollmentRequest, getUserUnenrollmentRequests } from '../lib/appwrite';
import type { UserProfile as UserProfileType } from '../types/profile';
import { UNENROLLMENT_REASONS, type UnenrollmentRequest, type UnenrollmentReasonCategory } from '../types/resources';

interface Enrollment {
    $id: string;
    userId: string;
    planName: string;
    planBasePrice: number;
    currency: string;
    certifications: string[];
    status: string;
    createdAt: string;
    cooldownEndsAt?: string;
}

export default function UserProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfileType | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [unenrollmentRequests, setUnenrollmentRequests] = useState<UnenrollmentRequest[]>([]);
    const [showUnenrollModal, setShowUnenrollModal] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
    const [unenrollForm, setUnenrollForm] = useState<{ reasonCategory: UnenrollmentReasonCategory; reasonDetails: string }>({
        reasonCategory: UNENROLLMENT_REASONS[0],
        reasonDetails: ''
    });
    const [processing, setProcessing] = useState(false);

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

                // Fetch user enrollments
                try {
                    const userEnrollments = await getUserEnrollments(user.$id);
                    setEnrollments(userEnrollments);
                } catch (enrollmentErr) {
                    console.error('Failed to load enrollments', enrollmentErr);
                    // Don't fail the whole page if enrollments fail to load
                }

                // Fetch unenrollment requests
                try {
                    const requests = await getUserUnenrollmentRequests(user.$id);
                    setUnenrollmentRequests(requests as unknown as UnenrollmentRequest[]);
                } catch (err) {
                    console.error('Failed to load unenrollment requests', err);
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
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm mb-4" aria-label="Breadcrumb">
                <Link
                    to="/"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                    Dashboard
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">My Profile</span>
            </nav>

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

            {/* Section 5: My Enrollments */}
            <section className="bg-white dark:bg-[#0b1b36] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Enrollments</h2>
                </div>
                {enrollments.length === 0 ? (
                    <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-4">No enrollments yet</p>
                        <Link
                            to="/pricing"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
                        >
                            Browse Courses
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {enrollments.map((enrollment) => (
                            <div key={enrollment.$id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            {enrollment.planName}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-500 dark:text-gray-400">Price:</span>
                                                <span className="ml-2 text-gray-900 dark:text-white">
                                                    {enrollment.currency} {enrollment.planBasePrice.toLocaleString()}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-500 dark:text-gray-400">Status:</span>
                                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${enrollment.status === 'completed'
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    : enrollment.status === 'pending'
                                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-500 dark:text-gray-400">Enrolled:</span>
                                                <span className="ml-2 text-gray-900 dark:text-white">
                                                    {new Date(enrollment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {enrollment.certifications.length > 0 && (
                                                <div className="md:col-span-2">
                                                    <span className="font-medium text-gray-500 dark:text-gray-400">Certifications:</span>
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {enrollment.certifications.map((cert, index) => (
                                                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                                                {cert}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Unenrollment Button */}
                                        {enrollment.status === 'active' && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                {unenrollmentRequests.some(r => r.enrollmentId === enrollment.$id && r.status === 'pending') ? (
                                                    <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                                                        <Clock className="w-4 h-4" />
                                                        <span>Unenrollment request pending</span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEnrollment(enrollment);
                                                            setShowUnenrollModal(true);
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Request Unenrollment
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {enrollment.status === 'inactive' && enrollment.cooldownEndsAt && new Date(enrollment.cooldownEndsAt) > new Date() && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <div className="text-sm text-red-600 dark:text-red-400">
                                                    Re-enrollment available in {Math.ceil((new Date(enrollment.cooldownEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Unenrollment Request Modal */}
            {showUnenrollModal && selectedEnrollment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#0b1b36] rounded-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Request Unenrollment
                        </h3>

                        <div className="space-y-4 mb-6">
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <div className="flex gap-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                        <p className="font-semibold mb-1">Important:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>You will lose access to course materials</li>
                                            <li>A cooldown period will apply before re-enrollment</li>
                                            <li>Partial refunds may be available based on your plan</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Reason for leaving *
                                </label>
                                <select
                                    value={unenrollForm.reasonCategory}
                                    onChange={(e) => setUnenrollForm({ ...unenrollForm, reasonCategory: e.target.value as UnenrollmentReasonCategory })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0d2244] text-gray-900 dark:text-white"
                                >
                                    {UNENROLLMENT_REASONS.map((reason) => (
                                        <option key={reason} value={reason}>
                                            {reason.replace(/-/g, ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Additional details {unenrollForm.reasonCategory === 'Other' && '*'}
                                </label>
                                <textarea
                                    value={unenrollForm.reasonDetails}
                                    onChange={(e) => setUnenrollForm({ ...unenrollForm, reasonDetails: e.target.value })}
                                    rows={4}
                                    placeholder="Please provide more information about your decision..."
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0d2244] text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowUnenrollModal(false);
                                    setSelectedEnrollment(null);
                                    setUnenrollForm({ reasonCategory: UNENROLLMENT_REASONS[0], reasonDetails: '' });
                                }}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (unenrollForm.reasonCategory === 'Other' && !unenrollForm.reasonDetails.trim()) {
                                        alert('Please provide details for "Other" reason');
                                        return;
                                    }

                                    setProcessing(true);
                                    try {
                                        await createUnenrollmentRequest({
                                            userId: user!.$id,
                                            enrollmentId: selectedEnrollment.$id,
                                            certificationName: selectedEnrollment.certifications[0] || selectedEnrollment.planName,
                                            planTier: selectedEnrollment.planName,
                                            reasonCategory: unenrollForm.reasonCategory,
                                            reasonDetails: unenrollForm.reasonDetails,
                                            enrolledAt: selectedEnrollment.createdAt,
                                        });

                                        alert('Unenrollment request submitted successfully. An admin will review it shortly.');
                                        setShowUnenrollModal(false);
                                        setSelectedEnrollment(null);
                                        setUnenrollForm({ reasonCategory: UNENROLLMENT_REASONS[0], reasonDetails: '' });

                                        // Reload requests
                                        const requests = await getUserUnenrollmentRequests(user!.$id);
                                        setUnenrollmentRequests(requests as unknown as UnenrollmentRequest[]);
                                    } catch (error: any) {
                                        console.error('Failed to submit unenrollment request:', error);
                                        alert(error?.message || 'Failed to submit request');
                                    } finally {
                                        setProcessing(false);
                                    }
                                }}
                                disabled={processing}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4" />
                                        Submit Request
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
