import { useState, useEffect } from 'react';
import { mockDataService, type Kid } from '@/lib/services/mockDataService';
import type { KidProfileEditForm } from './types';
import { toast } from "sonner";

export const useKidProfile = (kidId: string) => {
    const [kid, setKid] = useState<Kid | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<KidProfileEditForm>({
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
                setKid(kidData);
                setEditForm({
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

    const handleEdit = () => {
        setIsEditing(true);
    };

    return {
        kid,
        isLoading,
        isEditing,
        editForm,
        setEditForm,
        handleSave,
        handleCancel,
        handleEdit
    };
};
