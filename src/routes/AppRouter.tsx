import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '../components/auth';
import { AuthGuard } from '../components/auth/AuthGuard';
import { RoleBasedRoute } from '../components/auth/RoleBasedRoute';
import { 
  Login, 
  ClientLogin,
  Register, 
  NotFound, 
  RoleDashboard,
  ShiftsPage,
  WorkersPage,
  ClientsPage,
  SchedulePage,
  PayrollPage,
  BankAccountsPage,
  HRManagementPage,
  HolidayPage,
  ChatPage,
  TimesheetPage,
  InvoicesPage,
  ReportsPage,
  CompliancePage,
  SettingsPage,
  HelpPage,
  ContactUsPage,
  InviteRequestsPage,
} from '../pages';
import { 
  ClientWorkersPage,
  ClientShiftsPage,
  RequestShiftPage,
  ClientTimesheetsPage,
  ClientInvoicesPage,
  ClientReportsPage,
  ClientSettingsPage,
  ClientShiftDetailsPage,
} from '../pages/client/index';
import { BillingPage } from '../pages/settings';
import { CreateShift, ShiftDetails, EditShift } from '../pages/shifts';
import { WorkerDetails } from '../pages/workers';
import { ClientDetails, ClientTimesheetPage } from '../pages/clients';
import { TimesheetDetails } from '../pages/timesheet';
import { ManagerDetails } from '../pages/hr-management';
import { PayslipDetail } from '../pages/payroll';
import { HolidayDetails } from '../pages/holiday';
import Homepage from '../pages/homepage';
import WatchDemo from '../pages/watchdemo';
import OnboardingFlow from '../pages/auth/onboarding';
import ForgotPasswordPage from '../pages/auth/forgotPassword';
import ResetPasswordPage from '../pages/auth/resetPassword';
import { AcceptInvite, CompleteRegistration } from '../pages/auth';
import { EnhancedClientOnboarding } from '../pages/auth/EnhancedClientOnboarding';

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthGuard>
        <Routes>
          {/* Homepage - accessible to all users */}
          <Route
            path="/"
            element={<Homepage />}
          />
          {/* Public routes - no auth required */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/client-login"
            element={
              <PublicRoute>
                <ClientLogin />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/contact-us"
            element={
              <PublicRoute>
                <ContactUsPage />
              </PublicRoute>
            }
          />
          <Route
            path="/watch-demo"
            element={
              <PublicRoute>
                <WatchDemo />
              </PublicRoute>
            }
          />
          <Route
            path="/get-started"
            element={
              <PublicRoute>
                <OnboardingFlow />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            }
          />

          {/* Team Invite Flow */}
          <Route
            path="/accept-invite"
            element={
              <PublicRoute>
                <AcceptInvite type="team" />
              </PublicRoute>
            }
          />
          <Route
            path="/accept-invite/complete"
            element={
              <PublicRoute>
                <CompleteRegistration type="team" />
              </PublicRoute>
            }
          />

          {/* Enhanced Client Onboarding (multi-agency) */}
          <Route
            path="/client/onboarding"
            element={
              <PublicRoute>
                <EnhancedClientOnboarding />
              </PublicRoute>
            }
          />

          {/* Client Invite Flow */}
          <Route
            path="/client/register"
            element={
              <PublicRoute>
                <AcceptInvite type="client" />
              </PublicRoute>
            }
          />
          <Route
            path="/client/register/complete"
            element={
              <PublicRoute>
                <CompleteRegistration type="client" />
              </PublicRoute>
            }
          />

          {/* Protected routes - auth required */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workers"
            element={
              <ProtectedRoute>
                <RoleBasedRoute
                  clientComponent={<ClientWorkersPage />}
                  adminComponent={<WorkersPage />}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workers/:id"
            element={
              <ProtectedRoute>
                <WorkerDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shifts"
            element={
              <ProtectedRoute>
                <RoleBasedRoute
                  clientComponent={<ClientShiftsPage />}
                  adminComponent={<ShiftsPage />}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shifts/create"
            element={
              <ProtectedRoute>
                <CreateShift />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shifts/:id"
            element={
              <ProtectedRoute>
                <ShiftDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shifts/:id/edit"
            element={
              <ProtectedRoute>
                <EditShift />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timesheet"
            element={
              <ProtectedRoute>
                <RoleBasedRoute
                  clientComponent={<ClientTimesheetsPage />}
                  adminComponent={<TimesheetPage />}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timesheet/:id"
            element={
              <ProtectedRoute>
                <TimesheetDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <RoleBasedRoute
                  clientComponent={<ClientInvoicesPage />}
                  adminComponent={<InvoicesPage />}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <RoleBasedRoute
                  clientComponent={<ClientReportsPage />}
                  adminComponent={<ReportsPage />}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <RoleBasedRoute
                  clientComponent={<ClientSettingsPage />}
                  adminComponent={<SettingsPage />}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <ClientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/:id"
            element={
              <ProtectedRoute>
                <ClientDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/:id/timesheet"
            element={
              <ProtectedRoute>
                <ClientTimesheetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <SchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll"
            element={
              <ProtectedRoute>
                <PayrollPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll/:payslipId"
            element={
              <ProtectedRoute>
                <PayslipDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bank-accounts"
            element={
              <ProtectedRoute>
                <BankAccountsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr-management"
            element={
              <ProtectedRoute>
                <HRManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr-management/:managerId"
            element={
              <ProtectedRoute>
                <ManagerDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/holiday"
            element={
              <ProtectedRoute>
                <HolidayPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/holiday/:id"
            element={
              <ProtectedRoute>
                <HolidayDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compliance"
            element={
              <ProtectedRoute>
                <CompliancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/billing"
            element={
              <ProtectedRoute>
                <BillingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invite-requests"
            element={
              <ProtectedRoute>
                <InviteRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <HelpPage />
              </ProtectedRoute>
            }
          />
          {/* client management */}
          <Route
          path="/client/shifts"
          element={
            <ProtectedRoute>
              <ClientShiftsPage/>
            </ProtectedRoute>
          }
          />
          <Route
          path="/client/shifts/request"
          element={
            <ProtectedRoute>
              <RequestShiftPage/>
            </ProtectedRoute>
          }
          />
          <Route
          path="/client/shifts/:id"
          element={
            <ProtectedRoute>
              <ClientShiftDetailsPage/>
            </ProtectedRoute>
          }
          />
          <Route
          path="/client/invoices"
          element={
            <ProtectedRoute>
            <ClientInvoicesPage/>
            </ProtectedRoute>
           
          }
          />
          <Route
          path="/client/settings"
          element={
            <ProtectedRoute>
              <ClientSettingsPage/>
            </ProtectedRoute>
          }
          />
          <Route
          path="/client/workers"
          element={
            <ProtectedRoute>
              <ClientWorkersPage/>
            </ProtectedRoute>
          }
          />
          <Route
          path="/client/reports"
          element={
            <ProtectedRoute>
              <ClientReportsPage/>
            </ProtectedRoute>
          }
          />
          <Route
          path="/client/timesheets"
          element={
            <ProtectedRoute>
              <ClientTimesheetsPage/>
            </ProtectedRoute>
          }
          />
          {/* Fallback for unknown routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  );
}

export default AppRouter;
