// app/auth/register/page.jsx (or wherever you keep it)
'use client';
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { Users } from "lucide-react";

function computeRoleFromEmail(email = "") {
  if (typeof email !== "string") return "student";
  const e = email.toLowerCase().trim();
  return e.endsWith("@am.students.amrita.edu") ? "student" : "faculty";
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function upsertProfileRow(user) {
    if (!user) return;
    const role = computeRoleFromEmail(user.email);
    const payload = {
      id: user.id,
      email: user.email,
      display_name:
        user.user_metadata?.full_name?.split(" ")[0] ??
        user.email.split("@")[0],
      full_name: user.user_metadata?.full_name ?? "",
      role,
    };
    try {
      await supabase.from("profiles").upsert(payload, { returning: "minimal" });
    } catch (err) {
      console.warn("upsertProfileRow error (ignored)", err);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Build signUp options (explicit redirect + metadata)
    // Use window.location.origin on the client so the redirect always matches current host.
    const redirectBase =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const signUpOptions = {
      data: { full_name: name },
      emailRedirectTo: `${redirectBase}/auth/verify`,
    };

    try {
      console.log("Signing up", { email, name, signUpOptions });

      // supabase-js v2: supabase.auth.signUp({ email, password }, { options: { ... } })
      // some older/newer SDK shapes differ; we log the full response below.
      const resp = await supabase.auth.signUp(
        { email, password },
        { options: signUpOptions }
      );

      console.log("supabase.auth.signUp response:", resp);

      // Normalize response shapes:
      // v2 typically returns { data: { user, ... }, error }
      // older versions may return { user, session, error } etc.
      const data = resp?.data ?? resp ?? {};
      const err = resp?.error ?? resp?.error ?? null;

      if (err) {
        console.error("signUp returned error:", err);
        setError(err.message || JSON.stringify(err));
        setLoading(false);
        return;
      }

      // Inspect the user object in the response (if present)
      const user =
        data?.user ?? // v2
        resp?.user ?? // older shapes
        null;

      console.log("signUp user object (if any):", user);

      // best-effort upsert profile if a user object is returned
      if (user) {
        try {
          await upsertProfileRow(user);
        } catch (uerr) {
          console.warn("upsertProfileRow failed", uerr);
        }
      }

      // If confirmation required, the user will typically be returned
      // but user.confirmed_at will be null/undefined. Show message accordingly.
      const needsConfirmation =
        user && !user?.confirmed_at && !user?.email_confirmed_at;

      if (needsConfirmation) {
        setMessage(
          "Check your email to confirm the account. If you do not receive an email, check spam or contact admin."
        );
        // redirect to login after a short delay so the user sees the message
        setTimeout(() => router.push("/auth/login"), 2200);
      } else {
        // either auto-confirmed or signed-in; navigate to home
        router.replace("/");
      }
    } catch (thrownErr) {
      console.error("signUp thrown error:", thrownErr);
      setError(thrownErr?.message || String(thrownErr));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[url('/patterns/students-bg.svg')] bg-cover bg-center text-slate-900">
      {/* Topbar (same as landing) */}
      <div className="backdrop-blur-sm bg-white/60 border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-3">
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

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Input
                placeholder="Search events, clubs, study rooms..."
                className="w-72"
              />
            </div>

            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Register area */}
      <section className="max-w-3xl mx-auto px-6 py-20 flex items-start gap-12">
        <div className="w-full">
          <Card className="p-6">
            <CardHeader className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100">
                <Users className="h-6 w-6 text-indigo-700" />
              </div>
              <CardTitle className="text-lg">Create your account</CardTitle>
            </CardHeader>

            <CardContent className="mt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-600">Full name</label>
                  <input
                    className="w-full rounded-md border px-3 py-2 mt-1"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600">Email</label>
                  <input
                    className="w-full rounded-md border px-3 py-2 mt-1"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@college.edu"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600">Password</label>
                  <input
                    className="w-full rounded-md border px-3 py-2 mt-1"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Creating…" : "Create account"}
                  </Button>

                  <Link
                    href="/auth/login"
                    className="text-sm text-slate-600 underline"
                  >
                    Already registered?
                  </Link>
                </div>

                {message && (
                  <div className="text-sm text-emerald-700">{message}</div>
                )}
                {error && <div className="text-sm text-red-600">{error}</div>}
              </form>

              <div className="mt-6 text-xs text-slate-500">
                By creating an account you agree to our Terms. We'll never share
                your data publicly.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
