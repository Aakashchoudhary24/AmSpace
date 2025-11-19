'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { Users } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('password');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handlePasswordLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) setError(error.message);
    else router.replace('/');
  }

  async function handleMagicLink(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/dashboard' }
    });

    setLoading(false);
    if (error) setError(error.message);
    else setMessage('Magic link sent — check your inbox.');
  }

  return (
    <main className="min-h-screen w-full relative text-gray-800">

      {/* ⚡ Zigzag Lightning Background Pattern */}
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

      {/* Everything above the background */}
      <div className="relative z-10">
        <Navbar />

        {/* Glow behind form */}
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-purple-300/20 blur-[140px]" />

        {/* Form Container */}
        <section className="max-w-4xl mx-auto px-6 py-20 flex items-start justify-center">
          <div className="w-full max-w-md">
            <Card className="p-8 rounded-2xl shadow-2xl bg-white/80 backdrop-blur-md border border-white/30">
              <CardHeader className="flex items-center gap-4 pb-4">
                <div className="p-3 rounded-lg bg-indigo-50">
                  <Users className="h-6 w-6 text-indigo-700" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold">
                    Welcome back
                  </CardTitle>
                  <div className="text-sm text-slate-500">
                    Sign in to your AmSpace account
                  </div>
                </div>
              </CardHeader>

              <CardContent className="mt-4">
                {/* Mode Switch */}
                <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                  <button
                    onClick={() => { setMode('password'); setMessage(''); setError(''); }}
                    className={`py-2 text-sm transition ${
                      mode === 'password'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-transparent text-slate-600'
                    }`}
                  >
                    Password
                  </button>

                  <button
                    onClick={() => { setMode('magic'); setMessage(''); setError(''); }}
                    className={`py-2 text-sm transition ${
                      mode === 'magic'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-transparent text-slate-600'
                    }`}
                  >
                    Magic link
                  </button>
                </div>

                {/* Login Form */}
                <form
                  onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs text-slate-600">Email</label>
                    <Input
                      type="email"
                      className="mt-1"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@college.edu"
                      required
                    />
                  </div>

                  {mode === 'password' && (
                    <div>
                      <label className="text-xs text-slate-600">Password</label>
                      <Input
                        type="password"
                        className="mt-1"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  )}

                  <div className="flex gap-3 items-center">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-full py-2 shadow-md bg-gradient-to-r from-indigo-600 to-fuchsia-600"
                    >
                      {loading
                        ? 'Working…'
                        : mode === 'password'
                        ? 'Sign in'
                        : 'Send magic link'}
                    </Button>

                    <Link href="/auth/register" className="text-sm text-slate-600 underline">
                      Sign up
                    </Link>
                  </div>

                  {message && (
                    <p className="text-sm text-emerald-700 mt-2">{message}</p>
                  )}

                  {error && (
                    <p className="text-sm text-red-600 mt-2">{error}</p>
                  )}
                </form>

                <div className="mt-6 text-xs text-slate-500">
                  By signing in you agree to AmSpace terms. Need help?{' '}
                  <Link href="/contact" className="underline">
                    Contact support
                  </Link>.
                </div>
              </CardContent>
            </Card>

            {/* Small footer help text */}
            <div className="mt-6 text-center text-sm text-slate-600">
              Trouble signing in? <span className="underline">Try magic link</span>.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
