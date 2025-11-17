// lib/leaveHelpers.js
import { supabase } from '@/lib/supabaseClient';

const FUNCTION_URL =
  process.env.NEXT_PUBLIC_SEND_NOTIFICATION_URL ||
  'https://<PROJECT_REF>.functions.supabase.co/send-notification';

/** helper: load profiles by a list of ids and return a map id -> profile */
async function loadProfilesMap(ids = []) {
  if (!ids || ids.length === 0) return {};
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, full_name, role')
    .in('id', ids);
  if (error) {
    console.warn('loadProfilesMap error', error);
    return {};
  }
  const map = {};
  for (const p of data) map[p.id] = p;
  return map;
}

/** Submit a leave (student) */
export async function submitLeave({
  student_id,
  faculty_id,
  roll_number,
  branch,
  reason,
  start_date,
  end_date,
}) {
  // verify faculty_id is a real faculty profile
  const { data: facultyRow, error: facErr } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', faculty_id)
    .single();

  if (facErr || !facultyRow) {
    return { data: null, error: { message: 'Selected faculty not found' } };
  }
  if (facultyRow.role !== 'faculty') {
    return { data: null, error: { message: 'Selected user is not a faculty' } };
  }

  const { data, error } = await supabase
    .from('duty_leaves')
    .insert([
      {
        student_id,
        faculty_id,
        roll_number,
        branch,
        reason,
        start_date,
        end_date,
        status: 'pending',
      },
    ])
    .select()
    .single();
  return { data, error };
}

/** Fetch leaves for a student (includes faculty profile) -- two-step fetch to avoid FK embedding problems */
export async function fetchLeavesForStudent(student_id) {
  // 1) load duty leaves
  const res = await supabase
    .from('duty_leaves')
    .select('id, student_id, faculty_id, roll_number, branch, reason, start_date, end_date, status, submitted_at')
    .eq('student_id', student_id)
    .order('submitted_at', { ascending: false });

  if (res.error) return { data: null, error: res.error, status: res.status, statusText: res.statusText };

  // 2) batch load faculty profiles referenced by these leaves
  const facultyIds = Array.from(new Set(res.data.map((r) => r.faculty_id).filter(Boolean)));
  const facultyMap = await loadProfilesMap(facultyIds);

  // 3) attach faculty object to each leave
  const merged = res.data.map((row) => ({
    ...row,
    faculty: facultyMap[row.faculty_id] || null,
  }));

  return { data: merged, error: null, status: res.status, statusText: res.statusText };
}

/** Fetch leaves for a faculty (includes student profile) -- two-step fetch */
export async function fetchLeavesForFaculty(faculty_id) {
  try {
    const res = await supabase
      .from('duty_leaves')
      .select('id, student_id, faculty_id, roll_number, branch, reason, start_date, end_date, status, submitted_at')
      .eq('faculty_id', faculty_id)
      .order('submitted_at', { ascending: false });

    if (res.error) {
      return { data: null, error: res.error, status: res.status, statusText: res.statusText };
    }

    const studentIds = Array.from(new Set(res.data.map((r) => r.student_id).filter(Boolean)));
    const studentMap = await loadProfilesMap(studentIds);

    const merged = res.data.map((row) => ({
      ...row,
      student: studentMap[row.student_id] || null,
    }));

    return { data: merged, error: null, status: res.status, statusText: res.statusText };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Approve a leave:
 * 1) update duty_leaves row
 * 2) insert into notifications
 * 3) call Edge Function (best-effort) to send email
 *
 * pass student_email if available (recommended)
 */
export async function approveLeave({
  leave_id,
  approver_id,
  approval_note = '',
  student_email = null,
}) {
  // 1) update leave
  const { data: leaveData, error: leaveError } = await supabase
    .from('duty_leaves')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approver_id,
      approval_note,
      notified: false,
    })
    .eq('id', leave_id)
    .select()
    .single();

  if (leaveError) return { data: null, error: leaveError };

  // 2) create notification record
  const { data: notifData, error: notifError } = await supabase
    .from('notifications')
    .insert([
      {
        profile_id: leaveData.student_id,
        type: 'leave_approved',
        payload: {
          leave_id: leaveData.id,
          approved_by: approver_id,
          note: approval_note,
        },
      },
    ])
    .select()
    .single();

  if (notifError) {
    // Leave approved but notification creation failed
    return { data: leaveData, error: null, notificationError: notifError };
  }

  // 3) Best-effort: call Edge Function to send email (does not block success)
  try {
    const toEmail =
      student_email || (leaveData.student && leaveData.student.email) || null;
    if (toEmail) {
      const payload = {
        to_email: toEmail,
        subject: `Your duty leave has been approved`,
        html: `<p>Your leave from <strong>${leaveData.start_date}</strong> to <strong>${leaveData.end_date}</strong> has been <strong>approved</strong>.<p>Note: ${approval_note}</p></p>`,
        notification_id: notifData.id,
      };

      await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
  } catch (fnErr) {
    // best-effort — swallow errors, leave is already approved
    console.warn('Edge function call failed (ignored)', fnErr);
  }

  return { data: leaveData, error: null };
}

/** Insert a notification row (generic) */
export async function addNotification({ profile_id, type, payload = {} }) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([{ profile_id, type, payload }])
    .select()
    .single();
  return { data, error };
}
