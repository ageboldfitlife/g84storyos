import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import BeatMapContent from '@/tabs/BeatMap/BeatMapContent';

export default function BeatMapPage() {
  return (
    <DashboardLayout>
      <BeatMapContent />
    </DashboardLayout>
  );
}
