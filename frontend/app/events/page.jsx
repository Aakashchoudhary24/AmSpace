"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Search } from "lucide-react";

export default function EventsPage() {
  // sample data: capacity + optional spotsLeft (null = unknown)
  const initialEvents = [
    {
      id: 1,
      title: "Hackathon: Build for Campus",
      date: "Nov 22, 2025",
      time: "10:00 AM",
      location: "CS Dept Hall",
      type: "Hackathon",
      capacity: 120,
      spotsLeft: 78,
      about: "48-hour mini-hackathon for campus-focused apps. Food provided.",
      externalUrl: "https://ulsav.com/",
    },
    {
      id: 2,
      title: "Open Mic Night",
      date: "Nov 28, 2025",
      time: "7:30 PM",
      location: "Auditorium",
      type: "Cultural",
      capacity: 200,
      spotsLeft: null,
      about: "Sing, tell stories, or perform — signups open for 5-min slots.",
      externalUrl: "https://ulsav.com/",
    },
    {
      id: 3,
      title: "Resume Workshop",
      date: "Dec 02, 2025",
      time: "3:00 PM",
      location: "Library Conference Room",
      type: "Workshop",
      capacity: 40,
      spotsLeft: 22,
      about: "Hands-on resume review with placement cell seniors and alumni.",
      externalUrl: "https://ulsav.com/",
    },
  ];

  const [events] = useState(initialEvents);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState({}); // { [id]: true }

  function toggleExpand(id) {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  }

  const visibleEvents = events.filter((e) => {
    const q = query.trim().toLowerCase();
    if (filter !== "all" && e.type.toLowerCase() !== filter) return false;
    if (!q) return true;
    return (
      e.title.toLowerCase().includes(q) ||
      e.type.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-whitepx-4">
      {/* Topbar with Home / AmSpace */}
      <div className="backdrop-blur-sm bg-white/60 border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-extrabold">
                AS
              </div>
              <div>
                <div className="text-lg font-semibold">AmSpace</div>
                <div className="text-xs text-slate-600">Campus hub</div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, clubs, study rooms..."
                className="w-72"
                icon={<Search className="h-4 w-4 text-slate-400" />}
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

      {/* Breadcrumb (replaces page heading) */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <nav className="flex items-center text-sm text-slate-600" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2 select-none">›</span>
          <span className="font-medium text-slate-900">Events</span>
        </nav>

        <p className="mt-2 text-sm text-slate-600">
          Discover workshops, fests, study sessions and more — view details here and register on the university portal.
        </p>
      </div>

      {/* Controls + filters */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="w-full md:w-1/2">
            {/* mobile search */}
            <div className="md:hidden mb-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, types or locations..."
                className="w-full"
                icon={<Search className="h-4 w-4 text-slate-400" />}
              />
            </div>
            {/* optional short description left intentionally minimal (no H1) */}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Select onValueChange={(v) => setFilter(v)} value={filter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="hackathon">Hackathon</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
              </SelectContent>
            </Select>

            <Link href="/events/create">
              <Button size="sm">Create Event</Button>
            </Link>
          </div>
        </div>

        {/* Events grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {visibleEvents.length === 0 && (
            <div className="col-span-full text-center text-slate-600 p-10 bg-white rounded-lg shadow-sm">
              No events found. Try a different filter or <Link href="/events/create" className="text-indigo-600 underline">create an event</Link>.
            </div>
          )}

          {visibleEvents.map((ev) => (
            <Card key={ev.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-3 w-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-semibold">{ev.title}</div>
                      <Badge variant="secondary" className="text-xs">{ev.type}</Badge>
                    </div>

                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-3">
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {ev.date} • {ev.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {ev.location}</span>
                    </div>
                  </div>

                  {/* capacity & spots left */}
                  <div className="text-right ml-4">
                    <div className="text-xs text-slate-500">Capacity</div>
                    <div className="text-lg font-medium">{ev.capacity}</div>

                    {typeof ev.spotsLeft === "number" ? (
                      <div className="text-xs text-slate-500 mt-1">{ev.spotsLeft} spots left</div>
                    ) : (
                      <div className="text-xs text-amber-600 mt-1">Check availability on official portal</div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="text-sm text-slate-700">
                <p className="mb-3 line-clamp-3">{ev.about}</p>

                {expanded[ev.id] && (
                  <div className="mt-2 text-sm text-slate-700 space-y-2">
                    <div><strong>More details</strong></div>
                    <div>Location: {ev.location}</div>
                    <div>When: {ev.date} • {ev.time}</div>
                    <div>Capacity: {ev.capacity}</div>
                    {typeof ev.spotsLeft === "number" ? (
                      <div>Spots left: {ev.spotsLeft}</div>
                    ) : (
                      <div className="text-amber-600">Availability shown on external portal.</div>
                    )}
                    <div className="pt-2 text-xs text-slate-500">Hosted by Student Council</div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Details appear inline — registration happens on the official portal</div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpand(ev.id)}
                    className="text-sm px-3 py-1 rounded-md hover:bg-slate-100"
                  >
                    {expanded[ev.id] ? "Hide" : "Details"}
                  </button>

                  <a
                    href={ev.externalUrl || "https://ulsav.com/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button size="sm" variant="outline">Register</Button>
                  </a>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* quick footer/pagination */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-slate-600">Showing {visibleEvents.length} of {events.length} events</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Prev</Button>
            <Button size="sm">Next</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
