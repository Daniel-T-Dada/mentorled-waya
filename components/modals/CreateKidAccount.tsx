"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useKid } from "@/contexts/KidContext";
import {
  useCreateChildMutation,
  CreateChildRequest,
  ApiError,
  CreateChildResponse,
} from "@/lib/services/childrenService";
import { toast } from "sonner";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// Removed unused import: Label

// Optional: compress avatar image before sending (uses browser APIs)
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 256;
        let width = img.width;
        let height = img.height;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
    };
    reader.readAsDataURL(file);
  });
}

// Form validation schema
const createKidSchema = z.object({
  name: z.string().min(2, "Name is required"),
  username: z.string().min(2, "Username is required"),
  pin: z.string().length(4, "PIN must be 4 digits").regex(/^\d{4}$/, "PIN must be 4 digits"),
  avatar: z.string().optional().nullable(),
  terms: z.boolean().refine(val => val === true, "You must accept the terms."),
});

type CreateKidFormValues = z.infer<typeof createKidSchema>;

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
  avatar?: string | null;
}

const CreateKidAccount = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateKidAccountProps) => {
  const [step, setStep] = useState<"form" | "success">("form");
  const [showPin, setShowPin] = useState(false);
  const [createdKid, setCreatedKid] = useState<KidData | null>(null);
  const { data: session } = useSession();
  const { addKid } = useKid();
  const user = session?.user;

  const form = useForm<CreateKidFormValues>({
    resolver: zodResolver(createKidSchema),
    defaultValues: {
      name: "",
      username: "",
      pin: "",
      avatar: null,
      terms: false,
    },
  });

  // Use TanStack mutation
  const createKidMutation = useCreateChildMutation(session?.user?.accessToken || "", {
    onSuccess: (response: CreateChildResponse) => {
      const finalName = response.name; // Use const instead of let
      const kidData: KidData = {
        id: response.id,
        name: finalName,
        username: response.username,
        parentId: user?.id || "",
        avatar: response.avatar,
      };
      addKid({
        id: response.id,
        username: response.username,
        name: finalName,
        avatar: response.avatar,
        parent: user?.id,
      });
      setCreatedKid(kidData);
      setStep("success");
      if (onSuccess) onSuccess(kidData);

      // Update name in background if needed
      if (
        response.name === "Unknown" &&
        form.getValues("name") &&
        form.getValues("name") !== "Unknown"
      ) {
        import("@/lib/services/childrenService").then(async ({ ChildrenService }) => {
          try {
            await ChildrenService.updateChild(
              response.id,
              { name: form.getValues("name") },
              session?.user?.accessToken || ""
            );
            toast.info("Child name updated in background.");
          } catch {
            toast.warning("Kid account created, but failed to update name. You can edit it later.");
          }
        });
      }
    },
    onError: (error: unknown) => {
      let errorMessage = "Failed to create kid account";
      if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const compressedAvatar = await compressImage(file);
      form.setValue("avatar", compressedAvatar);
    }
  };

  const handleSubmit = (values: CreateKidFormValues) => {
    if (!user || user.role !== "parent") {
      toast.error("Parent authentication required. Please log in again.");
      return;
    }
    const kidPayload: CreateChildRequest = {
      username: values.username,
      name: values.name,
      pin: values.pin,
      // Optionally add avatar if backend supports
      // avatar: values.avatar,
    };
    createKidMutation.mutate(kidPayload);
  };

  const closeAndReset = () => {
    onClose();
    setTimeout(() => {
      form.reset();
      setStep("form");
      setCreatedKid(null);
    }, 300);
  };

  const handleSuccess = () => {
    closeAndReset();
    // onSuccess is already fired in mutation onSuccess
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeAndReset}>
      <DialogContent className="sm:max-w-md">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-left text-xl">
                Create Child&apos;s account
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name<span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="First Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Child&apos;s Username <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Username for login" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        4 digit pin<span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPin ? "text" : "password"}
                            placeholder="Enter 4-digit PIN"
                            maxLength={4}
                            {...field}
                            onChange={e => {
                              // Only allow digits, max 4
                              const val = e.target.value.replace(/\D/g, "");
                              field.onChange(val.slice(0, 4));
                            }}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            onClick={() => setShowPin(!showPin)}
                            tabIndex={-1}
                          >
                            {showPin ? (
                              <EyeOffIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avatar"
                  render={() => (
                    <FormItem>
                      <FormLabel>Profile Picture</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          className="cursor-pointer"
                          onChange={handleAvatarChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-start space-x-2 pt-2">
                        <FormControl>
                          <Input
                            id="terms"
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-4 bg-amber-700"
                          />
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={
                      createKidMutation.isPending ||
                      !form.watch("name") ||
                      !form.watch("username") ||
                      form.watch("pin").length !== 4 ||
                      !form.watch("terms")
                    }
                  >
                    {createKidMutation.isPending ? "Creating..." : "Create Account"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <CheckIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-center mb-2">
              Kid&apos;s Account Created
            </h3>
            <div className="text-center text-muted-foreground mb-6 space-y-2">
              <p>The account has been successfully created</p>
              {createdKid && (
                <div className="bg-muted p-4 rounded-md">
                  <p className="font-medium">Login Details</p>
                  <p>
                    Username:{" "}
                    <span className="font-medium">{createdKid.username}</span>
                  </p>
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
};

export default CreateKidAccount;