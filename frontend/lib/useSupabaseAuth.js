"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * Fallback ONLY for first-time signups before profile row is created.
 * After profile exists, we ALWAYS use profile.role from DB.
 */
function determineInitialRole(email = "") {
  if (typeof email !== "string") return "student";
  const e = email.toLowerCase().trim();
  if (e.endsWith("@am.students.amrita.edu")) return "student";
  return "faculty";
}

// Load a profile row by id
async function fetchProfileById(id) {
  if (!id) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.warn("fetchProfileById error:", error);
    return null;
  }
  return data;
}

/**
 * ensureProfile(user)
 * Creates the profile if missing.
 * DOES NOT override an existing role — preserves DB role.
 */
async function ensureProfile(user) {
  if (!user) return;

  try {
    // 1. Check if the profile exists
    const { data: existing } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    const role = existing?.role ?? determineInitialRole(user.email);

    const payload = {
      id: user.id,
      email: user.email,
      display_name:
        user.user_metadata?.full_name?.split(" ")[0] ??
        user.user_metadata?.name ??
        user.email.split("@")[0],
      full_name:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        "",
      role, // preserve existing role or assign fallback for first login
    };

    await supabase.from("profiles").upsert(payload, { returning: "minimal" });
  } catch (err) {
    console.warn("ensureProfile() failed:", err);
  }
}

/**
 * useSupabaseAuth
 * Unified role logic:
 *   - role = profile.role (DB is source of truth)
 *   - fallback only on first login: determineInitialRole()
 */
export default function useSupabaseAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid) => {
    if (!uid) {
      setProfile(null);
      return;
    }
    const p = await fetchProfileById(uid);
    setProfile(p);
  }, []);

  // Initial load
  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!mounted) return;

        const u = data?.session?.user ?? null;
        setUser(u);

        if (u) {
          await ensureProfile(u); // create profile if missing
          await loadProfile(u.id);
        } else {
          setProfile(null);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.warn("getSession error:", err);
        if (mounted) setLoading(false);
      });

    // Auth state listener
    const { data: authSub } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        const u = session?.user ?? null;
        setUser(u);

        if (u) {
          await ensureProfile(u);
          await loadProfile(u.id);
        } else {
          setProfile(null);
        }
      }
    );

    // Cleanup
    return () => {
      mounted = false;
      try {
        authSub?.subscription?.unsubscribe();
      } catch (err) {
        console.warn("unsubscribe failed:", err);
      }
    };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("signOut error:", err);
    }
  }, []);

  /**
   * Role = profile.role ALWAYS (DB is the source of truth)
   * Fallback ONLY if profile missing temporarily.
   */
  const role =
    profile?.role ??
    determineInitialRole(user?.email ?? "");

  const isStudent = role === "student";
  const isFaculty = role === "faculty";
  const isAdmin = role === "admin";
  const isparent = role === "parent";

  return {
    user,
    profile,
    role,
    isStudent,
    isFaculty,
    isAdmin,
    isparent,
    loading,
    supabase,
    signOut
  };
}
