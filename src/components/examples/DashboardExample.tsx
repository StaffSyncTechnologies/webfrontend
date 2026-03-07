import React from 'react';
import { 
  useGetRoleDashboardQuery, 
  useGetAgencyDashboardQuery,
  useGetStatsQuery,
  useGetRecentClientsQuery,
  useGetRecentWorkersQuery,
  useGetPendingApprovalsQuery,
  useGetShiftsOverviewQuery
} from '../../store/slices/dashboardSlice';
import { useAuth } from '../../hooks/useAuth';

export const DashboardExample: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Role-based dashboard - adapts to user role
  const { data: roleDashboard, isLoading: roleLoading, error: roleError } = useGetRoleDashboardQuery();
  
  // Agency dashboard (admin only)
  const { data: agencyDashboard, isLoading: agencyLoading } = useGetAgencyDashboardQuery();
  
  // General stats
  const { data: stats, isLoading: statsLoading } = useGetStatsQuery();
  
  // Recent data
  const { data: recentClients } = useGetRecentClientsQuery({ limit: 5 });
  const { data: recentWorkers } = useGetRecentWorkersQuery({ limit: 5 });
  
  // Pending approvals
  const { data: pendingApprovals } = useGetPendingApprovalsQuery();
  
  // Shifts overview
  const { data: shiftsOverview } = useGetShiftsOverviewQuery({ period: 'week' });

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Please log in to view your dashboard</h2>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading your dashboard...</h2>
      </div>
    );
  }

  if (roleError) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h2>Error loading dashboard</h2>
        <p>Please try again later.</p>
      </div>
    );
  }

  const renderRoleSpecificDashboard = () => {
    if (!roleDashboard) return null;

    const { user: userInfo, dashboardData } = roleDashboard;

    switch (userInfo.role) {
      case 'ADMIN':
        return <AdminDashboardView data={dashboardData as AdminDashboard} />;
      case 'OPS_MANAGER':
        return <OpsManagerDashboardView data={dashboardData as OpsManagerDashboard} />;
      case 'SHIFT_COORDINATOR':
        return <ShiftCoordinatorDashboardView data={dashboardData as ShiftCoordinatorDashboard} />;
      case 'COMPLIANCE_OFFICER':
        return <ComplianceOfficerDashboardView data={dashboardData as ComplianceOfficerDashboard} />;
      case 'CLIENT_ADMIN':
      case 'CLIENT_USER':
        return <ClientDashboardView data={dashboardData as ClientDashboard} />;
      case 'WORKER':
        return <WorkerDashboardView data={dashboardData as WorkerDashboard} />;
      default:
        return <div>Unknown role: {userInfo.role}</div>;
    }
  };

  return (
    <div className="dashboard-example" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1>Welcome back, {user?.fullName}!</h1>
        <p style={{ color: '#666' }}>Role: {user?.role}</p>
      </div>

      {/* Role-specific dashboard */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Your Dashboard</h2>
        {renderRoleSpecificDashboard()}
      </div>

      {/* Agency dashboard for admins */}
      {user?.role === 'ADMIN' && (
        <div style={{ marginBottom: '40px' }}>
          <h2>Agency Overview</h2>
          {agencyLoading ? (
            <p>Loading agency data...</p>
          ) : agencyDashboard ? (
            <AgencyDashboardView data={agencyDashboard} />
          ) : null}
        </div>
      )}

      {/* General stats */}
      {stats && (
        <div style={{ marginBottom: '40px' }}>
          <h2>Platform Statistics</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px' 
          }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f0f8ff', 
              borderRadius: '8px', 
              textAlign: 'center' 
            }}>
              <h3>{stats.workers.total}</h3>
              <p>Total Workers</p>
              <small>{stats.workers.active} active</small>
            </div>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f0fff0', 
              borderRadius: '8px', 
              textAlign: 'center' 
            }}>
              <h3>{stats.clients.total}</h3>
              <p>Total Clients</p>
              <small>{stats.clients.recent} new this month</small>
            </div>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#fff0f0', 
              borderRadius: '8px', 
              textAlign: 'center' 
            }}>
              <h3>{stats.shifts.today}</h3>
              <p>Shifts Today</p>
              <small>{stats.shifts.thisWeek} this week</small>
            </div>
            {stats.revenue && (
              <div style={{ 
                padding: '20px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '8px', 
                textAlign: 'center' 
              }}>
                <h3>${stats.revenue.thisMonth.toLocaleString()}</h3>
                <p>Revenue This Month</p>
                <small>{stats.revenue.lastMonth > 0 ? 
                  `${((stats.revenue.thisMonth - stats.revenue.lastMonth) / stats.revenue.lastMonth * 100).toFixed(1)}% vs last month` 
                  : 'No comparison'}</small>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Recent clients */}
        {recentClients && recentClients.length > 0 && (
          <div>
            <h3>Recent Clients</h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
              {recentClients.map((client: any, index: number) => (
                <div key={index} style={{ 
                  padding: '10px 0', 
                  borderBottom: index < recentClients.length - 1 ? '1px solid #eee' : 'none' 
                }}>
                  <strong>{client.companyName || client.name}</strong>
                  <br />
                  <small style={{ color: '#666' }}>
                    {client.email} • Joined {new Date(client.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent workers */}
        {recentWorkers && recentWorkers.length > 0 && (
          <div>
            <h3>Recent Workers</h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
              {recentWorkers.map((worker: any, index: number) => (
                <div key={index} style={{ 
                  padding: '10px 0', 
                  borderBottom: index < recentWorkers.length - 1 ? '1px solid #eee' : 'none' 
                }}>
                  <strong>{worker.fullName}</strong>
                  <br />
                  <small style={{ color: '#666' }}>
                    {worker.email} • Joined {new Date(worker.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pending approvals */}
      {pendingApprovals && pendingApprovals.total > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Pending Approvals</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '15px' 
          }}>
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#fff3cd', 
              borderRadius: '8px', 
              textAlign: 'center' 
            }}>
              <h4>{pendingApprovals.workers}</h4>
              <p>Workers</p>
            </div>
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#d1ecf1', 
              borderRadius: '8px', 
              textAlign: 'center' 
            }}>
              <h4>{pendingApprovals.timesheets}</h4>
              <p>Timesheets</p>
            </div>
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#f8d7da', 
              borderRadius: '8px', 
              textAlign: 'center' 
            }}>
              <h4>{pendingApprovals.clients}</h4>
              <p>Clients</p>
            </div>
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#e2e3e5', 
              borderRadius: '8px', 
              textAlign: 'center' 
            }}>
              <h4>{pendingApprovals.total}</h4>
              <p>Total</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Role-specific dashboard components
const AdminDashboardView: React.FC<{ data: AdminDashboard }> = ({ data }) => (
  <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
    <h3>Admin Dashboard</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
      <div>
        <h4>System Health</h4>
        <p>API: {data.systemHealth.apiStatus}</p>
        <p>Database: {data.systemHealth.databaseStatus}</p>
        <p>Last Backup: {new Date(data.systemHealth.lastBackup).toLocaleDateString()}</p>
      </div>
      <div>
        <h4>Pending Approvals</h4>
        <p>Total: {data.pendingApprovals.total}</p>
        <p>Workers: {data.pendingApprovals.workers}</p>
        <p>Timesheets: {data.pendingApprovals.timesheets}</p>
      </div>
    </div>
  </div>
);

const OpsManagerDashboardView: React.FC<{ data: OpsManagerDashboard }> = ({ data }) => (
  <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
    <h3>Operations Dashboard</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
      <div>
        <h4>Shift Overview</h4>
        <p>Active: {data.overview.activeShifts}</p>
        <p>Workers on Shift: {data.overview.workersOnShift}</p>
        <p>Unfilled: {data.overview.unfilledShifts}</p>
      </div>
      <div>
        <h4>Worker Utilization</h4>
        <p>Total: {data.workerUtilization.totalWorkers}</p>
        <p>Active: {data.workerUtilization.activeWorkers}</p>
        <p>Rate: {data.workerUtilization.utilizationRate}%</p>
      </div>
    </div>
  </div>
);

const ShiftCoordinatorDashboardView: React.FC<{ data: ShiftCoordinatorDashboard }> = ({ data }) => (
  <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
    <h3>Shift Coordinator Dashboard</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
      <div>
        <h4>My Shifts</h4>
        <p>Today: {data.myShifts.today.length}</p>
        <p>This Week: {data.myShifts.thisWeek.length}</p>
        <p>Upcoming: {data.myShifts.upcoming.length}</p>
      </div>
      <div>
        <h4>Worker Availability</h4>
        <p>Available: {data.workerAvailability.availableWorkers}</p>
        <p>Total: {data.workerAvailability.totalWorkers}</p>
        <p>In-demand Skills: {data.workerAvailability.inDemandSkills.join(', ')}</p>
      </div>
    </div>
  </div>
);

const ComplianceOfficerDashboardView: React.FC<{ data: ComplianceOfficerDashboard }> = ({ data }) => (
  <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
    <h3>Compliance Dashboard</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
      <div>
        <h4>Compliance Overview</h4>
        <p>Compliant: {data.complianceOverview.compliantWorkers}</p>
        <p>Pending: {data.complianceOverview.pendingVerification}</p>
        <p>Expired: {data.complianceOverview.expiredDocuments}</p>
      </div>
      <div>
        <h4>Recent Issues</h4>
        <p>Violations: {data.recentViolations.length}</p>
        <p>Upcoming Audits: {data.upcomingAudits.length}</p>
        <p>Document Alerts: {data.documentAlerts.length}</p>
      </div>
    </div>
  </div>
);

const ClientDashboardView: React.FC<{ data: ClientDashboard }> = ({ data }) => (
  <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
    <h3>Client Dashboard</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
      <div>
        <h4>Overview</h4>
        <p>Active Workers: {data.myDashboard.activeWorkers}</p>
        <p>Upcoming Shifts: {data.myDashboard.upcomingShifts}</p>
        <p>Pending Timesheets: {data.myDashboard.pendingTimesheets}</p>
        <p>Hours This Month: {data.myDashboard.totalHoursThisMonth}</p>
      </div>
      <div>
        <h4>Recent Activity</h4>
        <p>Recent Shifts: {data.recentShifts.length}</p>
        <p>Pending Timesheets: {data.pendingTimesheets.length}</p>
        <p>Open Invoices: {data.openInvoices.length}</p>
      </div>
    </div>
  </div>
);

const WorkerDashboardView: React.FC<{ data: WorkerDashboard }> = ({ data }) => (
  <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
    <h3>Worker Dashboard</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
      <div>
        <h4>My Shifts</h4>
        <p>Upcoming: {data.myShifts.upcoming.length}</p>
        <p>Completed: {data.myShifts.completed.length}</p>
        <p>Available: {data.myShifts.available.length}</p>
      </div>
      <div>
        <h4>My Earnings</h4>
        <p>This Week: ${data.myEarnings.thisWeek}</p>
        <p>This Month: ${data.myEarnings.thisMonth}</p>
        <p>Year to Date: ${data.myEarnings.yearToDate}</p>
      </div>
      <div>
        <h4>My Documents</h4>
        <p>Verified: {data.myDocuments.verified}</p>
        <p>Pending: {data.myDocuments.pending}</p>
        <p>Expired: {data.myDocuments.expired}</p>
      </div>
    </div>
  </div>
);

const AgencyDashboardView: React.FC<{ data: AdminDashboard }> = ({ data }) => (
  <div style={{ backgroundColor: '#e8f4fd', padding: '20px', borderRadius: '8px' }}>
    <h3>Agency Overview</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
      <div>
        <h4>Platform Statistics</h4>
        <p>Total Workers: {data.overview.workers.total}</p>
        <p>Active Workers: {data.overview.workers.active}</p>
        <p>Total Clients: {data.overview.clients.total}</p>
        <p>Recent Clients: {data.overview.clients.recent}</p>
      </div>
      <div>
        <h4>System Status</h4>
        <p>API Status: {data.systemHealth.apiStatus}</p>
        <p>Database Status: {data.systemHealth.databaseStatus}</p>
        <p>Last Backup: {new Date(data.systemHealth.lastBackup).toLocaleDateString()}</p>
      </div>
      <div>
        <h4>Recent Activity</h4>
        <p>Recent Activities: {data.recentActivity.length}</p>
        <p>Pending Approvals: {data.pendingApprovals.total}</p>
      </div>
    </div>
  </div>
);
