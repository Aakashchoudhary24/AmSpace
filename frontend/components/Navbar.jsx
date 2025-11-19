"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useSupabaseAuth from "@/lib/useSupabaseAuth";
import { supabase } from "@/lib/supabaseClient";

/**
 * Navbar (fixed): OSMO-inspired centered pill + overlay menu
 * - Fixed formatting issues in overlay menu (links were inline)
 * - All overlay links now block + spaced
 */

export default function Navbar() {
  const { user } = useSupabaseAuth();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);

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

  const overlayRef = useRef(null);

  // disable scroll + ESC to close
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onKey);
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    }
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // focus trap: focus first interactive element inside overlay
  useEffect(() => {
    if (menuOpen && overlayRef.current) {
      const first = overlayRef.current.querySelector(
        'a,button,input,[tabindex]:not([tabindex="-1"])'
      );
      if (first?.focus) first.focus();
    }
  }, [menuOpen]);

  // notifications
  useEffect(() => {
    if (!user) {
      setNotificationsCount(0);
      setRecentNotifications([]);
      return;
    }

    let channel = null;

    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id,type,payload,created_at")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setRecentNotifications(data || []);
      setNotificationsCount(data?.length || 0);
    })();

    try {
      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `profile_id=eq.${user.id}`,
          },
          (payload) => {
            const rec = payload?.record;
            if (!rec) return;
            setRecentNotifications((prev) => [rec, ...prev.slice(0, 9)]);
            setNotificationsCount((c) => (typeof c === "number" ? c + 1 : 1));
          }
        )
        .subscribe();
    } catch (err) {
      // ignore subscription errors
    }

    return () => {
      try {
        if (channel) supabase.removeChannel(channel);
      } catch (err) {}
    };
  }, [user]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const panelVariants = {
    hidden: { opacity: 0, y: -40, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.97,
      transition: { duration: 0.25 },
    },
  };

  return (
    <>
      {/* CENTERED PILL NAVBAR */}
      <header className="relative z-40 pointer-events-auto">
        <div className="pointer-events-none justify-self-center w-[40vw] absolute inset-x-0 top-4 flex justify-center z-40">
          <div className="pointer-events-auto bg-purple-600 text-white rounded-md mb-1 px-5 py-2 flex items-center gap-6 shadow-xl">
            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="p-2 rounded-md hover:bg-white/10"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor">
                <path
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  d="M4 7h16M4 12h16M4 17h16"
                />
              </svg>
            </button>

            {/* Center logo */}
            <div className="text-xl w-[12.2vw] text-center tracking-tight">
              AmSpace
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {!user && (
                <>
                  <Link href="/auth/login" className="inline-flex">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="inline-flex">
                    <Button
                      size="sm"
                      className="bg-lime-400  text-black hover:brightness-95"
                    >
                      Join
                    </Button>
                  </Link>
                </>
              )}

              {user && (
                <div className="flex items-center gap-3">
                  <Link href="/profile" className="inline-flex">
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">
                      {initials}
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* INFINITE NEON MARQUEE (you can replace with the continuous version if preferred) */}
        <div className="pointer-events-none absolute inset-x-0 top-[62px] mt-2 flex justify-center z-30">
          <div className="w-full max-w-md overflow-hidden marquee-wrapper">
            <div className="marquee flex items-center whitespace-nowrap">
              {/* repeated items (these are chips originally — kept for now) */}
              {[
                " NEW: AMSPACE UPDATES — JOIN EVENTS & DISCOVER CLUBS ",
                "  HACKATHONS • WORKSHOPS • SEMINARS  ",
                "  CLUBS: DESIGN • CODING • DRAMA • ROBOTICS  ",
              ].map((txt, i) => (
                <React.Fragment key={i}>
                  <span className="inline-flex items-center px-4 py-1 rounded-md bg-[#a1ff62] text-black tracking-wider text-xs shadow-[0_6px_18px_rgba(120,250,120,0.18)]">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" aria-hidden>
                      <path
                        d="M12 2l2.4 4.9L19.5 8 14.9 11l1.6 5.1L12 13.9 7.5 16.1 9.1 11 4.5 8l5.1-1.1L12 2z"
                        fill="currentColor"
                      />
                    </svg>
                    {txt}
                  </span>
                </React.Fragment>
              ))}

              {/* duplicated set for seamless loop */}
              {[
                "  NEW: AMSPACE UPDATES — JOIN EVENTS & DISCOVER CLUBS  ",
                "  HACKATHONS • WORKSHOPS • FROSH WEEK  ",
                "  CLUBS: DESIGN • CODING • DRAMA • ROBOTICS  ",
              ].map((txt, i) => (
                <React.Fragment key={`dup-${i}`}>
                  <span className="inline-flex items-center px-4 py-1 rounded-md bg-[#a1ff62] text-black tracking-wider text-xs shadow-[0_6px_18px_rgba(120,250,120,0.18)]">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" aria-hidden>
                      <path
                        d="M12 2l2.4 4.9L19.5 8 14.9 11l1.6 5.1L12 13.9 7.5 16.1 9.1 11 4.5 8l5.1-1.1L12 2z"
                        fill="currentColor"
                      />
                    </svg>
                    {txt}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Spacer to avoid overlap */}
        <div className="h-28" />
      </header>

      {/* OVERLAY MENU */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              variants={backdropVariants}
              onClick={() => setMenuOpen(false)}
            />

            {/* panel */}
            <div className="absolute inset-0 flex items-start justify-center">
              <motion.div
                ref={overlayRef}
                className="w-[95%] max-w-7xl mt-10 bg-white rounded-2xl shadow-2xl overflow-hidden"
                variants={panelVariants}
              >
                {/* Header inside overlay */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="p-2 rounded-md hover:bg-slate-100"
                      aria-label="Close menu"
                    >
                      <svg className="h-5 w-5" stroke="currentColor" fill="none">
                        <path strokeWidth="1.6" d="M6 6l12 12M6 18L18 6" />
                      </svg>
                    </button>
                    <div className="text-lg font-semibold">Menu</div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!user ? (
                      <>
                        <Link href="/auth/login" className="inline-flex">
                          <Button variant="ghost" size="sm">
                            Login
                          </Button>
                        </Link>
                        <Link href="/auth/register" className="inline-flex">
                          <Button size="sm">Sign Up</Button>
                        </Link>
                      </>
                    ) : (
                      <Button size="sm" onClick={handleSignOut}>
                        Logout
                      </Button>
                    )}
                  </div>
                </div>

                {/* body grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 py-8">
                  {/* column 1: NAVIGATE */}
                  <div>
                    <div className="text-xs uppercase text-slate-500 mb-3">
                      Navigate
                    </div>

                    {/* Links set to block and spaced */}
                    <nav className="space-y-3 text-lg">
                      <Link
                        href="/"
                        onClick={() => setMenuOpen(false)}
                        className="block py-1 hover:underline"
                      >
                        Home
                      </Link>

                      <Link
                        href="/discover"
                        onClick={() => setMenuOpen(false)}
                        className="block py-1 hover:underline"
                      >
                        Discover
                      </Link>

                      <Link
                        href="/events"
                        onClick={() => setMenuOpen(false)}
                        className="block py-1 hover:underline"
                      >
                        Events
                      </Link>

                      <Link
                        href="/clubs"
                        onClick={() => setMenuOpen(false)}
                        className="block py-1 hover:underline"
                      >
                        Clubs
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="block py-1 hover:underline"
                      >
                        Profile
                      </Link>
                    </nav>
                  </div>

                  {/* column 2: SEARCH + QUICK LINKS */}
                  <div>
                    <div className="text-xs uppercase text-slate-500 mb-3">
                      Search
                    </div>

                    <div>
                      <Input
                        placeholder="Search events, clubs, study rooms…"
                        className="w-full"
                      />
                    </div>

                    <div className="mt-6 text-xs uppercase text-slate-500">
                      Quick Links
                    </div>

                    <div className="mt-3 space-y-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="block py-1 hover:underline"
                      >
                        Dashboard
                      </Link>

                      <Link
                        href="/leaves/student"
                        onClick={() => setMenuOpen(false)}
                        className="block py-1 hover:underline"
                      >
                        Leaves
                      </Link>

                      <Link
                        href="/events"
                        onClick={() => setMenuOpen(false)}
                        className="block py-1 hover:underline"
                      >
                        Events
                      </Link>
                    </div>
                  </div>

                  {/* column 3: ACCOUNT + NOTIFICATIONS */}
                  <div>
                    <div className="text-xs uppercase text-slate-500 mb-3">
                      Account
                    </div>

                    {user ? (
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">
                            {user.user_metadata?.full_name || user.email}
                          </div>
                          {roleText && (
                            <div className="text-xs text-slate-500">{roleText}</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm">No user logged in</div>
                    )}

                    <div className="mt-6 text-xs uppercase text-slate-500">
                      Notifications
                    </div>

                    <div className="mt-2 space-y-2 max-h-40 overflow-auto">
                      {recentNotifications.length === 0 ? (
                        <div className="text-sm text-slate-500">No notifications</div>
                      ) : (
                        recentNotifications.map((n) => (
                          <div key={n.id} className="p-2 rounded bg-slate-100 text-sm">
                            <div className="font-semibold">{n.type}</div>
                            <div className="text-xs text-slate-600">
                              {typeof n.payload === "string" ? n.payload : JSON.stringify(n.payload)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t flex justify-between text-sm text-slate-600">
                  <div>© {new Date().getFullYear()} AmSpace</div>
                  <div className="flex gap-4">
                    <Link href="/privacy" className="text-sm hover:underline">Privacy</Link>
                    <Link href="/terms" className="text-sm hover:underline">Terms</Link>
                    <Link href="/contact" className="text-sm hover:underline">Contact</Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
