'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import {
    Droplet, Car, Zap, Trash2, ChevronDown, ChevronRight, FolderTree, Tag, Loader2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface SubcategoryData {
    categories: string[];
    subcategories: Record<string, string[]>;
}

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; gradient: string; border: string; text: string }> = {
    Water: { icon: Droplet, gradient: 'from-blue-500 to-cyan-500', border: 'border-blue-500/20', text: 'text-blue-400' },
    Road: { icon: Car, gradient: 'from-amber-500 to-orange-500', border: 'border-amber-500/20', text: 'text-amber-400' },
    Electricity: { icon: Zap, gradient: 'from-yellow-400 to-yellow-600', border: 'border-yellow-500/20', text: 'text-yellow-400' },
    Waste: { icon: Trash2, gradient: 'from-green-500 to-emerald-500', border: 'border-green-500/20', text: 'text-green-400' },
};

export default function CategoriesPage() {
    const { user } = useAuth();
    const [data, setData] = useState<SubcategoryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    useEffect(() => {
        api.get<SubcategoryData>('/subcategories')
            .then(res => {
                setData(res.data);
                // Auto-expand user's department if sector admin
                if (user?.department) {
                    setExpanded({ [user.department]: true });
                } else {
                    // Super admin: expand all
                    const exp: Record<string, boolean> = {};
                    res.data.categories.forEach(c => { exp[c] = true; });
                    setExpanded(exp);
                }
            })
            .catch(err => console.error('Failed to fetch subcategories:', err))
            .finally(() => setLoading(false));
    }, [user]);

    const toggleExpand = (category: string) => {
        setExpanded(prev => ({ ...prev, [category]: !prev[category] }));
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto space-y-6">
                <Skeleton className="h-10 w-64 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (!data) {
        return <EmptyState icon={FolderTree} title="No Data" description="Unable to load categories." />;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-surface-900 tracking-tight">Categories & Subcategories</h2>
                <p className="text-surface-500 text-sm">
                    View issue categories and their subcategories used across the platform.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.categories.map(cat => {
                    const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.Water;
                    const Icon = config.icon;
                    const subCount = (data.subcategories[cat] || []).length;
                    return (
                        <div
                            key={cat}
                            className={`bg-white border border-surface-200 rounded-xl shadow-sm p-4 cursor-pointer hover:-translate-y-1 transition-all duration-300 group border ${config.border} hover:shadow-lg`}
                            onClick={() => toggleExpand(cat)}
                        >
                            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                                <Icon className="h-5 w-5 text-surface-900" />
                            </div>
                            <h3 className="text-surface-900 font-semibold text-sm">{cat === 'Waste' ? 'Waste Management' : cat}</h3>
                            <p className="text-surface-500 text-xs mt-1">{subCount} subcategories</p>
                        </div>
                    );
                })}
            </div>

            {/* Detailed Category Accordion */}
            <div className="space-y-4">
                {data.categories.map(cat => {
                    const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.Water;
                    const Icon = config.icon;
                    const subs = data.subcategories[cat] || [];
                    const isExpanded = expanded[cat];

                    return (
                        <div key={cat} className={`bg-white border border-surface-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300 border ${config.border}`}>
                            {/* Header */}
                            <button
                                onClick={() => toggleExpand(cat)}
                                className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                                        <Icon className="h-5 w-5 text-surface-900" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-surface-900 font-semibold">{cat === 'Waste' ? 'Waste Management' : cat}</h3>
                                        <p className="text-surface-500 text-xs">{subs.length} subcategories</p>
                                    </div>
                                </div>
                                {isExpanded
                                    ? <ChevronDown className={`h-5 w-5 ${config.text} transition-transform`} />
                                    : <ChevronRight className={`h-5 w-5 text-surface-500 transition-transform`} />
                                }
                            </button>

                            {/* Subcategories */}
                            {isExpanded && (
                                <div className="border-t border-surface-200 p-5 pt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {subs.map((sub, idx) => (
                                            <div
                                                key={sub}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-50 border border-surface-200 hover:border-surface-200 transition-colors group"
                                            >
                                                <div className={`h-2 w-2 rounded-full bg-gradient-to-br ${config.gradient} shadow-[0_0_6px] shadow-current`} />
                                                <span className="text-sm text-surface-700 group-hover:text-surface-800 transition-colors">{sub}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
