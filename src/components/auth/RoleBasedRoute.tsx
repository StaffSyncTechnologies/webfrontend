import type { ReactNode } from 'react';
import { useAppSelector } from '../../store';
import type { User, Worker, ClientAuthUser } from '../../types/api';
import type { UserRole } from '../../utilities/roles';

function getUserRole(user: User | Worker | ClientAuthUser | null): UserRole | null {
  if (!user) return null;
  if ('role' in user) {
    return user.role as UserRole;
  }
  return 'WORKER';
}

interface RoleBasedRouteProps {
  clientComponent: ReactNode;
  adminComponent: ReactNode;
  children?: ReactNode;
}

export function RoleBasedRoute({ clientComponent, adminComponent, children }: RoleBasedRouteProps) {
  const { user } = useAppSelector((state: { auth: { user: User | Worker | ClientAuthUser | null } }) => state.auth);
  const role = getUserRole(user);

  // If it's a client role, show client component
  if (role === 'CLIENT_ADMIN' || role === 'CLIENT_USER') {
    return <>{clientComponent}</>;
  }

  // For admin/staff roles, show admin component
  if (role === 'ADMIN' || role === 'OPS_MANAGER' || role === 'SHIFT_COORDINATOR' || role === 'COMPLIANCE_OFFICER') {
    return <>{adminComponent}</>;
  }

  // For workers or unknown roles, show children or admin component as fallback
  return <>{children || adminComponent}</>;
}

export default RoleBasedRoute;
