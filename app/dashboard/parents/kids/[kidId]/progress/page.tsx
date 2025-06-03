'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  BarChart3,
  Clock,
  CheckCircle,
  Star,
  Trophy
} from 'lucide-react';
import { mockDataService, type Kid } from '@/lib/services/mockDataService';

const KidProgressPage = () => {
  const params = useParams();
  const router = useRouter();
  const kidId = params.kidId as string;

  const [kid, setKid] = useState<Kid | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progressData, setProgressData] = useState({
    weeklyProgress: [] as { week: string; completed: number; assigned: number }[],
    categoryStats: [] as { category: string; completed: number; total: number }[],
    streaks: {
      current: 0,
      longest: 0
    },
    recentAchievements: [] as { title: string; date: string; type: string }[]
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const kidData = mockDataService.getKidById(kidId);
      if (kidData) {
        setKid(kidData);
        
        // Generate mock progress data
        const weeklyProgress = [
          { week: 'Week 1', completed: 8, assigned: 10 },
          { week: 'Week 2', completed: 7, assigned: 9 },
          { week: 'Week 3', completed: 9, assigned: 10 },
          { week: 'Week 4', completed: 10, assigned: 12 }
        ];

        const categoryStats = [
          { category: 'Household', completed: 15, total: 18 },
          { category: 'Personal Care', completed: 12, total: 14 },
          { category: 'School', completed: 8, total: 10 },
          { category: 'Outdoor', completed: 5, total: 6 }
        ];

        const recentAchievements = [
          { title: 'Week Warrior', date: '2024-01-08', type: 'weekly' },
          { title: 'Clean Streak', date: '2024-01-05', type: 'streak' },
          { title: 'Early Bird', date: '2024-01-03', type: 'special' },
          { title: 'Helper Hero', date: '2024-01-01', type: 'milestone' }
        ];

        setProgressData({
          weeklyProgress,
          categoryStats,
          streaks: { current: 5, longest: 12 },
          recentAchievements
        });
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [kidId]);

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

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-8 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-6 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-40 mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-32 mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!kid) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Kid Not Found</h2>
          <p className="text-gray-600 mb-4">The kid profile you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/dashboard/parents/kids')}>
            Back to Kids
          </Button>
        </div>
      </div>
    );
  }

  const completedTasks = mockDataService.getChoresByKidAndStatus(kidId, 'completed').length;
  const totalTasks = mockDataService.getChoresByKid(kidId).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Overall Progress</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">{kid.progress}%</div>
            <Progress value={kid.progress} className="h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Completion Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">{completionRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">{completedTasks}/{totalTasks} tasks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Current Streak</span>
            </div>
            <div className="text-2xl font-bold text-orange-600 mb-1">{progressData.streaks.current}</div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium">Level</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">{kid.level}</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Analytics Tabs */}
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
                    understand {kid.name}'s progress patterns over time.
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
                  {[
                    { name: 'Perfectionist', description: 'Complete 10 tasks perfectly', earned: true },
                    { name: 'Speed Demon', description: 'Complete 5 tasks early', earned: true },
                    { name: 'Consistent', description: '7-day completion streak', earned: true },
                    { name: 'Helper', description: 'Help with family tasks', earned: false },
                    { name: 'Organizer', description: 'Keep room tidy for a week', earned: false },
                    { name: 'Scholar', description: 'Complete all school tasks', earned: false }
                  ].map((badge, index) => (
                    <div 
                      key={index} 
                      className={`p-3 text-center rounded-lg border ${
                        badge.earned 
                          ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
                          : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                    >
                      <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        badge.earned ? 'bg-yellow-200' : 'bg-gray-200'
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
    </div>
  );
};

export default KidProgressPage;
