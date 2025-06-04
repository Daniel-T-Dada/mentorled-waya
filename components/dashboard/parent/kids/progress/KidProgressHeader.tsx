import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from 'lucide-react';
import type { KidProgressHeaderProps } from './types';

export const KidProgressHeader = ({ kid, onBack }: KidProgressHeaderProps) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onBack}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={kid.avatar ?? undefined} alt={kid.name} />
                        <AvatarFallback>{kid.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-2xl font-bold">Progress Analytics - {kid.name}</h1>
                </div>
            </div>
        </div>
    );
};
