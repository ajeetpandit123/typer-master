'use client';

import { AppShell } from '@/components/layout/AppShell';
import { AdminView } from '@/components/dashboard/AdminView';

export default function AdminWordsPage() {
  return (
    <AppShell>
      <AdminView activeSubTab="words" />
    </AppShell>
  );
}
