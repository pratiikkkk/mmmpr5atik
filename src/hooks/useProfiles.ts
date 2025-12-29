import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

export const useProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, companies(company_name, company_code), branches(branch_name)')
        .order('full_name');
      if (error) throw error;

      // fetch user roles for returned profiles and merge
      const profiles = (data || []) as any[];
      const userIds = profiles.map((p) => p.user_id).filter(Boolean);
      let rolesMap: Record<string, string[]> = {};
      if (userIds.length) {
        const { data: ur, error: urErr } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);
        if (urErr) throw urErr;
        rolesMap = (ur || []).reduce((acc: Record<string, string[]>, r: any) => {
          if (!acc[r.user_id]) acc[r.user_id] = [];
          acc[r.user_id].push(r.role);
          return acc;
        }, {} as Record<string, string[]>);
      }

      return profiles.map((p) => ({ ...p, roles: rolesMap[p.user_id] || [] }));
    },
  });
};

export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, companies(company_name, company_code), branches(branch_name)')
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useCreateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Omit<ProfileInsert, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: ProfileUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
};
