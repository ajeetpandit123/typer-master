'use client';

import { AppShell } from '@/components/layout/AppShell';
import { AdminView } from '@/components/dashboard/AdminView';

export default function AdminTestsPage() {
  return (
    <AppShell>
      <AdminView activeSubTab="tests" />
    </AppShell>
  );
}
