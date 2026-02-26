'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, firebaseUser, loading, hasRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!firebaseUser) {
                // Not logged into Firebase
                router.replace('/login');
            } else if (user && allowedRoles && !hasRole(allowedRoles)) {
                // Logged in but doesn't have required role
                router.replace('/unauthorized'); // or redirect to dashboard
            }
        }
    }, [loading, firebaseUser, user, allowedRoles, hasRole, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-surface-950">
                <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
            </div>
        );
    }

    // If not loading, and we have a user (and they have correct role or no roles required), render children
    if (firebaseUser && (!allowedRoles || (user && hasRole(allowedRoles)))) {
        return <>{children}</>;
    }

    // Fallback while redirecting
    return null;
}
