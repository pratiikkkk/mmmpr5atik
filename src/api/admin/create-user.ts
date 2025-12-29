// Serverless stub: create-user
// THIS FILE IS A SERVER-SIDE EXAMPLE STUB. It is NOT safe to run on the client.
// Deploy this as a serverless function (Vercel/Netlify/Edge) or an Express endpoint
// and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as environment variables.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Example Vercel handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { profile_id, email, password } = req.body || {};
  if (!profile_id || !email || !password) return res.status(400).json({ error: 'Missing params' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

  // If service role key is available, use admin API. Otherwise fall back to a dev-friendly behavior where we
  // generate a dev user id and try to link it to the profile (useful for local testing without service keys).
  if (!SUPABASE_URL) return res.status(500).json({ error: 'Missing server configuration (SUPABASE_URL)' });

  if (SUPABASE_SERVICE_ROLE_KEY) {
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    try {
      // Check if profile already linked to a user
      console.log('[create-user] checking profile link for', profile_id);
      const { data: prof, error: profErr } = await supabaseAdmin.from('profiles').select('user_id').eq('id', profile_id).maybeSingle();
      if (profErr) throw profErr;

      if (prof?.user_id) {
        // Update existing user
        console.log('[create-user] updating existing user', prof.user_id);
        const updateRes = await supabaseAdmin.auth.admin.updateUserById(prof.user_id, { email, password });
        if (updateRes.error) throw updateRes.error;
        return res.status(200).json({ user: updateRes.user });
      }

      // Create the user (admin)
      console.log('[create-user] creating new user for email', email);
      const createRes = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true });
      if (createRes.error) throw createRes.error;
      const user = createRes.user;

      // Link to profile
      const { data: upd, error: updErr } = await supabaseAdmin.from('profiles').update({ user_id: user?.id }).eq('id', profile_id);
      if (updErr) throw updErr;

      console.log('[create-user] linked user', user?.id, 'to profile', profile_id);
      return res.status(200).json({ user });
    } catch (err: any) {
      console.error('[create-user] error', err);
      return res.status(500).json({ error: err?.message || 'Failed to create/update user' });
    }
  }

  // Dev fallback: generate a fake user id and attempt to link the profile using publishable key if available.
  const fakeId = `dev_${Date.now().toString(36)}`;
  let linked = false;
  if (SUPABASE_PUBLISHABLE_KEY) {
    const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
    try {
      const { data: upd, error: updErr } = await supabaseAnon.from('profiles').update({ user_id: fakeId }).eq('id', profile_id);
      if (!updErr) linked = true;
    } catch (e) {
      // ignore - best effort
    }
  }

  // Return success with a dev user object so client can proceed in local testing.
  return res.status(200).json({ user: { id: fakeId, email, dev_mode: true, linked } });
}
