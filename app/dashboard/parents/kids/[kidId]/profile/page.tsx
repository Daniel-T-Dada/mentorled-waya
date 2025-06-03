'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Camera, Edit, Save, X } from 'lucide-react';
import { mockDataService, type Kid } from '@/lib/services/mockDataService';
import { toast } from "sonner";

const KidProfilePage = () => {
  const params = useParams();
  const router = useRouter();
  const kidId = params.kidId as string;

  const [kid, setKid] = useState<Kid | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    age: 0,
    grade: '',
    school: '',
    interests: '',
    allowanceAmount: 0,
    goals: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const kidData = mockDataService.getKidById(kidId);
      if (kidData) {
        setKid(kidData);        setEditForm({
          name: kidData.name,
          age: kidData.age || 12,
          grade: kidData.grade || '',
          school: kidData.school || '',
          interests: kidData.interests?.join(', ') || '',
          allowanceAmount: kidData.allowanceAmount || 0,
          goals: kidData.goals || ''
        });
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [kidId]);

  const handleSave = () => {
    if (!kid) return;

    // Update the kid data (in a real app, this would make an API call)
    const updatedKid = {
      ...kid,
      name: editForm.name,
      age: editForm.age,
      grade: editForm.grade,
      school: editForm.school,
      interests: editForm.interests.split(',').map(i => i.trim()).filter(Boolean),
      allowanceAmount: editForm.allowanceAmount,
      goals: editForm.goals
    };

    setKid(updatedKid);
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleCancel = () => {
    if (!kid) return;
      setEditForm({
      name: kid.name,
      age: kid.age || 12,
      grade: kid.grade || '',
      school: kid.school || '',
      interests: kid.interests?.join(', ') || '',
      allowanceAmount: kid.allowanceAmount || 0,
      goals: kid.goals || ''
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-8 w-32" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
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
          <h1 className="text-2xl font-bold">Profile - {kid.name}</h1>
        </div>
        
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture & Quick Stats */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={kid.avatar ?? undefined} alt={kid.name} />
                  <AvatarFallback className="text-2xl">{kid.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
                    disabled
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <h2 className="text-xl font-semibold mb-1">{kid.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">Level {kid.level}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                  <span className="text-sm">Balance</span>
                  <span className="font-semibold">NGN {kid.balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                  <span className="text-sm">Total Tasks</span>
                  <span className="font-semibold">{mockDataService.getChoresByKid(kid.id).length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                  <span className="text-sm">Completed</span>
                  <span className="font-semibold text-green-600">
                    {mockDataService.getChoresByKidAndStatus(kid.id, 'completed').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">🏆 First Task</Badge>
                <Badge variant="secondary">⭐ Star Student</Badge>
                <Badge variant="secondary">💰 Saver</Badge>
                {kid.level >= 5 && <Badge variant="secondary">🚀 Level 5</Badge>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded-md">{kid.name}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  {isEditing ? (
                    <Input
                      id="age"
                      type="number"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) || 0 })}
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded-md">{kid.age} years old</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  {isEditing ? (
                    <Input
                      id="grade"
                      value={editForm.grade}
                      onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                      placeholder="e.g., 5th Grade"
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded-md">{kid.grade || 'Not specified'}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  {isEditing ? (
                    <Input
                      id="school"
                      value={editForm.school}
                      onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                      placeholder="School name"
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded-md">{kid.school || 'Not specified'}</div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="interests">Interests</Label>
                  {isEditing ? (
                    <Input
                      id="interests"
                      value={editForm.interests}
                      onChange={(e) => setEditForm({ ...editForm, interests: e.target.value })}
                      placeholder="Comma-separated interests (e.g., Soccer, Reading, Art)"
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded-md">
                      {kid.interests?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {kid.interests.map((interest, i) => (
                            <Badge key={i} variant="outline">{interest}</Badge>
                          ))}
                        </div>
                      ) : (
                        'No interests specified'
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allowance">Weekly Allowance</Label>
                  {isEditing ? (
                    <Input
                      id="allowance"
                      type="number"
                      value={editForm.allowanceAmount}
                      onChange={(e) => setEditForm({ ...editForm, allowanceAmount: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded-md">
                      NGN {kid.allowanceAmount?.toLocaleString() || '0'}
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="goals">Goals</Label>
                  {isEditing ? (
                    <Textarea
                      id="goals"
                      value={editForm.goals}
                      onChange={(e) => setEditForm({ ...editForm, goals: e.target.value })}
                      placeholder="What are their current goals?"
                      rows={3}
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded-md min-h-[80px]">
                      {kid.goals || 'No goals specified'}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KidProfilePage;
