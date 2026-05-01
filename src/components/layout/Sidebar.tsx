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
    LogOut,
    Wrench,
    FolderTree,
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }: { isOpen?: boolean, setIsOpen?: (v: boolean) => void }) {
    const pathname = usePathname();
    const { user, hasRole, logout } = useAuth();

    const isSuperAdmin = hasRole(['SUPER_ADMIN']);
    const isSectorAdmin = hasRole(['SECTOR_ADMIN']);

    const links = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Issues', href: '/issues', icon: MapPin },
        ...(isSectorAdmin ? [
            { name: 'Technicians', href: '/technicians', icon: Wrench },
        ] : []),
        ...(isSuperAdmin ? [
            { name: 'Moderation', href: '/moderation', icon: ShieldAlert },
            { name: 'Users', href: '/users', icon: Users },
        ] : []),
    ];

    return (
        <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 border-r border-surface-200 bg-white flex flex-col h-full overflow-hidden shrink-0 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            <div className="h-16 flex items-center justify-between px-6 border-b border-surface-200">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-surface-900">
                        CityFix Admin
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
                <div className="space-y-1">
                    <p className="px-3 text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                        Menu
                    </p>
                    {links.map((link) => {
                        const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen?.(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative ${isActive
                                    ? 'bg-brand-50 text-brand-700 font-medium'
                                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                                    }`}
                            >
                                <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-brand-600' : 'text-surface-400 group-hover:text-surface-600'}`} />
                                <span className="text-sm">{link.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 border-t border-surface-200">
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-surface-50 border border-surface-200 mb-4">
                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700 uppercase flex-shrink-0">
                        {user?.fullName.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 truncate">{user?.fullName || 'Admin User'}</p>
                        <p className="text-xs text-surface-500 truncate">{user?.role === 'SECTOR_ADMIN' ? user.department : 'Platform Admin'}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-surface-600 hover:bg-danger/10 hover:text-danger transition-colors group"
                >
                    <LogOut className="h-5 w-5 transition-colors group-hover:text-danger" />
                    <span className="text-sm font-medium">Sign out</span>
                </button>
            </div>
        </aside>
    );
}
