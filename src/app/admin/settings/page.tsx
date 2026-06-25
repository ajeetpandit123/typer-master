'use client';

import { AppShell } from '@/components/layout/AppShell';
import { AdminView } from '@/components/dashboard/AdminView';

export default function AdminSettingsPage() {
  return (
    <AppShell>
      <AdminView activeSubTab="settings" />
    </AppShell>
  );
}
