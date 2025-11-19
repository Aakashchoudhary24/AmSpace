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
 * CreateClubPostPage
 * - Admin-only (UI guard) create form for club posts (ads, announcements, deadlines, recruitment)
 * - Reuses same visual language as events create
 */

export default function CreateClubPostPage() {
  const router = useRouter();
  const { user, isAdmin, supabase } = useSupabaseAuth();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("announcement");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // purely UI guard, API should enforce admin
    // if (isAdmin === false) router.replace("/");
  }, [isAdmin, router]);

  function validate() {
    const err = {};
    if (!title.trim()) err.title = "Title is required";
    if (!body.trim()) err.body = "Body/description is required";
    if (externalUrl && !externalUrl.startsWith("http")) err.externalUrl = "External URL should start with http/https";
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!isAdmin) {
      alert("Only admins can create club posts.");
      return;
    }
    if (!validate()) return;

    setLoading(true);
    const payload = {
      title: title.trim(),
      body: body.trim(),
      type: type.trim(),
      deadline: deadlineDate || null,
      external_url: externalUrl || null,
      image: imageUrl || null,
    };

    try {
      const token = (await supabase.auth.getSession()).data?.session?.access_token;
      const res = await fetch("/api/clubs", {
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
        router.push("/clubs");
      }
    } catch (err) {
      console.error("create club post error", err);
      alert("Create failed");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle("");
    setBody("");
    setType("announcement");
    setDeadlineDate("");
    setExternalUrl("");
    setImageUrl("");
    setErrors({});
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 pb-20">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-6xl tracking-tight">Create Club Post</h1>
              <p className="mt-2 text-sm text-slate-600 max-w-xl">
                Publish an announcement, advertisement, deadline, or recruitment post for clubs.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => router.push("/clubs")}>Back to clubs</Button>
              {!isAdmin ? (
                <div className="text-sm text-amber-600">You need admin rights to create posts</div>
              ) : (
                <div className="text-sm text-slate-500">You are an admin</div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <Card className="p-6 rounded-2xl shadow-lg" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <CardHeader className="p-0 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">New club post</div>
                    <div className="text-lg font-semibold">Post details</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-600">Title</label>
                      <Input placeholder="Title (short)" value={title} onChange={(e) => setTitle(e.target.value)} required />
                      {errors.title && <div className="text-xs text-rose-600 mt-1">{errors.title}</div>}
                    </div>

                    <div>
                      <label className="text-xs text-slate-600">Type</label>
                      <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded p-2">
                        <option value="announcement">Announcement</option>
                        <option value="advertisement">Advertisement</option>
                        <option value="deadline">Deadline</option>
                        <option value="recruitment">Recruitment</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-600">Deadline (optional)</label>
                      <Input type="date" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-600">External URL (optional)</label>
                      <Input placeholder="e.g. https://register.example" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} />
                      {errors.externalUrl && <div className="text-xs text-rose-600 mt-1">{errors.externalUrl}</div>}
                    </div>

                    <div>
                      <label className="text-xs text-slate-600">Cover image URL (optional)</label>
                      <Input placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                    </div>

                    <div>
                      <label className="text-xs text-slate-600">Body</label>
                      <textarea
                        placeholder="Detailed description — who, what, where, when, contact"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="w-full min-h-[120px] rounded-md border p-3 text-sm resize-vertical"
                      />
                      {errors.body && <div className="text-xs text-rose-600 mt-1">{errors.body}</div>}
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex items-center justify-between gap-4 mt-2">
                    <div className="text-sm text-slate-500">
                      Tip: include a cover image and external URL for higher engagement.
                    </div>

                    <div className="flex items-center gap-3">
                      <Button variant="outline" onClick={() => { resetForm(); }}>Reset</Button>

                      <Button type="submit" disabled={loading || !isAdmin}>
                        {loading ? "Publishing…" : "Publish"}
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
