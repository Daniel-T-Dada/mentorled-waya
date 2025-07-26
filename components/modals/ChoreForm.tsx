"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useKid } from "@/contexts/KidContext";
import { formatNaira } from "@/lib/utils/currency";

interface Kid {
    id: string;
    name: string;
    username: string;
}

export interface ChoreFormValues {
    title: string;
    description: string;
    reward: string;
    dueDate: Date;
    assignedTo: string;
}

interface ChoreFormProps {
    initialValues?: Partial<ChoreFormValues>;
    isLoading?: boolean;
    submitLabel: string;
    onSubmit: (data: ChoreFormValues) => void;
    onCancel: () => void;
    preSelectedKid?: string;
    successStep?: boolean;
    // Removed unused isOpen and initialId props
}

const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const ChoreForm = ({
    initialValues,
    isLoading,
    submitLabel,
    onSubmit,
    onCancel,
    preSelectedKid,
    // Removed isOpen,
    // Removed initialId,
}: ChoreFormProps) => {
    const { kids, getKidDisplayName } = useKid();
    const [formData, setFormData] = useState<ChoreFormValues>({
        title: "",
        description: "",
        reward: "",
        dueDate: new Date(),
        assignedTo: "",
        ...initialValues,
    });

    // Removed usePrevious

    const [calendarOpen, setCalendarOpen] = useState(false);

    // Convert KidContext kids to modal Kid format
    const modalKids: Kid[] = kids.map(kid => ({
        id: kid.id,
        name: getKidDisplayName(kid),
        username: kid.username
    }));

    // Update assignedTo field when preSelectedKid changes
    useEffect(() => {
        if (preSelectedKid) {
            setFormData(prev => ({
                ...prev,
                assignedTo: preSelectedKid
            }));
        }
    }, [preSelectedKid]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "reward") {
            // Only allow numbers and commas
            const raw = value.replace(/[^0-9]/g, "");
            setFormData({
                ...formData,
                reward: raw === "" ? "" : formatNaira(Number(raw))
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSelectChange = (value: string) => {
        setFormData({
            ...formData,
            assignedTo: value,
        });
    };

    // Calendar: Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isDateDisabled = (date: Date) => {
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate < today;
    };

    // When user selects a date, close the calendar
    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setFormData(prev => ({ ...prev, dueDate: date }));
            setCalendarOpen(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Remove formatting for the reward before submitting
        const plainReward = formData.reward.replace(/[^0-9]/g, "");
        onSubmit({ ...formData, reward: plainReward });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                    Title<span className="text-destructive">*</span>
                </Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="Title"
                    value={formData.title}
                    onChange={handleChange}
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
                    placeholder="Enter task description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="resize-none min-h-[80px]"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="reward" className="text-sm font-medium">
                    Reward<span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                    <Input
                        id="reward"
                        name="reward"
                        type="text"
                        inputMode="numeric"
                        placeholder="1,000"
                        value={formData.reward}
                        onChange={handleChange}
                        className="pl-4"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-medium">
                    Due Date<span className="text-destructive">*</span>
                </Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.dueDate && "text-muted-foreground"
                            )}
                            type="button"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.dueDate ? formatDate(formData.dueDate) : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={formData.dueDate}
                            onSelect={handleDateSelect}
                            disabled={isDateDisabled}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label className="text-sm font-medium">
                    Assign To<span className="text-destructive">*</span>
                </Label>
                <Select value={formData.assignedTo} onValueChange={handleSelectChange} required>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a child" />
                    </SelectTrigger>
                    <SelectContent>
                        {modalKids.map((kid) => (
                            <SelectItem key={kid.id} value={kid.id}>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                                        {kid.name?.charAt(0) || kid.username.charAt(0)}
                                    </div>
                                    <span>{kid.name || kid.username}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? (submitLabel === "Create Chore" ? "Creating..." : "Saving...") : submitLabel}
                </Button>
            </div>
        </form>
    );
}

export default ChoreForm;