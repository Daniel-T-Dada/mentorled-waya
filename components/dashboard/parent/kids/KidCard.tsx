import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useKid } from "@/contexts/KidContext";
import { KidProgressBar } from "./KidProgressBar";
import { KidStats } from "./KidStats";
import { memo } from "react";
import type { KidCardProps } from './types';

export const KidCard = memo<KidCardProps>(({ kid, completedChores, pendingChores, progress }) => {
    const { getKidDisplayName } = useKid();
    const displayName = getKidDisplayName(kid);

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                        <AvatarImage src={kid.avatar ?? undefined} alt={displayName} />
                        <AvatarFallback className="text-lg">{displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="text-xl">{displayName}</CardTitle>
                        <p className="text-muted-foreground">Level 1</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Progress Bar */}
                <KidProgressBar progress={progress} />                {/* Stats Grid */}
                <KidStats
                    completedChores={completedChores}
                    pendingChores={pendingChores}
                    balance={0} // Placeholder until we add balance to Kid interface
                />

                {/* Action Button */}
                <Link href={`/dashboard/parents/kids/${kid.id}`} className="block">
                    <Button className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Dashboard
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
});

KidCard.displayName = 'KidCard';
