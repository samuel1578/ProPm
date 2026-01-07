import { useState, useEffect } from 'react';
import {
    Play,
    Target,
    Clock,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    BookOpen,
    TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
    QuizSettings,
    QuizSession,
    QuizMode,
    ShuffledQuestion,
    QuizAnswer,
    EXAM_CONFIGS,
    PMP_KNOWLEDGE_AREAS,
} from '../types/quiz';
import { getQuestions, submitQuizAttempt } from '../lib/appwrite';

interface QuizInterfaceProps {
    enrollment: any;
    certification: string;
}

export default function QuizInterface({ enrollment, certification }: QuizInterfaceProps) {
    const { user } = useAuth();
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
    const [selectedSettings, setSelectedSettings] = useState<QuizSettings>({
        mode: 'practice',
        questionCount: 25,
        knowledgeAreas: [],
        difficulty: 'mixed',
        timed: false,
        showExplanations: true,
    });
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);

    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const handleSubmitQuiz = async () => {
        if (!quizSession || !user) return;

        const totalTime = Math.floor((Date.now() - quizSession.startTime) / 1000);
        const correctCount = Array.from(quizSession.answers.values()).filter((a) => a.isCorrect).length;
        const score = (correctCount / quizSession.questions.length) * 100;

        // Calculate knowledge area breakdown
        const areaMap = new Map<string, { correct: number; total: number }>();
        quizSession.questions.forEach((q) => {
            const answer = quizSession.answers.get(q.$id);
            const area = q.knowledgeArea;

            if (!areaMap.has(area)) {
                areaMap.set(area, { correct: 0, total: 0 });
            }

            const areaData = areaMap.get(area)!;
            areaData.total += 1;
            if (answer?.isCorrect) {
                areaData.correct += 1;
            }
        });

        const knowledgeAreaBreakdown = Array.from(areaMap.entries()).map(([area, data]) => ({
            area,
            correct: data.correct,
            total: data.total,
            accuracy: (data.correct / data.total) * 100,
        }));

        try {
            await submitQuizAttempt(
                user.$id,
                enrollment.$id,
                certification,
                quizSession.settings.mode,
                Array.from(quizSession.answers.values()),
                score,
                correctCount,
                quizSession.questions.length,
                totalTime,
                knowledgeAreaBreakdown
            );

            setShowResults(true);
        } catch (err) {
            console.error('Failed to submit quiz:', err);
            setShowResults(true); // Show results anyway
        }
    };

    // Timer effect
    useEffect(() => {
        if (!quizSession || !selectedSettings.timed || quizSession.isPaused || showResults) return;

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - quizSession.startTime) / 1000);
            const limit = (selectedSettings.timeLimit || 0) * 60;
            const remaining = limit - elapsed;

            if (remaining <= 0) {
                handleSubmitQuiz();
            } else {
                setTimeRemaining(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [quizSession, selectedSettings.timed, showResults]);

    const handleStartQuiz = async () => {
        setLoading(true);
        try {
            const examType = certification as 'PMP' | 'CAPM';
            const questions = await getQuestions(
                examType,
                selectedSettings.questionCount,
                selectedSettings.knowledgeAreas.length > 0 ? selectedSettings.knowledgeAreas : undefined,
                selectedSettings.difficulty !== 'mixed' ? selectedSettings.difficulty : undefined
            );

            // Shuffle questions and options
            const shuffledQuestions: ShuffledQuestion[] = questions.map((q: any) => {
                const optionsWithIndex = q.options.map((opt: string, idx: number) => ({ opt, idx }));
                const shuffled = shuffleArray(optionsWithIndex);

                return {
                    ...q,
                    shuffledOptions: shuffled.map((item: any) => item.opt),
                    originalIndexMap: shuffled.map((item: any) => item.idx),
                };
            });

            const finalQuestions = shuffleArray(shuffledQuestions);

            setQuizSession({
                settings: selectedSettings,
                questions: finalQuestions,
                answers: new Map(),
                currentQuestionIndex: 0,
                startTime: Date.now(),
                isPaused: false,
            });

            if (selectedSettings.timed && selectedSettings.timeLimit) {
                setTimeRemaining(selectedSettings.timeLimit * 60);
            }

            setQuizStarted(true);
        } catch (err) {
            console.error('Failed to load questions:', err);
            alert('Unable to load questions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (selectedOption: string) => {
        if (!quizSession) return;

        const currentQuestion = quizSession.questions[quizSession.currentQuestionIndex];
        const selectedIndex = currentQuestion.shuffledOptions.indexOf(selectedOption);
        const originalIndex = currentQuestion.originalIndexMap[selectedIndex];
        const correctIndex = ['A', 'B', 'C', 'D'].indexOf(currentQuestion.correctAnswer);
        const isCorrect = originalIndex === correctIndex;

        const answer: QuizAnswer = {
            questionId: currentQuestion.$id,
            selectedAnswer: selectedOption,
            isCorrect,
        };

        const newAnswers = new Map(quizSession.answers);
        newAnswers.set(currentQuestion.$id, answer);

        setQuizSession({
            ...quizSession,
            answers: newAnswers,
        });
    };

    const handleNextQuestion = () => {
        if (!quizSession) return;

        if (quizSession.currentQuestionIndex < quizSession.questions.length - 1) {
            setQuizSession({
                ...quizSession,
                currentQuestionIndex: quizSession.currentQuestionIndex + 1,
            });
        }
    };

    const handlePreviousQuestion = () => {
        if (!quizSession) return;

        if (quizSession.currentQuestionIndex > 0) {
            setQuizSession({
                ...quizSession,
                currentQuestionIndex: quizSession.currentQuestionIndex - 1,
            });
        }
    };

    const handleRestart = () => {
        setQuizStarted(false);
        setQuizSession(null);
        setShowResults(false);
        setTimeRemaining(0);
    };

    // Quiz setup screen
    if (!quizStarted) {
        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Configure Your Practice Session
                        </h2>
                    </div>

                    <div className="space-y-6">
                        {/* Quiz Mode */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Quiz Mode
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { value: 'practice' as QuizMode, label: 'Practice Mode', desc: 'Relaxed practice with instant feedback' },
                                    { value: 'timed-exam' as QuizMode, label: 'Timed Exam', desc: 'Simulate real exam conditions' },
                                    { value: 'knowledge-area-focus' as QuizMode, label: 'Focus Mode', desc: 'Target specific knowledge areas' },
                                    { value: 'final-exam' as QuizMode, label: 'Final Exam', desc: 'Full-length practice exam' },
                                ].map((mode) => (
                                    <button
                                        key={mode.value}
                                        onClick={() => setSelectedSettings({ ...selectedSettings, mode: mode.value })}
                                        className={`p-4 rounded-lg border-2 text-left transition-all ${selectedSettings.mode === mode.value
                                                ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                                            }`}
                                    >
                                        <div className="font-semibold text-gray-900 dark:text-white">{mode.label}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">{mode.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question Count */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Number of Questions
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {[10, 25, 50, 100, 180].map((count) => (
                                    <button
                                        key={count}
                                        onClick={() => setSelectedSettings({ ...selectedSettings, questionCount: count })}
                                        className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all ${selectedSettings.questionCount === count
                                                ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500'
                                            }`}
                                    >
                                        {count}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Knowledge Areas (for focus mode) */}
                        {selectedSettings.mode === 'knowledge-area-focus' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Select Knowledge Areas
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                    {PMP_KNOWLEDGE_AREAS.map((area) => (
                                        <label
                                            key={area}
                                            className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedSettings.knowledgeAreas.includes(area)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedSettings({
                                                            ...selectedSettings,
                                                            knowledgeAreas: [...selectedSettings.knowledgeAreas, area],
                                                        });
                                                    } else {
                                                        setSelectedSettings({
                                                            ...selectedSettings,
                                                            knowledgeAreas: selectedSettings.knowledgeAreas.filter((a) => a !== area),
                                                        });
                                                    }
                                                }}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{area}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Start Button */}
                        <button
                            onClick={handleStartQuiz}
                            disabled={loading || (selectedSettings.mode === 'knowledge-area-focus' && selectedSettings.knowledgeAreas.length === 0)}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-lg"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Loading Questions...</span>
                                </>
                            ) : (
                                <>
                                    <Play className="w-5 h-5" />
                                    <span>Start Practice Session</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Results screen
    if (showResults && quizSession) {
        const correctCount = Array.from(quizSession.answers.values()).filter((a) => a.isCorrect).length;
        const score = (correctCount / quizSession.questions.length) * 100;
        const passed = score >= (EXAM_CONFIGS[certification as 'PMP' | 'CAPM']?.passingScore || 61);

        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
                        }`}>
                        {passed ? (
                            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                        ) : (
                            <TrendingUp className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                        )}
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {passed ? 'Great Job!' : 'Keep Practicing!'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        You scored {correctCount} out of {quizSession.questions.length} questions correctly
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round(score)}%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Your Score</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{correctCount}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                {quizSession.questions.length - correctCount}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Incorrect</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {Math.floor((Date.now() - quizSession.startTime) / 60000)}m
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Time Taken</div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={handleRestart}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Try Again
                        </button>
                    </div>
                </div>

                {/* Review incorrect answers */}
                <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Review Your Answers</h3>
                    <div className="space-y-4">
                        {quizSession.questions.map((question, idx) => {
                            const answer = quizSession.answers.get(question.$id);
                            if (!answer || answer.isCorrect) return null;

                            return (
                                <div key={question.$id} className="border-l-4 border-red-500 pl-4 py-2">
                                    <div className="font-medium text-gray-900 dark:text-white mb-2">
                                        Q{idx + 1}: {question.questionText}
                                    </div>
                                    <div className="text-sm text-red-600 dark:text-red-400 mb-1">
                                        Your answer: {answer.selectedAnswer}
                                    </div>
                                    <div className="text-sm text-green-600 dark:text-green-400 mb-2">
                                        Correct answer: {question.options[['A', 'B', 'C', 'D'].indexOf(question.correctAnswer)]}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong>Explanation:</strong> {question.explanation}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Active quiz screen
    if (quizSession) {
        const currentQuestion = quizSession.questions[quizSession.currentQuestionIndex];
        const currentAnswer = quizSession.answers.get(currentQuestion.$id);
        const progress = ((quizSession.currentQuestionIndex + 1) / quizSession.questions.length) * 100;

        return (
            <div className="space-y-6">
                {/* Progress and Timer */}
                <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Question {quizSession.currentQuestionIndex + 1} of {quizSession.questions.length}
                        </span>
                        {selectedSettings.timed && (
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Clock className="w-4 h-4" />
                                <span>
                                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Question */}
                <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="mb-6">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {currentQuestion.knowledgeArea} • {currentQuestion.difficulty}
                                </div>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">
                                    {currentQuestion.questionText}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {currentQuestion.shuffledOptions.map((option, idx) => {
                            const optionLetter = ['A', 'B', 'C', 'D'][idx];
                            const isSelected = currentAnswer?.selectedAnswer === option;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswerSelect(option)}
                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${isSelected
                                            ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${isSelected
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            {optionLetter}
                                        </div>
                                        <span className="flex-1 text-gray-900 dark:text-white pt-1">{option}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation (if practice mode and answered) */}
                    {selectedSettings.showExplanations && currentAnswer && (
                        <div className={`mt-6 p-4 rounded-lg border-l-4 ${currentAnswer.isCorrect
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                            }`}>
                            <div className="flex items-start gap-2 mb-2">
                                {currentAnswer.isCorrect ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                )}
                                <span className={`font-semibold ${currentAnswer.isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                                    }`}>
                                    {currentAnswer.isCorrect ? 'Correct!' : 'Incorrect'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Explanation:</strong> {currentQuestion.explanation}
                            </p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handlePreviousQuestion}
                        disabled={quizSession.currentQuestionIndex === 0}
                        className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Previous
                    </button>

                    {quizSession.currentQuestionIndex === quizSession.questions.length - 1 ? (
                        <button
                            onClick={handleSubmitQuiz}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Submit Quiz
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuestion}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Next
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return null;
}
