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
import { Textarea } from "@/components/ui/textarea";
import { Banknote, CheckCircle, AlertCircle } from "lucide-react";
import { formatNaira } from "@/lib/utils/currency";
import Image from "next/image";

interface AddFundsProps {
    isOpen: boolean;
    onClose: () => void;
    loading: boolean;
    error?: string;
    success?: boolean;
    authorizationUrl?: string;
    reference?: string;
    // userEmail: string;
    onInitiate: (amount: string, description: string) => void;
    onVerify: (reference: string) => void;
}

export function AddFunds({
    isOpen,
    onClose,
    loading,
    error,
    success,
    authorizationUrl,
    reference,
    // userEmail,
    onInitiate,
    onVerify,
}: AddFundsProps) {
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("Add funds to parent wallet");

    // Reset state on close or success
    useEffect(() => {
        if (!isOpen || success) {
            setAmount("");
            setDescription("Add funds to parent wallet");
        }
    }, [isOpen, success]);

    // Open Paystack in new tab
    const handlePaystackRedirect = () => {
        if (!authorizationUrl) return;
        window.open(authorizationUrl, "_blank", "noopener,noreferrer");
    };

    // Only show "Verify Payment" if reference exists and not successful/loading
    const canVerify = !!reference && !!authorizationUrl && !success && !loading;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-w-sm w-full z-50">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Image src="/Paystack.png" width={150} height={24} alt="Paystack Logo" className="h-8" />
                        <DialogTitle className="text-xl font-semibold">Add Funds</DialogTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">Fund your family wallet securely with Paystack</p>
                </DialogHeader>

                {!success ? (
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            onInitiate(amount, description);
                        }}
                        className="space-y-6"
                    >
                        <div className="space-y-3">
                            <Label htmlFor="amount">Amount to Add</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Banknote className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <Input
                                    id="amount"
                                    type="text"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => {
                                        const v = e.target.value;
                                        if (v === '' || /^\d*\.?\d*$/.test(v)) setAmount(v);
                                    }}
                                    className="pl-10 pr-16 text-lg font-medium"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="text-muted-foreground text-sm">NGN</span>
                                </div>
                            </div>
                            {amount && (
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatNaira(parseFloat(amount))}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Add funds to parent wallet"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="min-h-[80px] resize-none"
                                maxLength={200}
                                disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground">
                                {description.length}/200 characters
                            </p>
                        </div>
                        <DialogFooter className="gap-2 flex-col sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={loading}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            {/* Only show "Pay with Paystack" if authorizationUrl exists AND reference is not set */}
                            {authorizationUrl && !success && (
                                <Button
                                    type="button"
                                    onClick={handlePaystackRedirect}
                                    disabled={loading}
                                    className="bg-[#0AA1DD] hover:bg-[#0a74dd] w-full sm:w-auto min-w-[120px] text-white font-semibold"
                                >
                                    Pay with Paystack
                                </Button>
                            )}
                            {/* Show submit button only before paystack is initiated */}
                            {!authorizationUrl && (
                                <Button
                                    type="submit"
                                    disabled={loading || !amount || parseFloat(amount) <= 0}
                                    className="bg-[#0AA1DD] hover:bg-[#0a74dd] w-full sm:w-auto min-w-[120px] text-white font-semibold"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>Pay {amount ? formatNaira(parseFloat(amount)) : 'Amount'}</>
                                    )}
                                </Button>
                            )}
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="flex flex-col items-center space-y-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                        <div className="text-lg font-semibold text-green-700">Wallet funded successfully!</div>
                        <Button onClick={onClose}>
                            Close
                        </Button>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 dark:bg-red-950/20 p-2 mt-2 rounded">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Show Verify Payment button only if reference is present */}
                {canVerify && (
                    <Button
                        className="w-full mt-4 flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold"
                        type="button"
                        onClick={() => {
                            if (reference) onVerify(reference);
                        }}
                        disabled={loading}
                    >
                        Verify Payment
                    </Button>
                )}
            </DialogContent>
        </Dialog>
    );
}