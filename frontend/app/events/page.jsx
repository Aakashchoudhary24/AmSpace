// frontend/app/events/page.jsx
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
        console.error("Failed to fetch events", data);
        setEvents([]);
      } else {
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("fetch events error", err);
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
    if (filter !== "all" && (e.type || "").toLowerCase() !== filter)
      return false;
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
      const token = (await supabase.auth.getSession()).data?.session
        ?.access_token;
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
      // refresh list
      setEvents((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("delete error", err);
      alert("Delete failed");
    }
  }

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-4">
        <nav
          className="flex items-center text-sm text-slate-600"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-2 select-none">›</span>
          <span className="font-medium text-slate-900">Events</span>
        </nav>

        <p className="mt-2 text-sm text-slate-600">
          Discover workshops, fests, study sessions and more — view details here
          and register on the university portal.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="w-full md:w-1/2">
            <div className="md:hidden mb-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, types or locations..."
                className="w-full"
                icon={<Search className="h-4 w-4 text-slate-400" />}
              />
            </div>
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

            {isAdmin ? (
              <Link href="/events/create">
                <Button size="sm">Create Event</Button>
              </Link>
            ) : (
              <div className="w-24" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {loading && (
            <div className="col-span-full text-center p-10">Loading…</div>
          )}

          {!loading && visibleEvents.length === 0 && (
            <div className="col-span-full text-center text-slate-600 p-10 bg-white rounded-lg shadow-sm">
              No events found. Try a different filter
              {isAdmin ? (
                <>
                  {" "}
                  or{" "}
                  <Link
                    href="/events/create"
                    className="text-indigo-600 underline"
                  >
                    create an event
                  </Link>
                  .
                </>
              ) : (
                "."
              )}
            </div>
          )}

          {visibleEvents.map((ev) => (
            <Card key={ev.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-3 w-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-semibold">{ev.title}</div>
                      <Badge variant="secondary" className="text-xs">
                        {ev.type}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />{" "}
                        {ev.date ? new Date(ev.date).toLocaleDateString() : ""}{" "}
                        • {ev.time || ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {ev.location}
                      </span>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <div className="text-xs text-slate-500">Capacity</div>
                    <div className="text-lg font-medium">{ev.capacity}</div>

                    {typeof ev.spots_left === "number" ? (
                      <div className="text-xs text-slate-500 mt-1">
                        {ev.spots_left} spots left
                      </div>
                    ) : (
                      <div className="text-xs text-amber-600 mt-1">
                        Check availability on official portal
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="text-sm text-slate-700">
                <p className="mb-3 line-clamp-3">{ev.about}</p>
                {expanded[ev.id] && (
                  <div className="mt-2 text-sm text-slate-700 space-y-2">
                    <div>
                      <strong>More details</strong>
                    </div>
                    <div>Location: {ev.location}</div>
                    <div>
                      When:{" "}
                      {ev.date ? new Date(ev.date).toLocaleDateString() : ""} •{" "}
                      {ev.time}
                    </div>
                    <div>Capacity: {ev.capacity}</div>
                    {typeof ev.spots_left === "number" ? (
                      <div>Spots left: {ev.spots_left}</div>
                    ) : (
                      <div className="text-amber-600">
                        Availability shown on external portal.
                      </div>
                    )}
                    <div className="pt-2 text-xs text-slate-500">
                      Hosted by Student Council
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-3 mt-auto">
                <div className="text-xs text-slate-500">
                  Details appear inline — registration happens on the official
                  portal
                </div>

                <div className="flex flex-wrap items-center gap-2">
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
                  >
                    <Button size="sm" variant="outline">
                      Register
                    </Button>
                  </a>

                  {isAdmin && (
                    <>
                      <Link href={`/events/edit/${ev.id}`}>
                        <Button size="sm">Edit</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(ev.id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Showing {visibleEvents.length} of {events.length} events
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Prev
            </Button>
            <Button size="sm">Next</Button>
          </div>
        </div>
      </div>
    </>
  );
}
