'use client'


import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, FileText, Trophy } from "lucide-react";


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




const KidStartLevel = () => {
    // Hardcoded data for demo/testing
    const financialConcepts: FinancialConcept[] = [
        {
            id: 'concept1',
            title: 'Budgeting Basics',
            description: 'Learn how to create and manage a budget.',
            icon: 'play',
            color: 'purple',
            level: 1,
            isCompleted: true,
            topics: ['Income', 'Expenses', 'Savings'],
        },
        {
            id: 'concept2',
            title: 'Saving Money',
            description: 'Discover the importance of saving.',
            icon: 'play',
            color: 'yellow',
            level: 2,
            isCompleted: false,
            topics: ['Goals', 'Piggy Bank'],
        },
    ];
    const financialQuiz: FinancialQuiz[] = [
        {
            id: 'quiz1',
            title: 'Budgeting Quiz',
            description: 'Test your budgeting knowledge.',
            icon: 'quiz',
            color: 'purple',
            level: 1,
            isCompleted: false,
            questions: [
                {
                    id: 'q1',
                    question: 'What is a budget?',
                    options: ['A spending plan', 'A type of food', 'A holiday'],
                    correctAnswer: 0,
                },
            ],
        },
    ];

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
    }; const getIconBgColor = (color: string) => {
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

    // Remove loading and error UI

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


            </div>
            <div className="flex justify-center">
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