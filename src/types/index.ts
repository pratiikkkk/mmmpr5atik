import { LucideIcon } from 'lucide-react';

export enum TabType {
  OVERVIEW = 'overview',
  COMPANY_MASTER = 'company-master',
  BRANCH_MASTER = 'branch-master',
  ROLE_MASTER = 'role-master',
  EMP_MASTER = 'emp-master',
  MANUAL_ENTRY = 'manual-entry',
  REPORTS = 'reports',
}

export const APP_SCREENS = [
  'Overview',
  'Company Master',
  'Branch Master',
  'Role Master',
  'Employee Master',
  'Punch Desk',
  'Reports Console',
  'System Logs',
  'Audit Trails',
];

export interface NavTab {
  id: TabType;
  name: string;
  icon: LucideIcon;
}
