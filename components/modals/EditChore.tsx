"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import ChoreForm, { ChoreFormValues } from "./ChoreForm";
import { Task } from "@/components/dashboard/AppChoreManagement";

interface EditChoreProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
    onSubmit: (data: ChoreFormValues) => void;
    isLoading?: boolean;
    kids?: any[];
}

const EditChore = ({
    isOpen,
    onClose,
    task,
    onSubmit,
    isLoading,
}: EditChoreProps) => {
    // Adapt Task to ChoreFormValues
    const initialValues: Partial<ChoreFormValues> = {
        title: task.title,
        description: task.description,
        reward: typeof task.reward === "number" ? String(task.reward) : task.reward,
        dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
        assignedTo: task.assignedTo,
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl text-center">Edit Chore</DialogTitle>
                    <p className="text-center text-sm text-muted-foreground">
                        Update chore details and save your changes.
                    </p>
                </DialogHeader>

                <ChoreForm
                    initialValues={initialValues}
                    submitLabel="Save Changes"
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    isLoading={isLoading}
                    // initialId={task.id}
                    // isOpen={isOpen}
                    
                />
            </DialogContent>
        </Dialog>
    );
}

export default EditChore;