import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import IdeaLabContent from '@/tabs/IdeaLab/IdeaLabContent';

export default function IdeaLabPage() {
  return (
    <DashboardLayout>
      <IdeaLabContent />
    </DashboardLayout>
  );
}