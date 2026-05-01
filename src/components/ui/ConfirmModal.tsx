import React from 'react';
import { X, Loader2, AlertTriangle, ShieldAlert, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    isDanger?: boolean;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isLoading = false,
    isDanger = false,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-surface-200 rounded-xl shadow-xl w-full max-w-sm p-6 mx-4 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                        {isDanger ? <AlertTriangle className="h-5 w-5 text-danger" /> : <AlertCircle className="h-5 w-5 text-brand-600" />}
                        {title}
                    </h3>
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="p-1 rounded-lg text-surface-400 hover:text-surface-900 hover:bg-surface-100 transition-colors disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="text-sm text-surface-600 mb-6 leading-relaxed">
                    {message}
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 rounded-lg bg-white text-surface-700 hover:bg-surface-50 border border-surface-300 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition-colors text-sm font-medium shadow-sm disabled:opacity-50 ${
                            isDanger 
                                ? 'bg-danger hover:bg-danger/90' 
                                : 'bg-brand-600 hover:bg-brand-700'
                        }`}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
