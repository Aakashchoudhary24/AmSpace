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
 * - Admin-only create form for club posts (ads, announcements, deadlines, recruitment)
 * - Uses supabase client directly first, falls back to /api/clubs if needed
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
  const [serverMessage, setServerMessage] = useState("");

  useEffect(() => {
    // UI guard only; don't forcibly redirect here because auth/profile might still be loading.
    // If you want an automatic redirect once isAdmin === false, you can uncomment below:
    // if (isAdmin === false) router.replace("/");
  }, [isAdmin, router]);

  function validate() {
    const err = {};
    if (!title.trim()) err.title = "Title is required";
    if (!body.trim()) err.body = "Body/description is required";
    if (externalUrl && !/^https?:\/\//i.test(externalUrl)) err.externalUrl = "External URL should start with http/https";
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setServerMessage("");
    if (isAdmin === false) {
      // explicit deny if we know user is not admin
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
      // 1) Try direct Supabase client insert first (simpler and clearer feedback)
      if (supabase) {
        const insertResp = await supabase
          .from("clubs")
          .insert(payload)
          .select(); // .select() returns the inserted row(s) in v1/v2
        if (insertResp.error) {
          console.warn("Supabase insert error:", insertResp.error);
          // If insert failed due to RLS/auth, fall through to try server-side endpoint
          // but store message so we can show it
          setServerMessage(insertResp.error.message || "Insert failed (supabase client).");
        } else {
          // success
          router.push("/clubs");
          return;
        }
      }

      // 2) Fallback: POST to your server API (/api/clubs)
      // This requires your server endpoint to accept Authorization (we include supabase session token)
      // Get current session token (best-effort)
      let token = null;
      try {
        const sessionResp = await supabase.auth.getSession();
        token = sessionResp?.data?.session?.access_token ?? null;
      } catch (sessErr) {
        // ignore - token may be null, server may rely on cookies
        console.warn("getSession failed (falling back to cookie auth):", sessErr);
      }

      const res = await fetch("/api/clubs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        data = { raw: text };
      }

      if (!res.ok) {
        console.error("Server POST /api/clubs failed:", res.status, data);
        // show server-returned error if available
        const msg = data?.error?.message || data?.error || data?.message || data?.raw || `HTTP ${res.status}`;
        setServerMessage(String(msg));
        alert("Create failed: " + String(msg));
      } else {
        // success (server returned OK)
        router.push("/clubs");
        return;
      }
    } catch (err) {
      console.error("Create club post thrown error:", err);
      setServerMessage(err?.message || String(err));
      alert("Create failed: " + (err?.message || String(err)));
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
    setServerMessage("");
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
            <Card
              className="p-6 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
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
                      {serverMessage && <div className="text-xs text-rose-600 mt-1">{serverMessage}</div>}
                    </div>

                    <div className="flex items-center gap-3">
                      <Button variant="outline" onClick={() => { resetForm(); }} disabled={loading}>
                        Reset
                      </Button>

                      <Button type="submit" disabled={loading || isAdmin === false}>
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
