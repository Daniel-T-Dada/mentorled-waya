import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Return the same structure as mockDataService.getFinancialQuiz()
        const quizData = [
            {
                id: 'quiz-1',
                title: 'Financial Quiz',
                description: 'Test your knowledge with fun financial questions',
                icon: 'quiz',
                color: 'purple',
                level: 1,
                isCompleted: false,
                questions: [
                    {
                        id: 'q1',
                        question: 'What is the best way to save money?',
                        options: ['Spend it all', 'Put it in a piggy bank', 'Give it away', 'Lose it'],
                        correctAnswer: 1
                    },
                    {
                        id: 'q2',
                        question: 'Why is it important to budget?',
                        options: ['To waste money', 'To plan spending', 'To forget about money', 'To spend more'],
                        correctAnswer: 1
                    }
                ]
            }
        ];

        return NextResponse.json(quizData, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error fetching financial quiz:', error);
        return NextResponse.json(
            { error: 'Failed to fetch financial quiz' },
            { status: 500 }
        );
    }
}