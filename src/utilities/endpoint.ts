/**
 * API Endpoints from UI/UX Design Guide
 * Centralized endpoint definitions for the StaffSync frontend
 */

/// <reference types="../vite-env" />

export const API_BASE = 'https://dev.staffsynctech.co.uk/api/v1';

// Dashboard endpoints
export const DASHBOARD = {
  ROLE_DASHBOARD: `${API_BASE}/dashboard/my-dashboard`,
  AGENCY_DASHBOARD: `${API_BASE}/dashboard`,
  STATS: `${API_BASE}/dashboard/stats`,
  RECENT_CLIENTS: `${API_BASE}/dashboard/recent-clients`,
  RECENT_WORKERS: `${API_BASE}/dashboard/recent-workers`,
  PENDING_APPROVALS: `${API_BASE}/dashboard/pending-approvals`,
  SHIFTS_OVERVIEW: `${API_BASE}/dashboard/shifts-overview`,
  // Admin dashboard endpoints
  ADMIN_STATS: `${API_BASE}/dashboard/admin/stats`,
  ADMIN_SHIFTS_BY_DAY: `${API_BASE}/dashboard/admin/shifts-by-day`,
  ADMIN_WORKERS_AVAILABILITY: `${API_BASE}/dashboard/admin/workers-availability`,
  ADMIN_RECENT_ACTIVITY: `${API_BASE}/dashboard/admin/recent-activity`,
} as const;

// Authentication endpoints
export const AUTH = {
  REGISTER: `${API_BASE}/auth/register`,
  LOGIN: `${API_BASE}/auth/login`,
  STAFF_LOGIN: `${API_BASE}/auth/staff/login`,
  WORKER_LOGIN: `${API_BASE}/auth/worker/login`,
  FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
  SEND_OTP: `${API_BASE}/auth/send-otp`,
  VERIFY_OTP: `${API_BASE}/auth/verify-otp`,
  WORKER_VERIFY_OTP: `${API_BASE}/auth/worker/verify-otp`,
  STAFF_INVITE_VALIDATE: (token: string) => `${API_BASE}/auth/staff-invite/${token}`,
  STAFF_INVITE_ACCEPT: (token: string) => `${API_BASE}/auth/staff-invite/${token}/accept`,
  VALIDATE_INVITE_CODE: `${API_BASE}/auth/validate-invite`,
  ACCEPT_INVITE_CODE: `${API_BASE}/auth/accept-invite`,
  WORKER_REGISTER: `${API_BASE}/auth/worker/register`,
  WORKER_DOCUMENTS: `${API_BASE}/auth/worker/documents`,
  WORKER_DOCUMENTS_GET: `${API_BASE}/auth/worker/documents`,
  WORKER_DOCUMENT_DELETE: (documentId: string) => `${API_BASE}/auth/worker/documents/${documentId}`,
  WORKER_PROFILE_PIC: `${API_BASE}/auth/worker/profile-pic`,
  WORKER_VERIFY_RTW: `${API_BASE}/auth/worker/verify-rtw`,
  WORKER_COMPLETE_ONBOARDING: `${API_BASE}/auth/worker/complete-onboarding`,
  ME: `${API_BASE}/auth/me`,
  UPDATE_ME: `${API_BASE}/auth/me`,
  CHANGE_PASSWORD: `${API_BASE}/auth/change-password`,
  LOGOUT: `${API_BASE}/auth/logout`,
} as const;

// User endpoints
export const USERS = {
  LIST: `${API_BASE}/users`,
  DETAIL: (userId: string) => `${API_BASE}/users/${userId}`,
  CREATE: `${API_BASE}/users`,
  UPDATE: (userId: string) => `${API_BASE}/users/${userId}`,
  DELETE: (userId: string) => `${API_BASE}/users/${userId}`,
  SUSPEND: (userId: string) => `${API_BASE}/users/${userId}/suspend`,
  REACTIVATE: (userId: string) => `${API_BASE}/users/${userId}/reactivate`,
  RESEND_INVITE: (userId: string) => `${API_BASE}/users/${userId}/resend-invite`,
  STAFF_WORKER_COUNTS: `${API_BASE}/users/staff/worker-counts`,
  UNASSIGNED_WORKERS: `${API_BASE}/users/workers/unassigned`,
  MY_MANAGED_WORKERS: `${API_BASE}/users/workers/my-team`,
  MANAGED_WORKERS: (managerId: string) => `${API_BASE}/users/${managerId}/managed-workers`,
  ASSIGN_WORKERS: (managerId: string) => `${API_BASE}/users/${managerId}/assign-workers`,
  UNASSIGN_WORKERS: `${API_BASE}/users/workers/unassign`,
  MY_CLIENTS: `${API_BASE}/users/clients/my-clients`,
  STAFF_CLIENTS: (staffId: string) => `${API_BASE}/users/${staffId}/clients`,
  ASSIGN_CLIENTS: (staffId: string) => `${API_BASE}/users/${staffId}/assign-clients`,
  UNASSIGN_CLIENTS: (staffId: string) => `${API_BASE}/users/${staffId}/unassign-clients`,
  CLIENT_STAFF: (clientCompanyId: string) => `${API_BASE}/users/client/${clientCompanyId}/staff`,
  CLIENT_WORKERS: (clientCompanyId: string) => `${API_BASE}/users/client/${clientCompanyId}/workers`,
} as const;

// Worker endpoints
export const WORKERS = {
  LIST: `${API_BASE}/workers`,
  LIST_STATS: `${API_BASE}/workers/list-stats`,
  HOME: `${API_BASE}/workers/home`,
  EXPORT: `${API_BASE}/workers/export`,
  INVITE: `${API_BASE}/workers/invite`,
  DETAIL: (workerId: string) => `${API_BASE}/workers/${workerId}`,
  STATS: (workerId: string) => `${API_BASE}/workers/${workerId}/stats`,
  SHIFTS: (workerId: string) => `${API_BASE}/workers/${workerId}/shifts`,
  PROFILE: (workerId: string) => `${API_BASE}/workers/${workerId}/profile`,
  SKILLS: (workerId: string) => `${API_BASE}/workers/${workerId}/skills`,
  RTW: (workerId: string) => `${API_BASE}/workers/${workerId}/rtw`,
  RTW_INITIATE: (workerId: string) => `${API_BASE}/workers/${workerId}/rtw/initiate`,
  RTW_UPDATE: (workerId: string) => `${API_BASE}/workers/${workerId}/rtw/update`,
  AVAILABILITY: (workerId: string) => `${API_BASE}/workers/${workerId}/availability`,
  DOCUMENTS: (workerId: string) => `${API_BASE}/workers/${workerId}/documents`,
  DOCUMENT: (workerId: string, docId: string) => `${API_BASE}/workers/${workerId}/documents/${docId}`,
  DOCUMENT_VERIFY: (workerId: string, docId: string) => `${API_BASE}/workers/${workerId}/documents/${docId}/verify`,
  BLOCKS: (workerId: string) => `${API_BASE}/workers/${workerId}/blocks`,
  BLOCK_LIFT: (workerId: string, blockId: string) => `${API_BASE}/workers/${workerId}/blocks/${blockId}/lift`,
  RELIABILITY: (workerId: string) => `${API_BASE}/workers/${workerId}/reliability`,
  CLIENTS: (workerId: string) => `${API_BASE}/workers/${workerId}/clients`,
  ASSIGN_CLIENT: (workerId: string) => `${API_BASE}/workers/${workerId}/assign-client`,
  TRANSFER: (workerId: string) => `${API_BASE}/workers/${workerId}/transfer`,
  REMOVE_CLIENT: (workerId: string) => `${API_BASE}/workers/${workerId}/remove-client`,
  BULK_ASSIGN_CLIENT: `${API_BASE}/workers/bulk-assign-client`,
  AVAILABLE_FOR_CLIENT: (clientCompanyId: string) => `${API_BASE}/workers/client/${clientCompanyId}/available`,
  SUSPEND: (workerId: string) => `${API_BASE}/workers/${workerId}/suspend`,
  REACTIVATE: (workerId: string) => `${API_BASE}/workers/${workerId}/reactivate`,
} as const;

// Worker Membership endpoints (multi-agency)
export const WORKER_MEMBERSHIP = {
  INVITE_BY_EMAIL: `${API_BASE}/worker/memberships/invite`,
  REMOVE: (membershipId: string) => `${API_BASE}/worker/memberships/${membershipId}`,
} as const;

// Shift endpoints
export const SHIFTS = {
  LIST: `${API_BASE}/shifts`,
  CREATE: `${API_BASE}/shifts`,
  MY_HISTORY: `${API_BASE}/shifts/my-history`,
  STAFF_HISTORY: `${API_BASE}/shifts/staff-history`,
  DETAIL: (shiftId: string) => `${API_BASE}/shifts/${shiftId}`,
  UPDATE: (shiftId: string) => `${API_BASE}/shifts/${shiftId}`,
  DELETE: (shiftId: string) => `${API_BASE}/shifts/${shiftId}`,
  ASSIGNMENTS: (shiftId: string) => `${API_BASE}/shifts/${shiftId}/assignments`,
  ASSIGNMENT: (shiftId: string, assignmentId: string) => `${API_BASE}/shifts/${shiftId}/assignments/${assignmentId}`,
  ACCEPT: (shiftId: string) => `${API_BASE}/shifts/${shiftId}/accept`,
  DECLINE: (shiftId: string) => `${API_BASE}/shifts/${shiftId}/decline`,
  CLOCK_IN: (shiftId: string) => `${API_BASE}/shifts/${shiftId}/clock-in`,
  CLOCK_OUT: (shiftId: string) => `${API_BASE}/shifts/${shiftId}/clock-out`,
  BROADCAST: (shiftId: string) => `${API_BASE}/shifts/${shiftId}/broadcast`,
  CANCEL: (shiftId: string) => `${API_BASE}/shifts/${shiftId}/cancel`,
} as const;

// Attendance endpoints
export const ATTENDANCE = {
  MY_STATUS: `${API_BASE}/attendance/my-status`,
  MY_HISTORY: `${API_BASE}/attendance/my-history`,
  FLAGGED: `${API_BASE}/attendance/flagged`,
  DAILY_TIMESHEET: `${API_BASE}/attendance/timesheet/daily`,
  SHIFT_ATTENDANCE: (shiftId: string) => `${API_BASE}/attendance/shift/${shiftId}`,
  CLOCK_IN: (shiftId: string) => `${API_BASE}/attendance/${shiftId}/clock-in`,
  CLOCK_OUT: (shiftId: string) => `${API_BASE}/attendance/${shiftId}/clock-out`,
  APPROVE: (attendanceId: string) => `${API_BASE}/attendance/${attendanceId}/approve`,
  FLAG: (attendanceId: string) => `${API_BASE}/attendance/${attendanceId}/flag`,
} as const;

// Payroll/Payslip endpoints
export const PAYROLL = {
  ADMIN_LIST: `${API_BASE}/payslips/admin/list`,
  GENERATE: `${API_BASE}/payslips/generate`,
  BULK_APPROVE: `${API_BASE}/payslips/bulk-approve`,
  TEAM_SUMMARY: `${API_BASE}/payslips/team-summary`,
  DETAIL: (payslipId: string) => `${API_BASE}/payslips/${payslipId}`,
  APPROVE: (payslipId: string) => `${API_BASE}/payslips/${payslipId}/approve`,
  MARK_PAID: (payslipId: string) => `${API_BASE}/payslips/${payslipId}/mark-paid`,
  WORKER_PAYSLIP: (workerId: string) => `${API_BASE}/payslips/worker/${workerId}`,
  MY_PAYSLIP: `${API_BASE}/payslips/my-payslip`,
  LIST: `${API_BASE}/payslips/list`,
} as const;

// Holiday/Leave endpoints
export const HOLIDAY = {
  LIST: `${API_BASE}/holidays`,
  ENTITLEMENT: `${API_BASE}/holidays/entitlement`,
  CREATE: `${API_BASE}/holidays`,
  DETAIL: (id: string) => `${API_BASE}/holidays/${id}`,
  CANCEL: (id: string) => `${API_BASE}/holidays/${id}/cancel`,
  ADMIN_REQUESTS: `${API_BASE}/holidays/admin/requests`,
  GRANT: `${API_BASE}/holidays/grant`,
  REVIEW: (id: string) => `${API_BASE}/holidays/${id}/review`,
  UPDATE_ENTITLEMENT: (workerId: string) => `${API_BASE}/holidays/entitlement/${workerId}`,
} as const;

// HR Management endpoints
export const HR = {
  MANAGER_STATS: `${API_BASE}/hr/managers/stats`,
  LIST_MANAGERS: `${API_BASE}/hr/managers`,
  EXPORT_MANAGERS: `${API_BASE}/hr/managers/export`,
  GET_MANAGER: (managerId: string) => `${API_BASE}/hr/managers/${managerId}`,
  UPDATE_MANAGER_STATUS: (managerId: string) => `${API_BASE}/hr/managers/${managerId}/status`,
  DELETE_MANAGER: (managerId: string) => `${API_BASE}/hr/managers/${managerId}`,
  STAFF_WORKER_COUNTS: `${API_BASE}/hr/staff/worker-counts`,
  UNASSIGNED_WORKERS: `${API_BASE}/hr/workers/unassigned`,
  MY_TEAM: `${API_BASE}/hr/workers/my-team`,
  MANAGED_WORKERS: (managerId: string) => `${API_BASE}/hr/${managerId}/managed-workers`,
  ASSIGN_WORKERS: (managerId: string) => `${API_BASE}/hr/${managerId}/assign-workers`,
  UNASSIGN_WORKERS: `${API_BASE}/hr/workers/unassign`,
} as const;

// Client portal endpoints
export const CLIENT = {
  BASE_URL: `${API_BASE}/client`,
  
  // Authentication
  LOGIN: `${API_BASE}/client/auth/login`,
  FORGOT_PASSWORD: `${API_BASE}/client/auth/forgot-password`,
  
  // Agency management
  AGENCIES: `${API_BASE}/client/agencies`,
  SWITCH_AGENCY: `${API_BASE}/client/switch-agency`,
  
  // Dashboard
  DASHBOARD: `${API_BASE}/client/dashboard`,
  
  // Workers
  WORKERS: `${API_BASE}/client/workers`,
  WORKER_PROFILE: (workerId: string) => `${API_BASE}/client/workers/${workerId}`,
  RATE_WORKER: (workerId: string) => `${API_BASE}/client/workers/${workerId}/rate`,
  BLOCK_WORKER: (workerId: string) => `${API_BASE}/client/workers/${workerId}/block`,
  
  // Shifts / Bookings
  SHIFTS: `${API_BASE}/client/shifts`,
  SHIFT_DETAILS: (shiftId: string) => `${API_BASE}/client/shifts/${shiftId}`,
  REQUEST_WORKERS: `${API_BASE}/client/shifts/request`,
  CANCEL_SHIFT: (shiftId: string) => `${API_BASE}/client/shifts/${shiftId}/cancel`,
  
  // Timesheets
  TIMESHEETS: `${API_BASE}/client/timesheets`,
  WEEKLY_TIMESHEETS: `${API_BASE}/client/timesheets/weekly`,
  WEEKLY_TIMESHEET_DETAILS: `${API_BASE}/client/timesheets/weekly/details`,
  TIMESHEET_DETAILS: (timesheetId: string) => `${API_BASE}/client/timesheets/${timesheetId}`,
  APPROVE_TIMESHEET: (timesheetId: string) => `${API_BASE}/client/timesheets/${timesheetId}/approve`,
  DISPUTE_TIMESHEET: (timesheetId: string) => `${API_BASE}/client/timesheets/${timesheetId}/dispute`,
  
  // Invoices
  INVOICES: `${API_BASE}/client/invoices`,
  GENERATE_INVOICE: `${API_BASE}/client/invoices/generate`,
  INVOICE_DETAILS: (invoiceId: string) => `${API_BASE}/client/invoices/${invoiceId}`,
  DOWNLOAD_INVOICE: (invoiceId: string) => `${API_BASE}/client/invoices/${invoiceId}/download`,
  
  // Reports
  HOURS_REPORT: `${API_BASE}/client/reports/hours`,
  SPEND_REPORT: `${API_BASE}/client/reports/spend`,
  
  // Settings
  SETTINGS: `${API_BASE}/client/settings`,
  
  // Users (client company users)
  CLIENT_USERS: `${API_BASE}/client/users`,
  CLIENT_USER: (userId: string) => `${API_BASE}/client/users/${userId}`,
} as const;

// Client registration endpoints
export const CLIENT_REGISTRATION = {
  VALIDATE_CODE: `${API_BASE}/client-registration/validate-code`,
  REGISTER: `${API_BASE}/client-registration/register`,
  VERIFY_EMAIL: `${API_BASE}/client-registration/verify-email`,
  JOIN_AGENCY: `${API_BASE}/enhanced-client-registration/join-agency`,
  RESEND_VERIFICATION: `${API_BASE}/client-registration/resend-verification`,
  AGENCY_INFO: (inviteCode: string) => `${API_BASE}/client-registration/agency/${inviteCode}`,
} as const;

// Organization endpoints
export const ORGANIZATION = {
  CURRENT: `${API_BASE}/organizations/current`,
  SETTINGS: `${API_BASE}/organizations/current/settings`,
  BRANDING: `${API_BASE}/organizations/current/branding`,
  CLIENTS: `${API_BASE}/organizations/current/clients`,
  CREATE_CLIENT: `${API_BASE}/organizations/current/clients`,
  CLIENT_DETAIL: (clientId: string) => `${API_BASE}/organizations/current/clients/${clientId}`,
  CLIENT_USERS: (clientId: string) => `${API_BASE}/organizations/current/clients/${clientId}/users`,
  CLIENT_USER_RESEND_INVITE: (clientId: string, userId: string) => `${API_BASE}/organizations/current/clients/${clientId}/users/${userId}/resend-invite`,
  CLIENT_PAY_RATES: (clientId: string) => `${API_BASE}/organizations/current/clients/${clientId}/pay-rates`,
  INVITE_CODES: `${API_BASE}/organizations/current/invite-codes`,
  INVITE_CODE: (codeId: string) => `${API_BASE}/organizations/current/invite-codes/${codeId}`,
} as const;

// Bank Account & Payment Sheet endpoints
export const BANK_ACCOUNT = {
  LIST: `${API_BASE}/bank-account/list`,
  ME: `${API_BASE}/bank-account/me`,
  WORKER: (workerId: string) => `${API_BASE}/bank-account/worker/${workerId}`,
  WORKER_UPDATE: (workerId: string) => `${API_BASE}/bank-account/worker/${workerId}`,
  VERIFY: (workerId: string) => `${API_BASE}/bank-account/worker/${workerId}/verify`,
  PAYMENT_SHEET: `${API_BASE}/bank-account/payment-sheet`,
  PAYMENT_SHEET_SUMMARY: `${API_BASE}/bank-account/payment-sheet/summary`,
} as const;

// Payslip endpoints
export const PAYSLIPS = {
  LIST: `${API_BASE}/payslips/list`,
  MY_PAYSLIP: `${API_BASE}/payslips/my-payslip`,
  TEAM_SUMMARY: `${API_BASE}/payslips/team-summary`,
  WORKER_PAYSLIPS: (workerId: string) => `${API_BASE}/payslips/worker/${workerId}`,
  ADMIN_LIST: `${API_BASE}/payslips/admin/list`,
  GENERATE: `${API_BASE}/payslips/generate`,
  BULK_APPROVE: `${API_BASE}/payslips/bulk-approve`,
  DETAIL: (payslipId: string) => `${API_BASE}/payslips/${payslipId}`,
  APPROVE: (payslipId: string) => `${API_BASE}/payslips/${payslipId}/approve`,
  MARK_PAID: (payslipId: string) => `${API_BASE}/payslips/${payslipId}/mark-paid`,
} as const;

// Holiday/Leave endpoints
export const HOLIDAYS = {
  LIST: `${API_BASE}/holidays`,
  ENTITLEMENT: `${API_BASE}/holidays/entitlement`,
  CREATE: `${API_BASE}/holidays`,
  DETAIL: (holidayId: string) => `${API_BASE}/holidays/${holidayId}`,
  CANCEL: (holidayId: string) => `${API_BASE}/holidays/${holidayId}/cancel`,
  ADMIN_REQUESTS: `${API_BASE}/holidays/admin/requests`,
  WORKER_HOLIDAYS: (workerId: string) => `${API_BASE}/holidays?workerId=${workerId}`,
  GRANT: `${API_BASE}/holidays/grant`,
  REVIEW: (holidayId: string) => `${API_BASE}/holidays/${holidayId}/review`,
  UPDATE_ENTITLEMENT: (workerId: string) => `${API_BASE}/holidays/entitlement/${workerId}`,
} as const;

// Skills endpoints
export const SKILLS = {
  LIST: `${API_BASE}/skills`,
  CREATE: `${API_BASE}/skills`,
  CATEGORIES: `${API_BASE}/skills/categories`,
  BY_CATEGORY: (category: string) => `${API_BASE}/skills/category/${category}`,
  UPDATE: (skillId: string) => `${API_BASE}/skills/${skillId}`,
  DELETE: (skillId: string) => `${API_BASE}/skills/${skillId}`,
} as const;

// Onboarding endpoints
export const ONBOARDING = {
  STATUS: `${API_BASE}/onboarding/status`,
  BRANDING: `${API_BASE}/onboarding/branding`,
  LOCATION: `${API_BASE}/onboarding/location`,
  WORKER_INVITE: `${API_BASE}/onboarding/worker/invite`,
  CLIENT: `${API_BASE}/onboarding/client`,
  TEAM_INVITE: `${API_BASE}/onboarding/team/invite`,
  SKIP: `${API_BASE}/onboarding/skip`,
  COMPLETE: `${API_BASE}/onboarding/complete`,
} as const;

// Reports endpoints
export const REPORTS = {
  WORKFORCE: `${API_BASE}/reports/workforce`,
  RELIABILITY: `${API_BASE}/reports/reliability`,
  SHIFTS: `${API_BASE}/reports/shifts`,
  ATTENDANCE: `${API_BASE}/reports/attendance`,
  PAYROLL: `${API_BASE}/reports/payroll`,
  CLIENTS: `${API_BASE}/reports/clients`,
  COMPLIANCE: `${API_BASE}/reports/compliance`,
  EXECUTIVE_SUMMARY: `${API_BASE}/reports/executive-summary`,
} as const;

// Notification endpoints
export const NOTIFICATIONS = {
  LIST: `${API_BASE}/notifications`,
  UNREAD_COUNT: `${API_BASE}/notifications/unread-count`,
  MARK_READ: (notificationId: string) => `${API_BASE}/notifications/${notificationId}/read`,
  MARK_ALL_READ: `${API_BASE}/notifications/read-all`,
  REGISTER_DEVICE: `${API_BASE}/notifications/register-device`,
  DEACTIVATE_DEVICE: `${API_BASE}/notifications/deactivate-device`,
  PREFERENCES: `${API_BASE}/notifications/preferences`,
  PREFERENCES_BULK: `${API_BASE}/notifications/preferences/bulk`,
} as const;

// Shift endpoints (additional ones not in SHIFTS)
export const SHIFT_MANAGEMENT = {
  MY_HISTORY: `${API_BASE}/shifts/my-history`,
  BROADCAST: (shiftId: string) => `${API_BASE}/shifts/${shiftId}/broadcast`,
} as const;

// User management endpoints
export const USER_MANAGEMENT = {
  PROFILE: `${API_BASE}/users/profile`,
  UPDATE_PROFILE: `${API_BASE}/users/profile`,
  CHANGE_PASSWORD: `${API_BASE}/users/change-password`,
} as const;

// Attendance management endpoints
export const ATTENDANCE_MANAGEMENT = {
  MY_STATUS: `${API_BASE}/attendance/my-status`,
  MY_HISTORY: `${API_BASE}/attendance/my-history`,
  DAILY_TIMESHEET: `${API_BASE}/attendance/timesheet/daily`,
  CLOCK_IN: (shiftId: string) => `${API_BASE}/attendance/${shiftId}/clock-in`,
  CLOCK_OUT: (shiftId: string) => `${API_BASE}/attendance/${shiftId}/clock-out`,
} as const;

// Timesheet endpoints
export const TIMESHEET = {
  STATS: `${API_BASE}/attendance/timesheet/stats`,
  LIST: `${API_BASE}/attendance/timesheet/list`,
  DETAIL: (attendanceId: string) => `${API_BASE}/attendance/timesheet/${attendanceId}`,
  BULK_APPROVE: `${API_BASE}/attendance/timesheet/bulk-approve`,
  EXPORT: `${API_BASE}/attendance/timesheet/export`,
  APPROVE: (attendanceId: string) => `${API_BASE}/attendance/${attendanceId}/approve`,
  FLAG: (attendanceId: string) => `${API_BASE}/attendance/${attendanceId}/flag`,
} as const;

// Invite Code Request endpoints
export const INVITE_REQUESTS = {
  LIST: `${API_BASE}/agencies/invite-requests`,
  REVIEW: (id: string) => `${API_BASE}/agencies/invite-requests/${id}`,
} as const;

// Chat endpoints
export const CHAT = {
  ROOMS: `${API_BASE}/chat/rooms`,
  GET_OR_CREATE_ROOM: `${API_BASE}/chat/rooms`,
  ROOM_MESSAGES: (roomId: string) => `${API_BASE}/chat/rooms/${roomId}/messages`,
  MARK_ROOM_READ: (roomId: string) => `${API_BASE}/chat/rooms/${roomId}/read`,
  UNREAD_COUNT: `${API_BASE}/chat/unread-count`,
  ASSIGNED_WORKERS: `${API_BASE}/chat/workers`,
} as const;