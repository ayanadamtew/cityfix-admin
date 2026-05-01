'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';
import api from '@/lib/api';
import {
    Wrench, Plus, Search, UserCheck, UserX, Edit3, X, Loader2, Phone, Mail, Shield, Star, Tag, Key
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface SubcategoryData {
    categories: string[];
    subcategories: Record<string, string[]>;
}

interface TechnicianFormData {
    fullName: string;
    email: string;
    phoneNumber: string;
    specialization: string[];
}

const initialFormData: TechnicianFormData = {
    fullName: '',
    email: '',
    phoneNumber: '',
    specialization: [],
};

export default function TechniciansPage() {
    const { user } = useAuth();
    const [technicians, setTechnicians] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<TechnicianFormData>(initialFormData);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [toggling, setToggling] = useState<string | null>(null);
    const [resetting, setResetting] = useState<string | null>(null);
    const [techToReset, setTechToReset] = useState<User | null>(null);
    const [techToToggle, setTechToToggle] = useState<User | null>(null);
    const [subcategories, setSubcategories] = useState<string[]>([]);

    const fetchTechnicians = async () => {
        try {
            const res = await api.get<User[]>('/admin/technicians');
            setTechnicians(res.data);
        } catch (err) {
            console.error('Failed to fetch technicians:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTechnicians();

        // Fetch subcategories for the admin's department
        if (user?.department) {
            api.get<{ category: string; subcategories: string[] }>(`/subcategories/${user.department}`)
                .then(res => setSubcategories(res.data.subcategories))
                .catch(() => {});
        }
    }, [user]);

    const toggleSpecialization = (sub: string) => {
        setFormData(prev => {
            const current = prev.specialization;
            if (current.includes(sub)) {
                return { ...prev, specialization: current.filter(s => s !== sub) };
            } else {
                return { ...prev, specialization: [...current, sub] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingId) {
                await api.put(`/admin/technicians/${editingId}`, {
                    fullName: formData.fullName,
                    phoneNumber: formData.phoneNumber,
                    specialization: formData.specialization,
                });
            } else {
                await api.post('/admin/technicians', {
                    ...formData,
                    specialization: formData.specialization,
                });
            }
            setShowModal(false);
            setEditingId(null);
            setFormData(initialFormData);
            fetchTechnicians();
        } catch (err: any) {
            console.error('Failed to save technician:', err);
            alert(err.response?.data?.message || 'Failed to save technician.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (tech: User) => {
        setEditingId(tech.id || tech._id || null);
        setFormData({
            fullName: tech.fullName,
            email: tech.email,
            phoneNumber: tech.phoneNumber || '',
            specialization: Array.isArray(tech.specialization) ? tech.specialization : (tech.specialization ? [tech.specialization as unknown as string] : []),
        });
        setShowModal(true);
    };

    const handleToggleStatus = async () => {
        if (!techToToggle) return;
        const techId = techToToggle.id || techToToggle._id;
        if (!techId) return;
        setToggling(techId);
        try {
            await api.put(`/admin/technicians/${techId}/status`, {
                isDisabled: !techToToggle.isDisabled,
            });
            fetchTechnicians();
            setTechToToggle(null);
        } catch (err) {
            console.error('Failed to toggle status:', err);
        } finally {
            setToggling(null);
        }
    };

    const handleResetPassword = async () => {
        if (!techToReset) return;
        const techId = techToReset.id || techToReset._id;
        if (!techId) return;
        
        setResetting(techId);
        try {
            await api.post(`/admin/technicians/${techId}/credentials/reset`);
            alert(`Password reset successfully. New credentials have been emailed to ${techToReset.email}.`);
            setTechToReset(null);
        } catch (err: any) {
            console.error('Failed to reset password:', err);
            alert(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setResetting(null);
        }
    };

    const filteredTechnicians = technicians.filter(t =>
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (Array.isArray(t.specialization) && t.specialization.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-surface-900 tracking-tight">Technicians</h2>
                    <p className="text-surface-500 text-sm mt-1">
                        Manage {user?.department} department technicians and field workers.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="h-4 w-4 text-surface-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search technicians..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-56 bg-white border border-surface-300 rounded-lg py-2 pl-9 pr-4 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => { setEditingId(null); setFormData(initialFormData); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Add Technician
                    </button>
                </div>
            </div>

            {/* Technicians Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            ) : filteredTechnicians.length === 0 ? (
                <div className="bg-white border border-surface-200 rounded-xl">
                    <EmptyState
                        icon={Wrench}
                        title="No Technicians Found"
                        description={searchTerm ? "Try adjusting your search." : "No technicians registered yet. Click 'Add Technician' to get started."}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTechnicians.map((tech) => {
                        const techId = tech.id || tech._id || '';
                        const specs = Array.isArray(tech.specialization) ? tech.specialization : [];
                        return (
                            <div
                                key={techId}
                                className={`bg-white border border-surface-200 rounded-xl p-5 relative transition-shadow hover:shadow-md ${tech.isDisabled ? 'opacity-60' : ''}`}
                            >
                                {/* Status dot */}
                                <div className={`absolute top-4 right-4 h-2.5 w-2.5 rounded-full ${tech.isDisabled ? 'bg-red-500' : 'bg-emerald-500'}`} />

                                <div className="flex items-start gap-4">
                                    <div className="h-11 w-11 rounded-lg bg-brand-100 flex items-center justify-center text-base font-bold text-brand-700 flex-shrink-0">
                                        {tech.fullName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-surface-900 truncate">{tech.fullName}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Mail className="h-3.5 w-3.5 text-surface-400" />
                                            <span className="text-xs text-surface-500 truncate">{tech.email}</span>
                                        </div>
                                        {tech.phoneNumber && (
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Phone className="h-3.5 w-3.5 text-surface-400" />
                                                <span className="text-xs text-surface-500">{tech.phoneNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Specializations */}
                                {specs.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center gap-1.5">
                                            <Shield className="h-3.5 w-3.5 text-brand-600" />
                                            <span className="text-xs text-surface-500 font-semibold uppercase tracking-wider">Specializations</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {specs.map(s => (
                                                <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-brand-50 text-brand-700 border border-brand-100">
                                                    <Tag className="h-2.5 w-2.5" />
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                        {(tech.ratingCount ?? 0) > 0 && (
                                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 w-fit">
                                                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                                <span className="text-[11px] font-bold text-amber-700">
                                                    {tech.averageRating?.toFixed(1)} ({tech.ratingCount})
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="mt-4 flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(tech)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-surface-50 text-surface-700 hover:bg-surface-100 border border-surface-200 transition-colors text-xs font-medium"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setTechToReset(tech)}
                                        disabled={resetting === techId}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-surface-50 text-surface-700 hover:bg-surface-100 border border-surface-200 transition-colors text-xs font-medium"
                                    >
                                        {resetting === techId ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <>
                                                <Key className="h-3.5 w-3.5" />
                                                Reset Pwd
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setTechToToggle(tech)}
                                        disabled={toggling === techId}
                                        className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors border ${tech.isDisabled
                                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                                                : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                                            }`}
                                    >
                                        {toggling === techId ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : tech.isDisabled ? (
                                            <>
                                                <UserCheck className="h-3.5 w-3.5" />
                                                Activate
                                            </>
                                        ) : (
                                            <>
                                                <UserX className="h-3.5 w-3.5" />
                                                Deactivate
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white border border-surface-200 rounded-xl shadow-xl w-full max-w-lg p-6 mx-4 animate-slide-up max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-surface-900">
                                {editingId ? 'Edit Technician' : 'Register New Technician'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 rounded-lg text-surface-400 hover:text-surface-900 hover:bg-surface-100 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                    className="w-full bg-white border border-surface-300 rounded-lg py-2 px-4 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                                    placeholder="Enter full name"
                                />
                            </div>

                            {!editingId && (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            className="w-full bg-white border border-surface-300 rounded-lg py-2 px-4 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                                            placeholder="technician@example.com"
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full bg-white border border-surface-300 rounded-lg py-2 px-4 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                                    placeholder="+251 9XX XXX XXXX"
                                />
                            </div>

                            {/* Specialization Multi-Select */}
                            <div>
                                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                                    Specializations ({user?.department} subcategories)
                                </label>
                                <div className="bg-surface-50 border border-surface-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-1.5">
                                    {subcategories.length === 0 ? (
                                        <p className="text-xs text-surface-400 italic p-2">No subcategories available</p>
                                    ) : (
                                        subcategories.map(sub => {
                                            const isChecked = formData.specialization.includes(sub);
                                            return (
                                                <label
                                                    key={sub}
                                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isChecked ? 'bg-brand-50 border border-brand-200' : 'hover:bg-surface-100 border border-transparent'}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleSpecialization(sub)}
                                                        className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                                                    />
                                                    <span className={`text-sm ${isChecked ? 'text-brand-700 font-medium' : 'text-surface-700'}`}>
                                                        {sub}
                                                    </span>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                                {formData.specialization.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {formData.specialization.map(s => (
                                            <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-brand-50 text-brand-700 border border-brand-100">
                                                {s}
                                                <button type="button" onClick={() => toggleSpecialization(s)} className="hover:text-red-600">
                                                    <X className="h-2.5 w-2.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-white text-surface-700 hover:bg-surface-50 border border-surface-300 transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-colors text-sm font-medium shadow-sm disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : editingId ? (
                                        'Save Changes'
                                    ) : (
                                        'Register'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Confirmation Modal */}
            <ConfirmModal
                isOpen={!!techToReset}
                title="Reset Password"
                message={
                    <>
                        Are you sure you want to reset the password for <span className="font-semibold text-surface-900">{techToReset?.fullName}</span>? 
                        New credentials will be generated and emailed to them.
                    </>
                }
                confirmText="Reset Password"
                onConfirm={handleResetPassword}
                onCancel={() => !resetting && setTechToReset(null)}
                isLoading={resetting !== null}
            />

            {/* Toggle Status Confirmation Modal */}
            <ConfirmModal
                isOpen={!!techToToggle}
                title={techToToggle?.isDisabled ? "Activate Technician" : "Suspend Technician"}
                message={
                    <>
                        Are you sure you want to {techToToggle?.isDisabled ? "activate" : "suspend"} <span className="font-semibold text-surface-900">{techToToggle?.fullName}</span>?
                        {!techToToggle?.isDisabled && " They will no longer be able to log in or receive new assignments."}
                    </>
                }
                confirmText={techToToggle?.isDisabled ? "Activate" : "Suspend"}
                isDanger={!techToToggle?.isDisabled}
                onConfirm={handleToggleStatus}
                onCancel={() => !toggling && setTechToToggle(null)}
                isLoading={toggling !== null}
            />
        </div>
    );
}
