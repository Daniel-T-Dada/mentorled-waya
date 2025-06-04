import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Settings } from "lucide-react";
import type { KidDashboardHeaderProps } from './types';

export const KidDashboardHeader = ({ kid, onBack, onProfileClick }: KidDashboardHeaderProps) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onBack}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={kid.avatar ?? undefined} alt={kid.name} />
                        <AvatarFallback>{kid.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold">{kid.name}&apos;s Dashboard</h1>
                        <p className="text-muted-foreground">Level {kid.level} • NGN {kid.balance.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onProfileClick}>
                    <Settings className="h-4 w-4 mr-2" />
                    Profile
                </Button>
            </div>
        </div>
    );
};
