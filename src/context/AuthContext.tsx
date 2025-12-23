import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { Models } from 'appwrite';
import {
    getCurrentUser,
    signIn as appwriteSignIn,
    signInWithGoogle as appwriteSignInWithGoogle,
    signOut as appwriteSignOut,
    signUp as appwriteSignUp,
} from '../lib/appwrite';

type User = Models.User<Models.Preferences> | null;

type AuthContextValue = {
    user: User;
    initializing: boolean;
    signIn: (email: string, password: string) => Promise<User>;
    signInWithGoogle: () => Promise<void>;
    signUp: (email: string, password: string, name?: string) => Promise<User>;
    signOut: () => Promise<void>;
    refresh: () => Promise<User>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User>(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                // Show connectivity in console and surface issues early
                try {
                    const { ping } = await import('../lib/appwrite');
                    await ping();
                    console.debug('AuthProvider: Appwrite ping OK');
                } catch (err) {
                    console.warn('AuthProvider: Appwrite ping failed', err);
                }

                const current = await getCurrentUser();
                if (active) setUser(current);
            } catch (err) {
                if (active) setUser(null);
                console.warn('Failed to load current user', err);
            } finally {
                if (active) setInitializing(false);
            }
        };

        load();

        return () => {
            active = false;
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        await appwriteSignIn(email, password);

        // Perform a credentialed REST check to capture response headers (useful for debugging cookie/CORS issues)
        try {
            const verification: any = await (await import('../lib/appwrite')).verifyAccount();
            if (!verification.ok) {
                const hdrs = JSON.stringify(verification.headers, null, 2);
                const bodyText = typeof verification.body === 'object' ? JSON.stringify(verification.body) : String(verification.body);
                throw new Error(
                    `Sign in succeeded but fetching the user failed. Status: ${verification.status}.\nHeaders:\n${hdrs}\nBody:\n${bodyText}\nCheck Appwrite platform origin and "Allow Credentials" for your origin, and ensure cookies are allowed (Secure/HTTPS).`
                );
            }
            setUser(verification.body as any);
            return verification.body as any;
        } catch (err) {
            throw err;
        }
    };

    const signUp = async (email: string, password: string, name?: string) => {
        await appwriteSignUp(email, password, name);
        await appwriteSignIn(email, password);
        const current = await getCurrentUser();
        setUser(current);
        return current;
    };

    const signOut = async () => {
        await appwriteSignOut();
        setUser(null);
    };

    const signInWithGoogle = useCallback(() => {
        return appwriteSignInWithGoogle();
    }, []);

    const refresh = async () => {
        const current = await getCurrentUser();
        setUser(current);
        return current;
    };

    const value = useMemo<AuthContextValue>(
        () => ({ user, initializing, signIn, signInWithGoogle, signUp, signOut, refresh }),
        [user, initializing, signInWithGoogle]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
