import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE;

const supabaseAdmin = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE || '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'POST') {
      // Fetch active non-cancelled employees
      const { data: employees, error: empError } = await supabaseAdmin
        .from('emp_master')
        .select('empno, empname, erp_username, api_username')
        .eq('cancel', 'F')
        .eq('active', 'T');

      if (empError) return res.status(500).json({ error: empError.message });

      const inserted: any[] = [];
      for (const e of employees || []) {
        // check existing by linkno
        const { data: existing, error: exErr } = await supabaseAdmin
          .from('kbs_api_linkmaster')
          .select('linkno')
          .eq('linkno', e.empno)
          .maybeSingle();

        if (exErr) return res.status(500).json({ error: exErr.message });

        if (!existing) {
          const payload = {
            linkno: e.empno,
            empname: e.empname,
            erpusername: e.erp_username,
            apiusername: e.api_username,
            linkdate: new Date().toISOString(),
            active: 'T',
            cancel: 'F',
          };
          const { data: ins, error: insErr } = await supabaseAdmin.from('kbs_api_linkmaster').insert(payload).select().single();
          if (insErr) return res.status(500).json({ error: insErr.message });
          inserted.push(ins);
        }
      }

      return res.json({ insertedCount: inserted.length, inserted });
    }

    if (req.method === 'PUT') {
      // run update logic to sync existing records
      const { data: updated, error } = await supabaseAdmin.rpc('sync_api_linkmaster_from_emp_master');
      // If RPC function not available, perform manual update
      if (error) {
        // manual update: update each matching linkno
        const { data: allLinks, error: linksErr } = await supabaseAdmin.from('kbs_api_linkmaster').select('linkno');
        if (linksErr) return res.status(500).json({ error: linksErr.message });

        let updateCount = 0;
        for (const l of allLinks || []) {
          const { data: m, error: mErr } = await supabaseAdmin.from('emp_master').select('erp_username, api_username, empname').eq('empno', l.linkno).maybeSingle();
          if (mErr) return res.status(500).json({ error: mErr.message });
          if (m) {
            const { data: up, error: upErr } = await supabaseAdmin
              .from('kbs_api_linkmaster')
              .update({ erpusername: m.erp_username, apiusername: m.api_username, empname: m.empname })
              .eq('linkno', l.linkno);
            if (upErr) return res.status(500).json({ error: upErr.message });
            updateCount += 1;
          }
        }
        return res.json({ updated: updateCount });
      }

      return res.json({ updated: updated });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
