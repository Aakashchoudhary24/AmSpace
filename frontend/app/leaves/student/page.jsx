'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSupabaseAuth from "@/lib/useSupabaseAuth";
import { submitLeave } from "@/lib/leaveHelpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "../../../components/Navbar";

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

  // realtime subscription: listen for notifications for this student
  useEffect(() => {
    if (!user) return;

    let channel = null;
    try {
      channel = supabase
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

            // Show an in-app toast only for leave_approved notifications
            try {
              if (rec.type === 'leave_approved') {
                // payload may be JSON in rec.payload (string or object depending on your DB)
                const payloadObj =
                  typeof rec.payload === 'string'
                    ? JSON.parse(rec.payload || '{}')
                    : rec.payload || {};

                const note = payloadObj.note ?? '';
                setToast({
                  title: 'Leave approved',
                  message: `Your leave (ID: ${payloadObj.leave_id ?? ''}) was approved. ${note}`,
                });

                // auto-hide after 5s
                setTimeout(() => setToast(null), 5000);
              }
            } catch (err) {
              // fallback: show generic toast
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
      console.warn('Student page: subscribe error', err);
    }

    return () => {
      try {
        if (channel) supabase.removeChannel(channel);
      } catch (err) {
        // ignore
      }
    };
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;
    setErrorMsg("");

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

      // success → redirect or show confirmation
      router.push("/leaves/student?submitted=1");
    } finally {
      setLoadingSubmit(false);
    }
  }

  // small helpers for calendar display
  function formatForDisplay(isoDate) {
    try {
      return format(new Date(isoDate), "PPP");
    } catch {
      return isoDate;
    }
  }

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Submit Duty Leave</h1>

        {toast && (
          <div className="mb-4 p-3 rounded border bg-emerald-50 text-emerald-800">
            <div className="font-semibold">{toast.title}</div>
            <div className="text-sm">{toast.message}</div>
          </div>
        )}

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

          {/* Date pickers using shadcn Calendar + Popover */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start date</Label>
              <div className="flex items-center gap-2">
                {/* Popover + Calendar (shadcn style) */}
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
                        // ensure end date is not before start
                        if (new Date(iso) > new Date(endDate)) {
                          const nd = new Date(iso);
                          nd.setDate(nd.getDate() + 1);
                          setEndDate(nd.toISOString().slice(0, 10));
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {/* Hidden fallback for browsers without calendar UI (still present in markup) */}
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="hidden"
              />
            </div>

            <div>
              <Label>End date</Label>
              <div className="flex items-center gap-2">
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
                        // ensure start date is not after end
                        if (new Date(startDate) > new Date(iso)) {
                          const nd = new Date(iso);
                          nd.setDate(nd.getDate() - 1);
                          setStartDate(nd.toISOString().slice(0, 10));
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="hidden"
              />
            </div>
          </div>

          {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}

          <div>
            <Button type="submit" disabled={loadingSubmit}>
              {loadingSubmit ? "Submitting…" : "Submit duty leave"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
