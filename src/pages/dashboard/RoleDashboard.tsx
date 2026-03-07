import { useAppSelector } from '../../store';
import { useDocumentTitle } from '../../hooks';
import { AdminDashboard } from './AdminDashboard';
import { OpsManagerDashboard } from './OpsManagerDashboard';
import { ShiftCoordinatorDashboard } from './ShiftCoordinatorDashboard';
import { ComplianceOfficerDashboard } from './ComplianceOfficerDashboard';
import type { User, Worker } from '../../types/api';

type UserRole = 'ADMIN' | 'OPS_MANAGER' | 'SHIFT_COORDINATOR' | 'COMPLIANCE_OFFICER' | 'CLIENT_ADMIN' | 'CLIENT_USER' | 'WORKER';

function getUserRole(user: User | Worker | null): UserRole | null {
  if (!user) return null;
  if ('role' in user) {
    return user.role as UserRole;
  }
  return 'WORKER';
}

export function RoleDashboard() {
  useDocumentTitle('Dashboard');
  const { user } = useAppSelector((state: { auth: { user: User | Worker | null } }) => state.auth);
  const role = getUserRole(user);

  switch (role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'OPS_MANAGER':
      return <OpsManagerDashboard />;
    case 'SHIFT_COORDINATOR':
      return <ShiftCoordinatorDashboard />;
    case 'COMPLIANCE_OFFICER':
      return <ComplianceOfficerDashboard />;
    case 'CLIENT_ADMIN':
    case 'CLIENT_USER':
      // TODO: Create ClientDashboard
      return <AdminDashboard />;
    case 'WORKER':
      // TODO: Create WorkerDashboard
      return <AdminDashboard />;
    default:
      // Default to admin dashboard for demo
      return <AdminDashboard />;
  }
}

export default RoleDashboard;
