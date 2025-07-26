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
import { EyeIcon, EyeOffIcon, CheckIcon } from "lucide-react";

interface SetPinProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    isLoading: boolean;
    error?: Error | null;
    onSetPin: (pin: string) => void;
}

const SetPin = ({
    isOpen,
    onClose,
    onSuccess,
    isLoading,
    error,
    onSetPin
}: SetPinProps) => {
    const [step, setStep] = useState<"form" | "success">("form");
    const [pin, setPin] = useState("");
    const [showPin, setShowPin] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
        setPin(value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 4) return;
        onSetPin(pin);
        setStep("success");
    };

    // Reset state and close
    const closeAndReset = () => {
        onClose();
        setTimeout(() => {
            setPin("");
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
                            <DialogTitle className="text-xl text-center">Set PIN</DialogTitle>
                            <p className="text-center text-sm text-muted-foreground">
                                Secure your wallet by setting a 4-digit PIN
                            </p>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="pin" className="text-sm font-medium">
                                    PIN<span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="pin"
                                        name="pin"
                                        type={showPin ? "text" : "password"}
                                        placeholder="••••"
                                        value={pin}
                                        onChange={handleChange}
                                        className="pr-10"
                                        maxLength={4}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPin(!showPin)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPin ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                                    </button>
                                </div>
                            </div>
                            <DialogFooter className="mt-6">
                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                    disabled={isLoading || pin.length !== 4}
                                >
                                    {isLoading ? 'Setting PIN...' : 'Set PIN'}
                                </Button>
                                {error && (
                                    <div className="text-red-500 text-sm mt-2 text-center">
                                        {typeof error.message === 'string'
                                            ? error.message
                                            : typeof error === 'string'
                                                ? error
                                                : JSON.stringify(error.message ?? error)}
                                    </div>
                                )}
                            </DialogFooter>
                        </form>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="mb-4 h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                            <CheckIcon className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-center mb-2">PIN Set Successfully</h3>
                        <p className="text-center text-muted-foreground mb-6">
                            Your wallet PIN has been set.
                        </p>
                        <Button
                            onClick={handleSuccess}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                        >
                            Done
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SetPin;