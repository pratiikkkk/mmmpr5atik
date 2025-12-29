// Client side wrapper that hits server endpoints. These endpoints MUST be implemented server-side
// with the Supabase service_role key and proper admin checks (admin-only)

export async function createUserForProfile(payload: { profile_id: string; email: string; password: string }) {
  const res = await fetch('/api/admin/create-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || 'Create user failed');
  }
  return res.json();
}

export async function resetPasswordForUser(payload: { user_id: string; password: string }) {
  const res = await fetch('/api/admin/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || 'Reset password failed');
  }
  return res.json();
}

export async function listLinkMaster() {
  const res = await fetch('/api/admin/linkmaster');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || 'Failed to fetch link master');
  }
  return res.json();
}

export async function createLinkMaster(payload: any) {
  const res = await fetch('/api/admin/linkmaster', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || 'Create link master failed');
  }
  return res.json();
}

export async function updateLinkMaster(id: number | string, payload: any) {
  const res = await fetch(`/api/admin/linkmaster?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || 'Update link master failed');
  }
  return res.json();
}