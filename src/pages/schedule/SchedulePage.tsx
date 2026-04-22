import { useState } from 'react';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer, PageTitle } from '../../components/layout';
import { Box, styled, Button, Card, CardContent, Typography, Chip, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Grid, Tabs, Tab, Badge, Alert, CircularProgress, IconButton, createTheme, ThemeProvider } from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Pause as PauseIcon, PlayArrow as PlayArrowIcon, Stop as StopIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { colors } from '../../utilities/colors';
import {
  useListSchedulesQuery,
  useListRequestsQuery,
  useCreateScheduleMutation,
  usePauseScheduleMutation,
  useResumeScheduleMutation,
  useEndScheduleMutation,
  useDeleteScheduleMutation,
  useApproveRequestMutation,
  useRejectRequestMutation,
  type CreateScheduleData,
  type ScheduleDay,
  type RecurringSchedule,
} from '../../store/slices/recurringScheduleSlice';
import { useGetWorkersQuery } from '../../store/slices/workerSlice';
import { useGetClientsQuery } from '../../store/slices/organizationSlice';

// Create theme with Outfit font
const theme = createTheme({
  typography: {
    fontFamily: 'Outfit, system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: 'Outfit, system-ui, Avenir, Helvetica, Arial, sans-serif',
        },
      },
    },
  },
});

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
const DAY_LABELS: Record<string, string> = { MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun' };
const DAY_FULL: Record<string, string> = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday' };

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  PENDING_APPROVAL: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  PAUSED: { label: 'Paused', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  ENDED: { label: 'Ended', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const StyledCard = styled(Card)({
  borderRadius: '16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  border: '1px solid rgba(0,0,0,0.08)',
  '&:hover': {
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    transform: 'translateY(-4px)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
});

const StatusChip = styled(Chip)(({ textColor, bg }: { textColor: string; bg: string }) => ({
  backgroundColor: bg,
  color: textColor,
  fontWeight: 600,
  fontSize: '11px',
  fontFamily: 'Outfit, system-ui, sans-serif',
  height: '24px',
  borderRadius: '6px',
}));

// Helpers
function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function calcHours(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number);
  let [eh, em] = end.split(':').map(Number);
  if (eh <= sh) eh += 24;
  return ((eh * 60 + em - sh * 60 - sm) / 60).toFixed(1);
}

function weeklyHours(days: ScheduleDay[]): string {
  return days.reduce((t, d) => t + parseFloat(calcHours(d.startTime, d.endTime)), 0).toFixed(1);
}

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
  return <StatusChip textColor={cfg.color} bg={cfg.bg} label={cfg.label} />;
}

function WorkerAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#0ea5e9', '#14b8a6', '#f59e0b'];
  const idx = name.charCodeAt(0) % colors.length;
  return <Avatar sx={{ width: size, height: size, bgcolor: colors[idx], fontSize: size * 0.4, fontWeight: 700, fontFamily: 'Outfit, system-ui, sans-serif' }}>{getInitials(name)}</Avatar>;
}

function DayChips({ days }: { days: ScheduleDay[] }) {
  const activeDays = new Set(days.map(d => d.dayOfWeek));
  return (
    <Box sx={{ display: 'flex', gap: '4px', flexWrap: 'wrap', my: 1.5 }}>
      {DAYS.map(d => (
        <Box key={d} sx={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, bgcolor: activeDays.has(d) ? colors.primary.blue : '#f1f5f9', color: activeDays.has(d) ? '#fff' : '#64748b' }}>
          {DAY_LABELS[d]}
        </Box>
      ))}
    </Box>
  );
}

// New Schedule Modal
function NewScheduleModal({
  open,
  onClose,
  onSave,
  workers,
  clients,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateScheduleData) => void;
  workers: Array<{ id: string; fullName: string }>;
  clients: Array<{ id: string; name: string; locations?: Array<{ id: string; name: string }> }>;
}) {
  const [form, setForm] = useState({
    workerId: '',
    clientCompanyId: '',
    locationId: '',
    title: '',
    role: '',
    payRate: '',
    breakMinutes: '30',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [dayTimes, setDayTimes] = useState<Record<string, { startTime: string; endTime: string }>>({});
  const [loading, setLoading] = useState(false);

  const toggleDay = (d: string) => {
    setSelectedDays(prev => {
      if (prev.includes(d)) {
        const next = prev.filter(x => x !== d);
        const times = { ...dayTimes };
        delete times[d];
        setDayTimes(times);
        return next;
      }
      setDayTimes(prev => ({ ...prev, [d]: { startTime: '06:00', endTime: '14:00' } }));
      return [...prev, d];
    });
  };

  const updateTime = (day: string, field: 'startTime' | 'endTime', val: string) => {
    setDayTimes(prev => ({ ...prev, [day]: { ...prev[day], [field]: val } }));
  };

  const handleSave = async () => {
    if (!form.title || selectedDays.length === 0 || !form.startDate || !form.workerId) return;

    setLoading(true);
    const days = selectedDays.map(d => ({ dayOfWeek: d as any, ...dayTimes[d] }));
    const data: CreateScheduleData = {
      ...form,
      days,
      payRate: form.payRate ? parseFloat(form.payRate) : undefined,
      breakMinutes: parseInt(form.breakMinutes),
      endDate: form.endDate || undefined,
      clientCompanyId: form.clientCompanyId || undefined,
      locationId: form.locationId || undefined,
    };

    await onSave(data);
    setLoading(false);

    // Reset form
    setForm({
      workerId: '',
      clientCompanyId: '',
      locationId: '',
      title: '',
      role: '',
      payRate: '',
      breakMinutes: '30',
      startDate: '',
      endDate: '',
      notes: '',
    });
    setSelectedDays([]);
    setDayTimes({});
  };

  const totalHrs = selectedDays.reduce((t, d) => {
    if (!dayTimes[d]) return t;
    return t + parseFloat(calcHours(dayTimes[d].startTime, dayTimes[d].endTime));
  }, 0).toFixed(1);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Assign Permanent Schedule</Typography>
          <Typography variant="body2" color="text.secondary">
            This will generate shifts week-by-week automatically
          </Typography>
        </Box>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block' }}>
            Worker
          </Typography>
          <Select
            fullWidth
            size="small"
            value={form.workerId}
            onChange={e => setForm(f => ({ ...f, workerId: e.target.value }))}
            displayEmpty
          >
            <MenuItem value="">Select worker…</MenuItem>
            {workers.map(worker => (
              <MenuItem key={worker.id} value={worker.id}>
                {worker.fullName}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block' }}>
              Client Company
            </Typography>
            <Select
              fullWidth
              size="small"
              value={form.clientCompanyId}
              onChange={e => {
                setForm(f => ({ ...f, clientCompanyId: e.target.value, locationId: '' }));
              }}
              displayEmpty
            >
              <MenuItem value="">Select client…</MenuItem>
              {clients.map(client => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block' }}>
              Location
            </Typography>
            <Select
              fullWidth
              size="small"
              value={form.locationId}
              onChange={e => setForm(f => ({ ...f, locationId: e.target.value }))}
              displayEmpty
              disabled={!form.clientCompanyId}
            >
              <MenuItem value="">Select location…</MenuItem>
              {form.clientCompanyId && clients.find(c => c.id === form.clientCompanyId)?.locations?.map(location => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block' }}>
              Schedule Title
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Warehouse Days"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block' }}>
              Role / Position
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Picker/Packer"
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block' }}>
              Hourly Pay Rate (£)
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              inputProps={{ step: "0.01" }}
              placeholder="12.50"
              value={form.payRate}
              onChange={e => setForm(f => ({ ...f, payRate: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block' }}>
              Break (minutes)
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={form.breakMinutes}
              onChange={e => setForm(f => ({ ...f, breakMinutes: e.target.value }))}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block' }}>
              Start Date
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={form.startDate}
              onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block' }}>
              End Date (blank = indefinite)
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={form.endDate}
              onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block' }}>
            Working Days
          </Typography>
          <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {DAYS.map(d => (
              <Box key={d} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => toggleDay(d)}>
                <Button
                  size="small"
                  variant={selectedDays.includes(d) ? 'contained' : 'outlined'}
                  sx={{ minWidth: '40px', height: '40px', borderRadius: '10px', fontSize: '12px', fontWeight: 600 }}
                >
                  {DAY_LABELS[d]}
                </Button>
                <Typography variant="caption" sx={{ fontSize: '10px', color: '#94a3b8' }}>
                  {DAY_FULL[d].slice(0, 3)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {selectedDays.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block' }}>
              Shift Times
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {DAYS.filter(d => selectedDays.includes(d)).map(d => (
                <Box key={d} sx={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 60px', gap: 2, alignItems: 'center', bgcolor: '#f8fafc', borderRadius: 2, p: 1 }}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600, color: colors.primary.blue }}>
                    {DAY_FULL[d]}
                  </Typography>
                  <TextField
                    size="small"
                    type="time"
                    value={dayTimes[d]?.startTime || '06:00'}
                    onChange={e => updateTime(d, 'startTime', e.target.value)}
                    sx={{ '& input': { padding: '4px 8px' } }}
                  />
                  <TextField
                    size="small"
                    type="time"
                    value={dayTimes[d]?.endTime || '14:00'}
                    onChange={e => updateTime(d, 'endTime', e.target.value)}
                    sx={{ '& input': { padding: '4px 8px' } }}
                  />
                  <Typography sx={{ fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
                    {dayTimes[d] ? calcHours(dayTimes[d].startTime, dayTimes[d].endTime) + 'h' : '—'}
                  </Typography>
                </Box>
              ))}
              <Typography sx={{ fontSize: 12, color: colors.primary.blue, textAlign: 'right', mt: 1 }}>
                Total: <strong>{totalHrs}h / week</strong>
              </Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1, display: 'block' }}>
            Internal Notes
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Optional notes…"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading} sx={{ bgcolor: '#00AFEF', '&:hover': { bgcolor: '#0099D6' } }}>
          {loading ? <CircularProgress size={20} /> : 'Create Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Reason Modal Component
function ReasonModal({ open, onClose, onSubmit, action }: { open: boolean; onClose: () => void; onSubmit: (reason: string) => void; action: 'pause' | 'resume' | 'end' }) {
  const [reason, setReason] = useState('');

  const actionTitle = {
    pause: 'Pause Schedule',
    resume: 'Resume Schedule',
    end: 'End Schedule'
  }[action];

  const actionLabel = {
    pause: 'Pause',
    resume: 'Resume',
    end: 'End'
  }[action];

  const handleSubmit = () => {
    if (action !== 'resume' && !reason.trim()) {
      return;
    }
    onSubmit(reason);
    setReason('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{actionTitle}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Reason"
          fullWidth
          multiline
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required={action !== 'resume'}
          placeholder={action === 'resume' ? 'Optional reason for resuming' : 'Please provide a reason'}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#00AFEF', '&:hover': { bgcolor: '#0099D6' } }}>
          {actionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Main Component
function RecurringScheduleContent() {
  const [tab, setTab] = useState(0);
  const [showNewModal, setShowNewModal] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [reasonModal, setReasonModal] = useState<{ open: boolean; scheduleId: string; action: 'pause' | 'resume' | 'end' }>({ open: false, scheduleId: '', action: 'pause' });
  const [reason, setReason] = useState('');

  // Redux hooks
  const { data: schedules = [], isLoading: schedulesLoading, refetch: refetchSchedules } = useListSchedulesQuery({});
  const { data: requests = [], isLoading: requestsLoading, refetch: refetchRequests } = useListRequestsQuery({});
  const { data: workersData, isLoading: workersLoading } = useGetWorkersQuery({ status: 'ACTIVE' });
  const workers = workersData?.data || [];
  const { data: clients = [] } = useGetClientsQuery();
  
  const [createSchedule] = useCreateScheduleMutation();
  const [pauseSchedule] = usePauseScheduleMutation();
  const [resumeSchedule] = useResumeScheduleMutation();
  const [endSchedule] = useEndScheduleMutation();
  const [deleteSchedule] = useDeleteScheduleMutation();
  const [approveRequest] = useApproveRequestMutation();
  const [rejectRequest] = useRejectRequestMutation();

  const showToast = (msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateSchedule = async (data: CreateScheduleData) => {
    try {
      await createSchedule(data).unwrap();
      setShowNewModal(false);
      refetchSchedules();
      showToast('Schedule created successfully');
    } catch (error: any) {
      console.error('Failed to create schedule:', error);
      const errorMessage = error?.data?.error || error?.message || 'Failed to create schedule';
      showToast(errorMessage, 'error');
    }
  };

  const handlePauseSchedule = (id: string) => {
    setReasonModal({ open: true, scheduleId: id, action: 'pause' });
    setReason('');
  };

  const handleResumeSchedule = (id: string) => {
    setReasonModal({ open: true, scheduleId: id, action: 'resume' });
    setReason('');
  };

  const handleEndSchedule = (id: string) => {
    setReasonModal({ open: true, scheduleId: id, action: 'end' });
    setReason('');
  };

  const handleReasonSubmit = async (reasonText: string) => {
    try {
      if (reasonModal.action === 'pause') {
        await pauseSchedule({ id: reasonModal.scheduleId, reason: reasonText }).unwrap();
        showToast('Schedule paused successfully');
      } else if (reasonModal.action === 'resume') {
        await resumeSchedule(reasonModal.scheduleId).unwrap();
        showToast('Schedule resumed successfully');
      } else if (reasonModal.action === 'end') {
        const endDate = new Date().toISOString().split('T')[0];
        await endSchedule({ id: reasonModal.scheduleId, endDate, reason: reasonText }).unwrap();
        showToast('Schedule ended successfully');
      }
      setReasonModal({ open: false, scheduleId: '', action: 'pause' });
      setReason('');
      refetchSchedules();
    } catch (error) {
      console.error('Failed to perform action:', error);
      showToast('Failed to perform action', 'error');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await deleteSchedule(id).unwrap();
      refetchSchedules();
      showToast('Schedule deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete schedule:', error);
      const errorMessage = error?.data?.error || error?.message || 'Failed to delete schedule';
      showToast(errorMessage, 'error');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await approveRequest({ requestId }).unwrap();
      Promise.all([refetchSchedules(), refetchRequests()]);
      showToast('Request approved successfully');
    } catch (error) {
      console.error('Failed to approve request:', error);
      showToast('Failed to approve request', 'error');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectRequest({ requestId }).unwrap();
      refetchRequests();
      showToast('Request rejected');
    } catch (error) {
      console.error('Failed to reject request:', error);
      showToast('Failed to reject request', 'error');
    }
  };

  if (schedulesLoading || requestsLoading) return <CircularProgress />;

  const requestsArray = Array.isArray(requests) ? requests : [];
  const pendingCount = requestsArray.filter(r => r.status === 'PENDING').length;

  const schedulesArray = Array.isArray(schedules) ? schedules : [];
  const requestsArrayForDisplay = Array.isArray(requests) ? requests : [];

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Permanent Schedules</Typography>
        <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={() => setShowNewModal(true)} sx={{ bgcolor: '#00AFEF', '&:hover': { bgcolor: '#0099D6' } }}>
          Assign Schedule
        </Button>
      </Box>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="All Schedules" />
        <Tab 
          label={
            <>
              Worker Requests
              {pendingCount > 0 && <Badge badgeContent={pendingCount} color="error" sx={{ ml: 1 }}>{pendingCount}</Badge>}
            </>
          } 
        />
      </Tabs>

      {tab === 0 && (
        <Box>
          {schedulesArray.length === 0 ? (
            <Alert severity="info">No schedules yet. Create one to get started.</Alert>
          ) : (
            <Grid container spacing={3}>
              {schedulesArray.map(schedule => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={schedule.id}>
                  <StyledCard>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <WorkerAvatar name={schedule.worker.fullName} />
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{schedule.worker.fullName}</Typography>
                            <Typography variant="caption" color="text.secondary">{schedule.worker.email}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{schedule.role || 'No role'}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <StatusPill status={schedule.status} />
                        </Box>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{schedule.title}</Typography>
                      <Typography variant="caption" color="text.secondary">From {new Date(schedule.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Typography>
                      {schedule.clientCompany && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Client: {schedule.clientCompany.name}
                        </Typography>
                      )}
                      <DayChips days={schedule.days} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="body2"><strong>{weeklyHours(schedule.days)}h</strong>/week</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {schedule.status === 'ACTIVE' && (
                            <>
                              <IconButton size="small" onClick={() => handlePauseSchedule(schedule.id)} title="Pause">
                                <PauseIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleEndSchedule(schedule.id)} title="End">
                                <StopIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteSchedule(schedule.id)} title="Delete">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                          {schedule.status === 'PAUSED' && (
                            <>
                              <IconButton size="small" color="success" onClick={() => handleResumeSchedule(schedule.id)} title="Resume">
                                <PlayArrowIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteSchedule(schedule.id)} title="Delete">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                          {(schedule.status === 'PENDING_APPROVAL' || schedule.status === 'ENDED') && (
                            <IconButton size="small" color="error" onClick={() => handleDeleteSchedule(schedule.id)} title="Delete">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          {requestsArrayForDisplay.length === 0 ? (
            <Alert severity="info">No pending worker requests.</Alert>
          ) : (
            <Grid container spacing={2}>
              {requestsArrayForDisplay.map(request => (
                <Grid size={{ xs: 12 }} key={request.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <WorkerAvatar name={request.worker.fullName} />
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{request.worker.fullName}</Typography>
                            <Typography variant="caption" color="text.secondary">{request.requestType} request</Typography>
                          </Box>
                        </Box>
                        <StatusPill status={request.status} />
                      </Box>
                      {request.workerNote && (
                        <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                          "{request.workerNote}"
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Pattern: <strong>{request.proposedDays?.map((d: ScheduleDay) => DAY_LABELS[d.dayOfWeek]).join(', ')}</strong>
                        {' '}· {request.proposedDays?.[0]?.startTime} – {request.proposedDays?.[0]?.endTime}
                        {' '}· Starting {new Date(request.proposedStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button size="small" color="error" onClick={() => handleRejectRequest(request.id)}>
                          Reject
                        </Button>
                        <Button size="small" variant="contained" onClick={() => handleApproveRequest(request.id)} sx={{ bgcolor: '#00AFEF', '&:hover': { bgcolor: '#0099D6' } }}>
                          Approve
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {showNewModal && (
        <NewScheduleModal
          open={showNewModal}
          onClose={() => setShowNewModal(false)}
          onSave={handleCreateSchedule}
          workers={workers}
          clients={clients}
        />
      )}

      <ReasonModal
        open={reasonModal.open}
        onClose={() => setReasonModal({ open: false, scheduleId: '', action: 'pause' })}
        onSubmit={handleReasonSubmit}
        action={reasonModal.action}
      />

      {toast && (
        <Alert 
          severity={toast.type as any} 
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}
        >
          {toast.msg}
        </Alert>
      )}
    </>
  );
}

export function SchedulePage() {
  useDocumentTitle('Schedule');
  return (
    <ThemeProvider theme={theme}>
      <DashboardContainer
        header={<PageTitle>Permanent Schedules</PageTitle>}
      >
        <RecurringScheduleContent />
      </DashboardContainer>
    </ThemeProvider>
  );
}

export default SchedulePage;
