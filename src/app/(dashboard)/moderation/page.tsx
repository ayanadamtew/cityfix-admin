'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { IssueReport, User } from '@/types';
import { ShieldAlert, Trash2, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';

interface ReportedPost {
    _id: string;
    issueId: IssueReport;
    citizenId: User;
    reason: string;
    createdAt: string;
}

export default function ModerationPage() {
    const { hasRole } = useAuth();
    const isSuperAdmin = hasRole(['SUPER_ADMIN']);

    const [reports, setReports] = useState<ReportedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [actioning, setActioning] = useState<string | null>(null);

    useEffect(() => {
        if (isSuperAdmin) {
            api.get<ReportedPost[]>('/admin/moderation/reports')
                .then(res => setReports(res.data))
                .catch(err => {
                    console.error('Failed to load flagged content:', err);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [isSuperAdmin]);

    const handleDismiss = async (reportId: string) => {
        setActioning(`dismiss-${reportId}`);
        try {
            await api.delete(`/admin/moderation/reports/${reportId}/dismiss`);
            setReports(reports.filter(r => r._id !== reportId));
        } catch (error) {
            console.error('Error dismissing report:', error);
        } finally {
            setActioning(null);
        }
    };

    const handleDeleteIssue = async (reportId: string, issueId: string) => {
        setActioning(`delete-${reportId}`);
        try {
            await api.delete(`/admin/moderation/reports/${reportId}/issue`);
            setReports(reports.filter(r => r._id !== reportId));
        } catch (error) {
            console.error('Error deleting issue:', error);
        } finally {
            setActioning(null);
        }
    };

    if (!isSuperAdmin && !loading) {
        return (
            <EmptyState
                icon={ShieldAlert}
                title="Access Denied"
                description="Only Super Administrators have access to the Content Moderation tools."
            />
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Content Moderation</h2>
                    <p className="text-surface-400 text-sm">Review issues that citizens have flagged as inappropriate or spam.</p>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ) : reports.length === 0 ? (
                    <EmptyState
                        icon={CheckCircle}
                        title="All clear!"
                        description="There are currently no flagged posts requiring moderation review."
                    />
                ) : (
                    <div className="divide-y divide-white/5">
                        {reports.map((report) => (
                            <div key={report._id} className="p-6 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center gap-6 group">
                                {/* Reason & Reporter */}
                                <div className="md:w-1/4 shrink-0">
                                    <div className="flex items-center gap-2 text-danger mb-2">
                                        <ShieldAlert className="h-4 w-4" />
                                        <span className="font-semibold text-sm uppercase tracking-wider">Flagged</span>
                                    </div>
                                    <p className="text-white font-medium mb-1">{report.reason}</p>
                                    <p className="text-xs text-surface-400">Reported by {report.citizenId.fullName}</p>
                                </div>

                                {/* Content Preview */}
                                <div className="flex-1 bg-surface-900/50 rounded-lg p-4 border border-white/5">
                                    <p className="text-surface-200 text-sm line-clamp-2 mb-3">"{report.issueId.description}"</p>
                                    <Link
                                        href={`/issues/${report.issueId._id}`}
                                        className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 transition-colors text-xs font-semibold uppercase tracking-wider"
                                    >
                                        Review full issue context <ExternalLink className="h-3.5 w-3.5" />
                                    </Link>
                                </div>

                                {/* Actions */}
                                <div className="md:w-1/4 shrink-0 flex flex-row md:flex-col gap-3 justify-end items-end">
                                    <button
                                        onClick={() => handleDismiss(report._id)}
                                        disabled={actioning === `dismiss-${report._id}` || actioning === `delete-${report._id}`}
                                        className="w-full justify-center flex items-center gap-2 px-4 py-2 bg-surface-800 hover:bg-surface-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                                    >
                                        {actioning === `dismiss-${report._id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 text-success" />}
                                        Dismiss Flag
                                    </button>
                                    <button
                                        onClick={() => handleDeleteIssue(report._id, report.issueId._id)}
                                        disabled={actioning === `delete-${report._id}` || actioning === `dismiss-${report._id}`}
                                        className="w-full justify-center flex items-center gap-2 px-4 py-2 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                                    >
                                        {actioning === `delete-${report._id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        Delete Issue
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
