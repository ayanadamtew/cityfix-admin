'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        // Read persisted preference on mount
        const stored = localStorage.getItem('cityfix-theme') as Theme | null;
        const initial = stored ?? 'dark';
        setTheme(initial);
        applyTheme(initial);
    }, []);

    const applyTheme = (t: Theme) => {
        const root = document.documentElement;
        if (t === 'light') {
            root.classList.add('light');
            root.classList.remove('dark');
        } else {
            root.classList.add('dark');
            root.classList.remove('light');
        }
    };

    const toggleTheme = () => {
        setTheme(prev => {
            const next = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('cityfix-theme', next);
            applyTheme(next);
            return next;
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
