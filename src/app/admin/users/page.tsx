'use client';

import { AppShell } from '@/components/layout/AppShell';
import { AdminView } from '@/components/dashboard/AdminView';

export default function AdminUsersPage() {
  return (
    <AppShell>
      <AdminView activeSubTab="users" />
    </AppShell>
  );
}
