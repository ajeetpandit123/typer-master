'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { AuthScreen } from '@/components/layout/AuthScreen';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, profile, loading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-black text-[#FF6B00]">
            KS
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, render AuthScreen
  if (!user || !profile) {
    return <AuthScreen />;
  }

  // Render loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B]">
      <div className="w-16 h-16 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
