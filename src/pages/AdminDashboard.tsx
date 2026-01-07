import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    BookOpen,
    Brain,
    Video,
    Activity,
    Plus,
    Edit,
    Trash2,
    Search,
    Download,
    RefreshCw,
    Shield,
    BarChart3,
    Eye,
    X,
    FileText,
} from 'lucide-react';
import { databases } from '../lib/appwrite';
import { Query } from 'appwrite';
import AdminResourceManager from '../components/AdminResourceManager';

const VITE_APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTIONS = {
    USER_PROFILES: import.meta.env.VITE_APPWRITE_PROFILE_COLLECTION_ID,
    USER_COURSES: import.meta.env.VITE_APPWRITE_ENROLLMENTS_COLLECTION_ID,
    KNOWLEDGE_AREAS: import.meta.env.VITE_APPWRITE_KNOWLEDGE_AREAS_COLLECTION_ID,
    LIVE_SESSIONS: import.meta.env.VITE_APPWRITE_LIVE_SESSIONS_COLLECTION_ID,
    ACTIVITIES: import.meta.env.VITE_APPWRITE_ACTIVITIES_COLLECTION_ID,
    PROGRESS_SUMMARY: import.meta.env.VITE_APPWRITE_PROGRESS_SUMMARY_COLLECTION_ID,
};

type CollectionKey = keyof typeof COLLECTIONS;

interface CollectionStats {
    total: number;
    recent: number;
    active?: number;
}

export default function AdminDashboard() {
    const { user, initializing } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<CollectionKey>('USER_PROFILES');
    const [documents, setDocuments] = useState<any[]>([]);
    const [stats, setStats] = useState<Record<CollectionKey, CollectionStats>>({} as any);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');

    // Check admin access (you should implement proper role checking)
    useEffect(() => {
        if (!initializing && !user) {
            navigate('/login');
            return;
        }
        // TODO: Add admin role verification
        // if (!user?.labels?.includes('admin')) navigate('/');
    }, [user, initializing, navigate]);

    // Load all collection stats on mount
    useEffect(() => {
        if (user) loadAllStats();
    }, [user]);

    // Load documents when tab changes
    useEffect(() => {
        if (user && activeTab) loadDocuments(activeTab);
    }, [activeTab, user]);

    const loadAllStats = async () => {
        if (!databases) return;
        const newStats: any = {};
        for (const [key, collectionId] of Object.entries(COLLECTIONS)) {
            try {
                const res = await databases.listDocuments(
                    VITE_APPWRITE_DATABASE_ID,
                    collectionId,
                    [Query.limit(1)]
                );
                const total = res.total || 0;

                // Get recent (last 7 days) count
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const recentRes = await databases.listDocuments(
                    VITE_APPWRITE_DATABASE_ID,
                    collectionId,
                    [
                        Query.greaterThan('$createdAt', sevenDaysAgo.toISOString()),
                        Query.limit(1)
                    ]
                );

                newStats[key] = {
                    total,
                    recent: recentRes.total || 0,
                };
            } catch (err) {
                console.error(`Failed to load stats for ${key}:`, err);
                newStats[key] = { total: 0, recent: 0 };
            }
        }
        setStats(newStats);
    };

    const loadDocuments = async (collection: CollectionKey, search = '') => {
        if (!databases) return;
        setLoading(true);
        try {
            const queries = [Query.limit(100), Query.orderDesc('$createdAt')];

            // Add search if applicable (customize per collection)
            if (search) {
                // Example: search by email in user_profiles
                if (collection === 'USER_PROFILES') {
                    queries.push(Query.search('email', search));
                }
            }

            const res = await databases.listDocuments(
                VITE_APPWRITE_DATABASE_ID,
                COLLECTIONS[collection],
                queries
            );
            setDocuments(res.documents);
        } catch (err) {
            console.error('Failed to load documents:', err);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (docId: string) => {
        if (!databases) return;
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            await databases.deleteDocument(
                VITE_APPWRITE_DATABASE_ID,
                COLLECTIONS[activeTab],
                docId
            );
            loadDocuments(activeTab);
            loadAllStats();
            alert('Document deleted successfully');
        } catch (err: any) {
            alert('Failed to delete: ' + err.message);
        }
    };

    const handleEdit = (doc: any) => {
        setSelectedDoc(doc);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleView = (doc: any) => {
        setSelectedDoc(doc);
        setModalMode('view');
        setShowModal(true);
    };

    const handleCreate = () => {
        setSelectedDoc(null);
        setModalMode('create');
        setShowModal(true);
    };

    const handleSave = async (data: any) => {
        if (!databases) return;
        try {
            if (modalMode === 'create') {
                await databases.createDocument(
                    VITE_APPWRITE_DATABASE_ID,
                    COLLECTIONS[activeTab],
                    'unique()',
                    data
                );
            } else if (modalMode === 'edit') {
                await databases.updateDocument(
                    VITE_APPWRITE_DATABASE_ID,
                    COLLECTIONS[activeTab],
                    selectedDoc.$id,
                    data
                );
            }
            setShowModal(false);
            loadDocuments(activeTab);
            loadAllStats();
            alert('Document saved successfully');
        } catch (err: any) {
            alert('Failed to save: ' + err.message);
        }
    };

    const exportData = async () => {
        try {
            const json = JSON.stringify(documents, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${activeTab}_${new Date().toISOString()}.json`;
            a.click();
        } catch (err: any) {
            alert('Export failed: ' + err.message);
        }
    };

    const collectionConfigs = {
        USER_PROFILES: {
            icon: Users,
            label: 'User Profiles',
            color: 'blue',
            fields: ['displayName', 'email', 'profileCompleted']
        },
        USER_COURSES: {
            icon: BookOpen,
            label: 'Enrollments',
            color: 'green',
            fields: ['userId', 'planName', 'status', 'certifications']
        },
        KNOWLEDGE_AREAS: {
            icon: Brain,
            label: 'Knowledge Areas',
            color: 'purple',
            fields: ['name', 'completion', 'totalModules', 'completedModules']
        },
        LIVE_SESSIONS: {
            icon: Video,
            label: 'Live Sessions',
            color: 'red',
            fields: ['title', 'instructor', 'startAt', 'tier']
        },
        ACTIVITIES: {
            icon: Activity,
            label: 'Activities',
            color: 'orange',
            fields: ['userId', 'type', 'title', 'occurredAt']
        },
        PROGRESS_SUMMARY: {
            icon: BarChart3,
            label: 'Progress Summary',
            color: 'indigo',
            fields: ['userId', 'totalProgress', 'lastUpdate']
        },
        RESOURCES: {
            icon: FileText,
            label: 'Resources',
            color: 'teal',
            fields: ['title', 'examType', 'category', 'downloadCount']
        }
    } as const;

    if (initializing || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    const config = collectionConfigs[activeTab];
    const Icon = config.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Admin Dashboard
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Manage all ProPM collections
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={loadAllStats}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="Refresh stats"
                            >
                                <RefreshCw className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                User View
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    {Object.entries(collectionConfigs).map(([key, cfg]) => {
                        const stat = stats[key as CollectionKey] || { total: 0, recent: 0 };
                        const CollIcon = cfg.icon;
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key as CollectionKey)}
                                className={`p-4 rounded-xl transition-all ${activeTab === key
                                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                                    : 'bg-white dark:bg-gray-800 hover:shadow-md'
                                    }`}
                            >
                                <CollIcon className={`h-6 w-6 mb-2 ${activeTab === key ? 'text-white' : `text-${cfg.color}-600`}`} />
                                <div className="text-2xl font-bold">{stat.total}</div>
                                <div className="text-xs opacity-80">{cfg.label}</div>
                                <div className="text-xs mt-1 opacity-60">+{stat.recent} this week</div>
                            </button>
                        );
                    })}
                </div>

                {/* Actions Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Icon className={`h-6 w-6 text-${config.color}-600`} />
                            <h2 className="text-xl font-semibold">{config.label}</h2>
                            <span className="text-sm text-gray-500">
                                {documents.length} documents
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        loadDocuments(activeTab, e.target.value);
                                    }}
                                    className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>

                            <button
                                onClick={exportData}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="Export JSON"
                            >
                                <Download className="h-5 w-5" />
                            </button>

                            <button
                                onClick={handleCreate}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Create New
                            </button>
                        </div>
                    </div>
                </div>

                {/* Documents Table */}
                {activeTab === 'RESOURCES' ? (
                    <AdminResourceManager />
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mx-auto" />
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                No documents found
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                            {config.fields.map(field => (
                                                <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    {field}
                                                </th>
                                            ))}
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {documents.map((doc) => (
                                            <tr key={doc.$id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 text-sm font-mono text-gray-500">
                                                    {doc.$id.slice(0, 8)}...
                                                </td>
                                                {config.fields.map(field => (
                                                    <td key={field} className="px-6 py-4 text-sm">
                                                        {Array.isArray(doc[field])
                                                            ? doc[field].join(', ')
                                                            : typeof doc[field] === 'boolean'
                                                                ? doc[field] ? '✓' : '✗'
                                                                : doc[field] || '—'}
                                                    </td>
                                                ))}
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(doc.$createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleView(doc)}
                                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                            title="View"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(doc)}
                                                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                            title="Edit"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(doc.$id)}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
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
                )}
            </div>

            {/* Modal for View/Edit/Create */}
            {showModal && (
                <DocumentModal
                    doc={selectedDoc}
                    mode={modalMode}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

// Reusable modal component
function DocumentModal({
    doc,
    mode,
    onClose,
    onSave
}: {
    doc: any;
    mode: 'view' | 'edit' | 'create';
    onClose: () => void;
    onSave: (data: any) => void;
}) {
    const [formData, setFormData] = useState(doc || {});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanData = { ...formData };
        delete cleanData.$id;
        delete cleanData.$createdAt;
        delete cleanData.$updatedAt;
        delete cleanData.$permissions;
        delete cleanData.$collectionId;
        delete cleanData.$databaseId;
        onSave(cleanData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-xl font-semibold">
                        {mode === 'create' ? 'Create New Document' : mode === 'edit' ? 'Edit Document' : 'View Document'}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {mode === 'view' ? (
                        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm">
                            {JSON.stringify(doc, null, 2)}
                        </pre>
                    ) : (
                        <div className="space-y-4">
                            {Object.keys(formData).filter(k => !k.startsWith('$')).map(key => (
                                <div key={key}>
                                    <label className="block text-sm font-medium mb-1">{key}</label>
                                    <input
                                        type="text"
                                        value={formData[key] || ''}
                                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            {mode === 'view' ? 'Close' : 'Cancel'}
                        </button>
                        {mode !== 'view' && (
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
