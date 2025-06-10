import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera } from 'lucide-react';
import { mockDataService } from '@/lib/services/mockDataService';
import type { KidProfileSidebarProps } from './types';

export const KidProfileSidebar = ({ kid, isEditing }: KidProfileSidebarProps) => {
    return (
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
    );
};
