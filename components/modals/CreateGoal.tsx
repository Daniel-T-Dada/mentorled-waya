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
import { mockDataService } from "@/lib/services/mockDataService";

interface CreateGoalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    kidId: string;
}

interface GoalFormData {
    title: string;
    description: string;
    targetAmount: string;
    deadline: Date;
    category: string;
}

function GoalForm({ formData, onChange, onDateChange }: {
    formData: GoalFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onDateChange: (date: Date) => void;
}) {
    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                    Title<span className="text-destructive">*</span>
                </Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="Goal Title"
                    value={formData.title}
                    onChange={onChange}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                    Description<span className="text-destructive">*</span>
                </Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your goal"
                    value={formData.description}
                    onChange={onChange}
                    required
                    className="resize-none min-h-[80px]"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="targetAmount" className="text-sm font-medium">
                    Target Amount<span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        NGN
                    </span>
                    <Input
                        id="targetAmount"
                        name="targetAmount"
                        type="text"
                        placeholder="10,000"
                        value={formData.targetAmount}
                        onChange={onChange}
                        className="pl-12"
                        required
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="deadline" className="text-sm font-medium">
                    Deadline<span className="text-destructive">*</span>
                </Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.deadline && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.deadline ? formData.deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={formData.deadline}
                            onSelect={date => date && onDateChange(date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                    Category
                </Label>
                <Input
                    id="category"
                    name="category"
                    placeholder="e.g. Savings, Education, Gift"
                    value={formData.category}
                    onChange={onChange}
                />
            </div>
        </>
    );
}

function GoalSuccess({ onDone }: { onDone: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Goal Created!</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
                Your new goal has been successfully created.
            </p>
            <Button onClick={onDone}>
                Done
            </Button>
        </div>
    );
}

export function CreateGoal({ isOpen, onClose, onSuccess, kidId }: CreateGoalProps) {
    const [step, setStep] = useState<"form" | "success">("form");
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<GoalFormData>({
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

    const handleDateChange = (date: Date) => {
        setFormData(prev => ({ ...prev, deadline: date }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true); try {            // For now, always use mock
            mockDataService.createMockGoal(
                formData.title,
                formData.description,
                Number(formData.targetAmount.replace(/[^0-9]/g, "")),
                formData.deadline,
                kidId,
                formData.category || "General"
            );
            setStep("success");
            if (onSuccess) onSuccess();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
            // Could add toast here
            setStep("success");
        } finally {
            setIsLoading(false);
        }
    };

    const closeAndReset = () => {
        onClose();
        setTimeout(() => {
            setFormData({
                title: "",
                description: "",
                targetAmount: "",
                deadline: new Date(),
                category: ""
            });
            setStep("form");
        }, 300);
    };

    const handleSuccess = () => {
        closeAndReset();
        if (onSuccess) onSuccess();
    };

    return (
        <Dialog open={isOpen} onOpenChange={closeAndReset}>
            <DialogContent className="sm:max-w-md">
                {step === "form" ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-xl text-center">Create New Goal</DialogTitle>
                            <p className="text-center text-sm text-muted-foreground">
                                Set a savings goal to start tracking your progress!
                            </p>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <GoalForm
                                formData={formData}
                                onChange={handleChange}
                                onDateChange={handleDateChange}
                            />
                            <DialogFooter className="mt-6">
                                <Button type="button" variant="outline" onClick={closeAndReset}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Creating..." : "Create Goal"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                ) : (
                    <GoalSuccess onDone={handleSuccess} />
                )}
            </DialogContent>
        </Dialog>
    );
}

export default CreateGoal; 