'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { IssueReport, User, CompletionProof, Assignment } from '@/types';
import api from '@/lib/api';
import {
    ClipboardCheck, CheckCircle2, XCircle, Loader2, MapPin, Clock,
    Image as ImageIcon, User as UserIcon, AlertTriangle, X, ChevronDown
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function VerificationPage() {
    const { user } = useAuth();
    const [issues, setIssues] = useState<IssueReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [rejectModalProofId, setRejectModalProofId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

    const fetchQueue = async () => {
        try {
            const res = await api.get<IssueReport[]>('/admin/verification');
            setIssues(res.data);
        } catch (err) {
            console.error('Failed to fetch verification queue:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    const handleApprove = async (proofId: string) => {
        setActionLoading(proofId);
        try {
            await api.post(`/admin/verification/${proofId}/approve`);
            fetchQueue();
        } catch (err) {
            console.error('Failed to approve proof:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectModalProofId) return;
        setActionLoading(rejectModalProofId);
        try {
            await api.post(`/admin/verification/${rejectModalProofId}/reject`, {
                reason: rejectReason || 'Work not satisfactory.',
            });
            setRejectModalProofId(null);
            setRejectReason('');
            fetchQueue();
        } catch (err) {
            console.error('Failed to reject proof:', err);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Verification Queue</h2>
                <p className="text-surface-400 text-sm">
                    Review completion proofs submitted by technicians for {user?.department} department issues.
                </p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            ) : issues.length === 0 ? (
                <EmptyState
                    icon={ClipboardCheck}
                    title="No Pending Verifications"
                    description="All clear! No completion proofs are waiting for your review."
                />
            ) : (
                <div className="space-y-4">
                    {issues.map((issue) => {
                        const issueId = issue.id ?? issue._id ?? '';
                        const assignment = issue.assignment as Assignment | undefined;
                        const technician = assignment?.technician as User | undefined;
                        const latestProof = assignment?.proofs?.[0] as CompletionProof | undefined;
                        const proofId = latestProof?.id ?? latestProof?._id ?? '';
                        const isExpanded = expandedIssue === issueId;

                        return (
                            <div key={issueId} className="glass-card overflow-hidden">
                                {/* Header */}
                                <button
                                    onClick={() => setExpandedIssue(isExpanded ? null : issueId)}
                                    className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="h-10 w-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center flex-shrink-0">
                                            <AlertTriangle className="h-5 w-5 text-warning" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-medium text-white">#{issueId.slice(-6)}</span>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-500/10 text-brand-400 border border-brand-500/20">
                                                    {issue.category}
                                                </span>
                                            </div>
                                            <p className="text-sm text-surface-300 truncate">{issue.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                        {technician && (
                                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800 border border-white/5">
                                                <UserIcon className="h-3.5 w-3.5 text-surface-400" />
                                                <span className="text-xs text-surface-300">{technician.fullName}</span>
                                            </div>
                                        )}
                                        <ChevronDown className={`h-5 w-5 text-surface-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>

                                {/* Expanded Content */}
                                {isExpanded && latestProof && (
                                    <div className="border-t border-white/5 p-5 space-y-5 animate-fade-in">
                                        {/* Photos */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Issue Photo */}
                                            <div>
                                                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Original Issue Photo</p>
                                                {issue.photoUrl ? (
                                                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
                                                        <Image src={issue.photoUrl} alt="Original issue" fill className="object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="aspect-video rounded-xl bg-surface-900 border-2 border-dashed border-white/10 flex items-center justify-center text-surface-500">
                                                        <ImageIcon className="h-8 w-8 opacity-50" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* After Fix Photo */}
                                            <div>
                                                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">After Fix Photo</p>
                                                <div className="relative aspect-video rounded-xl overflow-hidden border border-success/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                                    <Image src={latestProof.afterPhotoUrl} alt="After fix" fill className="object-cover" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Before Photo (optional) */}
                                        {latestProof.beforePhotoUrl && (
                                            <div>
                                                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Before Fix Photo (Technician)</p>
                                                <div className="relative aspect-video max-w-sm rounded-xl overflow-hidden border border-white/10">
                                                    <Image src={latestProof.beforePhotoUrl} alt="Before fix" fill className="object-cover" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Technician Notes */}
                                        {latestProof.notes && (
                                            <div className="bg-surface-800/50 p-4 rounded-xl border border-white/5">
                                                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Technician Notes</p>
                                                <p className="text-sm text-surface-200">{latestProof.notes}</p>
                                            </div>
                                        )}

                                        {/* Info row */}
                                        <div className="flex flex-wrap gap-4 text-xs text-surface-400">
                                            {technician && (
                                                <div className="flex items-center gap-1.5">
                                                    <UserIcon className="h-3.5 w-3.5" />
                                                    {technician.fullName}
                                                    {technician.specialization && ` • ${technician.specialization}`}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                Submitted {new Date(latestProof.submittedAt).toLocaleString()}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {issue.location?.kebele || issue.location?.address || 'Unknown location'}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                                            <button
                                                onClick={() => handleApprove(proofId)}
                                                disabled={actionLoading === proofId}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-success/10 text-success hover:bg-success/20 border border-success/20 text-sm font-medium transition-all disabled:opacity-50 shadow-lg shadow-success/10"
                                            >
                                                {actionLoading === proofId ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                )}
                                                Approve & Resolve
                                            </button>
                                            <button
                                                onClick={() => { setRejectModalProofId(proofId); setRejectReason(''); }}
                                                disabled={actionLoading === proofId}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20 text-sm font-medium transition-all disabled:opacity-50"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Reject & Rework
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Reject Reason Modal */}
            {rejectModalProofId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card w-full max-w-md p-6 mx-4 animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Rejection Reason</h3>
                            <button
                                onClick={() => setRejectModalProofId(null)}
                                className="p-1 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-sm text-surface-400 mb-4">
                            Provide a reason for rejecting this proof. The technician will need to rework the issue.
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={3}
                            className="w-full bg-surface-900 border border-white/5 rounded-xl py-3 px-4 text-sm text-white placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors resize-none"
                            placeholder="e.g., Photo does not show the completed repair..."
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setRejectModalProofId(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-surface-800 text-surface-300 hover:text-white hover:bg-surface-700 transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading === rejectModalProofId}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-danger text-white hover:bg-danger/90 transition-all text-sm font-medium disabled:opacity-50"
                            >
                                {actionLoading === rejectModalProofId ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Reject Proof'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
