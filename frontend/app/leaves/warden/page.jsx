"use client";

import React, { useEffect, useState } from "react";
import { fetchLeavesForFaculty, wardenApproveLeave, rejectLeave } from "@/lib/leaveHelpers";
import useSupabaseAuth from "@/lib/useSupabaseAuth";
import Navbar from "../../../components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WardenLeavesPage() {
  const { user, isStudent, isFaculty } = useSupabaseAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actioningId, setActioningId] = useState(null);

  // Load all leaves where this warden needs to approve
  async function loadLeaves() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("duty_leaves")
        .select(
          "id, student_id, roll_number, branch, reason, start_date, end_date, status, warden_approved, warden_approval_note, warden_approved_at"
        )
        .is("warden_approved", false)
        .order("submitted_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setLeaves(data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    loadLeaves();
  }, [user]);

  async function handleApprove(l) {
    setActioningId(l.id);
    try {
      const { error } = await wardenApproveLeave({
        leave_id: l.id,
        warden_id: user.id,
        approval_note: "Approved by warden",
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
        rejection_note: "Rejected by warden"
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
