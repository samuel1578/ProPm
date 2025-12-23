import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const { refresh } = useAuth();

    useEffect(() => {
        const hasError = params.get('error');
        const redirect = hasError ? '/login' : '/';

        if (hasError) {
            navigate('/login', { replace: true });
            return;
        }

        refresh()
            .then(() => {
                navigate(redirect, { replace: true });
            })
            .catch(() => {
                navigate('/login', { replace: true });
            });
    }, [navigate, params, refresh]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050b1a]">
            <div className="text-center space-y-3">
                <p className="text-base font-medium text-gray-600 dark:text-gray-300">Completing sign-in…</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">You will be redirected shortly.</p>
            </div>
        </div>
    );
}
