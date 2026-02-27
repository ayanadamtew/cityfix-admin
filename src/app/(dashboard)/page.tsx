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
    Droplet,
    Trash2,
    Car,
    Zap,
    Star
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import dynamic from 'next/dynamic';

const DashboardMap = dynamic(() => import('@/components/DashboardMap'), {
    ssr: false,
    loading: () => <Skeleton className="w-full h-full min-h-[400px]" />
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
                // Removed mock data fallback so true errors are visible via the EmptyState
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
        { label: 'Total Issues Reported', value: data.totalIssues, icon: Activity, color: 'text-brand-400' },
        { label: 'Pending Issues', value: data.byStatus.Pending, icon: AlertTriangle, color: 'text-warning' },
        { label: 'Avg. Resolution (Days)', value: data.avgResolutionTimeDays, icon: Clock, color: 'text-info' },
        { label: 'Citizen Satisfaction', value: `${data.avgFeedbackRating} / 5.0`, icon: Star, color: 'text-success' },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        {isSuperAdmin ? 'City Overview' : `${user?.department} Overview`}
                    </h2>
                    <p className="text-surface-400 text-sm">
                        {isSuperAdmin ? 'Real-time analytical metrics for all sectors.' : `Real-time analytical metrics for the ${user?.department} sector.`}
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, index) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={index} className="glass-card p-6 flex flex-col items-start hover:bg-surface-800/80 transition-all duration-300 group hover:shadow-[0_0_25px_rgba(20,184,166,0.15)] hover:-translate-y-1 relative overflow-hidden border border-white/[0.05]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-brand-500/20" />
                            <div className={`p-3 rounded-xl bg-surface-950 shadow-inner mb-4 border border-white/[0.05] relative z-10`}>
                                <Icon className={`h-6 w-6 ${kpi.color} drop-shadow-[0_0_8px_currentColor]`} />
                            </div>
                            <p className="text-surface-400 text-sm font-medium mb-1 relative z-10">{kpi.label}</p>
                            <h4 className="text-3xl font-bold text-white relative z-10 glow-text">{kpi.value}</h4>
                        </div>
                    );
                })}
            </div>

            {/* Charts Placeholder grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                <div className="glass-card p-6 min-h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-6">Issues by Category</h3>
                    <div className="flex bg-surface-900/50 rounded-xl items-center justify-center p-8 h-[300px] border border-white/5">
                        {/* Chart implementation will go here */}
                        <div className="flex items-end justify-center gap-4 h-full w-full pb-4 px-4">
                            {Object.entries(data.byCategory).map(([cat, count]) => (
                                <div key={cat} className="flex flex-col items-center flex-1 gap-3 group relative">
                                    <span className="text-sm font-bold text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_0_8px_currentColor] absolute -top-8">{count}</span>
                                    <div
                                        className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-lg transition-all duration-1000 ease-out min-h-[20px] shadow-[0_0_15px_rgba(20,184,166,0.2)] group-hover:shadow-[0_0_20px_rgba(20,184,166,0.6)] group-hover:from-brand-500 group-hover:to-brand-300 relative overflow-hidden"
                                        style={{ height: `${(count / Math.max(...Object.values(data.byCategory))) * 200}px` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                    </div>
                                    <span className="text-xs text-surface-400 font-medium rotate-45 md:rotate-0 mt-2 transition-colors group-hover:text-surface-200">{cat}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 min-h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-6">Issues by Status</h3>
                    <div className="flex bg-surface-900/50 rounded-xl items-center justify-center p-8 h-[300px] border border-white/5 relative">
                        {/* Very simple mock pie chart using conic gradient */}
                        <div
                            className="w-48 h-48 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.5)] mr-8 relative overflow-hidden border border-white/5"
                        >
                            <div className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" style={{
                                background: `conic-gradient(var(--color-warning) 0% 29%, var(--color-info) 29% 50%, var(--color-success) 50% 100%)`
                            }}></div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-warning" />
                                <span className="text-sm text-surface-200">Pending <span className="text-white font-bold ml-2">{data.byStatus.Pending}</span></span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-info" />
                                <span className="text-sm text-surface-200">In Progress <span className="text-white font-bold ml-2">{data.byStatus['In Progress']}</span></span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-success" />
                                <span className="text-sm text-surface-200">Resolved <span className="text-white font-bold ml-2">{data.byStatus.Resolved}</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Hotspots */}
            <div className="glass-card p-6 min-h-[500px] flex flex-col mt-4 border border-white/[0.05] relative overflow-hidden group">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -mt-32 transition-all duration-700 group-hover:bg-brand-500/10" />
                <h3 className="text-lg font-semibold text-white mb-2 relative z-10 glow-text">Geographic Report Hotspots</h3>
                <p className="text-sm text-surface-400 mb-6 relative z-10">Density of citizen issue reports across municipality zones.</p>
                <div className="flex-1 rounded-xl overflow-hidden bg-surface-950 border border-white/[0.1] relative min-h-[400px] shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10">
                    <DashboardMap locations={data.locations} />
                </div>
            </div>
        </div>
    );
}
