'use client';

import SettingsDashboard from "@/components/dashboard/parent/SettingsDashboard";
import AppAccountSettings from "@/components/dashboard/AppAccountSettings";
import AppNotificationSettings from "@/components/dashboard/AppNotificationSettings";
import AppRewardSettings from "@/components/dashboard/AppRewardSettings";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SettingsEndpoints, API_ENDPOINTS, getApiUrl } from "@/lib/utils/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fetchProfile = async (token: string) => {
    const url = SettingsEndpoints.getUserProfile();
    const res = await fetch(url, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
};

const updateProfile = async ({ payload, token }: { payload: any; token: string }) => {
    const url = SettingsEndpoints.getUserProfile();
    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Profile update failed");
    return response.json();
};

const fetchChildren = async (token: string) => {
    const url = API_ENDPOINTS.LIST_CHILDREN;
    const apiUrl = url.startsWith('http') ? url : getApiUrl(url);
    const res = await fetch(apiUrl, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    if (!res.ok) throw new Error('Failed to fetch children');
    return res.json();
};

const fetchNotifications = async (token: string) => {
    const url = SettingsEndpoints.getNotificationSettings();
    const res = await fetch(url, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    if (!res.ok) throw new Error('Failed to fetch notification settings');
    return res.json();
};

const updateNotifications = async ({ payload, token }: { payload: any; token: string }) => {
    const url = SettingsEndpoints.getNotificationSettings();
    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to update notification settings");
    return response.json();
};

const fetchRewardSettings = async (token: string) => {
    const url = getApiUrl(API_ENDPOINTS.REWARD_SETTINGS);
    const res = await fetch(url, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    if (!res.ok) throw new Error('Failed to fetch reward settings');
    return res.json();
};

const updateRewardSettings = async ({ payload, token }: { payload: any; token: string }) => {
    const url = getApiUrl(API_ENDPOINTS.REWARD_SETTINGS);
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to update reward settings");
    return response.json();
};

const SettingsPage = () => {
    const { data: session, update } = useSession();
    const token = session?.user?.accessToken;
    const queryClient = useQueryClient();

    // --- Account/Profile (TanStack Query) ---
    const {
        data: profile,
    } = useQuery({
        queryKey: ["parent-profile"],
        queryFn: () => fetchProfile(token),
        enabled: !!token,
    });

    const [formState, setFormState] = useState({
        full_name: "",
        email: "",
        avatar: "",
        username: "",
    });

    useEffect(() => {
        if (profile) {
            setFormState({
                full_name: profile.full_name ?? "",
                email: profile.email ?? "",
                avatar: profile.avatar ?? "",
                username: profile.username ?? profile.familyName ?? "",
            });
        }
    }, [profile]);

    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Profile update mutation
    const profileMutation = useMutation({
        mutationFn: ({ payload, token }: { payload: any; token: string }) => updateProfile({ payload, token }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["parent-profile"] });
            setSuccess(true);
            toast.success("Profile updated successfully.");
            if (typeof update === "function") await update();
        },
        onError: () => {
            toast.error("Failed to update profile. Please try again.");
        },
        onSettled: () => {
            setSaving(false);
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, files } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: type === "file" ? files?.[0] || "" : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        profileMutation.mutate({
            payload: {
                full_name: formState.full_name,
                email: formState.email,
                username: formState.username,
            },
            token: token!,
        });
    };

    // --- Children/Kid Accounts (TanStack Query) ---
    const {
        data: childrenData,
    } = useQuery({
        queryKey: ["parent-children"],
        queryFn: () => fetchChildren(token),
        enabled: !!token,
    });

    const [childrenList, setChildrenList] = useState<Array<{ id: string; name: string; username: string }>>([]);
    const [childId, setChildId] = useState<string>("");

    useEffect(() => {
        if (Array.isArray(childrenData?.results) && childrenData.results.length > 0) {
            setChildrenList(childrenData.results.map((child: any) => ({
                id: child.id,
                name: child.name,
                username: child.username
            })));
            setChildId(childrenData.results[0].id);
        } else {
            setChildrenList([]);
            setChildId("");
        }
    }, [childrenData]);

    const [kidState, setKidState] = useState({
        id: "",
        name: "",
        username: "",
        avatar: "",
    });
    const [kidSaving, setKidSaving] = useState(false);
    const [kidSuccess, setKidSuccess] = useState(false);
    const [kidError, setKidError] = useState<string | null>(null);

    useEffect(() => {
        if (!childId || !token) {
            setKidState({ id: "", name: "", username: "", avatar: "" });
            return;
        }
        (async () => {
            try {
                setKidSaving(true);
                setKidError(null);
                const url = SettingsEndpoints.getChildProfile(childId);
                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                if (!response.ok) throw new Error("Failed to fetch kid profile");
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
        })();
    }, [childId, token]);

    const handleSelectChild = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setChildId(e.target.value);
    };

    const handleKidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, files } = e.target;
        setKidState((prev) => ({
            ...prev,
            [name.replace("kid_", "")]: type === "file" ? files?.[0] || "" : value,
        }));
    };

    const handleKidSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!childId || !token) return;
        setKidSaving(true);
        setKidError(null);
        setKidSuccess(false);
        try {
            const payload: any = {
                name: kidState.name,
                username: kidState.username,
            };
            const url = SettingsEndpoints.getChildProfile(childId);
            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error("Failed to update kid account");
            setKidSuccess(true);
            toast.success("Kid account updated successfully.");
            await queryClient.invalidateQueries({ queryKey: ["parent-children"] });
        } catch {
            setKidError("Could not update kid account.");
            toast.error("Could not update kid account.");
        } finally {
            setKidSaving(false);
        }
    };

    const handleKidDelete = async () => {
        if (!childId || !token) return;
        setKidSaving(true);
        setKidError(null);
        setKidSuccess(false);
        try {
            const url = SettingsEndpoints.getChildProfile(childId);
            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            if (!response.ok) throw new Error("Failed to delete kid account");
            setKidSuccess(true);
            toast.success("Kid account deleted successfully.");
            setKidState({ id: "", name: "", username: "", avatar: "" });
            await queryClient.invalidateQueries({ queryKey: ["parent-children"] });
        } catch {
            setKidError("Could not delete kid account.");
            toast.error("Could not delete kid account.");
        } finally {
            setKidSaving(false);
        }
    };

    // --- Notifications (TanStack Query) ---
    const {
        data: notificationData,
    } = useQuery({
        queryKey: ["parent-notifications"],
        queryFn: () => fetchNotifications(token),
        enabled: !!token,
    });

    const [notificationSettings, setNotificationSettings] = useState({
        chore_completion: true,
        reward_redemption: true,
        chore_reminder: true,
        weekly_summary: false,
    });

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

    const [notificationLoading, setNotificationLoading] = useState(false);

    const notificationMutation = useMutation({
        mutationFn: ({ payload, token }: { payload: any; token: string }) => updateNotifications({ payload, token }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["parent-notifications"] });
            toast.success("Notification settings updated.");
        },
        onError: () => {
            toast.error("Failed to update notification settings.");
        },
        onSettled: () => {
            setNotificationLoading(false);
        }
    });

    const handleNotificationChange = (name: string, value: boolean) => {
        setNotificationSettings((prev) => ({ ...prev, [name]: value }));
    };

    const handleNotificationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setNotificationLoading(true);
        notificationMutation.mutate({
            payload: notificationSettings,
            token: token!,
        });
    };

    // --- Rewards (TanStack Query) ---
    const {
        data: rewardData,
    } = useQuery({
        queryKey: ["parent-reward-settings"],
        queryFn: () => fetchRewardSettings(token),
        enabled: !!token,
    });

    const [rewardSettings, setRewardSettings] = useState({
        reward_approval_required: false,
        max_daily_reward: 0,
        allow_savings: true,
    });
    const [rewardLoading, setRewardLoading] = useState(false);
    const [rewardSuccess, setRewardSuccess] = useState(false);

    useEffect(() => {
        if (rewardData) {
            setRewardSettings({
                reward_approval_required: rewardData.reward_approval_required ?? false,
                max_daily_reward: rewardData.max_daily_reward ?? 0,
                allow_savings: rewardData.allow_savings ?? true,
            });
        }
    }, [rewardData]);

    const rewardMutation = useMutation({
        mutationFn: ({ payload, token }: { payload: any; token: string }) => updateRewardSettings({ payload, token }),
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: ["parent-reward-settings"] });
            setRewardSettings(data);
            setRewardSuccess(true);
            toast.success("Reward settings updated successfully.");
        },
        onError: () => {
            toast.error("Failed to update reward settings.");
        },
        onSettled: () => {
            setRewardLoading(false);
        }
    });

    const handleRewardChange = (name: keyof typeof rewardSettings, value: boolean | number) => {
        setRewardSettings((prev) => ({ ...prev, [name]: value }));
    };

    const handleRewardSave = async () => {
        setRewardLoading(true);
        setRewardSuccess(false);
        rewardMutation.mutate({
            payload: rewardSettings,
            token: token!,
        });
    };

    // --- Password Reset --- (unchanged, not using query for simplicity)
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
            const url = SettingsEndpoints.resetPassword();
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(passwordForm),
            });
            if (!response.ok) throw new Error("Failed to reset password");
            setPasswordSuccess(true);
            setPasswordForm({ current_password: "", new_password: "", confirm_new_password: "" });
            toast.success("Password reset successful.");
        } catch {
            toast.error("Failed to reset password. Please try again.");
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div>
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
        </div>
    );
};

export default SettingsPage;