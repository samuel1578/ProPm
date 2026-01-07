import { useState, useEffect } from 'react';
import { FileText, Download, Lock, Folder } from 'lucide-react';
import { getResources, getResourceDownloadUrl, trackResourceDownload } from '../lib/appwrite';
import { useAuth } from '../context/AuthContext';
import type { Resource } from '../types/resources';

interface ResourcesSectionProps {
    examType: string;
    userEnrolled: boolean;
}

export default function ResourcesSection({ examType, userEnrolled }: ResourcesSectionProps) {
    const { user } = useAuth();
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [downloading, setDownloading] = useState<string | null>(null);

    const categories = ['All', 'Study-Guide', 'Practice-Test', 'Cheat-Sheet', 'PMBOK-Guide', 'Templates', 'Video'];

    useEffect(() => {
        loadResources();
    }, [examType]);

    async function loadResources() {
        try {
            setLoading(true);

            console.log('🔍 Loading resources for exam type:', examType);

            // Get all resources first
            const allResources = await getResources();
            console.log('📚 All resources from database:', allResources);

            // Filter by matching exam type - compare full certification names
            const filtered = allResources.filter(resource => {
                // Both should match the full certification name like "Project Management Professional (PMP)®"
                const matches = resource.examType?.toLowerCase().includes(examType.toLowerCase()) ||
                    examType.toLowerCase().includes(resource.examType?.toLowerCase() || '');

                console.log(`Comparing: "${resource.examType}" vs "${examType}" = ${matches}`);
                return matches;
            });

            console.log('✅ Filtered resources:', filtered);
            setResources(filtered as unknown as Resource[]);
        } catch (error) {
            console.error('Failed to load resources:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDownload(resource: Resource) {
        if (!user) {
            alert('Please login to download resources');
            return;
        }

        if (!userEnrolled && resource.isPremium) {
            alert('Enroll in this course to access premium resources');
            return;
        }

        if (!resource.fileId) {
            alert('File not available');
            return;
        }

        try {
            setDownloading(resource.$id);
            const url = await getResourceDownloadUrl(resource.fileId);

            // Track download
            await trackResourceDownload(user.$id, resource.$id);

            // Trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = `${resource.title}.pdf`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Refresh resources to update download count
            setTimeout(loadResources, 1000);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. Please try again.');
        } finally {
            setDownloading(null);
        }
    }

    const filteredResources = selectedCategory === 'All'
        ? resources
        : resources.filter(r => r.category === selectedCategory);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading resources...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Study Resources</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Download materials to help you prepare for the {examType} exam
                    </p>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-[#0b1b36] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#0d2244]'
                            }`}
                    >
                        {category.replace(/-/g, ' ')}
                    </button>
                ))}
            </div>

            {/* Resources Grid */}
            {filteredResources.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-[#0b1b36] rounded-xl border border-gray-200 dark:border-gray-700">
                    <Folder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">No resources available in this category</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredResources.map((resource) => (
                        <div
                            key={resource.$id}
                            className="bg-white dark:bg-[#0b1b36] rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                            {resource.category?.replace(/-/g, ' ')}
                                        </span>
                                    </div>
                                </div>
                                {resource.isPremium && (
                                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded">
                                        Premium
                                    </span>
                                )}
                            </div>

                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                {resource.title}
                            </h3>

                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                {resource.description}
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                                <span>
                                    {resource.fileSize
                                        ? `${(resource.fileSize / 1024 / 1024).toFixed(1)} MB`
                                        : resource.fileId ? 'PDF' : 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Download className="w-3 h-3" />
                                    {resource.downloadCount || 0} downloads
                                </span>
                            </div>

                            {/* Tags */}
                            {resource.tags && resource.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {resource.tags.slice(0, 3).map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => handleDownload(resource)}
                                disabled={downloading === resource.$id || (!userEnrolled && resource.isPremium)}
                                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${!userEnrolled && resource.isPremium
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                    : downloading === resource.$id
                                        ? 'bg-blue-400 text-white cursor-wait'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {!userEnrolled && resource.isPremium ? (
                                    <>
                                        <Lock className="w-4 h-4" />
                                        Enroll to Access
                                    </>
                                ) : downloading === resource.$id ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Downloading...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Download
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
