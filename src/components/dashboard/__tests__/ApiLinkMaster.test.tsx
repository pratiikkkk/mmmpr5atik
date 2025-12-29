import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockCreate = { mutateAsync: vi.fn() };
const mockUpdate = { mutateAsync: vi.fn() };

// module mocks need to reference above mocks so we define them here
vi.mock('@/hooks/useProfiles', () => ({ useProfiles: () => ({ data: [{ id: '1', full_name: 'Alice', erp_username: 'ERP1', api_username: '111' }] }) }));
vi.mock('@/hooks/useLinkMaster', () => ({
  useLinkMasters: () => ({ data: [] }),
  useLinkMasterByERP: (erp?: string) => ({ data: null }),
  useCreateLinkMaster: () => mockCreate,
  useUpdateLinkMaster: () => mockUpdate,
}));

describe('ApiLinkMaster', () => {
  const toast = vi.fn();
  const renderWithClient = (ui: any) => {
    const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
    const qc = new QueryClient();
    return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows validation errors when required fields missing', async () => {
    const { default: ApiLinkMaster } = await import('../ApiLinkMaster');
    renderWithClient(<ApiLinkMaster onToast={toast} />);

    const saveButton = await screen.findByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Select an employee')).toBeInTheDocument();
    });
    expect(toast).toHaveBeenCalledWith('Select an employee', 'error');
  });

  it('calls sync endpoint when clicking Save (no existing mapping)', async () => {
    // ensure module mock returns no existing mapping
    vi.doMock('@/hooks/useLinkMaster', () => ({
      useLinkMasters: () => ({ data: [] }),
      useLinkMasterByERP: (erp?: string) => ({ data: null }),
      useCreateLinkMaster: () => mockCreate,
      useUpdateLinkMaster: () => mockUpdate,
    }));

    const { default: ApiLinkMaster } = await import('../ApiLinkMaster');

    // mock fetch for sync endpoint
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ insertedCount: 1 }) } as any);

    renderWithClient(<ApiLinkMaster onToast={toast} />);

    // select employee (combobox)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });

    // From date required: set first date input
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2025-01-01' } });

    const saveButton = await screen.findByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith('/api/admin/sync-emp-to-linkmaster', expect.any(Object)));

    fetchSpy.mockRestore();
  });

  it('calls sync endpoint when clicking Save (existing mapping present)', async () => {
    // remock modules so useLinkMasterByERP returns an existing mapping and profiles exist
    vi.resetModules();
    vi.doMock('@/hooks/useProfiles', () => ({ useProfiles: () => ({ data: [{ id: '1', full_name: 'Alice', erp_username: 'ERP1', api_username: '111' }] }) }));
    vi.doMock('@/hooks/useLinkMaster', () => ({
      useLinkMasters: () => ({ data: [{ kbs_api_linkmasterid: 99, erpusername: 'ERP1', linkno: '1' }] }),
      useLinkMasterByERP: (erp?: string) => ({ data: { kbs_api_linkmasterid: 99, erpusername: 'ERP1', applicablefrom: '2024-01-01', applicableto: null, active: 'T', linkno: '1' } }),
      useCreateLinkMaster: () => mockCreate,
      useUpdateLinkMaster: () => mockUpdate,
    }));

    const { default: ApiLinkMaster } = await import('../ApiLinkMaster');

    // mock fetch for sync endpoint
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ insertedCount: 0 }) } as any);


    renderWithClient(<ApiLinkMaster onToast={toast} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
    // set Applicable From via date input
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2025-01-01' } });

    const saveButton = await screen.findByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith('/api/admin/sync-emp-to-linkmaster', expect.any(Object)));

    fetchSpy.mockRestore();
  });
});
