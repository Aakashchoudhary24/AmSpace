'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, CalendarPlus, Gift, Coffee } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[url('/patterns/students-bg.svg')] bg-cover bg-center text-slate-900">

      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight">
            Meet • Learn • Collaborate
          </h1>
          <p className="mt-4 text-lg text-slate-700 max-w-2xl">
            AmSpace is the student playground for learning together: form study rooms,
            join clubs, register for events, and celebrate wins with your friends —
            all on campus.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/discover">
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

        {/* Right card */}
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

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-4 hover:scale-[1.02] transition-transform">
          <CardHeader className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-amber-100">
              <Coffee className="h-6 w-6 text-amber-700" />
            </div>
            <CardTitle>Leave and Attendance</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Manage Attendance, Duty Leaves and other administrative functions in one place.
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
