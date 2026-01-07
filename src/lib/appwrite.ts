import {
    Client,
    Account,
    Databases,
    ID,
    Storage,
    Query,
    Permission,
    Role,
} from 'appwrite';

// Initialize Appwrite client
const rawEndpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const endpoint = typeof rawEndpoint === 'string' ? rawEndpoint.trim() : '';
// Support both VITE_APPWRITE_PROJECT_ID and VITE_APPWRITE_PROJECT for compatibility
const rawProjectId = (import.meta.env.VITE_APPWRITE_PROJECT_ID as string) || (import.meta.env.VITE_APPWRITE_PROJECT as string);
const projectId = typeof rawProjectId === 'string' ? rawProjectId.trim() : '';

const client = new Client();
if (endpoint) {
    client.setEndpoint(endpoint);
} else {
    console.warn('Appwrite endpoint missing (set VITE_APPWRITE_ENDPOINT). Appwrite SDK disabled.');
}
if (projectId) {
    client.setProject(projectId);
} else {
    console.warn('Appwrite project ID missing (set VITE_APPWRITE_PROJECT_ID). Appwrite SDK disabled.');
}

const isAppwriteConfigured = Boolean(endpoint && projectId);
const APPWRITE_CONFIG_ERROR = 'Appwrite is not configured. Set VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID (or VITE_APPWRITE_PROJECT).';

const account = isAppwriteConfigured ? new Account(client) : null;
const databases = isAppwriteConfigured ? new Databases(client) : null;
let storage: Storage | null = null;
if (isAppwriteConfigured) {
    try {
        storage = new Storage(client);
    } catch (e) {
        console.warn('Appwrite storage initialization failed', e);
    }
}

// Appwrite Database / Collection / Bucket IDs (set via env)
const DATABASE_ID = (import.meta.env.VITE_APPWRITE_DATABASE_ID as string) || '';
const PROFILE_COLLECTION_ID = (import.meta.env.VITE_APPWRITE_PROFILE_COLLECTION_ID as string) || (import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID as string) || '';
const ENROLLMENTS_COLLECTION_ID = (import.meta.env.VITE_APPWRITE_ENROLLMENTS_COLLECTION_ID as string) || '';
const KNOWLEDGE_AREAS_COLLECTION_ID = (import.meta.env.VITE_APPWRITE_KNOWLEDGE_AREAS_COLLECTION_ID as string) || '';
const LIVE_SESSIONS_COLLECTION_ID = (import.meta.env.VITE_APPWRITE_LIVE_SESSIONS_COLLECTION_ID as string) || '';
const ACTIVITIES_COLLECTION_ID = (import.meta.env.VITE_APPWRITE_ACTIVITIES_COLLECTION_ID as string) || '';
const QUESTIONS_COLLECTION_ID = (import.meta.env.VITE_APPWRITE_QUESTIONS_COLLECTION_ID as string) || '';
const QUIZ_ATTEMPTS_COLLECTION_ID = (import.meta.env.VITE_APPWRITE_QUIZ_ATTEMPTS_COLLECTION_ID as string) || '';
const USER_PROGRESS_COLLECTION_ID = (import.meta.env.VITE_APPWRITE_USER_PROGRESS_COLLECTION_ID as string) || '';
const RESOURCES_COLLECTION_ID = ((import.meta.env.VITE_APPWRITE_RESOURCES_COLLECTION_ID as string) ?? 'resources').trim() || 'resources';
const RESOURCES_BUCKET_ID = ((import.meta.env.VITE_APPWRITE_RESOURCES_BUCKET_ID as string) ?? '695e669c00067331e2aa').trim() || '695e669c00067331e2aa';
const UNENROLLMENT_REQUESTS_COLLECTION_ID = (import.meta.env.VITE_APPWRITE_UNENROLLMENT_REQUESTS_COLLECTION_ID as string) || '';
const BUCKET_ID = (import.meta.env.VITE_APPWRITE_BUCKET_ID as string) || '';

if (!databases) {
    throw new Error(APPWRITE_CONFIG_ERROR);
}

if (!DATABASE_ID || !PROFILE_COLLECTION_ID) {
    throw new Error('Profile collection not configured. Set VITE_APPWRITE_DATABASE_ID and either VITE_APPWRITE_PROFILE_COLLECTION_ID or VITE_APPWRITE_USERS_COLLECTION_ID.');
}

export async function signUp(email: string, password: string, name?: string) {
    if (!account) {
        throw new Error(APPWRITE_CONFIG_ERROR);
    }

    try {
        const userId = ID.unique();
        return await account.create(userId, email, password, name);
    } catch (err: any) {
        const msg = String(err?.message || '');
        console.error('Sign-up failed:', err);

        if (msg.includes('user') && msg.includes('already exists')) {
            throw new Error('An account with this email already exists.');
        }

        throw new Error(msg || 'Sign-up failed. Please try again.');
    }
}

export async function signIn(email: string, password: string) {
    if (!account) {
        throw new Error(APPWRITE_CONFIG_ERROR);
    }

    try {
        return await account.createEmailPasswordSession(email, password);
    } catch (err: any) {
        const msg = String(err?.message || '');
        console.error('Sign-in failed:', err);

        if (msg.includes('Rate limit') || msg.includes('429')) {
            throw new Error('Too many login attempts. Please wait a few minutes and try again.');
        }

        if (msg.includes('Invalid credentials') || msg.includes('user') || msg.includes('password')) {
            throw new Error('Invalid email or password.');
        }

        throw new Error(msg || 'Sign-in failed. Please check your credentials.');
    }
}

export async function verifyAccount() {
    if (!isAppwriteConfigured) {
        return {
            ok: false,
            status: 0,
            headers: {},
            body: 'Appwrite is not configured.',
        };
    }
    const url = `${endpoint.replace(/\/v1\/?$/, '')}/v1/account`;
    const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'X-Appwrite-Project': projectId,
        },
    });

    const headersObj: Record<string, string> = {};
    res.headers.forEach((v, k) => (headersObj[k] = v));

    let body: any = null;
    try {
        body = await res.json();
    } catch (e) {
        body = await res.text().catch(() => null);
    }

    return { ok: res.ok, status: res.status, headers: headersObj, body };
}

export async function getCurrentUser() {
    if (!account) {
        console.info('Appwrite is not configured; returning null user.');
        return null;
    }
    try {
        return await account.get();
    } catch (err) {
        // SDK failed (or we're unauthenticated). Try a credentialed REST GET to gather debug info.
        const v = await verifyAccount();
        if (v.ok) return v.body;

        // If REST fallback says 401, treat as unauthenticated instead of an exception.
        if (v.status === 401) {
            console.warn('getCurrentUser: unauthenticated (401) - returning null user.');
            return null;
        }

        const hdrs = JSON.stringify(v.headers, null, 2);
        const bodyText = typeof v.body === 'object' ? JSON.stringify(v.body) : String(v.body);
        const message = `account.get() failed and REST fallback returned status ${v.status}.\nHeaders:\n${hdrs}\nBody:\n${bodyText}`;
        const e: any = new Error(message);
        e.original = err;
        throw e;
    }
}

export async function signOut() {
    if (!account) {
        return;
    }
    return account.deleteSession('current');
}

/**
 * Ping the Appwrite server to verify connectivity.
 * Returns a promise that resolves if the server is reachable.
 */
export async function uploadFile(file: File) {
    if (!file) return null;
    if (!isAppwriteConfigured) {
        throw new Error(APPWRITE_CONFIG_ERROR);
    }
    if (storage && BUCKET_ID) {
        try {
            const id = typeof ID?.unique === 'function' ? ID.unique() : `file-${Date.now()}`;
            return await storage.createFile(BUCKET_ID, id, file);
        } catch (err) {
            console.warn('Storage createFile failed, will try REST fallback', err);
        }
    }

    // REST fallback for file upload
    try {
        const url = `${endpoint.replace(/\/v1\/?$/, '')}/v1/storage/buckets/${BUCKET_ID}/files`;
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'X-Appwrite-Project': projectId,
            } as Record<string, string>,
            body: form,
        });
        if (!res.ok) {
            const text = await res.text().catch(() => null);
            throw new Error(text || `File upload failed (${res.status})`);
        }
        return await res.json();
    } catch (err) {
        console.error('uploadFile REST fallback failed', err);
        throw err;
    }
}

export async function saveUserProfile(data: Record<string, any>, file?: File) {
    if (!databases) {
        throw new Error(APPWRITE_CONFIG_ERROR);
    }
    if (!DATABASE_ID || !PROFILE_COLLECTION_ID) {
        throw new Error('Profile collection not configured. Set VITE_APPWRITE_DATABASE_ID and either VITE_APPWRITE_PROFILE_COLLECTION_ID or VITE_APPWRITE_USERS_COLLECTION_ID.');
    }

    if (!data.userId) {
        throw new Error('userId is required to save profile information.');
    }

    let fileRes: any = null;
    if (file) {
        fileRes = await uploadFile(file);
        data.idField = fileRes?.$id || fileRes?.id || null;
    }

    // Ensure required fields exist
    data.displayName = data.displayName ?? '';
    data.email = data.email ?? '';
    data.profileCompleted = data.profileCompleted ?? false;
    data.currentStep = data.currentStep ?? 1;

    // Sanitize document for Appwrite (remove unknown attrs, ensure types)
    const sanitizeForAppwrite = (doc: Record<string, any>) => {
        const payload: Record<string, any> = { ...doc };
        // Appwrite manages timestamps as $createdAt / $updatedAt — don't send createdAt
        if (payload.createdAt !== undefined) delete payload.createdAt;

        // Ensure certifications is an array of strings when present
        if (payload.certifications != null) {
            if (Array.isArray(payload.certifications)) {
                payload.certifications = payload.certifications.map((v: any) => String(v));
            } else {
                const str = String(payload.certifications || '');
                payload.certifications = str
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean);
            }
        }

        return payload;
    };

    const sanitizedData = sanitizeForAppwrite(data);

    try {
        const list = await databases.listDocuments(
            DATABASE_ID,
            PROFILE_COLLECTION_ID,
            [Query.equal('userId', data.userId)]
        );

        if (list.documents.length > 0) {
            return await databases.updateDocument(DATABASE_ID, PROFILE_COLLECTION_ID, list.documents[0].$id, sanitizedData);
        }

        const docId = typeof ID?.unique === 'function' ? ID.unique() : `prof-${Date.now()}`;
        const permissions = [
            Permission.read(Role.user(data.userId)),
            Permission.update(Role.user(data.userId)),
            Permission.delete(Role.user(data.userId)),
        ];

        return await databases.createDocument(
            DATABASE_ID,
            PROFILE_COLLECTION_ID,
            docId,
            sanitizedData,
            permissions
        );
    } catch (sdkErr) {
        console.error('SDK saveUserProfile failed', sdkErr);
        // REST fallback to create/update document
        try {
            const query = encodeURIComponent(`equal("userId","${data.userId}")`);
            const listUrl = `${endpoint.replace(/\/v1\/?$/, '')}/v1/databases/${DATABASE_ID}/collections/${PROFILE_COLLECTION_ID}/documents?queries[]=${query}`;
            const listRes = await fetch(listUrl, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'X-Appwrite-Project': projectId,
                },
            });

            const listBody = await listRes.json().catch(() => null);

            if (!listRes.ok) {
                console.error('REST listDocuments failed', listBody);
            }

            if (listBody?.documents?.length) {
                const docId = listBody.documents[0].$id;
                const updateUrl = `${endpoint.replace(/\/v1\/?$/, '')}/v1/databases/${DATABASE_ID}/collections/${PROFILE_COLLECTION_ID}/documents/${docId}`;
                const updateRes = await fetch(updateUrl, {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Appwrite-Project': projectId,
                    },
                    body: JSON.stringify({ data: sanitizedData }),
                });
                const updateBody = await updateRes.json().catch(() => null);
                if (!updateRes.ok) throw new Error(updateBody?.message || `saveUserProfile update failed (${updateRes.status})`);
                return updateBody;
            }

            const createUrl = `${endpoint.replace(/\/v1\/?$/, '')}/v1/databases/${DATABASE_ID}/collections/${PROFILE_COLLECTION_ID}/documents`;
            const createRes = await fetch(createUrl, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Appwrite-Project': projectId,
                },
                body: JSON.stringify({
                    documentId: typeof ID?.unique === 'function' ? ID.unique() : `prof-${Date.now()}`,
                    data: sanitizedData,
                    permissions: [
                        Permission.read(Role.user(data.userId)),
                        Permission.update(Role.user(data.userId)),
                        Permission.delete(Role.user(data.userId)),
                    ],
                }),
            });
            const createBody = await createRes.json().catch(() => null);
            if (!createRes.ok) throw new Error(createBody?.message || `saveUserProfile failed (${createRes.status})`);
            return createBody;
        } catch (restErr) {
            console.error('REST saveUserProfile failed', restErr);
            throw restErr;
        }
    }
}

export async function getUserProfile(userId: string) {
    if (!databases) {
        throw new Error(APPWRITE_CONFIG_ERROR);
    }
    if (!DATABASE_ID || !PROFILE_COLLECTION_ID) {
        throw new Error('Profile collection not configured. Set VITE_APPWRITE_DATABASE_ID and either VITE_APPWRITE_PROFILE_COLLECTION_ID or VITE_APPWRITE_USERS_COLLECTION_ID.');
    }

    try {
        const list = await databases.listDocuments(DATABASE_ID, PROFILE_COLLECTION_ID, [Query.equal('userId', userId)]);
        const existing = list?.documents?.[0];
        return existing ? { document: existing } : null;
    } catch (sdkErr) {
        console.error('SDK getUserProfile failed', sdkErr);
        // REST fallback
        const query = encodeURIComponent(`equal("userId","${userId}")`);
        const url = `${endpoint.replace(/\/v1\/?$/, '')}/v1/databases/${DATABASE_ID}/collections/${PROFILE_COLLECTION_ID}/documents?queries[]=${query}`;
        const res = await fetch(url, { method: 'GET', credentials: 'include', headers: { 'X-Appwrite-Project': projectId } });
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.message || `getUserProfile failed (${res.status})`);
        const found = body?.documents?.[0];
        return found ? { document: found } : null;
    }
}

export async function saveProfileProgress(userId: string, step: number, data: Partial<Record<string, any>>) {
    // Ensure all required fields are present with defaults
    const payload = {
        userId,
        email: data.email || '',
        displayName: data.displayName || '',
        homeCountry: data.homeCountry || null,
        phone: data.phone || null,
        dateOfBirth: data.dateOfBirth || null,
        headline: data.headline || null,
        bio: data.bio || null,
        address: data.address || null,
        currentRole: data.currentRole || null,
        yearsExperience: data.yearsExperience || 0,
        certifications: data.certifications || null,
        targetTrainingDate: data.targetTrainingDate || null,
        readinessLevel: data.readinessLevel || 'unknown',
        learningGoals: data.learningGoals || null,
        learningStyle: data.learningStyle || null,
        availability: data.availability || null,
        instructorPreferences: data.instructorPreferences || null,
        idtype: data.idtype || null,
        idNumber: data.idNumber || null,
        idField: data.idField || null,
        instructorNotes: data.instructorNotes || null,
        currentStep: step,
        profileCompleted: false,
        updatedAt: new Date().toISOString()
    };
    return await saveUserProfile(payload);
}

/**
 * Create an enrollment record for a user
 */
export async function createEnrollment(payload: {
    userId: string;
    planName: string;
    planBasePrice: number;
    currency?: string;
    certifications?: string[];
    status?: string;
}) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!DATABASE_ID || !ENROLLMENTS_COLLECTION_ID) throw new Error('Enrollments collection not configured. Set VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_ENROLLMENTS_COLLECTION_ID.');

    // Normalize certifications to an array of strings
    const certifications = ((): string[] => {
        if (payload.certifications == null) return [];
        if (Array.isArray(payload.certifications)) return payload.certifications.map((v: any) => String(v));
        const str = String(payload.certifications || '');
        return str.split(',').map(s => s.trim()).filter(Boolean);
    })();

    const doc = {
        userId: payload.userId,
        planName: payload.planName,
        planBasePrice: payload.planBasePrice,
        currency: payload.currency || 'GHS',
        certifications,
        status: payload.status || 'pending',
    };

    try {
        const docId = typeof ID?.unique === 'function' ? ID.unique() : `enr-${Date.now()}`;
        const permissions = [
            Permission.read(Role.user(payload.userId)),
            Permission.update(Role.user(payload.userId)),
            Permission.delete(Role.user(payload.userId)),
        ];

        return await databases.createDocument(DATABASE_ID, ENROLLMENTS_COLLECTION_ID, docId, doc, permissions);
    } catch (sdkErr) {
        console.error('createEnrollment SDK failed', sdkErr);
        // REST fallback
        const createUrl = `${endpoint.replace(/\/v1\/?$/, '')}/v1/databases/${DATABASE_ID}/collections/${ENROLLMENTS_COLLECTION_ID}/documents`;
        const res = await fetch(createUrl, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-Appwrite-Project': projectId,
            },
            body: JSON.stringify({ documentId: typeof ID?.unique === 'function' ? ID.unique() : `enr-${Date.now()}`, data: doc, permissions: [Permission.read(Role.user(payload.userId)), Permission.update(Role.user(payload.userId)), Permission.delete(Role.user(payload.userId))] }),
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.message || `createEnrollment failed (${res.status})`);
        return body;
    }
}

export async function getUserEnrollments(userId: string) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!DATABASE_ID || !ENROLLMENTS_COLLECTION_ID) throw new Error('Enrollments collection not configured. Set VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_ENROLLMENTS_COLLECTION_ID.');

    try {
        const list = await databases.listDocuments(DATABASE_ID, ENROLLMENTS_COLLECTION_ID, [Query.equal('userId', userId)]);
        return list.documents || [];
    } catch (sdkErr) {
        console.error('getUserEnrollments SDK failed', sdkErr);
        // REST fallback
        const query = encodeURIComponent(`equal(\"userId\", \"${userId}\")`);
        const url = `${endpoint.replace(/\/v1\/?$/, '')}/v1/databases/${DATABASE_ID}/collections/${ENROLLMENTS_COLLECTION_ID}/documents?queries[]=${query}`;
        const res = await fetch(url, { method: 'GET', credentials: 'include', headers: { 'X-Appwrite-Project': projectId } });
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.message || `getUserEnrollments failed (${res.status})`);
        return body.documents || [];
    }
}

export async function getKnowledgeAreasByEnrollment(enrollmentId: string) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!DATABASE_ID || !KNOWLEDGE_AREAS_COLLECTION_ID) throw new Error('Knowledge areas collection not configured. Set VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_KNOWLEDGE_AREAS_COLLECTION_ID.');

    try {
        const list = await databases.listDocuments(DATABASE_ID, KNOWLEDGE_AREAS_COLLECTION_ID, [Query.equal('enrollmentId', enrollmentId)]);
        return list.documents || [];
    } catch (sdkErr) {
        console.error('getKnowledgeAreasByEnrollment SDK failed', sdkErr);
        // REST fallback
        const params = new URLSearchParams();
        params.append('queries[]', `equal("enrollmentId","${enrollmentId}")`);
        const url = `${endpoint.replace(/\/v1\/?$/, '')}/v1/databases/${DATABASE_ID}/collections/${KNOWLEDGE_AREAS_COLLECTION_ID}/documents?${params.toString()}`;
        const res = await fetch(url, { method: 'GET', credentials: 'include', headers: { 'X-Appwrite-Project': projectId } });
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.message || `getKnowledgeAreasByEnrollment failed (${res.status})`);
        return body.documents || [];
    }
}

export async function getLiveSessionsForCertification(certification: string) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!DATABASE_ID || !LIVE_SESSIONS_COLLECTION_ID) throw new Error('Live sessions collection not configured. Set VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_LIVE_SESSIONS_COLLECTION_ID.');

    try {
        const now = new Date().toISOString();
        const list = await databases.listDocuments(DATABASE_ID, LIVE_SESSIONS_COLLECTION_ID, [Query.equal('certification', certification), Query.greaterThan('startAt', now)]);
        return list.documents || [];
    } catch (sdkErr) {
        console.error('getLiveSessionsForCertification SDK failed', sdkErr);
        const params = new URLSearchParams();
        params.append('queries[]', `equal("certification","${certification}")`);
        params.append('queries[]', `greaterThan("startAt","${new Date().toISOString()}")`);
        const url = `${endpoint.replace(/\/v1\/?$/, '')}/v1/databases/${DATABASE_ID}/collections/${LIVE_SESSIONS_COLLECTION_ID}/documents?${params.toString()}`;
        const res = await fetch(url, { method: 'GET', credentials: 'include', headers: { 'X-Appwrite-Project': projectId } });
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.message || `getLiveSessionsForCertification failed (${res.status})`);
        return body.documents || [];
    }
}

export async function getRecentActivitiesForUser(userId: string, limit = 20) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!DATABASE_ID || !ACTIVITIES_COLLECTION_ID) throw new Error('Activities collection not configured. Set VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_ACTIVITIES_COLLECTION_ID.');

    try {
        const list = await databases.listDocuments(DATABASE_ID, ACTIVITIES_COLLECTION_ID, [Query.equal('userId', userId), Query.orderDesc('occurredAt'), Query.limit(limit)]);
        return list.documents || [];
    } catch (sdkErr) {
        console.error('getRecentActivitiesForUser SDK failed', sdkErr);
        const params = new URLSearchParams();
        params.append('queries[]', `equal("userId","${userId}")`);
        params.append('queries[]', `orderDesc("occurredAt")`);
        params.append('limit', String(limit));
        const url = `${endpoint.replace(/\/v1\/?$/, '')}/v1/databases/${DATABASE_ID}/collections/${ACTIVITIES_COLLECTION_ID}/documents?${params.toString()}`;
        const res = await fetch(url, { method: 'GET', credentials: 'include', headers: { 'X-Appwrite-Project': projectId } });
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.message || `getRecentActivitiesForUser failed (${res.status})`);
        return body.documents || [];
    }
}

/**
 * Find a user's enrollment by plan name (used for duplicate guard)
 */
export async function findUserEnrollmentByCourse(userId: string, courseId: string) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!DATABASE_ID || !ENROLLMENTS_COLLECTION_ID) throw new Error('Enrollments collection not configured. Set VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_ENROLLMENTS_COLLECTION_ID.');

    try {
        const list = await databases.listDocuments(DATABASE_ID, ENROLLMENTS_COLLECTION_ID, [Query.equal('userId', userId), Query.equal('courseId', courseId)]);
        return (list.documents && list.documents[0]) || null;
    } catch (sdkErr) {
        console.error('findUserEnrollmentByCourse SDK failed', sdkErr);
        // REST fallback
        const params = new URLSearchParams();
        params.append('queries[]', `equal("userId","${userId}")`);
        params.append('queries[]', `equal("courseId","${courseId}")`);
        const url = `${endpoint.replace(/\/v1\/?$/, '')}/v1/databases/${DATABASE_ID}/collections/${ENROLLMENTS_COLLECTION_ID}/documents?${params.toString()}`;
        const res = await fetch(url, { method: 'GET', credentials: 'include', headers: { 'X-Appwrite-Project': projectId } });
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.message || `findUserEnrollmentByCourse failed (${res.status})`);
        return (body.documents && body.documents[0]) || null;
    }
}

export async function findUserEnrollmentByPlan(userId: string, planName: string) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!DATABASE_ID || !ENROLLMENTS_COLLECTION_ID) throw new Error('Enrollments collection not configured. Set VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_ENROLLMENTS_COLLECTION_ID.');

    try {
        const list = await databases.listDocuments(DATABASE_ID, ENROLLMENTS_COLLECTION_ID, [Query.equal('userId', userId), Query.equal('planName', planName)]);
        return (list.documents && list.documents[0]) || null;
    } catch (sdkErr) {
        console.error('findUserEnrollmentByPlan SDK failed', sdkErr);
        // REST fallback
        const params = new URLSearchParams();
        params.append('queries[]', `equal("userId","${userId}")`);
        params.append('queries[]', `equal("planName","${planName}")`);
        const url = `${endpoint.replace(/\/v1\/?$/, '')}/v1/databases/${DATABASE_ID}/collections/${ENROLLMENTS_COLLECTION_ID}/documents?${params.toString()}`;
        const res = await fetch(url, { method: 'GET', credentials: 'include', headers: { 'X-Appwrite-Project': projectId } });
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.message || `findUserEnrollmentByPlan failed (${res.status})`);
        return (body.documents && body.documents[0]) || null;
    }
}

export async function completeProfile(userId: string, data: Record<string, any>) {
    // Ensure all required fields are present with defaults
    const payload = {
        userId,
        email: data.email || '',
        displayName: data.displayName || '',
        homeCountry: data.homeCountry || null,
        phone: data.phone || null,
        dateOfBirth: data.dateOfBirth || null,
        headline: data.headline || null,
        bio: data.bio || null,
        address: data.address || null,
        currentRole: data.currentRole || null,
        yearsExperience: data.yearsExperience || 0,
        certifications: data.certifications || null,
        targetTrainingDate: data.targetTrainingDate || null,
        readinessLevel: data.readinessLevel || 'unknown',
        learningGoals: data.learningGoals || null,
        learningStyle: data.learningStyle || null,
        availability: data.availability || null,
        instructorPreferences: data.instructorPreferences || null,
        idtype: data.idtype || null,
        idNumber: data.idNumber || null,
        idField: data.idField || null,
        instructorNotes: data.instructorNotes || null,
        profileCompleted: true,
        currentStep: 4,
        updatedAt: new Date().toISOString()
    };
    return await saveUserProfile(payload);
}

export async function ping() {
    if (!isAppwriteConfigured) {
        throw new Error(APPWRITE_CONFIG_ERROR);
    }

    const clientAny: any = client as any;
    if (typeof clientAny?.call === 'function') {
        await clientAny.call('GET', '/health');
        return;
    }

    const baseEndpoint = endpoint.replace(/\/+$/, '');
    const url = `${baseEndpoint}/health`;
    const res = await fetch(url, { method: 'GET', headers: { 'Cache-Control': 'no-cache' } });
    if (!res.ok) {
        throw new Error(`Appwrite health check failed (${res.status})`);
    }
    return;
}

// ================== RESOURCES FUNCTIONS ==================

/**
 * Get resources by exam type
 */
export async function getResources(examType?: string) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!DATABASE_ID || !RESOURCES_COLLECTION_ID || RESOURCES_COLLECTION_ID === '') {
        throw new Error(`Resources collection not configured. Set VITE_APPWRITE_RESOURCES_COLLECTION_ID. Current value: "${RESOURCES_COLLECTION_ID}"`);
    }

    try {
        const queries = [];
        if (examType) {
            queries.push(Query.equal('examType', examType));
        }
        queries.push(Query.orderAsc('order'));

        const response = await databases.listDocuments(
            DATABASE_ID,
            RESOURCES_COLLECTION_ID,
            queries
        );

        return response.documents;
    } catch (error) {
        console.error('Failed to fetch resources:', error);
        throw error;
    }
}

/**
 * Get file download URL
 */
export async function getResourceDownloadUrl(fileId: string): Promise<string> {
    if (!storage) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!RESOURCES_BUCKET_ID || RESOURCES_BUCKET_ID === '') {
        throw new Error(`Resources bucket not configured. Set VITE_APPWRITE_RESOURCES_BUCKET_ID. Current value: "${RESOURCES_BUCKET_ID}"`);
    }

    try {
        const result = storage.getFileDownload(RESOURCES_BUCKET_ID, fileId);
        return result.toString();
    } catch (error) {
        console.error('Failed to get download URL:', error);
        throw error;
    }
}

/**
 * Get file preview URL (for images/videos)
 */
export async function getResourcePreviewUrl(fileId: string): Promise<string> {
    if (!storage) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!RESOURCES_BUCKET_ID || RESOURCES_BUCKET_ID === '') {
        throw new Error(`Resources bucket not configured. Set VITE_APPWRITE_RESOURCES_BUCKET_ID. Current value: "${RESOURCES_BUCKET_ID}"`);
    }

    try {
        const result = storage.getFilePreview(RESOURCES_BUCKET_ID, fileId);
        return result.toString();
    } catch (error) {
        console.error('Failed to get preview URL:', error);
        throw error;
    }
}

/**
 * Track resource download
 */
export async function trackResourceDownload(userId: string, resourceId: string): Promise<void> {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!DATABASE_ID || !RESOURCES_COLLECTION_ID) return;

    try {
        const resource = await databases.getDocument(
            DATABASE_ID,
            RESOURCES_COLLECTION_ID,
            resourceId
        );

        await databases.updateDocument(
            DATABASE_ID,
            RESOURCES_COLLECTION_ID,
            resourceId,
            {
                downloadCount: (resource.downloadCount || 0) + 1,
            }
        );
    } catch (error) {
        console.error('Failed to track download:', error);
    }
}

/**
 * Create a new resource (admin only)
 */
export async function createResource(data: {
    title: string;
    description: string;
    examType: string;
    category: string;
    fileId?: string;
    fileSize?: number;
    fileType?: string;
    isPremium: boolean;
    tags?: string[];
    order?: number;
}) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!DATABASE_ID || !RESOURCES_COLLECTION_ID) {
        throw new Error('Resources collection not configured.');
    }

    try {
        return await databases.createDocument(
            DATABASE_ID,
            RESOURCES_COLLECTION_ID,
            ID.unique(),
            {
                ...data,
                downloadCount: 0,
                order: data.order || 0,
            }
        );
    } catch (error) {
        console.error('Failed to create resource:', error);
        throw error;
    }
}

/**
 * Update a resource (admin only)
 */
export async function updateResource(resourceId: string, data: any) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!DATABASE_ID || !RESOURCES_COLLECTION_ID) {
        throw new Error('Resources collection not configured.');
    }

    try {
        return await databases.updateDocument(
            DATABASE_ID,
            RESOURCES_COLLECTION_ID,
            resourceId,
            data
        );
    } catch (error) {
        console.error('Failed to update resource:', error);
        throw error;
    }
}

/**
 * Delete a resource (admin only)
 */
export async function deleteResource(resourceId: string) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!DATABASE_ID || !RESOURCES_COLLECTION_ID) {
        throw new Error('Resources collection not configured.');
    }

    try {
        return await databases.deleteDocument(
            DATABASE_ID,
            RESOURCES_COLLECTION_ID,
            resourceId
        );
    } catch (error) {
        console.error('Failed to delete resource:', error);
        throw error;
    }
}

/**
 * Upload file to resources bucket
 */
export async function uploadResourceFile(file: File) {
    if (!storage) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!RESOURCES_BUCKET_ID) {
        throw new Error('Resources bucket not configured.');
    }

    try {
        const fileId = ID.unique();
        const response = await storage.createFile(
            RESOURCES_BUCKET_ID,
            fileId,
            file
        );
        return response;
    } catch (error) {
        console.error('Failed to upload file:', error);
        throw error;
    }
}

/**
 * Delete file from resources bucket
 */
export async function deleteResourceFile(fileId: string) {
    if (!storage) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!RESOURCES_BUCKET_ID) {
        throw new Error('Resources bucket not configured.');
    }

    try {
        return await storage.deleteFile(RESOURCES_BUCKET_ID, fileId);
    } catch (error) {
        console.error('Failed to delete file:', error);
        throw error;
    }
}

// ================== QUIZ & PROGRESS FUNCTIONS ==================

/**
 * Get random questions for practice/exam
 */
export async function getQuestions(
    examType: 'PMP' | 'CAPM' | 'PMI-ACP' | 'PfMP',
    count: number,
    knowledgeAreas?: string[],
    difficulty?: 'easy' | 'medium' | 'hard'
) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!DATABASE_ID || !QUESTIONS_COLLECTION_ID) {
        throw new Error('Questions collection not configured. Set VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_QUESTIONS_COLLECTION_ID.');
    }

    try {
        const queries: string[] = [
            Query.equal('examType', examType),
            Query.limit(count * 3), // Get extra to allow for randomization
        ];

        if (knowledgeAreas && knowledgeAreas.length > 0) {
            queries.push(Query.equal('knowledgeArea', knowledgeAreas));
        }

        if (difficulty) {
            queries.push(Query.equal('difficulty', difficulty));
        }

        const response = await databases.listDocuments(DATABASE_ID, QUESTIONS_COLLECTION_ID, queries);

        // Shuffle and limit to requested count
        const shuffled = response.documents.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    } catch (err) {
        console.error('Failed to fetch questions:', err);
        throw err;
    }
}

/**
 * Submit a quiz attempt and update user progress
 */
export async function submitQuizAttempt(
    userId: string,
    enrollmentId: string,
    examType: string,
    mode: string,
    answers: any[],
    score: number,
    correctAnswers: number,
    totalQuestions: number,
    timeSpent: number,
    knowledgeAreaBreakdown: any[]
) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!DATABASE_ID || !QUIZ_ATTEMPTS_COLLECTION_ID || !USER_PROGRESS_COLLECTION_ID) {
        throw new Error('Quiz collections not configured. Set VITE_APPWRITE_QUIZ_ATTEMPTS_COLLECTION_ID and VITE_APPWRITE_USER_PROGRESS_COLLECTION_ID.');
    }

    try {
        // Save quiz attempt
        const attemptData = {
            userId,
            enrollmentId,
            examType,
            mode,
            answers: JSON.stringify(answers),
            score,
            correctAnswers,
            totalQuestions,
            timeSpent,
            knowledgeAreaBreakdown: JSON.stringify(knowledgeAreaBreakdown),
            completedAt: new Date().toISOString(),
        };

        const attempt = await databases.createDocument(
            DATABASE_ID,
            QUIZ_ATTEMPTS_COLLECTION_ID,
            ID.unique(),
            attemptData
        );

        // Update or create user progress
        await updateUserProgress(userId, enrollmentId, examType, answers, knowledgeAreaBreakdown);

        return attempt;
    } catch (err) {
        console.error('Failed to submit quiz attempt:', err);
        throw err;
    }
}

/**
 * Update user progress statistics
 */
async function updateUserProgress(
    userId: string,
    enrollmentId: string,
    examType: string,
    answers: any[],
    knowledgeAreaBreakdown: any[]
) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);

    try {
        // Try to get existing progress
        let existingProgress: any = null;
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                USER_PROGRESS_COLLECTION_ID,
                [Query.equal('userId', userId), Query.equal('enrollmentId', enrollmentId)]
            );
            if (response.documents.length > 0) {
                existingProgress = response.documents[0];
            }
        } catch (err) {
            console.log('No existing progress found');
        }

        const correctAnswersCount = answers.filter((a) => a.isCorrect).length;
        const totalAttempted = existingProgress
            ? existingProgress.totalQuestionsAttempted + answers.length
            : answers.length;
        const totalCorrect = existingProgress
            ? existingProgress.correctAnswers + correctAnswersCount
            : correctAnswersCount;
        const overallAccuracy = (totalCorrect / totalAttempted) * 100;

        // Merge knowledge area scores
        const areaScoresMap = new Map();

        // Add existing scores
        if (existingProgress?.knowledgeAreaScores) {
            const existing = typeof existingProgress.knowledgeAreaScores === 'string'
                ? JSON.parse(existingProgress.knowledgeAreaScores)
                : existingProgress.knowledgeAreaScores;

            existing.forEach((area: any) => {
                areaScoresMap.set(area.area, area);
            });
        }

        // Update with new scores
        knowledgeAreaBreakdown.forEach((area: any) => {
            if (areaScoresMap.has(area.area)) {
                const existing = areaScoresMap.get(area.area);
                const newCorrect = existing.correct + area.correct;
                const newTotal = existing.total + area.total;
                areaScoresMap.set(area.area, {
                    area: area.area,
                    correct: newCorrect,
                    total: newTotal,
                    accuracy: (newCorrect / newTotal) * 100,
                });
            } else {
                areaScoresMap.set(area.area, area);
            }
        });

        const knowledgeAreaScores = Array.from(areaScoresMap.values());

        // Identify strong and weak areas
        const strongAreas = knowledgeAreaScores
            .filter((area: any) => area.accuracy >= 70)
            .map((area: any) => area.area);
        const weakAreas = knowledgeAreaScores
            .filter((area: any) => area.accuracy < 60)
            .map((area: any) => area.area);

        const progressData = {
            userId,
            enrollmentId,
            examType,
            totalQuestionsAttempted: totalAttempted,
            correctAnswers: totalCorrect,
            overallAccuracy,
            knowledgeAreaScores: JSON.stringify(knowledgeAreaScores),
            strongAreas: JSON.stringify(strongAreas),
            weakAreas: JSON.stringify(weakAreas),
            lastAttemptAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        if (existingProgress) {
            // Update existing progress
            await databases.updateDocument(
                DATABASE_ID,
                USER_PROGRESS_COLLECTION_ID,
                existingProgress.$id,
                progressData
            );
        } else {
            // Create new progress
            await databases.createDocument(
                DATABASE_ID,
                USER_PROGRESS_COLLECTION_ID,
                ID.unique(),
                { ...progressData, createdAt: new Date().toISOString() }
            );
        }
    } catch (err) {
        console.error('Failed to update user progress:', err);
        throw err;
    }
}

/**
 * Get user progress for a specific enrollment
 */
export async function getUserProgress(userId: string, enrollmentId: string) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!DATABASE_ID || !USER_PROGRESS_COLLECTION_ID) {
        throw new Error('User progress collection not configured. Set VITE_APPWRITE_USER_PROGRESS_COLLECTION_ID.');
    }

    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            USER_PROGRESS_COLLECTION_ID,
            [Query.equal('userId', userId), Query.equal('enrollmentId', enrollmentId)]
        );

        if (response.documents.length === 0) {
            return null;
        }

        const progress = response.documents[0];

        // Parse JSON fields
        return {
            ...progress,
            knowledgeAreaScores: typeof progress.knowledgeAreaScores === 'string'
                ? JSON.parse(progress.knowledgeAreaScores)
                : progress.knowledgeAreaScores,
            strongAreas: typeof progress.strongAreas === 'string'
                ? JSON.parse(progress.strongAreas)
                : progress.strongAreas,
            weakAreas: typeof progress.weakAreas === 'string'
                ? JSON.parse(progress.weakAreas)
                : progress.weakAreas,
        };
    } catch (err) {
        console.error('Failed to get user progress:', err);
        throw err;
    }
}

/**
 * Get quiz attempt history for a user
 */
export async function getQuizHistory(userId: string, limit: number = 10) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!DATABASE_ID || !QUIZ_ATTEMPTS_COLLECTION_ID) {
        throw new Error('Quiz attempts collection not configured. Set VITE_APPWRITE_QUIZ_ATTEMPTS_COLLECTION_ID.');
    }

    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            QUIZ_ATTEMPTS_COLLECTION_ID,
            [
                Query.equal('userId', userId),
                Query.orderDesc('completedAt'),
                Query.limit(limit),
            ]
        );

        return response.documents.map((doc) => ({
            ...doc,
            answers: typeof doc.answers === 'string' ? JSON.parse(doc.answers) : doc.answers,
            knowledgeAreaBreakdown: typeof doc.knowledgeAreaBreakdown === 'string'
                ? JSON.parse(doc.knowledgeAreaBreakdown)
                : doc.knowledgeAreaBreakdown,
        }));
    } catch (err) {
        console.error('Failed to get quiz history:', err);
        throw err;
    }
}

// ========================================
// UNENROLLMENT REQUEST FUNCTIONS
// ========================================

export async function createUnenrollmentRequest(data: {
    userId: string;
    enrollmentId: string;
    certificationName: string;
    planTier: string;
    reasonCategory: string;
    reasonDetails?: string;
    enrolledAt: string;
}) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!UNENROLLMENT_REQUESTS_COLLECTION_ID) {
        throw new Error('Unenrollment requests collection not configured');
    }

    try {
        const now = new Date().toISOString();
        const request = await databases.createDocument(
            DATABASE_ID,
            UNENROLLMENT_REQUESTS_COLLECTION_ID,
            ID.unique(),
            {
                userId: data.userId,
                enrollmentId: data.enrollmentId,
                certificationName: data.certificationName,
                planTier: data.planTier,
                reasonCategory: data.reasonCategory,
                reasonDetails: data.reasonDetails || '',
                status: 'pending',
                requestedAt: now,
                enrolledAt: data.enrolledAt,
                refundEligible: false,
                refundAmount: 0,
            }
        );
        return request;
    } catch (err) {
        console.error('Failed to create unenrollment request:', err);
        throw err;
    }
}

export async function getUserUnenrollmentRequests(userId: string) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!UNENROLLMENT_REQUESTS_COLLECTION_ID) {
        throw new Error('Unenrollment requests collection not configured');
    }

    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            UNENROLLMENT_REQUESTS_COLLECTION_ID,
            [
                Query.equal('userId', userId),
                Query.orderDesc('requestedAt'),
            ]
        );
        return response.documents;
    } catch (err) {
        console.error('Failed to get user unenrollment requests:', err);
        throw err;
    }
}

export async function getAllUnenrollmentRequests(statusFilter?: 'pending' | 'approved' | 'denied') {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!UNENROLLMENT_REQUESTS_COLLECTION_ID) {
        throw new Error('Unenrollment requests collection not configured');
    }

    try {
        const queries = [Query.orderDesc('requestedAt')];
        if (statusFilter) {
            queries.push(Query.equal('status', statusFilter));
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            UNENROLLMENT_REQUESTS_COLLECTION_ID,
            queries
        );
        return response.documents;
    } catch (err) {
        console.error('Failed to get all unenrollment requests:', err);
        throw err;
    }
}

export async function approveUnenrollmentRequest(
    requestId: string,
    adminUserId: string,
    enrollmentId: string,
    cooldownDays: number,
    refundEligible: boolean,
    refundAmount: number
) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!UNENROLLMENT_REQUESTS_COLLECTION_ID || !ENROLLMENTS_COLLECTION_ID) {
        throw new Error('Collections not configured');
    }

    try {
        const now = new Date();
        const cooldownEnds = new Date(now);
        cooldownEnds.setDate(cooldownEnds.getDate() + cooldownDays);

        // Update enrollment to inactive status
        await databases.updateDocument(
            DATABASE_ID,
            ENROLLMENTS_COLLECTION_ID,
            enrollmentId,
            {
                status: 'inactive',
                unenrolledAt: now.toISOString(),
                unenrolledBy: adminUserId,
                cooldownEndsAt: cooldownEnds.toISOString(),
                refundEligible: refundEligible,
                refundAmount: refundAmount,
                refundProcessed: false,
            }
        );

        // Update request status
        const updatedRequest = await databases.updateDocument(
            DATABASE_ID,
            UNENROLLMENT_REQUESTS_COLLECTION_ID,
            requestId,
            {
                status: 'approved',
                processedAt: now.toISOString(),
                processedBy: adminUserId,
                cooldownDays: cooldownDays,
                refundEligible: refundEligible,
                refundAmount: refundAmount,
            }
        );

        return updatedRequest;
    } catch (err) {
        console.error('Failed to approve unenrollment request:', err);
        throw err;
    }
}

export async function denyUnenrollmentRequest(requestId: string, adminUserId: string) {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!UNENROLLMENT_REQUESTS_COLLECTION_ID) {
        throw new Error('Unenrollment requests collection not configured');
    }

    try {
        const now = new Date().toISOString();
        const updatedRequest = await databases.updateDocument(
            DATABASE_ID,
            UNENROLLMENT_REQUESTS_COLLECTION_ID,
            requestId,
            {
                status: 'denied',
                processedAt: now,
                processedBy: adminUserId,
            }
        );
        return updatedRequest;
    } catch (err) {
        console.error('Failed to deny unenrollment request:', err);
        throw err;
    }
}

export async function checkEnrollmentCooldown(userId: string, certificationName: string): Promise<{
    inCooldown: boolean;
    cooldownEndsAt?: string;
    daysRemaining?: number;
}> {
    if (!databases) throw new Error(APPWRITE_CONFIG_ERROR);
    if (!ENROLLMENTS_COLLECTION_ID) {
        throw new Error('Enrollments collection not configured');
    }

    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            ENROLLMENTS_COLLECTION_ID,
            [
                Query.equal('userId', userId),
                Query.equal('status', 'inactive'),
            ]
        );

        const inactiveEnrollment = response.documents.find(
            (doc: any) => doc.certifications && doc.certifications.includes(certificationName)
        );

        if (inactiveEnrollment && inactiveEnrollment.cooldownEndsAt) {
            const cooldownEnd = new Date(inactiveEnrollment.cooldownEndsAt);
            const now = new Date();

            if (cooldownEnd > now) {
                const daysRemaining = Math.ceil((cooldownEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return {
                    inCooldown: true,
                    cooldownEndsAt: inactiveEnrollment.cooldownEndsAt,
                    daysRemaining,
                };
            }
        }

        return { inCooldown: false };
    } catch (err) {
        console.error('Failed to check enrollment cooldown:', err);
        throw err;
    }
}

export { client, account, databases, storage };


