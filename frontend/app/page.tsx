"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, CalendarPlus, Gift, Coffee} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[url('/patterns/students-bg.svg')] bg-cover bg-center text-slate-900">
      {/* Topbar */}
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
              <Input
                placeholder="Search events, clubs, study rooms..."
                className="w-72"
              />
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

      {/* Hero */}  
      <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight">
            Meet • Learn • Collaborate
          </h1>
          <p className="mt-4 text-lg text-slate-700 max-w-2xl">
            AmSpace is the student playground for learning together: form study rooms, join clubs,
            register for events, and celebrate wins with your friends — all on campus.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard">
              <Button size="lg" className="shadow-lg">Enter the Hub</Button>
            </Link> 

            <Link href="/events">
              <Button variant="outline" size="lg" className="px-5">Explore Events</Button>
            </Link>

            <Link href="/clubs">
              <Button variant="outline" size="lg" className="px-5">Clubs</Button>
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Avatar>
              <AvatarImage src="/avatar-1.jpg" alt="student" />
              <AvatarFallback>AR</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <span className="font-semibold">Rithu</span>
              <div className="text-xs text-slate-500">Joined a hackathon — 2 hrs ago</div>
            </div>

            <Badge className="ml-4" variant="secondary">1200+ students active</Badge>
          </div>
        </div>

        {/* Right visual/card */}
        <div className="w-full md:w-1/2">
          <Card className="p-4 bg-gradient-to-tr from-white/80 to-indigo-50">
            <CardHeader className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100">
                <Users className="h-6 w-6 text-indigo-700" />
              </div>
              <div>
                <CardTitle className="text-base">Quick join</CardTitle>
                <div className="text-xs text-slate-600">Pick a room or event and hop in</div>
              </div>
            </CardHeader>

            <CardContent className="mt-3 grid gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">CSE Study Room</div>
                  <div className="text-xs text-slate-500">Algorithms study sesh • 9 people</div>
                </div>
                <Button size="sm">Join</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Open Mic Night</div>
                  <div className="text-xs text-slate-500">Cultural Club • Oct 21</div>
                </div>
                <Button variant="outline" size="sm">Register</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Design Collab</div>
                  <div className="text-xs text-slate-500">Project pairing • 3 teams forming</div>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feature grid — student-focused */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-4 hover:scale-[1.02] transition-transform">
          <CardHeader className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-amber-100">
              <Coffee className="h-6 w-6 text-amber-700" />
            </div>
            <CardTitle>Study Rooms</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Create or join focused rooms — set timers, share notes, and pair with study buddies.
          </CardContent>
        </Card>

        <Card className="p-4 hover:scale-[1.02] transition-transform">
          <CardHeader className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-emerald-100">
              <CalendarPlus className="h-6 w-6 text-emerald-700" />
            </div>
            <CardTitle>Events & Fests</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Discover workshops, hackathons, and cultural nights — RSVP and invite friends.
          </CardContent>
        </Card>

        <Card className="p-4 hover:scale-[1.02] transition-transform">
          <CardHeader className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-violet-100">
              <Gift className="h-6 w-6 text-violet-700" />
            </div>
            <CardTitle>Clubs & Projects</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Join clubs, collaborate on projects, and showcase your work at campus expos.
          </CardContent>
        </Card>
      </section>

      {/* CTA strip */}
      <section className="mt-6 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-semibold">Ready to hang out with your campus?</h3>
            <p className="text-sm text-indigo-100">Sign up and jump straight into events, study rooms, or a club meeting.</p>
          </div>

          <div className="flex gap-3">
            <Link href="/auth/register"><Button size="lg">Create Free Account</Button></Link>
            <Link href="/events"><Button variant="ghost" size="lg">Browse Events</Button></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10 py-8 text-sm text-slate-600">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>AmSpace — built for students • © {new Date().getFullYear()}</div>
          <div className="flex items-center gap-4">
            <div className="text-xs">Privacy</div>
            <div className="text-xs">Terms</div>
            <div className="text-xs">Contact</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
