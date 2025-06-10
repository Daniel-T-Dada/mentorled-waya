import type { Kid } from '@/lib/services/mockDataService';

export interface KidProfileEditForm {
    name: string;
    age: number;
    grade: string;
    school: string;
    interests: string;
    allowanceAmount: number;
    goals: string;
}

export interface KidProfileHeaderProps {
    kid: Kid;
    isEditing: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onBack: () => void;
}

export interface KidProfileSidebarProps {
    kid: Kid;
    isEditing: boolean;
    onAvatarChange?: (file: File) => void;
}

export interface KidProfileFormProps {
    kid: Kid;
    isEditing: boolean;
    editForm: KidProfileEditForm;
    onFormChange: (form: KidProfileEditForm) => void;
}

export interface KidProfileManagementProps {
    kidId: string;
}
