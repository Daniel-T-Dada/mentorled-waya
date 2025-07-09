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
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { Wallet, CreditCard, Banknote, CheckCircle, AlertCircle } from "lucide-react";
import { formatNaira } from "@/lib/utils/currency";

// Flutterwave types
interface FlutterwavePaymentData {
    tx_ref: string;
    amount: number;
    currency: string;
    payment_type: string;
    transaction_id: string;
    customer: {
        id?: string;
        email: string;
        name: string;
        phone_number?: string;
    };
}

interface FlutterwaveResponse {
    status: string;
    data: FlutterwavePaymentData;
}

// Extend window object for Flutterwave
declare global {
    interface Window {
        FlutterwaveCheckout: (options: any) => void;
    }
}

interface AddFundsProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface AddFundsResponse {
    message: string;
    new_balance: number;
    transaction_id: string;
}

export function AddFunds({ isOpen, onClose, onSuccess }: AddFundsProps) {
    const { data: session } = useSession();
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("Add funds to parent wallet");
    const [isLoading, setIsLoading] = useState(false);
    const [isFlutterwaveLoaded, setIsFlutterwaveLoaded] = useState(false);
    // const [paymentAttempted, setPaymentAttempted] = useState(false);

    // Load Flutterwave script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.flutterwave.com/v3.js";
        script.onload = () => setIsFlutterwaveLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleFlutterwavePayment = async () => {
        if (!session?.user?.accessToken) {
            toast.error("Authentication required", {
                description: "Please log in to add funds to your wallet."
            });
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Invalid amount", {
                description: "Please enter a valid amount greater than ₦0."
            });
            return;
        }

        const numAmount = parseFloat(amount);
        if (numAmount < 100) {
            toast.error("Minimum amount required", {
                description: "The minimum funding amount is ₦100."
            });
            return;
        }

        if (numAmount > 10000000) {
            toast.error("Maximum amount exceeded", {
                description: "The maximum funding amount is ₦10,000,000 per transaction."
            });
            return;
        }

        if (!isFlutterwaveLoaded) {
            toast.error("Payment system loading", {
                description: "Please wait for the payment system to load and try again."
            });
            return;
        }

        setIsLoading(true);

        // Generate unique transaction reference
        const txRef = `waya_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create a customer ID without dots (replace with underscores)
        const customerId = (session.user.email || "user").replace(/\./g, '_').replace(/@/g, '_at_');

        const paymentData = {
            public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "FLWPUBK_TEST-SANDBOXDEMOKEY-X",
            tx_ref: txRef,
            amount: numAmount,
            currency: "NGN",
            payment_options: "card,mobilemoney,ussd,bank_transfer",
            customer: {
                id: customerId,
                email: session.user.email || "",
                name: session.user.name || "User",
                phone_number: ""
            },
            customizations: {
                title: "Waya Family Wallet",
                description: description.trim() || "Add funds to parent wallet",
                logo: "/public/Logo/PurpleHead.svg"
            },
            callback: function (response: FlutterwaveResponse) {
                console.log("Flutterwave callback response:", response);

                if (response.status === "successful") {
                    console.log("Payment successful, confirming with backend...");
                    confirmPaymentAndAddFunds(response.data);
                } else if (response.status === "cancelled") {
                    console.log("Payment cancelled by user");
                    setIsLoading(false);
                    // setPaymentAttempted();
                    toast.info("Payment cancelled", {
                        description: "You cancelled the payment process."
                    });
                } else {
                    console.log("Payment failed:", response.status);
                    setIsLoading(false);
                    // setPaymentAttempted();
                    toast.error("Payment failed", {
                        description: "Your payment was not successful. Please try again."
                    });
                }
            },
            onclose: function () {
                console.log("Flutterwave modal closed by user");
                // Reset loading state but don't show cancellation message
                // The user may have just closed the modal without attempting payment
                setIsLoading(false);
                // setPaymentAttempted();
            }
        };

        try {
            // Open Flutterwave payment modal
            console.log("Opening Flutterwave modal with data:", paymentData);
            console.log("Customer ID being used:", customerId);
            console.log("Flutterwave loaded:", isFlutterwaveLoaded);
            console.log("Window.FlutterwaveCheckout exists:", typeof window.FlutterwaveCheckout);

            // setPaymentAttempted();

            // Add a small delay to ensure proper initialization
            setTimeout(() => {
                try {
                    window.FlutterwaveCheckout(paymentData);
                } catch (innerError) {
                    console.error("Inner error calling FlutterwaveCheckout:", innerError);
                    setIsLoading(false);
                    // setPaymentAttempted();
                    toast.error("Payment initialization failed", {
                        description: "Failed to initialize payment system. Please try again."
                    });
                }
            }, 200);

        } catch (error) {
            console.error("Error opening Flutterwave modal:", error);
            setIsLoading(false);
            // setPaymentAttempted();
            toast.error("Payment system error", {
                description: "Unable to open payment modal. Please try again."
            });
        }
    };

    const confirmPaymentAndAddFunds = async (paymentData: FlutterwavePaymentData) => {
        console.log("Confirming payment with backend:", paymentData);
        try {
            const response = await fetch(getApiUrl(API_ENDPOINTS.WALLET_ADD_FUNDS), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user?.accessToken}`,
                },
                body: JSON.stringify({
                    amount: paymentData.amount.toString(),
                    description: description.trim() || "Add funds to parent wallet",
                    payment_reference: paymentData.transaction_id,
                    tx_ref: paymentData.tx_ref,
                    payment_type: paymentData.payment_type || "card",
                    currency: paymentData.currency
                }),
            });

            console.log("Backend response status:", response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Backend error:", errorData);
                throw new Error(errorData.message || `Failed to confirm payment: ${response.status}`);
            }

            const data: AddFundsResponse = await response.json();
            console.log("Backend success response:", data);

            toast.success("Payment successful!", {
                description: `${formatNaira(paymentData.amount)} has been added to your wallet. New balance: ${formatNaira(data.new_balance)}`,
                icon: <CheckCircle className="w-5 h-5 text-green-600" />
            });

            // Reset form
            setAmount("");
            setDescription("Add funds to parent wallet");

            // Call success callback and close modal
            onSuccess?.();
            onClose();

        } catch (error) {
            console.error('Error confirming payment:', error);
            toast.error("Payment confirmation failed", {
                description: error instanceof Error ? error.message : "Payment was successful but couldn't be confirmed. Please contact support.",
                icon: <AlertCircle className="w-5 h-5 text-red-600" />
            });
        } finally {
            setIsLoading(false);
            // setPaymentAttempted();
        }
    };

    // Manual confirmation function for testing
    const handleManualConfirmation = () => {
        setIsLoading(true);
        // setPaymentAttempted();

        // Create a customer ID without dots (replace with underscores)
        const customerId = (session?.user?.email || "user").replace(/\./g, '_').replace(/@/g, '_at_');

        // Simulate successful payment data for testing
        const testPaymentData: FlutterwavePaymentData = {
            tx_ref: `waya_${Date.now()}_test`,
            amount: parseFloat(amount),
            currency: "NGN",
            payment_type: "card",
            transaction_id: `test_${Date.now()}`,
            customer: {
                id: customerId,
                email: session?.user?.email || "",
                name: session?.user?.name || "Test User"
            }
        };

        confirmPaymentAndAddFunds(testPaymentData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Add a small delay to ensure proper modal state
        setTimeout(() => {
            handleFlutterwavePayment();
        }, 100);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only numbers and decimal point
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAmount(value);
        }
    };

    const formatAmountPreview = (value: string) => {
        const num = parseFloat(value);
        return isNaN(num) ? "₦0" : formatNaira(num);
    };

    const quickAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-w-sm w-full">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Wallet className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-xl font-semibold">Add Funds</DialogTitle>
                            <p className="text-sm text-muted-foreground">Fund your family wallet</p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Amount Input */}
                    <div className="space-y-3">
                        <Label htmlFor="amount" className="text-sm font-medium">
                            Amount to Add
                        </Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Banknote className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input
                                id="amount"
                                type="text"
                                placeholder="0.00"
                                value={amount}
                                onChange={handleAmountChange}
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
                                    {formatAmountPreview(amount)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Quick Amounts</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {quickAmounts.map((quickAmount) => (
                                <Button
                                    key={quickAmount}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAmount(quickAmount.toString())}
                                    className="text-xs w-full"
                                    disabled={isLoading}
                                >
                                    {formatNaira(quickAmount)}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Description Input */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                            Description (Optional)
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Add funds to parent wallet"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[80px] resize-none"
                            maxLength={200}
                            disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                            {description.length}/200 characters
                        </p>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                            <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                                    Secure Payment with Flutterwave
                                </h4>
                                <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                                    Your payment is processed securely through Flutterwave. We support cards, bank transfers, and mobile money.
                                </p>
                                {!isFlutterwaveLoaded && (
                                    <p className="text-amber-600 dark:text-amber-400 text-xs mt-2">
                                        Loading payment system...
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 flex-col sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="w-full sm:w-auto order-2 sm:order-1"
                        >
                            Cancel
                        </Button>

                        {/* Development only: Manual confirmation button */}
                        {process.env.NODE_ENV === 'development' && (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleManualConfirmation}
                                disabled={isLoading || !amount || parseFloat(amount) <= 0}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white w-full sm:w-auto order-3 sm:order-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Testing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Skip Payment (Test)
                                    </>
                                )}
                            </Button>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading || !amount || parseFloat(amount) <= 0 || !isFlutterwaveLoaded}
                            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto order-1 sm:order-3 min-w-[120px]"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Pay {amount ? formatAmountPreview(amount) : 'Amount'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
