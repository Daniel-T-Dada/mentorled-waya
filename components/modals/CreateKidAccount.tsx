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
import { useSession } from "next-auth/react";
import { ChildrenService } from "@/lib/services/childrenService";
import { useKid } from "@/contexts/KidContext";

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
  const { addKid } = useKid();
  const user = session?.user;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
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
      throw new Error("Parent authentication required. Please log in again.");
    }

    console.log("CreateKidAccount - User session:", {
      id: user.id,
      role: user.role,
      accessToken: user.accessToken,
      hasAccessToken: !!user.accessToken
    });

    setIsLoading(true);

    try {
      console.log("CreateKidAccount - About to send data:", {
        username: formData.username,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        pin: formData.pin ? "****" : "NOT SET"
      });

      const response = await ChildrenService.createChild({
        username: formData.username,
        name: `${formData.firstName} ${formData.lastName}`.trim(), // Combine first and last name
        pin: formData.pin,
      }, session?.user?.accessToken || '');

      if (!response) {
        throw new Error("Failed to create kid account");
      }

      console.log("CreateKidAccount - Backend response:", response);

      // Check if the backend response name is 'Unknown' and try to update it
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      if (response.name === 'Unknown' && fullName && fullName !== 'Unknown') {
        console.warn("CreateKidAccount - Backend returned 'Unknown' name, attempting to update...");
        try {
          // Try to update the child's name using the update endpoint
          await ChildrenService.updateChild(response.id, { name: fullName }, session?.user?.accessToken || '');
          // Update the response object to reflect the correct name
          response.name = fullName;
          console.log("CreateKidAccount - Successfully updated child name to:", fullName);
        } catch (updateError) {
          console.error("CreateKidAccount - Failed to update child name:", updateError);
          // Continue with original response even if update fails
        }
      }

      // Convert the response to match KidData interface
      const kidData: KidData = {
        id: response.id,
        name: response.name, // Use the name from backend response
        username: response.username,
        parentId: user.id,
      };

      // Add kid to context for immediate UI update
      const newKid = {
        id: response.id,
        username: response.username,
        name: response.name, // Use the name from backend response
        avatar: response.avatar,
        parent: user.id,
      };

      addKid(newKid);

      // Don't override backend name with local storage

      setCreatedKid(kidData);
      setStep("success");
    } catch (error) {
      console.error("Error creating kid account:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const closeAndReset = () => {
    onClose();
    // Reset form after closing animation completes
    setTimeout(() => {
      setFormData({ firstName: "", lastName: "", username: "", pin: "", avatar: null });
      setStep("form");
      setCreatedKid(null);
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
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
                  disabled={isLoading || !formData.firstName || !formData.lastName || !formData.username || formData.pin.length !== 4}
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