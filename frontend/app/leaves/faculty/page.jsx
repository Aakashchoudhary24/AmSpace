"use client";
import React, { useEffect, useState } from "react";
import { fetchLeavesForFaculty, approveLeave } from "@/lib/leaveHelpers";
import { Button } from "@/components/ui/button";
import useSupabaseAuth from "@/lib/useSupabaseAuth";
import Navbar from "../../../components/Navbar";

export default function FacultyLeavesPage() {
  const { user, isStudent, isFaculty } = useSupabaseAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);

  // load and log full response for debugging
  async function loadLeaves() {
    setErrorInfo(null);
    if (!user) {
      console.log("Faculty page: no user yet");
      return;
    }

    console.log("Faculty page: logged-in user", user);
    setLoading(true);

    try {
      const res = await fetchLeavesForFaculty(user.id);
      // log full response object so we can inspect status / error
      console.log("fetchLeavesForFaculty ->", res);

      // handle possible shapes: helper returns { data, error, status, statusText } or { data, error }
      const respData = res?.data ?? null;
      const respError = res?.error ?? null;
      const status = res?.status ?? null;

      if (respError || status >= 400) {
        // keep an informative error for UI
        setErrorInfo({
          error: respError || { message: "Unknown error" },
          status,
        });
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
    if (!loading) {
      if (!user) return;
      if (isStudent) router.replace("/leaves/student");
    }
  }, [user, isStudent, loading]);

  useEffect(() => {
    if (user) loadLeaves();
    // also re-run if user changes
  }, [user]);

  async function handleApprove(leave) {
    if (!user) return;
    setApprovingId(leave.id);
    try {
      const { data, error } = await approveLeave({
        leave_id: leave.id,
        approver_id: user.id,
        approval_note: "Approved",
        student_email: leave.student?.email ?? null,
      });

      if (error) {
        console.error("Approve error", error);
        alert("Error approving: " + (error.message || "Unknown error"));
        return;
      }

      // success — reload list
      await loadLeaves();
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">Incoming Duty Leaves</h2>

        {/* loading / error */}
        {loading && <div>Loading…</div>}

        {errorInfo && (
          <div className="mb-4 p-3 border rounded bg-red-50 text-sm text-red-800">
            <div className="font-semibold">Failed to load leaves</div>
            <div className="mt-1">
              {errorInfo.status ? (
                <>
                  Returned status: <strong>{errorInfo.status}</strong>
                  <br />
                </>
              ) : null}
              Error: <code>{JSON.stringify(errorInfo.error)}</code>
            </div>

            {/* helpful RLS hint */}
            {errorInfo.status === 401 || errorInfo.status === 403 ? (
              <div className="mt-2 text-xs text-slate-700">
                This looks like a permission (RLS) issue. For quick testing, run
                this SQL in Supabase SQL editor to allow faculty role to select
                duty_leaves:
                <pre className="mt-2 p-2 bg-white text-xs rounded border">
                  create policy if not exists
                  "dutyleaves_select_for_faculty_role" on public.duty_leaves for
                  select using ( exists ( select 1 from public.profiles p where
                  p.id = auth.uid() and p.role = 'faculty' ) );
                </pre>
                After testing you can remove the policy with:
                <pre className="mt-2 p-2 bg-white text-xs rounded border">
                  drop policy if exists "dutyleaves_select_for_faculty_role" on
                  public.duty_leaves;
                </pre>
              </div>
            ) : null}
          </div>
        )}

        {/* no leaves */}
        {!loading && !errorInfo && leaves.length === 0 && (
          <div className="text-sm text-slate-600">No pending leaves</div>
        )}

        {/* leaves list */}
        <div className="space-y-4">
          {leaves.map((l) => (
            <div key={l.id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">
                    {l.student?.display_name ||
                      l.student?.full_name ||
                      "Student"}
                  </div>
                  <div className="text-xs text-slate-500">
                    Roll: {l.roll_number} • {l.branch}
                  </div>
                  <div className="mt-2 text-sm">{l.reason}</div>
                  <div className="text-xs text-slate-500 mt-2">
                    From {l.start_date} to {l.end_date}
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <div className="text-sm capitalize">{l.status}</div>

                  {l.status === "pending" ? (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(l)}
                      disabled={approvingId === l.id}
                    >
                      {approvingId === l.id ? "Approving…" : "Approve"}
                    </Button>
                  ) : (
                    <div className="text-xs text-slate-500">Processed</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* small debug footer */}
        <div className="mt-6 text-xs text-slate-500">
          Debug: open browser console and look for the line{" "}
          <code>fetchLeavesForFaculty -&gt;</code> — it prints the full response
          object from the helper.
        </div>
      </div>
    </>
  );
}
