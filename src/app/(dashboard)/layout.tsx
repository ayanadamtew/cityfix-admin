'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-surface-950">
                <Sidebar />
                <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
                    {/* Subtle ambient lighting effect */}
                    <div className="absolute top-0 left-1/4 w-[50%] h-[30%] rounded-full bg-brand-600/5 blur-[120px] pointer-events-none" />

                    <Header />
                    <main className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-in relative z-10">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
