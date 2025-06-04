import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Wallet, TrendingUp, Settings } from "lucide-react";
import Link from "next/link";
import type { KidQuickActionsProps } from './types';

export const KidQuickActions = ({ kidId }: KidQuickActionsProps) => {
    const actions = [
        {
            href: `/dashboard/parents/kids/${kidId}/tasks`,
            icon: ClipboardList,
            title: "Tasks",
            description: "Manage chores"
        },
        {
            href: `/dashboard/parents/kids/${kidId}/wallet`,
            icon: Wallet,
            title: "Wallet",
            description: "View allowance"
        },
        {
            href: `/dashboard/parents/kids/${kidId}/progress`,
            icon: TrendingUp,
            title: "Analytics",
            description: "View progress"
        },
        {
            href: `/dashboard/parents/kids/${kidId}/profile`,
            icon: Settings,
            title: "Settings",
            description: "Edit profile"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {actions.map((action) => {
                const IconComponent = action.icon;
                return (
                    <Link key={action.href} href={action.href}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="flex items-center p-6">
                                <IconComponent className="h-8 w-8 text-primary mr-3" />
                                <div>
                                    <h3 className="font-semibold">{action.title}</h3>
                                    <p className="text-sm text-muted-foreground">{action.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                );
            })}
        </div>
    );
};
