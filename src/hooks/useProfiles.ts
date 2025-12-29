import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = '/api';

/* ================================
   GET : Employee List
================================ */
export const useProfiles = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/employee/list`);
      if (!res.ok) {
        throw new Error('Failed to fetch employees');
      }
      const text = await res.text();
      if (!text) return [];
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        return [];
      }
      return json.data || [];
    }
  });
};

/* ================================
   CREATE : Employee Save
================================ */
export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/employee/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      if (!text) throw new Error('No response from server');
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid JSON response');
      }
      if (json.statusCode !== 0) {
        throw new Error(json.message);
      }
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
};

/* ================================
   UPDATE : Employee Update
================================ */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/employee/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      if (!text) throw new Error('No response from server');
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid JSON response');
      }
      if (json.statusCode !== 0) {
        throw new Error(json.message);
      }
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
};

/* ================================
   CHECK : Does profiles have `api_username` column?
   (Frontend-only heuristic — checks first row returned)
================================ */
export const useProfilesHasApiUsername = () => {
  return useQuery({
    queryKey: ['hasApiUsername'],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_BASE}/employee/list`);
        if (!res.ok) {
          // If the API fails, assume column exists (safer default)
          return true;
        }
        const text = await res.text();
        if (!text) return true;
        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          return true;
        }
        const rows = json.data || [];
        if (!rows.length) return true; // no rows — assume schema has the column
        // Check first row for property presence
        return Object.prototype.hasOwnProperty.call(rows[0], 'api_username');
      } catch (e) {
        // Network error — assume true to avoid disabling UI features erroneously
        return true;
      }
    },
    // this won't change often — cache for 10 minutes
    staleTime: 1000 * 60 * 10,
  });
};
