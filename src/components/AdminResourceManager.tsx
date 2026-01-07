import { useState, useEffect } from 'react';
import {
    FileText,
    Trash2,
    Edit,
    Plus,
    X,
    Save,
    Loader,
} from 'lucide-react';
import {
    getResources,
    createResource,
    updateResource,
    deleteResource,
    uploadResourceFile,
    deleteResourceFile,
} from '../lib/appwrite';
import type { Resource } from '../types/resources';
import { RESOURCE_CATEGORIES, EXAM_TYPES } from '../types/resources';

export default function AdminResourceManager() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedExamTypes, setSelectedExamTypes] = useState<string[]>([EXAM_TYPES[0]]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Study-Guide' as const,
        isPremium: false,
        tags: '',
        order: 0,
    });

    useEffect(() => {
        loadResources();
    }, []);

    async function loadResources() {
        try {
            setLoading(true);
            const data = await getResources();
            setResources(data as unknown as Resource[]);
        } catch (error) {
            console.error('Failed to load resources:', error);
            alert('Failed to load resources');
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setFormData({
            title: '',
            description: '',
            category: 'Study-Guide',
            isPremium: false,
            tags: '',
            order: 0,
        });
        setSelectedExamTypes([EXAM_TYPES[0]]);
        setSelectedFile(null);
        setEditingResource(null);
        setShowForm(false);
    }

    function handleEdit(resource: Resource) {
        setEditingResource(resource);
        setFormData({
            title: resource.title,
            description: resource.description,
            category: resource.category as any,
            isPremium: resource.isPremium,
            tags: resource.tags?.join(', ') || '',
            order: resource.order,
        });
        setSelectedExamTypes([resource.examType]);
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (selectedExamTypes.length === 0) {
            alert('Please select at least one exam type');
            return;
        }

        setUploading(true);

        try {
            let fileId = editingResource?.fileId;
            let fileSize = editingResource?.fileSize;
            let fileType = editingResource?.fileType;

            // Upload new file if selected (only once)
            if (selectedFile) {
                const uploadedFile = await uploadResourceFile(selectedFile);
                fileId = uploadedFile.$id;
                fileSize = uploadedFile.sizeOriginal;
                fileType = uploadedFile.mimeType;
            }

            const baseResourceData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                isPremium: formData.isPremium,
                tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
                order: formData.order,
                fileId,
                fileSize,
                fileType,
            };

            if (editingResource) {
                // Update existing resource
                await updateResource(editingResource.$id, {
                    ...baseResourceData,
                    examType: selectedExamTypes[0],
                });
                alert('Resource updated successfully!');
            } else {
                // Create resource(s) - one for each selected exam type
                for (const examType of selectedExamTypes) {
                    await createResource({
                        ...baseResourceData,
                        examType,
                    });
                }
                const count = selectedExamTypes.length;
                alert(`Resource created successfully for ${count} certification${count > 1 ? 's' : ''}!`);
            }

            await loadResources();
            resetForm();
        } catch (error) {
            console.error('Failed to save resource:', error);
            alert('Failed to save resource. Please try again.');
        } finally {
            setUploading(false);
        }
    }

    async function handleDelete(resource: Resource) {
        if (!confirm(`Are you sure you want to delete "${resource.title}"?`)) {
            return;
        }

        try {
            // Delete file from storage if exists
            if (resource.fileId) {
                try {
                    await deleteResourceFile(resource.fileId);
                } catch (error) {
                    console.error('Failed to delete file:', error);
                }
            }

            // Delete resource document
            await deleteResource(resource.$id);
            alert('Resource deleted successfully!');
            await loadResources();
        } catch (error) {
            console.error('Failed to delete resource:', error);
            alert('Failed to delete resource. Please try again.');
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">Loading resources...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Resources</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Upload and manage study materials for courses
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Resource
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0b1b36] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-[#0b1b36] border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingResource ? 'Edit Resource' : 'Add New Resource'}
                            </h3>
                            <button
                                onClick={resetForm}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0d2244] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., PMP Exam Content Outline"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0d2244] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="Brief description of the resource"
                                />
                            </div>

                            {/* Target Certifications */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Target Certifications *
                                </label>
                                <div className="space-y-2 p-4 bg-gray-50 dark:bg-[#0b1b36] rounded-lg border border-gray-300 dark:border-gray-600">
                                    {EXAM_TYPES.map((type) => (
                                        <label key={type} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedExamTypes.includes(type)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedExamTypes([...selectedExamTypes, type]);
                                                    } else {
                                                        setSelectedExamTypes(selectedExamTypes.filter(t => t !== type));
                                                    }
                                                }}
                                                className="w-4 h-4 text-purple-600 bg-white dark:bg-[#0d2244] border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {type.replace(/®/g, '').trim()}
                                            </span>
                                        </label>
                                    ))}
                                    <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-gray-300 dark:border-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={selectedExamTypes.length === EXAM_TYPES.length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedExamTypes([...EXAM_TYPES]);
                                                } else {
                                                    setSelectedExamTypes([]);
                                                }
                                            }}
                                            className="w-4 h-4 text-purple-600 bg-white dark:bg-[#0d2244] border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500"
                                        />
                                        <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                            All Certifications
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Category */}
                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0d2244] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        {RESOURCE_CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat.replace(/-/g, ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    File {!editingResource && '*'}
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.docx,.xlsx,.pptx,.mp4"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    required={!editingResource}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0d2244] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                                {selectedFile && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                    </p>
                                )}
                                {editingResource && !selectedFile && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Current file will be kept if no new file is selected
                                    </p>
                                )}
                            </div>

                            {/* Tags & Order */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Tags (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0d2244] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., pmbok, agile, scrum"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Order
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0d2244] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Premium Toggle */}
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPremium}
                                        onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Premium Resource (requires enrollment)
                                    </span>
                                </label>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            {editingResource ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            {editingResource ? 'Update Resource' : 'Create Resource'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Resources List */}
            <div className="bg-white dark:bg-[#0b1b36] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {resources.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">No resources yet. Add your first one!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-[#0d2244] border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Exam
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Downloads
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {resources.map((resource) => (
                                    <tr key={resource.$id} className="hover:bg-gray-50 dark:hover:bg-[#0d2244]">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {resource.title}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                {resource.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {resource.examType}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {resource.category}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {resource.downloadCount || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            {resource.isPremium ? (
                                                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded">
                                                    Premium
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                                                    Free
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(resource)}
                                                    className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(resource)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
