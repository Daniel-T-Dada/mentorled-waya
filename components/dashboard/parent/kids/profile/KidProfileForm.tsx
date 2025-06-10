import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { KidProfileFormProps } from './types';

export const KidProfileForm = ({ kid, isEditing, editForm, onFormChange }: KidProfileFormProps) => {
    return (
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
                                    onChange={(e) => onFormChange({ ...editForm, name: e.target.value })}
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
                                    onChange={(e) => onFormChange({ ...editForm, age: parseInt(e.target.value) || 0 })}
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
                                    onChange={(e) => onFormChange({ ...editForm, grade: e.target.value })}
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
                                    onChange={(e) => onFormChange({ ...editForm, school: e.target.value })}
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
                                    onChange={(e) => onFormChange({ ...editForm, interests: e.target.value })}
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
                                    onChange={(e) => onFormChange({ ...editForm, allowanceAmount: parseInt(e.target.value) || 0 })}
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
                                    onChange={(e) => onFormChange({ ...editForm, goals: e.target.value })}
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
    );
};
