'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { Users } from "lucide-react";
import Navbar from "@/components/Navbar";

function computeRoleFromEmail(email = "") {
  if (!email) return "student";
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
    const data = {
      id: user.id,
      email: user.email,
      display_name: user.email.split("@")[0],
      full_name: name,
      role,
    };
    try {
      await supabase.from("profiles").upsert(data);
    } catch {}
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const redirectBase =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${redirectBase}/auth/verify`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data?.user) upsertProfileRow(data.user);

      setMessage("Check your email to confirm your account.");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen w-full relative text-gray-800">

      {/* Zigzag background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(75, 85, 99, 0.08) 20px, rgba(75, 85, 99, 0.08) 21px),
            repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(107, 114, 128, 0.06) 30px, rgba(107, 114, 128, 0.06) 31px),
            repeating-linear-gradient(60deg, transparent, transparent 40px, rgba(55, 65, 81, 0.05) 40px, rgba(55, 65, 81, 0.05) 41px),
            repeating-linear-gradient(150deg, transparent, transparent 35px, rgba(31, 41, 55, 0.04) 35px, rgba(31, 41, 55, 0.04) 36px)
          `,
        }}
      />

      <div className="relative z-10">
        <Navbar />

        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-purple-300/20 blur-[140px] rounded-full" />

        <section className="max-w-4xl mx-auto px-6 py-20 flex justify-center">
          <div className="w-full max-w-md">
            <Card className="p-8 rounded-2xl bg-white/75 backdrop-blur-md border border-white/20 shadow-none">
              <CardHeader className="flex items-center gap-4 pb-4">
                <div className="p-3 rounded-lg bg-indigo-100">
                  <Users className="h-6 w-6 text-indigo-700" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold">Create an account</CardTitle>
                  <p className="text-sm text-slate-500">
                    Join AmSpace and get started
                  </p>
                </div>
              </CardHeader>

              <CardContent className="mt-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-600">Full name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Your full name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600">Email</label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      type="email"
                      placeholder="you@college.edu"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600">Password</label>
                    <Input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      type="password"
                      placeholder="Create a strong password"
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full py-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 shadow-none"
                  >
                    {loading ? "Creating…" : "Create account"}
                  </Button>

                  {error && <p className="text-sm text-red-600">{error}</p>}
                  {message && <p className="text-sm text-emerald-700">{message}</p>}
                </form>

                <div className="mt-6 text-xs text-slate-500">
                  By creating an account you agree to our terms.
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
