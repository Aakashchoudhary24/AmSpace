'use client';
import React from 'react';
import useSupabaseAuth from '@/lib/useSupabaseAuth';

export default function UserMenu() {
  const { user, supabase } = useSupabaseAuth();

  async function signOut() {
    await supabase.auth.signOut();
    // simple client-side refresh to clear session
    window.location.href = '/';
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <a href="/auth/login" className="text-sm underline">Login</a>
        <a href="/auth/register" className="text-sm">Register</a>
      </div>
    );
  }

  const email = user.email || 'User';
  const initials = email.split('@')[0].slice(0,2).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm">{email}</div>
      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">
        {initials}
      </div>
      <button onClick={signOut} className="text-sm px-3 py-1 rounded-md border">Sign out</button>
    </div>
  );
}
