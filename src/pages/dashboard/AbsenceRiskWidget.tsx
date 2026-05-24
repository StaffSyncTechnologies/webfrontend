/**
 * AbsenceRiskWidget
 * Dashboard widget that shows at-risk workers for tomorrow's shifts.
 * Uses the /ai/absence-predictions endpoint (statistical ML model).
 */

import { useState } from 'react';
import {
  Box,
  styled,
  CircularProgress,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  Warning,
  ExpandMore,
  Close,
  NotificationsActive,
  CheckCircle,
  Person,
  CalendarToday,
  Refresh,
} from '@mui/icons-material';
import { colors } from '../../utilities/colors';
import {
  useGetAbsencePredictionsQuery,
  type AbsencePrediction,
} from '../../store/slices/aiSlice';

// ─── Styled ───────────────────────────────────────────────────────────────────

const WidgetCard = styled(Box)({
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  overflow: 'hidden',
});

const WidgetHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  borderBottom: '1px solid #F3F4F6',
});

const WidgetTitle = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '15px',
  fontWeight: 700,
  color: colors.primary.navy,
});

const WorkerRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 20px',
  borderBottom: '1px solid #F9FAFB',
  gap: '12px',
  cursor: 'pointer',
  transition: 'background-color 0.15s',
  '&:hover': { backgroundColor: '#F9FAFB' },
  '&:last-child': { borderBottom: 'none' },
});

// ─── Risk level helpers ───────────────────────────────────────────────────────

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

const RISK_CONFIG: Record<RiskLevel, { label: string; bg: string; color: string; dot: string }> = {
  critical: { label: 'Critical', bg: '#FFE4E6', color: '#DC2626', dot: '#DC2626' },
  high:     { label: 'High',     bg: '#FEF3C7', color: '#D97706', dot: '#F59E0B' },
  medium:   { label: 'Medium',   bg: '#E0F2FE', color: '#0369A1', dot: '#0EA5E9' },
  low:      { label: 'Low',      bg: '#D1FAE5', color: '#059669', dot: '#10B981' },
};

function RiskBadge({ level }: { level: RiskLevel }) {
  const cfg = RISK_CONFIG[level];
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 700,
        fontSize: '11px',
        backgroundColor: cfg.bg,
        color: cfg.color,
        borderRadius: '8px',
        height: 22,
      }}
    />
  );
}

// ─── Detail Dialog ────────────────────────────────────────────────────────────

function PredictionDetailDialog({
  prediction,
  onClose,
}: {
  prediction: AbsencePrediction | null;
  onClose: () => void;
}) {
  if (!prediction) return null;
  const cfg = RISK_CONFIG[prediction.riskLevel];

  return (
    <Dialog
      open={!!prediction}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 1 }}>
        <Box>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '18px', color: colors.primary.navy }}>
            {prediction.workerName}
          </Box>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: colors.text.secondary, mt: 0.25 }}>
            {prediction.shiftTitle} · {new Date(prediction.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Risk score */}
        <Box
          sx={{
            backgroundColor: cfg.bg,
            border: `1px solid ${cfg.color}30`,
            borderRadius: '12px',
            p: 2,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              backgroundColor: cfg.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '16px', color: '#FFFFFF' }}>
              {Math.round(prediction.noShowProbability * 100)}%
            </Box>
          </Box>
          <Box>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '15px', color: cfg.color }}>
              {cfg.label} absence risk
            </Box>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary }}>
              Confidence: {Math.round(prediction.confidence * 100)}% · Based on {prediction.attendanceStats.total} shifts
            </Box>
          </Box>
        </Box>

        {/* Attendance stats */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '13px', color: colors.primary.navy, mb: 1.5 }}>
            Attendance History
          </Box>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {[
              { label: 'Total Shifts',    value: prediction.attendanceStats.total },
              { label: 'Missed',          value: prediction.attendanceStats.missed },
              { label: 'Attendance Rate', value: `${prediction.attendanceStats.rate}%` },
            ].map((s) => (
              <Box key={s.label}>
                <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 700, color: colors.primary.navy }}>
                  {s.value}
                </Box>
                <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: colors.text.secondary }}>
                  {s.label}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Risk factors */}
        {prediction.keyRiskFactors.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '13px', color: colors.primary.navy, mb: 1 }}>
              Risk Factors
            </Box>
            {prediction.keyRiskFactors.map((f, i) => (
              <Box key={i} sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.primary.navy }}>
                    {f.description}
                  </Box>
                  <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary, ml: 1, flexShrink: 0 }}>
                    {Math.round(f.impact * 100)}%
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={f.impact * 100}
                  sx={{
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: '#E5E7EB',
                    '& .MuiLinearProgress-bar': { backgroundColor: cfg.color, borderRadius: 3 },
                  }}
                />
              </Box>
            ))}
          </Box>
        )}

        {/* Recommendations */}
        {prediction.recommendations.length > 0 && (
          <Box>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '13px', color: colors.primary.navy, mb: 1 }}>
              Recommended Actions
            </Box>
            {prediction.recommendations.map((rec, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.75 }}>
                <CheckCircle sx={{ fontSize: 15, color: '#10B981', mt: 0.15, flexShrink: 0 }} />
                <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: colors.primary.navy }}>
                  {rec}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          sx={{ fontFamily: "'Outfit', sans-serif", textTransform: 'none', borderRadius: '8px' }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

const MAX_VISIBLE = 5;

export function AbsenceRiskWidget() {
  const [expanded, setExpanded]   = useState(false);
  const [selected, setSelected]   = useState<AbsencePrediction | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useGetAbsencePredictionsQuery(undefined, {
    pollingInterval: 30 * 60 * 1000, // refresh every 30 min
  });

  const predictions  = data?.data?.predictions ?? [];
  const atRiskCount  = data?.data?.atRiskCount ?? 0;
  const targetDate   = data?.data?.date;

  const displayed  = expanded ? predictions : predictions.slice(0, MAX_VISIBLE);
  const hasMore    = predictions.length > MAX_VISIBLE;

  const dateLabel = targetDate
    ? new Date(targetDate + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
    : 'Tomorrow';

  if (isLoading) {
    return (
      <WidgetCard>
        <WidgetHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning sx={{ fontSize: 18, color: '#F59E0B' }} />
            <WidgetTitle>Absence Risk Predictions</WidgetTitle>
          </Box>
        </WidgetHeader>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} sx={{ color: colors.primary.blue }} />
        </Box>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard>
        <WidgetHeader>
          <WidgetTitle>Absence Risk Predictions</WidgetTitle>
        </WidgetHeader>
        <Box sx={{ textAlign: 'center', py: 4, px: 3, fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: colors.text.secondary }}>
          Unable to load predictions.
          <Box sx={{ mt: 1 }}>
            <Button size="small" onClick={() => refetch()} sx={{ fontFamily: "'Outfit', sans-serif", textTransform: 'none', fontSize: '12px' }}>
              Retry
            </Button>
          </Box>
        </Box>
      </WidgetCard>
    );
  }

  return (
    <>
      <WidgetCard>
        {/* Header */}
        <WidgetHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsActive sx={{ fontSize: 18, color: atRiskCount > 0 ? '#F59E0B' : '#10B981' }} />
            <Box>
              <WidgetTitle>Absence Risk — {dateLabel}</WidgetTitle>
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary, mt: 0.25 }}>
                {predictions.length} workers scheduled · {atRiskCount} at risk
              </Box>
            </Box>
          </Box>

          <Tooltip title="Refresh predictions">
            <IconButton size="small" onClick={() => refetch()} disabled={isFetching}>
              <Refresh sx={{ fontSize: 18, color: colors.text.secondary, animation: isFetching ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
        </WidgetHeader>

        {/* Summary banner (only when at-risk workers exist) */}
        {atRiskCount > 0 && (
          <Box
            sx={{
              mx: 2.5,
              mt: 2,
              mb: 1,
              p: 1.5,
              borderRadius: '10px',
              backgroundColor: '#FEF3C7',
              border: '1px solid #FDE68A',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Warning sx={{ fontSize: 18, color: '#D97706', flexShrink: 0 }} />
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: '#92400E' }}>
              <strong>{atRiskCount} worker{atRiskCount !== 1 ? 's' : ''}</strong> flagged as high/critical risk for {dateLabel}.
              Consider arranging backup cover.
            </Box>
          </Box>
        )}

        {/* Worker list */}
        {predictions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5, px: 3 }}>
            <CheckCircle sx={{ fontSize: 36, color: '#10B981', mb: 1 }} />
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '14px', color: colors.primary.navy }}>
              All Clear
            </Box>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: colors.text.secondary, mt: 0.5 }}>
              No workers are at significant absence risk for {dateLabel}.
            </Box>
          </Box>
        ) : (
          <Box sx={{ mt: 1 }}>
            {displayed.map((prediction) => {
              const cfg = RISK_CONFIG[prediction.riskLevel];
              const isAtRisk = prediction.riskLevel === 'high' || prediction.riskLevel === 'critical';
              return (
                <WorkerRow key={prediction.workerId} onClick={() => setSelected(prediction)}>
                  {/* Risk dot */}
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: cfg.dot,
                      flexShrink: 0,
                    }}
                  />

                  {/* Worker info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '13px', color: colors.primary.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prediction.workerName}
                      </Box>
                      {isAtRisk && <Warning sx={{ fontSize: 13, color: '#F59E0B', flexShrink: 0 }} />}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                      <CalendarToday sx={{ fontSize: 11, color: colors.text.secondary }} />
                      <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: colors.text.secondary }}>
                        {prediction.shiftTitle}
                      </Box>
                      <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: colors.text.secondary }}>
                        · {prediction.attendanceStats.rate}% attendance
                      </Box>
                    </Box>
                  </Box>

                  {/* Risk badge + probability */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: cfg.color, fontWeight: 700 }}>
                      {Math.round(prediction.noShowProbability * 100)}%
                    </Box>
                    <RiskBadge level={prediction.riskLevel} />
                  </Box>
                </WorkerRow>
              );
            })}

            {/* Show more / less */}
            {hasMore && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  py: 1.5,
                  cursor: 'pointer',
                  color: colors.primary.blue,
                  '&:hover': { backgroundColor: '#F9FAFB' },
                }}
                onClick={() => setExpanded((e) => !e)}
              >
                <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: 600 }}>
                  {expanded ? 'Show less' : `Show ${predictions.length - MAX_VISIBLE} more`}
                </Box>
                <ExpandMore
                  sx={{
                    fontSize: 18,
                    transition: 'transform 0.2s',
                    transform: expanded ? 'rotate(180deg)' : 'none',
                  }}
                />
              </Box>
            )}
          </Box>
        )}
      </WidgetCard>

      {/* Detail dialog */}
      <PredictionDetailDialog prediction={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export default AbsenceRiskWidget;
