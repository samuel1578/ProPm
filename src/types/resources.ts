// Resource Type Definitions

export interface Resource {
    $id: string;
    title: string;
    description: string;
    examType: 'Project Management Professional (PMP)®' | 'Certified Associate in Project Management (CAPM)®';
    category: 'Study-Guide' | 'Practice-Test' | 'Cheat-Sheet' | 'PMBOK-Guide' | 'Templates' | 'Video';
    fileId?: string;
    fileUrl?: string;
    fileSize?: number;
    fileType?: string;
    isPremium: boolean;
    downloadCount: number;
    tags?: string[];
    order: number;
    $createdAt?: string;
    $updatedAt?: string;
}

export interface ResourceDownload {
    $id: string;
    userId: string;
    resourceId: string;
    downloadedAt: string;
}

export const RESOURCE_CATEGORIES = [
    'Study-Guide',
    'Practice-Test',
    'Cheat-Sheet',
    'PMBOK-Guide',
    'Templates',
    'Video',
] as const;

export const EXAM_TYPES = [
    'Project Management Professional (PMP)®',
    'Certified Associate in Project Management (CAPM)®',
] as const;

export type ResourceCategory = typeof RESOURCE_CATEGORIES[number];
export type ExamType = typeof EXAM_TYPES[number];
