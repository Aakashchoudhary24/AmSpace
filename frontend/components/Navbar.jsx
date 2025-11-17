'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useSupabaseAuth from "@/lib/useSupabaseAuth";
import { supabase } from "@/lib/supabaseClient";

/**
 * Navbar with notification badge and realtime subscription.
 * - Fetches recent notifications for logged-in user
 * - Subscribes to postgres INSERT on notifications where profile_id = auth.uid()
 * - Shows a small badge count (incremented on new notifications)
 *
 * Notes: This implementation tries to be schema-agnostic:
 *  - It queries notifications where profile_id = user.id
 *  - If you have an "is_read" or "read" column, you can change the filter to only count unread ones.
 */

export default function Navbar() {
  const { user } = useSupabaseAuth();
  const router = useRouter();

  const [notificationsCount, setNotificationsCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  // compute initials
  const initials = React.useMemo(() => {
    if (!user) return null;
    const name = user.user_metadata?.full_name || user.email || "";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return null;
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, [user]);

  const roleText = user?.user_metadata?.role ?? null;

  useEffect(() => {
    if (!user) {
      setNotificationsCount(0);
      setRecentNotifications([]);
      return;
    }

    let channel = null;
    let mounted = true;

    // 1) fetch recent notifications for this user
    // If you have a "is_read" column, change `.neq('is_read', true)` or similar
    (async () => {
      try {
        const q = supabase
          .from('notifications')
          .select('id, type, payload, created_at')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        const { data, error } = await q;
        if (error) {
          console.warn('Navbar: fetch notifications error', error);
        } else if (mounted) {
          setRecentNotifications(data || []);
          // simple unread count heuristic: all recent notifications are "unread"
          setNotificationsCount((data && data.length) || 0);
        }
      } catch (err) {
        console.warn('Navbar: unexpected fetch notifications error', err);
      }
    })();

    // 2) subscribe to realtime notification inserts for this user
    try {
      channel = supabase
        .channel(`public:notifications:profile:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `profile_id=eq.${user.id}`,
          },
          (payload) => {
            // payload.record contains the inserted row
            const rec = payload?.record ?? null;
            if (!rec) return;
            // update list and increment count
            setRecentNotifications((prev) => [rec, ...(prev || []).slice(0, 9)]);
            setNotificationsCount((c) => (typeof c === 'number' ? c + 1 : 1));
            // optional: you could also show a toast here
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Navbar: subscribe error', err);
    }

    return () => {
      mounted = false;
      try {
        if (channel) supabase.removeChannel(channel);
      } catch (err) {
        // ignore
      }
    };
  }, [user]);

  return (
    <div className="backdrop-blur-sm bg-white/60 border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-extrabold">
            AS
          </div>
          <div>
            <div className="text-lg font-semibold">AmSpace</div>
            <div className="text-xs text-slate-600">
              A campus hub for co-learning & campus life
            </div>
          </div>
        </div>

        {/* Search + Nav */}
        <div className="flex items-center gap-6">
          {/* Search */}
          <div className="hidden md:block">
            <Input
              placeholder="Search events, clubs, study rooms..."
              className="w-72"
            />
          </div>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-3 text-sm">
            <Link href="/" className="px-3 py-2 rounded-md hover:bg-slate-100">
              Home
            </Link>
            <Link
              href="/events"
              className="px-3 py-2 rounded-md hover:bg-slate-100"
            >
              Events
            </Link>

            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="px-3 py-2 rounded-md hover:bg-slate-100"
                >
                  Dashboard
                </Link>
                <Link
                  href="/leaves/student"
                  className="px-3 py-2 rounded-md hover:bg-slate-100"
                >
                  Leaves
                </Link>
                <Link
                  href="/profile"
                  className="px-3 py-2 rounded-md hover:bg-slate-100"
                >
                  Profile
                </Link>
              </>
            )}
          </nav>

          {/* Right actions */}
          {!user && (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}

          {user && (
            <div className="flex items-center gap-3">
              {/* Mobile small button */}
              <div className="md:hidden">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Hub</Button>
                </Link>
              </div>

              <div className="hidden md:flex items-center gap-2">
                {roleText && (
                  <div className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">
                    {roleText}
                  </div>
                )}

                {/* Notification bell with badge */}
                <div className="relative">
                  <Link href="/notifications" className="inline-flex items-center p-2 rounded hover:bg-slate-100">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z"/>
                      <path d="M13.73 21a2 2 0 01-3.46 0" />
                    </svg>
                  </Link>
                  {notificationsCount > 0 && (
                    <div className="absolute -top-0 -right-0 translate-x-1/2 -translate-y-1/2">
                      <div className="bg-rose-600 text-white text-xs rounded-full px-2 py-0.5">
                        {notificationsCount}
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/profile" className="group">
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium cursor-pointer">
                    <span className="select-none">{initials}</span>
                  </div>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="text-sm px-3 py-1 rounded-md border"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
