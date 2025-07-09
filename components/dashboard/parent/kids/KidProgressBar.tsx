import { Progress } from "@/components/ui/progress";
import { memo } from "react";
import type { KidProgressBarProps } from './types';

export const KidProgressBar = memo<KidProgressBarProps>(({ progress }) => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
        </div>
    );
});

KidProgressBar.displayName = 'KidProgressBar';
