/**
 * API Endpoints from UI/UX Design Guide
 * Centralized endpoint definitions for the StaffSync frontend
 */

/// <reference types="../vite-env" />

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Dashboard endpoints
export const DASHBOARD = {
  ROLE_DASHBOARD: `${API_BASE}/api/v1/dashboard/my-dashboard`,
  AGENCY_DASHBOARD: `${API_BASE}/api/v1/dashboard`,
  STATS: `${API_BASE}/api/v1/dashboard/stats`,
  RECENT_CLIENTS: `${API_BASE}/api/v1/dashboard/recent-clients`,
  RECENT_WORKERS: `${API_BASE}/api/v1/dashboard/recent-workers`,
  PENDING_APPROVALS: `${API_BASE}/api/v1/dashboard/pending-approvals`,
  SHIFTS_OVERVIEW: `${API_BASE}/api/v1/dashboard/shifts-overview`,
  // Admin dashboard endpoints
  ADMIN_STATS: `${API_BASE}/api/v1/dashboard/admin/stats`,
  ADMIN_SHIFTS_BY_DAY: `${API_BASE}/api/v1/dashboard/admin/shifts-by-day`,
  ADMIN_WORKERS_AVAILABILITY: `${API_BASE}/api/v1/dashboard/admin/workers-availability`,
  ADMIN_RECENT_ACTIVITY: `${API_BASE}/api/v1/dashboard/admin/recent-activity`,
} as const;

// Authentication endpoints
export const AUTH = {
  REGISTER: `${API_BASE}/api/v1/auth/register`,
  LOGIN: `${API_BASE}/api/v1/auth/login`,
  STAFF_LOGIN: `${API_BASE}/api/v1/auth/staff/login`,
  WORKER_LOGIN: `${API_BASE}/api/v1/auth/worker/login`,
  FORGOT_PASSWORD: `${API_BASE}/api/v1/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE}/api/v1/auth/reset-password`,
  SEND_OTP: `${API_BASE}/api/v1/auth/send-otp`,
  VERIFY_OTP: `${API_BASE}/api/v1/auth/verify-otp`,
  WORKER_VERIFY_OTP: `${API_BASE}/api/v1/auth/worker/verify-otp`,
  STAFF_INVITE_VALIDATE: (token: string) => `${API_BASE}/api/v1/auth/staff-invite/${token}`,
  STAFF_INVITE_ACCEPT: (token: string) => `${API_BASE}/api/v1/auth/staff-invite/${token}/accept`,
  VALIDATE_INVITE_CODE: `${API_BASE}/api/v1/auth/validate-invite`,
  ACCEPT_INVITE_CODE: `${API_BASE}/api/v1/auth/accept-invite`,
  WORKER_REGISTER: `${API_BASE}/api/v1/auth/worker/register`,
  WORKER_DOCUMENTS: `${API_BASE}/api/v1/auth/worker/documents`,
  WORKER_DOCUMENTS_GET: `${API_BASE}/api/v1/auth/worker/documents`,
  WORKER_DOCUMENT_DELETE: (documentId: string) => `${API_BASE}/api/v1/auth/worker/documents/${documentId}`,
  WORKER_PROFILE_PIC: `${API_BASE}/api/v1/auth/worker/profile-pic`,
  WORKER_VERIFY_RTW: `${API_BASE}/api/v1/auth/worker/verify-rtw`,
  WORKER_COMPLETE_ONBOARDING: `${API_BASE}/api/v1/auth/worker/complete-onboarding`,
  ME: `${API_BASE}/api/v1/auth/me`,
  UPDATE_ME: `${API_BASE}/api/v1/auth/me`,
  CHANGE_PASSWORD: `${API_BASE}/api/v1/auth/change-password`,
  LOGOUT: `${API_BASE}/api/v1/auth/logout`,
} as const;

// User endpoints
export const USERS = {
  LIST: `${API_BASE}/api/v1/users`,
  DETAIL: (userId: string) => `${API_BASE}/api/v1/users/${userId}`,
  CREATE: `${API_BASE}/api/v1/users`,
  UPDATE: (userId: string) => `${API_BASE}/api/v1/users/${userId}`,
  DELETE: (userId: string) => `${API_BASE}/api/v1/users/${userId}`,
  SUSPEND: (userId: string) => `${API_BASE}/api/v1/users/${userId}/suspend`,
  REACTIVATE: (userId: string) => `${API_BASE}/api/v1/users/${userId}/reactivate`,
  RESEND_INVITE: (userId: string) => `${API_BASE}/api/v1/users/${userId}/resend-invite`,
  STAFF_WORKER_COUNTS: `${API_BASE}/api/v1/users/staff/worker-counts`,
  UNASSIGNED_WORKERS: `${API_BASE}/api/v1/users/workers/unassigned`,
  MY_MANAGED_WORKERS: `${API_BASE}/api/v1/users/workers/my-team`,
  MANAGED_WORKERS: (managerId: string) => `${API_BASE}/api/v1/users/${managerId}/managed-workers`,
  ASSIGN_WORKERS: (managerId: string) => `${API_BASE}/api/v1/users/${managerId}/assign-workers`,
  UNASSIGN_WORKERS: `${API_BASE}/api/v1/users/workers/unassign`,
  MY_CLIENTS: `${API_BASE}/api/v1/users/clients/my-clients`,
  STAFF_CLIENTS: (staffId: string) => `${API_BASE}/api/v1/users/${staffId}/clients`,
  ASSIGN_CLIENTS: (staffId: string) => `${API_BASE}/api/v1/users/${staffId}/assign-clients`,
  UNASSIGN_CLIENTS: (staffId: string) => `${API_BASE}/api/v1/users/${staffId}/unassign-clients`,
  CLIENT_STAFF: (clientCompanyId: string) => `${API_BASE}/api/v1/users/client/${clientCompanyId}/staff`,
  CLIENT_WORKERS: (clientCompanyId: string) => `${API_BASE}/api/v1/users/client/${clientCompanyId}/workers`,
} as const;

// Worker endpoints
export const WORKERS = {
  LIST: `${API_BASE}/api/v1/workers`,
  LIST_STATS: `${API_BASE}/api/v1/workers/list-stats`,
  HOME: `${API_BASE}/api/v1/workers/home`,
  EXPORT: `${API_BASE}/api/v1/workers/export`,
  INVITE: `${API_BASE}/api/v1/workers/invite`,
  DETAIL: (workerId: string) => `${API_BASE}/api/v1/workers/${workerId}`,
  STATS: (workerId: string) => `${API_BASE}/api/v1/workers/${workerId}/stats`,
  SHIFTS: (workerId: string) => `${API_BASE}/api/v1/workers/${workerId}/shifts`,
  PROFILE: (workerId: string) => `${API_BASE}/api/v1/workers/${workerId}/profile`,
  SKILLS: (workerId: string) => `${API_BASE}/api/v1/workers/${workerId}/skills`,
  RTW: (workerId: string) => `${API_BASE}/api/v1/workers/${workerId}/rtw`,
  RTW_INITIATE: (workerId: string) => `${API_BASE}/api/v1/workers/${workerId}/rtw/initiate`,
  RTW_UPDATE: (workerId: string) => `${API_BASE}/api/v1/workers/${workerId}/rtw/update`,
  AVAILABILITY: (workerId: string) => `${API_BASE}/api/v1/workers/${workerId}/availability`,
  DOCUMENTS: (workerId: string) => `${API_BASE}/api/v1/workers/${workerId}/documents`,
  DOCUMENT: (workerId: string, docId: string) => `${API_BASE}/api/v1/workers/${workerId}/documents/${docId}`,
  DOCUMENT_VERIFY: (workerId: string, docId: string) => `${API_BASE}/api/v1/workers/${workerId}/documents/${docId}/verify`,
  BLOCKS: (workerId: string) => `${API_BASE}/api/v1/workers/${workerId}/blocks`,
  BLOCK_LIFT: (workerId: string, blockId: string) => `${API_BASE}/api/v1/workers/${workerId}/blocks/${blockId}/lift`,
  RELIABILITY: (workerId: string) => `${API_BASE}/api/v1/workers/${workerId}/reliability`,
  CLIENTS: (workerId: string) => `${API_BASE}/api/v1/workers/${workerId}/clients`,
  ASSIGN_CLIENT: (workerId: string) => `${API_BASE}/api/v1/workers/${workerId}/assign-client`,
  TRANSFER: (workerId: string) => `${API_BASE}/api/v1/workers/${workerId}/transfer`,
  REMOVE_CLIENT: (workerId: string) => `${API_BASE}/api/v1/workers/${workerId}/remove-client`,
  BULK_ASSIGN_CLIENT: `${API_BASE}/api/v1/workers/bulk-assign-client`,
  AVAILABLE_FOR_CLIENT: (clientCompanyId: string) => `${API_BASE}/api/v1/workers/client/${clientCompanyId}/available`,
  SUSPEND: (workerId: string) => `${API_BASE}/api/v1/workers/${workerId}/suspend`,
  REACTIVATE: (workerId: string) => `${API_BASE}/api/v1/workers/${workerId}/reactivate`,
} as const;

// Worker Membership endpoints (multi-agency)
export const WORKER_MEMBERSHIP = {
  INVITE_BY_EMAIL: `${API_BASE}/api/v1/worker/memberships/invite`,
  REMOVE: (membershipId: string) => `${API_BASE}/api/v1/worker/memberships/${membershipId}`,
} as const;

// Shift endpoints
export const SHIFTS = {
  LIST: `${API_BASE}/api/v1/shifts`,
  CREATE: `${API_BASE}/api/v1/shifts`,
  MY_HISTORY: `${API_BASE}/api/v1/shifts/my-history`,
  STAFF_HISTORY: `${API_BASE}/api/v1/shifts/staff-history`,
  DETAIL: (shiftId: string) => `${API_BASE}/api/v1/shifts/${shiftId}`,
  UPDATE: (shiftId: string) => `${API_BASE}/api/v1/shifts/${shiftId}`,
  DELETE: (shiftId: string) => `${API_BASE}/api/v1/shifts/${shiftId}`,
  ASSIGNMENTS: (shiftId: string) => `${API_BASE}/api/v1/shifts/${shiftId}/assignments`,
  ASSIGNMENT: (shiftId: string, assignmentId: string) => `${API_BASE}/api/v1/shifts/${shiftId}/assignments/${assignmentId}`,
  ACCEPT: (shiftId: string) => `${API_BASE}/api/v1/shifts/${shiftId}/accept`,
  DECLINE: (shiftId: string) => `${API_BASE}/api/v1/shifts/${shiftId}/decline`,
  CLOCK_IN: (shiftId: string) => `${API_BASE}/api/v1/shifts/${shiftId}/clock-in`,
  CLOCK_OUT: (shiftId: string) => `${API_BASE}/api/v1/shifts/${shiftId}/clock-out`,
  BROADCAST: (shiftId: string) => `${API_BASE}/api/v1/shifts/${shiftId}/broadcast`,
  CANCEL: (shiftId: string) => `${API_BASE}/api/v1/shifts/${shiftId}/cancel`,
} as const;

// Attendance endpoints
export const ATTENDANCE = {
  MY_STATUS: `${API_BASE}/api/v1/attendance/my-status`,
  MY_HISTORY: `${API_BASE}/api/v1/attendance/my-history`,
  FLAGGED: `${API_BASE}/api/v1/attendance/flagged`,
  DAILY_TIMESHEET: `${API_BASE}/api/v1/attendance/timesheet/daily`,
  SHIFT_ATTENDANCE: (shiftId: string) => `${API_BASE}/api/v1/attendance/shift/${shiftId}`,
  CLOCK_IN: (shiftId: string) => `${API_BASE}/api/v1/attendance/${shiftId}/clock-in`,
  CLOCK_OUT: (shiftId: string) => `${API_BASE}/api/v1/attendance/${shiftId}/clock-out`,
  APPROVE: (attendanceId: string) => `${API_BASE}/api/v1/attendance/${attendanceId}/approve`,
  FLAG: (attendanceId: string) => `${API_BASE}/api/v1/attendance/${attendanceId}/flag`,
} as const;

// Payroll/Payslip endpoints
export const PAYROLL = {
  ADMIN_LIST: `${API_BASE}/api/v1/payslips/admin/list`,
  GENERATE: `${API_BASE}/api/v1/payslips/generate`,
  BULK_APPROVE: `${API_BASE}/api/v1/payslips/bulk-approve`,
  TEAM_SUMMARY: `${API_BASE}/api/v1/payslips/team-summary`,
  DETAIL: (payslipId: string) => `${API_BASE}/api/v1/payslips/${payslipId}`,
  APPROVE: (payslipId: string) => `${API_BASE}/api/v1/payslips/${payslipId}/approve`,
  MARK_PAID: (payslipId: string) => `${API_BASE}/api/v1/payslips/${payslipId}/mark-paid`,
  WORKER_PAYSLIP: (workerId: string) => `${API_BASE}/api/v1/payslips/worker/${workerId}`,
  MY_PAYSLIP: `${API_BASE}/api/v1/payslips/my-payslip`,
  LIST: `${API_BASE}/api/v1/payslips/list`,
} as const;

// Holiday/Leave endpoints
export const HOLIDAY = {
  LIST: `${API_BASE}/api/v1/holidays`,
  ENTITLEMENT: `${API_BASE}/api/v1/holidays/entitlement`,
  CREATE: `${API_BASE}/api/v1/holidays`,
  DETAIL: (id: string) => `${API_BASE}/api/v1/holidays/${id}`,
  CANCEL: (id: string) => `${API_BASE}/api/v1/holidays/${id}/cancel`,
  ADMIN_REQUESTS: `${API_BASE}/api/v1/holidays/admin/requests`,
  GRANT: `${API_BASE}/api/v1/holidays/grant`,
  REVIEW: (id: string) => `${API_BASE}/api/v1/holidays/${id}/review`,
  UPDATE_ENTITLEMENT: (workerId: string) => `${API_BASE}/api/v1/holidays/entitlement/${workerId}`,
} as const;

// HR Management endpoints
export const HR = {
  MANAGER_STATS: `${API_BASE}/api/v1/hr/managers/stats`,
  LIST_MANAGERS: `${API_BASE}/api/v1/hr/managers`,
  EXPORT_MANAGERS: `${API_BASE}/api/v1/hr/managers/export`,
  GET_MANAGER: (managerId: string) => `${API_BASE}/api/v1/hr/managers/${managerId}`,
  UPDATE_MANAGER_STATUS: (managerId: string) => `${API_BASE}/api/v1/hr/managers/${managerId}/status`,
  DELETE_MANAGER: (managerId: string) => `${API_BASE}/api/v1/hr/managers/${managerId}`,
  STAFF_WORKER_COUNTS: `${API_BASE}/api/v1/hr/staff/worker-counts`,
  UNASSIGNED_WORKERS: `${API_BASE}/api/v1/hr/workers/unassigned`,
  MY_TEAM: `${API_BASE}/api/v1/hr/workers/my-team`,
  MANAGED_WORKERS: (managerId: string) => `${API_BASE}/api/v1/hr/${managerId}/managed-workers`,
  ASSIGN_WORKERS: (managerId: string) => `${API_BASE}/api/v1/hr/${managerId}/assign-workers`,
  UNASSIGN_WORKERS: `${API_BASE}/api/v1/hr/workers/unassign`,
} as const;

// Client portal endpoints
export const CLIENT = {
  // Authentication
  LOGIN: `${API_BASE}/api/v1/client/auth/login`,
  FORGOT_PASSWORD: `${API_BASE}/api/v1/client/auth/forgot-password`,
  
  // Dashboard
  DASHBOARD: `${API_BASE}/api/v1/client/dashboard`,
  
  // Workers
  WORKERS: `${API_BASE}/api/v1/client/workers`,
  WORKER_PROFILE: (workerId: string) => `${API_BASE}/api/v1/client/workers/${workerId}`,
  RATE_WORKER: (workerId: string) => `${API_BASE}/api/v1/client/workers/${workerId}/rate`,
  BLOCK_WORKER: (workerId: string) => `${API_BASE}/api/v1/client/workers/${workerId}/block`,
  
  // Shifts / Bookings
  SHIFTS: `${API_BASE}/api/v1/client/shifts`,
  SHIFT_DETAILS: (shiftId: string) => `${API_BASE}/api/v1/client/shifts/${shiftId}`,
  REQUEST_WORKERS: `${API_BASE}/api/v1/client/shifts/request`,
  CANCEL_SHIFT: (shiftId: string) => `${API_BASE}/api/v1/client/shifts/${shiftId}/cancel`,
  
  // Timesheets
  TIMESHEETS: `${API_BASE}/api/v1/client/timesheets`,
  TIMESHEET_DETAILS: (timesheetId: string) => `${API_BASE}/api/v1/client/timesheets/${timesheetId}`,
  APPROVE_TIMESHEET: (timesheetId: string) => `${API_BASE}/api/v1/client/timesheets/${timesheetId}/approve`,
  DISPUTE_TIMESHEET: (timesheetId: string) => `${API_BASE}/api/v1/client/timesheets/${timesheetId}/dispute`,
  
  // Invoices
  INVOICES: `${API_BASE}/api/v1/client/invoices`,
  INVOICE_DETAILS: (invoiceId: string) => `${API_BASE}/api/v1/client/invoices/${invoiceId}`,
  DOWNLOAD_INVOICE: (invoiceId: string) => `${API_BASE}/api/v1/client/invoices/${invoiceId}/download`,
  
  // Reports
  HOURS_REPORT: `${API_BASE}/api/v1/client/reports/hours`,
  SPEND_REPORT: `${API_BASE}/api/v1/client/reports/spend`,
  
  // Settings
  SETTINGS: `${API_BASE}/api/v1/client/settings`,
  
  // Users (client company users)
  CLIENT_USERS: `${API_BASE}/api/v1/client/users`,
  CLIENT_USER: (userId: string) => `${API_BASE}/api/v1/client/users/${userId}`,
} as const;

// Client registration endpoints
export const CLIENT_REGISTRATION = {
  VALIDATE_CODE: `${API_BASE}/api/v1/client-registration/validate-code`,
  REGISTER: `${API_BASE}/api/v1/client-registration/register`,
  VERIFY_EMAIL: `${API_BASE}/api/v1/client-registration/verify-email`,
  RESEND_VERIFICATION: `${API_BASE}/api/v1/client-registration/resend-verification`,
  AGENCY_INFO: (inviteCode: string) => `${API_BASE}/api/v1/client-registration/agency/${inviteCode}`,
} as const;

// Organization endpoints
export const ORGANIZATION = {
  CURRENT: `${API_BASE}/api/v1/organizations/current`,
  SETTINGS: `${API_BASE}/api/v1/organizations/current/settings`,
  BRANDING: `${API_BASE}/api/v1/organizations/current/branding`,
  CLIENTS: `${API_BASE}/api/v1/organizations/current/clients`,
  CREATE_CLIENT: `${API_BASE}/api/v1/organizations/current/clients`,
  CLIENT_DETAIL: (clientId: string) => `${API_BASE}/api/v1/organizations/current/clients/${clientId}`,
  CLIENT_USERS: (clientId: string) => `${API_BASE}/api/v1/organizations/current/clients/${clientId}/users`,
  CLIENT_USER_RESEND_INVITE: (clientId: string, userId: string) => `${API_BASE}/api/v1/organizations/current/clients/${clientId}/users/${userId}/resend-invite`,
  CLIENT_PAY_RATES: (clientId: string) => `${API_BASE}/api/v1/organizations/current/clients/${clientId}/pay-rates`,
  INVITE_CODES: `${API_BASE}/api/v1/organizations/current/invite-codes`,
  INVITE_CODE: (codeId: string) => `${API_BASE}/api/v1/organizations/current/invite-codes/${codeId}`,
} as const;

// Bank Account & Payment Sheet endpoints
export const BANK_ACCOUNT = {
  LIST: `${API_BASE}/api/v1/bank-account/list`,
  ME: `${API_BASE}/api/v1/bank-account/me`,
  WORKER: (workerId: string) => `${API_BASE}/api/v1/bank-account/worker/${workerId}`,
  WORKER_UPDATE: (workerId: string) => `${API_BASE}/api/v1/bank-account/worker/${workerId}`,
  VERIFY: (workerId: string) => `${API_BASE}/api/v1/bank-account/worker/${workerId}/verify`,
  PAYMENT_SHEET: `${API_BASE}/api/v1/bank-account/payment-sheet`,
  PAYMENT_SHEET_SUMMARY: `${API_BASE}/api/v1/bank-account/payment-sheet/summary`,
} as const;

// Payslip endpoints
export const PAYSLIPS = {
  LIST: `${API_BASE}/api/v1/payslips/list`,
  MY_PAYSLIP: `${API_BASE}/api/v1/payslips/my-payslip`,
  TEAM_SUMMARY: `${API_BASE}/api/v1/payslips/team-summary`,
  WORKER_PAYSLIPS: (workerId: string) => `${API_BASE}/api/v1/payslips/worker/${workerId}`,
  ADMIN_LIST: `${API_BASE}/api/v1/payslips/admin/list`,
  GENERATE: `${API_BASE}/api/v1/payslips/generate`,
  BULK_APPROVE: `${API_BASE}/api/v1/payslips/bulk-approve`,
  DETAIL: (payslipId: string) => `${API_BASE}/api/v1/payslips/${payslipId}`,
  APPROVE: (payslipId: string) => `${API_BASE}/api/v1/payslips/${payslipId}/approve`,
  MARK_PAID: (payslipId: string) => `${API_BASE}/api/v1/payslips/${payslipId}/mark-paid`,
} as const;

// Holiday/Leave endpoints
export const HOLIDAYS = {
  LIST: `${API_BASE}/api/v1/holidays`,
  ENTITLEMENT: `${API_BASE}/api/v1/holidays/entitlement`,
  CREATE: `${API_BASE}/api/v1/holidays`,
  DETAIL: (holidayId: string) => `${API_BASE}/api/v1/holidays/${holidayId}`,
  CANCEL: (holidayId: string) => `${API_BASE}/api/v1/holidays/${holidayId}/cancel`,
  ADMIN_REQUESTS: `${API_BASE}/api/v1/holidays/admin/requests`,
  WORKER_HOLIDAYS: (workerId: string) => `${API_BASE}/api/v1/holidays?workerId=${workerId}`,
  GRANT: `${API_BASE}/api/v1/holidays/grant`,
  REVIEW: (holidayId: string) => `${API_BASE}/api/v1/holidays/${holidayId}/review`,
  UPDATE_ENTITLEMENT: (workerId: string) => `${API_BASE}/api/v1/holidays/entitlement/${workerId}`,
} as const;

// Skills endpoints
export const SKILLS = {
  LIST: `${API_BASE}/api/v1/skills`,
  CREATE: `${API_BASE}/api/v1/skills`,
  CATEGORIES: `${API_BASE}/api/v1/skills/categories`,
  BY_CATEGORY: (category: string) => `${API_BASE}/api/v1/skills/category/${category}`,
  UPDATE: (skillId: string) => `${API_BASE}/api/v1/skills/${skillId}`,
  DELETE: (skillId: string) => `${API_BASE}/api/v1/skills/${skillId}`,
} as const;

// Onboarding endpoints
export const ONBOARDING = {
  STATUS: `${API_BASE}/api/v1/onboarding/status`,
  BRANDING: `${API_BASE}/api/v1/onboarding/branding`,
  LOCATION: `${API_BASE}/api/v1/onboarding/location`,
  WORKER_INVITE: `${API_BASE}/api/v1/onboarding/worker/invite`,
  CLIENT: `${API_BASE}/api/v1/onboarding/client`,
  TEAM_INVITE: `${API_BASE}/api/v1/onboarding/team/invite`,
  SKIP: `${API_BASE}/api/v1/onboarding/skip`,
  COMPLETE: `${API_BASE}/api/v1/onboarding/complete`,
} as const;

// Reports endpoints
export const REPORTS = {
  WORKFORCE: `${API_BASE}/api/v1/reports/workforce`,
  RELIABILITY: `${API_BASE}/api/v1/reports/reliability`,
  SHIFTS: `${API_BASE}/api/v1/reports/shifts`,
  ATTENDANCE: `${API_BASE}/api/v1/reports/attendance`,
  PAYROLL: `${API_BASE}/api/v1/reports/payroll`,
  CLIENTS: `${API_BASE}/api/v1/reports/clients`,
  COMPLIANCE: `${API_BASE}/api/v1/reports/compliance`,
  EXECUTIVE_SUMMARY: `${API_BASE}/api/v1/reports/executive-summary`,
} as const;

// Notification endpoints
export const NOTIFICATIONS = {
  LIST: `${API_BASE}/api/v1/notifications`,
  UNREAD_COUNT: `${API_BASE}/api/v1/notifications/unread-count`,
  MARK_READ: (notificationId: string) => `${API_BASE}/api/v1/notifications/${notificationId}/read`,
  MARK_ALL_READ: `${API_BASE}/api/v1/notifications/read-all`,
  REGISTER_DEVICE: `${API_BASE}/api/v1/notifications/register-device`,
  DEACTIVATE_DEVICE: `${API_BASE}/api/v1/notifications/deactivate-device`,
  PREFERENCES: `${API_BASE}/api/v1/notifications/preferences`,
  PREFERENCES_BULK: `${API_BASE}/api/v1/notifications/preferences/bulk`,
} as const;

// Shift endpoints (additional ones not in SHIFTS)
export const SHIFT_MANAGEMENT = {
  MY_HISTORY: `${API_BASE}/api/v1/shifts/my-history`,
  BROADCAST: (shiftId: string) => `${API_BASE}/api/v1/shifts/${shiftId}/broadcast`,
} as const;

// User management endpoints
export const USER_MANAGEMENT = {
  PROFILE: `${API_BASE}/api/v1/users/profile`,
  UPDATE_PROFILE: `${API_BASE}/api/v1/users/profile`,
  CHANGE_PASSWORD: `${API_BASE}/api/v1/users/change-password`,
} as const;

// Attendance management endpoints
export const ATTENDANCE_MANAGEMENT = {
  MY_STATUS: `${API_BASE}/api/v1/attendance/my-status`,
  MY_HISTORY: `${API_BASE}/api/v1/attendance/my-history`,
  DAILY_TIMESHEET: `${API_BASE}/api/v1/attendance/timesheet/daily`,
  CLOCK_IN: (shiftId: string) => `${API_BASE}/api/v1/attendance/${shiftId}/clock-in`,
  CLOCK_OUT: (shiftId: string) => `${API_BASE}/api/v1/attendance/${shiftId}/clock-out`,
} as const;

// Timesheet endpoints
export const TIMESHEET = {
  STATS: `${API_BASE}/api/v1/attendance/timesheet/stats`,
  LIST: `${API_BASE}/api/v1/attendance/timesheet/list`,
  DETAIL: (attendanceId: string) => `${API_BASE}/api/v1/attendance/timesheet/${attendanceId}`,
  BULK_APPROVE: `${API_BASE}/api/v1/attendance/timesheet/bulk-approve`,
  EXPORT: `${API_BASE}/api/v1/attendance/timesheet/export`,
  APPROVE: (attendanceId: string) => `${API_BASE}/api/v1/attendance/${attendanceId}/approve`,
  FLAG: (attendanceId: string) => `${API_BASE}/api/v1/attendance/${attendanceId}/flag`,
} as const;

// Chat endpoints
export const CHAT = {
  ROOMS: `${API_BASE}/api/v1/chat/rooms`,
  GET_OR_CREATE_ROOM: `${API_BASE}/api/v1/chat/rooms`,
  ROOM_MESSAGES: (roomId: string) => `${API_BASE}/api/v1/chat/rooms/${roomId}/messages`,
  MARK_ROOM_READ: (roomId: string) => `${API_BASE}/api/v1/chat/rooms/${roomId}/read`,
  UNREAD_COUNT: `${API_BASE}/api/v1/chat/unread-count`,
  ASSIGNED_WORKERS: `${API_BASE}/api/v1/chat/workers`,
} as const;