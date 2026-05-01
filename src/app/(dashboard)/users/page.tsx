'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Department } from '@/types';
import { Users as UsersIcon, Shield, Search, Plus, MoreVertical, ShieldAlert, Key, UserX } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { AddAdminModal } from '@/components/ui/AddAdminModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import api from '@/lib/api';

export default function UsersPage() {
    const { hasRole } = useAuth();
    const isSuperAdmin = hasRole(['SUPER_ADMIN']);

    const [activeTab, setActiveTab] = useState<'admins' | 'citizens'>('admins');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [actioning, setActioning] = useState<string | null>(null);
    const [userToToggle, setUserToToggle] = useState<User | null>(null);

    const [admins, setAdmins] = useState<User[]>([]);
    const [citizens, setCitizens] = useState<User[]>([]);

    useEffect(() => {
        if (!isSuperAdmin) return;

        const fetchUsers = async () => {
            try {
                const res = await api.get<{ admins: User[], citizens: User[] }>('/admin/users');
                setAdmins(res.data.admins);
                setCitizens(res.data.citizens);
            } catch (error: any) {
                console.error('Failed to fetch users:', error);
                if (error.response) {
                    console.error('Server Data:', error.response.data);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [isSuperAdmin]);

    const handleAddAdmin = async (adminData: any) => {
        // Send request to backend to create admin
        const res = await api.post('/admin/users', adminData);
        // Append to local state list
        setAdmins(prev => [res.data.user, ...prev]);
    };

    const handleToggleStatus = async () => {
        if (!userToToggle) return;
        const userId = userToToggle.id || userToToggle._id;
        const currentStatus = userToToggle.isDisabled;
        if (!userId) return;

        setActioning(userId);
        try {
            const newStatus = !currentStatus;
            await api.put(`/admin/users/${userId}/status`, { isDisabled: newStatus });

            // Update local state (check both lists since user could be in either)
            setCitizens(prev => prev.map(c => (c.id === userId || c._id === userId) ? { ...c, isDisabled: newStatus } : c));
            setAdmins(prev => prev.map(a => (a.id === userId || a._id === userId) ? { ...a, isDisabled: newStatus } : a));
            setUserToToggle(null);
        } catch (error) {
            console.error('Failed to toggle user status:', error);
        } finally {
            setActioning(null);
        }
    };

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
            <div className="bg-white border border-surface-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-surface-200 flex items-center justify-between bg-surface-50">
                    <h3 className="font-semibold text-surface-900">Registered Sector Admins</h3>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-surface-900 text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        New Admin
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white text-surface-500 border-b border-surface-200">
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
                                            <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center font-bold text-surface-900 uppercase flex-shrink-0">
                                                {admin.fullName.charAt(0)}
                                            </div>
                                            <span className="font-medium text-surface-900">{admin.fullName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-surface-600">{admin.email}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-surface-100 text-brand-700 border border-surface-200">
                                            {admin.department}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-surface-500">
                                        {new Date(admin.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {admin.role !== 'SUPER_ADMIN' ? (
                                                <button
                                                    onClick={() => setUserToToggle(admin)}
                                                    disabled={actioning === admin._id}
                                                    className={`px-3 py-1 text-xs font-medium rounded border transition-colors disabled:opacity-50 ${admin.isDisabled
                                                        ? 'border-success/30 text-success hover:bg-success/10'
                                                        : 'border-danger/30 text-danger hover:bg-danger/10'
                                                        }`}
                                                >
                                                    {actioning === admin._id ? 'Updating...' : (admin.isDisabled ? 'Activate' : 'Suspend')}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-surface-500 font-medium px-2">Super Admin</span>
                                            )}
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
            <div className="bg-white border border-surface-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-surface-200 bg-surface-50">
                    <h3 className="font-semibold text-surface-900">Registered Citizens</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white text-surface-500 border-b border-surface-200">
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
                                            <div className="h-8 w-8 rounded-full bg-surface-700 flex items-center justify-center font-bold text-surface-900 uppercase flex-shrink-0 border border-surface-200">
                                                {cit.fullName.charAt(0)}
                                            </div>
                                            <span className="font-medium text-surface-900">{cit.fullName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-surface-600">{cit.email}</span>
                                    </td>
                                    <td className="px-6 py-4 text-surface-500">
                                        {cit.phoneNumber || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-surface-500">
                                        {new Date(cit.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setUserToToggle(cit)}
                                            disabled={actioning === cit._id}
                                            className={`px-3 py-1 text-xs font-medium rounded border transition-colors disabled:opacity-50 ${cit.isDisabled
                                                ? 'border-success/30 text-success hover:bg-success/10'
                                                : 'border-danger/30 text-danger hover:bg-danger/10'
                                                }`}
                                        >
                                            {actioning === cit._id ? 'Updating...' : (cit.isDisabled ? 'Activate' : 'Suspend')}
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
                    <h2 className="text-2xl font-bold text-surface-900 tracking-tight">System Users</h2>
                    <p className="text-surface-500 text-sm">Manage municipality workforce and oversee citizen accounts.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar / Tabs */}
                <div className="md:w-64 shrink-0 space-y-1">
                    <button
                        onClick={() => setActiveTab('admins')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'admins'
                            ? 'bg-brand-50 text-brand-600 border border-brand-100 shadow-[0_0_15px_rgba(99,102,241,0.05)]'
                            : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800 border border-transparent'
                            }`}
                    >
                        <Shield className={`h-5 w-5 ${activeTab === 'admins' ? 'text-brand-600' : 'text-surface-500'}`} />
                        Sector Admins
                    </button>
                    <button
                        onClick={() => setActiveTab('citizens')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'citizens'
                            ? 'bg-brand-50 text-brand-600 border border-brand-100 shadow-[0_0_15px_rgba(99,102,241,0.05)]'
                            : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800 border border-transparent'
                            }`}
                    >
                        <UsersIcon className={`h-5 w-5 ${activeTab === 'citizens' ? 'text-brand-600' : 'text-surface-500'}`} />
                        Citizens
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 space-y-4">
                    <div className="relative group max-w-md">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="h-4 w-4 text-surface-500" />
                        </div>
                        <input
                            type="text"
                            placeholder={`Search ${activeTab === 'admins' ? 'administrators' : 'citizens'}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-surface-200 rounded-xl py-2 pl-9 pr-4 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                        />
                    </div>

                    {loading ? (
                        <div className="bg-white border border-surface-200 rounded-xl shadow-sm p-6 space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                        activeTab === 'admins' ? renderAdmins() : renderCitizens()
                    )}
                </div>
            </div>

            <AddAdminModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddAdmin}
            />

            {/* Toggle Status Confirmation Modal */}
            <ConfirmModal
                isOpen={!!userToToggle}
                title={userToToggle?.isDisabled ? "Activate User Account" : "Suspend User Account"}
                message={
                    <>
                        Are you sure you want to {userToToggle?.isDisabled ? "activate" : "suspend"} <span className="font-semibold text-surface-900">{userToToggle?.fullName}</span>?
                        {!userToToggle?.isDisabled && " They will be immediately logged out and unable to access the system."}
                    </>
                }
                confirmText={userToToggle?.isDisabled ? "Activate" : "Suspend"}
                isDanger={!userToToggle?.isDisabled}
                onConfirm={handleToggleStatus}
                onCancel={() => !actioning && setUserToToggle(null)}
                isLoading={actioning !== null}
            />
        </div>
    );
}
