'use client';

import { AppShell } from '@/components/layout/AppShell';
import { AdminView } from '@/components/dashboard/AdminView';

export default function AdminDashboardPage() {
  return (
    <AppShell>
      <AdminView activeSubTab="overview" />
    </AppShell>
  );
}
