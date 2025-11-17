// frontend/app/events/create/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import useSupabaseAuth from "@/lib/useSupabaseAuth";

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

  useEffect(() => {
    // guard: if not admin, do nothing; UI will show message below
  }, [isAdmin]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!isAdmin) {
      alert("Only admins can create events.");
      return;
    }
    setLoading(true);

    const payload = {
      title,
      about,
      date: date || null,
      time: time || null,
      location,
      type,
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
        alert("Create failed: " + (data?.error ?? "Unknown"));
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

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <h2 className="text-xl font-semibold">Create Event</h2>
        <div className="mt-4 text-slate-600">You must be an admin to create events.</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h2 className="text-xl font-semibold mb-4">Create Event</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input placeholder="Type (Workshop, Cultural, Hackathon)" value={type} onChange={(e) => setType(e.target.value)} />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Input placeholder="Capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        <Input placeholder="External URL" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} />
        <textarea
          placeholder="About"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          className="w-full rounded-md border p-2"
        />
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create Event"}</Button>
          <Button variant="outline" onClick={() => router.push("/events")}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
