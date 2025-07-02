'use client'

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trophy, BookOpen, BarChart3 } from "lucide-react";

interface FinancialConcept {
    id: string;
    title: string;
    description: string;
    progress: number;
    isCompleted: boolean;
}

interface Achievement {
    id: string;
    title: string;
    description: string;
    progress: number;
    isCompleted: boolean;
    hasTrophy: boolean;
}

interface ProgressLesson {
    id: string;
    title: string;
    description: string;
    progress: number;
    isCompleted: boolean;
}

interface LearningData {
    financialConcepts: FinancialConcept[];
    achievements: Achievement[];
    progressLessons: ProgressLesson[];
}

const KidLearn = () => {
    const [learningData, setLearningData] = useState<LearningData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("learn");

    useEffect(() => {
        const fetchLearningData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Use placeholder data instead of mock API
                const placeholderLearningData: LearningData = {
                    financialConcepts: [
                        {
                            id: 'concept-1',
                            title: 'Understanding Money',
                            description: 'Learn the basics of money and its value',
                            progress: 100,
                            isCompleted: true
                        },
                        {
                            id: 'concept-2',
                            title: 'Saving vs Spending',
                            description: 'Understand the difference between saving and spending',
                            progress: 60,
                            isCompleted: false
                        },
                        {
                            id: 'concept-3',
                            title: 'Setting Financial Goals',
                            description: 'Learn how to set and achieve financial goals',
                            progress: 0,
                            isCompleted: false
                        }
                    ],
                    achievements: [
                        {
                            id: 'ach-1',
                            title: 'First Lesson Complete',
                            description: 'Completed your first financial lesson',
                            progress: 100,
                            isCompleted: true,
                            hasTrophy: true
                        },
                        {
                            id: 'ach-2',
                            title: 'Quick Learner',
                            description: 'Completed 3 lessons in one day',
                            progress: 100,
                            isCompleted: true,
                            hasTrophy: true
                        }
                    ],
                    progressLessons: [
                        {
                            id: 'progress-1',
                            title: 'Money Basics',
                            description: 'Learn fundamental concepts about money',
                            progress: 60,
                            isCompleted: false
                        },
                        {
                            id: 'progress-2',
                            title: 'Smart Spending',
                            description: 'Learn how to spend money wisely',
                            progress: 25,
                            isCompleted: false
                        }
                    ]
                };

                setLearningData(placeholderLearningData);
            } catch (err) {
                console.error('Error fetching learning data:', err);
                setError('Failed to load learning data');
            } finally {
                setLoading(false);
            }
        };

        fetchLearningData();
    }, []); const getProgressBadgeColor = (progress: number) => {
        if (progress >= 60) return "bg-green-100 text-green-800 hover:bg-green-100"; // Green
        if (progress >= 30) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"; // Yellow  
        return "bg-red-100 text-red-800 hover:bg-red-100"; // Red
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex space-x-1 p-1 bg-muted rounded-lg">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-64" />
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-5 w-12" />
                                    </div>
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-2 w-full" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !learningData) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <p className="text-destructive">{error || 'No learning data available'}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="learn" className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Learn
                    </TabsTrigger>
                    <TabsTrigger value="achievement" className="flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Achievement
                    </TabsTrigger>
                    <TabsTrigger value="progress" className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Progress
                    </TabsTrigger>
                </TabsList>                <TabsContent value="learn" className="mt-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-card-foreground">Financial Concept</h3>
                                    <p className="text-sm text-muted-foreground">Learn important financial concepts.</p>
                                </div>

                                <div className="space-y-4">
                                    {learningData.financialConcepts.map((concept) => (
                                        <Card key={concept.id} className="p-4 bg-muted/50">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-card-foreground mb-1">{concept.title}</h4>
                                                        <p className="text-sm text-muted-foreground">{concept.description}</p>
                                                    </div>
                                                    <Badge className={getProgressBadgeColor(concept.progress)}>
                                                        {concept.progress}%
                                                    </Badge>
                                                </div>
                                                <Progress
                                                    value={concept.progress}
                                                    className="h-3"
                                                />
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>                <TabsContent value="achievement" className="mt-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-card-foreground">Achievement</h3>
                                    <p className="text-sm text-muted-foreground">View how many trophies you&apos;ve earned</p>
                                </div>

                                <div className="space-y-4">
                                    {learningData.achievements.map((achievement) => (
                                        <Card key={achievement.id} className="p-4 bg-muted/50">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-card-foreground mb-1">{achievement.title}</h4>
                                                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                            {achievement.progress}%
                                                        </Badge>
                                                        {achievement.hasTrophy && (
                                                            <Trophy className="w-5 h-5 text-yellow-500" />
                                                        )}
                                                    </div>
                                                </div>
                                                <Progress
                                                    value={achievement.progress}
                                                    className="h-3"
                                                />
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>                <TabsContent value="progress" className="mt-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-card-foreground">Progress</h3>
                                    <p className="text-sm text-muted-foreground">Track your journey so far</p>
                                </div>

                                <div className="space-y-4">
                                    {learningData.progressLessons.map((lesson) => (
                                        <Card key={lesson.id} className="p-4 bg-muted/50">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-card-foreground mb-1">{lesson.title}</h4>
                                                        <p className="text-sm text-muted-foreground">{lesson.description}</p>
                                                    </div>
                                                    <Badge className={getProgressBadgeColor(lesson.progress)}>
                                                        {lesson.progress}%
                                                    </Badge>
                                                </div>
                                                <Progress
                                                    value={lesson.progress}
                                                    className="h-3"
                                                />
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default KidLearn