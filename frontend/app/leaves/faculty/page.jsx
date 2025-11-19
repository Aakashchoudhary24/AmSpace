// app/leaves/faculty/page.jsx (or wherever your FacultyLeavesPage is)
'use client';
import React, { useEffect, useState } from "react";
import { fetchLeavesForFaculty, approveLeave, rejectLeave } from "@/lib/leaveHelpers";
import { Button } from "@/components/ui/button";
import useSupabaseAuth from "@/lib/useSupabaseAuth";
import Navbar from "../../../components/Navbar";
import Link from "next/link";
import { Badge } from "@/components/ui/badge"; // if you have one; otherwise use a span

export default function FacultyLeavesPage() {
  const { user, isStudent, isFaculty } = useSupabaseAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actioningId, setActioningId] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);

  async function loadLeaves() {
    setErrorInfo(null);
    if (!user) {
      console.log("Faculty page: no user yet");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchLeavesForFaculty(user.id);
      console.log("fetchLeavesForFaculty ->", res);
      const respData = res?.data ?? null;
      const respError = res?.error ?? null;
      const status = res?.status ?? null;

      if (respError || (status && status >= 400)) {
        setErrorInfo({ error: respError || { message: "Unknown error" }, status });
        setLeaves([]);
        setLoading(false);
        return;
      }
      setLeaves(respData || []);
    } catch (err) {
      console.error("Unexpected error in loadLeaves:", err);
      setErrorInfo({ error: err, status: null });
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) loadLeaves();
  }, [user]);

  async function handleApprove(l) {
    if (!user) return;
    setActioningId(l.id);
    try {
      // faculty can only approve after parent has approved
      const { data, error } = await approveLeave({
        leave_id: l.id,
        approver_id: user.id,
        approval_note: "Approved",
        student_email: l.student?.email ?? null,
      });
      if (error) {
        alert("Could not approve: " + (error.message || JSON.stringify(error)));
        return;
      }
      await loadLeaves();
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(l) {
    if (!user) return;
    const ok = confirm("Reject this leave? This action cannot be undone.");
    if (!ok) return;

    setActioningId(l.id);
    try {
      const { data, error } = await rejectLeave({
        leave_id: l.id,
        approver_id: user.id,
        approver_role: "faculty",
        rejection_note: "Rejected by faculty",
        student_email: l.student?.email ?? null,
      });
      if (error) {
        alert("Could not reject: " + (error.message || JSON.stringify(error)));
        return;
      }
      await loadLeaves();
    } finally {
      setActioningId(null);
    }
  }

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-6 pb-2">
        <nav className="flex items-center text-sm text-slate-600" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2 select-none">›</span>
          <span className="font-medium text-slate-900">Leaves</span>
        </nav>
        <p className="mt-2 text-sm text-slate-600">
          Approve or review duty leave applications submitted by students.
        </p>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">Incoming Duty Leaves</h2>

        {loading && <div>Loading…</div>}

        {errorInfo && (
          <div className="mb-4 p-3 border rounded bg-red-50 text-sm text-red-800">
            <div className="font-semibold">Failed to load leaves</div>
            <div className="mt-1">
              {errorInfo.status ? <>Returned status: <strong>{errorInfo.status}</strong><br/></> : null}
              Error: <code>{JSON.stringify(errorInfo.error)}</code>
            </div>
          </div>
        )}

        {!loading && !errorInfo && leaves.length === 0 && (
          <div className="text-sm text-slate-600">No pending leaves</div>
        )}

        <div className="space-y-4">
          {leaves.map((l) => (
            <div key={l.id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">
                    {l.student?.display_name || l.student?.full_name || "Student"}
                  </div>
                  <div className="text-xs text-slate-500">
                    Roll: {l.roll_number} • {l.branch}
                  </div>
                  <div className="mt-2 text-sm">{l.reason}</div>
                  <div className="text-xs text-slate-500 mt-2">
                    From {l.start_date} to {l.end_date}
                  </div>

                  {/* parent state display */}
                  <div className="mt-2 text-xs">
                    {l.parent_approved ? (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-800 text-xs">
                        parent approved {l.parent_approved_at ? `on ${new Date(l.parent_approved_at).toLocaleString()}` : ""}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs">
                        Awaiting parent approval
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <div className="text-sm capitalize">{l.status}</div>

                  {l.status === "pending" ? (
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(l)}
                          disabled={actioningId === l.id || !l.parent_approved}
                          title={!l.parent_approved ? "Cannot approve until parent approves" : "Approve"}
                        >
                          {actioningId === l.id ? "Working…" : "Approve"}
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(l)}
                          disabled={actioningId === l.id}
                        >
                          Reject
                        </Button>
                      </div>

                      {/* small hint text */}
                      {!l.parent_approved && (
                        <div className="text-xs text-slate-500 mt-1">
                          This leave requires parent approval first.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">Processed</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-xs text-slate-500">
          Debug: open browser console and look for the line <code>fetchLeavesForFaculty -&gt;</code>
        </div>
      </div>
    </>
  );
}
