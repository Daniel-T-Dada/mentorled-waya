'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Plus, Clock, CheckCircle, XCircle, Calendar, Trophy } from 'lucide-react';
import { mockDataService, type Kid, type Chore } from '@/lib/services/mockDataService';

const KidTasksPage = () => {
  const params = useParams();
  const router = useRouter();
  const kidId = params.kidId as string;

  const [kid, setKid] = useState<Kid | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<{
    pending: Chore[];
    completed: Chore[];
    overdue: Chore[];
  }>({
    pending: [],
    completed: [],
    overdue: []
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const kidData = mockDataService.getKidById(kidId);
      if (kidData) {
        setKid(kidData);
        
        const allTasks = mockDataService.getChoresByKid(kidId);
        const now = new Date();
          setTasks({
          pending: mockDataService.getChoresByKidAndStatus(kidId, 'pending').filter(task => {
            if (!task.dueDate) return true; // If no due date, consider it pending
            const dueDate = new Date(task.dueDate);
            return dueDate >= now;
          }),
          completed: mockDataService.getChoresByKidAndStatus(kidId, 'completed'),
          overdue: mockDataService.getChoresByKidAndStatus(kidId, 'pending').filter(task => {
            if (!task.dueDate) return false; // If no due date, can't be overdue
            const dueDate = new Date(task.dueDate);
            return dueDate < now;
          })
        });
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [kidId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const TaskCard = ({ task, status }: { task: Chore; status: string }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(status)}
              <h3 className="font-medium">{task.title}</h3>
              <Badge className={getStatusColor(status)}>{status}</Badge>
            </div>
            
            {task.description && (
              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(task.dueDate)}
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                NGN {task.reward.toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <Badge variant="outline">{task.category}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-8 w-32" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-6 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-40 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
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

  const totalTasks = tasks.pending.length + tasks.completed.length + tasks.overdue.length;
  const completionRate = totalTasks > 0 ? (tasks.completed.length / totalTasks) * 100 : 0;

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
            <h1 className="text-2xl font-bold">Tasks - {kid.name}</h1>
          </div>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Assign New Task
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{tasks.pending.length}</div>
            <p className="text-sm text-muted-foreground">Pending Tasks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{tasks.completed.length}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{tasks.overdue.length}</div>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{completionRate.toFixed(0)}%</div>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Tasks Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({tasks.pending.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({tasks.completed.length})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue ({tasks.overdue.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="mt-6">
              {tasks.pending.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Pending Tasks</h3>
                  <p>All tasks are either completed or overdue.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.pending.map(task => (
                    <TaskCard key={task.id} task={task} status="pending" />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-6">
              {tasks.completed.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Completed Tasks</h3>
                  <p>Tasks completed by {kid.name} will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.completed.map(task => (
                    <TaskCard key={task.id} task={task} status="completed" />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="overdue" className="mt-6">
              {tasks.overdue.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                  <h3 className="text-lg font-medium mb-2">Great Job!</h3>
                  <p>No overdue tasks. {kid.name} is staying on track!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-red-800 mb-1">Attention Required</h4>
                    <p className="text-sm text-red-600">
                      {kid.name} has {tasks.overdue.length} overdue task{tasks.overdue.length > 1 ? 's' : ''}. 
                      Consider sending a reminder or adjusting the due dates.
                    </p>
                  </div>
                  {tasks.overdue.map(task => (
                    <TaskCard key={task.id} task={task} status="overdue" />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default KidTasksPage;
