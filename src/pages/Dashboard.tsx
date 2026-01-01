import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    TrendingUp,
    Calendar,
    Award,
    Target,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    FileText,
    Users,
    CreditCard,
    Download,
    Mail,
    Play,
    BarChart3,
    Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getUserEnrollments, getKnowledgeAreasByEnrollment, getLiveSessionsForCertification, getRecentActivitiesForUser } from '../lib/appwrite';

interface UserProfile {
    displayName: string;
    email: string;
    profileCompleted: boolean;
}

interface Enrollment {
    $id: string;
    planName: string;
    planBasePrice: number;
    currency: string;
    status: string;
    certifications: string[];
}

interface ProgressData {
    overallCompletion: number;
    knowledgeAreas: {
        name: string;
        completion: number;
        totalModules: number;
        completedModules: number;
    }[];
}

interface RecommendedAction {
    type: 'resume' | 'review' | 'quiz' | 'exam';
    title: string;
    description: string;
    link: string;
    icon: any;
}

interface LiveSession {
    id: string;
    title: string;
    instructor: string;
    date: string;
    time: string;
    duration: string;
    tier: string;
}

interface Activity {
    id: string;
    type: 'lesson' | 'quiz' | 'recommendation';
    title: string;
    timestamp: string;
    status?: string;
}

export default function Dashboard() {
    const { user, initializing } = useAuth();
    const navigate = useNavigate();

    // Critical data (loaded first)
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);

    // Enhanced data (loaded asynchronously)
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [recommendedAction, setRecommendedAction] = useState<RecommendedAction | null>(null);
    const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
    const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
    const [enhancedDataLoading, setEnhancedDataLoading] = useState(true);

    // Critical data fetch - runs first
    useEffect(() => {
        if (initializing) return;

        if (!user) {
            navigate('/login');
            return;
        }

        (async () => {
            try {
                // Fetch profile and enrollments in parallel
                const [profileRes, enrollmentsData] = await Promise.all([
                    getUserProfile(user.$id),
                    getUserEnrollments(user.$id)
                ]);

                if (!profileRes?.document) {
                    navigate('/profile/onboarding');
                    return;
                }

                const profileData = profileRes.document as any;
                setProfile({
                    displayName: profileData.displayName || '',
                    email: profileData.email || '',
                    profileCompleted: profileData.profileCompleted || false
                });

                if (!profileData.profileCompleted) {
                    navigate('/profile/onboarding');
                    return;
                }

                setEnrollments(enrollmentsData || []);
            } catch (err) {
                console.error('Failed to load critical dashboard data', err);
                navigate('/profile/onboarding');
            } finally {
                setLoading(false);
            }
        })();
    }, [user, initializing, navigate]);

    // Enhanced data fetch - runs after critical data
    useEffect(() => {
        if (!user || !profile || enrollments.length === 0) return;

        (async () => {
            try {
                const active = enrollments[0];
                const enrollmentId = (active as any)?.$id || (active as any)?.id;
                const certification = (active as any)?.certifications?.[0] || active.planName || 'PMP';

                // Fetch knowledge areas from Appwrite
                const areas = enrollmentId ? await getKnowledgeAreasByEnrollment(enrollmentId) : [];

                // Map returned docs to ProgressData.knowledgeAreas shape
                const mappedAreas = (areas || []).map((a: any) => ({
                    name: a.name || a.title || 'Unnamed Area',
                    completion: Number(a.completion || 0),
                    totalModules: Number(a.totalModules || 0),
                    completedModules: Number(a.completedModules || 0),
                }));

                const overall = mappedAreas.length > 0 ? Math.round(mappedAreas.reduce((s: number, x: any) => s + (x.completion || 0), 0) / mappedAreas.length) : 0;
                setProgress({ overallCompletion: overall, knowledgeAreas: mappedAreas });

                // Simple recommendation: pick first incomplete area
                const incomplete = mappedAreas.find((m: any) => m.completion < 100);
                if (incomplete) {
                    setRecommendedAction({ type: 'resume', title: `Continue: ${incomplete.name}`, description: `Resume where you left off in ${incomplete.name}`, link: '/courses', icon: Play });
                } else {
                    setRecommendedAction({ type: 'exam', title: 'Attempt a Mock Exam', description: 'You have completed all areas — try a mock exam.', link: '/pricing', icon: Play });
                }

                // Fetch live sessions for certification
                const sessions = await getLiveSessionsForCertification(certification);
                setLiveSessions(sessions || []);

                // Fetch recent activities for user
                const activities = await getRecentActivitiesForUser(user.$id);
                // Map to Activity type (simple mapping)
                const mappedActivities = (activities || []).map((act: any) => ({
                    id: act.$id || act.id,
                    type: act.type || 'recommendation',
                    title: act.title || act.detail || '',
                    timestamp: act.occurredAt || act.$createdAt || '',
                    status: act.status || undefined,
                }));
                setRecentActivities(mappedActivities);
            } catch (err) {
                console.error('Failed to load enhanced dashboard data', err);
            } finally {
                setEnhancedDataLoading(false);
            }
        })();
    }, [user, profile, enrollments]);

    if (loading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const activeEnrollment = enrollments[0];
    const certificationName = activeEnrollment?.certifications?.[0] || activeEnrollment?.planName || 'PMP';
    const tier = activeEnrollment?.planName || 'Basic';
    const firstName = profile.displayName.split(' ')[0] || profile.displayName;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050b1a] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Welcome Header with Key Metrics */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl p-8 text-white">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}! 👋</h1>
                            <p className="text-blue-100 text-lg mb-4">
                                Continue your journey to {certificationName} certification excellence
                            </p>
                            <div className="flex flex-wrap items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <Award className="w-5 h-5" />
                                    <span className="font-semibold">{certificationName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5" />
                                    <span className="font-semibold">{tier} Tier</span>
                                </div>
                                {progress && (
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" />
                                        <span className="font-semibold">{progress.overallCompletion}% Complete</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {progress && (
                            <div className="lg:w-64">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Overall Progress</span>
                                        <span className="text-2xl font-bold">{progress.overallCompletion}%</span>
                                    </div>
                                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${progress.overallCompletion}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {recommendedAction && (
                        <div className="mt-6 pt-6 border-t border-white/20">
                            <Link
                                to={recommendedAction.link}
                                className="inline-flex items-center gap-3 bg-white text-blue-700 px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                            >
                                <recommendedAction.icon className="w-5 h-5" />
                                <span>{recommendedAction.title}</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <p className="text-blue-100 text-sm mt-2 ml-1">{recommendedAction.description}</p>
                        </div>
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Progress & Activities */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Knowledge Areas Progress */}
                        <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    Knowledge Areas Progress
                                </h2>
                            </div>

                            {enhancedDataLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="animate-pulse">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : progress ? (
                                <div className="space-y-4">
                                    {progress.knowledgeAreas.map((area, idx) => (
                                        <div key={idx} className="group">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {area.name}
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {area.completedModules}/{area.totalModules} modules
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${area.completion === 100
                                                        ? 'bg-green-500'
                                                        : area.completion > 0
                                                            ? 'bg-blue-500'
                                                            : 'bg-gray-300 dark:bg-gray-600'
                                                        }`}
                                                    style={{ width: `${area.completion}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                    No progress data available
                                </p>
                            )}
                        </div>

                        {/* Recent Activity Feed */}
                        <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                Recent Activity
                            </h2>

                            {enhancedDataLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="animate-pulse flex items-start gap-4">
                                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : recentActivities.length > 0 ? (
                                <div className="space-y-4">
                                    {recentActivities.map(activity => (
                                        <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#0d2244] transition-colors">
                                            <div className={`p-2 rounded-full ${activity.type === 'lesson'
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                : activity.type === 'quiz'
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                                }`}>
                                                {activity.type === 'lesson' ? <CheckCircle2 className="w-5 h-5" /> :
                                                    activity.type === 'quiz' ? <Target className="w-5 h-5" /> :
                                                        <AlertCircle className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {activity.title}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {activity.timestamp}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                    No recent activity
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Sessions & Quick Actions */}
                    <div className="space-y-6">
                        {/* Upcoming Live Sessions */}
                        {tier !== 'Basic' && (
                            <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    Upcoming Sessions
                                </h2>

                                {enhancedDataLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2].map(i => (
                                            <div key={i} className="animate-pulse">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : liveSessions.length > 0 ? (
                                    <div className="space-y-4">
                                        {liveSessions.map(session => (
                                            <div key={session.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                                                    {session.title}
                                                </h3>
                                                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-3 h-3" />
                                                        <span>{session.instructor}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{session.date} at {session.time}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{session.duration}</span>
                                                    </div>
                                                </div>
                                                <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-4 rounded-lg transition-colors">
                                                    Register
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                                        No upcoming sessions
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
                            <div className="space-y-3">
                                <Link
                                    to="/userprofile"
                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                                >
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                        Manage Profile
                                    </span>
                                </Link>

                                <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg group-hover:scale-110 transition-transform">
                                        <Download className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                                        Download Resources
                                    </span>
                                </button>

                                <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg group-hover:scale-110 transition-transform">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                        Contact Instructor
                                    </span>
                                </button>

                                {tier === 'Basic' && (
                                    <Link
                                        to="/pricing"
                                        className="flex items-center gap-3 p-3 rounded-lg border-2 border-amber-500 dark:border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 hover:scale-105 transition-all group"
                                    >
                                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg group-hover:scale-110 transition-transform">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                                            Upgrade Tier
                                        </span>
                                    </Link>
                                )}

                                {/* Course Portal - placeholder link to future system */}
                                <Link
                                    to="/course-portal"
                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                                >
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:scale-110 transition-transform">
                                        <Play className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                            Course Portal
                                        </span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Open the Course Portal (coming soon)</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
