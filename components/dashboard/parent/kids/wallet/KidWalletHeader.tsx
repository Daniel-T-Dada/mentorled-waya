
import { ArrowLeft, Calendar, Gift } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { type Kid } from '@/lib/services/mockDataService';

interface KidWalletHeaderProps {
    kid: Kid;
    onBack: () => void;
    onAddAllowance: () => void;
    onAddBonus: () => void;
}

export const KidWalletHeader = ({
    kid,
    onBack,
    onAddAllowance,
    onAddBonus
}: KidWalletHeaderProps) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onBack}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={kid.avatar ?? undefined} alt={kid.name} />
                        <AvatarFallback>{kid.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-2xl font-bold">Wallet - {kid.name}</h1>
                </div>
            </div>

            <div className="flex gap-2">
                <Button variant="outline" onClick={onAddAllowance}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Add Allowance
                </Button>
                <Button onClick={onAddBonus}>
                    <Gift className="h-4 w-4 mr-2" />
                    Add Bonus
                </Button>
            </div>
        </div>
    );
};
