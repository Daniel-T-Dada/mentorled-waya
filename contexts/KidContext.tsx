"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { ChildrenService } from '@/lib/services/childrenService';

// Local storage utilities for kid names
const KID_NAMES_STORAGE_KEY = 'kid_names';

const getStoredKidNames = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem(KID_NAMES_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

const storeKidName = (kidId: string, name: string) => {
    if (typeof window === 'undefined') return;
    try {
        const names = getStoredKidNames();
        names[kidId] = name;
        localStorage.setItem(KID_NAMES_STORAGE_KEY, JSON.stringify(names));
    } catch (error) {
        console.warn('Failed to store kid name:', error);
    }
};

const getKidDisplayName = (kid: { id: string; username: string; name?: string }): string => {
    // 1. Use name from API if available
    if (kid.name) return kid.name;

    // 2. Use stored name if available
    const storedNames = getStoredKidNames();
    if (storedNames[kid.id]) return storedNames[kid.id];

    // 3. Fallback to formatted username
    return formatUsername(kid.username);
};

const formatUsername = (username: string): string => {
    // Capitalize first letter and replace underscores/dashes with spaces
    return username
        .replace(/[_-]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

// Types for Kid context
export interface Kid {
    id: string;
    username: string;
    name?: string; // Display name (stored locally if not from API)
    avatar?: string | null;
    created_at?: string;
    parent?: string;
}

export interface KidContextType {
    // Kid list management
    kids: Kid[];
    isLoadingKids: boolean;
    refreshKids: () => Promise<void>;

    // Active kid management (for parent viewing kid's perspective)
    activeKid: Kid | null;
    setActiveKid: (kid: Kid | null) => void;

    // Kid session info (when kid is logged in)
    isKidSession: boolean;
    currentKid: Kid | null;

    // Actions
    addKid: (kid: Kid) => void;
    removeKid: (kidId: string) => void;
    updateKid: (kidId: string, updates: Partial<Kid>) => void;

    // Name management
    setKidName: (kidId: string, name: string) => void;
    getKidDisplayName: (kid: Kid) => string;
}


const KidContext = createContext<KidContextType | undefined>(undefined);

interface KidProviderProps {
    children: ReactNode;
}

export function KidProvider({ children }: KidProviderProps) {
    const { data: session, status } = useSession();
    const [kids, setKids] = useState<Kid[]>([]);
    const [isLoadingKids, setIsLoadingKids] = useState(false);
    const [activeKid, setActiveKid] = useState<Kid | null>(null);

    // Determine if this is a kid session
    const isKidSession = session?.user?.isChild === true;
    const currentKid: Kid | null = isKidSession && session?.user ? {
        id: session.user.childId || '',
        username: session.user.childUsername || '',
        avatar: session.user.avatar,
    } : null;

    // Load kids list for parent users
    const refreshKids = async () => {
        if (!session?.user?.accessToken || session.user.role !== 'parent') {
            return;
        }

        setIsLoadingKids(true); try {
            const kidsListResponse = await ChildrenService.listChildren(session.user.accessToken);
            console.log('KidContext - Loaded kids response:', kidsListResponse);

            // Extract kids array from paginated response
            if (!kidsListResponse || !kidsListResponse.results || !Array.isArray(kidsListResponse.results)) {
                console.error('KidContext - Invalid API response format:', kidsListResponse);
                throw new Error('Invalid API response format - expected paginated response with results array');
            }

            const kidsArray = kidsListResponse.results;
            console.log('KidContext - Kids array:', kidsArray);

            // Get stored names
            const storedNames = getStoredKidNames();

            // Map response to Kid interface and merge with stored names
            const mappedKids: Kid[] = kidsArray.map((kid: any) => ({
                id: kid.id,
                username: kid.username,
                name: kid.name || storedNames[kid.id] || undefined, // Use API name, fallback to stored, then undefined
                avatar: kid.avatar,
                created_at: kid.created_at,
                parent: kid.parent,
            }));

            setKids(mappedKids);
            console.log('KidContext - Successfully mapped kids:', mappedKids);
        } catch (error) {
            console.error('KidContext - Failed to load kids:', error);
            console.error('KidContext - Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                sessionValid: !!session?.user?.accessToken,
                userRole: session?.user?.role
            });
            setKids([]);
        } finally {
            setIsLoadingKids(false);
        }
    };
    // Load kids when session is available and user is parent
    useEffect(() => {
        console.log('KidContext - useEffect triggered:', {
            status,
            userRole: session?.user?.role,
            isKidSession,
            hasAccessToken: !!session?.user?.accessToken
        });

        if (status === 'authenticated' && session?.user?.role === 'parent') {
            console.log('KidContext - Calling refreshKids for parent');
            refreshKids();
        } else if (status === 'authenticated' && isKidSession) {
            // For kid sessions, clear kids list
            console.log('KidContext - Clearing kids for kid session');
            setKids([]);
            setActiveKid(null);
        } else {
            console.log('KidContext - No action taken, conditions not met');
        }
    }, [session, status]);

    // Helper functions
    const addKid = (kid: Kid) => {
        setKids(prev => [...prev, kid]);
    };

    const removeKid = (kidId: string) => {
        setKids(prev => prev.filter(k => k.id !== kidId));
        if (activeKid?.id === kidId) {
            setActiveKid(null);
        }
    }; const updateKid = (kidId: string, updates: Partial<Kid>) => {
        setKids(prev => prev.map(k =>
            k.id === kidId ? { ...k, ...updates } : k
        ));
        if (activeKid?.id === kidId) {
            setActiveKid(prev => prev ? { ...prev, ...updates } : null);
        }
    };

    // Name management methods
    const setKidName = (kidId: string, name: string) => {
        // Store locally
        storeKidName(kidId, name);

        // Update kid in state with the name
        updateKid(kidId, { name });
    };

    const getKidDisplayNameHelper = (kid: Kid): string => {
        return getKidDisplayName(kid);
    };

    const value: KidContextType = {
        kids,
        isLoadingKids,
        refreshKids,
        activeKid,
        setActiveKid,
        isKidSession,
        currentKid,
        addKid,
        removeKid,
        updateKid,
        setKidName,
        getKidDisplayName: getKidDisplayNameHelper,
    };

    return (
        <KidContext.Provider value={value}>
            {children}
        </KidContext.Provider>
    );
}

// Custom hook to use kid context
export function useKid() {
    const context = useContext(KidContext);
    if (context === undefined) {
        throw new Error('useKid must be used within a KidProvider');
    }
    return context;
}

// Helper hooks for common patterns
export function useKidsList() {
    const { kids, isLoadingKids, refreshKids } = useKid();
    return { kids, isLoadingKids, refreshKids };
}

export function useActiveKid() {
    const { activeKid, setActiveKid } = useKid();
    return { activeKid, setActiveKid };
}

export function useKidSession() {
    const { isKidSession, currentKid } = useKid();
    return { isKidSession, currentKid };
}
