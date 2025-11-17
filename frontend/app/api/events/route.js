// frontend/app/api/events/route.js
import { NextResponse } from "next/server";
import { supabase as anon} from '@/lib/supabaseClient';
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // server-only admin client

export async function GET() {
  // public read (uses anon client)
  const { data, error } = await anon
    .from("events")
    .select("*")
    .order("date", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req) {
  // create event (server-side): requires Authorization header Bearer <token>
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.replace("Bearer ", "");
    if (!token)
      return NextResponse.json({ error: "Missing token" }, { status: 401 });

    const { data: userData, error: userErr } = await anon.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = userData.user.id;

    // ensure user is admin by checking profiles using admin client
    const { data: prof, error: profErr } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    if (profErr || !prof || prof.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - admin only" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const payload = {
      title: body.title,
      about: body.about ?? null,
      date: body.date ?? null,
      time: body.time ?? null,
      location: body.location ?? null,
      type: body.type ?? null,
      capacity: body.capacity ?? null,
      spots_left: body.spots_left ?? null,
      external_url: body.external_url ?? null,
      created_by: userId,
    };

    const { data, error } = await supabaseAdmin
      .from("events")
      .insert(payload)
      .select()
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST /api/events error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  // delete requires Authorization + admin role; expects JSON { id: <event id> }
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.replace("Bearer ", "");
    if (!token)
      return NextResponse.json({ error: "Missing token" }, { status: 401 });

    const { data: userData, error: userErr } = await anon.auth.getUser(token);
    if (userErr || !userData?.user)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    const userId = userData.user.id;

    const { data: prof, error: profErr } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    if (profErr || !prof || prof.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - admin only" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const id = body?.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabaseAdmin.from("events").delete().eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/events error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
