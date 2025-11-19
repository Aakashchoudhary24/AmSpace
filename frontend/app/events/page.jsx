"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import useSupabaseAuth from "@/lib/useSupabaseAuth";

/**
 * Events page — glassy + color-coded + conditional image fallback
 * - Keeps original behaviour (fetch, search, filter, delete)
 * - Adds conditional images for cultural/hackathon/workshop types (public/showcase/*)
 * - Removes the horizontal border/line around the search bar (clean floating pill)
 */

export default function EventsPage() {
  const { user, isAdmin, loading: authLoading, supabase } = useSupabaseAuth();
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (!res.ok) {
        console.log("Failed to fetch events", data);
        setEvents([]);
      } else {
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.log("fetch events error", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleExpand(id) {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  }

  const visibleEvents = events.filter((e) => {
    const q = query.trim().toLowerCase();
    if (filter !== "all" && (e.type || "").toLowerCase() !== filter) return false;
    if (!q) return true;
    return (
      (e.title || "").toLowerCase().includes(q) ||
      (e.type || "").toLowerCase().includes(q) ||
      (e.location || "").toLowerCase().includes(q)
    );
  });

  async function handleDelete(id) {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try {
      const token = (await supabase.auth.getSession()).data?.session?.access_token;
      const res = await fetch("/api/events", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert("Delete failed: " + (data?.error ?? "Unknown"));
        return;
      }
      // refresh list locally
      setEvents((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.log("delete error", err);
      alert("Delete failed");
    }
  }

  // map event type -> color classes for chip
  const typeColor = (type = "") => {
    const t = (type || "").toLowerCase();
    if (t.includes("hack")) return "bg-gradient-to-r from-sky-400 to-blue-600 text-white";
    if (t.includes("cultur") || t.includes("fest")) return "bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white";
    if (t.includes("work") || t.includes("seminar") || t.includes("workshop")) return "bg-gradient-to-r from-amber-400 to-amber-600 text-black";
    else return "bg-gradient-to-r from-lime-400 to-emerald-500 text-black";


    // default
    return "bg-gradient-to-r from-slate-200 to-slate-300 text-slate-900";
  };

  // conditional image selection based on event type (public/showcase/*)
  const conditionalImage = (ev) => {
    // priority: ev.image (explicit) -> type based -> null
    if (ev?.image) return ev.image;
    const t = (ev?.type || "").toLowerCase();
    if (t.includes("cultur") || t.includes("fest")) return "/showcase/cultural.avif";
    if (t.includes("hack")) return "/showcase/hackathon.jpeg";
    if (t.includes("work") || t.includes("seminar") || t.includes("workshop")) return "/showcase/workshop.webp";
    else return "/showcase/bday.avif"
    return null;
  };

  return (
    <>
      <Navbar />

      {/* Page header */}
      <header className="bg-gradient-to-b from-slate-50 to-white/60">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-6xl tracking-light">
                Events & Fests
              </h1>
              <p className="mt-2 text-slate-600 max-w-2xl">
                Discover workshops, hackathons, cultural nights and study sessions — view details here and register on the official portal.
              </p>
              <div className="mt-3 text-xs text-slate-500">Download spec:&nbsp;
                <a
                  href="/mnt/data/AmSpace-SRS.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-indigo-600"
                >
                  AmSpace-SRS.pdf
                </a>
              </div>
            </div>

            {/* Decorative stats (optional, kept minimal) */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-center max-w-max px-4 py-2 rounded-xl bg-[#a1ff62] border border-white/6 shadow-sm">
                <div className="text-xl text-black">Total</div>
                <div className="text-xl">{events.length}</div>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-[#a1ff62] border border-white/6 shadow-sm">
                <div className="text-xl text-black">Showing</div>
                <div className="text-xl">{visibleEvents.length}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Floating search/filter bar (NO horizontal line/border around it) */}
      <div className="max-w-4xl mx-auto px-6 -mt-6">
        <div
          className="rounded-md p-3 shadow-lg flex items-center gap-3"
          style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(6px)" }}
        >
          <div className="flex-1 min-w-0">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events, types, or locations..."
              className="w-full rounded-md"
              icon={<Search className="h-4 w-4 text-slate-400" />}
            />
          </div>

          <div className="flex items-center gap-3">
            <Select onValueChange={(v) => setFilter(v)} value={filter}>
              <SelectTrigger className="w-44 rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="hackathon">Hackathon</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
              </SelectContent>
            </Select>

            {isAdmin ? (
              <Link href="/events/create">
                <Button size="sm" className="rounded-full">Create</Button>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* loading state */}
        {loading && (
          <div className="text-center py-20">
            <div className="text-slate-500">Loading events…</div>
          </div>
        )}

        {/* empty state */}
        {!loading && visibleEvents.length === 0 && (
          <div className="text-center p-12 rounded-2xl shadow-sm" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(6px)" }}>
            <div className="text-lg font-semibold text-slate-700">No events found</div>
            <div className="mt-2 text-sm text-slate-500">
              Try a different filter or search.
            </div>
            {isAdmin && (
              <div className="mt-4">
                <Link href="/events/create"><Button>Create an event</Button></Link>
              </div>
            )}
          </div>
        )}

        {/* events grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {visibleEvents.map((ev) => {
            const img = conditionalImage(ev);
            return (
              <article
                key={ev.id}
                className="rounded-2xl overflow-hidden transform transition hover:-translate-y-1 shadow-lg flex flex-col"
                style={{ background: "rgba(255,255,255,0.56)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {/* conditional cover image / colored band */}
                <div
                  className={`h-36 bg-cover bg-center`}
                  style={
                    img
                      ? { backgroundImage: `url(${img})` }
                      : { background: "linear-gradient(135deg,#f8fafc,#ffffff)" }
                  }
                  aria-hidden
                >
                  {/* subtle overlay to ensure text contrast if needed */}
                  <div className="h-full w-full bg-gradient-to-t from-black/18 to-transparent"></div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <header className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold leading-tight text-slate-900 line-clamp-2">
                        {ev.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {ev.date ? new Date(ev.date).toLocaleDateString() : ""} {ev.time ? `• ${ev.time}` : ""}
                        </span>

                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {ev.location}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${typeColor(ev.type)}`}>
                        {ev.type || "Event"}
                      </div>

                      <div className="mt-2 text-sm font-semibold text-slate-800">
                        {ev.capacity ?? "—"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {typeof ev.spots_left === "number" ? `${ev.spots_left} spots left` : "Check portal"}
                      </div>
                    </div>
                  </header>

                  <div className="mt-3 text-sm text-slate-700 flex-1">
                    <p className="line-clamp-3">{ev.about}</p>

                    {expanded[ev.id] && (
                      <div className="mt-3 text-sm text-slate-700 space-y-2">
                        <div><strong>Details</strong></div>
                        <div>Location: {ev.location}</div>
                        <div>
                          When: {ev.date ? new Date(ev.date).toLocaleDateString() : ""} • {ev.time}
                        </div>
                        <div>Capacity: {ev.capacity}</div>
                        {typeof ev.spots_left === "number" ? (
                          <div>Spots left: {ev.spots_left}</div>
                        ) : (
                          <div className="text-amber-600">Availability shown on external portal.</div>
                        )}
                        <div className="pt-2 text-xs text-slate-500">Hosted by Student Council</div>
                      </div>
                    )}
                  </div>

                  <footer className="mt-4 pt-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleExpand(ev.id)}
                          className="text-sm px-3 py-1 rounded-md hover:bg-slate-100"
                        >
                          {expanded[ev.id] ? "Hide" : "Details"}
                        </button>

                        <a
                          href={ev.external_url || "https://ulsav.com/"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <Button size="sm" variant="outline">Register</Button>
                        </a>

                        {isAdmin && (
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(ev.id)}>Delete</Button>
                        )}
                      </div>

                      <div className="text-xs text-slate-500">Inline details — register on portal</div>
                    </div>
                  </footer>
                </div>
              </article>
            );
          })}
        </div>

        {/* pagination / footer */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Showing {visibleEvents.length} of {events.length} events
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full">Prev</Button>
            <Button size="sm" className="rounded-full">Next</Button>
          </div>
        </div>
      </main>
    </>
  );
}
