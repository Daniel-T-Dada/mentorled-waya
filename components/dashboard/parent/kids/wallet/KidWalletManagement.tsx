
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { useKidWalletData } from './useKidWalletData';
import { KidWalletHeader } from './KidWalletHeader';
import { WalletOverview } from './WalletOverview';
import { AllowanceSettings } from './AllowanceSettings';
import { TransactionHistory } from './TransactionHistory';
import { PaymentModals } from './PaymentModals';
import { WalletLoading } from './WalletLoading';
import { WalletError } from './WalletError';
import { type AllowanceForm, type BonusForm, type Transaction } from './types';

interface KidWalletManagementProps {
    kidId: string;
}

export const KidWalletManagement = ({ kidId }: KidWalletManagementProps) => {
    const router = useRouter();
    const { kid, transactions, addTransaction, stats, isLoading, error } = useKidWalletData(kidId);

    const [showAddAllowance, setShowAddAllowance] = useState(false);
    const [showAddBonus, setShowAddBonus] = useState(false);
    const [allowanceForm, setAllowanceForm] = useState<AllowanceForm>({
        amount: 0,
        description: ''
    });
    const [bonusForm, setBonusForm] = useState<BonusForm>({
        amount: 0,
        description: ''
    });

    const handleAddAllowance = () => {
        if (!kid || allowanceForm.amount <= 0) return;

        const newTransaction: Transaction = {
            id: Date.now().toString(),
            type: 'allowance',
            amount: allowanceForm.amount,
            description: allowanceForm.description || 'Manual allowance payment',
            date: new Date().toISOString().split('T')[0]
        };

        addTransaction(newTransaction);
        setAllowanceForm({ amount: 0, description: '' });
        setShowAddAllowance(false);
        toast.success(`Added NGN ${allowanceForm.amount.toLocaleString()} allowance to ${kid.name}&apos;s wallet`);
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

        addTransaction(newTransaction);
        setBonusForm({ amount: 0, description: '' });
        setShowAddBonus(false);
        toast.success(`Added NGN ${bonusForm.amount.toLocaleString()} bonus to ${kid.name}&apos;s wallet`);
    };

    const handleEditAllowanceAmount = () => {
        // TODO: Implement edit allowance amount functionality
        toast.info('Edit allowance amount feature coming soon!');
    };

    if (isLoading) {
        return <WalletLoading />;
    }

    if (error || !kid) {
        return <WalletError onGoBack={() => router.push('/dashboard/parents/kids')} />;
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <KidWalletHeader
                kid={kid}
                onBack={() => router.back()}
                onAddAllowance={() => setShowAddAllowance(true)}
                onAddBonus={() => setShowAddBonus(true)}
            />

            <WalletOverview kid={kid} stats={stats} />

            <AllowanceSettings kid={kid} onEditAmount={handleEditAllowanceAmount} />

            <TransactionHistory kid={kid} transactions={transactions} />

            <PaymentModals
                showAddAllowance={showAddAllowance}
                showAddBonus={showAddBonus}
                allowanceForm={allowanceForm}
                bonusForm={bonusForm}
                onAllowanceFormChange={setAllowanceForm}
                onBonusFormChange={setBonusForm}
                onAddAllowance={handleAddAllowance}
                onAddBonus={handleAddBonus}
                onCloseAllowance={() => setShowAddAllowance(false)}
                onCloseBonus={() => setShowAddBonus(false)}
            />
        </div>
    );
};
