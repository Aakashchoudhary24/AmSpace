// frontend/lib/useSupabaseAuth.js
"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * determineRoleByEmail:
 *  - students: emails ending with @am.students.amrita.edu
 *  - faculty: everything else by default
 */
function determineRoleByEmail(email = "") {
  if (typeof email !== "string") return "student";
  const e = email.toLowerCase().trim();
  if (e.endsWith("@am.students.amrita.edu")) return "student";
  return "faculty";
}

async function fetchProfileById(id) {
  if (!id) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .limit(1)
    .single();
  if (error) {
    console.warn("fetchProfileById error (ignored):", error);
    return null;
  }
  return data;
}

/**
 * ensureProfile(user)
 * - creates profile only if not present
 * - DOES NOT overwrite an existing role (preserves 'admin' you set manually)
 */
async function ensureProfile(user) {
  if (!user) return;

  try {
    const computedRole = determineRoleByEmail(user.email);

    // check existing profile first
    const { data: existing } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .limit(1)
      .single();

    const payload = {
      id: user.id,
      email: user.email,
      display_name:
        user.user_metadata?.full_name?.split(" ")[0] ??
        user.user_metadata?.name ??
        user.email?.split("@")[0] ??
        null,
      full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
      // preserve role if already present, otherwise set computedRole
      role: existing ? existing.role : computedRole,
    };

    // upsert will create if not present, or update only the fields we provided.
    await supabase.from("profiles").upsert(payload, { returning: "minimal" });
  } catch (err) {
    console.warn("ensureProfile error (ignored):", err);
  }
}

/**
 * useSupabaseAuth hook
 * returns: { user, profile, isStudent, isFaculty, isAdmin, loading, supabase, signOut }
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

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        const u = data?.session?.user ?? null;
        setUser(u);
        setLoading(false);
        if (u) {
          ensureProfile(u).then(() => loadProfile(u.id));
        } else {
          setProfile(null);
        }
      })
      .catch((err) => {
        console.warn("getSession error", err);
        if (mounted) setLoading(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        ensureProfile(u).then(() => loadProfile(u.id));
      } else {
        setProfile(null);
      }
    });

    function safeUnsubscribe(sub) {
      if (!sub) return;
      try {
        if (sub.subscription && typeof sub.subscription.unsubscribe === "function") {
          sub.subscription.unsubscribe();
          return;
        }
        if (typeof sub.unsubscribe === "function") {
          sub.unsubscribe();
          return;
        }
        if (typeof sub === "function") {
          sub();
          return;
        }
      } catch (err) {
        console.warn("Failed to unsubscribe (ignored)", err);
      }
    }

    return () => {
      mounted = false;
      safeUnsubscribe(subscription);
    };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("signOut error (ignored)", err);
    }
  }, []);

  const role = profile?.role ?? determineRoleByEmail(user?.email ?? "");
  const isStudent = role === "student";
  const isFaculty = role === "faculty";
  const isAdmin = role === "admin";

  return { user, profile, isStudent, isFaculty, isAdmin, loading, supabase, signOut };
}
