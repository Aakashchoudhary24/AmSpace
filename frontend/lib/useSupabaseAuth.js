// lib/useSupabaseAuth.js
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * determineRoleByEmail
 * - student if email ends with @am.students.amrita.edu
 * - otherwise faculty
 */
function determineRoleByEmail(email = '') {
  if (typeof email !== 'string') return 'student';
  const e = email.toLowerCase().trim();
  if (e.endsWith('@am.students.amrita.edu')) return 'student';
  return 'faculty';
}

/**
 * ensureProfile(user)
 * - upserts a minimal profile row for the auth user (id = auth.uid())
 * - sets role based on email domain
 */
async function ensureProfile(user) {
  if (!user) return;

  try {
    const computedRole = determineRoleByEmail(user.email);
    const payload = {
      id: user.id,
      email: user.email,
      display_name:
        user.user_metadata?.full_name?.split(' ')[0] ??
        user.user_metadata?.name ??
        user.email?.split('@')[0] ??
        null,
      full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? '',
      role: computedRole
    };

    // upsert is idempotent
    await supabase.from('profiles').upsert(payload, { returning: 'minimal' });
  } catch (err) {
    console.warn('ensureProfile error (ignored):', err);
  }
}

/**
 * useSupabaseAuth hook
 */
export default function useSupabaseAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession()
      .then(({ data }) => {
        if (!mounted) return;
        const u = data?.session?.user ?? null;
        setUser(u);
        setLoading(false);
        if (u) ensureProfile(u);
      })
      .catch((err) => {
        console.warn('getSession error', err);
        if (mounted) setLoading(false);
      });

    const sub = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) ensureProfile(u);
    });

    function safeUnsubscribe(subscription) {
      if (!subscription) return;
      try {
        if (subscription.subscription && typeof subscription.subscription.unsubscribe === 'function') {
          subscription.subscription.unsubscribe();
          return;
        }
        if (typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
          return;
        }
        if (typeof subscription === 'function') {
          subscription();
          return;
        }
      } catch (err) {
        console.warn('Failed to unsubscribe (ignored)', err);
      }
    }

    return () => {
      mounted = false;
      safeUnsubscribe(sub);
    };
  }, []);

  return { user, loading, supabase };
}
