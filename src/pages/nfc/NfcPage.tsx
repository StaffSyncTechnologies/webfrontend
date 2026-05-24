import { useState, useMemo } from 'react';
import {
  Box,
  styled,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Wifi,
  Delete,
  PowerSettingsNew,
  QrCode2,
  ContentCopy,
  CheckCircle,
  Close,
  ToggleOff,
  Download,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { DashboardContainer } from '../../components/layout/DashboardContainer';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../hooks';
import { colors } from '../../utilities/colors';
import {
  useGetNfcClockPointsQuery,
  useCreateNfcClockPointMutation,
  useActivateNfcPointMutation,
  useDeactivateNfcPointMutation,
  useDeleteNfcPointMutation,
  useGetLocationsQuery,
  type NfcClockPoint,
  type NfcPointStatus,
} from '../../store/slices/nfcSlice';

// ─── Constants ────────────────────────────────────────────────────────────────

const NFC_URI_PREFIX = 'staffsync-worker://nfc-clock/';

const STATUS_CONFIG: Record<NfcPointStatus, { label: string; bg: string; color: string }> = {
  ACTIVE:   { label: 'Active',   bg: '#D1FAE5', color: '#059669' },
  PENDING:  { label: 'Pending',  bg: '#FEF3C7', color: '#D97706' },
  INACTIVE: { label: 'Inactive', bg: '#FFE4E6', color: '#DC2626' },
};

// ─── Styled Components ────────────────────────────────────────────────────────

const HeaderRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: '16px',
});

const PageTitle = styled('h1')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1.75rem',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: 0,
});

const PageSubtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  color: colors.text.secondary,
  margin: '4px 0 0',
});

const StatsGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '20px',
  marginTop: '24px',
  '@media (max-width: 1100px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
  '@media (max-width: 600px)':  { gridTemplateColumns: '1fr' },
});

const StatCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  padding: '20px 24px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

const StatIcon = styled(Box, {
  shouldForwardProp: (p) => p !== 'bgColor',
})<{ bgColor: string }>(({ bgColor }) => ({
  width: 44,
  height: 44,
  borderRadius: '10px',
  backgroundColor: bgColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}));

const StatValue = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1.5rem',
  fontWeight: 700,
  color: colors.primary.navy,
  lineHeight: 1.2,
});

const StatLabel = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.8125rem',
  color: colors.text.secondary,
});

const TableCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  marginTop: '24px',
  overflow: 'hidden',
});

const TabsRow = styled(Box)({
  display: 'flex',
  borderBottom: '1px solid #E5E7EB',
  padding: '0 8px',
  gap: '4px',
});

const Tab = styled('button', {
  shouldForwardProp: (p) => p !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: active ? colors.primary.blue : colors.text.secondary,
  backgroundColor: 'transparent',
  border: 'none',
  borderBottom: active ? `2px solid ${colors.primary.blue}` : '2px solid transparent',
  padding: '14px 16px',
  cursor: 'pointer',
  transition: 'color 0.15s',
  '&:hover': { color: colors.primary.navy },
}));

const Table = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
});

const Th = styled('th')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  color: colors.text.secondary,
  textAlign: 'left',
  padding: '12px 20px',
  borderBottom: '1px solid #F3F4F6',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  backgroundColor: '#FAFAFA',
});

const Td = styled('td')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.primary.navy,
  padding: '14px 20px',
  borderBottom: '1px solid #F3F4F6',
  verticalAlign: 'middle',
});

const TagCodeBox = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  backgroundColor: '#F3F4F6',
  border: '1px solid #E5E7EB',
  borderRadius: '6px',
  padding: '4px 10px',
  fontFamily: 'monospace',
  fontSize: '13px',
  color: colors.primary.navy,
  cursor: 'pointer',
  userSelect: 'all',
  '&:hover': { backgroundColor: '#E5E7EB' },
});

const ActionBtn = styled(IconButton)({
  width: 32,
  height: 32,
  borderRadius: '8px',
  '&:hover': { backgroundColor: '#F3F4F6' },
});

const CreateBtn = styled(Button)({
  fontFamily: "'Outfit', sans-serif",
  textTransform: 'none',
  borderRadius: '8px',
  fontWeight: 600,
  backgroundColor: colors.primary.blue,
  color: '#FFFFFF',
  padding: '8px 20px',
  '&:hover': { backgroundColor: colors.interactive.hover },
});

const DialogLabel = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  color: colors.text.secondary,
  marginBottom: '4px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── QR Code Dialog ───────────────────────────────────────────────────────────

interface QrDialogProps {
  point: NfcClockPoint | null;
  onClose: () => void;
}

function QrDialog({ point, onClose }: QrDialogProps) {
  const toast = useToast();
  if (!point) return null;

  const uri = `${NFC_URI_PREFIX}${point.tagCode}`;

  const handleCopyUri = () => {
    navigator.clipboard.writeText(uri).then(() => toast.success('URI copied to clipboard'));
  };

  const handleDownloadSvg = () => {
    const svgEl = document.getElementById('nfc-qr-svg');
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${point.tagCode}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      open={!!point}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '18px', color: colors.primary.navy }}>
            QR Code
          </Box>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: colors.text.secondary, mt: 0.25 }}>
            {point.name}
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, pt: 1 }}>
        {/* QR Code */}
        <Box
          sx={{
            p: 3,
            borderRadius: '16px',
            border: '2px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
            display: 'inline-flex',
          }}
        >
          <QRCodeSVG
            id="nfc-qr-svg"
            value={uri}
            size={200}
            fgColor={colors.primary.navy}
            bgColor="#FFFFFF"
            level="M"
            includeMargin={false}
          />
        </Box>

        {/* URI display */}
        <Box sx={{ width: '100%' }}>
          <DialogLabel>Encoded URI</DialogLabel>
          <Box
            onClick={handleCopyUri}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '10px 14px',
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#F3F4F6' },
            }}
          >
            <Box sx={{ fontFamily: 'monospace', fontSize: '12px', color: colors.primary.navy, wordBreak: 'break-all' }}>
              {uri}
            </Box>
            <ContentCopy sx={{ fontSize: 16, color: colors.text.secondary, ml: 1, flexShrink: 0 }} />
          </Box>
        </Box>

        {/* Instructions */}
        <Box
          sx={{
            width: '100%',
            backgroundColor: `${colors.primary.blue}10`,
            border: `1px solid ${colors.primary.blue}30`,
            borderRadius: '10px',
            p: 2,
          }}
        >
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: 600, color: colors.primary.blue, mb: 1 }}>
            How workers use this:
          </Box>
          {[
            'Open the StaffSync Worker app',
            'Tap the QR Code clock-in button on the clock screen',
            'Point the camera at this QR code',
            'The app records attendance automatically',
          ].map((step, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: colors.primary.blue, fontWeight: 700, flexShrink: 0 }}>
                {i + 1}.
              </Box>
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: colors.primary.navy }}>
                {step}
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleDownloadSvg}
          sx={{ fontFamily: "'Outfit', sans-serif", textTransform: 'none', borderRadius: '8px', flex: 1 }}
        >
          Download SVG
        </Button>
        <Button
          variant="contained"
          startIcon={<ContentCopy />}
          onClick={handleCopyUri}
          sx={{ fontFamily: "'Outfit', sans-serif", textTransform: 'none', borderRadius: '8px', flex: 1, backgroundColor: colors.primary.blue, '&:hover': { backgroundColor: colors.interactive.hover } }}
        >
          Copy URI
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Create NFC Point Dialog ──────────────────────────────────────────────────

interface CreateDialogProps {
  open: boolean;
  onClose: () => void;
}

function CreateNfcPointDialog({ open, onClose }: CreateDialogProps) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [locationId, setLocationId] = useState<string>('');

  const { data: locations = [], isLoading: locationsLoading } = useGetLocationsQuery();
  const [createPoint, { isLoading }] = useCreateNfcClockPointMutation();

  const handleClose = () => {
    setName('');
    setNameError('');
    setLocationId('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setNameError('Name must be at least 2 characters.');
      return;
    }
    setNameError('');
    try {
      await createPoint({
        name: name.trim(),
        locationId: locationId || undefined,
      }).unwrap();
      toast.success('NFC clock point created! Workers can now use it to clock in via QR code.');
      handleClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Failed to create NFC clock point.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '18px', color: colors.primary.navy }}>
            New NFC Clock Point
          </Box>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: colors.text.secondary, mt: 0.25 }}>
            A unique tag code will be generated automatically
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
        {/* Info banner */}
        <Alert
          severity="info"
          icon={<Wifi />}
          sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', borderRadius: '10px' }}
        >
          After creating, download the QR code from the point list and print it for your work site.
        </Alert>

        {/* Name field */}
        <Box>
          <DialogLabel>Clock Point Name *</DialogLabel>
          <TextField
            fullWidth
            value={name}
            onChange={(e) => { setName(e.target.value); if (nameError) setNameError(''); }}
            placeholder="e.g. Main Entrance, Reception, Warehouse Door A"
            error={!!nameError}
            helperText={nameError}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
              },
              '& .MuiFormHelperText-root': { fontFamily: "'Outfit', sans-serif" },
            }}
          />
        </Box>

        {/* Location picker */}
        <Box>
          <DialogLabel>Work Site (Optional)</DialogLabel>
          <FormControl fullWidth>
            <Select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              displayEmpty
              disabled={locationsLoading}
              sx={{
                borderRadius: '10px',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
              }}
            >
              <MenuItem value="">
                <Box sx={{ fontFamily: "'Outfit', sans-serif", color: colors.text.secondary }}>
                  Any site / no restriction
                </Box>
              </MenuItem>
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id} sx={{ fontFamily: "'Outfit', sans-serif" }}>
                  <Box>
                    <Box sx={{ fontWeight: 600 }}>{loc.name}</Box>
                    {loc.address && (
                      <Box sx={{ fontSize: '12px', color: colors.text.secondary }}>{loc.address}</Box>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary, mt: 0.75 }}>
            Link this NFC point to a site so it's only valid at that location.
          </Box>
        </Box>

        {/* What happens */}
        <Box
          sx={{
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            p: 2,
          }}
        >
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '14px', color: colors.primary.navy, mb: 1.5 }}>
            What happens next?
          </Box>
          {[
            { icon: '🔑', text: 'A unique tag code is generated (e.g. SS_NFC_8F92KDA)' },
            { icon: '✅', text: 'The point becomes Active immediately and is usable by workers' },
            { icon: '📱', text: 'Download the QR code from this page and print/display it at your site' },
          ].map((item, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
              <Box sx={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</Box>
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: colors.text.secondary }}>
                {item.text}
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
        <Button
          onClick={handleClose}
          sx={{ fontFamily: "'Outfit', sans-serif", textTransform: 'none', borderRadius: '8px', color: colors.text.secondary }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <Add />}
          sx={{
            fontFamily: "'Outfit', sans-serif",
            textTransform: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            backgroundColor: colors.primary.blue,
            '&:hover': { backgroundColor: colors.interactive.hover },
            minWidth: 160,
          }}
        >
          {isLoading ? 'Creating…' : 'Create Clock Point'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

interface DeleteDialogProps {
  point: NfcClockPoint | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

function DeleteDialog({ point, onClose, onConfirm, isDeleting }: DeleteDialogProps) {
  return (
    <Dialog
      open={!!point}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: '12px' } }}
    >
      <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>Delete NFC Point</DialogTitle>
      <DialogContent>
        <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.text.secondary }}>
          Are you sure you want to permanently delete{' '}
          <strong style={{ color: colors.primary.navy }}>{point?.name}</strong>?
          This cannot be undone, and workers will no longer be able to clock in using this tag or its QR code.
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{ fontFamily: "'Outfit', sans-serif", textTransform: 'none', borderRadius: '8px' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={14} color="inherit" /> : <Delete />}
          sx={{ fontFamily: "'Outfit', sans-serif", textTransform: 'none', borderRadius: '8px' }}
        >
          {isDeleting ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: Array<{ label: string; value: NfcPointStatus | 'ALL' }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Inactive', value: 'INACTIVE' },
];

export function NfcPage() {
  useDocumentTitle('NFC & QR Clock Points');
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<NfcPointStatus | 'ALL'>('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [qrPoint, setQrPoint] = useState<NfcClockPoint | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NfcClockPoint | null>(null);

  const queryArg = activeTab === 'ALL' ? undefined : { status: activeTab };
  const { data, isLoading, error } = useGetNfcClockPointsQuery(queryArg);
  const points = data?.data ?? [];

  const [activatePoint, { isLoading: activating }]     = useActivateNfcPointMutation();
  const [deactivatePoint, { isLoading: deactivating }] = useDeactivateNfcPointMutation();
  const [deletePoint, { isLoading: deleting }]         = useDeleteNfcPointMutation();

  const { data: allData } = useGetNfcClockPointsQuery(undefined);
  const allPoints = allData?.data ?? [];

  const stats = useMemo(() => ({
    total:    allPoints.length,
    active:   allPoints.filter((p) => p.status === 'ACTIVE').length,
    pending:  allPoints.filter((p) => p.status === 'PENDING').length,
    inactive: allPoints.filter((p) => p.status === 'INACTIVE').length,
  }), [allPoints]);

  const tabCounts: Record<NfcPointStatus | 'ALL', number> = {
    ALL:      stats.total,
    ACTIVE:   stats.active,
    PENDING:  stats.pending,
    INACTIVE: stats.inactive,
  };

  const handleActivate = async (point: NfcClockPoint) => {
    try {
      await activatePoint(point.id).unwrap();
      toast.success(`${point.name} activated`);
    } catch {
      toast.error('Failed to activate NFC point');
    }
  };

  const handleDeactivate = async (point: NfcClockPoint) => {
    try {
      await deactivatePoint(point.id).unwrap();
      toast.success(`${point.name} deactivated`);
    } catch {
      toast.error('Failed to deactivate NFC point');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deletePoint(deleteTarget.id).unwrap();
      toast.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete NFC point');
    }
  };

  const handleCopyTagCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => toast.success('Tag code copied'));
  };

  return (
    <DashboardContainer>
      {/* Header */}
      <HeaderRow>
        <Box>
          <PageTitle>NFC &amp; QR Clock Points</PageTitle>
          <PageSubtitle>
            Manage NFC tags and QR codes that workers use to clock in at your work sites
          </PageSubtitle>
        </Box>
        <CreateBtn
          startIcon={<Add />}
          onClick={() => setCreateOpen(true)}
          disableElevation
        >
          New Clock Point
        </CreateBtn>
      </HeaderRow>

      {/* Stats */}
      <StatsGrid>
        <StatCard>
          <StatIcon bgColor="#EFF6FF">
            <Wifi sx={{ color: colors.primary.blue, fontSize: 22 }} />
          </StatIcon>
          <Box>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Points</StatLabel>
          </Box>
        </StatCard>
        <StatCard>
          <StatIcon bgColor="#D1FAE5">
            <CheckCircle sx={{ color: '#059669', fontSize: 22 }} />
          </StatIcon>
          <Box>
            <StatValue>{stats.active}</StatValue>
            <StatLabel>Active</StatLabel>
          </Box>
        </StatCard>
        <StatCard>
          <StatIcon bgColor="#FEF3C7">
            <PowerSettingsNew sx={{ color: '#D97706', fontSize: 22 }} />
          </StatIcon>
          <Box>
            <StatValue>{stats.pending}</StatValue>
            <StatLabel>Pending</StatLabel>
          </Box>
        </StatCard>
        <StatCard>
          <StatIcon bgColor="#FFE4E6">
            <ToggleOff sx={{ color: '#DC2626', fontSize: 22 }} />
          </StatIcon>
          <Box>
            <StatValue>{stats.inactive}</StatValue>
            <StatLabel>Inactive</StatLabel>
          </Box>
        </StatCard>
      </StatsGrid>

      {/* Table */}
      <TableCard>
        {/* Tabs */}
        <TabsRow>
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              active={activeTab === tab.value}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label} ({tabCounts[tab.value]})
            </Tab>
          ))}
        </TabsRow>

        {/* Content */}
        <Box sx={{ overflowX: 'auto' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress sx={{ color: colors.primary.blue }} />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 8, color: colors.status.error, fontFamily: "'Outfit', sans-serif" }}>
              Failed to load NFC clock points. Please try again.
            </Box>
          ) : points.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10, px: 4 }}>
              <Wifi sx={{ fontSize: 56, color: '#D1D5DB', mb: 2 }} />
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '18px', color: colors.primary.navy, mb: 1 }}>
                {activeTab === 'ALL' ? 'No NFC Clock Points Yet' : `No ${activeTab.charAt(0) + activeTab.slice(1).toLowerCase()} Points`}
              </Box>
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.text.secondary, mb: 3, maxWidth: 400, mx: 'auto' }}>
                {activeTab === 'ALL'
                  ? 'Create your first NFC clock point to let workers clock in by tapping an NFC sticker or scanning a QR code at your work site.'
                  : 'No points match this filter.'}
              </Box>
              {activeTab === 'ALL' && (
                <CreateBtn startIcon={<Add />} onClick={() => setCreateOpen(true)} disableElevation>
                  Create First Clock Point
                </CreateBtn>
              )}
            </Box>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Tag Code</Th>
                  <Th>Site</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {points.map((point) => {
                  const statusCfg = STATUS_CONFIG[point.status];
                  return (
                    <tr key={point.id}>
                      <Td>
                        <Box sx={{ fontWeight: 600 }}>{point.name}</Box>
                      </Td>

                      <Td>
                        <TagCodeBox onClick={() => handleCopyTagCode(point.tagCode)}>
                          {point.tagCode}
                          <ContentCopy sx={{ fontSize: 13, color: colors.text.secondary }} />
                        </TagCodeBox>
                      </Td>

                      <Td sx={{ color: point.location ? colors.primary.navy : colors.text.secondary }}>
                        {point.location?.name ?? '—'}
                      </Td>

                      <Td>
                        <Chip
                          label={statusCfg.label}
                          size="small"
                          sx={{
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: 600,
                            fontSize: '12px',
                            backgroundColor: statusCfg.bg,
                            color: statusCfg.color,
                            borderRadius: '8px',
                          }}
                        />
                      </Td>

                      <Td sx={{ color: colors.text.secondary, fontSize: '13px' }}>
                        {formatDate(point.createdAt)}
                      </Td>

                      <Td>
                        <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          {/* QR Code button — always available */}
                          <Tooltip title="View QR Code">
                            <ActionBtn onClick={() => setQrPoint(point)} size="small">
                              <QrCode2 sx={{ fontSize: 18, color: colors.primary.blue }} />
                            </ActionBtn>
                          </Tooltip>

                          {/* Activate (INACTIVE) */}
                          {point.status === 'INACTIVE' && (
                            <Tooltip title="Activate">
                              <ActionBtn
                                size="small"
                                onClick={() => handleActivate(point)}
                                disabled={activating}
                              >
                                <CheckCircle sx={{ fontSize: 18, color: '#059669' }} />
                              </ActionBtn>
                            </Tooltip>
                          )}

                          {/* Activate (PENDING — mark as active) */}
                          {point.status === 'PENDING' && (
                            <Tooltip title="Mark Active">
                              <ActionBtn
                                size="small"
                                onClick={() => handleActivate(point)}
                                disabled={activating}
                              >
                                <CheckCircle sx={{ fontSize: 18, color: '#D97706' }} />
                              </ActionBtn>
                            </Tooltip>
                          )}

                          {/* Deactivate (ACTIVE) */}
                          {point.status === 'ACTIVE' && (
                            <Tooltip title="Deactivate">
                              <ActionBtn
                                size="small"
                                onClick={() => handleDeactivate(point)}
                                disabled={deactivating}
                              >
                                <ToggleOff sx={{ fontSize: 18, color: '#DC2626' }} />
                              </ActionBtn>
                            </Tooltip>
                          )}

                          {/* Delete */}
                          <Tooltip title="Delete">
                            <ActionBtn
                              size="small"
                              onClick={() => setDeleteTarget(point)}
                            >
                              <Delete sx={{ fontSize: 18, color: '#DC2626' }} />
                            </ActionBtn>
                          </Tooltip>
                        </Box>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Box>
      </TableCard>

      {/* Dialogs */}
      <CreateNfcPointDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <QrDialog point={qrPoint} onClose={() => setQrPoint(null)} />
      <DeleteDialog
        point={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleting}
      />
    </DashboardContainer>
  );
}

export default NfcPage;
