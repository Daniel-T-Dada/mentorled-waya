
import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Kid } from '@/lib/services/mockDataService';

interface AllowanceSettingsProps {
    kid: Kid;
    onEditAmount: () => void;
}

export const AllowanceSettings = ({ kid, onEditAmount }: AllowanceSettingsProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Allowance Settings
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                        <h3 className="font-medium">Weekly Allowance</h3>
                        <p className="text-sm text-muted-foreground">
                            Automatic weekly payment to {kid.name}&apos;s wallet
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold">
                            NGN {kid.allowanceAmount?.toLocaleString() || '0'}
                        </div>
                        <Button variant="outline" size="sm" className="mt-2" onClick={onEditAmount}>
                            Edit Amount
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
