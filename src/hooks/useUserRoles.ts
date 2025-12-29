import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserRoles = (userId?: string) => {
  return useQuery({
    queryKey: ['user_roles', userId],
    queryFn: async () => {
      if (!userId) return [] as string[];
      const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userId);
      if (error) throw error;
      return (data || []).map((r: any) => r.role as string);
    },
    enabled: !!userId,
  });
};

export const useSetUserRoles = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ user_id, roles }: { user_id: string; roles: string[] }) => {
      // remove existing roles for the user
      const { error: delErr } = await supabase.from('user_roles').delete().eq('user_id', user_id);
      if (delErr) throw delErr;
      if (!roles || roles.length === 0) return [];
      const inserts = roles.map((r) => ({ user_id, role: r }));
      const { data, error } = await supabase.from('user_roles').insert(inserts).select();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['user_roles', vars.user_id] });
    },
  });
};
