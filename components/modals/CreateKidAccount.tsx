"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { mockDataService } from "@/lib/services/mockDataService";

interface CreateKidAccountProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (kidData: KidData) => void;
}

interface KidData {
  id: string;
  name: string;
  username: string;
  parentId: string;
}

export function CreateKidAccount({ isOpen, onClose, onSuccess }: CreateKidAccountProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [createdKid, setCreatedKid] = useState<KidData | null>(null);
  const { data: session } = useSession();
  const user = session?.user;
  const [usedMockData, setUsedMockData] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    pin: "",
    avatar: "" as string | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "avatar" && files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          avatar: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
      return;
    }

    // For PIN, only allow 4 digits
    if (name === "pin" && value.length > 4) return;
    if (name === "pin" && !/^\d*$/.test(value)) return;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || user.role !== "parent") {
      toast.error("Error", {
        description: "Parent authentication required. Please log in again."
      });
      return;
    }

    setIsLoading(true);

    try {
      const body = JSON.stringify({
        name: formData.name,
        username: formData.username,
        pin: formData.pin,
        parentId: user.id,
        avatar: formData.avatar,
      });
      const headers = {
        "Content-Type": "application/json"
      };

      // Make API call to create kid account
      const response = await fetch(getApiUrl(API_ENDPOINTS.CREATE_KID), {
        method: "POST",
        headers,
        body
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create kid account");
      }

      const kidData = await response.json();
      setCreatedKid(kidData);
      setStep("success");

    } catch (error: unknown) {
      console.error("Error creating kid account:", error);

      // Use mock data as fallback
      toast.warning("Using mock data", {
        description: "API call failed. Creating a mock kid account for development."
      });

      // Create a mock kid account using the mockDataService
      const mockKidData = mockDataService.createMockKidAccount(
        formData.name,
        formData.username,
        user?.id || 'mock-parent-id',
        formData.pin,
        formData.avatar
      );

      setCreatedKid(mockKidData);
      setUsedMockData(true);
      setStep("success");
    } finally {
      setIsLoading(false);
    }
  };

  const closeAndReset = () => {
    onClose();
    // Reset form after closing animation completes
    setTimeout(() => {
      setFormData({ name: "", username: "", pin: "", avatar: null });
      setStep("form");
      setCreatedKid(null);
      setUsedMockData(false);
    }, 300);
  };

  const handleSuccess = () => {
    closeAndReset();
    if (onSuccess && createdKid) onSuccess(createdKid);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeAndReset}>
      <DialogContent className="sm:max-w-md">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Create Kid&apos;s account</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name<span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="First Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Kid&apos;s Username <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Username for login"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin" className="text-sm font-medium">
                  4 digit pin<span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="pin"
                    name="pin"
                    type={showPin ? "text" : "password"}
                    placeholder="Enter 4-digit PIN"
                    value={formData.pin}
                    onChange={handleChange}
                    pattern="[0-9]{4}"
                    maxLength={4}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar" className="text-sm font-medium">
                  Avatar/Profile Picture
                </Label>
                <Input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  className="cursor-pointer"
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <div className="flex h-5 items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
                <div className="text-sm leading-none">
                  <label htmlFor="terms" className="font-medium text-foreground">
                    By signing up you agree to the{" "}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={isLoading || !formData.name || !formData.username || formData.pin.length !== 4}
                >
                  {isLoading ? "Creating..." : "Create Account"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <CheckIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-center mb-2">Kid&apos;s Account Created</h3>
            <div className="text-center text-muted-foreground mb-6 space-y-2">
              <p>The account has been successfully created</p>
              {createdKid && (
                <div className="bg-muted p-4 rounded-md">
                  <p className="font-medium">Login Details</p>
                  <p>Username: <span className="font-medium">{createdKid.username}</span></p>
                  <p>Name: {createdKid.name}</p>
                  {usedMockData && (
                    <p className="text-xs mt-2 text-yellow-500">
                      (Mock data - API connection failed)
                    </p>
                  )}
                </div>
              )}
            </div>
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