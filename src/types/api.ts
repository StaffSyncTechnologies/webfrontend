// Base API response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  success: boolean;
}

// Dashboard types
export interface DashboardStats {
  workers: {
    total: number;
    active: number;
  };
  clients: {
    total: number;
    recent: number;
  };
  shifts: {
    today: number;
    thisWeek: number;
  };
  revenue?: {
    thisMonth: number;
    lastMonth: number;
  };
}

export interface PendingApprovals {
  workers: number;
  timesheets: number;
  clients: number;
  total: number;
}

// Role-specific dashboard types
export interface RoleDashboard {
  user: {
    id: string;
    fullName: string;
    role: 'ADMIN' | 'OPS_MANAGER' | 'SHIFT_COORDINATOR' | 'COMPLIANCE_OFFICER' | 'CLIENT_ADMIN' | 'CLIENT_USER' | 'WORKER';
    email: string;
  };
  dashboardData: AdminDashboard | OpsManagerDashboard | ShiftCoordinatorDashboard | ComplianceOfficerDashboard | ClientDashboard | WorkerDashboard;
}

export interface AdminDashboard {
  overview: DashboardStats;
  pendingApprovals: PendingApprovals;
  recentActivity: DashboardActivity[];
  systemHealth: {
    apiStatus: 'healthy' | 'degraded' | 'down';
    databaseStatus: 'healthy' | 'degraded' | 'down';
    lastBackup: string;
  };
}

export interface OpsManagerDashboard {
  overview: {
    activeShifts: number;
    workersOnShift: number;
    upcomingShifts: number;
    unfilledShifts: number;
  };
  workerUtilization: {
    totalWorkers: number;
    activeWorkers: number;
    utilizationRate: number;
  };
  clientMetrics: {
    totalClients: number;
    activeClients: number;
    newClientsThisMonth: number;
  };
  recentIssues: DashboardIssue[];
}

export interface ShiftCoordinatorDashboard {
  myShifts: {
    today: Shift[];
    thisWeek: Shift[];
    upcoming: Shift[];
  };
  workerAvailability: {
    availableWorkers: number;
    totalWorkers: number;
    inDemandSkills: string[];
  };
  shiftAlerts: {
    unfilledShifts: Shift[];
    lastMinuteCancellations: Shift[];
  };
}

export interface ComplianceOfficerDashboard {
  complianceOverview: {
    compliantWorkers: number;
    pendingVerification: number;
    expiredDocuments: number;
    expiringSoon: number;
  };
  recentViolations: ComplianceViolation[];
  upcomingAudits: ComplianceAudit[];
  documentAlerts: DocumentAlert[];
}

export interface ClientDashboard {
  myDashboard: {
    activeWorkers: number;
    upcomingShifts: number;
    pendingTimesheets: number;
    totalHoursThisMonth: number;
  };
  recentShifts: ClientShift[];
  pendingTimesheets: ClientTimesheet[];
  openInvoices: ClientInvoice[];
}

export interface WorkerDashboard {
  myProfile: Worker;
  myShifts: {
    upcoming: Shift[];
    completed: Shift[];
    available: Shift[];
  };
  myEarnings: {
    thisWeek: number;
    thisMonth: number;
    yearToDate: number;
  };
  myDocuments: {
    verified: number;
    pending: number;
    expired: number;
  };
  notifications: WorkerNotification[];
}

// Additional dashboard types
export interface DashboardActivity {
  id: string;
  type: 'USER_REGISTERED' | 'CLIENT_CREATED' | 'SHIFT_CREATED' | 'WORKER_HIRED' | 'TIMESHEET_APPROVED';
  description: string;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface DashboardIssue {
  id: string;
  type: 'SHIFT_UNFILLED' | 'WORKER_NO_SHOW' | 'CLIENT_COMPLAINT' | 'SYSTEM_ERROR';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  createdAt: string;
  assignedTo?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

export interface ComplianceViolation {
  id: string;
  workerId: string;
  workerName: string;
  type: 'MISSING_DOCUMENT' | 'EXPIRED_CERTIFICATION' | 'LATE_CLOCK_IN' | 'UNAUTHORIZED_ACCESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  reportedAt: string;
  status: 'OPEN' | 'RESOLVED';
}

export interface ComplianceAudit {
  id: string;
  title: string;
  type: 'DOCUMENT_AUDIT' | 'ATTENDANCE_AUDIT' | 'COMPLIANCE_CHECK';
  scheduledDate: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  assignedTo?: string;
}

export interface DocumentAlert {
  id: string;
  workerId: string;
  workerName: string;
  documentType: string;
  alertType: 'EXPIRING_SOON' | 'EXPIRED' | 'MISSING';
  expiryDate?: string;
  daysUntilExpiry?: number;
}

export interface WorkerNotification {
  id: string;
  type: 'SHIFT_ASSIGNED' | 'SHIFT_REMINDER' | 'PAYMENT_PROCESSED' | 'DOCUMENT_REQUIRED';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
}

// User types
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'OPS_MANAGER' | 'SHIFT_COORDINATOR' | 'COMPLIANCE_OFFICER';
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

// Worker types
export interface Worker {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  rtwStatus?: 'COMPLIANT' | 'PENDING' | 'EXPIRED' | 'NOT_STARTED';
  reliabilityScore?: number;
  createdAt: string;
  skills?: Skill[];
  documents?: WorkerDocument[];
  availability?: WorkerAvailability;
  workerProfile?: {
    address?: string;
  };
  profilePicUrl?: string;
  verified?: boolean;
  role?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface WorkerDocument {
  id: string;
  type: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  expiresAt?: string;
  url: string;
}

export interface WorkerAvailability {
  [key: string]: boolean; // day of week -> availability
}

// Shift types
export interface Shift {
  id: string;
  title: string;
  clientCompanyId: string;
  siteLocation: string;
  siteLat?: number;
  siteLng?: number;
  startAt: string;
  endAt: string;
  workersNeeded: number;
  payRate: number;
  status: 'OPEN' | 'FILLED' | 'CANCELLED' | 'COMPLETED' | 'IN_PROGRESS';
  assignedWorkers?: Worker[];
  createdBy: string;
  createdAt: string;
  // Optional fields from API responses
  location?: { name: string };
  requiredSkills?: Array<{ skillId: string; skill?: Skill }>;
  notes?: string;
  clientCompany?: { name: string };
  _count?: { assignments: number };
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  attendances?: Array<{
    id: string;
    workerId: string;
    clockIn?: string;
    clockOut?: string;
    status: string;
  }>;
}

export interface ShiftAssignment {
  id: string;
  shiftId: string;
  workerId: string;
  status: 'ASSIGNED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
  assignedAt: string;
  respondedAt?: string;
}

// Attendance types
export interface Attendance {
  id: string;
  shiftId: string;
  workerId: string;
  clockInAt?: string;
  clockOutAt?: string;
  clockInLat?: number;
  clockInLng?: number;
  clockInAccuracy?: number;
  clockInDistance?: number;
  clockInDevice?: string;
  clockOutLat?: number;
  clockOutLng?: number;
  clockInLocation?: {
    lat: number;
    lng: number;
  };
  clockOutLocation?: {
    lat: number;
    lng: number;
  };
  geofenceValid?: boolean;
  hoursWorked?: number;
  status: 'PENDING' | 'APPROVED' | 'FLAGGED';
  flagReason?: 'LATE_CLOCK_IN' | 'EARLY_CLOCK_OUT' | 'LOCATION_MISMATCH' | 'HOURS_DISCREPANCY' | null;
  flagNote?: string;
  flags?: AttendanceFlag[];
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceFlag {
  id: string;
  type: 'LATE_CLOCK_IN' | 'EARLY_CLOCK_OUT' | 'LOCATION_MISMATCH';
  reason: string;
  createdAt: string;
}

// Client types
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  payRates?: ClientPayRate[];
}

export interface ClientPayRate {
  skillId: string;
  rate: number;
}

export interface ClientShiftRequest {
  id: string;
  clientCompanyId: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  workersNeeded: number;
  skills: string[];
  status: 'OPEN' | 'ASSIGNED' | 'CANCELLED';
  createdAt: string;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  deploymentMode: 'AGENCY' | 'DIRECT_COMPANY';
  industry?: string;
  size?: string;
  branding?: OrganizationBranding;
  settings?: OrganizationSettings;
  coverImageUrl?: string;
}

export interface OrganizationBranding {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface OrganizationSettings {
  timezone: string;
  dateFormat: string;
  currency: string;
}

// Onboarding types
export interface OnboardingStatus {
  step: 'branding' | 'location' | 'worker' | 'client' | 'complete';
  completed: string[];
  isComplete: boolean;
}

// Report types
export interface WorkforceReport {
  totalWorkers: number;
  activeWorkers: number;
  rtwCompliant: number;
  rtwPending: number;
  skillsBreakdown: Record<string, number>;
}

export interface ReliabilityReport {
  topPerformers: Worker[];
  lowPerformers: Worker[];
  averageScore: number;
}

export interface ShiftReport {
  totalShifts: number;
  filledRate: number;
  clientBreakdown: Record<string, number>;
  weeklyTrend: Record<string, number>;
}

export interface ComplianceReport {
  compliantWorkers: number;
  pendingWorkers: number;
  expiredDocuments: number;
  expiringSoon: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  // Organization fields
  organizationName: string;
  organizationEmail?: string;
  tradingName?: string;
  companyNumber?: string;
  industry?: string;
  numberOfWorkers?: string;
  location?: string;
  website?: string;
  deploymentMode: 'AGENCY' | 'DIRECT_COMPANY';
  // Admin user fields
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  jobTitle?: string;
}

export interface RegisterResponse {
  email: string;
  requiresVerification: boolean;
}

export interface StaffLoginCredentials {
  email: string;
  password: string;
}

export interface WorkerLoginCredentials {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface WorkerVerifyOtpRequest {
  workerId: string;
  otp: string;
}

export interface WorkerRegisterCredentials {
  inviteToken: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  user: User | Worker;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface Agency {
  id: string;
  name: string;
  organizationId: string;
  isPrimary: boolean;
}

export interface ClientAuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface ClientAuthResponse {
  token: string;
  user: ClientAuthUser;
  agencies: Agency[];
  currentAgency: {
    id: string;
    name: string;
    organizationId: string;
  };
}

export interface AgencySwitchResponse {
  token: string;
  currentAgency: {
    id: string;
    name: string;
    organizationId: string;
  };
}

export interface MeResponse {
  user: User | Worker;
  permissions?: string[];
}

export interface StaffInviteValidation {
  isValid: boolean;
  email?: string;
  organizationName?: string;
  role?: string;
  expiresAt?: string;
}

// Chat types
export interface ChatUser {
  id: string;
  fullName: string;
  role?: string;
}

export interface ChatRoom {
  id: string;
  organizationId: string;
  type: 'HR_WORKER' | 'CLIENT_AGENCY';
  // HR-Worker fields
  hrUserId?: string;
  workerId?: string;
  hrUser?: ChatUser;
  worker?: ChatUser;
  // Client-Agency fields
  clientUserId?: string;
  agencyUserId?: string;
  clientCompanyId?: string;
  clientUser?: ChatUser;
  agencyUser?: ChatUser;
  clientCompany?: { id: string; name: string };
  // Common fields
  lastMessageAt: string | null;
  createdAt: string;
  messages: ChatMessage[];
  unreadCount: number;
  name?: string;
  participants?: ChatUser[];
  lastMessage?: ChatMessage;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderType: 'user' | 'client_user';
  content: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  createdAt: string;
  readAt: string | null;
  sender?: ChatUser;
  senderUser?: ChatUser;
}

export interface GetOrCreateRoomRequest {
  workerId: string;
  participantId?: string;
}

export interface UnreadCountResponse {
  count: number;
  total?: number;
}

export interface AssignedWorker {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
}

// Client portal types
export interface ClientDashboard {
  activeWorkers: number;
  upcomingShifts: number;
  pendingTimesheets: ClientTimesheet[];
  totalHoursThisMonth: number;
  recentActivity: ClientActivity[];
}

export interface ClientActivity {
  id: string;
  type: 'SHIFT_CREATED' | 'SHIFT_COMPLETED' | 'TIMESHEET_SUBMITTED' | 'WORKER_ASSIGNED';
  description: string;
  timestamp: string;
}

export interface ClientWorker {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  skills: Skill[];
  averageRating: number;
  totalShifts: number;
  reliabilityScore: number;
  isBlocked: boolean;
  lastWorkDate?: string;
}

export interface ClientWorkerProfile extends ClientWorker {
  workHistory: ClientWorkerWorkHistory[];
  certifications: ClientWorkerCertification[];
  availability: WorkerAvailability;
  hourlyRate: number;
}

export interface ClientWorkerWorkHistory {
  shiftId: string;
  shiftTitle: string;
  date: string;
  hoursWorked: number;
  rating?: number;
  feedback?: string;
}

export interface ClientWorkerCertification {
  id: string;
  name: string;
  issuedBy: string;
  issueDate: string;
  expiryDate?: string;
  documentUrl: string;
}

export interface RateWorkerRequest {
  rating: number; // 1-5
  feedback?: string;
  shiftId: string;
}

export interface ClientShift {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  location: string;
  workersRequested: number;
  workersAssigned: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  requiredSkills: string[];
  payRate: number;
  assignedWorkers: ClientWorker[];
  createdAt: string;
}

export interface RequestWorkersRequest {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  location: string;
  workersRequested: number;
  requiredSkills: string[];
  payRate: number;
  notes?: string;
}

export interface ClientTimesheet {
  id: string;
  workerId: string;
  worker: ClientWorker;
  shiftId: string;
  shift: ClientShift;
  clockInAt: string;
  clockOutAt?: string;
  totalHours: number;
  status: 'PENDING' | 'APPROVED' | 'DISPUTED';
  hourlyRate: number;
  totalPay: number;
  approvedBy?: string;
  approvedAt?: string;
  disputeReason?: string;
  disputedAt?: string;
  createdAt: string;
}

export interface ApproveTimesheetRequest {
  approvedHours?: number;
  notes?: string;
}

export interface DisputeTimesheetRequest {
  reason: string;
  disputedHours?: number;
  notes?: string;
}

export interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  period: string;
  totalAmount: number;
  totalHours: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  dueDate: string;
  createdAt: string;
  paidAt?: string;
  timesheets: ClientTimesheet[];
}

export interface HoursReport {
  period: string;
  totalHours: number;
  totalCost: number;
  breakdownByWorker: Record<string, {
    workerName: string;
    hours: number;
    cost: number;
  }>;
  breakdownByShift: Record<string, {
    shiftTitle: string;
    hours: number;
    cost: number;
  }>;
}

export interface SpendReport {
  period: string;
  totalSpend: number;
  budget?: number;
  budgetUtilization: number;
  breakdownByCategory: Record<string, {
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    spend: number;
  }>;
}

export interface ClientSettings {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress: string;
  defaultPayRate: number;
  timezone: string;
  currency: string;
  notificationPreferences: {
    emailNotifications: boolean;
    shiftReminders: boolean;
    timesheetAlerts: boolean;
    invoiceNotifications: boolean;
  };
}

export interface ClientUser {
  id: string;
  fullName: string;
  email: string;
  role: 'CLIENT_ADMIN' | 'CLIENT_USER';
  isActive: boolean;
  permissions: string[];
  lastLoginAt?: string;
  createdAt: string;
}

export interface CreateClientUserRequest {
  fullName: string;
  email: string;
  role: 'CLIENT_ADMIN' | 'CLIENT_USER';
  permissions: string[];
}

export interface UpdateClientUserRequest {
  fullName?: string;
  email?: string;
  role?: 'CLIENT_ADMIN' | 'CLIENT_USER';
  permissions?: string[];
  isActive?: boolean;
}

// Client registration types
export interface ValidateInviteCodeRequest {
  inviteCode: string;
}

export interface ValidateInviteCodeResponse {
  isValid: boolean;
  agencyInfo?: AgencyPublicInfo;
  expiresAt?: string;
  alreadyUsed?: boolean;
}

export interface AgencyPublicInfo {
  name: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  description?: string;
  website?: string;
  supportEmail?: string;
  supportPhone?: string;
}

export interface InviteValidation {
  valid: boolean;
  agency: {
    id: string;
    name: string;
    logo?: string;
    primaryColor?: string;
  };
  isNewUser: boolean;
  existingAgencies: Array<{
    id: string;
    name: string;
    clientCompanyId: string;
    isPrimary: boolean;
  }>;
  inviteEmail: string;
}

export interface ClientRegistrationRequest {
  inviteCode: string;
  company: {
    name: string;
    registrationNumber?: string;
    industry?: string;
    address?: string;
    city?: string;
    postcode?: string;
    contactPhone?: string;
    billingEmail?: string;
  };
  admin: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    jobTitle?: string;
  };
}

export interface ClientRegistrationResponse {
  client: {
    id: string;
    companyName: string;
    contactEmail: string;
    status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'REJECTED';
    createdAt: string;
  };
  adminUser: {
    id: string;
    fullName: string;
    email: string;
    role: 'CLIENT_ADMIN';
    isActive: boolean;
    createdAt: string;
  };
  verificationEmailSent: boolean;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  client?: {
    id: string;
    companyName: string;
    status: 'ACTIVE';
  };
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
  emailSent: boolean;
}

// Admin Dashboard Stats types
export interface AdminStats {
  totalWorkers: { value: number; change: number };
  totalClients: { value: number; change: number };
  totalRevenue: { value: number; change: number; currency: string };
  shiftsToday: { value: number; change: number };
}

export interface ShiftsByDay {
  period: { start: string; end: string };
  shifts: Array<{ day: string; count: number }>;
}

export interface WorkersAvailability {
  total: number;
  available: { count: number; percentage: number };
  booked: { count: number; percentage: number };
  activePercentage: number;
}

export interface RecentActivityItem {
  id: string;
  worker: {
    id: string;
    name: string;
    avatar: string | null;
  };
  clockIn: string;
  clockOut: string | null;
  location: string;
  status: 'Completed' | 'Ongoing';
  shiftId: string;
  shiftTitle: string;
}

export interface RecentActivity {
  activities: RecentActivityItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RecentActivityParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}
