import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    BookOpen,
    Award,
    BarChart3,
    ChevronRight,
    Target,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    FileText,
    Settings,
    Users,
    Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserEnrollments, getUserProgress } from '../lib/appwrite';
import QuizInterface from '../components/QuizInterface';
import ProgressDashboard from '../components/ProgressDashboard';
import ResourcesSection from '../components/ResourcesSection';
import AdminResourceManager from '../components/AdminResourceManager';

type TabType = 'overview' | 'practice' | 'progress' | 'resources';
type AdminTabType = 'resources' | 'questions' | 'settings';

export default function CoursePortal() {
    const { user, initializing } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [hasEnrollment, setHasEnrollment] = useState(false);
    const [enrollment, setEnrollment] = useState<any>(null);
    const [progress, setProgress] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [adminActiveTab, setAdminActiveTab] = useState<AdminTabType>('resources');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (initializing) return;

        if (!user) {
            navigate('/login');
            return;
        }

        // Check if user is admin
        const checkAdmin = (user as any)?.labels?.includes('admin') || false;
        setIsAdmin(checkAdmin);

        (async () => {
            try {
                // Admins don't need enrollment check
                if (checkAdmin) {
                    setLoading(false);
                    return;
                }

                const enrollments = await getUserEnrollments(user.$id);

                if (enrollments.length === 0) {
                    setHasEnrollment(false);
                    setLoading(false);
                    return;
                }

                const activeEnrollment = enrollments[0];
                setEnrollment(activeEnrollment);
                setHasEnrollment(true);

                // Load user progress
                try {
                    const userProgress = await getUserProgress(user.$id, activeEnrollment.$id);
                    setProgress(userProgress);
                } catch (err) {
                    console.log('No progress data yet, starting fresh');
                }
            } catch (err) {
                console.error('Failed to load enrollment:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [user, initializing, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050b1a]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading course portal...</p>
                </div>
            </div>
        );
    }

    // ADMIN VIEW - Management Interface
    if (isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#050b1a]">
                {/* Admin Header */}
                <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex items-center gap-2 text-sm mb-4">
                            <Link
                                to="/dashboard"
                                className="text-purple-100 hover:text-white font-medium transition-colors"
                            >
                                Dashboard
                            </Link>
                            <ChevronRight className="w-4 h-4 text-purple-200" />
                            <span className="text-white font-medium">Course Portal Management</span>
                        </nav>

                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Settings className="w-8 h-8" />
                                    <h1 className="text-3xl md:text-4xl font-bold">
                                        Course Portal Management
                                    </h1>
                                </div>
                                <p className="text-purple-100 text-lg">
                                    Manage resources, questions, and portal settings
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                    <div className="text-sm text-purple-100 mb-1">Admin Mode</div>
                                    <div className="text-2xl font-bold flex items-center gap-2">
                                        <Users className="w-6 h-6" />
                                        Active
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admin Navigation Tabs */}
                <div className="bg-white dark:bg-[#0b1b36] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex gap-8 overflow-x-auto">
                            {[
                                { id: 'resources' as AdminTabType, label: 'Manage Resources', icon: FileText },
                                { id: 'questions' as AdminTabType, label: 'Manage Questions', icon: Database },
                                { id: 'settings' as AdminTabType, label: 'Portal Settings', icon: Settings },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setAdminActiveTab(tab.id)}
                                    className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${adminActiveTab === tab.id
                                        ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Admin Content Area */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {adminActiveTab === 'resources' && (
                        <AdminResourceManager />
                    )}
                    {adminActiveTab === 'questions' && (
                        <div className="bg-white dark:bg-[#0b1b36] rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                            <div className="text-center">
                                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    Question Bank Management
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Import and manage your 2000+ question bank for PMP/CAPM exams
                                </p>
                                <div className="space-y-4 max-w-2xl mx-auto text-left bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Database className="w-5 h-5 text-blue-600" />
                                        Required Appwrite Setup:
                                    </h4>
                                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span><strong>Collection:</strong> "questions" with fields: questionText, options (array), correctAnswer, explanation, knowledgeArea, difficulty, examType</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span><strong>Import Tool:</strong> Use Appwrite Console to bulk import questions from CSV/JSON</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                            <span>Question management UI will be added in next phase</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                    {adminActiveTab === 'settings' && (
                        <div className="bg-white dark:bg-[#0b1b36] rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                            <div className="text-center">
                                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    Portal Settings
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Configure exam settings, time limits, and portal behavior
                                </p>
                                <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                                    Settings panel coming soon
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // No enrollment - show upgrade message (for regular users)
    if (!hasEnrollment) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#050b1a] py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-[#0b1b36] rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            No Active Enrollment
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                            You need an active enrollment to access the course portal and practice questions.
                        </p>
                        <Link
                            to="/pricing"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
                        >
                            <Award className="w-5 h-5" />
                            View Pricing Plans
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const certificationName = enrollment.certifications?.[0] || 'PMP';
    console.log('🔍 Certification Debug:', {
        enrollmentCertifications: enrollment.certifications,
        certificationName: certificationName,
        rawEnrollment: enrollment
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050b1a]">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center gap-2 text-sm mb-4">
                        <Link
                            to="/dashboard"
                            className="text-blue-100 hover:text-white font-medium transition-colors"
                        >
                            Dashboard
                        </Link>
                        <ChevronRight className="w-4 h-4 text-blue-200" />
                        <span className="text-white font-medium">Course Portal</span>
                    </nav>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                {certificationName} Exam Preparation
                            </h1>
                            <p className="text-blue-100 text-lg">
                                Master the exam with comprehensive practice questions
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="text-sm text-blue-100 mb-1">Overall Progress</div>
                                <div className="text-3xl font-bold">
                                    {progress?.overallAccuracy ? `${Math.round(progress.overallAccuracy)}%` : '0%'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-[#0b1b36] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-8 overflow-x-auto">
                        {[
                            { id: 'overview' as TabType, label: 'Overview', icon: BookOpen },
                            { id: 'practice' as TabType, label: 'Practice Questions', icon: Target },
                            { id: 'progress' as TabType, label: 'Progress & Analytics', icon: BarChart3 },
                            { id: 'resources' as TabType, label: 'Resources', icon: FileText },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && (
                    <OverviewTab certification={certificationName} progress={progress} />
                )}
                {activeTab === 'practice' && (
                    <QuizInterface enrollment={enrollment} certification={certificationName} />
                )}
                {activeTab === 'progress' && (
                    <ProgressDashboard enrollment={enrollment} certification={certificationName} />
                )}
                {activeTab === 'resources' && (
                    <ResourcesSection examType={certificationName} userEnrolled={hasEnrollment} />
                )}
            </div>
        </div>
    );
}

// Overview Tab Component
function OverviewTab({ certification, progress }: { certification: string; progress: any }) {
    return (
        <div className="space-y-6">
            {/* Welcome Message */}
            <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Award className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Welcome to {certification} Preparation
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Your journey to {certification} certification starts here. We've prepared over 2,000 practice questions
                            to help you master the exam content and build confidence.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span>2,000+ Questions</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span>Instant Grading</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span>Detailed Explanations</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 dark:hover:border-blue-400 transition-all group">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                        <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Extensive Question Bank
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Practice with our comprehensive collection covering all PMI knowledge areas
                    </p>
                </div>

                <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:border-green-500 dark:hover:border-green-400 transition-all group">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Track Your Progress
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Monitor performance across knowledge areas and identify improvement opportunities
                    </p>
                </div>

                <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:border-purple-500 dark:hover:border-purple-400 transition-all group">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                        <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Timed Exam Simulation
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Experience real exam conditions with timed practice sessions
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            {progress && (
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl shadow-xl p-6 text-white">
                    <h3 className="text-xl font-bold mb-4">Your Quick Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div className="text-2xl font-bold">{progress.totalQuestionsAttempted || 0}</div>
                            <div className="text-sm text-blue-100">Questions Attempted</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div className="text-2xl font-bold">{progress.correctAnswers || 0}</div>
                            <div className="text-sm text-blue-100">Correct Answers</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div className="text-2xl font-bold">
                                {progress.overallAccuracy ? `${Math.round(progress.overallAccuracy)}%` : '0%'}
                            </div>
                            <div className="text-sm text-blue-100">Overall Accuracy</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div className="text-2xl font-bold">{progress.knowledgeAreaScores?.length || 0}</div>
                            <div className="text-sm text-blue-100">Areas Covered</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}