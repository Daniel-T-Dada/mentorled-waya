
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { type Kid } from '@/lib/services/mockDataService';
import { type WalletStats } from './types';

interface WalletOverviewProps {
    kid: Kid;
    stats: WalletStats;
}

export const WalletOverview = ({ kid, stats }: WalletOverviewProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
                <CardContent className="p-6 text-center">
                    <Wallet className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                        NGN {kid.balance.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground">Current Balance</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <div className="text-2xl font-bold text-green-600 mb-2">
                        NGN {stats.totalEarned.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground">Earned This Month</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 text-center">
                    <TrendingDown className="h-12 w-12 mx-auto mb-4 text-red-500" />
                    <div className="text-2xl font-bold text-red-600 mb-2">
                        NGN {stats.totalSpent.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground">Spent This Month</p>
                </CardContent>
            </Card>
        </div>
    );
};
