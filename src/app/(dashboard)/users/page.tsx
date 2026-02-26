'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Department } from '@/types';
import { Users as UsersIcon, Shield, Search, Plus, MoreVertical, ShieldAlert, Key, UserX } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

export default function UsersPage() {
    const { hasRole } = useAuth();
    const isSuperAdmin = hasRole(['SUPER_ADMIN']);

    const [activeTab, setActiveTab] = useState<'admins' | 'citizens'>('admins');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false); // In real app, fetch useEffect here

    // Mocks
    const [admins] = useState<User[]>([
        { _id: 'a1', firebaseUid: 'f1', fullName: 'Mesfin Tilahun', email: 'mesfin.road@cityfix.gov', role: 'SECTOR_ADMIN', department: 'Road', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { _id: 'a2', firebaseUid: 'f2', fullName: 'Chaltu Alemu', email: 'chaltu.water@cityfix.gov', role: 'SECTOR_ADMIN', department: 'Water', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]);
    const [citizens] = useState<User[]>([
        { _id: 'c1', firebaseUid: 'f3', fullName: 'Abebe Girma', email: 'abebe@example.com', phoneNumber: '+251911000000', role: 'CITIZEN', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]);

    if (!isSuperAdmin) {
        return (
            <EmptyState
                icon={ShieldAlert}
                title="Restricted Access"
                description="User and System Administration is limited to Super Administrators only."
            />
        );
    }

    const renderAdmins = () => {
        const filteredAdmins = admins.filter(admin =>
            admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.department?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-surface-900/50">
                    <h3 className="font-semibold text-white">Registered Sector Admins</h3>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-brand-500/20">
                        <Plus className="h-4 w-4" />
                        New Admin
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-surface-900 text-surface-400 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wider">Name</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Email</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Department</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Added On</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredAdmins.map((admin) => (
                                <tr key={admin._id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center font-bold text-white uppercase flex-shrink-0">
                                                {admin.fullName.charAt(0)}
                                            </div>
                                            <span className="font-medium text-white">{admin.fullName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-surface-300">{admin.email}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-surface-800 text-brand-300 border border-white/5">
                                            {admin.department}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-surface-400">
                                        {new Date(admin.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-1.5 text-surface-400 hover:text-white transition-colors"><Key className="h-4 w-4" /></button>
                                            <button className="p-1.5 text-surface-400 hover:text-danger transition-colors"><UserX className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderCitizens = () => {
        const filteredCitizens = citizens.filter(cit => cit.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

        return (
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-surface-900/50">
                    <h3 className="font-semibold text-white">Registered Citizens</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-surface-900 text-surface-400 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wider">Name</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Email</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Phone</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Joined</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredCitizens.map((cit) => (
                                <tr key={cit._id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-surface-700 flex items-center justify-center font-bold text-white uppercase flex-shrink-0 border border-white/5">
                                                {cit.fullName.charAt(0)}
                                            </div>
                                            <span className="font-medium text-white">{cit.fullName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-surface-300">{cit.email}</span>
                                    </td>
                                    <td className="px-6 py-4 text-surface-400">
                                        {cit.phoneNumber || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-surface-400">
                                        {new Date(cit.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="px-3 py-1 text-xs font-medium rounded border border-danger/30 text-danger hover:bg-danger/10 transition-colors">
                                            Suspend
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">System Users</h2>
                    <p className="text-surface-400 text-sm">Manage municipality workforce and oversee citizen accounts.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar / Tabs */}
                <div className="md:w-64 shrink-0 space-y-1">
                    <button
                        onClick={() => setActiveTab('admins')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'admins'
                                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]'
                                : 'text-surface-300 hover:bg-surface-800 hover:text-white border border-transparent'
                            }`}
                    >
                        <Shield className={`h-5 w-5 ${activeTab === 'admins' ? 'text-brand-400' : 'text-surface-400'}`} />
                        Sector Admins
                    </button>
                    <button
                        onClick={() => setActiveTab('citizens')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'citizens'
                                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]'
                                : 'text-surface-300 hover:bg-surface-800 hover:text-white border border-transparent'
                            }`}
                    >
                        <UsersIcon className={`h-5 w-5 ${activeTab === 'citizens' ? 'text-brand-400' : 'text-surface-400'}`} />
                        Citizens
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 space-y-4">
                    <div className="relative group max-w-md">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="h-4 w-4 text-surface-400" />
                        </div>
                        <input
                            type="text"
                            placeholder={`Search ${activeTab === 'admins' ? 'administrators' : 'citizens'}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface-900 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                        />
                    </div>

                    {loading ? (
                        <div className="glass-card p-6 space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                        activeTab === 'admins' ? renderAdmins() : renderCitizens()
                    )}
                </div>
            </div>
        </div>
    );
}
