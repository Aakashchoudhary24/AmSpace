"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import useSupabaseAuth from "@/lib/useSupabaseAuth";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";

/**
 * Polished Profile page
 * - Hero card with avatar, name, role
 * - Left: profile details
 * - Right: meta / stats / quick actions
 * - Recent activity stub
 *
 * Keeps the same Supabase logic you already had.
 */

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();
  const [profile, setProfile] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user && !loading) {
      router.replace("/auth/login");
      return;
    }
    if (user) fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  async function fetchProfile() {
    setFetching(true);
    try {
      const uid = user.id;
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, email, display_name, full_name, role, phone, avatar_url, metadata, created_at"
        )
        .eq("id", uid)
        .single();

      if (error) {
        // handle "no rows" by upserting minimal profile
        if (
          error.code === "PGRST116" ||
          error.message?.includes("Results contain no rows")
        ) {
          await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email,
            display_name:
              user.user_metadata?.full_name?.split(" ")[0] ||
              user.email.split("@")[0],
            full_name: user.user_metadata?.full_name || "",
          });

          const { data: d2 } = await supabase
            .from("profiles")
            .select(
              "id, email, display_name, full_name, role, phone, avatar_url, metadata, created_at"
            )
            .eq("id", uid)
            .single();

          setProfile(d2);
          setFetching(false);
          return;
        }

        console.error("Profile fetch error", error);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }

  if (loading || fetching) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-slate-600">Loading profile…</div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-slate-600">No profile found.</div>
        </div>
      </>
    );
  }

  // compute initials
  const initials = (() => {
    const name =
      profile.full_name || profile.display_name || profile.email || "";
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return (parts[0][0] + parts[1][0]).toUpperCase();
  })();

  // small helper: friendly date
  const joinedAt =
    profile.created_at && new Date(profile.created_at).toLocaleDateString();

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 pb-16">
        {/* Breadcrumb + page header */}
        <div className="max-w-5xl mx-auto px-6 pt-8">
          <nav className="flex items-center text-sm text-slate-600" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-2 select-none">›</span>
            <span className="font-medium text-slate-900">Profile</span>
          </nav>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-5xl tracking-tight">Your profile</h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage your account details, role, and profile information.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <Button onClick={() => alert("Profile edit UI not implemented — add your editor here.")}>
                Edit profile
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: hero card (spans full width on small) */}
          <section className="lg:col-span-2">
            <div className="rounded-2xl bg-gradient-to-r from-white/60 to-white/30 border border-white/10 shadow-lg p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-1 shadow-lg">
                    <div className="bg-white rounded-full p-0.5">
                      <Avatar className="h-20 w-20">
                        {profile.avatar_url ? (
                          <AvatarImage
                            src={profile.avatar_url}
                            alt={profile.display_name || profile.full_name || "user avatar"}
                          />
                        ) : (
                          <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-semibold">{profile.full_name || profile.display_name || profile.email}</h2>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="text-sm text-slate-600">{profile.role || "Student"}</div>
                        {profile.phone && <div className="text-sm text-slate-500">• {profile.phone}</div>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          if (!confirm("Sign out?")) return;
                          await supabase.auth.signOut();
                          router.replace("/");
                        }}
                      >
                        Sign out
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-md text-center">
                      <div className="text-xs text-slate-500">Joined</div>
                      <div className="mt-1 font-medium">{joinedAt || "-"}</div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-md text-center">
                      <div className="text-xs text-slate-500">Role</div>
                      <div className="mt-1 font-medium">{profile.role || "Student"}</div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-md text-center">
                      <div className="text-xs text-slate-500">Public name</div>
                      <div className="mt-1 font-medium">{profile.display_name || "-"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-4 w-[30vw] bg-white/60 border border-white/6">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Personal info</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-700">
                    <div><strong>Email:</strong> {profile.email}</div>
                    <div className="mt-1"><strong>Display name:</strong> {profile.display_name || "-"}</div>
                    <div className="mt-1"><strong>Full name:</strong> {profile.full_name || "-"}</div>
                    <div className="mt-1"><strong>Phone:</strong> {profile.phone || "-"}</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent activity */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Recent activity</h3>
              <div className="mt-3 grid gap-3">
                {/* placeholder activity items */}
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-white/60">
                  <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">A</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Joined Hackathon</div>
                    <div className="text-xs text-slate-600 mt-1">You registered for Campus Hack 2025 — 3 days ago</div>
                  </div>
                  <div className="text-xs text-slate-500">3d</div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border bg-white/60">
                  <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold">R</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Uploaded Project</div>
                    <div className="text-xs text-slate-600 mt-1">Shared a new project to the Projects club — 2 weeks ago</div>
                  </div>
                  <div className="text-xs text-slate-500">2w</div>
                </div>
              </div>
            </div>
          </section>

          {/* Right column: meta / quick actions */}
          <aside>
            <div className="sticky top-20 space-y-4">
              <Card className="p-4 bg-[#0b1220]/80 text-white border border-white/6 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Quick actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" onClick={() => router.push("/leaves/student")}>Request Leave</Button>
                    <Button size="sm" onClick={() => router.push("/events/")}>View Events</Button>
                    <Button size="sm" onClick={() => router.push("/clubs")}>Browse Clubs</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-4">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Profile completeness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${Math.min(90, (profile.full_name ? 90 : 40))}%` }} />
                  </div>
                  <div className="mt-2 text-xs text-slate-600">Complete your profile to get better matches (events/clubs)</div>
                </CardContent>
              </Card>

              <Card className="p-4 bg-white/60">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Support</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-700">
                  Need help? <Link href="/contact" className="text-indigo-600 underline">Contact support</Link>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
