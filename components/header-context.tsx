'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HeaderContextType {
    headerContent: ReactNode | null;
    setHeaderContent: (content: ReactNode | null) => void;
    // Option to hide default logo/links if needed
    showDefaultNav: boolean;
    setShowDefaultNav: (show: boolean) => void;
    // Toggle for material page header (maximize content view)
    showMaterialHeader: boolean;
    setShowMaterialHeader: (show: boolean) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
    const [headerContent, setHeaderContent] = useState<ReactNode | null>(null);
    const [showDefaultNav, setShowDefaultNav] = useState(true);
    const [showMaterialHeader, setShowMaterialHeader] = useState(true);

    return (
        <HeaderContext.Provider value={{ headerContent, setHeaderContent, showDefaultNav, setShowDefaultNav, showMaterialHeader, setShowMaterialHeader }}>
            {children}
        </HeaderContext.Provider>
    );
}

export function useHeader() {
    const context = useContext(HeaderContext);
    if (context === undefined) {
        throw new Error('useHeader must be used within a HeaderProvider');
    }
    return context;
}
