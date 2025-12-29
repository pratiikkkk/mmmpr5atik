import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type LinkMasterRow = {
  kbs_api_linkmasterid: number;
  linkdate: string;
  linkno: string;
  erpusername: string;
  apiusername: string | null;
  empname: string | null;
  applicablefrom: string | null;
  applicableto: string | null;
  active: string;
  cancel: string;
  createdon: string;
  createdby?: string;
  modifiedon?: string;
};

export const useLinkMasters = () => {
  return useQuery({
    queryKey: ['linkmaster'],
    queryFn: async () => {
      const { data, error } = await supabase.from('kbs_api_linkmaster').select('*').order('kbs_api_linkmasterid');
      if (error) throw error;
      return data as LinkMasterRow[];
    },
  });
};

export const useLinkMasterByERP = (erpUsername?: string) => {
  return useQuery({
    queryKey: ['linkmaster', erpUsername],
    queryFn: async () => {
      if (!erpUsername) return null;
      const { data, error } = await supabase.from('kbs_api_linkmaster').select('*').eq('erpusername', erpUsername).maybeSingle();
      if (error) throw error;
      return data as LinkMasterRow | null;
    },
    enabled: !!erpUsername,
  });
};

export const useCreateLinkMaster = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<LinkMasterRow>) => {
      const { data, error } = await supabase.from('kbs_api_linkmaster').insert(payload).select().single();
      if (error) throw error;
      return data as LinkMasterRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['linkmaster'] }),
  });
};

export const useUpdateLinkMaster = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<LinkMasterRow> }) => {
      const { data, error } = await supabase.from('kbs_api_linkmaster').update(updates).eq('kbs_api_linkmasterid', id).select().single();
      if (error) throw error;
      return data as LinkMasterRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['linkmaster'] }),
  });
};
