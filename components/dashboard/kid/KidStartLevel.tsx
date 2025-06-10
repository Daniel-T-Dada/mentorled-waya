'use client'

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, FileText, Trophy } from "lucide-react";
import { MockApiService } from "@/lib/services/mockApiService";
import { mockDataService } from "@/lib/services/mockDataService";

interface FinancialConcept {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    level: number;
    isCompleted: boolean;
    topics?: string[];
}

interface FinancialQuiz {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    level: number;
    isCompleted: boolean;
    questions?: Array<{
        id: string;
        question: string;
        options: string[];
        correctAnswer: number;
    }>;
}

interface EarnReward {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    level: number;
    isCompleted: boolean;
    rewards?: Array<{
        type: string;
        amount?: number;
        name?: string;
        description: string;
    }>;
}

const KidStartLevel = () => {
    const [financialConcepts, setFinancialConcepts] = useState<FinancialConcept[]>([]);
    const [financialQuiz, setFinancialQuiz] = useState<FinancialQuiz[]>([]);
    const [earnReward, setEarnReward] = useState<EarnReward[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFinancialEducationData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Try to fetch from API first
                try {
                    const [conceptsData, quizData, rewardData] = await Promise.all([
                        MockApiService.fetchFinancialConcepts(),
                        MockApiService.fetchFinancialQuiz(),
                        MockApiService.fetchEarnReward()
                    ]);

                    setFinancialConcepts(conceptsData);
                    setFinancialQuiz(quizData);
                    setEarnReward(rewardData);
                } catch (apiError) {
                    console.log('API fetch failed, falling back to direct mock data service:', apiError);

                    // Fallback to direct mock data service
                    const conceptsData = mockDataService.getFinancialConcepts();
                    const quizData = mockDataService.getFinancialQuiz();
                    const rewardData = mockDataService.getEarnReward();

                    setFinancialConcepts(conceptsData);
                    setFinancialQuiz(quizData);
                    setEarnReward(rewardData);
                }
            } catch (err) {
                console.error('Error fetching financial education data:', err);
                setError('Failed to load financial education data');
            } finally {
                setLoading(false);
            }
        };

        fetchFinancialEducationData();
    }, []);

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'play':
                return <Play className="w-8 h-8" />;
            case 'quiz':
                return <FileText className="w-8 h-8" />;
            case 'trophy':
                return <Trophy className="w-8 h-8" />;
            default:
                return <Play className="w-8 h-8" />;
        }
    };    const getIconBgColor = (color: string) => {
        switch (color) {
            case 'purple':
                return 'bg-primary/10';
            case 'yellow':
                return 'bg-chart-4/10';
            default:
                return 'bg-primary/10';
        }
    };

    const getIconColor = (color: string) => {
        switch (color) {
            case 'purple':
                return 'text-primary';
            case 'yellow':
                return 'text-chart-4';
            default:
                return 'text-primary';
        }
    };

    if (loading) {
        return (
            <main>
                <div className="mb-6 flex items-center justify-between">
                    <div className="">
                        <Skeleton className="h-7 w-32 mb-2" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index} className="text-center p-6">
                            <CardContent className="p-0">
                                <div className="space-y-4">
                                    <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center">
                                        <Skeleton className="w-16 h-16 rounded-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-32 mx-auto" />
                                        <Skeleton className="h-4 w-48 mx-auto" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-center">
                    <Skeleton className="h-12 w-32" />
                </div>
            </main>
        );
    }

    if (error) {
        return (            <main>
                <div className="mb-6 flex items-center justify-between">
                    <div className="">
                        <h2 className="text-xl font-semibold text-card-foreground">Financial Education</h2>
                        <p className="text-muted-foreground">Learn, quiz, and earn rewards through financial education</p>
                    </div>
                </div>

                <Card>
                    <CardContent className="flex items-center justify-center py-8">
                        <p className="text-destructive">{error}</p>
                    </CardContent>
                </Card>
            </main>
        );
    }

    return (
        <main className="border p-8 rounded-lg bg-muted/40">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 ">
                {/* Financial Concepts Card */}
                {financialConcepts.map((concept) => (
                    <Card key={concept.id} className="text-center p-6 bg-background hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-0">
                            <div className="space-y-4">
                                <div className={`mx-auto w-16 h-16 rounded-full ${getIconBgColor(concept.color)} flex items-center justify-center`}>
                                    <div className={getIconColor(concept.color)}>
                                        {getIcon(concept.icon)}
                                    </div>
                                </div>                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-card-foreground">{concept.title}</h3>
                                    <p className="text-sm text-muted-foreground">{concept.description}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Financial Quiz Card */}
                {financialQuiz.map((quiz) => (
                    <Card key={quiz.id} className="text-center bg-background p-6 hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-0">
                            <div className="space-y-4">
                                <div className={`mx-auto w-16 h-16 rounded-full ${getIconBgColor(quiz.color)} flex items-center justify-center`}>
                                    <div className={getIconColor(quiz.color)}>
                                        {getIcon(quiz.icon)}
                                    </div>
                                </div>                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-card-foreground">{quiz.title}</h3>
                                    <p className="text-sm text-muted-foreground">{quiz.description}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Earn Reward Card */}
                {earnReward.map((reward) => (
                    <Card key={reward.id} className="text-center p-6 bg-background hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-0">
                            <div className="space-y-4">
                                <div className={`mx-auto w-16 h-16 rounded-full ${getIconBgColor(reward.color)} flex items-center justify-center`}>
                                    <div className={getIconColor(reward.color)}>
                                        {getIcon(reward.icon)}
                                    </div>
                                </div>                                
                                
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-card-foreground">{reward.title}</h3>
                                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>            <div className="flex justify-center">
                <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg"
                    size="lg"
                >
                    Start Level 1
                </Button>
            </div>
        </main>
    )
}
export default KidStartLevel