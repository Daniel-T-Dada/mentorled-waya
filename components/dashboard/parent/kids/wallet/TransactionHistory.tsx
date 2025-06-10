
import { Wallet, TrendingUp, TrendingDown, Calendar, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Transaction } from './types';
import { type Kid } from '@/lib/services/mockDataService';

interface TransactionHistoryProps {
    kid: Kid;
    transactions: Transaction[];
}

export const TransactionHistory = ({ kid, transactions }: TransactionHistoryProps) => {
    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'earn':
                return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'spend':
                return <TrendingDown className="h-4 w-4 text-red-500" />;
            case 'allowance':
                return <Calendar className="h-4 w-4 text-blue-500" />;
            case 'bonus':
                return <Gift className="h-4 w-4 text-purple-500" />;
            default:
                return <Wallet className="h-4 w-4 text-gray-500" />;
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'earn':
                return 'bg-green-100 text-green-800';
            case 'spend':
                return 'bg-red-100 text-red-800';
            case 'allowance':
                return 'bg-blue-100 text-blue-800';
            case 'bonus':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No Transactions Yet</h3>
                        <p>Transaction history will appear here as {kid.name} earns and spends money.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transactions.map(transaction => (
                            <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    {getTransactionIcon(transaction.type)}
                                    <div>
                                        <h4 className="font-medium">{transaction.description}</h4>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{formatDate(transaction.date)}</span>
                                            <Badge className={getTransactionColor(transaction.type)}>
                                                {transaction.type}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className={`text-lg font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {transaction.amount >= 0 ? '+' : ''}NGN {Math.abs(transaction.amount).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
