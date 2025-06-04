import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    TrendingUp,
    Clock,
    BarChart3,
    Target,
    Award,
    Calendar,
    Star,
    Trophy
} from 'lucide-react';
import type { ProgressTabsProps, Badge as BadgeType } from './types';

export const ProgressTabs = ({ progressData, kid }: ProgressTabsProps) => {
    const getAchievementIcon = (type: string) => {
        switch (type) {
            case 'weekly':
                return <Calendar className="h-4 w-4" />;
            case 'streak':
                return <Target className="h-4 w-4" />;
            case 'special':
                return <Star className="h-4 w-4" />;
            case 'milestone':
                return <Trophy className="h-4 w-4" />;
            default:
                return <Award className="h-4 w-4" />;
        }
    };

    const getAchievementColor = (type: string) => {
        switch (type) {
            case 'weekly':
                return 'bg-blue-100 text-blue-800';
            case 'streak':
                return 'bg-green-100 text-green-800';
            case 'special':
                return 'bg-yellow-100 text-yellow-800';
            case 'milestone':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const badges: BadgeType[] = [
        { name: 'Perfectionist', description: 'Complete 10 tasks perfectly', earned: true },
        { name: 'Speed Demon', description: 'Complete 5 tasks early', earned: true },
        { name: 'Consistent', description: '7-day completion streak', earned: true },
        { name: 'Helper', description: 'Help with family tasks', earned: false },
        { name: 'Organizer', description: 'Keep room tidy for a week', earned: false },
        { name: 'Scholar', description: 'Complete all school tasks', earned: false }
    ];

    return (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weekly Progress Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Weekly Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {progressData.weeklyProgress.map((week, index) => {
                                    const percentage = (week.completed / week.assigned) * 100;
                                    return (
                                        <div key={index} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium">{week.week}</span>
                                                <span className="text-muted-foreground">
                                                    {week.completed}/{week.assigned} tasks
                                                </span>
                                            </div>
                                            <Progress value={percentage} className="h-3" />
                                            <div className="text-right text-xs text-muted-foreground">
                                                {percentage.toFixed(0)}% completion
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <h4 className="font-medium text-green-800 mb-1">This Week</h4>
                                    <p className="text-sm text-green-600">
                                        Completed 8 out of 10 assigned tasks
                                    </p>
                                    <div className="mt-2">
                                        <Progress value={80} className="h-2" />
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-medium text-blue-800 mb-1">Longest Streak</h4>
                                    <p className="text-sm text-blue-600">
                                        {progressData.streaks.longest} consecutive days of task completion
                                    </p>
                                </div>

                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                    <h4 className="font-medium text-purple-800 mb-1">Next Level</h4>
                                    <p className="text-sm text-purple-600">
                                        {100 - kid.progress}% progress needed to reach Level {kid.level + 1}
                                    </p>
                                    <div className="mt-2">
                                        <Progress value={kid.progress} className="h-2" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="trends" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="text-center py-8 text-muted-foreground">
                                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">Detailed Analytics Coming Soon</h3>
                                <p>
                                    Visual charts and trend analysis will be available here to help you
                                    understand {kid.name}&apos;s progress patterns over time.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="categories" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Performance by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {progressData.categoryStats.map((category, index) => {
                                const percentage = (category.completed / category.total) * 100;
                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{category.category}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">
                                                    {category.completed}/{category.total}
                                                </span>
                                                <Badge variant={percentage >= 80 ? 'default' : percentage >= 60 ? 'secondary' : 'destructive'}>
                                                    {percentage.toFixed(0)}%
                                                </Badge>
                                            </div>
                                        </div>
                                        <Progress value={percentage} className="h-3" />
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="achievements" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5" />
                                Recent Achievements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {progressData.recentAchievements.map((achievement, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                        <div className={`p-2 rounded-full ${getAchievementColor(achievement.type)}`}>
                                            {getAchievementIcon(achievement.type)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium">{achievement.title}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Earned on {new Date(achievement.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Available Badges
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-3">
                                {badges.map((badge, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 text-center rounded-lg border ${badge.earned
                                                ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                                                : 'bg-gray-50 border-gray-200 text-gray-500'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${badge.earned ? 'bg-yellow-200' : 'bg-gray-200'
                                            }`}>
                                            {badge.earned ? '🏆' : '🔒'}
                                        </div>
                                        <h4 className="text-xs font-medium mb-1">{badge.name}</h4>
                                        <p className="text-xs opacity-75">{badge.description}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </Tabs>
    );
};
