// app/leaves/warden/page.jsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { fetchLeavesForWarden, wardenApproveLeave, rejectLeave } from "@/lib/leaveHelpers";
import useSupabaseAuth from "@/lib/useSupabaseAuth";
import Navbar from "../../../components/Navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export default function WardenLeavesPage() {
  const { user, profile, loading } = useSupabaseAuth();
  const [leaves, setLeaves] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [actioningId, setActioningId] = useState(null);
  const subRef = useRef(null);

  const isWarden = (profile?.role ?? "").toLowerCase() === "warden";

  async function loadLeaves() {
    if (!user) return;
    setLoadingLeaves(true);
    try {
      const res = await fetchLeavesForWarden(user.id);
      if (res.error) {
        console.error("fetchLeavesForWarden error:", res.error);
        setLeaves([]);
      } else {
        setLeaves(res.data || []);
      }
    } catch (err) {
      console.error("loadLeaves thrown:", err);
      setLeaves([]);
    } finally {
      setLoadingLeaves(false);
    }
  }

  useEffect(() => {
    if (!user || loading || !isWarden) return;

    loadLeaves();

    if (subRef.current) {
      try {
        supabase.removeChannel(subRef.current);
      } catch {}
      subRef.current = null;
    }

    const channel = supabase
      .channel(`warden:duty_leaves:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "duty_leaves" },
        () => loadLeaves()
      )
      .subscribe();

    subRef.current = channel;

    return () => {
      try {
        if (subRef.current) supabase.removeChannel(subRef.current);
      } catch {}
    };
  }, [user, loading, isWarden]);

  async function handleApprove(l) {
    setActioningId(l.id);
    try {
      const { error } = await wardenApproveLeave({
        leave_id: l.id,
        warden_id: user.id,
        approval_note: "Approved by Warden",
      });
      if (error) alert(error.message);
      await loadLeaves();
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(l) {
    if (!confirm("Reject this leave?")) return;
    setActioningId(l.id);
    try {
      const { error } = await rejectLeave({
        leave_id: l.id,
        approver_id: user.id,
        approver_role: "warden",
        rejection_note: "Rejected by Warden",
      });
      if (error) alert(error.message);
      await loadLeaves();
    } finally {
      setActioningId(null);
    }
  }

  return (
    <>
      <Navbar />

      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">Warden Approval</h2>

        {loadingLeaves && <div>Loading…</div>}

        {!isWarden && user && (
          <div className="mb-4 p-3 bg-yellow-50 border rounded text-sm">
            You are not a warden — sign in with a warden account.
          </div>
        )}

        {!loadingLeaves && leaves.length === 0 && isWarden && (
          <div className="text-sm text-slate-600">No pending warden approvals.</div>
        )}

        <div className="space-y-4">
          {leaves.map((l) => (
            <div key={l.id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start">

                {/* LEFT CONTENT */}
                <div>
                  <div className="font-semibold">
                    {l.student?.display_name || l.student?.full_name || "Student"}
                  </div>

                  <div className="text-xs text-slate-500">
                    {l.student?.email} • {l.branch}
                  </div>

                  <div className="mt-2 text-sm">{l.reason}</div>

                  <div className="text-xs text-slate-500 mt-2">
                    {l.start_date} → {l.end_date}
                  </div>

                  {/* STATUS LIKE FACULTY PAGE */}
                  <div className="mt-2 text-xs">
                    {/* Faculty final status */}
                    {l.status === "approved" && (
                      <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        Approved by Faculty
                      </span>
                    )}

                    {l.status === "rejected" && (
                      <span className="inline-flex px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                        Rejected
                      </span>
                    )}

                    {l.status === "pending" && (
                      <span className="inline-flex px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                        Pending Faculty Approval
                      </span>
                    )}

                    {/* Warden state */}
                    <div className="mt-1">
                      {l.warden_approved ? (
                        <span className="inline-flex px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                          Warden approved on{" "}
                          {l.warden_approved_at
                            ? new Date(l.warden_approved_at).toLocaleString()
                            : ""}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs">
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex flex-col gap-2 items-end">
                  {l.status === "pending" && !l.warden_approved && (
                    <>
                      <Button
                        size="sm"
                        disabled={actioningId === l.id}
                        onClick={() => handleApprove(l)}
                      >
                        {actioningId === l.id ? "Working…" : "Approve"}
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actioningId === l.id}
                        onClick={() => handleReject(l)}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {(l.status === "approved" || l.status === "rejected" || l.warden_approved) && (
                    <div className="text-xs text-slate-500">Processed</div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-xs text-slate-500">
          Debug: watch console for realtime events or fetchLeavesForWarden output.
        </div>
      </div>
    </>
  );
}
