'use client'

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

import { Badge } from "@/components/ui/badge";
import { Trophy, BookOpen, BarChart3 } from "lucide-react";





interface ApiConcept {
    id: string;
    title: string;
    description: string;
    level: number;
    sections: any[];
}
interface ApiConceptProgress {
    id: number;
    child: string;
    concept: ApiConcept;
    progress_percentage: string;
    completed: boolean;
    unlocked: boolean;
}
interface KidLearnProps {
    concepts: ApiConcept[];
    conceptsProgress: ApiConceptProgress[];
}

const KidLearn = ({ concepts, conceptsProgress }: KidLearnProps) => {
    // Remove unused learningData, loading, error state for now
    const [activeTab, setActiveTab] = useState("learn");

    const financialConcepts = useMemo(() => {
        if (!concepts) return [];
        return concepts.map(concept => {
            const progressEntry = conceptsProgress.find(p => p.concept.id === concept.id);
            return {
                id: concept.id,
                title: concept.title,
                level: concept.level,
                description: concept.description,
                progress: progressEntry ? Number(progressEntry.progress_percentage) : 0,
                isCompleted: progressEntry ? progressEntry.completed : false,
                unlocked: progressEntry ? progressEntry.unlocked : true,
            };
        });
    }, [concepts, conceptsProgress]);
    const getProgressBadgeColor = (progress: number) => {
        if (progress >= 60) return "bg-green-100 text-green-800 hover:bg-green-100";
        if (progress >= 30) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
        return "bg-red-100 text-red-800 hover:bg-red-100";
    };





    // Remove loading and error UI for now
    // Hardcoded data for Achievement and Progress tabs
    const hardcodedAchievements = [
        {
            id: 'achv1',
            title: 'First Steps',
            description: 'Completed your first lesson!',
            progress: 100,
            isCompleted: true,
            hasTrophy: true,
        },
        {
            id: 'achv2',
            title: 'Halfway There',
            description: 'Reached 50% progress in a concept.',
            progress: 50,
            isCompleted: false,
            hasTrophy: false,
        },
    ];
    const hardcodedProgressLessons = [
        {
            id: 'lesson1',
            title: 'Budgeting Basics',
            description: 'Learned how to create a budget.',
            progress: 100,
            isCompleted: true,
        },
        {
            id: 'lesson2',
            title: 'Saving Money',
            description: 'Discovered the importance of saving.',
            progress: 60,
            isCompleted: false,
        },
    ];

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
                </TabsList>

                {/* Financial Concepts */}
                <TabsContent value="learn" className="mt-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-card-foreground">Financial Concept</h3>
                                    <p className="text-sm text-muted-foreground">Learn important financial concepts.</p>
                                </div>

                                <div className="space-y-4">
                                    {financialConcepts.map((concept) => (
                                        <Card key={concept.id} className="p-4 bg-muted/50">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-card-foreground mb-1">{concept.level}</h4>
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
                </TabsContent>

                {/* Achievements */}
                <TabsContent value="achievement" className="mt-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-card-foreground">Achievement</h3>
                                    <p className="text-sm text-muted-foreground">View how many trophies you&apos;ve earned</p>
                                </div>
                                <div className="space-y-4">
                                    {hardcodedAchievements.map((achievement) => (
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
                </TabsContent>

                {/* Progress */}
                <TabsContent value="progress" className="mt-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-card-foreground">Progress</h3>
                                    <p className="text-sm text-muted-foreground">Track your journey so far</p>
                                </div>
                                <div className="space-y-4">
                                    {hardcodedProgressLessons.map((lesson) => (
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