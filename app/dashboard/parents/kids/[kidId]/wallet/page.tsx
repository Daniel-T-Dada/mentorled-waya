'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Wallet, TrendingUp, TrendingDown, Calendar, Gift, Target } from 'lucide-react';
import { mockDataService, type Kid } from '@/lib/services/mockDataService';
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: 'earn' | 'spend' | 'allowance' | 'bonus';
  amount: number;
  description: string;
  date: string;
  relatedTaskId?: string;
}

const KidWalletPage = () => {
  const params = useParams();
  const router = useRouter();
  const kidId = params.kidId as string;

  const [kid, setKid] = useState<Kid | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddAllowance, setShowAddAllowance] = useState(false);
  const [showAddBonus, setShowAddBonus] = useState(false);
  const [allowanceForm, setAllowanceForm] = useState({
    amount: 0,
    description: ''
  });
  const [bonusForm, setBonusForm] = useState({
    amount: 0,
    description: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const kidData = mockDataService.getKidById(kidId);
      if (kidData) {
        setKid(kidData);
        
        // Generate mock transactions for demonstration
        const mockTransactions: Transaction[] = [
          {
            id: '1',
            type: 'allowance',
            amount: 1000,
            description: 'Weekly allowance',
            date: '2024-01-08'
          },
          {
            id: '2',
            type: 'earn',
            amount: 500,
            description: 'Completed: Clean room',
            date: '2024-01-07',
            relatedTaskId: 'task1'
          },
          {
            id: '3',
            type: 'earn',
            amount: 300,
            description: 'Completed: Do dishes',
            date: '2024-01-06',
            relatedTaskId: 'task2'
          },
          {
            id: '4',
            type: 'spend',
            amount: -200,
            description: 'Bought a toy',
            date: '2024-01-05'
          },
          {
            id: '5',
            type: 'bonus',
            amount: 800,
            description: 'Good behavior bonus',
            date: '2024-01-04'
          },
          {
            id: '6',
            type: 'allowance',
            amount: 1000,
            description: 'Weekly allowance',
            date: '2024-01-01'
          }
        ];
        
        setTransactions(mockTransactions);
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [kidId]);

  const handleAddAllowance = () => {
    if (!kid || allowanceForm.amount <= 0) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'allowance',
      amount: allowanceForm.amount,
      description: allowanceForm.description || 'Manual allowance payment',
      date: new Date().toISOString().split('T')[0]
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update kid's balance (in a real app, this would be an API call)
    const updatedBalance = kid.balance + allowanceForm.amount;
    setKid({ ...kid, balance: updatedBalance });
    
    setAllowanceForm({ amount: 0, description: '' });
    setShowAddAllowance(false);
    toast.success(`Added NGN ${allowanceForm.amount.toLocaleString()} allowance to ${kid.name}'s wallet`);
  };

  const handleAddBonus = () => {
    if (!kid || bonusForm.amount <= 0) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'bonus',
      amount: bonusForm.amount,
      description: bonusForm.description || 'Performance bonus',
      date: new Date().toISOString().split('T')[0]
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update kid's balance
    const updatedBalance = kid.balance + bonusForm.amount;
    setKid({ ...kid, balance: updatedBalance });
    
    setBonusForm({ amount: 0, description: '' });
    setShowAddBonus(false);
    toast.success(`Added NGN ${bonusForm.amount.toLocaleString()} bonus to ${kid.name}'s wallet`);
  };

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

  const calculateStats = () => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const thisMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    const totalEarned = thisMonthTransactions
      .filter(t => t.type === 'earn' || t.type === 'allowance' || t.type === 'bonus')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = thisMonthTransactions
      .filter(t => t.type === 'spend')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { totalEarned, totalSpent };
  };

  const { totalEarned, totalSpent } = calculateStats();

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-8 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-6 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-40 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!kid) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Kid Not Found</h2>
          <p className="text-gray-600 mb-4">The kid profile you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/dashboard/parents/kids')}>
            Back to Kids
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
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
          <Button variant="outline" onClick={() => setShowAddAllowance(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Add Allowance
          </Button>
          <Button onClick={() => setShowAddBonus(true)}>
            <Gift className="h-4 w-4 mr-2" />
            Add Bonus
          </Button>
        </div>
      </div>

      {/* Wallet Overview */}
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
              NGN {totalEarned.toLocaleString()}
            </div>
            <p className="text-muted-foreground">Earned This Month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingDown className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <div className="text-2xl font-bold text-red-600 mb-2">
              NGN {totalSpent.toLocaleString()}
            </div>
            <p className="text-muted-foreground">Spent This Month</p>
          </CardContent>
        </Card>
      </div>

      {/* Allowance Settings */}
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
                Automatic weekly payment to {kid.name}'s wallet
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">
                NGN {kid.allowanceAmount?.toLocaleString() || '0'}
              </div>
              <Button variant="outline" size="sm" className="mt-2">
                Edit Amount
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
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
                  
                  <div className={`text-lg font-bold ${
                    transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount >= 0 ? '+' : ''}NGN {Math.abs(transaction.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
                  onChange={(e) => setAllowanceForm({ 
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
                  onChange={(e) => setAllowanceForm({ 
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
                  onClick={() => setShowAddAllowance(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleAddAllowance}
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
                  onChange={(e) => setBonusForm({ 
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
                  onChange={(e) => setBonusForm({ 
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
                  onClick={() => setShowAddBonus(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleAddBonus}
                  disabled={bonusForm.amount <= 0}
                >
                  Add Bonus
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default KidWalletPage;
