'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShieldAlert, User, KeyRound, Info, CheckCircle2, Loader2, Mail, Shield, Building2 } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function SettingsPage() {
    const { user, hasRole } = useAuth();
    const isSuperAdmin = hasRole(['SUPER_ADMIN']);

    const [resetLoading, setResetLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resetError, setResetError] = useState<string | null>(null);

    if (!isSuperAdmin) {
        return (
            <EmptyState
                icon={ShieldAlert}
                title="Restricted Access"
                description="Settings are only accessible to Super Administrators."
            />
        );
    }

    const handlePasswordReset = async () => {
        if (!user?.email) return;
        setResetLoading(true);
        setResetError(null);
        setResetSent(false);
        try {
            await sendPasswordResetEmail(auth, user.email);
            setResetSent(true);
        } catch (err: any) {
            setResetError(err.message || 'Failed to send reset email.');
        } finally {
            setResetLoading(false);
        }
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'Not configured';

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
                <p className="text-surface-400 text-sm mt-1">Manage your super admin account and system preferences.</p>
            </div>

            {/* Profile Section */}
            <div className="glass-card p-6 md:p-8">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                    <User className="h-5 w-5 text-brand-400" />
                    Admin Profile
                </h3>

                <div className="flex items-center gap-5 mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-2xl font-bold text-white uppercase shadow-lg shadow-brand-500/30 border border-brand-400/30 flex-shrink-0">
                        {user?.fullName?.charAt(0) || 'A'}
                    </div>
                    <div>
                        <p className="text-xl font-bold text-white">{user?.fullName}</p>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/20">
                            <Shield className="h-3 w-3" /> Super Admin
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-surface-900 rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-surface-400 uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" /> Email Address
                        </p>
                        <p className="text-sm font-medium text-white break-all">{user?.email}</p>
                    </div>
                    <div className="bg-surface-900 rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-surface-400 uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5" /> Role
                        </p>
                        <p className="text-sm font-medium text-white">Platform Administrator</p>
                    </div>
                </div>
            </div>

            {/* Password Section */}
            <div className="glass-card p-6 md:p-8">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2 border-b border-white/5 pb-4">
                    <KeyRound className="h-5 w-5 text-brand-400" />
                    Change Password
                </h3>
                <p className="text-surface-400 text-sm mb-6 mt-4">
                    We'll send a password reset link to <span className="text-white font-medium">{user?.email}</span>. Follow the link in the email to set a new password.
                </p>

                {resetSent ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-medium">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                        Reset email sent! Check your inbox.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {resetError && (
                            <p className="text-sm text-danger px-4 py-3 rounded-xl bg-danger/10 border border-danger/20">{resetError}</p>
                        )}
                        <button
                            onClick={handlePasswordReset}
                            disabled={resetLoading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-brand-500/20"
                        >
                            {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                            Send Reset Email
                        </button>
                    </div>
                )}
            </div>

            {/* System Info Section */}
            <div className="glass-card p-6 md:p-8">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                    <Info className="h-5 w-5 text-brand-400" />
                    System Information
                </h3>

                <div className="space-y-3">
                    {[
                        { label: 'Platform', value: 'CityFix Admin Dashboard' },
                        { label: 'Version', value: '1.0.0' },
                        { label: 'API Endpoint', value: apiUrl },
                        { label: 'Environment', value: process.env.NODE_ENV || 'development' },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                            <span className="text-sm text-surface-400 font-medium">{label}</span>
                            <span className="text-sm text-white font-mono bg-surface-900 px-3 py-1 rounded-lg border border-white/5">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
