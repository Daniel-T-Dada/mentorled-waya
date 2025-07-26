"use client";

import { useState, useMemo } from "react";
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
import { CheckIcon, EyeIcon, EyeOffIcon } from "lucide-react";

interface Kid {
    id: string;
    name: string;
    username: string;
    parent: string;
    avatar?: string;
    created_at: string;
}

interface Chore {
    id: string;
    title: string;
    description: string;
    assignedTo: string;
    assignedToName: string;
    assignedToUsername: string;
    status: string;
    amount: string;
    createdAt: string;
    completedAt?: string;
    parentId: string;
    category: string;
    isRedeemed: boolean;
}

interface MakePaymentPayload {
    child_id: string;
    chore_id: string;
    amount: string;
    pin: string;
}

interface MakePaymentProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    kids: Kid[];
    chores: Chore[];
    isLoading: boolean;
    error?: Error | null;
    onMakePayment: (payload: MakePaymentPayload, kidName: string) => void;
}

const MakePayment = ({
    isOpen,
    onClose,
    onSuccess,
    kids,
    chores,
    isLoading,
    error,
    onMakePayment
}: MakePaymentProps) => {
    const [step, setStep] = useState<"form" | "success">("form");
    const [showPin, setShowPin] = useState(false);
    const [formData, setFormData] = useState({
        kidId: "",
        kidName: "",
        choreActivity: "",
        amount: "",
        pin: ""
    });

    // Filter chores for selected kid
    const kidSpecificChores = useMemo(() => {
        if (!formData.kidId) return [];
        return chores.filter((chore) => chore.assignedTo === formData.kidId);
    }, [chores, formData.kidId]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'amount') {
            // Remove any non-numeric characters except commas
            const numericValue = value.replace(/[^0-9,]/g, '');
            // Format with commas for thousands separator
            if (numericValue) {
                const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                setFormData({
                    ...formData,
                    [name]: formattedValue,
                });
            } else {
                setFormData({
                    ...formData,
                    [name]: '',
                });
            }
        } else if (name === 'pin') {
            // Only allow numbers for PIN and limit to 4 digits
            const numericValue = value.replace(/[^0-9]/g, '').slice(0, 4);
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

    // Handle select changes
    const handleSelectChange = (name: string, value: string) => {
        if (name === 'kidId') {
            const selectedKid = kids.find(k => k.id === value);
            setFormData(prev => ({
                ...prev,
                kidId: value,
                kidName: selectedKid?.name ?? "",
                choreActivity: "",
                amount: ""
            }));
        } else if (name === 'choreActivity' && value !== 'custom' && value !== '') {
            const selectedChore = kidSpecificChores.find(c => c.id === value);
            if (selectedChore) {
                const amount = parseFloat(selectedChore.amount);
                setFormData(prev => ({
                    ...prev,
                    choreActivity: value,
                    amount: amount.toLocaleString()
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validate selected kid
        if (!formData.kidId) {
            alert("Please select a child.");
            return;
        }
        // Validate chore selection
        if (!formData.choreActivity || formData.choreActivity === "custom") {
            alert("Please select a valid chore/activity.");
            return;
        }
        // Convert amount string to number (remove commas)
        const amount = parseInt(formData.amount.replace(/,/g, ''));
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
        // Validate required fields
        if (!formData.pin) {
            alert("PIN is required.");
            return;
        }

        // Build payload (chore_id is always present and required)
        const paymentPayload: MakePaymentPayload = {
            child_id: formData.kidId,
            chore_id: formData.choreActivity,
            amount: amount.toString(),
            pin: formData.pin
        };

        // Call parent mutation
        onMakePayment(paymentPayload, formData.kidName);
        setStep("success");
    };

    // Reset state and close
    const closeAndReset = () => {
        onClose();
        setTimeout(() => {
            setFormData({
                kidId: "",
                kidName: "",
                choreActivity: "",
                amount: "",
                pin: ""
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
                            <DialogTitle className="text-xl text-center">Make Payment</DialogTitle>
                            <p className="text-center text-sm text-muted-foreground">
                                Send reward earned by completing chores and task
                            </p>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="kidName" className="text-sm font-medium">
                                    Kid&apos;s Name<span className="text-red-500">*</span>
                                </Label>
                                <select
                                    id="kidName"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.kidId}
                                    onChange={(e) => handleSelectChange("kidId", e.target.value)}
                                    required
                                >
                                    <option value="" disabled>
                                        {kids.length === 0 ? 'No children found' : 'Select a child'}
                                    </option>
                                    {kids.map((kid) => (
                                        <option key={kid.id} value={kid.id}>
                                            {kid.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="choreActivity" className="text-sm font-medium">
                                    Chore/Activity<span className="text-red-500">*</span>
                                </Label>
                                <select
                                    id="choreActivity"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.choreActivity}
                                    onChange={(e) => handleSelectChange("choreActivity", e.target.value)}
                                    disabled={!formData.kidId}
                                    required
                                >
                                    <option value="" disabled>
                                        {!formData.kidId ? 'Select a child first' : 'Select a chore/activity'}
                                    </option>
                                    {kidSpecificChores.map((chore) => (
                                        <option key={chore.id} value={chore.id}>
                                            {chore.title} - NGN {parseFloat(chore.amount).toLocaleString()}
                                        </option>
                                    ))}
                                    {/* Remove custom option if your backend does not support it */}
                                    {/* <option value="custom">Custom Activity</option> */}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-sm font-medium">
                                    Amount<span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="text"
                                    placeholder="NGN 2,000"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className="w-full"
                                    required
                                />
                            </div>

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
                                        value={formData.pin}
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
                                    disabled={
                                        !formData.kidId ||
                                        !formData.choreActivity ||
                                        !formData.amount ||
                                        !formData.pin ||
                                        isLoading
                                    }
                                >
                                    {isLoading ? 'Processing...' : 'Make Payment'}
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
                        <h3 className="text-lg font-medium text-center mb-2">Payment Successful</h3>
                        <p className="text-center text-muted-foreground mb-6">
                            NGN {formData.amount} has been successfully sent to {formData.kidName}
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
}
export default MakePayment;