'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Mail, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user, firebaseUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If user is already fully loaded and authenticated, redirect to dashboard
        if (!loading && firebaseUser && user) {
            router.replace('/');
        }
    }, [loading, firebaseUser, user, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Let the onAuthStateChanged in AuthContext handle the user profile fetching
        } catch (err: any) {
            console.error('Login error:', err);
            // Handle typical Firebase errors
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else {
                setError('An error occurred during login. Please try again.');
            }
            setIsSubmitting(false);
        }
    };

    if (loading || (firebaseUser && isSubmitting)) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-surface-950">
                <Loader2 className="h-12 w-12 animate-spin text-brand-500" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-surface-950 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-400/10 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10 glass-card p-8 sm:p-10">
                <div>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/30">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
                        CityFix Admin
                    </h2>
                    <p className="mt-2 text-center text-sm text-surface-200">
                        Sign in to access the municipality dashboard
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="rounded-xl bg-danger/10 p-4 border border-danger/20 flex items-start gap-3 animate-slide-up">
                            <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-danger">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-surface-200">
                                Email address
                            </label>
                            <div className="relative mt-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Mail className="h-5 w-5 text-surface-200" aria-hidden="true" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-xl border border-white/10 bg-surface-900/50 py-3 pl-10 text-white placeholder-surface-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors sm:text-sm"
                                    placeholder="admin@cityfix.gov"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-surface-200">
                                Password
                            </label>
                            <div className="relative mt-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock className="h-5 w-5 text-surface-200" aria-hidden="true" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-xl border border-white/10 bg-surface-900/50 py-3 pl-10 text-white placeholder-surface-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative flex w-full justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-surface-900 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Sign in
                                    <span className="absolute right-4 flex items-center">
                                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
