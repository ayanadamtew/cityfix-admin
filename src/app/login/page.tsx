'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Mail, AlertCircle, Loader2, ArrowRight, MapPin } from 'lucide-react';

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
            <div className="flex min-h-screen items-center justify-center bg-surface-50">
                <Loader2 className="h-12 w-12 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-surface-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 animate-fade-in bg-white border border-surface-200 rounded-2xl shadow-lg p-8 sm:p-10">
                <div>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600 shadow-sm">
                        <MapPin className="h-7 w-7 text-white" />
                    </div>
                    <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-surface-900">
                        CityFix Admin
                    </h2>
                    <p className="mt-2 text-center text-sm text-surface-500">
                        Sign in to access the municipality dashboard
                    </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleLogin}>
                    {error && (
                        <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex items-start gap-3 animate-slide-up">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-surface-700">
                                Email address
                            </label>
                            <div className="relative mt-1.5">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Mail className="h-5 w-5 text-surface-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-lg border border-surface-300 bg-white py-2.5 pl-10 text-surface-900 placeholder-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors sm:text-sm"
                                    placeholder="admin@cityfix.gov"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-surface-700">
                                Password
                            </label>
                            <div className="relative mt-1.5">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock className="h-5 w-5 text-surface-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-lg border border-surface-300 bg-white py-2.5 pl-10 text-surface-900 placeholder-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative flex w-full justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
