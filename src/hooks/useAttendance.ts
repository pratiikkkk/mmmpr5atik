import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type AttendancePunch = Tables<'attendance_punches'>;
export type AttendancePunchInsert = TablesInsert<'attendance_punches'>;

export const useAttendancePunches = (profileId?: string, date?: string) => {
  return useQuery({
    queryKey: ['attendance_punches', profileId, date],
    queryFn: async () => {
      let query = supabase
        .from('attendance_punches')
        .select('*, profiles(full_name, employee_id)')
        .order('punch_time', { ascending: false });

      if (profileId) {
        query = query.eq('profile_id', profileId);
      }
      if (date) {
        query = query.gte('punch_time', `${date}T00:00:00`).lt('punch_time', `${date}T23:59:59`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCreatePunch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (punch: AttendancePunchInsert) => {
      const { data, error } = await supabase
        .from('attendance_punches')
        .insert(punch)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_punches'] });
    },
  });
};
