import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '../components/auth';
import { 
  Login, 
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

export function AppRouter() {
  return (
    <BrowserRouter>
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
          path="/shifts"
          element={
            <ProtectedRoute>
              <ShiftsPage />
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
          path="/workers"
          element={
            <ProtectedRoute>
              <WorkersPage />
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
          path="/timesheet"
          element={
            <ProtectedRoute>
              <TimesheetPage />
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
              <InvoicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
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
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
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
        {/* Fallback for unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
