'use client';

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Department } from '@/types';

interface AddAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (adminData: any) => Promise<void>;
}

export function AddAdminModal({ isOpen, onClose, onAdd }: AddAdminModalProps) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        department: 'Water' as Department,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await onAdd(formData);
            setFormData({ fullName: '', email: '', password: '', department: 'Water' });
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to create admin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="glass-card relative w-full max-w-md p-6 bg-surface-900 border border-white/10 shadow-2xl rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Create Sector Admin</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-surface-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-surface-200 mb-1.5">Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full bg-surface-800 border border-white/5 rounded-xl py-2 px-4 text-sm text-white placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-200 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-surface-800 border border-white/5 rounded-xl py-2 px-4 text-sm text-white placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                            placeholder="admin@cityfix.gov"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-200 mb-1.5">Temporary Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-surface-800 border border-white/5 rounded-xl py-2 px-4 text-sm text-white placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-200 mb-1.5">Sector / Department</label>
                        <select
                            required
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                            className="w-full bg-surface-800 border border-white/5 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors appearance-none cursor-pointer"
                        >
                            <option value="Water">Water & Sewage</option>
                            <option value="Road">Road & Transport</option>
                            <option value="Waste">Waste Management</option>
                            <option value="Electricity">Electricity</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-surface-800 hover:bg-surface-700 text-white text-sm font-medium rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-brand-500/20"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Admin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
