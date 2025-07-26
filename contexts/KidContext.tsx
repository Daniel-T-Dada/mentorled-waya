"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { ChildrenService, ApiError } from '@/lib/services/childrenService';

const getKidDisplayName = (kid: { id: string; username: string; name?: string }): string => {
    // 1. Use name from API if available (backend now provides this)
    if (kid.name && kid.name.trim()) {
        return kid.name.trim();
    }

    // 2. Fallback to formatted username if backend doesn't provide name
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
    name?: string; // Display name from backend
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

    // Add new method for fetching child profile
    fetchChildProfile: (childId: string, parentToken: string) => Promise<Kid | null>;
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

    // Memoize currentKid to prevent unnecessary re-renders
    const currentKid: Kid | null = useMemo(() => {
        if (!isKidSession || !session?.user) return null;

        return {
            id: session.user.childId || '',
            username: session.user.childUsername || '',
            name: session.user.childName && session.user.childName.trim() ? session.user.childName.trim() : undefined,
            avatar: session.user.avatar,
        };
    }, [isKidSession, session?.user?.childId, session?.user?.childUsername, session?.user?.childName, session?.user?.avatar]);

    // Load kids list for parent users - memoized to prevent unnecessary re-renders
    const refreshKids = useCallback(async () => {
        if (!session?.user?.accessToken || session.user.role !== 'parent') {
            return;
        }

        setIsLoadingKids(true); try {
            let allKids: any[] = [];
            let nextUrl: string | null = null;
            let currentPage = 1;

            // Fetch all pages of kids
            do {
                // console.log(`KidContext - Fetching page ${currentPage}...`);

                let kidsListResponse;
                if (currentPage === 1) {
                    // First page - use the regular method
                    kidsListResponse = await ChildrenService.listChildren(session.user.accessToken);
                } else {
                    // Subsequent pages - use the custom URL method
                    kidsListResponse = await ChildrenService.listChildrenFromUrl(nextUrl!, session.user.accessToken);
                }

                // console.log(`KidContext - Page ${currentPage} response:`, kidsListResponse);

                // Extract kids array from paginated response
                if (!kidsListResponse || !kidsListResponse.results || !Array.isArray(kidsListResponse.results)) {
                    console.error('KidContext - Invalid API response format:', kidsListResponse);
                    throw new Error('Invalid API response format - expected paginated response with results array');
                }

                // Add this page's kids to our collection
                allKids = [...allKids, ...kidsListResponse.results];
                nextUrl = kidsListResponse.next;
                currentPage++;

                // console.log(`KidContext - Total kids so far: ${allKids.length}, Next URL: ${nextUrl}`);

            } while (nextUrl);

            // console.log('KidContext - All kids collected:', allKids);

            // Map response to Kid interface, prioritizing backend-provided name
            const mappedKids: Kid[] = allKids.map((kid: any) => {
                return {
                    id: kid.id,
                    username: kid.username,
                    name: kid.name && kid.name.trim() ? kid.name.trim() : undefined, // Use backend name if provided and not empty
                    avatar: kid.avatar,
                    created_at: kid.created_at,
                    parent: kid.parent,
                };
            });

            setKids(mappedKids);
            // console.log('KidContext - Successfully mapped kids:', mappedKids);
        } catch (error) {
            // console.error('KidContext - Failed to load kids:', error);
            // console.error('KidContext - Error details:', {
            //     message: error instanceof Error ? error.message : 'Unknown error',
            //     stack: error instanceof Error ? error.stack : undefined,
            //     sessionValid: !!session?.user?.accessToken,
            //     userRole: session?.user?.role
            // });

            // Handle token expiration (401 errors)
            if (error instanceof ApiError && error.status === 401) {
                console.warn('KidContext - Token expired, signing out user...');
                // Sign out the user to force re-authentication
                signOut({ redirect: true, callbackUrl: '/auth/signin' });
                return; // Don't set empty kids array, let the sign out handle it
            }

            setKids([]);
        } finally {
            setIsLoadingKids(false);
        }
    }, [session?.user?.accessToken, session?.user?.role]);
    // Load kids when session is available and user is parent
    useEffect(() => {
        // console.log('KidContext - useEffect triggered:', {
        //     status,
        //     userRole: session?.user?.role,
        //     isKidSession,
        //     hasAccessToken: !!session?.user?.accessToken
        // });

        if (status === 'authenticated' && session?.user?.role === 'parent') {
            // console.log('KidContext - Calling refreshKids for parent');
            refreshKids();
        } else if (status === 'authenticated' && isKidSession) {
            // For kid sessions, clear kids list
            // console.log('KidContext - Clearing kids for kid session');
            setKids([]);
            setActiveKid(null);
        } else {
            // console.log('KidContext - No action taken, conditions not met');
        }
    }, [refreshKids, status, session?.user?.role, isKidSession]);

    // New method to fetch child profile after login - memoized
    const fetchChildProfile = useCallback(async (childId: string, parentToken: string): Promise<Kid | null> => {
        try {
            const profile = await ChildrenService.getChildDetail(childId, parentToken);
            // console.log('KidContext - Fetched child profile:', profile);

            const kid: Kid = {
                id: profile.id,
                username: profile.username,
                name: profile.name || 'Unknown',
                parent: profile.parent,
                avatar: profile.avatar || '',
                created_at: profile.created_at
            };

            // Update the kid in local state if it exists
            setKids(prev => prev.map(k =>
                k.id === childId ? { ...k, name: kid.name } : k
            ));

            return kid;
        } catch (error) {
            console.error('KidContext - Failed to fetch child profile:', error);
            return null;
        }
    }, []);

    // Helper functions - memoized to prevent unnecessary re-renders
    const addKid = useCallback((kid: Kid) => {
        setKids(prev => [...prev, kid]);
    }, []);

    const removeKid = useCallback((kidId: string) => {
        setKids(prev => prev.filter(k => k.id !== kidId));
        setActiveKid(prev => prev?.id === kidId ? null : prev);
    }, []);

    const updateKid = useCallback((kidId: string, updates: Partial<Kid>) => {
        setKids(prev => prev.map(k =>
            k.id === kidId ? { ...k, ...updates } : k
        ));
        setActiveKid(prev => prev?.id === kidId ? { ...prev, ...updates } : prev);
    }, []);

    // Name management methods - memoized
    const setKidName = useCallback((kidId: string, name: string) => {
        // Update kid in state with the name (no longer storing locally since backend provides it)
        updateKid(kidId, { name });
    }, [updateKid]);

    const getKidDisplayNameHelper = useCallback((kid: Kid): string => {
        const displayName = getKidDisplayName(kid);
        // console.log('KidContext - Getting display name for kid:', {
        //     kidId: kid.id,
        //     username: kid.username,
        //     backendName: kid.name,
        //     displayName
        // });
        return displayName;
    }, []);

    // Memoize the context value to prevent unnecessary re-renders
    const value: KidContextType = useMemo(() => ({
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
        fetchChildProfile,
    }), [
        kids,
        isLoadingKids,
        refreshKids,
        activeKid,
        isKidSession,
        currentKid,
        addKid,
        removeKid,
        updateKid,
        setKidName,
        getKidDisplayNameHelper,
        fetchChildProfile,
    ]);

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

// Helper hooks for common patterns - optimized with useMemo
export function useKidsList() {
    const { kids, isLoadingKids, refreshKids } = useKid();
    // No frontend slicing, just return the full kids array from context
    return useMemo(() => ({
        kids,
        isLoadingKids,
        refreshKids
    }), [kids, isLoadingKids, refreshKids]);
}

export function useActiveKid() {
    const { activeKid, setActiveKid } = useKid();
    return useMemo(() => ({
        activeKid,
        setActiveKid
    }), [activeKid, setActiveKid]);
}

export function useKidSession() {
    const { isKidSession, currentKid } = useKid();
    return useMemo(() => ({
        isKidSession,
        currentKid
    }), [isKidSession, currentKid]);
}

// Additional optimized selector hooks
export function useKidActions() {
    const { addKid, removeKid, updateKid, setKidName } = useKid();
    return useMemo(() => ({
        addKid,
        removeKid,
        updateKid,
        setKidName,
    }), [addKid, removeKid, updateKid, setKidName]);
}

export function useKidByIdSelector(kidId: string) {
    const { kids } = useKid();
    return useMemo(() =>
        kids.find(kid => kid.id === kidId) || null,
        [kids, kidId]
    );
}

export function useKidsCount() {
    const { kids, isLoadingKids } = useKid();
    // No frontend slicing, just use the full kids array from context
    return useMemo(() => ({
        count: kids.length,
        hasKids: kids.length > 0,
        isLoadingKids,
    }), [kids.length, isLoadingKids]);
}
