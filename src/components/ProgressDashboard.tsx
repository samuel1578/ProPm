import { useEffect, useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Target,
    Clock,
    Award,
    AlertCircle,
    CheckCircle,
    Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProgress, getQuizHistory } from '../lib/appwrite';
import { EXAM_CONFIGS } from '../types/quiz';

interface ProgressDashboardProps {
    enrollment: any;
    certification: string;
}

export default function ProgressDashboard({ enrollment, certification }: ProgressDashboardProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState<any>(null);
    const [quizHistory, setQuizHistory] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;

        (async () => {
            try {
                const [progressData, historyData] = await Promise.all([
                    getUserProgress(user.$id, enrollment.$id),
                    getQuizHistory(user.$id, 10),
                ]);

                setProgress(progressData);
                setQuizHistory(historyData);
            } catch (err) {
                console.log('No progress data available yet');
            } finally {
                setLoading(false);
            }
        })();
    }, [user, enrollment]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading progress data...</p>
                </div>
            </div>
        );
    }

    if (!progress) {
        return (
            <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No Progress Data Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Start practicing questions to see your progress and analytics here
                </p>
            </div>
        );
    }

    const examConfig = EXAM_CONFIGS[certification as 'PMP' | 'CAPM'];
    const passingScore = examConfig?.passingScore || 61;
    const isReadyForExam = progress.overallAccuracy >= passingScore;

    return (
        <div className="space-y-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <Target className="w-8 h-8 opacity-80" />
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isReadyForExam ? 'bg-green-500' : 'bg-yellow-500'
                            }`}>
                            {isReadyForExam ? 'Ready' : 'Practice More'}
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                        {Math.round(progress.overallAccuracy)}%
                    </div>
                    <div className="text-sm text-blue-100">Overall Accuracy</div>
                </div>

                <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {progress.correctAnswers}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Correct Answers</div>
                </div>

                <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {progress.totalQuestionsAttempted}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Questions Attempted</div>
                </div>

                <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Award className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {progress.knowledgeAreaScores?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Areas Covered</div>
                </div>
            </div>

            {/* Readiness Indicator */}
            <div className={`rounded-xl shadow-sm border p-6 ${isReadyForExam
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                }`}>
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${isReadyForExam ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
                        }`}>
                        {isReadyForExam ? (
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                            <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-lg font-bold mb-2 ${isReadyForExam ? 'text-green-900 dark:text-green-100' : 'text-orange-900 dark:text-orange-100'
                            }`}>
                            {isReadyForExam ? 'You\'re Ready for the Exam!' : 'Keep Practicing'}
                        </h3>
                        <p className={`text-sm ${isReadyForExam ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'
                            }`}>
                            {isReadyForExam
                                ? `Your overall accuracy of ${Math.round(progress.overallAccuracy)}% exceeds the passing score of ${passingScore}%. Continue practicing to maintain your performance.`
                                : `Your current accuracy is ${Math.round(progress.overallAccuracy)}%. Aim for at least ${passingScore}% to be exam-ready. Focus on your weak areas below.`
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Knowledge Area Breakdown */}
            <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Performance by Knowledge Area
                    </h2>
                </div>

                <div className="space-y-4">
                    {progress.knowledgeAreaScores?.map((area: any) => {
                        const isStrong = area.accuracy >= 70;
                        const isWeak = area.accuracy < 60;

                        return (
                            <div key={area.area} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {area.area}
                                        </span>
                                        {isStrong && (
                                            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        )}
                                        {isWeak && (
                                            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {area.correct}/{area.total}
                                        </span>
                                        <span className={`text-sm font-semibold ${isStrong
                                            ? 'text-green-600 dark:text-green-400'
                                            : isWeak
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-gray-900 dark:text-white'
                                            }`}>
                                            {Math.round(area.accuracy)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${isStrong
                                            ? 'bg-gradient-to-r from-green-400 to-green-600'
                                            : isWeak
                                                ? 'bg-gradient-to-r from-red-400 to-red-600'
                                                : 'bg-gradient-to-r from-blue-400 to-blue-600'
                                            }`}
                                        style={{ width: `${area.accuracy}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Strong and Weak Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strong Areas */}
                <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Strong Areas
                        </h3>
                    </div>
                    <div className="space-y-2">
                        {progress.strongAreas && progress.strongAreas.length > 0 ? (
                            progress.strongAreas.map((area: string) => (
                                <div
                                    key={area}
                                    className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20"
                                >
                                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{area}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                Keep practicing to identify your strong areas
                            </p>
                        )}
                    </div>
                </div>

                {/* Weak Areas */}
                <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Areas to Improve
                        </h3>
                    </div>
                    <div className="space-y-2">
                        {progress.weakAreas && progress.weakAreas.length > 0 ? (
                            progress.weakAreas.map((area: string) => (
                                <div
                                    key={area}
                                    className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20"
                                >
                                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{area}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                Great! No weak areas identified yet
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Quiz History */}
            {quizHistory.length > 0 && (
                <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Recent Quiz Attempts
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {quizHistory.map((attempt: any, idx: number) => (
                            <div
                                key={attempt.$id || idx}
                                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${attempt.score >= passingScore
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                                        }`}>
                                        {Math.round(attempt.score)}%
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {attempt.mode === 'practice' ? 'Practice Mode' :
                                                attempt.mode === 'timed-exam' ? 'Timed Exam' :
                                                    attempt.mode === 'knowledge-area-focus' ? 'Focus Mode' : 'Final Exam'}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {attempt.totalQuestions} questions • {attempt.correctAnswers} correct
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(attempt.completedAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
