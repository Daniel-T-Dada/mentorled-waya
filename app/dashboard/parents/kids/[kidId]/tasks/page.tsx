'use client'

import { useParams } from 'next/navigation';
import { KidTasksManagement } from '@/components/dashboard/parent/kids/tasks';

const KidTasksPage = () => {
  const params = useParams();
  const kidId = params.kidId as string;

  return <KidTasksManagement kidId={kidId} />;
};

export default KidTasksPage;
