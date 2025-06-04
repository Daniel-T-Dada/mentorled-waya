import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { KidProgressBar } from "./KidProgressBar";
import { KidStats } from "./KidStats";
import type { KidCardProps } from './types';

export const KidCard = ({ kid, completedChores, pendingChores, progress }: KidCardProps) => {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                        <AvatarImage src={kid.avatar ?? undefined} alt={kid.name} />
                        <AvatarFallback className="text-lg">{kid.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="text-xl">{kid.name}</CardTitle>
                        <p className="text-muted-foreground">Level {kid.level}</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Progress Bar */}
                <KidProgressBar progress={progress} />

                {/* Stats Grid */}
                <KidStats
                    completedChores={completedChores}
                    pendingChores={pendingChores}
                    balance={kid.balance}
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
};
