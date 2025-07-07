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
import { CheckIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';

interface MakePaymentProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

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

export function MakePayment({ isOpen, onClose, onSuccess }: MakePaymentProps) {
    const { data: session } = useSession();
    const [step, setStep] = useState<"form" | "success">("form");
    const [kids, setKids] = useState<Kid[]>([]);
    const [chores, setChores] = useState<Chore[]>([]);
    const [kidSpecificChores, setKidSpecificChores] = useState<Chore[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingChores, setIsLoadingChores] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const [formData, setFormData] = useState({
        kidId: "",
        kidName: "",
        choreActivity: "",
        amount: "",
        pin: ""
    });

    // Helper function to fetch all paginated data
    const fetchAllPaginatedData = async (url: string, headers: any) => {
        let allResults: any[] = [];
        let nextUrl = url;

        while (nextUrl) {
            const response = await fetch(nextUrl, { headers });
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const results = data.results || data;

            if (Array.isArray(results)) {
                allResults = [...allResults, ...results];
            } else if (data.results) {
                allResults = [...allResults, ...data.results];
            }

            // Check if there's a next page
            nextUrl = data.next ? data.next : null;
        }

        return allResults;
    };

    // Fetch kids and chores data when modal opens
    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user?.id) return;

            setIsLoadingData(true);
            try {
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.accessToken}`,
                };

                // Fetch ALL kids using pagination
                console.log('Fetching all kids...');
                const allKids = await fetchAllPaginatedData(getApiUrl('/api/children/list/'), headers);
                console.log('All Kids fetched:', allKids);
                console.log('Total kids count:', allKids.length);
                setKids(allKids);

                // Fetch ALL chores using pagination
                console.log('Fetching all chores...');
                const allChores = await fetchAllPaginatedData(getApiUrl(API_ENDPOINTS.LIST_TASKS), headers);
                console.log('All Chores fetched:', allChores);
                setChores(allChores);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load data', {
                    description: 'Please try again or contact support if the problem persists.'
                });
                setKids([]);
                setChores([]);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen, session?.user?.id, session?.user?.accessToken]);

    // Fetch chores for specific kid when kid is selected
    const fetchKidChores = async (kidId: string) => {
        if (!session?.user?.accessToken || !kidId) return;

        setIsLoadingChores(true);
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.accessToken}`,
            };

            // Fetch ALL chores using pagination, then filter for the specific kid
            console.log('Fetching all chores for kid:', kidId);
            const allChores = await fetchAllPaginatedData(getApiUrl(API_ENDPOINTS.LIST_TASKS), headers);
            console.log('All chores fetched:', allChores);

            // Filter chores for the specific kid
            const kidChores = allChores.filter((chore: any) => chore.assignedTo === kidId);
            console.log('Kid-specific chores filtered:', kidChores);
            setKidSpecificChores(kidChores);
        } catch (error) {
            console.error('Error fetching kid chores:', error);
            // Fallback to filtering from already loaded chores
            const filteredChores = chores.filter(chore => chore.assignedTo === kidId);
            setKidSpecificChores(filteredChores);
        } finally {
            setIsLoadingChores(false);
        }
    };

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

    const handleSelectChange = (name: string, value: string) => {
        setFormData({
            ...formData,
            [name]: value,
        });

        // If kid is selected, fetch their specific chores and reset chore selection
        if (name === 'kidId') {
            const selectedKid = kids.find(k => k.id === value);
            if (selectedKid) {
                setFormData(prev => ({
                    ...prev,
                    kidId: value,
                    kidName: selectedKid.name,
                    choreActivity: "", // Reset chore selection when kid changes
                    amount: "" // Reset amount when kid changes
                }));
                fetchKidChores(value);
            }
        }

        // If chore is selected, auto-fill the amount with the chore's reward
        if (name === 'choreActivity' && value !== 'custom' && value !== '') {
            const selectedChore = kidSpecificChores.find(c => c.id === value);
            if (selectedChore) {
                // Convert amount string to number for formatting
                const amount = parseFloat(selectedChore.amount);
                setFormData(prev => ({
                    ...prev,
                    choreActivity: value,
                    amount: amount.toLocaleString()
                }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.id) return;

        setIsLoading(true);
        try {
            // Validate selected kid
            if (!formData.kidId) throw new Error('Please select a kid');

            // Convert amount string to number (remove commas)
            const amount = parseInt(formData.amount.replace(/,/g, ''));
            if (isNaN(amount)) throw new Error('Invalid amount');

            // Validate required fields
            if (!formData.pin) throw new Error('PIN is required for payments');

            // Make payment using the make_payment endpoint
            const paymentPayload = {
                child_id: formData.kidId,
                chore_id: formData.choreActivity !== 'custom' && formData.choreActivity ? formData.choreActivity : undefined,
                amount: amount.toString(),
                pin: formData.pin
            };

            console.log('Making payment with payload:', paymentPayload);

            const response = await fetch(getApiUrl(API_ENDPOINTS.WALLET_MAKE_PAYMENT), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.accessToken}`,
                },
                body: JSON.stringify(paymentPayload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Payment API Error:', errorData);

                // Handle specific error messages
                if (errorData.detail) {
                    throw new Error(errorData.detail);
                }
                throw new Error(`Failed to make payment: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Payment successful:', result);

            setStep("success");
            toast.success('Payment successful', {
                description: `NGN ${amount.toLocaleString()} has been sent to ${formData.kidName}`
            });
        } catch (error) {
            console.error('Error processing payment:', error);

            // Show proper error message
            const errorMessage = error instanceof Error ? error.message : 'Failed to process payment. Please try again.';

            toast.error("Payment failed", {
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
                kidId: "",
                kidName: "",
                choreActivity: "",
                amount: "",
                pin: ""
            });
            setKidSpecificChores([]);
            setKids([]);
            setChores([]);
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
                                    disabled={isLoadingData}
                                    required
                                >
                                    <option value="" disabled>
                                        {isLoadingData ? 'Loading children...' : kids.length === 0 ? 'No children found' : 'Select a child'}
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
                                    disabled={!formData.kidId || isLoadingChores}
                                    required
                                >
                                    <option value="" disabled>
                                        {!formData.kidId ? 'Select a child first' :
                                            isLoadingChores ? 'Loading chores...' :
                                                'Select a chore/activity'}
                                    </option>
                                    {kidSpecificChores.map((chore) => (
                                        <option key={chore.id} value={chore.id}>
                                            {chore.title} - NGN {parseFloat(chore.amount).toLocaleString()}
                                        </option>
                                    ))}
                                    <option value="custom">Custom Activity</option>
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
