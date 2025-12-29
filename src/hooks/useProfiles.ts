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
      // First try the normal select (including api_username). If the column is missing
      // the Supabase client will error; in that case, fallback to a select that omits
      // the api_username column so the UI can still function (read-only for that field).
      try {
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
      } catch (err: any) {
        // If the error suggests the api_username column is missing, run a fallback select
        // that omits that column and return results with api_username = null.
        const msg = String(err?.message || '').toLowerCase();
        if (msg.includes('api_username') || msg.includes('api username') || msg.includes('column') && msg.includes('api_username')) {
          const { data, error } = await supabase
            .from('profiles')
            // explicit list without api_username to avoid missing-column errors
            .select('id, user_id, employee_id, employee_no, employee_name, full_name, company_id, branch_id, biometric_id, erp_username, is_active, inactive_date, cancel, companies(company_name, company_code), branches(branch_name)')
            .order('full_name');
          if (error) throw error;

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

          // Normalize profiles: add api_username = null so components can safely read it
          return profiles.map((p) => ({ ...p, api_username: null, roles: rolesMap[p.user_id] || [] }));
        }

        // Unknown error — bubble up
        throw err;
      }
    },
  });

// Helper hook to detect whether the remote DB has the api_username column. This lets
// components make UI-safe decisions (disable save, show message) without running
// destructive SQL. The check is lightweight (a simple select of that column) and will
// return false if the column is missing.
export const useProfilesHasApiUsername = () => {
  return useQuery({
    queryKey: ['profiles', 'has_api_username'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('api_username').limit(1);
      if (error) {
        const msg = String(error?.message || '').toLowerCase();
        if (msg.includes('api_username') || msg.includes('api username') || (msg.includes('column') && msg.includes('api_username'))) {
          return false;
        }
        throw error;
      }
      return true;
    },
    // Avoid retrying as this is a simple presence check
    retry: false,
  });
};
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
