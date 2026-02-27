'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    MapPin,
    Users,
    ShieldAlert,
    Settings,
    LogOut
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const { user, hasRole, logout } = useAuth();

    const isSuperAdmin = hasRole(['SUPER_ADMIN']);

    const links = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Issues', href: '/issues', icon: MapPin },
        ...(isSuperAdmin ? [
            { name: 'Moderation', href: '/moderation', icon: ShieldAlert },
            { name: 'Users', href: '/users', icon: Users },
            { name: 'Settings', href: '/settings', icon: Settings },
        ] : []),
    ];

    return (
        <aside className="w-64 border-r border-white/5 bg-surface-950 flex flex-col h-full overflow-hidden shrink-0">
            <div className="h-16 flex items-center px-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 shadow-[0_0_15px_rgba(20,184,166,0.4)] flex items-center justify-center flex-shrink-0 border border-brand-300/30">
                        <MapPin justify-center="true" className="h-5 w-5 text-white drop-shadow-md" />
                    </div>
                    <span className="font-bold text-lg tracking-tight bg-gradient-to-br from-white to-surface-200 bg-clip-text text-transparent">
                        CityFix Admin
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
                <div className="space-y-1">
                    <p className="px-3 text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                        Menu
                    </p>
                    {links.map((link) => {
                        const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                                    ? 'bg-gradient-to-r from-brand-500/15 to-transparent text-brand-300 border border-brand-500/20 shadow-[inset_0_0_12px_rgba(20,184,166,0.1)]'
                                    : 'text-surface-300 hover:bg-surface-800/50 hover:text-white border border-transparent'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 shadow-[0_0_10px_rgba(20,184,166,0.8)]" />
                                )}
                                <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-brand-400' : 'text-surface-400 group-hover:text-surface-200'}`} />
                                <span className="font-medium text-sm">{link.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-surface-900 border border-white/5 shadow-inner mb-4">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 shadow-[0_0_10px_rgba(20,184,166,0.2)] flex items-center justify-center text-sm font-bold text-white uppercase flex-shrink-0 border border-brand-400/30">
                        {user?.fullName.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.fullName || 'Admin User'}</p>
                        <p className="text-xs text-surface-400 truncate">{user?.role === 'SECTOR_ADMIN' ? user.department : 'Platform Admin'}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-surface-400 hover:bg-danger/10 hover:text-danger transition-colors duration-200 group"
                >
                    <LogOut className="h-5 w-5 group-hover:text-danger transition-colors" />
                    <span className="font-medium text-sm">Sign out</span>
                </button>
            </div>
        </aside>
    );
}
