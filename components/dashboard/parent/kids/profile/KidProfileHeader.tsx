import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Save, X } from 'lucide-react';
import type { KidProfileHeaderProps } from './types';

export const KidProfileHeader = ({
    kid,
    isEditing,
    onEdit,
    onSave,
    onCancel,
    onBack
}: KidProfileHeaderProps) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onBack}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold">Profile - {kid.name}</h1>
            </div>

            {!isEditing ? (
                <Button onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                </Button>
            ) : (
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button onClick={onSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            )}
        </div>
    );
};
