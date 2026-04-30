'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';
import api from '@/lib/api';
import {
    Wrench, Plus, Search, UserCheck, UserX, Edit3, X, Loader2, Phone, Mail, Shield, Star
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface TechnicianFormData {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
    specialization: string;
}

const initialFormData: TechnicianFormData = {
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    specialization: '',
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
    }, []);

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
                await api.post('/admin/technicians', formData);
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
            password: '',
            phoneNumber: tech.phoneNumber || '',
            specialization: tech.specialization || '',
        });
        setShowModal(true);
    };

    const handleToggleStatus = async (tech: User) => {
        const techId = tech.id || tech._id;
        if (!techId) return;
        setToggling(techId);
        try {
            await api.put(`/admin/technicians/${techId}/status`, {
                isDisabled: !tech.isDisabled,
            });
            fetchTechnicians();
        } catch (err) {
            console.error('Failed to toggle status:', err);
        } finally {
            setToggling(null);
        }
    };

    const filteredTechnicians = technicians.filter(t =>
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.specialization && t.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Technicians</h2>
                    <p className="text-surface-400 text-sm">
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
                            className="w-full sm:w-56 bg-surface-900 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => { setEditingId(null); setFormData(initialFormData); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-brand-500/20"
                    >
                        <Plus className="h-4 w-4" />
                        Add Technician
                    </button>
                </div>
            </div>

            {/* Technicians Grid */}
            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : filteredTechnicians.length === 0 ? (
                    <EmptyState
                        icon={Wrench}
                        title="No Technicians Found"
                        description={searchTerm ? "Try adjusting your search." : "No technicians registered yet. Click 'Add Technician' to get started."}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
                        {filteredTechnicians.map((tech) => {
                            const techId = tech.id || tech._id || '';
                            return (
                                <div
                                    key={techId}
                                    className={`glass-card p-5 relative overflow-hidden group transition-all duration-300 hover:shadow-lg ${tech.isDisabled ? 'opacity-60' : ''}`}
                                >
                                    {/* Status indicator */}
                                    <div className={`absolute top-4 right-4 h-3 w-3 rounded-full ${tech.isDisabled ? 'bg-danger' : 'bg-success'} shadow-[0_0_8px] ${tech.isDisabled ? 'shadow-danger/40' : 'shadow-success/40'}`} />

                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-lg font-bold text-white flex-shrink-0 border border-brand-400/30 shadow-[0_0_10px_rgba(20,184,166,0.15)]">
                                            {tech.fullName.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-white truncate">{tech.fullName}</h3>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Mail className="h-3.5 w-3.5 text-surface-400" />
                                                <span className="text-xs text-surface-300 truncate">{tech.email}</span>
                                            </div>
                                            {tech.phoneNumber && (
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Phone className="h-3.5 w-3.5 text-surface-400" />
                                                    <span className="text-xs text-surface-300">{tech.phoneNumber}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {tech.specialization && (
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Shield className="h-3.5 w-3.5 text-brand-400" />
                                                <span className="text-xs text-brand-300 font-medium">{tech.specialization}</span>
                                            </div>
                                            {(tech.ratingCount ?? 0) > 0 && (
                                                <div className="flex items-center gap-1 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                                                    <Star className="h-3 w-3 text-brand-400 fill-brand-400" />
                                                    <span className="text-[10px] font-bold text-brand-300">
                                                        {tech.averageRating?.toFixed(1)} ({tech.ratingCount})
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(tech)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface-800 text-surface-300 hover:text-white hover:bg-surface-700 transition-colors text-xs font-medium"
                                        >
                                            <Edit3 className="h-3.5 w-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(tech)}
                                            disabled={toggling === techId}
                                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${tech.isDisabled
                                                    ? 'bg-success/10 text-success hover:bg-success/20 border border-success/20'
                                                    : 'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20'
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
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card w-full max-w-md p-6 mx-4 animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">
                                {editingId ? 'Edit Technician' : 'Register New Technician'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                    className="w-full bg-surface-900 border border-white/5 rounded-xl py-2 px-4 text-sm text-white placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                                    placeholder="Enter full name"
                                />
                            </div>

                            {!editingId && (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            className="w-full bg-surface-900 border border-white/5 rounded-xl py-2 px-4 text-sm text-white placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                                            placeholder="technician@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                                            Password *
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                            minLength={6}
                                            className="w-full bg-surface-900 border border-white/5 rounded-xl py-2 px-4 text-sm text-white placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                                            placeholder="Minimum 6 characters"
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full bg-surface-900 border border-white/5 rounded-xl py-2 px-4 text-sm text-white placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                                    placeholder="+251 9XX XXX XXXX"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                                    Specialization
                                </label>
                                <input
                                    type="text"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                    className="w-full bg-surface-900 border border-white/5 rounded-xl py-2 px-4 text-sm text-white placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                                    placeholder="e.g., Pipe Repair, Electrical Wiring"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-surface-800 text-surface-300 hover:text-white hover:bg-surface-700 transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all text-sm font-medium shadow-lg shadow-brand-500/20 disabled:opacity-50"
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
        </div>
    );
}
