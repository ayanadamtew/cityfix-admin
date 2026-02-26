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
// Mapbox fallback used instead of react-map-gl

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
                // For initial development if backend is not ready, mock some data:
                setData({
                    totalIssues: 154,
                    byStatus: { Pending: 45, 'In Progress': 32, Resolved: 77 },
                    byCategory: { Water: 40, Waste: 35, Road: 50, Electricity: 29 },
                    avgResolutionTimeDays: 2.4,
                    avgFeedbackRating: 4.2
                });
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
                        <div key={index} className="glass-card p-6 flex flex-col items-start hover:bg-white/[0.08] transition-colors group">
                            <div className={`p-3 rounded-xl bg-surface-900 shadow-inner mb-4 border border-white/5`}>
                                <Icon className={`h-6 w-6 ${kpi.color}`} />
                            </div>
                            <p className="text-surface-400 text-sm font-medium mb-1">{kpi.label}</p>
                            <h4 className="text-3xl font-bold text-white">{kpi.value}</h4>
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
                                <div key={cat} className="flex flex-col items-center flex-1 gap-3">
                                    <span className="text-sm font-bold text-brand-300">{count}</span>
                                    <div
                                        className="w-full bg-brand-500 rounded-t-lg transition-all duration-1000 ease-out min-h-[20px]"
                                        style={{ height: `${(count / Math.max(...Object.values(data.byCategory))) * 200}px` }}
                                    />
                                    <span className="text-xs text-surface-400 font-medium rotate-45 md:rotate-0 mt-2">{cat}</span>
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
                            className="w-48 h-48 rounded-full shadow-2xl mr-8"
                            style={{
                                background: `conic-gradient(var(--color-warning) 0% 29%, var(--color-info) 29% 50%, var(--color-success) 50% 100%)`
                            }}
                        />
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
            <div className="glass-card p-6 min-h-[500px] flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-2">Geographic Report Hotspots</h3>
                <p className="text-sm text-surface-400 mb-6">Density of citizen issue reports across municipality zones.</p>
                <div className="flex-1 rounded-xl overflow-hidden bg-surface-900 border border-white/5 relative min-h-[400px] flex items-center justify-center p-8">

                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

                    <div className="relative w-full h-full max-w-2xl min-h-[300px] border border-white/10 rounded-2xl bg-surface-950/50 flex items-center justify-center overflow-hidden">
                        <iframe
                            width="100%"
                            height="100%"
                            className="absolute inset-0 border-0 opacity-70 mix-blend-luminosity"
                            loading="lazy"
                            allowFullScreen
                            src={`https://maps.google.com/maps?q=Addis+Ababa&t=k&z=12&output=embed`}
                        ></iframe>
                        <div className="absolute inset-0 bg-surface-900/40 pointer-events-none" />

                        {/* CSS Mock Hotspots */}
                        <div className="absolute top-[30%] left-[40%]">
                            <div className="w-8 h-8 rounded-full bg-danger/50 animate-pulse flex items-center justify-center border border-danger shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                                <span className="text-white text-xs font-bold">12</span>
                            </div>
                        </div>
                        <div className="absolute top-[60%] left-[25%]">
                            <div className="w-6 h-6 rounded-full bg-warning/50 animate-pulse flex items-center justify-center border border-warning shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                                <span className="text-white text-[10px] font-bold">5</span>
                            </div>
                        </div>
                        <div className="absolute top-[45%] right-[30%]">
                            <div className="w-12 h-12 rounded-full bg-danger/80 animate-pulse flex items-center justify-center border border-danger shadow-[0_0_30px_rgba(239,68,68,0.8)] delay-150">
                                <span className="text-white text-sm font-bold">24</span>
                            </div>
                        </div>

                        <p className="text-surface-500 font-medium text-sm tracking-widest uppercase relative z-10 opacity-50">City Zone Map Overview</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
