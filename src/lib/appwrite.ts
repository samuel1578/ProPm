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

export { client, account, databases, storage };

