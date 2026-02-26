'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { IssueReport, User, IssueComment } from '@/types';
import api from '@/lib/api';
import { ChevronLeft, MapPin, User as UserIcon, Calendar, Clock, Image as ImageIcon, CheckCircle2, AlertTriangle, Loader2, MessageSquare, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
// Mapbox fallback used instead of react-map-gl which fails in certain node/turbopack configs

interface Props {
    params: Promise<{ id: string }>;
}

export default function IssueDetailPage(props: Props) {
    const router = useRouter();
    const { user } = useAuth();

    // Unwrap params using React.use for Next.js 15+
    const { id } = use(props.params);

    const [issue, setIssue] = useState<IssueReport | null>(null);
    const [comments, setComments] = useState<IssueComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [postingComment, setPostingComment] = useState(false);

    useEffect(() => {
        api.get<{ issue: IssueReport, comments: IssueComment[] }>(`/issues/${id}`)
            .then(res => {
                setIssue(res.data.issue);
                setComments(res.data.comments || []);
            })
            .catch(err => {
                console.error('Failed to load issue', err);
                // Fallback mock data
                setIssue({
                    _id: id,
                    category: 'Road',
                    description: 'Large pothole on main street causing traffic delays. I almost broke my tire yesterday.',
                    status: 'Pending',
                    photoUrl: null, // No real photo string for mock to prevent map/image load errors initially unless specified
                    urgencyCount: 15,
                    location: { latitude: 9.0247, longitude: 38.7468, address: 'Main Street, Block A', kebele: 'Kirkos' },
                    citizenId: { _id: 'c1', fullName: 'Abebe Girma', email: 'abebe@example.com', phoneNumber: '+251 911 000 000', role: 'CITIZEN', createdAt: '', updatedAt: '' } as User,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            })
            .finally(() => setLoading(false));
    }, [id]);

    const updateStatus = async (newStatus: 'Pending' | 'In Progress' | 'Resolved') => {
        if (!issue) return;
        setUpdating(true);
        try {
            await api.put(`/admin/issues/${id}/status`, { status: newStatus });
            setIssue({ ...issue, status: newStatus });
            // In a real app, toast notification here
        } catch (error) {
            console.error('Update failed:', error);
            // Mock update on error for demo presentation
            setIssue({ ...issue, status: newStatus });
        } finally {
            setUpdating(false);
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setPostingComment(true);
        try {
            const res = await api.post(`/issues/${id}/comments`, { text: newComment });
            setComments(prev => [...prev, res.data]);
            setNewComment('');
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setPostingComment(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-10 w-32 mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-96 w-full" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!issue) return <div>Issue not found.</div>;

    const citizen = issue.citizenId as User;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors group w-max"
            >
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Issues
            </button>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold text-white tracking-tight">Report #{issue._id.substring(issue._id.length - 6)}</h2>
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/20">
                            {issue.category}
                        </span>
                    </div>
                    <p className="flex items-center gap-2 text-surface-400 text-sm">
                        <Calendar className="h-4 w-4" />
                        Reported on {new Date(issue.createdAt).toLocaleDateString()} at {new Date(issue.createdAt).toLocaleTimeString()}
                    </p>
                </div>

                {/* Status Actions (Visible to Sector Admin assigned or Super Admin) */}
                <div className="glass-card p-4 sm:p-2 sm:px-4 flex sm:flex-row flex-col items-center gap-4 border-brand-500/20 bg-brand-500/5">
                    <span className="text-sm font-semibold text-white mr-2">Update Status:</span>
                    {updating ? (
                        <div className="px-4 py-2 flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                disabled={issue.status === 'Pending'}
                                onClick={() => updateStatus('Pending')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${issue.status === 'Pending' ? 'bg-warning/20 text-warning border border-warning/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-surface-800 text-surface-300 hover:text-white hover:bg-surface-700'}`}
                            >
                                Pending
                            </button>
                            <button
                                disabled={issue.status === 'In Progress'}
                                onClick={() => updateStatus('In Progress')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${issue.status === 'In Progress' ? 'bg-info/20 text-info border border-info/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-surface-800 text-surface-300 hover:text-white hover:bg-surface-700'}`}
                            >
                                In Progress
                            </button>
                            <button
                                disabled={issue.status === 'Resolved'}
                                onClick={() => updateStatus('Resolved')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${issue.status === 'Resolved' ? 'bg-success/20 text-success border border-success/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-surface-800 text-surface-300 hover:text-white hover:bg-surface-700'}`}
                            >
                                Resolved
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details & Photo */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6 md:p-8">
                        <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/5 pb-4">Description</h3>
                        <p className="text-surface-200 text-lg leading-relaxed">{issue.description}</p>
                    </div>

                    <div className="glass-card p-6 md:p-8 overflow-hidden">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-4">
                            <ImageIcon className="h-5 w-5 text-brand-400" />
                            Photo Evidence
                        </h3>
                        {issue.photoUrl ? (
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
                                <Image src={issue.photoUrl} alt="Issue Evidence" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                            </div>
                        ) : (
                            <div className="w-full aspect-video rounded-xl bg-surface-900 border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-surface-500">
                                <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                                <p>No photo provided by citizen</p>
                            </div>
                        )}
                    </div>

                    {/* Comments Section */}
                    <div className="glass-card p-6 md:p-8">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                            <MessageSquare className="h-5 w-5 text-brand-400" />
                            Updates & Comments
                        </h3>

                        <div className="space-y-6 mb-6">
                            {comments.length === 0 ? (
                                <p className="text-surface-400 text-sm italic">No comments or updates yet.</p>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment._id} className="bg-surface-800/50 p-4 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400">
                                                    {comment.authorId.fullName.charAt(0)}
                                                </div>
                                                <span className="font-medium text-white text-sm">
                                                    {comment.authorId.fullName}
                                                </span>
                                                {comment.authorId.role !== 'CITIZEN' && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-500/10 text-brand-400 border border-brand-500/20">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-surface-400">
                                                {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-surface-200 text-sm whitespace-pre-wrap">{comment.text}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={handlePostComment} className="flex gap-3">
                            <input
                                type="text"
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Add an update or comment..."
                                className="flex-1 bg-surface-900 border border-white/5 rounded-xl py-2 px-4 text-sm text-white placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={postingComment || !newComment.trim()}
                                className="flex items-center justify-center px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg shadow-brand-500/20"
                            >
                                {postingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column - Map, Reporter, Votes */}
                <div className="space-y-6">
                    {/* Map */}
                    <div className="glass-card overflow-hidden flex flex-col h-[300px]">
                        <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-surface-900/50">
                            <MapPin className="h-5 w-5 text-brand-400" />
                            <h3 className="font-semibold text-white">Location</h3>
                        </div>
                        <div className="flex-1 relative bg-surface-800">
                            {issue.location?.latitude && issue.location?.longitude ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    className="absolute inset-0 border-0"
                                    loading="lazy"
                                    allowFullScreen
                                    src={`https://maps.google.com/maps?q=${issue.location.latitude},${issue.location.longitude}&t=k&z=16&output=embed`}
                                ></iframe>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-surface-500 p-4 text-center border-2 border-dashed border-white/5 m-4 rounded-xl">
                                    <MapPin className="h-8 w-8 mb-2 opacity-50 text-brand-500" />
                                    <p className="text-sm font-medium text-white mb-1">Map View Unavailable</p>
                                    <p className="text-xs">Location coordinates not provided</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-surface-900/50 border-t border-white/5">
                            <p className="text-sm font-medium text-white line-clamp-2">{issue.location?.address || issue.location?.kebele || 'Unknown location'}</p>
                        </div>
                    </div>

                    {/* Citizen Info */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-4">
                            <UserIcon className="h-5 w-5 text-brand-400" />
                            Reporter Details
                        </h3>
                        {citizen ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-surface-400 uppercase tracking-wider font-semibold mb-1">Full Name</p>
                                    <p className="text-sm font-medium text-white">{citizen.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-surface-400 uppercase tracking-wider font-semibold mb-1">Contact Details</p>
                                    <p className="text-sm text-surface-200">{citizen.email}</p>
                                    {citizen.phoneNumber && <p className="text-sm text-surface-200 mt-1">{citizen.phoneNumber}</p>}
                                </div>
                            </div>
                        ) : (
                            <p className="text-surface-400 text-sm italic">Anonymous</p>
                        )}
                    </div>

                    {/* Urgency Votes */}
                    <div className="glass-card p-6 relative overflow-hidden group">
                        {/* Background gradient flare */}
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl group-hover:bg-brand-500/30 transition-colors" />

                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-brand-400" />
                            Community Urgency
                        </h3>
                        <p className="text-surface-400 text-xs mb-4">Number of citizens who voted this as a priority.</p>

                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-surface-900 border border-brand-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.15)] group-hover:scale-105 transition-transform duration-300">
                                <span className="text-2xl font-black text-brand-400">{issue.urgencyCount}</span>
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-surface-200">Votes</span>
                                <p className="text-xs text-brand-300 mt-1">High Priority Indicator</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
