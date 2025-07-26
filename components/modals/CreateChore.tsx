"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ChoreForm, { ChoreFormValues } from "./ChoreForm";

interface CreateChoreProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ChoreFormValues) => void;
  isLoading?: boolean;
  preSelectedKid?: string;
}

const CreateChore = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  preSelectedKid
}: CreateChoreProps) => {
  const [step, setStep] = useState<"form" | "success">("form");

  const handleSubmit = (data: ChoreFormValues) => {
    onSubmit(data);
    setStep("success");
  };

  const closeAndReset = () => {
    onClose();
    setTimeout(() => {
      setStep("form");
    }, 300);
  };

  const handleSuccess = () => {
    closeAndReset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeAndReset}>
      <DialogContent className="sm:max-w-md">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl text-center">Create Chore</DialogTitle>
              <p className="text-center text-sm text-muted-foreground">
                {preSelectedKid
                  ? "Create a new chore for the selected kid"
                  : "Create a new chore for your kids"}
              </p>
            </DialogHeader>

            <ChoreForm
              submitLabel="Create Chore"
              onSubmit={handleSubmit}
              onCancel={closeAndReset}
              isLoading={isLoading}
              preSelectedKid={preSelectedKid}
              // isOpen={isOpen}
            />

          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Chore Created!</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              The chore has been successfully created and assigned.
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

export default CreateChore;