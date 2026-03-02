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
        // The endpoint `/api/admin/issues` already filters by role backend-side.
        api.get<IssueReport[]>('/admin/issues')
            .then(res => {
                setIssues(res.data);
            })
            .catch(err => {
                console.error('Failed to fetch issues:', err);
                // Fallback mock data when backend is not connected
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

        // Setup Socket.IO connection
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

        socket.on('new_issue', (issue: IssueReport) => {
            // Only add to table if Super Admin or if it matches the Sector Admin's department
            if (user?.role === 'SUPER_ADMIN' || issue.category === user?.department) {
                setIssues(prev => [issue, ...prev]);
            }
        });

        socket.on('vote_updated', ({ issueId, urgencyCount }) => {
            setIssues(prev => prev.map(i =>
                i._id === issueId ? { ...i, urgencyCount } : i
            ));
        });

        socket.on('issue_status_changed', ({ issueId, status }) => {
            setIssues(prev => prev.map(i =>
                i._id === issueId ? { ...i, status } : i
            ));
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    const StatusBadge = ({ status }: { status: string }) => {
        const config = {
            'Pending': { color: 'text-warning bg-warning/10 border-warning/20', icon: AlertTriangle },
            'In Progress': { color: 'text-info bg-info/10 border-info/20', icon: Clock },
            'Resolved': { color: 'text-success bg-success/10 border-success/20', icon: CheckCircle2 }
        }[status] || { color: 'text-surface-400 bg-surface-800 border-white/5', icon: CheckCircle2 };

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
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
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
            ? <ChevronUp className="h-4 w-4 text-brand-500" />
            : <ChevronDown className="h-4 w-4 text-brand-500" />;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Active Issues</h2>
                    <p className="text-surface-400 text-sm">
                        {user?.role === 'SUPER_ADMIN'
                            ? 'Monitoring all city department reports.'
                            : `Managing reports for the ${user?.department} sector.`}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="h-4 w-4 text-surface-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by description or area..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 bg-surface-900 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-surface-400 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <select
                            title="Filter by Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none bg-surface-900 border border-white/5 rounded-xl py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors cursor-pointer"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
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
                            <thead className="bg-surface-900/50 text-surface-400 border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Issue ID</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Category</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Description</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Location</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                                    <th
                                        className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:text-white transition-colors group"
                                        onClick={() => requestSort('urgencyCount')}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            Votes
                                            <SortIcon columnKey="urgencyCount" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sortedIssues.map((issue) => (
                                    <tr key={issue._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-surface-300">#{issue._id.substring(issue._id.length - 6)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white font-medium">{issue.category}</span>
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px] truncate text-surface-200">
                                            {issue.description}
                                        </td>
                                        <td className="px-6 py-4 text-surface-300">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-3.5 w-3.5 text-surface-400" />
                                                {issue.location?.kebele || issue.location?.address || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={issue.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                                                <span className="text-brand-300 font-bold">{issue.urgencyCount}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/issues/${issue._id}`}
                                                className="inline-flex items-center justify-center p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
