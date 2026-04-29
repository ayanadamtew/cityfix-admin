export type Role = 'CITIZEN' | 'SECTOR_ADMIN' | 'SUPER_ADMIN' | 'TECHNICIAN';
export type Department = 'Water' | 'Waste' | 'Road' | 'Electricity';
export type IssueStatus = 'Pending' | 'Approved' | 'Assigned' | 'In Progress' | 'Waiting Verification' | 'Resolved' | 'Rejected';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type AssignmentStatus = 'Assigned' | 'In Progress' | 'Waiting Verification' | 'Resolved' | 'Rejected';

export interface User {
    id?: string;
    _id?: string;
    firebaseUid: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    role: Role;
    department?: Department;
    specialization?: string;
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
    id?: string;
    _id?: string;
    citizenId?: User | string;
    citizen?: User | string;
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
    assignment?: Assignment;
}

export interface Assignment {
    id?: string;
    _id?: string;
    issueId: string;
    technicianId: string;
    assignedById: string;
    technician?: User;
    assignedBy?: User;
    issue?: IssueReport;
    priority: Priority;
    deadline?: string | null;
    notes?: string | null;
    status: AssignmentStatus;
    proofs?: CompletionProof[];
    createdAt: string;
    updatedAt: string;
}

export interface CompletionProof {
    id?: string;
    _id?: string;
    assignmentId: string;
    technicianId: string;
    technician?: User;
    verifiedBy?: User;
    beforePhotoUrl?: string | null;
    afterPhotoUrl: string;
    notes?: string | null;
    submittedAt: string;
    verifiedAt?: string | null;
    verifiedById?: string | null;
    verificationStatus: 'Pending' | 'Approved' | 'Rejected';
    rejectionReason?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AnalyticsData {
    totalIssues: number;
    byStatus: Record<IssueStatus, number>;
    byCategory: Record<Department, number>;
    avgResolutionTimeDays: number;
    avgFeedbackRating: number;
    technicianStats?: {
        totalTechnicians: number;
        activeTechnicians: number;
        totalAssignments: number;
        completedAssignments: number;
    };
    locations: Array<{
        id?: string;
        _id?: string;
        category: Department;
        status: IssueStatus;
        urgencyCount: number;
        location: IssueLocation;
        createdAt: string;
    }>;
}

export interface IssueComment {
    id?: string;
    _id?: string;
    issueId: string;
    authorId?: User;
    author?: User;
    text: string;
    createdAt: string;
}

export interface IssueFeedback {
    id?: string;
    _id?: string;
    issueId: string;
    citizenId: User;
    rating: number;
    comment?: string;
    createdAt: string;
}
