// Serverless stub: reset-password
// THIS FILE IS A SERVER-SIDE EXAMPLE STUB. Deploy on server and set SUPABASE_SERVICE_ROLE_KEY.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { user_id, password } = req.body || {};
  if (!user_id || !password) return res.status(400).json({ error: 'Missing params' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL) return res.status(500).json({ error: 'Missing server configuration (SUPABASE_URL)' });

  if (SUPABASE_SERVICE_ROLE_KEY) {
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    try {
      console.log('[reset-password] updating password for', user_id);
      // Update password for user (admin API)
      const updateRes = await supabaseAdmin.auth.admin.updateUserById(user_id, { password });
      if (updateRes.error) throw updateRes.error;
      return res.status(200).json({ user: updateRes.user });
    } catch (err: any) {
      console.error('[reset-password] error', err);
      return res.status(500).json({ error: err?.message || 'Failed to reset password' });
    }
  }

  // Dev fallback: we cannot actually reset the password without a service role key.
  // Return success with a dev_mode flag so the UI can continue in local testing.
  console.log('[reset-password] dev-mode fallback, no service key');
  return res.status(200).json({ user: { id: user_id, dev_mode: true, note: 'Password not changed in dev mode' } });
}
