"use client";

import { useState, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { mockDataService } from "@/lib/services/mockDataService";
import { useKid } from "@/contexts/KidContext";

interface Kid {
  id: string;
  name: string;
  username: string;
}

interface CreateChoreProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preSelectedKid?: string;
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export function CreateChore({ isOpen, onClose, onSuccess, preSelectedKid }: CreateChoreProps) {
  const { data: session } = useSession();
  const { kids, getKidDisplayName } = useKid();
  const [step, setStep] = useState<"form" | "success">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [usedMockData, setUsedMockData] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reward: "",
    dueDate: new Date(),
    assignedTo: ""
  });

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
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRadioChange = (value: string) => {
    setFormData({
      ...formData,
      assignedTo: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); try {
      // Parse the reward value to a number, removing any non-numeric characters
      const rewardValue = Number(formData.reward.replace(/[^0-9]/g, ''));

      console.log('CreateChore - User session:', {
        id: session?.user?.id,
        role: session?.user?.role,
        hasAccessToken: !!session?.user?.accessToken
      });

      console.log('CreateChore - Form data being sent:', {
        ...formData,
        parentId: session?.user?.id,
        dueDate: formData.dueDate.toISOString(),
        reward: rewardValue
      });

      console.log('CreateChore - Attempting to create chore...');

      const response = await fetch(getApiUrl(API_ENDPOINTS.CREATE_TASK), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },        
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          reward: rewardValue,
          due_date: formData.dueDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
          assignedTo: formData.assignedTo, // Changed from assigned_to to assignedTo
          parentId: session?.user?.id // Added missing parentId
        }),
      }); 
      console.log('CreateChore - Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('CreateChore - API Error:', error);
        throw new Error(error.error || 'Failed to create chore');
      }

      const responseData = await response.json();
      console.log('CreateChore - Success:', responseData);

      setStep("success");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating chore:', error);

      // Use mock data as fallback
      toast.warning("Using mock data", {
        description: "API call failed. Creating a mock chore for development."
      });

      // Create a mock chore using mockDataService
      mockDataService.createMockChore(
        formData.title,
        formData.description,
        Number(formData.reward.replace(/[^0-9]/g, '')),
        formData.assignedTo,
        formData.dueDate,
        session?.user?.id || 'mock-parent-id'
      );

      setUsedMockData(true);
      setStep("success");
      if (onSuccess) onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  const closeAndReset = () => {
    onClose();
    // Reset form after closing animation completes
    setTimeout(() => {
      setFormData({
        title: "",
        description: "",
        reward: "",
        dueDate: new Date(),
        assignedTo: ""
      });
      setStep("form");
      setUsedMockData(false);
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
              <DialogTitle className="text-xl text-center">Create Chore</DialogTitle>              <p className="text-center text-sm text-muted-foreground">
                {preSelectedKid
                  ? `Create a new chore for ${modalKids.find(k => k.id === preSelectedKid)?.name || 'selected kid'}`
                  : "Create a new chore for your kids"}
              </p>
            </DialogHeader>

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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    NGN
                  </span>
                  <Input
                    id="reward"
                    name="reward"
                    type="text"
                    placeholder="1,000"
                    value={formData.reward}
                    onChange={handleChange}
                    className="pl-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-medium">
                  Due Date<span className="text-destructive">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate ? formatDate(formData.dueDate) : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, dueDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Assign To<span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={formData.assignedTo} onValueChange={handleRadioChange}
                  className="flex flex-col space-y-2"
                >
                  {modalKids.map((kid) => (
                    <div key={kid.id} className="flex items-center space-x-2 rounded-md border p-3">
                      <RadioGroupItem value={kid.id} id={kid.id} />
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                          {kid.name?.charAt(0) || kid.username.charAt(0)}
                        </div>
                        <Label htmlFor={kid.id} className="cursor-pointer">{kid.name || kid.username}</Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeAndReset}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Chore"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Chore Created!</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              The chore has been successfully created and assigned.
              {usedMockData && (
                <span className="block text-xs mt-2 text-yellow-500">
                  (Mock data - API connection failed)
                </span>
              )}
            </p>
            <Button onClick={handleSuccess}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 