"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import useSupabaseAuth from "@/lib/useSupabaseAuth";

export default function ClubsPage() {
  const { user, isAdmin, loading: authLoading, supabase } = useSupabaseAuth();
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    setFetchError(null);

    try {
      const res = await fetch("/api/clubs");
      const data = await res.json().catch(() => null);

      if (res.ok && Array.isArray(data)) {
        setPosts(data);
        setLoading(false);
        return;
      }
    } catch (err) {}

    // fallback to supabase
    try {
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setFetchError(error.message);
        setPosts([]);
      } else setPosts(data || []);
    } catch (err) {
      setFetchError(String(err));
      setPosts([]);
    }
    setLoading(false);
  }

  function toggleExpand(id) {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  }

  const visiblePosts = posts.filter((p) => {
    const q = query.trim().toLowerCase();
    if (filter !== "all" && (p.type || "").toLowerCase() !== filter) return false;
    if (!q) return true;
    return (
      (p.title || "").toLowerCase().includes(q) ||
      (p.body || "").toLowerCase().includes(q)
    );
  });

  async function handleDelete(id) {
    if (!confirm("Delete this post?")) return;

    try {
      const token = (await supabase.auth.getSession()).data?.session
        ?.access_token;

      const res = await fetch("/api/clubs", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        return;
      }
    } catch {}

    try {
      await supabase.from("clubs").delete().eq("id", id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  }

  const typeColor = (type = "") => {
    const t = type.toLowerCase();
    if (t.includes("deadline"))
      return "bg-gradient-to-r from-rose-400 to-red-600 text-white";
    if (t.includes("recruit"))
      return "bg-gradient-to-r from-sky-400 to-blue-600 text-white";
    if (t.includes("advert"))
      return "bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white";
    return "bg-gradient-to-r from-lime-400 to-emerald-500 text-black";
  };

  // >>> SINGLE PLACEHOLDER IMAGE FOR ALL POSTS <<<
  const placeholderImage = "/showcase/club.avif";

  return (
    <>
      <Navbar />

      <header className="bg-gradient-to-b from-slate-50 to-white/60">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-6xl tracking-light">
                Clubs & Notices
              </h1>
              <p className="mt-2 text-slate-600 max-w-2xl">
                Ads, announcements, deadlines, and recruitment posts from clubs
                and organisers.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-4">
              <div className="text-center max-w-max px-4 py-2 rounded-xl bg-[#a1ff62]">
                <div className="text-xl font-extrabold text-black">Total</div>
                <div className="text-xl">{posts.length}</div>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-[#a1ff62]">
                <div className="text-xl font-extrabold text-black">Showing</div>
                <div className="text-xl">{visiblePosts.length}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH */}
      <div className="max-w-4xl mx-auto px-6 -mt-6">
        <div
          className="rounded-md p-3 flex items-center gap-3"
          style={{
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div className="flex-1 min-w-0">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts, titles, or bodies..."
              className="w-full rounded-md"
              icon={<Search className="h-4 w-4 text-slate-400" />}
            />
          </div>

          <div className="flex items-center gap-3">
            <Select value={filter} onValueChange={(v) => setFilter(v)}>
              <SelectTrigger className="w-44 rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="advertisement">Advertisements</SelectItem>
                <SelectItem value="deadline">Deadlines</SelectItem>
                <SelectItem value="recruitment">Recruitment</SelectItem>
              </SelectContent>
            </Select>

            {isAdmin ? (
              <Link href="/clubs/create">
                <Button size="sm" className="rounded-full">
                  Create
                </Button>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading && (
          <div className="text-center py-20 text-slate-500">
            Loading posts…
          </div>
        )}

        {/* EMPTY */}
        {!loading && visiblePosts.length === 0 && (
          <div
            className="text-center p-12 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div className="text-lg font-semibold text-slate-700">
              No posts found
            </div>
            <div className="mt-2 text-sm text-slate-500">
              Try a different filter or search.
            </div>
            {isAdmin && (
              <div className="mt-4">
                <Link href="/clubs/create">
                  <Button>Create a post</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {visiblePosts.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl overflow-hidden transform transition hover:-translate-y-1 shadow-lg flex flex-col"
              style={{
                background: "rgba(255,255,255,0.56)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* ALWAYS THIS ONE IMAGE */}
              <div
                className="h-36 bg-cover bg-center"
                style={{ backgroundImage: `url(${placeholderImage})` }}
              >
                <div className="h-full w-full bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* CONTENT */}
              <div className="p-4 flex-1 flex flex-col">
                <header className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold leading-tight text-slate-900 line-clamp-2">
                      {p.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {p.deadline
                          ? `Deadline: ${new Date(
                              p.deadline
                            ).toLocaleDateString()}`
                          : (p.type || "").toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${typeColor(
                        p.type
                      )}`}
                    >
                      {p.type || "Post"}
                    </div>
                  </div>
                </header>

                <div className="mt-3 text-sm text-slate-700 flex-1">
                  <p className="line-clamp-3">{p.body}</p>

                  {expanded[p.id] && (
                    <div className="mt-3 text-sm text-slate-700 space-y-2">
                      {p.deadline && (
                        <div>
                          Deadline:{" "}
                          {new Date(p.deadline).toLocaleDateString()}
                        </div>
                      )}
                      {p.external_url && (
                        <a
                          href={p.external_url}
                          target="_blank"
                          className="text-indigo-600 underline"
                        >
                          Open link
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <footer className="mt-4 pt-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpand(p.id)}
                        className="text-sm px-3 py-1 rounded-md hover:bg-slate-100"
                      >
                        {expanded[p.id] ? "Hide" : "Details"}
                      </button>

                      {p.external_url && (
                        <a
                          href={p.external_url}
                          target="_blank"
                          className="inline-block"
                        >
                          <Button size="sm" variant="outline">
                            Open
                          </Button>
                        </a>
                      )}

                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(p.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>

                    <div className="text-xs text-slate-500">
                      Club posts & notices
                    </div>
                  </div>
                </footer>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
