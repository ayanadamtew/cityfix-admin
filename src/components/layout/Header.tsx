'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search, Menu } from 'lucide-react';

export default function Header() {
    const pathname = usePathname();

    // Very simple breadcrumb logic for header title
    const title = pathname === '/'
        ? 'Dashboard'
        : pathname.split('/')[1].charAt(0).toUpperCase() + pathname.split('/')[1].slice(1);

    return (
        <header className="h-16 border-b border-white/5 bg-surface-950/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-4">
                {/* Mobile menu button could go here */}
                <button className="lg:hidden text-surface-300 hover:text-white">
                    <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-semibold text-white tracking-tight">{title}</h1>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative hidden md:block group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-surface-400 group-focus-within:text-brand-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search issues..."
                        className="w-64 bg-surface-900 border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-surface-100 placeholder-surface-400 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all"
                    />
                </div>

                <button className="relative p-2 text-surface-300 hover:text-white transition-colors rounded-full hover:bg-surface-800">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                    </span>
                </button>
            </div>
        </header>
    );
}
