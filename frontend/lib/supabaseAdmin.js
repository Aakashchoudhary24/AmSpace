// frontend/lib/supabaseAdmin.js
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
}

// server-only client (uses service_role key). NEVER import this in client-side code.
export const supabaseAdmin = createClient(url, serviceRole, {
  auth: { persistSession: false },
});
