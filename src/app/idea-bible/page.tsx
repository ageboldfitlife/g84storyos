import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import IdeaBibleContent from '@/tabs/IdeaBible/IdeaBibleContent';

export default function IdeaBiblePage() {
  return (
    <DashboardLayout>
      <IdeaBibleContent />
    </DashboardLayout>
  );
}