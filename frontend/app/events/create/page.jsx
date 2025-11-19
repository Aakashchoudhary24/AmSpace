"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import useSupabaseAuth from "@/lib/useSupabaseAuth";

/**
 * Polished Create Event page
 * - Includes Navbar
 * - Glassy form card with grouped inputs
 * - Keeps existing behaviour: only admins can submit, uses supabase token
 * - No additional backend features introduced
 */

export default function CreateEventPage() {
  const router = useRouter();
  const { user, isAdmin, supabase } = useSupabaseAuth();

  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // guard is purely UI here. actual API still checks auth.
    // if you want stronger guard, redirect non-admins:
    // if (isAdmin === false) router.replace("/");
  }, [isAdmin, router]);

  function validate() {
    const err = {};
    if (!title.trim()) err.title = "Title is required";
    if (!type.trim()) err.type = "Type is recommended (Workshop, Cultural, Hackathon)";
    if (capacity && isNaN(parseInt(capacity, 10))) err.capacity = "Capacity must be a number";
    if (externalUrl && !externalUrl.startsWith("http")) err.externalUrl = "External URL should start with http/https";
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!isAdmin) {
      alert("Only admins can create events.");
      return;
    }

    if (!validate()) return;

    setLoading(true);
    const payload = {
      title: title.trim(),
      about: about.trim(),
      date: date || null,
      time: time || null,
      location: location.trim(),
      type: type.trim(),
      capacity: capacity ? parseInt(capacity, 10) : null,
      external_url: externalUrl || null,
    };

    try {
      const token = (await supabase.auth.getSession()).data?.session?.access_token;
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error || data?.message || "Unknown error";
        alert("Create failed: " + msg);
      } else {
        router.push("/events");
      }
    } catch (err) {
      console.error("create event error", err);
      alert("Create failed");
    } finally {
      setLoading(false);
    }
  }

  // Simple helper to clear form
  function resetForm() {
    setTitle("");
    setAbout("");
    setDate("");
    setTime("");
    setLocation("");
    setType("");
    setCapacity("");
    setExternalUrl("");
    setErrors({});
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 pb-20">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-6xl tracking-tight">Create Event</h1>
              <p className="mt-2 text-sm text-slate-600 max-w-xl">
                Add an event to AmSpace. Event registration is handled on the external portal — include the external URL for registration.
              </p>
              <div className="mt-2 text-xs text-slate-500">
                Official Portal:&nbsp;
                <a href="https://ulsav.com" className="text-indigo-600 underline" target="_blank" rel="noreferrer">
                  Ulsav
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => router.push("/events")}>Back to events</Button>
              {!isAdmin ? (
                <div className="text-sm text-amber-600">You need admin rights to create events</div>
              ) : (
                <div className="text-sm text-slate-500">You are an admin</div>
              )}
            </div>
          </div>

          {/* Form card */}
          <div className="mt-8">
            <Card className="p-6 rounded-2xl shadow-lg" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <CardHeader className="p-0 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">New event</div>
                    <div className="text-lg font-semibold">Event details</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left column */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-600">Title</label>
                      <Input placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                      {errors.title && <div className="text-xs text-rose-600 mt-1">{errors.title}</div>}
                    </div>

                    <div>
                      <label className="text-xs text-slate-600">Type</label>
                      <Input placeholder="e.g. Workshop, Cultural, Hackathon" value={type} onChange={(e) => setType(e.target.value)} />
                      {errors.type && <div className="text-xs text-rose-600 mt-1">{errors.type}</div>}
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-slate-600">Date</label>
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                      </div>

                      <div className="w-36">
                        <label className="text-xs text-slate-600">Time</label>
                        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-600">Location</label>
                      <Input placeholder="Venue or building" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-600">Capacity</label>
                      <Input placeholder="Number" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                      {errors.capacity && <div className="text-xs text-rose-600 mt-1">{errors.capacity}</div>}
                    </div>

                    <div>
                      <label className="text-xs text-slate-600">External registration URL</label>
                      <Input placeholder="https://..." value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} />
                      {errors.externalUrl && <div className="text-xs text-rose-600 mt-1">{errors.externalUrl}</div>}
                    </div>

                    <div className="h-full">
                      <label className="text-xs text-slate-600">About</label>
                      <textarea
                        placeholder="Short description shown on the events list"
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        className="w-full min-h-[120px] rounded-md border p-3 text-sm resize-vertical"
                      />
                    </div>
                  </div>

                  {/* Full-width actions */}
                  <div className="lg:col-span-2 flex items-center justify-between gap-4 mt-2">
                    <div className="text-sm text-slate-500">
                      Tip: include an external registration URL so students can sign up.
                    </div>

                    <div className="flex items-center gap-3">
                      <Button variant="outline" onClick={() => { resetForm(); }}>Reset</Button>

                      <Button type="submit" disabled={loading || !isAdmin}>
                        {loading ? "Creating…" : "Create Event"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
