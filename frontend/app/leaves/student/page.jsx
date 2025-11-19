// leaves/student/page.jsx
'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSupabaseAuth from "@/lib/useSupabaseAuth";
import { submitLeave, fetchLeavesForStudent } from "@/lib/leaveHelpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "../../../components/Navbar";
import Link from "next/link";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function StudentLeavePage() {
  const { user, loading, isStudent, isFaculty } = useSupabaseAuth();
  const router = useRouter();

  const [faculties, setFaculties] = useState([]);
  const [facultyId, setFacultyId] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [branch, setBranch] = useState("");
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // notification toast state (appears when faculty approves)
  const [toast, setToast] = useState(null);

  // Submitted confirmation after sending leave
  const [submittedMsg, setSubmittedMsg] = useState(null);

  // Leaves list & loading
  const [leaves, setLeaves] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);

  // show/hide the submit form
  const [showForm, setShowForm] = useState(false);

  // fetch faculties
  useEffect(() => {
    if (!user || loading) return;

    (async () => {
      try {
        const res = await supabase
          .from("profiles")
          .select("id,email,display_name,full_name")
          .eq("role", "faculty")
          .order("display_name", { ascending: true });

        if (res.error) throw res.error;
        setFaculties(res.data || []);
        if ((res.data || []).length > 0) setFacultyId(res.data[0].id);
      } catch (err) {
        console.error("Failed to load faculty list", err);
        setErrorMsg("Failed to load faculty list");
      }
    })();
  }, [user, loading]);

  // redirect/role handling
  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/auth/login");
      else if (isFaculty) router.replace("/leaves/faculty");
    }
  }, [user, isFaculty, loading]);

  // load student's past leaves
  useEffect(() => {
    if (!user) return;

    let mounted = true;
    const load = async () => {
      setLoadingLeaves(true);
      try {
        const res = await fetchLeavesForStudent(user.id);
        if (!mounted) return;
        if (res.error) {
          console.warn("fetchLeavesForStudent error", res.error);
          setLeaves([]);
        } else {
          setLeaves(res.data || []);
        }
      } catch (err) {
        console.warn("fetchLeavesForStudent thrown", err);
        setLeaves([]);
      } finally {
        if (mounted) setLoadingLeaves(false);
      }
    };
    load();

    return () => {
      mounted = false;
    };
  }, [user]);

  // realtime subscription: listen for notifications for this student
  useEffect(() => {
    if (!user) return;

    let notifChannel = null;
    try {
      notifChannel = supabase
        .channel(`public:notifications:profile:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `profile_id=eq.${user.id}`,
          },
          (payload) => {
            const rec = payload?.record ?? null;
            if (!rec) return;

            try {
              if (rec.type === 'leave_approved') {
                const payloadObj =
                  typeof rec.payload === 'string'
                    ? JSON.parse(rec.payload || '{}')
                    : rec.payload || {};

                const note = payloadObj.note ?? '';
                setToast({
                  title: 'Leave approved',
                  message: `Your leave (ID: ${payloadObj.leave_id ?? ''}) was approved. ${note}`,
                });
                setTimeout(() => setToast(null), 5000);
              }
            } catch (err) {
              setToast({
                title: 'Notification',
                message: 'You have a new notification',
              });
              setTimeout(() => setToast(null), 5000);
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Student page: notifications subscribe error', err);
    }

    return () => {
      try {
        if (notifChannel) supabase.removeChannel(notifChannel);
      } catch (err) {
        // ignore
      }
    };
  }, [user]);

  // realtime subscription: keep leaves list live (insert/update/delete for this student)
  useEffect(() => {
    if (!user) return;
    let leavesChannel = null;

    try {
      leavesChannel = supabase
        .channel(`public:duty_leaves:student:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*", // INSERT, UPDATE, DELETE
            schema: "public",
            table: "duty_leaves",
            filter: `student_id=eq.${user.id}`,
          },
          async (payload) => {
            const rec = payload?.record ?? null;
            const event = payload?.eventType || payload?.event || null;
            if (!rec || !event) return;

            // re-fetch full list to ensure faculty mapping is correct
            try {
              const res = await fetchLeavesForStudent(user.id);
              if (!res.error) setLeaves(res.data || []);
            } catch (err) {
              console.warn("Realtime fetchLeavesForStudent failed", err);
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn("Student page: leaves realtime subscribe error", err);
    }

    return () => {
      try {
        if (leavesChannel) supabase.removeChannel(leavesChannel);
      } catch (err) {}
    };
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;
    setErrorMsg("");
    setSubmittedMsg(null);

    if (!facultyId) {
      setErrorMsg("Choose a faculty to submit to");
      return;
    }
    if (!rollNumber) {
      setErrorMsg("Enter your roll number");
      return;
    }

    // basic date validation
    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg("Start date must be before or same as end date");
      return;
    }

    setLoadingSubmit(true);
    try {
      const payload = {
        student_id: user.id,
        faculty_id: facultyId,
        roll_number: rollNumber,
        branch,
        reason,
        start_date: startDate,
        end_date: endDate,
      };

      const { data, error } = await submitLeave(payload);
      if (error) {
        console.error("submit leave error", error);
        setErrorMsg(error.message || "Failed to submit");
        return;
      }

      // success → show local confirmation and refresh leaves list
      setSubmittedMsg("Leave submitted successfully.");

      // refresh the leaves list so faculty info is attached
      try {
        const res = await fetchLeavesForStudent(user.id);
        if (!res.error) setLeaves(res.data || []);
      } catch (err) {
        console.warn("Failed to refresh leaves after submit", err);
      }

      // clear some form fields (optional)
      setReason("");
      // leave dates as-is
      setErrorMsg("");

      // auto-dismiss submitted message after 4s
      setTimeout(() => setSubmittedMsg(null), 4000);

      // hide form after successful submit
      setShowForm(false);
    } finally {
      setLoadingSubmit(false);
    }
  }

  // small helpers for calendar display and status chip
  function formatForDisplay(isoDate) {
    try {
      return format(new Date(isoDate), "PPP");
    } catch {
      return isoDate;
    }
  }

  function statusClass(s) {
    switch (s) {
      case "approved":
        return "px-3 py-1 rounded-full text-sm bg-green-800 text-white";
      case "rejected":
        return "px-3 py-1 rounded-full text-sm bg-red-700 text-white";
      case "pending":
        return "px-3 py-1 rounded-full text-sm bg-yellow-500 text-black";
      case "cancelled":
        return "px-3 py-1 rounded-full text-sm bg-gray-400 text-white";
      default:
        return "px-3 py-1 rounded-full text-sm bg-gray-200 text-black";
    }
  }

  return (
    <>
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-2xl mx-auto px-6 pt-6 pb-2">
        <nav
          className="flex items-center text-sm text-slate-600"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-2 select-none">›</span>
          <span className="font-medium text-slate-900">Leaves</span>
        </nav>

        <p className="mt-2 text-sm text-slate-600">
          Submit a duty leave request to your assigned faculty.
        </p>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Duty Leaves</h1>

        {/* Toast (notification from notification rows) */}
        {toast && (
          <div className="mb-4 p-3 rounded border bg-emerald-50 text-emerald-800">
            <div className="font-semibold">{toast.title}</div>
            <div className="text-sm">{toast.message}</div>
          </div>
        )}

        {/* Submitted confirmation */}
        {submittedMsg && (
          <div className="mb-4 p-3 rounded border bg-blue-50 text-blue-800">
            <div className="font-semibold">Submitted</div>
            <div className="text-sm">{submittedMsg}</div>
          </div>
        )}

        {/* Previous leaves at top */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Your previous requests</h2>
            <div>
              <Button onClick={() => setShowForm((s) => !s)}>
                {showForm ? "Hide form" : "Submit new leave"}
              </Button>
            </div>
          </div>

          {loadingLeaves ? (
            <div className="text-sm text-slate-600">Loading your leaves…</div>
          ) : leaves.length === 0 ? (
            <div className="text-sm text-slate-600 p-6 border rounded">
              No duty leave requests found. Click "Submit new leave" to create one.
            </div>
          ) : (
            <div className="space-y-3">
              {leaves.map((l) => (
                <div
                  key={l.id}
                  className="p-4 border rounded-lg shadow-sm bg-white flex justify-between items-start"
                >
                  <div>
                    <div className="flex items-baseline gap-3">
                      <div className="text-sm text-slate-500">
                        {l.faculty ? (l.faculty.display_name || l.faculty.full_name || l.faculty.email) : "Faculty"}
                      </div>
                      <div className="text-sm text-slate-400">•</div>
                      <div className="text-sm text-slate-500">
                        {formatForDisplay(l.start_date)} → {formatForDisplay(l.end_date)}
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-slate-700">{l.reason}</div>

                    <div className="mt-2 text-xs text-slate-500">
                      Submitted: {l.submitted_at ? new Date(l.submitted_at).toLocaleString() : "—"}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={statusClass(l.status)}>{(l.status || "").toUpperCase()}</div>
                    {l.approval_note && (
                      <div className="text-xs mt-2 text-slate-500">Note: {l.approval_note}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Form (hidden unless showForm true) */}
        {showForm && (
          <div className="p-4 border rounded-md bg-white">
            <h3 className="text-lg font-medium mb-4">Submit Duty Leave</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Faculty</Label>
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full border rounded p-2"
                >
                  {faculties.length === 0 && (
                    <option value="">No faculty found</option>
                  )}
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.display_name || f.full_name || f.email} — {f.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Your email</Label>
                <Input value={user?.email || ""} readOnly />
              </div>

              <div>
                <Label>Roll number</Label>
                <Input
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                />
              </div>

              <div>
                <Label>Branch</Label>
                <Input value={branch} onChange={(e) => setBranch(e.target.value)} />
              </div>

              <div>
                <Label>Reason</Label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border rounded p-2 h-28"
                />
              </div>

              {/* Date pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        {formatForDisplay(startDate)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate ? new Date(startDate) : undefined}
                        onSelect={(d) => {
                          if (!d) return;
                          const iso = d.toISOString().slice(0, 10);
                          setStartDate(iso);
                          if (new Date(iso) > new Date(endDate)) {
                            const nd = new Date(iso);
                            nd.setDate(nd.getDate() + 1);
                            setEndDate(nd.toISOString().slice(0, 10));
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="hidden"
                  />
                </div>

                <div>
                  <Label>End date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        {formatForDisplay(endDate)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate ? new Date(endDate) : undefined}
                        onSelect={(d) => {
                          if (!d) return;
                          const iso = d.toISOString().slice(0, 10);
                          setEndDate(iso);
                          if (new Date(startDate) > new Date(iso)) {
                            const nd = new Date(iso);
                            nd.setDate(nd.getDate() - 1);
                            setStartDate(nd.toISOString().slice(0, 10));
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="hidden"
                  />
                </div>
              </div>

              {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}

              <div className="flex gap-3">
                <Button type="submit" disabled={loadingSubmit}>
                  {loadingSubmit ? "Submitting…" : "Submit duty leave"}
                </Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
