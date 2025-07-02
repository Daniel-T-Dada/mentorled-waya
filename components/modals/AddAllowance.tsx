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
import { CheckIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { createAllowancePayload } from '@/lib/utils/allowanceTransforms';

interface AddAllowanceProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Kid {
  id: string;
  name: string;
  username: string;
  parentId: string;
}

export function AddAllowance({ isOpen, onClose, onSuccess }: AddAllowanceProps) {
  const { data: session } = useSession();
  const [step, setStep] = useState<"form" | "success">("form");
  const [kids, setKids] = useState<Kid[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    kidName: "",
    amount: "",
    frequency: "once"
  });

  // Fetch kids data when modal opens
  useEffect(() => {
    const fetchKids = async () => {
      if (!session?.user?.id) return;

      try {
        // const response = await fetch(`http://localhost:3001/api/parent/${session.user.id}/kids`);
        const response = await fetch(getApiUrl(API_ENDPOINTS.LIST_CHILDREN), {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.user.accessToken}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch kids');
        const data = await response.json();
        setKids(data);
      } catch (error) {
        console.error('Error fetching kids:', error);
        toast.error('Failed to load children list', {
          description: 'Please try again or contact support if the problem persists.'
        });
        setKids([]); // Set empty array instead of mock data
      }
    };

    if (isOpen) {
      fetchKids();
    }
  }, [isOpen, session?.user?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only allow numbers and commas
    if (name === 'amount') {
      const numericValue = value.replace(/[^0-9,]/g, '');
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRadioChange = (value: string) => {
    setFormData({
      ...formData,
      frequency: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      // Find the selected kid's ID
      const selectedKid = kids.find(k => k.name === formData.kidName);
      if (!selectedKid) throw new Error('Selected kid not found');

      // Convert amount string to number (remove commas)
      const amount = parseInt(formData.amount.replace(/,/g, ''));
      if (isNaN(amount)) throw new Error('Invalid amount');      // Map 'once' to 'daily' for the mock server
      const frequency = formData.frequency === 'once' ? 'daily' : formData.frequency;

      // Create properly formatted payload
      const payload = createAllowancePayload({
        childId: selectedKid.id,
        amount,
        frequency,
        status: 'pending',
      });

      // Create allowance record
      const response = await fetch(getApiUrl(API_ENDPOINTS.CREATE_ALLOWANCE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        }, body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create allowance');

      setStep("success");
      toast.success('Allowance added successfully');
    } catch (error) {
      console.error('Error creating allowance:', error);
      
      // Show proper error message instead of using mock data
      const errorMessage = error instanceof Error ? error.message : 'Failed to create allowance. Please try again.';
      
      toast.error("Failed to create allowance", {
        description: errorMessage
      });
      
      // Don't proceed to success step, keep the form open for retry
    } finally {
      setIsLoading(false);
    }
  };

  const closeAndReset = () => {
    onClose();
    // Reset form after closing animation completes
    setTimeout(() => {
      setFormData({
        kidName: "",
        amount: "",
        frequency: "once"
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
              <DialogTitle className="text-xl text-center">Add Allowance</DialogTitle>
              <p className="text-center text-sm text-muted-foreground">
                Grant allowance to your child&apos;s account
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="kidName" className="text-sm font-medium">
                  Child<span className="text-destructive">*</span>
                </Label>
                <select
                  id="kidName"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.kidName}
                  onChange={(e) => handleSelectChange("kidName", e.target.value)}
                  required
                >
                  <option value="" disabled>Select a child</option>
                  {kids.map((kid) => (
                    <option key={kid.id} value={kid.name}>{kid.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Amount<span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    NGN
                  </span>
                  <Input
                    id="amount"
                    name="amount"
                    type="text"
                    placeholder="1,000"
                    value={formData.amount}
                    onChange={handleChange}
                    className="pl-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Frequency
                </Label>
                <RadioGroup
                  value={formData.frequency}
                  onValueChange={handleRadioChange}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="once" id="once" />
                    <Label htmlFor="once" className="cursor-pointer">One-time allowance</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly" className="cursor-pointer">Weekly allowance</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly" className="cursor-pointer">Monthly allowance</Label>
                  </div>
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
                  className="bg-primary hover:bg-primary/90"
                  disabled={!formData.kidName || !formData.amount || isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Allowance'}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <CheckIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-center mb-2">Allowance Added Successfully</h3>
            <p className="text-center text-muted-foreground mb-6">
              {formData.amount ? `NGN ${formData.amount}` : "Allowance"} has been successfully sent to {formData.kidName}
            </p>
            <Button
              onClick={handleSuccess}
              className="bg-primary hover:bg-primary/90 w-full"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 