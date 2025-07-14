'use client';

import SettingsDashboard from "@/components/dashboard/parent/SettingsDashboard";
import { useEffect, useState } from "react";
import { useSWR } from "@/lib/utils/swrConfig";
import { SettingsEndpoints, authFetch, API_ENDPOINTS, getApiUrl } from "@/lib/utils/api";
import type { WayaEvent, EventType, ProfileUpdatePayload } from "@/lib/realtime/types";
import { eventManager } from "@/lib/realtime/EventManager";
import AppAccountSettings from "@/components/dashboard/AppAccountSettings";
import AppNotificationSettings from "@/components/dashboard/AppNotificationSettings";
import AppRewardSettings from "@/components/dashboard/AppRewardSettings";
import { useSession } from "next-auth/react";
import { toast } from "sonner";








const SettingsPage = () => {
    // Notification settings state
    const [notificationSettings, setNotificationSettings] = useState({
        chore_completion: true,
        reward_redemption: true,
        chore_reminder: true,
        weekly_summary: false,
    });
    const [notificationLoading, setNotificationLoading] = useState(false);
    // Removed unused notificationSuccess

    // SWR for notification settings
    const NOTIFICATION_ENDPOINT = SettingsEndpoints.getNotificationSettings();
    const { data: notificationData, mutate: mutateNotification } = useSWR(NOTIFICATION_ENDPOINT);

    // Sync notification settings state with SWR data
    useEffect(() => {
        if (notificationData) {
            setNotificationSettings({
                chore_completion: !!notificationData.chore_completion,
                reward_redemption: !!notificationData.reward_redemption,
                chore_reminder: !!notificationData.chore_reminder,
                weekly_summary: !!notificationData.weekly_summary,
            });
        }
    }, [notificationData]);

    // Notification settings change handler
    const handleNotificationChange = (name: string, value: boolean) => {
        console.debug(`[NotificationSettings] Switch changed: ${name} -> ${value}`);
        setNotificationSettings((prev) => ({ ...prev, [name]: value }));
    };

    // Notification settings submit handler
    const handleNotificationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setNotificationLoading(true);
        // Removed unused setNotificationSuccess
        try {
            const url = NOTIFICATION_ENDPOINT;
            const response = await authFetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(session?.user?.accessToken ? { Authorization: `Bearer ${session.user.accessToken}` } : {}),
                },
                body: JSON.stringify(notificationSettings),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Failed to update notification settings");
            // Removed unused setNotificationSuccess
            toast.success("Notification settings updated.", { className: "text-green-600" });
            mutateNotification(); // Revalidate SWR
            // Emit real-time event (use PROFILE_UPDATE for now)
            eventManager.emit({
                type: "NOTIFICATION_SETTINGS_UPDATE",
                payload: notificationSettings,
                timestamp: Date.now(),
            });
        } catch (err: any) {
            toast.error(err.message || "Unknown error", { className: "text-red-600" });
        } finally {
            setNotificationLoading(false);
        }
    };
    // Password reset state
    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        confirm_new_password: ""
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordSuccess(false);
        try {
            // Use SettingsEndpoints.resetPassword from api.ts
            const resetUrl = SettingsEndpoints.resetPassword();
            const apiUrl = typeof resetUrl === 'string' ? (resetUrl.startsWith('http') ? resetUrl : (typeof getApiUrl === 'function' ? getApiUrl(resetUrl) : resetUrl)) : resetUrl;
            const response = await authFetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(session?.user?.accessToken ? { Authorization: `Bearer ${session.user.accessToken}` } : {}),
                },
                body: JSON.stringify(passwordForm),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Failed to reset password");
            setPasswordSuccess(true);
            setPasswordForm({ current_password: "", new_password: "", confirm_new_password: "" });
            if (data.detail) {
                toast.success(data.detail, { className: "text-green-600" });
            }
        } catch (err: any) {
            toast.error(err.message || "Unknown error", { className: "text-red-600" });
        } finally {
            setPasswordLoading(false);
        }
    };



    const PROFILE_ENDPOINT = SettingsEndpoints.getUserProfile();
    const [childId, setChildId] = useState<string>("");
    const [childrenList, setChildrenList] = useState<Array<{ id: string; name: string; username: string }>>([]);
    const { data: session } = useSession();
    const { data: profile, error, mutate } = useSWR(PROFILE_ENDPOINT);
    const [profileState, setProfileState] = useState(profile);
    const [formState, setFormState] = useState({
        full_name: profile?.full_name || "",
        email: profile?.email || "",
        avatar: profile?.avatar || "",
        username: profile?.username || profile?.familyName || "",
    });
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    // Removed unused KID_ENDPOINT

    // Kid account state
    const [kidState, setKidState] = useState({
        id: "", // will be set after GET
        name: "",
        username: "",
        avatar: "",
    });
    const [kidSaving, setKidSaving] = useState(false);
    const [kidSuccess, setKidSuccess] = useState(false);
    const [kidError, setKidError] = useState<string | null>(null);

    // Fetch childId from children API on mount
    useEffect(() => {
        async function fetchChildren() {
            try {
                // Use API_ENDPOINTS.LIST_CHILDREN from api.ts
                const childrenUrl = API_ENDPOINTS.LIST_CHILDREN;
                const apiUrl = typeof childrenUrl === 'string' ? (childrenUrl.startsWith('http') ? childrenUrl : (typeof getApiUrl === 'function' ? getApiUrl(childrenUrl) : childrenUrl)) : childrenUrl;
                const response = await authFetch(apiUrl, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(session?.user?.accessToken ?
                            { Authorization: `Bearer ${session.user.accessToken}` } : {}),
                    },
                });
                const data = await response.json();
                if (Array.isArray(data?.results) && data.results.length > 0) {
                    setChildrenList(data.results.map((child: { id: string; name: string; username: string }) => ({
                        id: child.id,
                        name: child.name,
                        username: child.username
                    })));
                    setChildId(data.results[0].id); // Use first child for now
                } else {
                    setChildrenList([]);
                    setChildId("");
                }
            } catch (err: any) {
                toast.error(err.message || "Unknown error");
            }
        }
        fetchChildren();
    }, [session?.user?.accessToken]);
    // Handle child selection change
    const handleSelectChild = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        setChildId(selectedId);
    };

    // Fetch kid account when childId is set
    useEffect(() => {
        if (!childId) return;
        async function fetchKid() {
            if (!childId) return;
            try {
                setKidSaving(true);
                const kidUrl = SettingsEndpoints.getChildProfile(childId);
                const apiUrl = typeof kidUrl === 'string' ? (kidUrl.startsWith('http') ? kidUrl : (typeof getApiUrl === 'function' ? getApiUrl(kidUrl) : kidUrl)) : kidUrl;
                const response = await authFetch(apiUrl, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(session?.user?.accessToken ? { Authorization: `Bearer ${session.user.accessToken}` } : {}),
                    },
                });
                const data = await response.json();
                setKidState({
                    id: data.id,
                    name: data.name || "",
                    username: data.username || "",
                    avatar: data.avatar || "",
                });
            } catch (err: any) {
                setKidError(err.message || "Unknown error");
                toast.error(err.message || "Unknown error");
            } finally {
                setKidSaving(false);
            }
        }
        fetchKid();
    }, [childId, session?.user?.accessToken]);

    // Kid form change handler
    const handleKidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, files } = e.target;
        setKidState((prev) => ({
            ...prev,
            [name.replace("kid_", "")]: type === "file" ? files?.[0] || "" : value,
        }));
    };

    // Kid PATCH handler
    const handleKidSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!childId) {
            console.warn('handleKidSubmit: childId is empty, aborting');
            return;
        }
        setKidSaving(true);
        setKidError(null);
        setKidSuccess(false);
        try {
            const payload: any = {
                name: kidState.name,
                username: kidState.username,
                // avatar: kidState.avatar, // handle file upload if needed
            };
            console.log('handleKidSubmit: payload', payload);
            const kidUrl = SettingsEndpoints.getChildProfile(childId);
            const apiUrl = typeof kidUrl === 'string' ? (kidUrl.startsWith('http') ? kidUrl : (typeof getApiUrl === 'function' ? getApiUrl(kidUrl) : kidUrl)) : kidUrl;
            console.log('handleKidSubmit: PATCH url', apiUrl);
            const response = await authFetch(apiUrl, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(session?.user?.accessToken ? { Authorization: `Bearer ${session.user.accessToken}` } : {}),
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error("Failed to update kid account");
            setKidSuccess(true);
            toast.success("Kid account updated successfully.");
        } catch (err: any) {
            setKidError(err.message || "Unknown error");
            toast.error(err.message || "Unknown error");
        } finally {
            setKidSaving(false);
        }
    };

    // Kid DELETE handler
    const handleKidDelete = async () => {
        if (!childId) return;
        setKidSaving(true);
        setKidError(null);
        setKidSuccess(false);
        try {
            const kidUrl = SettingsEndpoints.getChildProfile(childId);
            const apiUrl = typeof kidUrl === 'string' ? (kidUrl.startsWith('http') ? kidUrl : (typeof getApiUrl === 'function' ? getApiUrl(kidUrl) : kidUrl)) : kidUrl;
            const response = await authFetch(apiUrl, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(session?.user?.accessToken ? { Authorization: `Bearer ${session.user.accessToken}` } : {}),
                },
            });
            if (!response.ok) throw new Error("Failed to delete kid account");
            setKidSuccess(true);
            toast.success("Kid account deleted successfully.");
            setKidState({ id: "", name: "", username: "", avatar: "" });
        } catch (err: any) {
            setKidError(err.message || "Unknown error");
            toast.error(err.message || "Unknown error");
        } finally {
            setKidSaving(false);
        }
    };

    // Sync form state with profile (SWR/WebSocket updates)
    useEffect(() => {
        setProfileState(profile);
        setFormState({
            full_name: profile?.full_name || "",
            email: profile?.email || "",
            avatar: profile?.avatar || "",
            username: profile?.username || profile?.familyName || "",
        });
    }, [profile]);

    useEffect(() => {
        // Subscribe to PROFILE_UPDATE events using eventManager
        const unsubscribe = eventManager.subscribe(
            "PROFILE_UPDATE",
            (event: WayaEvent<ProfileUpdatePayload>) => {
                if (event.payload) {
                    setProfileState(event.payload);
                    setFormState({
                        full_name: event.payload.full_name || "",
                        email: event.payload.email || "",
                        avatar: event.payload.avatar || "",
                        username: event.payload.username || event.payload.familyName || "",
                    });
                    mutate(); // Optionally revalidate SWR cache
                }
            }
        );
        return () => unsubscribe();
    }, [mutate]);

    useEffect(() => {
        if (error) {
            toast.error("Error loading profile.");
        }
    }, [error]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, files } = e.target;
        setFormState((prev) => ({
            ...prev,
            [name]: type === "file" ? files?.[0] || "" : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        // Optimistic UI: update local state immediately
        const optimisticProfile = {
            ...profileState,
            ...formState,
        };
        setProfileState(optimisticProfile);
        mutate(optimisticProfile, false); // Optimistic SWR update
        try {
            const payload: any = {
                full_name: formState.full_name,
                email: formState.email,
                username: formState.username,
            };
            // Handle avatar upload if needed (not implemented here)
            const response = await authFetch(PROFILE_ENDPOINT, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(session?.user?.accessToken ? { Authorization: `Bearer ${session.user.accessToken}` } : {}),
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error("Failed to update profile");
            setSuccess(true);
            toast.success("Profile updated successfully.");
            mutate(); // Revalidate SWR after save
        } catch (err: any) {
            toast.error(err.message || "Unknown error");
        } finally {
            setSaving(false);
        }
    };





    // Integrate reward settings logic
    // Use local variables: rewardSettings, rewardLoading, rewardSuccess, handleRewardChange, handleRewardSave

    // Reward settings state and logic (ensure in scope for render)
    const REWARD_ENDPOINT = getApiUrl(API_ENDPOINTS.REWARD_SETTINGS);
    const [rewardSettings, setRewardSettings] = useState({
        reward_approval_required: false,
        max_daily_reward: 0,
        allow_savings: true,
    });
    const [rewardLoading, setRewardLoading] = useState(false);
    const [rewardSuccess, setRewardSuccess] = useState(false);
    const { data: rewardData, mutate: mutateReward } = useSWR(REWARD_ENDPOINT);

    useEffect(() => {
        if (rewardData) {
            setRewardSettings({
                reward_approval_required: rewardData.reward_approval_required ?? false,
                max_daily_reward: rewardData.max_daily_reward ?? 0,
                allow_savings: rewardData.allow_savings ?? true,
            });
        }
    }, [rewardData]);

    useEffect(() => {
        const unsubscribe = eventManager.subscribe(
            "REWARD_SETTINGS_UPDATE" as EventType,
            ((event: any) => {
                if (event.payload) {
                    setRewardSettings(event.payload);
                    mutateReward();
                }
            }) as any
        );
        return () => unsubscribe();
    }, [mutateReward]);

    const handleRewardChange = (name: keyof typeof rewardSettings, value: boolean | number) => {
        setRewardSettings((prev) => ({ ...prev, [name]: value }));
    };

    const handleRewardSave = async () => {
        setRewardLoading(true);
        setRewardSuccess(false);
        try {
            const response = await fetch(REWARD_ENDPOINT, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(session?.user?.accessToken ? { Authorization: `Bearer ${session.user.accessToken}` } : {}),
                },
                body: JSON.stringify(rewardSettings),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.detail || "Failed to update reward settings");
            }
            const updated = await response.json();
            setRewardSettings(updated);
            mutateReward(updated, false);
            setRewardSuccess(true);
            toast.success("Reward settings updated successfully.");
            eventManager.emit({
                type: "REWARD_SETTINGS_UPDATE" as EventType,
                payload: updated,
                timestamp: Date.now(),
            });
        } catch (err: any) {
            toast.error(err.message || "Unknown error updating reward settings.");
        } finally {
            setRewardLoading(false);
        }
    };

    return (
        <div>
            {childrenList.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin" style={{ marginRight: '0.5rem' }}>
                            <circle cx="12" cy="12" r="10" stroke="#500061" strokeWidth="4" opacity="0.2" />
                            <path d="M22 12a10 10 0 0 1-10 10" stroke="#500061" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                        loading...
                    </span>
                </div>
            ) : (
                <SettingsDashboard
                    accountSettings={
                        <AppAccountSettings
                            formState={formState}
                            saving={saving}
                            success={success}
                            onChange={handleChange}
                            onSubmit={handleSubmit}
                            kidFormState={kidState}
                            kidSaving={kidSaving}
                            kidSuccess={kidSuccess}
                            kidError={kidError}
                            onKidChange={handleKidChange}
                            onKidSubmit={handleKidSubmit}
                            onKidDelete={handleKidDelete}
                            childrenList={childrenList}
                            selectedChildId={childId}
                            onSelectChild={handleSelectChild}
                            passwordForm={passwordForm}
                            passwordLoading={passwordLoading}
                            passwordSuccess={passwordSuccess}
                            onPasswordChange={handlePasswordChange}
                            onPasswordSubmit={handlePasswordSubmit}
                        />
                    }
                    notificationSettings={
                        <AppNotificationSettings
                            settings={notificationSettings}
                            loading={notificationLoading}
                            onChange={handleNotificationChange}
                            onSubmit={handleNotificationSubmit}
                        />
                    }
                    rewardSettings={
                        <AppRewardSettings
                            rewardSettings={rewardSettings}
                            loading={rewardLoading}
                            success={rewardSuccess}
                            onChange={handleRewardChange}
                            onSave={handleRewardSave}
                        />
                    }
                />
            )}
        </div>
    );
}

export default SettingsPage;