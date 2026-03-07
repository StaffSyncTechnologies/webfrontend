export type UserRole = 
  | 'ADMIN' 
  | 'OPS_MANAGER' 
  | 'SHIFT_COORDINATOR' 
  | 'COMPLIANCE_OFFICER' 
  | 'CLIENT_ADMIN' 
  | 'CLIENT_USER' 
  | 'WORKER';

export type Permission =
  | 'dashboard.view'
  | 'dashboard.admin'
  | 'workers.view'
  | 'workers.create'
  | 'workers.edit'
  | 'workers.delete'
  | 'workers.approve'
  | 'shifts.view'
  | 'shifts.create'
  | 'shifts.edit'
  | 'shifts.delete'
  | 'shifts.assign'
  | 'shifts.broadcast'
  | 'clients.view'
  | 'clients.create'
  | 'clients.edit'
  | 'timesheets.view'
  | 'timesheets.approve'
  | 'timesheets.edit'
  | 'invoices.view'
  | 'invoices.create'
  | 'reports.view'
  | 'reports.export'
  | 'compliance.view'
  | 'compliance.verify'
  | 'compliance.rtw'
  | 'settings.view'
  | 'settings.edit'
  | 'users.view'
  | 'users.manage';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'dashboard.view',
    'dashboard.admin',
    'workers.view',
    'workers.create',
    'workers.edit',
    'workers.delete',
    'workers.approve',
    'shifts.view',
    'shifts.create',
    'shifts.edit',
    'shifts.delete',
    'shifts.assign',
    'shifts.broadcast',
    'clients.view',
    'clients.create',
    'clients.edit',
    'timesheets.view',
    'timesheets.approve',
    'timesheets.edit',
    'invoices.view',
    'invoices.create',
    'reports.view',
    'reports.export',
    'compliance.view',
    'compliance.verify',
    'compliance.rtw',
    'settings.view',
    'settings.edit',
    'users.view',
    'users.manage',
  ],
  OPS_MANAGER: [
    'dashboard.view',
    'workers.view',
    'workers.edit',
    'workers.approve',
    'shifts.view',
    'shifts.create',
    'shifts.edit',
    'shifts.assign',
    'clients.view',
    'timesheets.view',
    'timesheets.approve',
    'reports.view',
    'reports.export',
    'compliance.view',
  ],
  SHIFT_COORDINATOR: [
    'dashboard.view',
    'workers.view',
    'shifts.view',
    'shifts.create',
    'shifts.edit',
    'shifts.assign',
    'shifts.broadcast',
    'clients.view',
    'timesheets.view',
  ],
  COMPLIANCE_OFFICER: [
    'dashboard.view',
    'workers.view',
    'compliance.view',
    'compliance.verify',
    'compliance.rtw',
    'reports.view',
    'reports.export',
  ],
  CLIENT_ADMIN: [
    'dashboard.view',
    'workers.view',
    'shifts.view',
    'shifts.create',
    'timesheets.view',
    'timesheets.approve',
    'invoices.view',
    'reports.view',
    'settings.view',
    'settings.edit',
    'users.view',
    'users.manage',
  ],
  CLIENT_USER: [
    'dashboard.view',
    'workers.view',
    'shifts.view',
    'timesheets.view',
    'invoices.view',
  ],
  WORKER: [
    'dashboard.view',
    'shifts.view',
    'timesheets.view',
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  OPS_MANAGER: 'Operations Manager',
  SHIFT_COORDINATOR: 'Shift Coordinator',
  COMPLIANCE_OFFICER: 'Compliance Officer',
  CLIENT_ADMIN: 'Client Admin',
  CLIENT_USER: 'Client User',
  WORKER: 'Worker',
};

export const STAFF_ROLES: UserRole[] = ['ADMIN', 'OPS_MANAGER', 'SHIFT_COORDINATOR', 'COMPLIANCE_OFFICER'];
export const CLIENT_ROLES: UserRole[] = ['CLIENT_ADMIN', 'CLIENT_USER'];

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function isStaffRole(role: UserRole): boolean {
  return STAFF_ROLES.includes(role);
}

export function isClientRole(role: UserRole): boolean {
  return CLIENT_ROLES.includes(role);
}

export function canAccessRoute(role: UserRole, routePath: string): boolean {
  const routePermissions: Record<string, Permission[]> = {
    '/dashboard': ['dashboard.view'],
    '/workers': ['workers.view'],
    '/shifts': ['shifts.view'],
    '/clients': ['clients.view'],
    '/schedule': ['shifts.view'],
    '/timesheet': ['timesheets.view'],
    '/invoices': ['invoices.view'],
    '/reports': ['reports.view'],
    '/settings': ['settings.view'],
    '/compliance': ['compliance.view'],
  };

  const requiredPermissions = routePermissions[routePath];
  if (!requiredPermissions) return true;
  
  return hasAnyPermission(role, requiredPermissions);
}
