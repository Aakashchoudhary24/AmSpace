// lib/leaveHelpers.js
import { supabase } from "@/lib/supabaseClient";

const FUNCTION_URL =
  process.env.NEXT_PUBLIC_SEND_NOTIFICATION_URL ||
  "https://<PROJECT_REF>.functions.supabase.co/send-notification";

/** helper: load profiles by a list of ids and return a map id -> profile */
async function loadProfilesMap(ids = []) {
  if (!ids || ids.length === 0) return {};
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, full_name, role")
    .in("id", ids);
  if (error) {
    console.warn("loadProfilesMap error", error);
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
    .from("profiles")
    .select("id, email, role, display_name, full_name")
    .eq("id", faculty_id)
    .single();

  if (facErr || !facultyRow) {
    return { data: null, error: { message: "Selected faculty not found" } };
  }
  if (facultyRow.role !== "faculty") {
    return { data: null, error: { message: "Selected user is not a faculty" } };
  }

  const insertPayload = {
    student_id,
    faculty_id,
    roll_number,
    branch,
    reason,
    start_date,
    end_date,
    status: "pending",
    // initial parent fields will be defaults (false / null)
  };

  const { data, error } = await supabase
    .from("duty_leaves")
    .insert([insertPayload])
    .select()
    .single();

  return { data, error };
}

/** Fetch leaves for a student (includes faculty profile and parent fields) -- two-step fetch to avoid FK embedding problems */
export async function fetchLeavesForStudent(student_id) {
  // 1) load duty leaves
  const res = await supabase
    .from("duty_leaves")
    .select(
      "id, student_id, faculty_id, parent_id, parent_approved, parent_approval_note, parent_approved_at, roll_number, branch, reason, start_date, end_date, status, submitted_at, approval_note, approved_at, approver_id, approver_role, notified"
    )
    .eq("student_id", student_id)
    .order("submitted_at", { ascending: false });

  if (res.error)
    return {
      data: null,
      error: res.error,
      status: res.status,
      statusText: res.statusText,
    };

  // 2) batch load faculty and parent profiles referenced by these leaves
  const facultyIds = Array.from(
    new Set(res.data.map((r) => r.faculty_id).filter(Boolean))
  );
  const parentIds = Array.from(
    new Set(res.data.map((r) => r.parent_id).filter(Boolean))
  );
  const profileIds = Array.from(new Set([...facultyIds, ...parentIds]));

  const profileMap = await loadProfilesMap(profileIds);

  // 3) attach profile objects to each leave
  const merged = res.data.map((row) => ({
    ...row,
    faculty: profileMap[row.faculty_id] || null,
    parent: profileMap[row.parent_id] || null,
  }));

  return {
    data: merged,
    error: null,
    status: res.status,
    statusText: res.statusText,
  };
}

/** Fetch leaves for a faculty (includes student profile and parent fields) -- two-step fetch */
export async function fetchLeavesForFaculty(faculty_id) {
  try {
    const res = await supabase
      .from("duty_leaves")
      .select(
        "id, student_id, faculty_id, parent_id, parent_approved, parent_approval_note, parent_approved_at, roll_number, branch, reason, start_date, end_date, status, submitted_at, approval_note, approved_at, approver_id, approver_role, notified"
      )
      .eq("faculty_id", faculty_id)
      .order("submitted_at", { ascending: false });

    if (res.error) {
      return {
        data: null,
        error: res.error,
        status: res.status,
        statusText: res.statusText,
      };
    }

    const studentIds = Array.from(
      new Set(res.data.map((r) => r.student_id).filter(Boolean))
    );
    const profileIds = Array.from(
      new Set([
        ...studentIds,
        ...res.data.map((r) => r.parent_id).filter(Boolean),
      ])
    );

    const profileMap = await loadProfilesMap(profileIds);

    const merged = res.data.map((row) => ({
      ...row,
      student: profileMap[row.student_id] || null,
      parent: profileMap[row.parent_id] || null,
    }));

    return {
      data: merged,
      error: null,
      status: res.status,
      statusText: res.statusText,
    };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * parent approves a leave (sets parent_approved true)
 */
export async function parentApproveLeave({
  leave_id,
  parent_id,
  approval_note = "",
  student_email = null,
}) {
  // 1) update duty_leaves
  const { data: leaveData, error: leaveError } = await supabase
    .from("duty_leaves")
    .update({
      parent_id,
      parent_approved: true,
      parent_approval_note: approval_note,
      parent_approved_at: new Date().toISOString(),
    })
    .eq("id", leave_id)
    .select()
    .single();

  if (leaveError) return { data: null, error: leaveError };

  // 2) create notification for student (optional)
  const { data: notifData, error: notifError } = await supabase
    .from("notifications")
    .insert([
      {
        profile_id: leaveData.student_id,
        type: "leave_parent_approved",
        payload: {
          leave_id: leaveData.id,
          approved_by: parent_id,
          note: approval_note,
        },
      },
    ])
    .select()
    .single();

  // best-effort email via Edge Function (non-blocking)
  try {
    const toEmail =
      student_email || (leaveData.student && leaveData.student.email) || null;
    if (toEmail) {
      const payload = {
        to_email: toEmail,
        subject: `parent approved your duty leave`,
        html: `<p>Your leave from <strong>${leaveData.start_date}</strong> to <strong>${leaveData.end_date}</strong> has been <strong>approved by parent</strong>.</p><p>Note: ${approval_note}</p>`,
        notification_id: notifData?.id ?? null,
      };
      await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
  } catch (fnErr) {
    console.warn("Edge function call failed (ignored)", fnErr);
  }

  return { data: leaveData, notification: notifData, error: null };
}

/**
 * Faculty approves a leave - will only succeed if parent_approved === true
 */
export async function approveLeave({
  leave_id,
  approver_id,
  approval_note = "",
  student_email = null,
}) {
  // fetch current leave first
  const { data: existing, error: fetchErr } = await supabase
    .from("duty_leaves")
    .select("id, parent_approved, student_id, start_date, end_date")
    .eq("id", leave_id)
    .single();

  if (fetchErr || !existing) {
    return { data: null, error: fetchErr || { message: "Leave not found" } };
  }

  if (!existing.parent_approved) {
    return {
      data: null,
      error: {
        message: "parent must approve this leave before faculty can approve it",
      },
    };
  }

  // proceed to approve as faculty
  const { data: leaveData, error: leaveError } = await supabase
    .from("duty_leaves")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approver_id,
      approver_role: "faculty",
      approval_note,
      notified: false,
    })
    .eq("id", leave_id)
    .select()
    .single();

  if (leaveError) return { data: null, error: leaveError };

  // create notification
  const { data: notifData, error: notifError } = await supabase
    .from("notifications")
    .insert([
      {
        profile_id: leaveData.student_id,
        type: "leave_approved",
        payload: {
          leave_id: leaveData.id,
          approved_by: approver_id,
          note: approval_note,
        },
      },
    ])
    .select()
    .single();

  // mark notified flag (best-effort / non-blocking)
  try {
    await supabase
      .from("duty_leaves")
      .update({ notified: true })
      .eq("id", leave_id);
  } catch (err) {
    console.warn("Failed to update notified flag (ignored)", err);
  }

  // best-effort email
  try {
    const toEmail =
      student_email || (leaveData.student && leaveData.student.email) || null;
    if (toEmail) {
      const payload = {
        to_email: toEmail,
        subject: `Your duty leave has been approved`,
        html: `<p>Your leave from <strong>${leaveData.start_date}</strong> to <strong>${leaveData.end_date}</strong> has been <strong>approved</strong>.</p><p>Note: ${approval_note}</p>`,
        notification_id: notifData?.id ?? null,
      };

      await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
  } catch (fnErr) {
    console.warn("Edge function call failed (ignored)", fnErr);
  }

  return { data: leaveData, notification: notifData, error: null };
}

/**
 * Generic reject function (faculty or parent can reject)
 */
export async function rejectLeave({
  leave_id,
  approver_id,
  approver_role = "faculty", // or "parent"
  rejection_note = "",
  student_email = null,
}) {
  // update row
  const { data: leaveData, error: leaveError } = await supabase
    .from("duty_leaves")
    .update({
      status: "rejected",
      approver_id,
      approver_role,
      approval_note: rejection_note, // reuse this field to keep history simple
      approved_at: new Date().toISOString(),
    })
    .eq("id", leave_id)
    .select()
    .single();

  if (leaveError) return { data: null, error: leaveError };

  // create notification row
  const { data: notifData, error: notifError } = await supabase
    .from("notifications")
    .insert([
      {
        profile_id: leaveData.student_id,
        type: "leave_rejected",
        payload: {
          leave_id: leaveData.id,
          rejected_by: approver_id,
          role: approver_role,
          note: rejection_note,
        },
      },
    ])
    .select()
    .single();

  // best-effort email
  try {
    const toEmail =
      student_email || (leaveData.student && leaveData.student.email) || null;
    if (toEmail) {
      const payload = {
        to_email: toEmail,
        subject: `Your duty leave has been rejected`,
        html: `<p>Your leave from <strong>${leaveData.start_date}</strong> to <strong>${leaveData.end_date}</strong> has been <strong>rejected</strong> by ${approver_role}.</p><p>Note: ${rejection_note}</p>`,
        notification_id: notifData?.id ?? null,
      };

      await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
  } catch (fnErr) {
    console.warn("Edge function call failed (ignored)", fnErr);
  }

  return { data: leaveData, notification: notifData, error: null };
}

/** Insert a notification row (generic) */
export async function addNotification({ profile_id, type, payload = {} }) {
  const { data, error } = await supabase
    .from("notifications")
    .insert([{ profile_id, type, payload }])
    .select()
    .single();
  return { data, error };
}

// lib/leaveHelpers.js
export async function fetchLeavesForparent(parent_id = null) {
  try {
    let query = supabase
      .from("duty_leaves")
      .select("id, student_id, roll_number, branch, reason, start_date, end_date, status, parent_id, parent_approved, parent_approval_note, parent_approved_at, submitted_at")
      .eq("parent_approved", false)
      .order("submitted_at", { ascending: false });

    if (parent_id) {
      query = supabase
        .from("duty_leaves")
        .select("id, student_id, roll_number, branch, reason, start_date, end_date, status, parent_id, parent_approved, parent_approval_note, parent_approved_at, submitted_at")
        .eq("parent_approved", false)
        .or(`parent_id.is.null,parent_id.eq.${parent_id}`)
        .order("submitted_at", { ascending: false });
    }

    const res = await query;
    if (res.error) return { data: null, error: res.error };

    // attach student profiles
    const studentIds = Array.from(new Set((res.data || []).map(r => r.student_id).filter(Boolean)));
    const profileMap = await loadProfilesMap(studentIds);
    const merged = (res.data || []).map(row => ({ ...row, student: profileMap[row.student_id] || null }));

    return { data: merged, error: null, status: res.status ?? null };
  } catch (err) {
    return { data: null, error: err };
  }
}

