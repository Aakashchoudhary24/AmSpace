// components/ProtectedClient.jsx
'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSupabaseAuth from '@/lib/useSupabaseAuth';

export default function ProtectedClient({ children }) {
  const { user, loading } = useSupabaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div>Checking authentication…</div>
      </div>
    );
  }

  return <>{children}</>;
}
