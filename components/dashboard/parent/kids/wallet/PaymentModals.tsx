
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type AllowanceForm, type BonusForm } from './types';

interface PaymentModalsProps {
    showAddAllowance: boolean;
    showAddBonus: boolean;
    allowanceForm: AllowanceForm;
    bonusForm: BonusForm;
    onAllowanceFormChange: (form: AllowanceForm) => void;
    onBonusFormChange: (form: BonusForm) => void;
    onAddAllowance: () => void;
    onAddBonus: () => void;
    onCloseAllowance: () => void;
    onCloseBonus: () => void;
}

export const PaymentModals = ({
    showAddAllowance,
    showAddBonus,
    allowanceForm,
    bonusForm,
    onAllowanceFormChange,
    onBonusFormChange,
    onAddAllowance,
    onAddBonus,
    onCloseAllowance,
    onCloseBonus
}: PaymentModalsProps) => {
    return (
        <>
            {/* Add Allowance Modal */}
            {showAddAllowance && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle>Add Allowance Payment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="allowance-amount">Amount (NGN)</Label>
                                <Input
                                    id="allowance-amount"
                                    type="number"
                                    value={allowanceForm.amount || ''}
                                    onChange={(e) => onAllowanceFormChange({
                                        ...allowanceForm,
                                        amount: parseInt(e.target.value) || 0
                                    })}
                                    placeholder="Enter amount"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="allowance-description">Description (Optional)</Label>
                                <Textarea
                                    id="allowance-description"
                                    value={allowanceForm.description}
                                    onChange={(e) => onAllowanceFormChange({
                                        ...allowanceForm,
                                        description: e.target.value
                                    })}
                                    placeholder="e.g., Weekly allowance, Extra allowance for good behavior"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={onCloseAllowance}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={onAddAllowance}
                                    disabled={allowanceForm.amount <= 0}
                                >
                                    Add Allowance
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Add Bonus Modal */}
            {showAddBonus && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle>Add Bonus Payment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="bonus-amount">Amount (NGN)</Label>
                                <Input
                                    id="bonus-amount"
                                    type="number"
                                    value={bonusForm.amount || ''}
                                    onChange={(e) => onBonusFormChange({
                                        ...bonusForm,
                                        amount: parseInt(e.target.value) || 0
                                    })}
                                    placeholder="Enter amount"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bonus-description">Description</Label>
                                <Textarea
                                    id="bonus-description"
                                    value={bonusForm.description}
                                    onChange={(e) => onBonusFormChange({
                                        ...bonusForm,
                                        description: e.target.value
                                    })}
                                    placeholder="e.g., Good behavior, Extra effort, Special achievement"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={onCloseBonus}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={onAddBonus}
                                    disabled={bonusForm.amount <= 0}
                                >
                                    Add Bonus
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
};
