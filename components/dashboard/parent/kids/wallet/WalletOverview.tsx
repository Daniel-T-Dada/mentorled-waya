
import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { type Kid } from '@/lib/services/mockDataService';
import { type WalletStats } from './types';
import { eventManager } from "@/lib/realtime";
import { WalletUpdatePayload, WayaEvent } from "@/lib/realtime/types";

interface WalletOverviewProps {
    kid: Kid;
    stats: WalletStats;
}

export const WalletOverview = ({ kid, stats }: WalletOverviewProps) => {
    const [currentBalance, setCurrentBalance] = useState(kid.balance);
    const [currentStats, setCurrentStats] = useState(stats);

    // Set up real-time wallet updates subscription
    useEffect(() => {
        const handleWalletUpdate = (event: WayaEvent<WalletUpdatePayload>) => {
            console.log('WalletOverview: Received wallet update event:', event);
            const { payload } = event;

            // Update balance if this is for the current kid
            if (payload.kidId === kid.id && payload.kidNewBalance !== undefined) {
                setCurrentBalance(payload.kidNewBalance);

                // Optionally update stats if available
                if (payload.action === "MAKE_PAYMENT" && payload.amount) {
                    setCurrentStats(prev => ({
                        ...prev,
                        totalEarned: prev.totalEarned + payload.amount!
                    }));
                }
            }
        };

        const unsubscribe = eventManager.subscribe('WALLET_UPDATE', handleWalletUpdate);

        return () => {
            unsubscribe();
        };
    }, [kid.id]);

    // Update local state when props change
    useEffect(() => {
        setCurrentBalance(kid.balance);
        setCurrentStats(stats);
    }, [kid.balance, stats]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
                <CardContent className="p-6 text-center">
                    <Wallet className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                        NGN {currentBalance.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground">Current Balance</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <div className="text-2xl font-bold text-green-600 mb-2">
                        NGN {currentStats.totalEarned.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground">Earned This Month</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 text-center">
                    <TrendingDown className="h-12 w-12 mx-auto mb-4 text-red-500" />
                    <div className="text-2xl font-bold text-red-600 mb-2">
                        NGN {currentStats.totalSpent.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground">Spent This Month</p>
                </CardContent>
            </Card>
        </div>
    );
};
