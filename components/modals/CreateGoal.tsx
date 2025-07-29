"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarIcon, CheckIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CreateGoalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (goalData: any) => void;
    isLoading?: boolean;
    error?: Error;
    kidId?: string;
}

interface GoalFormData {
    title: string;
    description: string;
    targetAmount: string;
    deadline: Date;
    category: string;
}

function calculateTargetDurationMonths(deadline: Date): number {
    const now = new Date();
    const d = new Date(deadline);
    // Calculate full months between now and deadline
    return Math.max(1, (d.getFullYear() - now.getFullYear()) * 12 + d.getMonth() - now.getMonth());
}

export function CreateGoal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    error,
}: CreateGoalProps) {
    const [formData, setFormData] = useState<GoalFormData>({
        title: "",
        description: "",
        targetAmount: "",
        deadline: new Date(),
        category: ""
    });

    const resetForm = () => setFormData({
        title: "",
        description: "",
        targetAmount: "",
        deadline: new Date(),
        category: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Popover state for calendar
    const [calendarOpen, setCalendarOpen] = useState(false);

    const handleDateChange = (date: Date) => {
        setFormData(prev => ({ ...prev, deadline: date }));
        setCalendarOpen(false); // Close calendar when a date is selected
    };

    const [step, setStep] = useState<"form" | "success">("form");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Compose request matching backend
        const goalData = {
            title: formData.title,
            description: formData.description,
            target_amount: formData.targetAmount,
            target_duration_months: calculateTargetDurationMonths(formData.deadline),
            category: formData.category,
            // Optionally add deadline if backend supports it
        };
        onSubmit(goalData);
        setStep("success");
        resetForm();
    };

    const closeAndReset = () => {
        setStep("form");
        resetForm();
        onClose();
    };

    // Disable dates in the past (everything before today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <Dialog open={isOpen} onOpenChange={closeAndReset}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl text-center">Create New Goal</DialogTitle>
                    <p className="text-center text-sm text-muted-foreground">
                        Set a savings goal to start tracking your progress!
                    </p>
                </DialogHeader>
                {step === "form" ? (
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title<span className="text-destructive">*</span></Label>
                            <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="targetAmount">Target Amount<span className="text-destructive">*</span></Label>
                            <Input id="targetAmount" name="targetAmount" value={formData.targetAmount} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deadline">Deadline<span className="text-destructive">*</span></Label>
                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.deadline && "text-muted-foreground"
                                        )}
                                        type="button"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.deadline
                                            ? formData.deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                            : <span>Pick a date</span>
                                        }
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.deadline}
                                        onSelect={date => date && handleDateChange(date)}
                                        initialFocus
                                        disabled={(date) => date < today}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            {/* <Label htmlFor="category">Category</Label> */}
                            {/* <Input id="category" name="category" value={formData.category} onChange={handleChange} /> */}
                        </div>
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={closeAndReset}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Creating..." : "Create Goal"}
                            </Button>
                        </DialogFooter>
                        {error && <div className="text-red-600 text-xs mt-2">Error: {error.message}</div>}
                    </form>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <CheckIcon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Goal Created!</h3>
                        <p className="text-sm text-muted-foreground text-center mb-6">
                            Your new goal has been successfully created.
                        </p>
                        <Button onClick={closeAndReset}>
                            Done
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default CreateGoal;