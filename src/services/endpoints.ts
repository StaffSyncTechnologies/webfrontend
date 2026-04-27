/**
 * API Endpoints for Worker Mobile App
 */

// Base URL - change for production
// iOS Simulator can use localhost, Android emulator needs 10.0.2.2
export const API_BASE = __DEV__
  ? 'https://dev.staffsynctech.co.uk'
  : 'https://dev.staffsynctech.co.uk';

export const API_BASE_URL = `${API_BASE}/api/v1`;

// Auth endpoints (worker passwordless auth)
export const AUTH = {
  WORKER_LOGIN: '/auth/worker/login',
  WORKER_PASSWORD_LOGIN: '/auth/worker/password-login',
  WORKER_REGISTER: '/auth/worker/register',
  WORKER_VERIFY_OTP: '/auth/worker/verify-otp',
  WORKER_SAVE_PROFILE: '/auth/worker/save-profile',
  WORKER_SAVE_SKILLS: '/auth/worker/save-skills',
  WORKER_DOCUMENTS: '/auth/worker/documents',
  WORKER_PROFILE_PIC: '/auth/worker/profile-pic',
  WORKER_VERIFY_RTW: '/auth/worker/verify-rtw',
  WORKER_COMPLETE_ONBOARDING: '/auth/worker/complete-onboarding',
  ME: '/auth/me',
  UPDATE_ME: '/auth/me',
  CHANGE_PASSWORD: '/auth/change-password',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
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
} as const;

// Shift endpoints
export const SHIFTS = {
  LIST: '/shifts',
  MY_HISTORY: '/shifts/my-history',
  GET_BY_ID: (shiftId: string) => `/shifts/${shiftId}`,
  ACCEPT: (shiftId: string) => `/shifts/${shiftId}/accept`,
  DECLINE: (shiftId: string) => `/shifts/${shiftId}/decline`,
  CLOCK_IN: (shiftId: string) => `/shifts/${shiftId}/clock-in`,
  CLOCK_OUT: (shiftId: string) => `/shifts/${shiftId}/clock-out`,
  ASSIGNMENTS: (shiftId: string) => `/shifts/${shiftId}/assignments`,
} as const;

// Attendance endpoints
export const ATTENDANCE = {
  MY_STATUS: '/attendance/my-status',
  MY_HISTORY: '/attendance/my-history',
  MY_TIMESHEET: '/attendance/my-timesheet',
  CLOCK_IN: (shiftId: string) => `/attendance/${shiftId}/clock-in`,
  CLOCK_OUT: (shiftId: string) => `/attendance/${shiftId}/clock-out`,
} as const;

// Payslip endpoints
export const PAYSLIPS = {
  LIST: '/payslips/list',
  MY_PAYSLIP: '/payslips/my-payslip',
  DETAIL: (payslipId: string) => `/payslips/${payslipId}`,
  HTML: (payslipId: string) => `/payslips/${payslipId}/html`,
} as const;

// Holiday/Leave endpoints
export const HOLIDAYS = {
  MY_REQUESTS: '/holidays/my-requests',
  REQUEST: '/holidays/request',
  CANCEL: (requestId: string) => `/holidays/${requestId}/cancel`,
} as const;

// Bank Account endpoints
export const BANK_ACCOUNT = {
  ME: '/bank-account/me',
  SAVE: '/bank-account/me',
} as const;

// Chat endpoints
export const CHAT = {
  ROOMS: '/chat/rooms',
  WORKER_ROOM: '/chat/worker-room',
  MESSAGES: (roomId: string) => `/chat/rooms/${roomId}/messages`,
  MARK_READ: (roomId: string) => `/chat/rooms/${roomId}/read`,
  UNREAD_COUNT: '/chat/unread-count',
  UPLOAD_FILE: '/chat/upload',
  SEND_MESSAGE: (roomId: string) => `/chat/rooms/${roomId}/send`,
  SEND_WITH_ATTACHMENTS: (roomId: string) => `/chat/rooms/${roomId}/send-with-attachments`,
} as const;

// Agencies (public)
export const AGENCIES = {
  NEARBY: '/agencies/nearby',
} as const;

// Notifications
export const NOTIFICATIONS = {
  LIST: '/notifications',
  MARK_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/read-all',
  UNREAD_COUNT: '/notifications/unread-count',
} as const;
