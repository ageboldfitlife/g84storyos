import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CinematicPlaceholderContent from '@/tabs/Placeholders/CinematicPlaceholderContent';

export default function CinematicPlaceholderPage() {
  return (
    <DashboardLayout>
      <CinematicPlaceholderContent />
    </DashboardLayout>
  );
}