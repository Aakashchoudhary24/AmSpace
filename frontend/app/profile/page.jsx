"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import useSupabaseAuth from "@/lib/useSupabaseAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "../../components/Navbar";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();
  const [profile, setProfile] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user && !loading) {
      router.replace("/auth/login");
      return;
    }
    if (user) {
      fetchProfile();
    }
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
        // If profile not found, create a minimal profile row (upsert)
        if (
          error.code === "PGRST116" ||
          error.message?.includes("Results contain no rows")
        ) {
          // upsert minimal
          await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email,
            display_name:
              user.user_metadata?.full_name?.split(" ")[0] ||
              user.email.split("@")[0],
            full_name: user.user_metadata?.full_name || "",
          });
          // try fetch again
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
      <div className="min-h-[200px] flex items-center justify-center">
        Loading profile…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        No profile found.
      </div>
    );
  }

  const initials = (() => {
    const name =
      profile.full_name || profile.display_name || profile.email || "";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  })();

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <Card className="p-6">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar>
                {profile.avatar_url ? (
                  <AvatarImage
                    src={profile.avatar_url}
                    alt={profile.display_name || profile.full_name || "avatar"}
                  />
                ) : (
                  <AvatarFallback>{initials}</AvatarFallback>
                )}
              </Avatar>

              <div>
                <CardTitle className="text-lg">
                  {profile.full_name || profile.display_name || profile.email}
                </CardTitle>
                <div className="text-sm text-slate-600">{profile.role}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                Back
              </Button>
              <Button
                onClick={() =>
                  alert(
                    "Edit UI not implemented — change profile via dashboard or add edit form"
                  )
                }
              >
                Edit
              </Button>
            </div>
          </CardHeader>

          <CardContent className="mt-4 grid grid-cols-1 gap-2">
            <div className="text-sm">
              <strong>Email:</strong> {profile.email}
            </div>
            <div className="text-sm">
              <strong>Display name:</strong> {profile.display_name || "-"}
            </div>
            <div className="text-sm">
              <strong>Full name:</strong> {profile.full_name || "-"}
            </div>
            <div className="text-sm">
              <strong>Phone:</strong> {profile.phone || "-"}
            </div>
            <div className="text-sm">
              <strong>Joined:</strong>{" "}
              {new Date(profile.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
