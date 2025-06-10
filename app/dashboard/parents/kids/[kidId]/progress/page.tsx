'use client'

import { useParams } from 'next/navigation';
import { KidProgressManagement } from '@/components/dashboard/parent/kids/progress';

const KidProgressPage = () => {
  const params = useParams();
  const kidId = params.kidId as string;

  return <KidProgressManagement kidId={kidId} />;
};

export default KidProgressPage;
