'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { Users } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    // If confirm email is enabled, user must check email. Otherwise they are signed in.
    if (data?.user && !data?.user?.confirmed_at) {
      setMessage('Check your email to confirm the account.');
      // still redirect to login after a short delay
      setTimeout(() => router.push('/auth/login'), 1200);
    } else {
      router.replace('/');
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
              <div className="text-xs text-slate-600">A campus hub for co-learning & campus life</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Input placeholder="Search events, clubs, study rooms..." className="w-72" />
            </div>

            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Log in</Button>
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
                    {loading ? 'Creating…' : 'Create account'}
                  </Button>

                  <Link href="/auth/login" className="text-sm text-slate-600 underline">Already registered?</Link>
                </div>

                {message && <div className="text-sm text-emerald-700">{message}</div>}
                {error && <div className="text-sm text-red-600">{error}</div>}
              </form>

              <div className="mt-6 text-xs text-slate-500">
                By creating an account you agree to our Terms. We'll never share your data publicly.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
