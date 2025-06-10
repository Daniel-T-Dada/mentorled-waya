'use client'

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { KidTasksManagement } from '@/components/dashboard/parent/kids/tasks';
import { CreateChore } from '@/components/modals/CreateChore';
import { toast } from 'sonner';

const KidTasksPage = () => {
  const params = useParams();
  const kidId = params.kidId as string;
  const [isCreateChoreModalOpen, setIsCreateChoreModalOpen] = useState(false);

  const handleCreateChore = () => {
    setIsCreateChoreModalOpen(true);
  };

  const handleCreateChoreSuccess = () => {
    toast.success('Chore created successfully!');
    // The modal will close itself and refresh the tasks list
  };

  return (
    <>
      <KidTasksManagement kidId={kidId} onCreateChore={handleCreateChore} />

      {/* Create Chore Modal */}
      <CreateChore
        isOpen={isCreateChoreModalOpen}
        onClose={() => setIsCreateChoreModalOpen(false)}
        onSuccess={handleCreateChoreSuccess}
        preSelectedKid={kidId}
      />
    </>
  );
};

export default KidTasksPage;
