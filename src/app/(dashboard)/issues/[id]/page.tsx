'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { io } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { IssueReport, User, IssueComment, IssueFeedback, Assignment, CompletionProof } from '@/types';
import api from '@/lib/api';
import { ChevronLeft, MapPin, User as UserIcon, Calendar, Clock, Image as ImageIcon, CheckCircle2, AlertTriangle, Loader2, MessageSquare, Send, Star, Wrench, X, Shield } from 'lucide-react';
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
    const [feedback, setFeedback] = useState<IssueFeedback | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [postingComment, setPostingComment] = useState(false);

    // Assignment state
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [technicians, setTechnicians] = useState<User[]>([]);
    const [assignForm, setAssignForm] = useState({ technicianId: '', priority: 'Medium', deadline: '', notes: '' });
    const [assigning, setAssigning] = useState(false);
    const [assignmentData, setAssignmentData] = useState<Assignment | null>(null);

    useEffect(() => {
        api.get<{ issue: IssueReport, comments: IssueComment[], feedback?: IssueFeedback }>(`/issues/${id}`)
            .then(res => {
                setIssue(res.data.issue);
                setComments(res.data.comments || []);
                setFeedback(res.data.feedback || null);
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

        // Fetch technicians for assignment
        api.get<User[]>('/admin/technicians').then(res => setTechnicians(res.data)).catch(() => {});

        // Setup Socket.IO connection only if backend is explicitly configured
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) return;
        const socket = io(apiUrl);

        socket.on('vote_updated', (data) => {
            if (data.issueId === id) {
                setIssue(prev => prev ? { ...prev, urgencyCount: data.urgencyCount } : prev);
            }
        });

        socket.on('issue_status_changed', (data) => {
            if (data.issueId === id) {
                setIssue(prev => prev ? { ...prev, status: data.status } : prev);
            }
        });

        socket.on('new_comment', (data) => {
            if (data.issueId === id) {
                setComments(prev => {
                    const cId = data.comment.id ?? data.comment._id;
                    if (prev.some(c => (c.id ?? c._id) === cId)) return prev;
                    return [...prev, data.comment];
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [id]);

    const updateStatus = async (newStatus: string) => {
        if (!issue) return;
        setUpdating(true);
        try {
            await api.put(`/admin/issues/${id}/status`, { status: newStatus });
            setIssue({ ...issue, status: newStatus as any });
        } catch (error) {
            console.error('Update failed:', error);
            setIssue({ ...issue, status: newStatus as any });
        } finally {
            setUpdating(false);
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignForm.technicianId) return;
        setAssigning(true);
        try {
            const res = await api.post(`/admin/issues/${id}/assign`, {
                technicianId: assignForm.technicianId,
                priority: assignForm.priority,
                deadline: assignForm.deadline || null,
                notes: assignForm.notes || null,
            });
            setAssignmentData(res.data.assignment);
            setIssue(prev => prev ? { ...prev, status: 'Assigned' } : prev);
            setShowAssignModal(false);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to assign technician.');
        } finally {
            setAssigning(false);
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

    const citizen = (issue.citizen ?? issue.citizenId) as User;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-800 transition-colors group w-max"
            >
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Issues
            </button>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold text-surface-900 tracking-tight">Report #{String(issue.id ?? issue._id ?? '').slice(-6)}</h2>
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-600 border border-brand-100">
                            {issue.category}
                        </span>
                        {issue.subcategory && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-surface-100 text-surface-700 border border-surface-200">
                                {issue.subcategory}
                            </span>
                        )}
                    </div>
                    <p className="flex items-center gap-2 text-surface-500 text-sm">
                        <Calendar className="h-4 w-4" />
                        Reported on {new Date(issue.createdAt).toLocaleDateString()} at {new Date(issue.createdAt).toLocaleTimeString()}
                    </p>
                </div>

                {/* Status Actions (Visible to Sector Admin assigned ONLY) */}
                {user?.role !== 'SUPER_ADMIN' && (
                    <div className="bg-white border border-surface-200 rounded-xl shadow-sm p-4 sm:p-2 sm:px-4 flex sm:flex-row flex-col items-center gap-4 border-brand-100 bg-brand-500/5">
                        {updating ? (
                            <div className="px-4 py-2 flex items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 flex-wrap">
                                {issue.status === 'Pending' && (
                                    <button
                                        onClick={() => updateStatus('Approved')}
                                        className="px-4 py-2 text-sm font-medium rounded-lg bg-success/20 text-success border border-success/30 hover:bg-success/30 transition-all"
                                    >
                                        ✓ Approve Report
                                    </button>
                                )}
                                {['Pending', 'Approved'].includes(issue.status) && (
                                    <button
                                        onClick={() => setShowAssignModal(true)}
                                        className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-surface-900 hover:bg-brand-500 transition-all flex items-center gap-2 shadow-sm"
                                    >
                                        <Wrench className="h-4 w-4" />
                                        Assign Technician
                                    </button>
                                )}
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    {
                                        'Pending': 'bg-warning/10 text-warning border border-warning/20',
                                        'Approved': 'bg-info/10 text-info border border-info/20',
                                        'Assigned': 'bg-brand-50 text-brand-600 border border-brand-100',
                                        'In Progress': 'bg-info/10 text-info border border-info/20',
                                        'Waiting Confirmation': 'bg-warning/10 text-warning border border-warning/20',
                                        'Resolved': 'bg-success/10 text-success border border-success/20',
                                        'Rejected': 'bg-danger/10 text-danger border border-danger/20',
                                    }[issue.status] || 'bg-surface-100 text-surface-500'
                                }`}>
                                    {issue.status}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details & Photo */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-surface-200 rounded-xl shadow-sm p-6 md:p-8">
                        <h3 className="text-lg font-semibold text-surface-900 mb-4 border-b border-surface-200 pb-4">Description</h3>
                        <p className="text-surface-700 text-lg leading-relaxed">{issue.description}</p>
                    </div>

                    <div className="bg-white border border-surface-200 rounded-xl shadow-sm p-6 md:p-8 overflow-hidden">
                        <h3 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2 border-b border-surface-200 pb-4">
                            <ImageIcon className="h-5 w-5 text-brand-600" />
                            Photo Evidence
                        </h3>
                        {issue.photoUrl ? (
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-surface-200 group">
                                <Image src={issue.photoUrl} alt="Issue Evidence" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                            </div>
                        ) : (
                            <div className="w-full aspect-video rounded-xl bg-white border-2 border-dashed border-surface-200 flex flex-col items-center justify-center text-surface-500">
                                <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                                <p>No photo provided by citizen</p>
                            </div>
                        )}
                    </div>

                    {/* Comments Section */}
                    <div className="bg-white border border-surface-200 rounded-xl shadow-sm p-6 md:p-8">
                        <h3 className="text-lg font-semibold text-surface-900 mb-6 flex items-center gap-2 border-b border-surface-200 pb-4">
                            <MessageSquare className="h-5 w-5 text-brand-600" />
                            Updates & Comments
                        </h3>

                        <div className="space-y-6 mb-6">
                            {comments.length === 0 ? (
                                <p className="text-surface-500 text-sm italic">No comments or updates yet.</p>
                            ) : (
                                comments.map(comment => {
                                    const cId = comment.id ?? comment._id;
                                    const author = (comment as any).author ?? comment.authorId as any;
                                    return (
                                    <div key={cId} className="bg-surface-50 p-4 rounded-xl border border-surface-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-600">
                                                    {author?.fullName?.charAt(0) ?? '?'}
                                                </div>
                                                <span className="font-medium text-surface-900 text-sm">
                                                    {author?.fullName ?? 'Unknown'}
                                                </span>
                                                {author?.role && author.role !== 'CITIZEN' && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-50 text-brand-600 border border-brand-100">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-surface-500">
                                                {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-surface-700 text-sm whitespace-pre-wrap">{comment.text}</p>
                                    </div>
                                    );
                                })
                            )}
                        </div>

                        <form onSubmit={handlePostComment} className="flex gap-3">
                            <input
                                type="text"
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Add an update or comment..."
                                className="flex-1 bg-white border border-surface-200 rounded-xl py-2 px-4 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={postingComment || !newComment.trim()}
                                className="flex items-center justify-center px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-surface-900 rounded-xl transition-all shadow-sm"
                            >
                                {postingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column - Map, Reporter, Votes */}
                <div className="space-y-6">
                    {/* Map */}
                    <div className="bg-white border border-surface-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[300px]">
                        <div className="p-4 border-b border-surface-200 flex items-center gap-2 bg-surface-50">
                            <MapPin className="h-5 w-5 text-brand-600" />
                            <h3 className="font-semibold text-surface-900">Location</h3>
                        </div>
                        <div className="flex-1 relative bg-surface-100">
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
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-surface-500 p-4 text-center border-2 border-dashed border-surface-200 m-4 rounded-xl">
                                    <MapPin className="h-8 w-8 mb-2 opacity-50 text-brand-500" />
                                    <p className="text-sm font-medium text-surface-900 mb-1">Map View Unavailable</p>
                                    <p className="text-xs">Location coordinates not provided</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-surface-50 border-t border-surface-200">
                            <p className="text-sm font-medium text-surface-900 line-clamp-2">{issue.location?.address || issue.location?.kebele || 'Unknown location'}</p>
                        </div>
                    </div>

                    {/* Citizen Info */}
                    <div className="bg-white border border-surface-200 rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2 border-b border-surface-200 pb-4">
                            <UserIcon className="h-5 w-5 text-brand-600" />
                            Reporter Details
                        </h3>
                        {citizen ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-surface-500 uppercase tracking-wider font-semibold mb-1">Full Name</p>
                                    <p className="text-sm font-medium text-surface-900">{citizen.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-surface-500 uppercase tracking-wider font-semibold mb-1">Contact Details</p>
                                    <p className="text-sm text-surface-700">{citizen.email}</p>
                                    {citizen.phoneNumber && <p className="text-sm text-surface-700 mt-1">{citizen.phoneNumber}</p>}
                                </div>
                            </div>
                        ) : (
                            <p className="text-surface-500 text-sm italic">Anonymous</p>
                        )}
                    </div>

                    {/* Assignment Details */}
                    {(assignmentData || issue.assignment) && (
                        <div className="bg-white border border-surface-200 rounded-xl shadow-sm p-6 border-brand-100">
                            <h3 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2 border-b border-surface-200 pb-4">
                                <Wrench className="h-5 w-5 text-brand-600" />
                                Assigned Technician
                            </h3>
                            {(() => {
                                const a = assignmentData || issue.assignment;
                                const tech = a?.technician as User | undefined;
                                return (
                                    <div className="space-y-3">
                                        {tech && (
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center text-sm font-bold text-surface-900 border border-brand-200">
                                                    {tech.fullName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-surface-900">{tech.fullName}</p>
                                                    {tech.specialization && Array.isArray(tech.specialization) && tech.specialization.length > 0 && <p className="text-xs text-brand-700">{tech.specialization.join(', ')}</p>}
                                                </div>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-xs text-surface-500 uppercase font-semibold">Priority</p>
                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${
                                                    { Low: 'bg-surface-100 text-surface-600', Medium: 'bg-info/10 text-info', High: 'bg-warning/10 text-warning', Urgent: 'bg-danger/10 text-danger' }[a?.priority || 'Medium']
                                                }`}>{a?.priority}</span>
                                            </div>
                                            {a?.deadline && (
                                                <div>
                                                    <p className="text-xs text-surface-500 uppercase font-semibold">Deadline</p>
                                                    <p className="text-xs text-surface-700 mt-1">{new Date(a.deadline).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                        </div>
                                        {a?.notes && <p className="text-xs text-surface-600 bg-surface-50 p-2 rounded-lg border border-surface-200">{a.notes}</p>}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Urgency Votes */}
                    <div className="bg-white border border-surface-200 rounded-xl shadow-sm p-6 relative overflow-hidden group">
                        {/* Background gradient flare */}
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-100 rounded-full blur-2xl group-hover:bg-brand-500/30 transition-colors" />

                        <h3 className="text-lg font-semibold text-surface-900 mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-brand-600" />
                            Community Urgency
                        </h3>
                        <p className="text-surface-500 text-xs mb-4">Number of citizens who voted this as a priority.</p>

                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-white border border-brand-200 flex items-center justify-center  group-hover:scale-105 transition-transform duration-300">
                                <span className="text-2xl font-black text-brand-600">{issue.urgencyCount}</span>
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-surface-700">Votes</span>
                                <p className="text-xs text-brand-700 mt-1">High Priority Indicator</p>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Section (Visible if resolved and feedback exists) */}
                    {feedback && (
                        <div className="bg-white border border-surface-200 rounded-xl shadow-sm p-6 border-brand-100 ">
                            <h3 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2 border-b border-surface-200 pb-4">
                                <Star className="h-5 w-5 text-warning" />
                                Citizen Feedback
                            </h3>
                            <div className="flex items-center gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-5 w-5 ${star <= feedback.rating ? 'text-warning fill-warning' : 'text-surface-600'}`}
                                    />
                                ))}
                            </div>
                            {feedback.comment ? (
                                <p className="text-sm text-surface-700 mt-2 italic bg-surface-50 p-3 rounded-xl border border-surface-200">
                                    &quot;{feedback.comment}&quot;
                                </p>
                            ) : (
                                <p className="text-xs text-surface-500 mt-2">No written review provided.</p>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Assign Technician Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white border border-surface-200 rounded-xl shadow-sm w-full max-w-md p-6 mx-4 animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-surface-900">Assign Technician</h3>
                            <button onClick={() => setShowAssignModal(false)} className="p-1 rounded-lg text-surface-500 hover:text-surface-800 hover:bg-surface-100 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAssign} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Technician *</label>
                                <select
                                    title="Select Technician"
                                    value={assignForm.technicianId}
                                    onChange={(e) => setAssignForm({ ...assignForm, technicianId: e.target.value })}
                                    required
                                    className="w-full bg-white border border-surface-200 rounded-xl py-2 px-4 text-sm text-surface-900 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                                >
                                    <option value="">Select a technician...</option>
                                    {technicians
                                        .filter(t => {
                                            if (t.isDisabled) return false;
                                            if (t.department && t.department !== issue?.category) return false;
                                            
                                            // Only show technicians whose specialization explicitly includes the issue's subcategory
                                            if (issue?.subcategory) {
                                                const specs = Array.isArray(t.specialization) ? t.specialization : [];
                                                if (!specs.includes(issue.subcategory)) return false;
                                            }
                                            
                                            return true;
                                        })
                                        .sort((a, b) => {
                                            // Alphabetical sort since all displayed technicians are now exact matches
                                            return a.fullName.localeCompare(b.fullName);
                                        })
                                        .map(t => {
                                            const specs = Array.isArray(t.specialization) ? t.specialization : [];
                                            return (
                                                <option key={t.id || t._id} value={t.id || t._id}>
                                                    {t.fullName}{specs.length > 0 ? ` — ${specs.join(', ')}` : ''}
                                                </option>
                                            );
                                        })
                                    }
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Priority</label>
                                <select
                                    title="Select Priority"
                                    value={assignForm.priority}
                                    onChange={(e) => setAssignForm({ ...assignForm, priority: e.target.value })}
                                    className="w-full bg-white border border-surface-200 rounded-xl py-2 px-4 text-sm text-surface-900 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Deadline</label>
                                <input
                                    type="date"
                                    value={assignForm.deadline}
                                    onChange={(e) => setAssignForm({ ...assignForm, deadline: e.target.value })}
                                    className="w-full bg-white border border-surface-200 rounded-xl py-2 px-4 text-sm text-surface-900 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Notes</label>
                                <textarea
                                    value={assignForm.notes}
                                    onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                                    rows={2}
                                    className="w-full bg-white border border-surface-200 rounded-xl py-2 px-4 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors resize-none"
                                    placeholder="Additional instructions..."
                                />
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-surface-100 text-surface-600 hover:text-surface-800 hover:bg-surface-100 transition-colors text-sm font-medium">Cancel</button>
                                <button type="submit" disabled={assigning} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-surface-900 transition-all text-sm font-medium shadow-sm disabled:opacity-50">
                                    {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
