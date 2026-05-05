import { useState, useCallback } from 'react';
import {
  Box, Typography, styled, Button, Chip, CircularProgress,
  Tooltip, Dialog, DialogTitle, DialogContent, IconButton,
  Alert, Snackbar, Avatar, Popover, TextField, InputAdornment,
} from '@mui/material';
import {
  ChevronLeft, ChevronRight, CloudUpload, CloudOff,
  BeachAccess, Add, Close, CheckCircle, WbSunny, Warning,
  GridView, Search, PersonAdd,
} from '@mui/icons-material';
import { DashboardContainer } from '../../components/layout';
import { InviteWorkerModal } from '../../components/modals';
import { useDocumentTitle } from '../../hooks';
import { colors } from '../../utilities/colors';
import {
  useGetWeekRotaQuery, useAssignWorkerMutation, useUnassignWorkerMutation,
  usePublishRotaMutation, useUnpublishRotaMutation,
  type RotaWorker, type RotaAssignment, type ShiftType,
} from '../../store/api/rotaApi';
import { useGetWorkersQuery } from '../../store/slices/workerSlice';

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CELL_W = 90;
const NAME_COL_W = 200;

const SHIFT_CFG: Record<ShiftType, { bg: string; text: string; border: string; label: string; time: string; emoji: string }> = {
  morning:   { bg: '#EFF6FF', text: '#1D4ED8', border: '#3B82F6', label: 'Morning',   time: '6:00–14:00',  emoji: '🌅' },
  afternoon: { bg: '#FFFBEB', text: '#92400E', border: '#F59E0B', label: 'Afternoon', time: '14:00–22:00', emoji: '☀️' },
  night:     { bg: '#F5F3FF', text: '#5B21B6', border: '#8B5CF6', label: 'Night',     time: '22:00–6:00',  emoji: '🌙' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addDays(base: Date, n: number): Date {
  const d = new Date(base); d.setDate(d.getDate() + n); return d;
}

function getMondayOfWeek(ref: Date): Date {
  const d = new Date(ref); d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

function isoDate(d: Date): string { return d.toISOString().split('T')[0]; }

function formatWeekLabel(monday: Date): string {
  const sunday = addDays(monday, 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

function formatDayHeader(date: Date): { day: string; num: number; isToday: boolean } {
  const today = isoDate(new Date());
  return {
    day: date.toLocaleDateString('en-GB', { weekday: 'short' }),
    num: date.getDate(),
    isToday: isoDate(date) === today,
  };
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(name: string): string {
  const palette = ['#6366f1', '#8b5cf6', '#ec4899', '#0ea5e9', '#14b8a6', '#f59e0b', '#ef4444'];
  return palette[name.charCodeAt(0) % palette.length];
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const PageWrapper = styled(Box)({
  padding: '24px',
  fontFamily: 'Outfit, system-ui, sans-serif',
  minHeight: '100%',
  backgroundColor: colors.secondary.lightGray,
});

const GridWrapper = styled(Box)({
  overflowX: 'auto',
  borderRadius: '16px',
  border: `1px solid ${colors.border.light}`,
  backgroundColor: '#fff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
});

const HeaderCell = styled(Box)(({ isToday }: { isToday?: boolean }) => ({
  width: `${CELL_W}px`,
  minWidth: `${CELL_W}px`,
  padding: '12px 8px',
  textAlign: 'center',
  borderRight: `1px solid ${colors.border.light}`,
  backgroundColor: isToday ? '#EFF6FF' : '#F8FAFC',
  flexShrink: 0,
}));

const RowNameCell = styled(Box)({
  width: `${NAME_COL_W}px`,
  minWidth: `${NAME_COL_W}px`,
  padding: '10px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  borderRight: `1px solid ${colors.border.light}`,
  flexShrink: 0,
  backgroundColor: '#fff',
  position: 'sticky',
  left: 0,
  zIndex: 2,
});

const DataCell = styled(Box)({
  width: `${CELL_W}px`,
  minWidth: `${CELL_W}px`,
  borderRight: `1px solid ${colors.border.light}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 6px',
  height: '64px',
  flexShrink: 0,
});

// ─── Shift Pill ──────────────────────────────────────────────────────────────

function ShiftPill({ type, onRemove, published }: { type: ShiftType; onRemove: () => void; published: boolean }) {
  const c = SHIFT_CFG[type];
  return (
    <Tooltip title={`${c.label} (${c.time})`} placement="top">
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        backgroundColor: c.bg, color: c.text,
        border: `1px solid ${c.border}`, borderRadius: '8px',
        px: 1, py: 0.5, fontSize: '11px', fontWeight: 700,
        whiteSpace: 'nowrap', cursor: 'default', userSelect: 'none',
      }}>
        <span>{c.emoji}</span>
        <span>{c.label.slice(0, 3).toUpperCase()}</span>
        {!published && (
          <IconButton
            size="small"
            onClick={e => { e.stopPropagation(); onRemove(); }}
            sx={{ p: 0, ml: '2px', color: c.text, '&:hover': { color: '#ef4444' } }}
          >
            <Close sx={{ fontSize: 10 }} />
          </IconButton>
        )}
      </Box>
    </Tooltip>
  );
}

// ─── Empty cell ──────────────────────────────────────────────────────────────

function EmptyCell({ onClick, published }: { onClick: () => void; published: boolean }) {
  if (published) return <Box sx={{ width: '100%', height: '100%' }} />;
  return (
    <Tooltip title="Assign shift" placement="top">
      <Box
        onClick={onClick}
        sx={{
          width: '36px', height: '36px', borderRadius: '8px',
          border: '1.5px dashed #D1D5DB', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#9CA3AF',
          transition: 'all 0.15s',
          '&:hover': { borderColor: colors.primary.blue, color: colors.primary.blue, backgroundColor: '#EFF6FF' },
        }}
      >
        <Add sx={{ fontSize: 16 }} />
      </Box>
    </Tooltip>
  );
}

// ─── Shift Picker Dialog ─────────────────────────────────────────────────────

function ShiftPickerDialog({
  open, workerName, date, onPick, onClose,
}: {
  open: boolean; workerName: string; date: string;
  onPick: (t: ShiftType) => void; onClose: () => void;
}) {
  const dateLabel = date ? new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', fontFamily: 'Outfit, system-ui, sans-serif' } }}>
      <DialogTitle sx={{ fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 700, pb: 0 }}>
        Assign Shift
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}><Close /></IconButton>
      </DialogTitle>
      <Box sx={{ px: 3, pb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
          {workerName} · {dateLabel}
        </Typography>
      </Box>
      <DialogContent sx={{ pt: 1, pb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {(Object.keys(SHIFT_CFG) as ShiftType[]).map(type => {
            const c = SHIFT_CFG[type];
            return (
              <Button
                key={type}
                onClick={() => onPick(type)}
                fullWidth
                sx={{
                  justifyContent: 'flex-start', textAlign: 'left',
                  backgroundColor: c.bg, color: c.text,
                  border: `1px solid ${c.border}`, borderRadius: '12px',
                  py: 1.5, px: 2, gap: 2,
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontWeight: 600, textTransform: 'none',
                  '&:hover': { backgroundColor: c.bg, filter: 'brightness(0.96)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' },
                }}
              >
                <Box sx={{ fontSize: 24, lineHeight: 1 }}>{c.emoji}</Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontFamily: 'Outfit', fontSize: 14, color: c.text }}>{c.label}</Typography>
                  <Typography sx={{ fontFamily: 'Outfit', fontSize: 12, color: c.text, opacity: 0.7 }}>{c.time}</Typography>
                </Box>
              </Button>
            );
          })}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  open, title, message, confirmLabel, confirmColor, onConfirm, onClose,
}: {
  open: boolean; title: string; message: string;
  confirmLabel: string; confirmColor?: string;
  onConfirm: () => void; onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
      <DialogTitle sx={{ fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontFamily: 'Outfit, system-ui, sans-serif', color: '#6B7280' }}>{message}</Typography>
      </DialogContent>
      <Box sx={{ display: 'flex', gap: 1.5, px: 3, pb: 3, justifyContent: 'flex-end' }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '10px', textTransform: 'none', fontFamily: 'Outfit', fontWeight: 600, borderColor: '#E5E7EB', color: '#374151', '&:hover': { borderColor: '#D1D5DB', backgroundColor: '#F9FAFB' } }}>
          Cancel
        </Button>
        <Button
          onClick={() => { onConfirm(); onClose(); }}
          variant="contained"
          sx={{ borderRadius: '10px', textTransform: 'none', fontFamily: 'Outfit', fontWeight: 600, backgroundColor: confirmColor ?? colors.primary.blue, '&:hover': { backgroundColor: confirmColor ?? colors.interactive.hover } }}
        >
          {confirmLabel}
        </Button>
      </Box>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function RotaPage() {
  useDocumentTitle('Rota Builder');

  const [currentMonday, setCurrentMonday] = useState<Date>(getMondayOfWeek(new Date()));
  const [picker, setPicker] = useState<{ worker: RotaWorker; date: string } | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [toast, setToast] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const weekStart = isoDate(currentMonday);
  const { data, isLoading, isFetching } = useGetWeekRotaQuery({ weekStart });

  const [assignWorker, { isLoading: assigning }] = useAssignWorkerMutation();
  const [unassignWorker] = useUnassignWorkerMutation();
  const [publishRota, { isLoading: publishing }] = usePublishRotaMutation();
  const [unpublishRota, { isLoading: unpublishing }] = useUnpublishRotaMutation();

  const rota = data?.rota;
  const workers = data?.workers ?? [];
  const stats = data?.stats;
  const published = rota?.status === 'PUBLISHED';

  // Filter workers by search query
  const filteredWorkers = workers.filter(w =>
    w.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const weekDates = Array.from({ length: 7 }, (_, i) => isoDate(addDays(currentMonday, i)));

  const navigateWeek = (dir: -1 | 1) => setCurrentMonday(prev => addDays(prev, dir * 7));

  const handlePickShift = useCallback(async (shiftType: ShiftType) => {
    if (!rota || !picker) return;
    setPicker(null);
    try {
      await assignWorker({ rotaId: rota.id, workerId: picker.worker.id, date: picker.date, shiftType }).unwrap();
      setToast({ msg: `${shiftType.charAt(0).toUpperCase() + shiftType.slice(1)} shift assigned to ${picker.worker.fullName}`, severity: 'success' });
    } catch (err: any) {
      setToast({ msg: err?.data?.message || 'Failed to assign shift', severity: 'error' });
    }
  }, [rota, picker, assignWorker]);

  const handleRemove = useCallback(async (worker: RotaWorker, assignment: RotaAssignment) => {
    if (!rota) return;
    try {
      await unassignWorker({ rotaId: rota.id, workerId: worker.id, rotaShiftId: assignment.rotaShiftId }).unwrap();
    } catch {
      setToast({ msg: 'Failed to remove shift', severity: 'error' });
    }
  }, [rota, unassignWorker]);

  const handlePublish = useCallback(async () => {
    if (!rota) return;
    try {
      if (published) {
        await unpublishRota(rota.id).unwrap();
        setToast({ msg: 'Rota unpublished — back to draft', severity: 'success' });
      } else {
        await publishRota(rota.id).unwrap();
        setToast({ msg: `Rota published! ${stats?.totalAssignments ?? 0} workers notified via push notification`, severity: 'success' });
      }
    } catch {
      setToast({ msg: 'Action failed', severity: 'error' });
    }
  }, [rota, published, publishRota, unpublishRota, stats]);

  // Workers on leave this week with conflicting assignments
  const warnings = workers.filter(w =>
    w.holidayDates.some(hd => weekDates.includes(hd)) &&
    w.assignments.some(a => w.holidayDates.includes(a.date))
  );

  // ── Render loading state ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <DashboardContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress size={40} sx={{ color: colors.primary.blue }} />
        </Box>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <PageWrapper>

        {/* ── Page Header ──────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: colors.primary.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GridView sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22, color: colors.primary.navy, lineHeight: 1.2 }}>
                Rota Builder
              </Typography>
              <Typography sx={{ fontFamily: 'Outfit', fontSize: 13, color: '#6B7280' }}>
                {filteredWorkers.length} of {workers.length} worker{workers.length !== 1 ? 's' : ''} · {rota?.name ?? 'Loading…'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Search input */}
            <TextField
              placeholder="Search workers..."
              size="small"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#9CA3AF', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 240,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  fontFamily: 'Outfit',
                  backgroundColor: '#fff',
                  '& fieldset': { borderColor: '#E5E7EB' },
                  '&:hover fieldset': { borderColor: colors.primary.blue },
                  '&.Mui-focused fieldset': { borderColor: colors.primary.blue },
                },
              }}
            />
            {/* Add Worker button */}
            <Button
              variant="outlined"
              startIcon={<PersonAdd />}
              onClick={() => setInviteModalOpen(true)}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontFamily: 'Outfit',
                fontWeight: 700,
                borderColor: colors.primary.blue,
                color: colors.primary.blue,
                '&:hover': { borderColor: colors.interactive.hover, backgroundColor: '#EFF6FF' },
              }}
            >
              Add Worker
            </Button>
            {/* Status badge */}
            <Chip
              label={rota?.status ?? 'DRAFT'}
              size="small"
              sx={{
                fontFamily: 'Outfit', fontWeight: 700, fontSize: 12,
                backgroundColor: published ? '#DCFCE7' : '#FEF9C3',
                color: published ? '#15803D' : '#A16207',
                borderRadius: '8px',
              }}
              icon={published ? <CheckCircle sx={{ color: '#15803D !important', fontSize: '14px !important' }} /> : undefined}
            />
            {/* Publish button */}
            <Button
              variant="contained"
              onClick={() => setConfirmPublish(true)}
              disabled={publishing || unpublishing}
              startIcon={published ? <CloudOff /> : <CloudUpload />}
              sx={{
                backgroundColor: published ? '#EF4444' : '#10B981',
                '&:hover': { backgroundColor: published ? '#DC2626' : '#059669' },
                borderRadius: '10px', textTransform: 'none',
                fontFamily: 'Outfit', fontWeight: 700, px: 2.5,
              }}
            >
              {publishing || unpublishing ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : published ? 'Unpublish' : 'Publish Rota'}
            </Button>
          </Box>
        </Box>

        {/* ── Stats Cards ──────────────────────────────────────────── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
          {[
            { label: 'Total Shifts', value: stats?.totalAssignments ?? 0, icon: '📋', bg: '#EFF6FF', color: '#1D4ED8' },
            { label: 'Total Hours',  value: `${stats?.totalHours ?? 0}h`,   icon: '⏱️', bg: '#F0FDF4', color: '#15803D' },
            { label: 'Est. Cost',    value: `£${(stats?.estimatedCost ?? 0).toLocaleString()}`, icon: '💷', bg: '#FFFBEB', color: '#92400E' },
            { label: 'On Leave',     value: stats?.workersOnHoliday ?? 0,   icon: '🏖️', bg: '#FFF1F2', color: '#BE123C' },
          ].map(s => (
            <Box key={s.label} sx={{ backgroundColor: '#fff', borderRadius: '14px', p: 2.5, border: `1px solid ${colors.border.light}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</Box>
                <Box>
                  <Typography sx={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22, color: s.color, lineHeight: 1.2 }}>{s.value}</Typography>
                  <Typography sx={{ fontFamily: 'Outfit', fontSize: 12, color: '#9CA3AF' }}>{s.label}</Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* ── Warnings ──────────────────────────────────────────────── */}
        {warnings.length > 0 && (
          <Alert
            severity="warning"
            icon={<Warning />}
            sx={{ mb: 3, borderRadius: '12px', fontFamily: 'Outfit', '& .MuiAlert-message': { fontFamily: 'Outfit' } }}
          >
            <Typography sx={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13 }}>Replacement needed</Typography>
            {warnings.map(w => (
              <Typography key={w.id} sx={{ fontFamily: 'Outfit', fontSize: 12, color: '#92400E' }}>
                {w.fullName} is on leave but has shifts assigned this week
              </Typography>
            ))}
          </Alert>
        )}

        {/* ── Week Navigation ───────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigateWeek(-1)} sx={{ border: `1px solid ${colors.border.light}`, borderRadius: '10px', backgroundColor: '#fff' }}>
            <ChevronLeft />
          </IconButton>
          <Typography sx={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16, color: colors.primary.navy, minWidth: 260, textAlign: 'center' }}>
            {formatWeekLabel(currentMonday)}
          </Typography>
          <IconButton onClick={() => navigateWeek(1)} sx={{ border: `1px solid ${colors.border.light}`, borderRadius: '10px', backgroundColor: '#fff' }}>
            <ChevronRight />
          </IconButton>
          {isFetching && <CircularProgress size={16} sx={{ color: colors.primary.blue }} />}
          {/* Legend */}
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            {(Object.keys(SHIFT_CFG) as ShiftType[]).map(t => (
              <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '3px', backgroundColor: SHIFT_CFG[t].border }} />
                <Typography sx={{ fontFamily: 'Outfit', fontSize: 11, color: '#6B7280' }}>{SHIFT_CFG[t].label}</Typography>
              </Box>
            ))}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <WbSunny sx={{ fontSize: 12, color: '#F59E0B' }} />
              <Typography sx={{ fontFamily: 'Outfit', fontSize: 11, color: '#6B7280' }}>Leave</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '3px', backgroundColor: '#F3F4F6' }} />
              <Typography sx={{ fontFamily: 'Outfit', fontSize: 11, color: '#6B7280' }}>Unavailable</Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Grid ─────────────────────────────────────────────────── */}
        <GridWrapper>
          {/* Header row */}
          <Box sx={{ display: 'flex', borderBottom: `2px solid ${colors.border.light}` }}>
            {/* Name col header */}
            <Box sx={{ width: `${NAME_COL_W}px`, minWidth: `${NAME_COL_W}px`, p: '12px 16px', borderRight: `1px solid ${colors.border.light}`, backgroundColor: '#F8FAFC', position: 'sticky', left: 0, zIndex: 3, flexShrink: 0 }}>
              <Typography sx={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 11, color: '#9CA3AF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Worker
              </Typography>
            </Box>
            {weekDates.map((date, i) => {
              const { day, num, isToday } = formatDayHeader(addDays(currentMonday, i));
              return (
                <HeaderCell key={date} isToday={isToday}>
                  <Typography sx={{ fontFamily: 'Outfit', fontWeight: isToday ? 800 : 600, fontSize: 11, color: isToday ? colors.primary.blue : '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {day}
                  </Typography>
                  <Typography sx={{ fontFamily: 'Outfit', fontWeight: isToday ? 800 : 600, fontSize: 18, color: isToday ? colors.primary.blue : colors.primary.navy, lineHeight: 1.3 }}>
                    {num}
                  </Typography>
                  {/* Shift count dots */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: '3px', mt: 0.5, minHeight: 8 }}>
                    {(Object.keys(SHIFT_CFG) as ShiftType[]).map(t => {
                      const count = data?.shiftCounts?.[t]?.[i] ?? 0;
                      return count > 0 ? (
                        <Tooltip key={t} title={`${count} ${t} shift${count !== 1 ? 's' : ''}`}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: SHIFT_CFG[t].border }} />
                        </Tooltip>
                      ) : null;
                    })}
                  </Box>
                </HeaderCell>
              );
            })}
          </Box>

          {/* Worker rows */}
          {filteredWorkers.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography sx={{ fontFamily: 'Outfit', color: '#9CA3AF', fontSize: 15 }}>
                {searchQuery ? 'No workers match your search' : 'No active workers found'}
              </Typography>
              {!searchQuery && (
                <Button
                  variant="outlined"
                  startIcon={<PersonAdd />}
                  onClick={() => setInviteModalOpen(true)}
                  sx={{ mt: 2, borderRadius: '10px', fontFamily: 'Outfit', fontWeight: 700 }}
                >
                  Add Your First Worker
                </Button>
              )}
            </Box>
          ) : (
            filteredWorkers.map((worker, wi) => (
              <Box
                key={worker.id}
                sx={{
                  display: 'flex',
                  borderBottom: `1px solid ${colors.border.light}`,
                  backgroundColor: wi % 2 === 0 ? '#fff' : '#FAFAFA',
                  '&:last-child': { borderBottom: 'none' },
                  '&:hover': { backgroundColor: '#F0F9FF' },
                  transition: 'background-color 0.1s',
                }}
              >
                {/* Worker name */}
                <RowNameCell sx={{ backgroundColor: wi % 2 === 0 ? '#fff' : '#FAFAFA', '&:hover': { backgroundColor: '#F0F9FF' } }}>
                  <Avatar sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 700, fontFamily: 'Outfit', backgroundColor: avatarColor(worker.fullName), flexShrink: 0 }}>
                    {getInitials(worker.fullName)}
                  </Avatar>
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography sx={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: colors.primary.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {worker.fullName}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {worker.hourlyRate && (
                        <Typography sx={{ fontFamily: 'Outfit', fontSize: 10, color: '#9CA3AF' }}>£{worker.hourlyRate}/h</Typography>
                      )}
                      {worker.assignments.length > 0 && (
                        <Chip label={`${worker.assignments.length} shift${worker.assignments.length !== 1 ? 's' : ''}`} size="small" sx={{ height: 16, fontSize: 9, fontFamily: 'Outfit', fontWeight: 700, backgroundColor: '#F0FDF4', color: '#15803D', borderRadius: '4px', '& .MuiChip-label': { px: 0.8 } }} />
                      )}
                    </Box>
                  </Box>
                </RowNameCell>

                {/* Day cells */}
                {weekDates.map((date, di) => {
                  const isHoliday = worker.holidayDates.includes(date);
                  const isUnavailable = worker.unavailableDays.includes(di);
                  const assignment = worker.assignments.find(a => a.date === date);

                  if (isHoliday) {
                    return (
                      <DataCell key={date} sx={{ backgroundColor: '#FFFBEB', flexDirection: 'column', gap: 0.5 }}>
                        <BeachAccess sx={{ fontSize: 18, color: '#F59E0B' }} />
                        <Typography sx={{ fontFamily: 'Outfit', fontSize: 9, color: '#92400E', fontWeight: 600 }}>Leave</Typography>
                      </DataCell>
                    );
                  }

                  if (isUnavailable) {
                    return (
                      <DataCell key={date} sx={{ backgroundColor: '#F9FAFB' }}>
                        <Tooltip title="Not available">
                          <Typography sx={{ fontFamily: 'Outfit', fontSize: 10, color: '#D1D5DB', fontWeight: 600, userSelect: 'none' }}>N/A</Typography>
                        </Tooltip>
                      </DataCell>
                    );
                  }

                  if (assignment) {
                    return (
                      <DataCell key={date}>
                        <ShiftPill type={assignment.shiftType} published={published} onRemove={() => handleRemove(worker, assignment)} />
                      </DataCell>
                    );
                  }

                  return (
                    <DataCell key={date}>
                      <EmptyCell published={published} onClick={() => setPicker({ worker, date })} />
                    </DataCell>
                  );
                })}
              </Box>
            ))
          )}
        </GridWrapper>

        {/* Modals */}
        <ShiftPickerDialog
          open={!!picker}
          workerName={picker?.worker.fullName ?? ''}
          date={picker?.date ?? ''}
          onPick={handlePickShift}
          onClose={() => setPicker(null)}
        />

        <ConfirmDialog
          open={confirmPublish}
          title={published ? 'Unpublish Rota?' : 'Publish Rota?'}
          message={
            published
              ? 'Workers will no longer see this schedule in their app.'
              : `This will publish the rota and send push notifications to ${stats?.totalAssignments ?? 0} assigned worker(s).`
          }
          confirmLabel={published ? 'Unpublish' : 'Publish & Notify'}
          confirmColor={published ? '#EF4444' : '#10B981'}
          onConfirm={handlePublish}
          onClose={() => setConfirmPublish(false)}
        />

        <InviteWorkerModal
          open={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
        />

        <Snackbar
          open={!!toast}
          autoHideDuration={4000}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setToast(null)} severity={toast?.severity ?? 'success'} sx={{ borderRadius: '12px', fontFamily: 'Outfit', '& .MuiAlert-message': { fontFamily: 'Outfit' } }}>
            {toast?.msg}
          </Alert>
        </Snackbar>

      </PageWrapper>
    </DashboardContainer>
  );
}
