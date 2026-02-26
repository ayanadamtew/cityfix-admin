import React from 'react';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={twMerge(clsx("flex flex-col items-center justify-center p-12 text-center glass-card border-dashed border-2 border-white/10", className))}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-800 shadow-inner mb-6">
                <Icon className="h-8 w-8 text-surface-400" />
            </div>
            <h3 className="text-xl font-semibold text-white tracking-tight mb-2">{title}</h3>
            <p className="max-w-sm text-sm text-surface-400 mb-6">{description}</p>
            {action && <div>{action}</div>}
        </div>
    );
}
