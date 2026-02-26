import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={twMerge(clsx("animate-pulse rounded-xl bg-surface-800/80", className))}
            {...props}
        />
    );
}
