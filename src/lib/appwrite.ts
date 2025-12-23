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
const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT as string;
// Support both VITE_APPWRITE_PROJECT_ID and VITE_APPWRITE_PROJECT for compatibility
const projectId = (import.meta.env.VITE_APPWRITE_PROJECT_ID as string) || (import.meta.env.VITE_APPWRITE_PROJECT as string);

const client = new Client().setEndpoint(endpoint).setProject(projectId);

const account = new Account(client);
const databases = new Databases(client);
let storage: Storage | null = null;
try {
    storage = new Storage(client);
} catch (e) {
    console.warn('Appwrite storage initialization failed', e);
}

// Debug: ping Appwrite server at startup so the console shows connectivity status
client.ping()
    .then(() => console.debug('Appwrite: ping OK'))
    .catch((err) => console.warn('Appwrite: ping failed', err));

// Appwrite Database / Collection / Bucket IDs (set via env)
const DATABASE_ID = (import.meta.env.VITE_APPWRITE_DATABASE_ID as string) || '';
const PROFILE_COLLECTION_ID = (import.meta.env.VITE_APPWRITE_PROFILE_COLLECTION_ID as string) || '';
const BUCKET_ID = (import.meta.env.VITE_APPWRITE_BUCKET_ID as string) || '';

export async function signUp(email: string, password: string, name?: string) {
    // Creates a new user account
    // Some Appwrite SDK versions expect (userId, email, password, name)
    // Others may accept (email, password, name) — try both with useful errors.
    const acct: any = account;

    // Determine a userId; prefer ID.unique() but fallback to timestamp-based id
    let userId: string | undefined;
    try {
        if (typeof ID?.unique === 'function') userId = ID.unique();
    } catch (err) {
        console.debug('ID.unique() not available:', err);
    }
    if (!userId) userId = `user-${Date.now()}`;

    // Try the (userId, email, password, name) signature first
    if (typeof acct.create === 'function') {
        try {
            return await acct.create(userId, email, password, name);
        } catch (err: any) {
            // If API complains about missing userId or method signature, try without userId
            const msg = (err && err.message) || String(err);
            if (msg.includes('userId') || msg.includes('Missing required parameter')) {
                try {
                    // Some SDKs expect (email, password, name)
                    return await acct.create(email, password, name);
                } catch (err2: any) {
                    // As a last resort, POST directly to the REST API with explicit userId
                    const url = `${endpoint.replace(/\/v1\/?$/, '')}/v1/account`;
                    const resp = await fetch(url, {
                        method: 'POST',
                        // Ensure cookies are included when Appwrite sets a session cookie
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Appwrite-Project': projectId,
                        },
                        body: JSON.stringify({ userId, name, email, password }),
                    });

                    if (!resp.ok) {
                        const text = await resp.text().catch(() => null);
                        let body: any = null;
                        try { body = text ? JSON.parse(text) : null; } catch (e) { /* not JSON */ }
                        const msg = body?.message || text || `${resp.status} ${resp.statusText}`;
                        console.error('Appwrite signUp REST fallback failed:', { status: resp.status, statusText: resp.statusText, body: text });
                        throw new Error(`Sign up failed (REST fallback): ${msg}`);
                    }

                    return await resp.json();
                }
            }
            throw err;
        }
    }

    // REST fallback if Account.create isn't available
    {
        const url = `${endpoint.replace(/\/v1\/?$/, '')}/v1/account`;
        const resp = await fetch(url, {
            method: 'POST',
            // Ensure cookies are included when Appwrite sets a session cookie
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Appwrite-Project': projectId,
            },
            body: JSON.stringify({ userId, name, email, password }),
        });

        if (!resp.ok) {
            const text = await resp.text().catch(() => null);
            let body: any = null;
            try { body = text ? JSON.parse(text) : null; } catch (e) { /* not JSON */ }
            const msg = body?.message || text || `${resp.status} ${resp.statusText}`;
            console.error('Appwrite signUp REST fallback failed:', { status: resp.status, statusText: resp.statusText, body: text });
            throw new Error(`Sign up failed (REST fallback): ${msg}`);
        }

        return await resp.json();
    }
}

export async function signIn(email: string, password: string) {
    const accountAny: any = account;

    const restSignIn = async () => {
        const url = `${endpoint.replace(/\/v1\/?$/, '')}/v1/account/sessions`;
        console.debug('Using REST sign-in POST to', url);
        const res = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Appwrite-Project': projectId,
            },
            body: JSON.stringify({ email, password }),
        });

        let body: any = null;
        try { body = await res.json(); } catch (e) { body = await res.text().catch(() => null); }

        if (!res.ok) {
            if (res.status === 429 || String((body && body.message) || '').toLowerCase().includes('rate')) {
                throw new Error('Too many login attempts. Please wait a few minutes and try again.');
            }
            console.error('signIn REST fallback failed', { status: res.status, body, headers: Object.fromEntries(res.headers.entries ? res.headers.entries() : []) });
            throw new Error(body?.message || `Sign-in failed (${res.status})`);
        }

        return body;
    };

    try {
        // Prefer explicit email session if available
        if (typeof accountAny.createEmailSession === 'function') {
            try {
                console.debug('Trying SDK createEmailSession(email, password)');
                return await accountAny.createEmailSession(email, password);
            } catch (err: any) {
                const msg = String(err?.message || '');
                console.warn('createEmailSession failed:', err);
                if (msg.includes('Rate limit')) throw new Error('Too many login attempts. Please wait a few minutes and try again.');
                // If the SDK complains about userId/missing params, fall through to other attempts
                if (!msg.includes('userId') && !msg.includes('Missing required parameter')) throw err;
            }
        }

        // If createSession exists, check its declared arity to decide how to call it.
        if (typeof accountAny.createSession === 'function') {
            const arity = typeof accountAny.createSession.length === 'number' ? accountAny.createSession.length : -1;

            // If it looks positional (arity >= 2), call with (email, password)
            if (arity >= 2) {
                try {
                    console.debug('Trying SDK createSession(email, password) positional');
                    return await accountAny.createSession(email, password);
                } catch (errPos: any) {
                    const msg = String(errPos?.message || '');
                    console.warn('createSession(email,password) failed:', errPos);
                    if (msg.includes('Rate limit')) throw new Error('Too many login attempts. Please wait a few minutes and try again.');
                    if (msg.includes('userId')) {
                        console.warn('createSession positional failed due to userId requirement; using REST fallback');
                        return await restSignIn();
                    }
                    // otherwise try REST fallback
                    return await restSignIn();
                }
            }

            // If arity isn't positional, avoid calling createSession with object (it may expect userId); use REST
            console.warn('createSession signature appears non-positional; using REST fallback to create session.');
            return await restSignIn();
        }

        // No suitable SDK sign-in method exposed; fallback to REST
        return await restSignIn();
    } catch (err: any) {
        const msg = String(err?.message || '');
        // If SDK threw missing userId error, fallback to REST
        if (msg.includes('Missing required parameter') && msg.includes('userId')) {
            return await restSignIn();
        }
        throw err;
    }
}

export async function verifyAccount() {
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
    try {
        return await account.get();
    } catch (err) {
        // SDK failed (or we're unauthenticated). Try a credentialed REST GET to gather debug info.
        const v = await verifyAccount();
        if (v.ok) return v.body;

        const hdrs = JSON.stringify(v.headers, null, 2);
        const bodyText = typeof v.body === 'object' ? JSON.stringify(v.body) : String(v.body);
        const message = `account.get() failed and REST fallback returned status ${v.status}.\nHeaders:\n${hdrs}\nBody:\n${bodyText}`;
        const e: any = new Error(message);
        e.original = err;
        throw e;
    }
}

export async function signOut() {
    return account.deleteSession('current');
}

export function signInWithGoogle() {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Google sign-in must run in a browser context.'));
    }

    const success = `${window.location.origin}/oauth/success`;
    const failure = `${window.location.origin}/oauth/failure`;

    try {
        return account.createOAuth2Session('google', success, failure);
    } catch (err) {
        return Promise.reject(err);
    }
}

/**
 * Ping the Appwrite server to verify connectivity.
 * Returns a promise that resolves if the server is reachable.
 */
export async function uploadFile(file: File) {
    if (!file) return null;
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
    if (!DATABASE_ID || !PROFILE_COLLECTION_ID) {
        throw new Error('Profile collection not configured. Set VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_PROFILE_COLLECTION_ID.');
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

    try {
        const list = await databases.listDocuments(
            DATABASE_ID,
            PROFILE_COLLECTION_ID,
            [Query.equal('userId', data.userId)]
        );

        if (list.documents.length > 0) {
            return await databases.updateDocument(DATABASE_ID, PROFILE_COLLECTION_ID, list.documents[0].$id, data);
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
            data,
            permissions
        );
    } catch (sdkErr) {
        console.error('SDK saveUserProfile failed', sdkErr);
        // REST fallback to create/update document
        try {
            const query = encodeURIComponent(`equal(\"userId\", \"${data.userId}\")`);
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
                    body: JSON.stringify({ data }),
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
                    data,
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
    if (!DATABASE_ID || !PROFILE_COLLECTION_ID) {
        throw new Error('Profile collection not configured. Set VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_PROFILE_COLLECTION_ID.');
    }

    try {
        const list = await databases.listDocuments(DATABASE_ID, PROFILE_COLLECTION_ID, [Query.equal('userId', userId)]);
        const existing = list?.documents?.[0];
        return existing ? { document: existing } : null;
    } catch (sdkErr) {
        console.error('SDK getUserProfile failed', sdkErr);
        // REST fallback
        const query = encodeURIComponent(`equal(\"userId\", \"${userId}\")`);
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
    return client.ping();
}

export { client, account, databases, storage };

