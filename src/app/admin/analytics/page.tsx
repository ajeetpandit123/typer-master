'use client';

import { AppShell } from '@/components/layout/AppShell';
import { AdminView } from '@/components/dashboard/AdminView';

export default function AdminAnalyticsPage() {
  return (
    <AppShell>
      <AdminView activeSubTab="analytics" />
    </AppShell>
  );
}
