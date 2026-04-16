/**
 * API Endpoints for Worker Mobile App
 */

// Base URL - change for production
// iOS Simulator can use localhost, Android emulator needs 10.0.2.2
export const API_BASE_URL = 'https://dev.staffsynctech.co.uk/api/v1';

// Auth endpoints (worker passwordless auth)
export const AUTH = {
  WORKER_LOGIN: '/auth/worker/login',
  WORKER_PASSWORD_LOGIN: '/auth/worker/password-login',
  WORKER_REGISTER: '/auth/worker/register',
  WORKER_VERIFY_OTP: '/auth/worker/verify-otp',
  WORKER_SAVE_PROFILE: '/auth/worker/save-profile',
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
  CLOCK_IN: (shiftId: string) => `/attendance/${shiftId}/clock-in`,
  CLOCK_OUT: (shiftId: string) => `/attendance/${shiftId}/clock-out`,
} as const;

// Payslip endpoints
export const PAYSLIPS = {
  LIST: '/payslips/list',
  MY_PAYSLIP: '/payslips/my-payslip',
  DETAIL: (payslipId: string) => `/payslips/${payslipId}`,
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
  SEND_MESSAGE: (roomId: string) => `/chat/rooms/${roomId}/send`,
  UPLOAD_FILE: '/chat/upload',
  SEND_WITH_ATTACHMENTS: (roomId: string) => `/chat/rooms/${roomId}/send-with-attachments`,
  
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
} as const;
