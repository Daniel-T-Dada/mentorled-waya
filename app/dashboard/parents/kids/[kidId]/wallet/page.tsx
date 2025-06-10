'use client'

import { useParams } from 'next/navigation';
import { KidWalletManagement } from '@/components/dashboard/parent/kids/wallet';

const KidWalletPage = () => {
  const params = useParams();
  const kidId = params.kidId as string;

  return <KidWalletManagement kidId={kidId} />;
};

export default KidWalletPage;
