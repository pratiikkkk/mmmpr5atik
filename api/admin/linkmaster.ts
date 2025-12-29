import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE;

const supabaseAdmin = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE || '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin.from('kbs_api_linkmaster').select('*').order('kbs_api_linkmasterid');
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }

    if (req.method === 'POST') {
      const payload = req.body;
      const { data, error } = await supabaseAdmin.from('kbs_api_linkmaster').insert(payload).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id } = req.query as any;
      const updates = req.body;
      const { data, error } = await supabaseAdmin.from('kbs_api_linkmaster').update(updates).eq('kbs_api_linkmasterid', id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}