'use client';

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useSupabaseAuth from "@/lib/useSupabaseAuth";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const { user } = useSupabaseAuth();
  const router = useRouter();

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
