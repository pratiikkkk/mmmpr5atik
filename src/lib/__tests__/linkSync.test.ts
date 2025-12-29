import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as adminApi from '@/lib/adminApi';
import { syncProfileToLinkMaster } from '@/lib/linkSync';

vi.mock('@/lib/adminApi', () => ({
  listLinkMaster: vi.fn(),
  createLinkMaster: vi.fn(),
  updateLinkMaster: vi.fn(),
}));

describe('syncProfileToLinkMaster', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('creates new mapping when none exists', async () => {
    (adminApi.listLinkMaster as any).mockResolvedValue([]);
    (adminApi.createLinkMaster as any).mockResolvedValue({});

    const profile = { erp_username: 'ERP1', api_username: '123', full_name: 'Test', is_active: true };
    const res = await syncProfileToLinkMaster(profile);

    expect(adminApi.listLinkMaster).toHaveBeenCalled();
    expect(adminApi.createLinkMaster).toHaveBeenCalledWith({ erpusername: 'ERP1', apiusername: '123', empname: 'Test', active: 'T' });
    expect(res).toEqual({ synced: true, action: 'created' });
  });

  it('updates existing mapping when found', async () => {
    (adminApi.listLinkMaster as any).mockResolvedValue([{ kbs_api_linkmasterid: 1, erpusername: 'ERP1' }]);
    (adminApi.updateLinkMaster as any).mockResolvedValue({});

    const profile = { erp_username: 'ERP1', api_username: '456', full_name: 'Test2', is_active: false };
    const res = await syncProfileToLinkMaster(profile);

    expect(adminApi.updateLinkMaster).toHaveBeenCalledWith(1, { erpusername: 'ERP1', apiusername: '456', empname: 'Test2', active: 'F' });
    expect(res).toEqual({ synced: true, action: 'updated' });
  });

  it('returns quickly for missing erp_username', async () => {
    const res = await syncProfileToLinkMaster({});
    expect(res).toEqual({ synced: false, reason: 'missing_erp' });
  });

  it('propagates admin API errors', async () => {
    (adminApi.listLinkMaster as any).mockRejectedValue(new Error('boom'));
    await expect(syncProfileToLinkMaster({ erp_username: 'ERP1' })).rejects.toThrow('boom');
  });
});
