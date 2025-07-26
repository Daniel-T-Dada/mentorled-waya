'use client'

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

// Stat structure for display
export interface StatItem {
    title: string;
    value: string;
    percentageChange?: number;
    trend?: 'up' | 'down' | 'neutral';
}

interface AppStatCardProps {
    stats: StatItem[];
}

const AppStatCard = memo<AppStatCardProps>(({ stats }) => (
    <>
        {stats.map((stat, index) => (
            <Card key={index} className="min-h-[120px]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground leading-tight">
                        {stat.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold flex items-center gap-2 leading-tight">
                        {stat.value}
                        {stat.percentageChange !== undefined && stat.trend && (
                            <Badge
                                className={`flex items-center gap-1 ${stat.trend === 'up' ? 'bg-green-100 text-green-800' : stat.trend === 'down' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}
                            >
                                {stat.trend === 'up' ? (
                                    <TrendingUp size={12} />
                                ) : stat.trend === 'down' ? (
                                    <TrendingDown size={12} />
                                ) : null}
                                {Math.abs(stat.percentageChange)}%
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>
        ))}
    </>
));
AppStatCard.displayName = 'AppStatCard';

export default AppStatCard;