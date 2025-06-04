import { Progress } from "@/components/ui/progress";
import type { KidProgressBarProps } from './types';

export const KidProgressBar = ({ progress }: KidProgressBarProps) => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
        </div>
    );
};
