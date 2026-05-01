'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-surface-50">
                <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                
                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 z-20 bg-surface-900/50 backdrop-blur-sm lg:hidden transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
                    <Header toggleSidebar={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in relative z-10">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
