// app/about/page.jsx
"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Sparkles, Users, Gift } from "lucide-react";

export default function AboutPage() {
  const team = [
    {
      id: "aakash",
      name: "Aakash Choudhary",
      role: "Product Manager & Frontend",
    },
    { id: "rithu", name: "Rithu Mithra", role: "Frontend & Marketing" },
    { id: "anna", name: "Anna Tresa", role: "Design & Public Relations" },
    {
      id: "surendran",
      name: "K K Surendran",
      role: "Public Relations & Backend",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-6xl tracking-tight">About AmSpace</h1>
          <p className="text-slate-600 mt-3 leading-relaxed">
            AmSpace is a student-first campus hub to discover events, join
            clubs, collaborate on projects and manage administrative tasks like
            duty leave — all in one place.
          </p>
        </div>

        {/* --- REPLACED FEATURE CARDS: SHOWCASE-STYLE PANELS (Mission / Community / Impact) --- */}
        <div className="mt-32">
          <div className="relative overflow-visible">
            <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-8 -mt-2">
              {/* Mission (left) */}
              <div
                className="w-[220px] sm:w-[260px] md:w-[280px] lg:w-[320px] 
                              transform-gpu rotate-[-7deg] hover:rotate-[-3deg] 
                              transition-transform duration-300 ease-out 
                              translate-y-4 hover:translate-y-0"
              >
                <div className="rounded-xl overflow-hidden border border-border bg-card shadow-xl">
                  {/* background image fallback gradient */}
                  <div className="aspect-[4/3] bg-gradient-to-tr from-amber-50 via-amber-100 to-white flex items-center justify-center">
                    {/* optional decorative graphic or leave empty for image */}
                    <div className="hidden md:block text-3xl font-extrabold text-amber-900 opacity-90">
                      ✦
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-white">
                    <div className="font-semibold text-sm text-amber-900">
                      Mission
                    </div>
                    <div className="text-[13px] text-slate-700 mt-2">
                      Make campus collaboration effortless. Lower friction for
                      students to find peers, events and mentors.
                    </div>
                  </div>
                </div>
              </div>

              {/* Community (center) */}
              <div
                className="w-[260px] sm:w-[340px] md:w-[420px] lg:w-[460px] 
                              transform-gpu rotate-[2deg] hover:rotate-[0deg] 
                              transition-transform duration-300 ease-out 
                              -translate-y-1 hover:-translate-y-0"
              >
                <div className="rounded-xl overflow-hidden border-2 border-border bg-card shadow-xl">
                  <div className="aspect-[4/3] bg-gradient-to-tr from-emerald-50 via-emerald-100 to-white flex items-center justify-center">
                    <div className="hidden md:block text-4xl font-extrabold text-emerald-800 opacity-90">
                      ⚑
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-white flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-sm text-emerald-800">
                        Community
                      </div>
                      <div className="text-[13px] text-slate-700 mt-2 max-w-xs">
                        Clubs, communities and faculty-led groups find a single
                        home to run events and manage memberships.
                      </div>
                    </div>
                    <div className="text-[12px] text-slate-500 self-end">
                      Explore →
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact (right) */}
              <div
                className="w-[220px] sm:w-[260px] md:w-[280px] lg:w-[320px] 
                              transform-gpu rotate-[7deg] hover:rotate-[3deg] 
                              transition-transform duration-300 ease-out 
                              translate-y-4 hover:translate-y-0"
              >
                <div className="rounded-xl overflow-hidden border border-border bg-card shadow-xl">
                  <div className="aspect-[4/3] bg-gradient-to-tr from-violet-50 via-violet-100 to-white flex items-center justify-center">
                    <div className="hidden md:block text-3xl font-extrabold text-violet-800 opacity-88">
                      ★
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-white">
                    <div className="font-semibold text-sm text-violet-800">
                      Impact
                    </div>
                    <div className="text-[13px] text-slate-700 mt-2">
                      Help students discover opportunities and reduce
                      administrative overhead for clubs and faculty.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mt-34">
          <h2 className="text-6xl text-center">Meet the team</h2>

          <div className="grid mt-20 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {team.map((m) => (
              <Card
                key={m.id}
                className="
          group p-5 rounded-2xl 
          bg-[#111]/90 text-white border border-white/10
          shadow-[0_0_20px_rgba(0,0,0,0.25)]
          backdrop-blur-md 
          transition-all duration-300 
          hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]
        "
              >
                <CardHeader className="flex flex-col items-start gap-1 pb-2">
                  <div className="text-4xl font-semibold tracking-light group-hover:text-white">
                    {m.name}
                  </div>
                  <div className="text-xl text-white/60">{m.role}</div>
                </CardHeader>

                <CardContent className="text-xl leading-relaxed text-white/80">
                  {m.role === "Frontend & Marketing" &&
                    "Builds user-facing experiences and handles outreach & growth."}
                  {m.role === "Product Manager & Frontend" &&
                    "Leads product direction and implements frontend features."}
                  {m.role === "Design & Public Relations" &&
                    "Crafts visual design and manages public-facing communications."}
                  {m.role === "Public Relations & Backend" &&
                    "Handles backend systems and manages public relations."}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
