// app/leaves/warden/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { fetchLeavesForWarden, wardenApproveLeave, rejectLeave } from "@/lib/leaveHelpers";
import useSupabaseAuth from "@/lib/useSupabaseAuth";
import Navbar from "../../../components/Navbar";
import { Button } from "@/components/ui/button";

export default function WardenLeavesPage() {
  const { user, isWarden } = useSupabaseAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actioningId, setActioningId] = useState(null);

  async function loadLeaves() {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetchLeavesForWarden(user.id);
      if (res.error) {
        console.error("fetchLeavesForWarden error:", res.error);
        setLeaves([]);
      } else {
        setLeaves(res.data || []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user || !isWarden) return;
    loadLeaves();
  }, [user, isWarden]);

  async function handleApprove(l) {
    setActioningId(l.id);
    try {
      const { data, error } = await wardenApproveLeave({
        leave_id: l.id,
        warden_id: user.id,
        approval_note: "Approved by warden",
      });
      if (error) {
        alert("Approve error: " + (error.message || JSON.stringify(error)));
      } else {
        await loadLeaves();
      }
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(l) {
    if (!confirm("Reject this leave?")) return;
    setActioningId(l.id);
    try {
      const { data, error } = await rejectLeave({
        leave_id: l.id,
        approver_id: user.id,
        approver_role: "warden",
        rejection_note: "Rejected by warden",
      });
      if (error) {
        alert("Reject error: " + (error.message || JSON.stringify(error)));
      } else {
        await loadLeaves();
      }
    } finally {
      setActioningId(null);
    }
  }

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">Warden Approval</h2>

        {loading && <p>Loading…</p>}

        {leaves.length === 0 && !loading && (
          <p className="text-sm text-slate-600">No pending warden approvals.</p>
        )}

        <div className="space-y-4">
          {leaves.map((l) => (
            <div key={l.id} className="p-4 border rounded bg-white">
              <div className="font-semibold">Roll: {l.roll_number}</div>
              <div className="text-xs text-slate-500 mb-2">{l.branch}</div>
              <div className="text-sm">{l.reason}</div>

              <div className="text-xs text-slate-500 mt-2">
                {l.start_date} → {l.end_date}
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" disabled={actioningId === l.id} onClick={() => handleApprove(l)}>
                  {actioningId === l.id ? "Working…" : "Approve"}
                </Button>
                <Button size="sm" variant="destructive" disabled={actioningId === l.id} onClick={() => handleReject(l)}>
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
