'use client';

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Placeholder icons per notification type
function NotificationIcon({ type }: { type: string }) {
    switch (type) {
        case "chore_completed":
            return <span className="inline-block text-green-600 mr-3"><svg width="22" height="22" fill="none"><circle cx="11" cy="11" r="11" fill="#EBFAF0" /><path d="M7 11.5l3 3 5-6" stroke="#13D998" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>;
        case "reward_redeemed":
            return <span className="inline-block text-yellow-500 mr-3"><svg width="22" height="22" fill="none"><circle cx="11" cy="11" r="11" fill="#FFF7E6" /><path d="M11 16v-2M11 10V6M11 10c0-1.657 1.343-3 3-3s3 1.343 3 3c0 2.5-3 4-3 4" stroke="#FFB938" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>;
        case "chore_reminder":
            return <span className="inline-block text-purple-500 mr-3"><svg width="22" height="22" fill="none"><circle cx="11" cy="11" r="11" fill="#F6EDFB" /><path d="M11 7v4l2 2M11 16a5 5 0 100-10 5 5 0 000 10z" stroke="#79166A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>;
        case "chore_overdue":
            return <span className="inline-block text-red-500 mr-3"><svg width="22" height="22" fill="none"><circle cx="11" cy="11" r="11" fill="#FFE5E5" /><path d="M11 7v4l2 2M11 16a5 5 0 100-10 5 5 0 000 10z" stroke="#FF5757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>;
        default:
            return <span className="inline-block text-gray-400 mr-3">🔔</span>;
    }
}

const notificationsMock = [
    {
        id: "1",
        user: "Tobi",
        type: "chore_completed",
        title: "Tobi - Chore Completed",
        description: "Help Mummy and Daddy out in the kitchen.",
        needsApproval: true,
        isNew: true,
        time: "1 day, 22 hours ago",
        amount: 2000,
        approved: false,
    },
    {
        id: "2",
        user: "Fade",
        type: "reward_redeemed",
        title: "Fade - Reward Redeemed",
        description: "Make your bed, organize your wardrobe, clothes and toys.",
        needsApproval: false,
        isNew: true,
        time: "1 day, 22 hours ago",
        amount: 2000,
        approved: false,
    },
    {
        id: "3",
        user: "Tobi",
        type: "chore_reminder",
        title: "Tobi - Chore Reminder",
        description: "A new chore has been created for Tobi",
        needsApproval: false,
        isNew: true,
        time: "1 day, 22 hours ago",
        amount: 2000,
        approved: false,
    },
    {
        id: "4",
        user: "Fade",
        type: "chore_reminder",
        title: "Fade - Chore Reminder",
        description: "Fade's Chore due date is around the corner and it hasn't been completed.",
        needsApproval: false,
        isNew: true,
        time: "1 day, 22 hours ago",
        amount: 2000,
        approved: false,
    },
    {
        id: "5",
        user: "Fade",
        type: "chore_completed",
        title: "Fade - Chore Completed",
        description: "Help Mummy and Daddy out in the kitchen.",
        needsApproval: true,
        isNew: true,
        time: "1 day, 22 hours ago",
        amount: 2000,
        approved: false,
    },
    {
        id: "6",
        user: "Tobi",
        type: "reward_redeemed",
        title: "Tobi - Reward Redeemed",
        description: "Make your bed, organize your wardrobe, clothes and toys.",
        needsApproval: false,
        isNew: true,
        time: "1 day, 22 hours ago",
        amount: 2000,
        approved: false,
    },
];

function NotificationTabButton({
    children,
    active,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) {
    return (
        <button
            {...props}
            className={cn(
                "px-4 py-2 rounded-md font-semibold text-base transition-colors",
                active
                    ? "bg-muted text-foreground shadow"
                    : "bg-transparent text-muted-foreground hover:bg-muted/70"
            )}
        >
            {children}
        </button>
    );
}

export default function NotificationPanel() {
    const [tab, setTab] = React.useState<"new" | "all">("new");
    const [notifications, setNotifications] = React.useState(notificationsMock);

    const filteredNotifications =
        tab === "new"
            ? notifications.filter((n) => n.isNew)
            : notifications;

    const handleMarkAllRead = () => {
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, isNew: false }))
        );
    };

    const handleApprove = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, needsApproval: false, approved: true } : n
            )
        );
    };

    return (
        <div className="p-6 pb-0 flex flex-col h-full w-full">
            <div className="text-2xl font-bold mb-2">Notification</div>
            <div className="flex items-center gap-3 mt-2 mb-4">
                <NotificationTabButton active={tab === "new"} onClick={() => setTab("new")}>
                    New
                </NotificationTabButton>
                <NotificationTabButton active={tab === "all"} onClick={() => setTab("all")}>
                    All
                </NotificationTabButton>
                <div className="flex-1" />
                <Button
                    variant="secondary"
                    className="px-5 py-2 text-primary font-semibold rounded-lg"
                    onClick={handleMarkAllRead}
                    disabled={filteredNotifications.length === 0}
                >
                    Mark all as read
                </Button>
            </div>
            <div className="text-muted-foreground mb-2 font-medium px-6">
                Displaying {filteredNotifications.length} of {notifications.length} notifications
            </div>
            <div className="flex-1 overflow-y-auto px-4 pr-6">
                <div className="flex flex-col gap-6">
                    {filteredNotifications.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground text-base">
                            No notifications.
                        </div>
                    )}
                    {filteredNotifications.map((n) => (
                        <Card
                            key={n.id}
                            className={cn(
                                "flex flex-col gap-2 p-5 rounded-xl border shadow-sm transition-all bg-white",
                                n.isNew ? "border-primary/40 ring-1 ring-primary/10" : "border-muted"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-3">
                                    <NotificationIcon type={n.type} />
                                    <div>
                                        <div className="font-semibold text-base">{n.title}</div>
                                        <div className="text-sm text-muted-foreground">{n.description}</div>
                                        <div className="flex gap-2 mt-2 items-center">
                                            <span className="text-xs text-muted-foreground">{n.time}</span>
                                            <span className="ml-2 text-green-600 font-bold text-xs">
                                                {n.amount ? `₦${n.amount.toLocaleString()}` : ""}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {n.needsApproval && !n.approved && (
                                        <div className="flex gap-2">
                                            <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-semibold mr-2">
                                                Needs Approval
                                            </span>
                                            <Button
                                                size="sm"
                                                className="bg-primary text-white px-4 py-1 h-8 rounded-lg text-xs"
                                                onClick={() => handleApprove(n.id)}
                                            >
                                                Approve
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}