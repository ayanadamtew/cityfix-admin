'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { io } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { IssueReport } from '@/types';
import api from '@/lib/api';
import { MapPin, Eye, Search, Filter, AlertTriangle, CheckCircle2, Clock, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function IssuesPage() {
    const { user } = useAuth();
    const [issues, setIssues] = useState<IssueReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [sortConfig, setSortConfig] = useState<{ key: keyof IssueReport; direction: 'asc' | 'desc' }>({
        key: 'urgencyCount',
        direction: 'desc'
    });

    useEffect(() => {
        api.get<IssueReport[]>('/admin/issues')
            .then(res => {
                setIssues(res.data);
            })
            .catch(err => {
                console.error('Failed to fetch issues:', err);
                setIssues([
                    {
                        _id: 'sample-doc-1',
                        category: 'Road',
                        description: 'Large pothole on main street causing traffic delays.',
                        status: 'Pending',
                        urgencyCount: 15,
                        location: { address: 'Main Street, Block A', kebele: 'Kirkos' },
                        citizenId: { _id: 'c1', firebaseUid: '', fullName: 'Abebe Girma', email: 'abebe@example.com', role: 'CITIZEN', createdAt: '', updatedAt: '' },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        _id: 'sample-doc-2',
                        category: 'Water',
                        description: 'Pipe burst, water flowing into the street for 2 hours.',
                        status: 'In Progress',
                        urgencyCount: 32,
                        location: { address: 'Bole Road', kebele: 'Bole' },
                        citizenId: { _id: 'c2', firebaseUid: '', fullName: 'Hanna Kebede', email: 'hanna@example.com', role: 'CITIZEN', createdAt: '', updatedAt: '' },
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ]);
            })
            .finally(() => setLoading(false));

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) return;
        const socket = io(apiUrl);

        socket.on('new_issue', (issue: IssueReport) => {
            if (user?.role === 'SUPER_ADMIN' || issue.category === user?.department) {
                setIssues(prev => [issue, ...prev]);
            }
        });

        socket.on('vote_updated', ({ issueId, urgencyCount }) => {
            setIssues(prev => prev.map(i =>
                (i.id ?? i._id) === issueId ? { ...i, urgencyCount } : i
            ));
        });

        socket.on('issue_status_changed', ({ issueId, status }) => {
            setIssues(prev => prev.map(i =>
                (i.id ?? i._id) === issueId ? { ...i, status } : i
            ));
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    const StatusBadge = ({ status }: { status: string }) => {
        const config = {
            'Pending': { color: 'text-amber-700 bg-amber-50 border-amber-200', icon: AlertTriangle },
            'Approved': { color: 'text-sky-700 bg-sky-50 border-sky-200', icon: CheckCircle2 },
            'Assigned': { color: 'text-blue-700 bg-blue-50 border-blue-200', icon: Clock },
            'In Progress': { color: 'text-sky-700 bg-sky-50 border-sky-200', icon: Clock },
            'Waiting Confirmation': { color: 'text-amber-700 bg-amber-50 border-amber-200', icon: Clock },
            'Resolved': { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
            'Rejected': { color: 'text-red-700 bg-red-50 border-red-200', icon: AlertTriangle }
        }[status] || { color: 'text-surface-600 bg-surface-100 border-surface-200', icon: CheckCircle2 };

        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                <Icon className="h-3.5 w-3.5" />
                {status}
            </span>
        );
    };

    const sortedIssues = [...issues]
        .filter(issue => {
            const matchesSearch = issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                issue.location?.kebele?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            const valA = a[sortConfig.key] ?? '';
            const valB = b[sortConfig.key] ?? '';
            if (valA < valB) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

    const requestSort = (key: keyof IssueReport) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ columnKey }: { columnKey: keyof IssueReport }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="h-3.5 w-3.5 opacity-30" />;
        return sortConfig.direction === 'asc'
            ? <ChevronUp className="h-4 w-4 text-brand-600" />
            : <ChevronDown className="h-4 w-4 text-brand-600" />;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-surface-900 tracking-tight">Active Issues</h2>
                    <p className="text-surface-500 text-sm mt-1">
                        {user?.role === 'SUPER_ADMIN'
                            ? 'Monitoring all city department reports.'
                            : `Managing reports for the ${user?.department} sector.`}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="h-4 w-4 text-surface-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-56 bg-white border border-surface-300 rounded-lg py-2 pl-9 pr-4 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <select
                            title="Filter by Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none bg-white border border-surface-300 rounded-lg py-2 pl-4 pr-10 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors cursor-pointer"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Assigned">Assigned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Waiting Confirmation">Waiting Confirmation</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-surface-200 rounded-xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-6 space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : sortedIssues.length === 0 ? (
                    <EmptyState
                        icon={MapPin}
                        title="No Issues Found"
                        description={searchTerm || statusFilter !== 'All' ? "Try adjusting your search filters." : "There are currently no issues assigned to your sector."}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-surface-50 text-surface-500 border-b border-surface-200">
                                <tr>
                                    <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Subcategory</th>
                                    <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Status</th>
                                    <th
                                        className="px-6 py-3 font-semibold text-xs uppercase tracking-wider cursor-pointer hover:text-surface-900 transition-colors"
                                        onClick={() => requestSort('urgencyCount')}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            Votes
                                            <SortIcon columnKey="urgencyCount" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {sortedIssues.map((issue) => {
                                    const issueId = issue.id ?? issue._id ?? '';
                                    return (
                                    <tr key={issueId} className="hover:bg-surface-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-surface-500 text-xs">#{String(issueId).slice(-6)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-surface-900 font-medium">{issue.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {issue.subcategory ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100">
                                                    {issue.subcategory}
                                                </span>
                                            ) : (
                                                <span className="text-surface-400 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px] truncate text-surface-600">
                                            {issue.description}
                                        </td>
                                        <td className="px-6 py-4 text-surface-600">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-3.5 w-3.5 text-surface-400" />
                                                {issue.location?.kebele || issue.location?.address || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={issue.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-surface-900 font-bold">{issue.urgencyCount}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/issues/${issueId}`}
                                                className="inline-flex items-center justify-center p-2 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
