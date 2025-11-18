// app/about/page.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Sparkles, Users, Gift } from 'lucide-react';

export default function AboutPage() {
  const team = [
    { id: 'aakash', name: 'Aakash Choudhary', role: 'Product Manager & Frontend' },
    { id: 'rithu', name: 'Rithu Mithra', role: 'Frontend & Marketing' },
    { id: 'anna', name: 'Anna Tresa', role: 'Design & Public Relations' },
    { id: 'surendran', name: 'K K Surendran', role: 'Public Relations & Backend' }
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold">About AmSpace</h1>
          <p className="text-slate-600 mt-3">
            AmSpace is a student-first campus hub to discover events, join clubs, collaborate on projects and manage administrative tasks like duty leave — all in one place.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4">
            <CardHeader className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-amber-50"><Sparkles className="h-5 w-5 text-amber-600" /></div>
              <CardTitle className="text-sm">Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Make campus collaboration effortless. Lower friction for students to find peers, events and mentors.
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-emerald-50"><Users className="h-5 w-5 text-emerald-600" /></div>
              <CardTitle className="text-sm">Community</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Clubs, communities and faculty-led groups find a single home to run events and manage memberships.
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-violet-50"><Gift className="h-5 w-5 text-violet-600" /></div>
              <CardTitle className="text-sm">Impact</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Help students discover opportunities and reduce administrative overhead for clubs and faculty.
            </CardContent>
          </Card>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold">Meet the team</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {team.map((m) => (
              <Card key={m.id} className="p-4">
                <CardHeader className="flex flex-col items-start gap-2">
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-xs text-slate-500">{m.role}</div>
                </CardHeader>
                <CardContent className="mt-3 text-sm text-slate-600">
                  {m.role === 'Product Manager & Frontend' && 'Leads product direction and implements frontend features.'}
                  {m.role === 'Frontend & Marketing' && 'Builds user-facing experiences and handles outreach & growth.'}
                  {m.role === 'Design & Public Relations' && 'Crafts visual design and manages public-facing communications.'}
                  {m.role === 'Public Relations & Backend' && 'Handles backend systems and manages public relations.'}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-slate-600">Want to help build AmSpace? We welcome contributors and feedback.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link href="https://github.com/aakashchoudhary24/amspace"><Button>GitHub</Button></Link>
            <Link href="https://github.com/aakashchoudhary24/amspace"><Button variant="outline">Contact</Button></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
