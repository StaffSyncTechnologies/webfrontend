import {
  Dashboard,
  EventNote,
  People,
  Business,
  AccountBalanceWallet,
  AccountBalance,
  SupervisorAccount,
  AccessTime,
  BeachAccess,
  CalendarMonth,
  Receipt,
  Assessment,
  Settings,
  HelpOutline,
  Logout,
  VerifiedUser,
  Chat,
  PersonAdd,
} from '@mui/icons-material';
import type { ComponentType } from 'react';
import type { UserRole } from '../utilities/roles';

export interface RouteConfig {
  path: string;
  label: string;
  icon?: ComponentType;
  requiresAuth: boolean;
  showInSidebar?: boolean;
  section?: 'main' | 'bottom';
  allowedRoles?: UserRole[];
}

export const routes: RouteConfig[] = [
  // Auth required routes (shown in sidebar)
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: Dashboard,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['ADMIN', 'OPS_MANAGER', 'SHIFT_COORDINATOR', 'COMPLIANCE_OFFICER'],
  },
  {
    path: '/shifts',
    label: 'Shift',
    icon: EventNote,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['ADMIN', 'OPS_MANAGER', 'SHIFT_COORDINATOR'],
  },
  {
    path: '/workers',
    label: 'Worker',
    icon: People,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['ADMIN', 'OPS_MANAGER', 'SHIFT_COORDINATOR', 'COMPLIANCE_OFFICER'],
  },
  {
    path: '/clients',
    label: 'Client',
    icon: Business,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['ADMIN', 'OPS_MANAGER'],
  },
  {
    path: '/payroll',
    label: 'Payroll',
    icon: AccountBalanceWallet,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['ADMIN', 'OPS_MANAGER'],
  },
  {
    path: '/bank-accounts',
    label: 'Bank Accounts',
    icon: AccountBalance,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['ADMIN', 'OPS_MANAGER'],
  },
  {
    path: '/timesheet',
    label: 'Timesheet',
    icon: AccessTime,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['ADMIN', 'OPS_MANAGER', 'SHIFT_COORDINATOR'],
  },
  {
    path: '/holiday',
    label: 'Holiday',
    icon: BeachAccess,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['ADMIN', 'OPS_MANAGER', 'SHIFT_COORDINATOR'],
  },
  {
    path: '/schedule',
    label: 'Schedule (Rota)',
    icon: CalendarMonth,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['ADMIN', 'OPS_MANAGER', 'SHIFT_COORDINATOR'],
  },
  {
    path: '/invoices',
    label: 'Invoices',
    icon: Receipt,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/reports',
    label: 'Reports',
    icon: Assessment,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['ADMIN', 'OPS_MANAGER', 'COMPLIANCE_OFFICER'],
  },
  {
    path: '/compliance',
    label: 'Compliance',
    icon: VerifiedUser,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['ADMIN', 'COMPLIANCE_OFFICER'],
  },
  {
    path: '/hr-management',
    label: 'HR Management',
    icon: SupervisorAccount,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['ADMIN', 'OPS_MANAGER'],
  },
  {
    path: '/invite-requests',
    label: 'Invite Requests',
    icon: PersonAdd,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['ADMIN', 'OPS_MANAGER'],
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['ADMIN'],
  },
  // Client-specific routes
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: Dashboard,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['CLIENT_ADMIN', 'CLIENT_USER'],
  },
  {
    path: '/client/workers',
    label: 'Workers',
    icon: People,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['CLIENT_ADMIN', 'CLIENT_USER'],
  },
  {
    path: '/client/shifts',
    label: 'Shifts',
    icon: EventNote,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['CLIENT_ADMIN', 'CLIENT_USER'],
  },
  {
    path: '/client/timesheets',
    label: 'Timesheets',
    icon: AccessTime,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['CLIENT_ADMIN', 'CLIENT_USER'],
  },
  {
    path: '/client/invoices',
    label: 'Invoices',
    icon: Receipt,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['CLIENT_ADMIN', 'CLIENT_USER'],
  },
  {
    path: '/client/reports',
    label: 'Reports',
    icon: Assessment,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['CLIENT_ADMIN'],
  },
  {
    path: '/client/settings',
    label: 'Settings',
    icon: Settings,
    requiresAuth: true,
    showInSidebar: true,
    section: 'main',
    allowedRoles: ['CLIENT_ADMIN', 'CLIENT_USER'],
  },
  // Bottom section
  {
    path: '/chat',
    label: 'Chat',
    icon: Chat,
    requiresAuth: true,
    showInSidebar: true,
    section: 'bottom',
    allowedRoles: ['ADMIN', 'OPS_MANAGER', 'SHIFT_COORDINATOR', 'COMPLIANCE_OFFICER'],
  },
  {
    path: '/help',
    label: 'Help',
    icon: HelpOutline,
    requiresAuth: true,
    showInSidebar: true,
    section: 'bottom',
    allowedRoles: ['ADMIN', 'OPS_MANAGER', 'SHIFT_COORDINATOR', 'COMPLIANCE_OFFICER', 'CLIENT_ADMIN', 'CLIENT_USER'],
  },
  {
    path: '/logout',
    label: 'Logout',
    icon: Logout,
    requiresAuth: true,
    showInSidebar: true,
    section: 'bottom',
    allowedRoles: ['ADMIN', 'OPS_MANAGER', 'SHIFT_COORDINATOR', 'COMPLIANCE_OFFICER', 'CLIENT_ADMIN', 'CLIENT_USER'],
  },
  // Non-auth routes (not in sidebar)
  {
    path: '/login',
    label: 'Login',
    requiresAuth: false,
    showInSidebar: false,
  },
  {
    path: '/register',
    label: 'Register',
    requiresAuth: false,
    showInSidebar: false,
  },
];

export const mainNavRoutes = routes.filter(
  (r) => r.showInSidebar && r.section === 'main'
);

export const bottomNavRoutes = routes.filter(
  (r) => r.showInSidebar && r.section === 'bottom'
);

export const authRoutes = routes.filter((r) => r.requiresAuth);
export const publicRoutes = routes.filter((r) => !r.requiresAuth);

export function getRoutesForRole(role: UserRole | null): {
  main: RouteConfig[];
  bottom: RouteConfig[];
} {
  const filterByRole = (route: RouteConfig) => {
    if (!route.allowedRoles) return true;
    if (!role) return false;
    return route.allowedRoles.includes(role);
  };

  return {
    main: mainNavRoutes.filter(filterByRole),
    bottom: bottomNavRoutes.filter(filterByRole),
  };
}

export { AppRouter } from './AppRouter';
