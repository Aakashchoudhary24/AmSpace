"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, CalendarPlus, Gift, Coffee } from "lucide-react";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LandingPage() {

  const router = useRouter();

  return (
    <>
      <div className="min-h-screen w-full bg-white relative">
        {/* Grid Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
        linear-gradient(to right, #e5e7eb 1px, transparent 1px),
        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
      `,
            backgroundSize: "40px 40px",
          }}
        />
        <main className="min-h-screen bg-[url('/patterns/students-bg.svg')] bg-cover bg-center text-foreground">
          <Navbar />

          {/* HERO */}
          <section className="relative overflow-hidden">
            {/* vertical center divider */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-border/60" />

            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
              <div className="relative grid grid-cols-1 lg:grid-cols-2 items-start gap-12">
                {/* Left: giant type */}
                <div className="flex items-start">
                  <h1
                    className="w-full leading-[0.98] tracking-[-0.02em] font-bold text-[3.8rem] sm:text-[4.6rem] md:text-[5.8rem] lg:text-[7rem] xl:text-[8rem] text-left"
                    style={{ lineHeight: 0.98 }}
                  >
                    Meet <span className="mx-2 inline-block"></span>
                    {/* Learn — green text */}
                    <em className="text-green-400">Learn</em>
                    <br />
                    {/* Collaborate — purple text */}
                    <span className="block mt-3 text-violet-600">
                      Collaborate
                    </span>
                  </h1>
                </div>

                {/* Right: quick card and CTAs */}
                <div className="flex flex-col items-start lg:items-end gap-8">
                  <div className="w-full max-w-md lg:max-w-sm">
                    <Card className="p-5 bg-gradient-to-tr from-white/80 to-indigo-50 shadow-md">
                      <CardHeader className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-100">
                          <Users className="h-6 w-6 text-indigo-700" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            Quick join
                          </CardTitle>
                          <div className="text-xs text-muted-foreground">
                            Pick a room or event and hop in
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="mt-3 grid gap-3">

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">
                              Open Mic Night
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Oct 21
                            </div>
                          </div>
                          <Button onClick={() => router.replace('/events')} variant="outline" size="sm">
                            Register
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">
                              Design Collab
                            </div>
                            <div className="text-xs text-muted-foreground">
                              3 teams
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="w-full lg:max-w-lg">
                    <p className="text-slate-600 max-w-xl">
                      AmSpace is the student playground for learning together:
                      form study rooms, join clubs, register for events, and
                      celebrate wins with your friends — all on campus.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link href="/discover">
                        <Button size="lg" className="shadow-lg">
                          Enter the Hub
                        </Button>
                      </Link>

                      <Link href="/events">
                        <Button variant="outline" size="lg" className="px-5">
                          Explore Events
                        </Button>
                      </Link>
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src="/avatar-1.jpg" alt="student" />
                        <AvatarFallback>RM</AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <span className="font-semibold">Rithu</span>
                        <div className="text-xs text-muted-foreground">
                          Joined a hackathon — 2 hrs ago
                        </div>
                      </div>

                      <Badge className="ml-4" variant="secondary">
                        1200+ students active
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* A subtle center glyph (like the OSMO star) */}
              <div className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2">
                <div className="rounded-sm p-1 bg-violet-500/0">
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M12 2v20M2 12h20M4 4l16 16M20 4L4 20"
                      stroke="#7c3aed"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* SHOWCASE ROW (refined OSMO-style tilted panels) */}
          <section className="max-w-7xl mx-auto px-6 py-14 mt-[-100]">
            <div className="relative overflow-visible">
              <div className="flex flex-col md:flex-row items-end justify-center gap-8 md:gap-12 -mt-2">
                {/* Left card */}
                <div
                  className="w-[230px] sm:w-[270px] md:w-[300px] lg:w-[330px]
                      transform-gpu rotate-[-7deg] hover:rotate-[-3deg]
                      transition-transform duration-400 ease-out
                      translate-y-5 hover:translate-y-1"
                >
                  <div className="rounded-xl overflow-hidden border border-border bg-card shadow-xl">
                    <div className="aspect-[4/3] relative">
                      <Image
                        src="/showcase/leave.webp"
                        alt="Showcase"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="px-4 py-3.5 bg-[#111]/95 text-white">
                      <div className="font-semibold text-[13px]">
                        Leave Management
                      </div>
                      <div className="text-[11px] leading-[1.45] text-white/75 mt-2">
                        Manage attendance, duty leaves and all administrative
                        approvals in one place.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center card (slightly reduced size) */}
                <div
                  className="w-[250px] sm:w-[310px] md:w-[360px] lg:w-[420px]
                      transform-gpu rotate-[2deg] hover:rotate-[0deg]
                      transition-transform duration-400 ease-out
                      -translate-y-1 hover:-translate-y-0"
                >
                  <div className="rounded-xl overflow-hidden border-2 border-border bg-card shadow-xl">
                    <div className="aspect-[4/3] relative">
                      <Image
                        src="/showcase/event.avif"
                        alt="Showcase"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="px-5 py-4 bg-[#111]/95 text-white flex items-start justify-between">
                      <div className="pr-4">
                        <div className="font-semibold text-[14px]">
                          Events & Fests
                        </div>
                        <div className="text-[12px] leading-[1.5] text-white/80 mt-2 max-w-sm">
                          Discover workshops, hackathons, cultural programs, and
                          campus-wide festivals.
                        </div>
                      </div>
                      <div className="text-[11px] text-white/60 self-end whitespace-nowrap">
                        Explore →
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right card */}
                <div
                  className="w-[230px] sm:w-[270px] md:w-[300px] lg:w-[330px]
                      transform-gpu rotate-[7deg] hover:rotate-[3deg]
                      transition-transform duration-400 ease-out
                      translate-y-5 hover:translate-y-1"
                >
                  <div className="rounded-xl overflow-hidden border border-border bg-card shadow-xl">
                    <div className="aspect-[4/3] relative">
                      <Image
                        src="/showcase/club.jpg"
                        alt="Showcase"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="px-4 py-3.5 bg-[#111]/95 text-white">
                      <div className="font-semibold text-[13px]">
                        Clubs & Projects
                      </div>
                      <div className="text-[11px] leading-[1.45] text-white/75 mt-2">
                        Join clubs, collaborate with peers, and showcase your
                        creations at campus expos.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="mt-12 py-8 text-sm text-muted-foreground">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                AmSpace — built for students • © {new Date().getFullYear()}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs">Privacy</div>
                <div className="text-xs">Terms</div>
                <div className="text-xs">Contact</div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
