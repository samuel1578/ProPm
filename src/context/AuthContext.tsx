import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { Models } from 'appwrite';
import {
    getCurrentUser,
    signIn as appwriteSignIn,
    signOut as appwriteSignOut,
    signUp as appwriteSignUp,
} from '../lib/appwrite';

type User = Models.User<Models.Preferences> | null;

type AuthContextValue = {
    user: User;
    initializing: boolean;
    signIn: (email: string, password: string) => Promise<User>;
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

        // Get the current user after successful sign-in
        const current = await getCurrentUser();
        setUser(current);
        return current;
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

    const refresh = async () => {
        try {
            const current = await getCurrentUser();
            setUser(current);
            return current;
        } catch (err) {
            // Treat failures to refresh as unauthenticated rather than bubbling up errors.
            console.warn('AuthContext.refresh failed, treating as unauthenticated', err);
            setUser(null);
            return null;
        }
    };

    const value = useMemo<AuthContextValue>(
        () => ({ user, initializing, signIn, signUp, signOut, refresh }),
        [user, initializing]
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
