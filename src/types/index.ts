export type Role = 'CITIZEN' | 'SECTOR_ADMIN' | 'SUPER_ADMIN';
export type Department = 'Water' | 'Waste' | 'Road' | 'Electricity';
export type IssueStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface User {
    _id: string;
    firebaseUid: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    role: Role;
    department?: Department;
    fcmToken?: string | null;
    isDisabled?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IssueLocation {
    latitude?: number;
    longitude?: number;
    address?: string;
    kebele?: string;
}

export interface IssueReport {
    _id: string;
    citizenId: User | string;
    assignedAdminId?: User | string;
    category: Department;
    description: string;
    photoUrl?: string | null;
    location: IssueLocation;
    status: IssueStatus;
    urgencyCount: number;
    draftedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AnalyticsData {
    totalIssues: number;
    byStatus: Record<IssueStatus, number>;
    byCategory: Record<Department, number>;
    avgResolutionTimeDays: number;
    avgFeedbackRating: number;
}

export interface IssueComment {
    _id: string;
    issueId: string;
    authorId: User;
    text: string;
    createdAt: string;
}

export interface IssueFeedback {
    _id: string;
    issueId: string;
    citizenId: User;
    rating: number;
    comment?: string;
    createdAt: string;
}
