'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import { User, Role } from '@/types';

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    logout: () => Promise<void>;
    hasRole: (allowedRoles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    firebaseUser: null,
    loading: true,
    logout: async () => { },
    hasRole: () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
            setFirebaseUser(currUser);
            if (currUser) {
                try {
                    // Fetch user profile from the backend to get Role and Department
                    // Explicitly grab the token here to avoid relying solely on the interceptor race condition
                    const token = await currUser.getIdToken(true);
                    const response = await api.get('/users/me', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setUser(response.data);
                } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await auth.signOut();
        setUser(null);
        setFirebaseUser(null);
    };

    const hasRole = (allowedRoles: Role[]) => {
        if (!user) return false;
        return allowedRoles.includes(user.role);
    };

    return (
        <AuthContext.Provider value={{ user, firebaseUser, loading, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
