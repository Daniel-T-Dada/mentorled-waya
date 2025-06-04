'use client'

import { useParams } from 'next/navigation';
import { KidProfileManagement } from '@/components/dashboard/parent/kids/profile';

const KidProfilePage = () => {
  const params = useParams();
  const kidId = params.kidId as string;

  return <KidProfileManagement kidId={kidId} />;
};

export default KidProfilePage;
