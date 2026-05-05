/**
 * API Endpoints for Worker Mobile App
 */

// Base URL - change for production
// iOS Simulator can use localhost, Android emulator needs 10.0.2.2
export const API_BASE = __DEV__
  ? 'https://dev.staffsynctech.co.uk'
  : 'https://dev.staffsynctech.co.uk';

export const API_BASE_URL = `${API_BASE}/api/v1`;
export const API_BASE_ROOT = API_BASE;

// Auth endpoints (worker passwordless auth)
export const AUTH = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  STAFF_LOGIN: '/auth/staff/login',
  WORKER_LOGIN: '/auth/worker/login',
  WORKER_PASSWORD_LOGIN: '/auth/worker/password-login',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
  WORKER_VERIFY_OTP: '/auth/worker/verify-otp',
  STAFF_INVITE_VALIDATE: (token: string) => `/auth/staff-invite/${token}`,
  STAFF_INVITE_ACCEPT: (token: string) => `/auth/staff-invite/${token}/accept`,
  VALIDATE_INVITE_CODE: '/auth/validate-invite',
  ACCEPT_INVITE_CODE: '/auth/accept-invite',
  WORKER_REGISTER: '/auth/worker/register',
  WORKER_SAVE_PROFILE: '/auth/worker/save-profile',
  WORKER_SAVE_SKILLS: '/auth/worker/save-skills',
  WORKER_DOCUMENTS: '/auth/worker/documents',
  WORKER_DOCUMENTS_GET: '/auth/worker/documents',
  WORKER_DOCUMENT_DELETE: (documentId: string) => `/auth/worker/documents/${documentId}`,
  WORKER_PROFILE_PIC: '/auth/worker/profile-pic',
  WORKER_VERIFY_RTW: '/auth/worker/verify-rtw',
  WORKER_COMPLETE_ONBOARDING: '/auth/worker/complete-onboarding',
  ME: '/auth/me',
  UPDATE_ME: '/auth/me',
  CHANGE_PASSWORD: '/auth/change-password',
  LOGOUT: '/auth/logout',
} as const;

// Worker endpoints (self-service)
export const WORKER = {
  HOME: '/workers/home',
  MY_DOCUMENTS: '/workers/my-documents',
  UPLOAD_DOCUMENT: '/workers/my-documents',
  DELETE_DOCUMENT: (docId: string) => `/workers/my-documents/${docId}`,
  MY_SKILLS: '/workers/my-skills',
  ADD_MY_SKILL: '/workers/my-skills',
  REMOVE_MY_SKILL: (skillId: string) => `/workers/my-skills/${skillId}`,
  FOR_SWAP: '/workers/for-swap',
  SHIFTS_FOR_SWAP: (workerId: string) => `/workers/${workerId}/shifts-for-swap`,
  LIST: '/workers',
  LIST_STATS: '/workers/list-stats',
  EXPORT: '/workers/export',
  INVITE: '/workers/invite',
  DETAIL: (workerId: string) => `/workers/${workerId}`,
  STATS: (workerId: string) => `/workers/${workerId}/stats`,
  SHIFTS: (workerId: string) => `/workers/${workerId}/shifts`,
  PROFILE: (workerId: string) => `/workers/${workerId}/profile`,
  SKILLS: (workerId: string) => `/workers/${workerId}/skills`,
  RTW: (workerId: string) => `/workers/${workerId}/rtw`,
  RTW_INITIATE: (workerId: string) => `/workers/${workerId}/rtw/initiate`,
  RTW_UPDATE: (workerId: string) => `/workers/${workerId}/rtw/update`,
  AVAILABILITY: (workerId: string) => `/workers/${workerId}/availability`,
  DOCUMENTS: (workerId: string) => `/workers/${workerId}/documents`,
  DOCUMENT: (workerId: string, docId: string) => `/workers/${workerId}/documents/${docId}`,
  DOCUMENT_VERIFY: (workerId: string, docId: string) => `/workers/${workerId}/documents/${docId}/verify`,
  BLOCKS: (workerId: string) => `/workers/${workerId}/blocks`,
  BLOCK_LIFT: (workerId: string, blockId: string) => `/workers/${workerId}/blocks/${blockId}/lift`,
  RELIABILITY: (workerId: string) => `/workers/${workerId}/reliability`,
  CLIENTS: (workerId: string) => `/workers/${workerId}/clients`,
  ASSIGN_CLIENT: (workerId: string) => `/workers/${workerId}/assign-client`,
  TRANSFER: (workerId: string) => `/workers/${workerId}/transfer`,
  REMOVE_CLIENT: (workerId: string) => `/workers/${workerId}/remove-client`,
  BULK_ASSIGN_CLIENT: '/workers/bulk-assign-client',
  AVAILABLE_FOR_CLIENT: (clientCompanyId: string) => `/workers/client/${clientCompanyId}/available`,
  SUSPEND: (workerId: string) => `/workers/${workerId}/suspend`,
  REACTIVATE: (workerId: string) => `/workers/${workerId}/reactivate`,
} as const;

// Shift endpoints
export const SHIFTS = {
  LIST: '/shifts',
  CREATE: '/shifts',
  MY_HISTORY: '/shifts/my-history',
  STAFF_HISTORY: '/shifts/staff-history',
  OPEN: '/shifts/open',
  GET_BY_ID: (shiftId: string) => `/shifts/${shiftId}`,
  UPDATE: (shiftId: string) => `/shifts/${shiftId}`,
  DELETE: (shiftId: string) => `/shifts/${shiftId}`,
  ASSIGNMENTS: (shiftId: string) => `/shifts/${shiftId}/assignments`,
  ASSIGNMENT: (shiftId: string, assignmentId: string) => `/shifts/${shiftId}/assignments/${assignmentId}`,
  ACCEPT: (shiftId: string) => `/shifts/${shiftId}/accept`,
  DECLINE: (shiftId: string) => `/shifts/${shiftId}/decline`,
  CLAIM: (shiftId: string) => `/shifts/${shiftId}/claim`,
  CLOCK_IN: (shiftId: string) => `/shifts/${shiftId}/clock-in`,
  CLOCK_OUT: (shiftId: string) => `/shifts/${shiftId}/clock-out`,
  BROADCAST: (shiftId: string) => `/shifts/${shiftId}/broadcast`,
  CANCEL: (shiftId: string) => `/shifts/${shiftId}/cancel`,
} as const;

// Attendance endpoints
export const ATTENDANCE = {
  MY_STATUS: '/attendance/my-status',
  MY_HISTORY: '/attendance/my-history',
  MY_TIMESHEET: '/attendance/my-timesheet',
  FLAGGED: '/attendance/flagged',
  DAILY_TIMESHEET: '/attendance/timesheet/daily',
  WORKER_TIMESHEET: (workerId: string) => `/attendance/worker/${workerId}/timesheet`,
  SHIFT_ATTENDANCE: (shiftId: string) => `/attendance/shift/${shiftId}`,
  CLOCK_IN: (shiftId: string) => `/attendance/${shiftId}/clock-in`,
  CLOCK_OUT: (shiftId: string) => `/attendance/${shiftId}/clock-out`,
  APPROVE: (attendanceId: string) => `/attendance/${attendanceId}/approve`,
  FLAG: (attendanceId: string) => `/attendance/${attendanceId}/flag`,
  ONGOING_SHIFTS: '/attendance/ongoing-shifts',
  ADMIN_CLOCK_OUT: (attendanceId: string) => `/attendance/${attendanceId}/admin-clock-out`,
} as const;

// Payslip endpoints
export const PAYSLIPS = {
  LIST: '/payslips/list',
  MY_PAYSLIP: '/payslips/my-payslip',
  DETAIL: (payslipId: string) => `/payslips/${payslipId}`,
  HTML: (payslipId: string) => `/payslips/${payslipId}/html`,
  UPLOAD: '/payslips/upload',
  ADMIN_LIST: '/payslips/admin/list',
  EXPORT_TEMPLATE: '/payslips/export-template',
  BULK_IMPORT: '/payslips/bulk-import',
} as const;

// Holiday/Leave endpoints
export const HOLIDAYS = {
  MY_REQUESTS: '/holidays',
  ADMIN_REQUESTS: '/holidays/admin/requests',
  REQUEST: '/holidays',
  DETAIL: (requestId: string) => `/holidays/${requestId}`,
  CANCEL: (requestId: string) => `/holidays/${requestId}/cancel`,
} as const;

// Bank Account endpoints
export const BANK_ACCOUNT = {
  LIST: '/bank-account/list',
  ME: '/bank-account/me',
  SAVE: '/bank-account/me',
  WORKER: (workerId: string) => `/bank-account/worker/${workerId}`,
  WORKER_UPDATE: (workerId: string) => `/bank-account/worker/${workerId}`,
  VERIFY: (workerId: string) => `/bank-account/worker/${workerId}/verify`,
  PAYMENT_SHEET: '/bank-account/payment-sheet',
  PAYMENT_SHEET_SUMMARY: '/bank-account/payment-sheet/summary',
} as const;

// Chat endpoints
export const CHAT = {
  ROOMS: '/chat/rooms',
  WORKER_ROOM: '/chat/worker-room',
  GET_OR_CREATE_ROOM: '/chat/rooms',
  MESSAGES: (roomId: string) => `/chat/rooms/${roomId}/messages`,
  ROOM_MESSAGES: (roomId: string) => `/chat/rooms/${roomId}/messages`,
  MARK_READ: (roomId: string) => `/chat/rooms/${roomId}/read`,
  MARK_ROOM_READ: (roomId: string) => `/chat/rooms/${roomId}/read`,
  UNREAD_COUNT: '/chat/unread-count',
  UPLOAD_FILE: '/chat/upload',
  SEND_MESSAGE: (roomId: string) => `/chat/rooms/${roomId}/send`,
  SEND_WITH_ATTACHMENTS: (roomId: string) => `/chat/rooms/${roomId}/send-with-attachments`,
  ASSIGNED_WORKERS: '/chat/workers',
  
  // Client-Agency chat endpoints
  CLIENT_ROOMS: '/chat/client/rooms',
  CLIENT_CREATE_ROOM: '/chat/client/rooms',
  CLIENT_MESSAGES: (roomId: string) => `/chat/client/rooms/${roomId}/messages`,
  CLIENT_MARK_READ: (roomId: string) => `/chat/client/rooms/${roomId}/read`,
  CLIENT_UNREAD_COUNT: '/chat/client/unread-count',
  CLIENT_SEND_MESSAGE: (roomId: string) => `/chat/client/rooms/${roomId}/send`,
  
  AGENCY_ROOMS: '/chat/agency/rooms',
  AGENCY_CREATE_ROOM: '/chat/agency/rooms',
  AGENCY_CLIENTS: '/chat/agency/clients',
  AGENCY_WORKERS: '/chat/workers',
} as const;

// Agencies (public)
export const AGENCIES = {
  NEARBY: '/agencies/nearby',
} as const;

// Shift Swap endpoints
export const SWAP = {
  LIST: '/shift-swaps',
  MY: '/shift-swaps/my',
  AVAILABLE: '/shift-swaps/available',
  CREATE: '/shift-swaps',
  CLAIM: (id: string) => `/shift-swaps/${id}/claim`,
  RESPOND: (id: string) => `/shift-swaps/${id}/respond`,
  CANCEL: (id: string) => `/shift-swaps/${id}`,
} as const;

// Notifications
export const NOTIFICATIONS = {
  LIST: '/notifications',
  MARK_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/read-all',
  UNREAD_COUNT: '/notifications/unread-count',
  PREFERENCES: '/notifications/preferences',
  UPDATE_PREFERENCE: '/notifications/preferences',
  UPDATE_PREFERENCES_BULK: '/notifications/preferences/bulk',
  APP_VERSION: '/notifications/app-version',
  REGISTER_DEVICE: '/notifications/register-device',
  DEACTIVATE_DEVICE: '/notifications/deactivate-device',
  PREFERENCES_BULK: '/notifications/preferences/bulk',
} as const;

// Contact form (public)
export const CONTACT = {
  SEND: '/contact',
} as const;

// Recurring Schedule endpoints
export const RECURRING_SCHEDULES = {
  LIST: '/recurring-schedules',
  GET_BY_ID: (id: string) => `/recurring-schedules/${id}`,
  CREATE: '/recurring-schedules',
  UPDATE: (id: string) => `/recurring-schedules/${id}`,
  PAUSE: (id: string) => `/recurring-schedules/${id}/pause`,
  RESUME: (id: string) => `/recurring-schedules/${id}/resume`,
  END: (id: string) => `/recurring-schedules/${id}/end`,
  DELETE: (id: string) => `/recurring-schedules/${id}`,
  LIST_REQUESTS: '/recurring-schedules/requests/list',
  APPROVE_REQUEST: (requestId: string) => `/recurring-schedules/requests/${requestId}/approve`,
  REJECT_REQUEST: (requestId: string) => `/recurring-schedules/requests/${requestId}/reject`,
  GENERATE: (id: string) => `/recurring-schedules/${id}/generate`,
  MY_LIST: '/recurring-schedules/my/list',
  CREATE_REQUEST: '/recurring-schedules/requests/create',
} as const;

// Worker Membership endpoints (multi-agency)
export const WORKER_MEMBERSHIP = {
  INVITE_BY_EMAIL: '/worker/memberships/invite',
  REMOVE: (membershipId: string) => `/worker/memberships/${membershipId}`,
} as const;

// Skills endpoints
export const SKILLS = {
  LIST: '/skills',
  CREATE: '/skills',
  CATEGORIES: '/skills/categories',
  BY_CATEGORY: (category: string) => `/skills/category/${category}`,
  UPDATE: (skillId: string) => `/skills/${skillId}`,
  DELETE: (skillId: string) => `/skills/${skillId}`,
} as const;

// Onboarding endpoints
export const ONBOARDING = {
  STATUS: '/onboarding/status',
  BRANDING: '/onboarding/branding',
  LOCATION: '/onboarding/location',
  WORKER_INVITE: '/onboarding/worker/invite',
  CLIENT: '/onboarding/client',
  TEAM_INVITE: '/onboarding/team/invite',
  SKIP: '/onboarding/skip',
  COMPLETE: '/onboarding/complete',
} as const;

// Reports endpoints
export const REPORTS = {
  WORKFORCE: '/reports/workforce',
  RELIABILITY: '/reports/reliability',
  SHIFTS: '/reports/shifts',
  ATTENDANCE: '/reports/attendance',
  PAYROLL: '/reports/payroll',
  CLIENTS: '/reports/clients',
  COMPLIANCE: '/reports/compliance',
  EXECUTIVE_SUMMARY: '/reports/executive-summary',
} as const;

// Shift Management endpoints
export const SHIFT_MANAGEMENT = {
  MY_HISTORY: '/shifts/my-history',
  BROADCAST: (shiftId: string) => `/shifts/${shiftId}/broadcast`,
} as const;

// Timesheet endpoints
export const TIMESHEET = {
  STATS: '/attendance/timesheet/stats',
  LIST: '/attendance/timesheet/list',
  DETAIL: (attendanceId: string) => `/attendance/timesheet/${attendanceId}`,
  BULK_APPROVE: '/attendance/timesheet/bulk-approve',
  EXPORT: '/attendance/timesheet/export',
  APPROVE: (attendanceId: string) => `/attendance/timesheet/${attendanceId}/approve`,
  FLAG: (attendanceId: string) => `/attendance/timesheet/${attendanceId}/flag`,
} as const;

// Invite Code Request endpoints
export const INVITE_REQUESTS = {
  LIST: '/agencies/invite-requests',
  REVIEW: (id: string) => `/agencies/invite-requests/${id}`,
} as const;

// Dashboard endpoints
export const DASHBOARD = {
  ROLE_DASHBOARD: '/dashboard/my-dashboard',
  AGENCY_DASHBOARD: '/dashboard',
  STATS: '/dashboard/stats',
  RECENT_CLIENTS: '/dashboard/recent-clients',
  RECENT_WORKERS: '/dashboard/recent-workers',
  PENDING_APPROVALS: '/dashboard/pending-approvals',
  SHIFTS_OVERVIEW: '/dashboard/shifts-overview',
  ADMIN_STATS: '/dashboard/admin/stats',
  ADMIN_SHIFTS_BY_DAY: '/dashboard/admin/shifts-by-day',
  ADMIN_WORKERS_AVAILABILITY: '/dashboard/admin/workers-availability',
  ADMIN_RECENT_ACTIVITY: '/dashboard/admin/recent-activity',
} as const;

// User endpoints
export const USERS = {
  LIST: '/users',
  DETAIL: (userId: string) => `/users/${userId}`,
  CREATE: '/users',
  UPDATE: (userId: string) => `/users/${userId}`,
  DELETE: (userId: string) => `/users/${userId}`,
  SUSPEND: (userId: string) => `/users/${userId}/suspend`,
  REACTIVATE: (userId: string) => `/users/${userId}/reactivate`,
  RESEND_INVITE: (userId: string) => `/users/${userId}/resend-invite`,
  STAFF_WORKER_COUNTS: '/users/staff/worker-counts',
  UNASSIGNED_WORKERS: '/users/workers/unassigned',
  MY_MANAGED_WORKERS: '/users/workers/my-team',
  MANAGED_WORKERS: (managerId: string) => `/users/${managerId}/managed-workers`,
  ASSIGN_WORKERS: (managerId: string) => `/users/${managerId}/assign-workers`,
  UNASSIGN_WORKERS: '/users/workers/unassign',
  MY_CLIENTS: '/users/clients/my-clients',
  STAFF_CLIENTS: (staffId: string) => `/users/${staffId}/clients`,
  ASSIGN_CLIENTS: (staffId: string) => `/users/${staffId}/assign-clients`,
  UNASSIGN_CLIENTS: (staffId: string) => `/users/${staffId}/unassign-clients`,
  CLIENT_STAFF: (clientCompanyId: string) => `/users/client/${clientCompanyId}/staff`,
  CLIENT_WORKERS: (clientCompanyId: string) => `/users/client/${clientCompanyId}/workers`,
} as const;

// HR Management endpoints
export const HR = {
  MANAGER_STATS: '/hr/managers/stats',
  LIST_MANAGERS: '/hr/managers',
  EXPORT_MANAGERS: '/hr/managers/export',
  GET_MANAGER: (managerId: string) => `/hr/managers/${managerId}`,
  UPDATE_MANAGER_STATUS: (managerId: string) => `/hr/managers/${managerId}/status`,
  DELETE_MANAGER: (managerId: string) => `/hr/managers/${managerId}`,
  INVITE_STAFF: '/hr/invite',
  STAFF_WORKER_COUNTS: '/hr/staff/worker-counts',
  UNASSIGNED_WORKERS: '/hr/workers/unassigned',
  MY_TEAM: '/hr/workers/my-team',
  MANAGED_WORKERS: (managerId: string) => `/hr/${managerId}/managed-workers`,
  ASSIGN_WORKERS: (managerId: string) => `/hr/${managerId}/assign-workers`,
  UNASSIGN_WORKERS: '/hr/workers/unassign',
} as const;

// Client portal endpoints
export const CLIENT = {
  BASE_URL: '/client',
  LOGIN: '/client/auth/login',
  FORGOT_PASSWORD: '/client/auth/forgot-password',
  AGENCIES: '/client/agencies',
  SWITCH_AGENCY: '/client/switch-agency',
  DASHBOARD: '/client/dashboard',
  WORKERS: '/client/workers',
  WORKER_PROFILE: (workerId: string) => `/client/workers/${workerId}`,
  RATE_WORKER: (workerId: string) => `/client/workers/${workerId}/rate`,
  BLOCK_WORKER: (workerId: string) => `/client/workers/${workerId}/block`,
  SHIFTS: '/client/shifts',
  SHIFT_DETAILS: (shiftId: string) => `/client/shifts/${shiftId}`,
  REQUEST_WORKERS: '/client/shifts/request',
  CANCEL_SHIFT: (shiftId: string) => `/client/shifts/${shiftId}/cancel`,
  TIMESHEETS: '/client/timesheets',
  WEEKLY_TIMESHEETS: '/client/timesheets/weekly',
  WEEKLY_TIMESHEET_DETAILS: '/client/timesheets/weekly/details',
  TIMESHEET_DETAILS: (timesheetId: string) => `/client/timesheets/${timesheetId}`,
  APPROVE_TIMESHEET: (timesheetId: string) => `/client/timesheets/${timesheetId}/approve`,
  DISPUTE_TIMESHEET: (timesheetId: string) => `/client/timesheets/${timesheetId}/dispute`,
  INVOICES: '/client/invoices',
  GENERATE_INVOICE: '/client/invoices/generate',
  INVOICE_DETAILS: (invoiceId: string) => `/client/invoices/${invoiceId}`,
  DOWNLOAD_INVOICE: (invoiceId: string) => `/client/invoices/${invoiceId}/download`,
  HOURS_REPORT: '/client/reports/hours',
  SPEND_REPORT: '/client/reports/spend',
  SETTINGS: '/client/settings',
  CLIENT_USERS: '/client/users',
  CLIENT_USER: (userId: string) => `/client/users/${userId}`,
} as const;

// Client registration endpoints
export const CLIENT_REGISTRATION = {
  VALIDATE_CODE: '/client-registration/validate-code',
  REGISTER: '/client-registration/register',
  VERIFY_EMAIL: '/client-registration/verify-email',
  JOIN_AGENCY: '/enhanced-client-registration/join-agency',
  RESEND_VERIFICATION: '/client-registration/resend-verification',
  AGENCY_INFO: (inviteCode: string) => `/client-registration/agency/${inviteCode}`,
} as const;

// Organization endpoints
export const ORGANIZATION = {
  CURRENT: '/organizations/current',
  SETTINGS: '/organizations/current/settings',
  BRANDING: '/organizations/current/branding',
  CLIENTS: '/organizations/current/clients',
  CREATE_CLIENT: '/organizations/current/clients',
  CLIENT_DETAIL: (clientId: string) => `/organizations/current/clients/${clientId}`,
  CLIENT_USERS: (clientId: string) => `/organizations/current/clients/${clientId}/users`,
  CLIENT_USER_RESEND_INVITE: (clientId: string, userId: string) => `/organizations/current/clients/${clientId}/users/${userId}/resend-invite`,
  CLIENT_PAY_RATES: (clientId: string) => `/organizations/current/clients/${clientId}/pay-rates`,
  INVITE_CODES: '/organizations/current/invite-codes',
  INVITE_CODE: (codeId: string) => `/organizations/current/invite-codes/${codeId}`,
} as const;

// Payroll endpoints
export const PAYROLL = {
  ADMIN_LIST: '/payslips/admin/list',
  GENERATE: '/payslips/generate',
  BULK_APPROVE: '/payslips/bulk-approve',
  TEAM_SUMMARY: '/payslips/team-summary',
  DETAIL: (payslipId: string) => `/payslips/${payslipId}`,
  APPROVE: (payslipId: string) => `/payslips/${payslipId}/approve`,
  MARK_PAID: (payslipId: string) => `/payslips/${payslipId}/mark-paid`,
  WORKER_PAYSLIP: (workerId: string) => `/payslips/worker/${workerId}`,
  MY_PAYSLIP: '/payslips/my-payslip',
  LIST: '/payslips/list',
} as const;
