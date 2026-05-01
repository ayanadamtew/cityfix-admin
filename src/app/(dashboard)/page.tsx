'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AnalyticsData } from '@/types';
import api from '@/lib/api';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Activity,
    Star
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import dynamic from 'next/dynamic';

const DashboardMap = dynamic(() => import('@/components/DashboardMap'), {
    ssr: false,
    loading: () => <Skeleton className="w-full h-full min-h-[400px]" />,
});

export default function DashboardPage() {
    const { hasRole, user } = useAuth();
    const isSuperAdmin = hasRole(['SUPER_ADMIN']);

    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/analytics')
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch analytics', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }

    if (!data) {
        return <EmptyState icon={Activity} title="No Analytics Data" description="Unable to load dashboard statistics at this time." />;
    }

    const kpis = [
        { label: 'Total Issues', value: data.totalIssues, icon: Activity, bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
        { label: 'Pending', value: data.byStatus.Pending, icon: AlertTriangle, bgColor: 'bg-amber-50', iconColor: 'text-amber-600' },
        { label: 'Avg. Resolution (Days)', value: data.avgResolutionTimeDays, icon: Clock, bgColor: 'bg-sky-50', iconColor: 'text-sky-600' },
        { label: 'Satisfaction', value: `${data.avgFeedbackRating} / 5.0`, icon: Star, bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-bold text-surface-900 tracking-tight">
                    {isSuperAdmin ? 'City Overview' : `${user?.department} Overview`}
                </h2>
                <p className="text-surface-500 text-sm mt-1">
                    {isSuperAdmin ? 'Real-time analytical metrics for all sectors.' : `Real-time analytical metrics for the ${user?.department} sector.`}
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, index) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={index} className="bg-white border border-surface-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                                    <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
                                </div>
                                <div>
                                    <p className="text-surface-500 text-xs font-medium uppercase tracking-wide">{kpi.label}</p>
                                    <h4 className="text-2xl font-bold text-surface-900 mt-0.5">{kpi.value}</h4>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Category Bar Chart */}
                <div className="bg-white border border-surface-200 rounded-xl p-6">
                    <h3 className="text-base font-semibold text-surface-900 mb-6">Issues by Category</h3>
                    <div className="flex items-end justify-center gap-4 h-[260px] pb-4 px-4">
                        {Object.entries(data.byCategory).map(([cat, count]) => {
                            const catColors: Record<string, string> = {
                                Water: 'bg-blue-500',
                                Road: 'bg-amber-500',
                                Electricity: 'bg-yellow-500',
                                Waste: 'bg-emerald-500',
                            };
                            const barColor = catColors[cat] || 'bg-brand-500';
                            return (
                                <div key={cat} className="flex flex-col items-center flex-1 gap-2 group">
                                    <span className="text-xs font-bold text-surface-900">{count}</span>
                                    <div
                                        className={`w-full ${barColor} rounded-t-md transition-all duration-700 min-h-[8px]`}
                                        style={{ height: `${(count / Math.max(...Object.values(data.byCategory), 1)) * 200}px` }}
                                    />
                                    <span className="text-xs text-surface-500 font-medium text-center">{cat}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Status Pie Chart */}
                <div className="bg-white border border-surface-200 rounded-xl p-6">
                    <h3 className="text-base font-semibold text-surface-900 mb-6">Issues by Status</h3>
                    <div className="flex items-center justify-center gap-8 h-[260px]">
                        <div
                            className="w-44 h-44 rounded-full shadow-sm border border-surface-100"
                            style={{
                                background: `conic-gradient(var(--color-warning) 0% 29%, var(--color-info) 29% 50%, var(--color-success) 50% 100%)`
                            }}
                        />
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-warning" />
                                <span className="text-sm text-surface-600">Pending <span className="text-surface-900 font-bold ml-1">{data.byStatus.Pending}</span></span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-info" />
                                <span className="text-sm text-surface-600">In Progress <span className="text-surface-900 font-bold ml-1">{data.byStatus['In Progress']}</span></span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-success" />
                                <span className="text-sm text-surface-600">Resolved <span className="text-surface-900 font-bold ml-1">{data.byStatus.Resolved}</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subcategory Breakdown */}
            {data.bySubcategory && Object.keys(data.bySubcategory).length > 0 && (
                <div className="bg-white border border-surface-200 rounded-xl p-6">
                    <h3 className="text-base font-semibold text-surface-900 mb-6">Issues by Subcategory</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(data.bySubcategory).map(([cat, subs]) => {
                            const catConfig: Record<string, { bar: string; label: string }> = {
                                Water: { bar: 'bg-blue-500', label: 'text-blue-700' },
                                Road: { bar: 'bg-amber-500', label: 'text-amber-700' },
                                Electricity: { bar: 'bg-yellow-500', label: 'text-yellow-700' },
                                Waste: { bar: 'bg-emerald-500', label: 'text-emerald-700' },
                            };
                            const cfg = catConfig[cat] || catConfig.Water;
                            const maxCount = Math.max(...Object.values(subs), 1);

                            return (
                                <div key={cat} className="bg-surface-50 rounded-lg p-5 border border-surface-200">
                                    <h4 className={`text-sm font-bold ${cfg.label} uppercase tracking-wider mb-4`}>
                                        {cat === 'Waste' ? 'Waste Management' : cat}
                                    </h4>
                                    <div className="space-y-3">
                                        {Object.entries(subs).sort((a, b) => b[1] - a[1]).map(([sub, count]) => (
                                            <div key={sub} className="flex items-center gap-3">
                                                <span className="text-xs text-surface-600 w-36 truncate flex-shrink-0" title={sub}>{sub}</span>
                                                <div className="flex-1 bg-surface-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${cfg.bar} transition-all duration-700`}
                                                        style={{ width: `${(count / maxCount) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-surface-900 w-8 text-right">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Map */}
            <div className="bg-white border border-surface-200 rounded-xl p-6 min-h-[500px] flex flex-col">
                <h3 className="text-base font-semibold text-surface-900 mb-1">Geographic Report Hotspots</h3>
                <p className="text-sm text-surface-500 mb-4">Density of citizen issue reports across municipality zones.</p>
                <div className="flex-1 rounded-lg overflow-hidden border border-surface-200 min-h-[400px]">
                    <DashboardMap locations={data.locations} />
                </div>
            </div>
        </div>
    );
}
