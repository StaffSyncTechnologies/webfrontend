/**
 * AISuggestPanel
 * Slide-out drawer that lets the admin describe shift requirements in natural language.
 * Claude ranks available workers and returns explanations + warnings.
 */

import { useState } from 'react';
import {
  Drawer,
  Box,
  styled,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Avatar,
  Tooltip,
  LinearProgress,
  Divider,
  IconButton,
} from '@mui/material';
import {
  AutoAwesome,
  Close,
  Warning,
  CheckCircle,
  PersonAdd,
  TrendingUp,
  WorkHistory,
} from '@mui/icons-material';
import { colors } from '../../utilities/colors';
import {
  useSuggestWorkersMutation,
  type WorkerSuggestion,
} from '../../store/slices/aiSlice';
import { useToast } from '../../hooks';

// ─── Styled ───────────────────────────────────────────────────────────────────

const PanelHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  padding: '24px 24px 16px',
  borderBottom: '1px solid #F3F4F6',
});

const PanelTitle = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: 0,
});

const PanelSubtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
  margin: '4px 0 0',
});

const SectionLabel = styled('div')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '11px',
  fontWeight: 700,
  color: colors.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '8px',
});

const WorkerCard = styled(Box)({
  backgroundColor: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '12px',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  '&:hover': {
    borderColor: colors.primary.blue,
    boxShadow: `0 0 0 2px ${colors.primary.blue}20`,
  },
});

const ScoreBar = styled(Box, {
  shouldForwardProp: (p) => p !== 'value',
})<{ value: number }>(({ value }) => ({
  height: 6,
  borderRadius: 3,
  backgroundColor: '#E5E7EB',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: `${value}%`,
    borderRadius: 3,
    backgroundColor:
      value >= 80 ? '#10B981'
      : value >= 60 ? '#F59E0B'
      : '#EF4444',
    transition: 'width 0.6s ease',
  },
}));

const ExampleChip = styled('button')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  backgroundColor: '#F0F9FF',
  color: colors.primary.blue,
  border: `1px solid ${colors.primary.blue}30`,
  borderRadius: '16px',
  padding: '4px 12px',
  cursor: 'pointer',
  transition: 'background-color 0.15s',
  '&:hover': { backgroundColor: '#DBEAFE' },
});

// ─── Score colour helper ──────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
}

// ─── Worker Result Card ───────────────────────────────────────────────────────

function WorkerResultCard({
  suggestion,
  rank,
  onAssign,
}: {
  suggestion: WorkerSuggestion;
  rank: number;
  onAssign?: (suggestion: WorkerSuggestion) => void;
}) {
  return (
    <WorkerCard>
      {/* Top row: avatar + name + score badge */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1.5 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            backgroundColor: colors.primary.blue,
            fontSize: 15,
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {suggestion.name.charAt(0).toUpperCase()}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '14px', color: colors.primary.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              #{rank} {suggestion.name}
            </Box>
            <Box
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                fontSize: '15px',
                color: scoreColor(suggestion.score),
                flexShrink: 0,
              }}
            >
              {suggestion.score}
            </Box>
          </Box>

          {/* Score bar */}
          <ScoreBar value={suggestion.score} sx={{ mt: 0.75, mb: 1 }} />

          {/* Stats row */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <WorkHistory sx={{ fontSize: 13, color: colors.text.secondary }} />
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary }}>
                {suggestion.totalShifts} shifts
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp sx={{ fontSize: 13, color: suggestion.attendanceRate >= 85 ? '#10B981' : suggestion.attendanceRate >= 70 ? '#F59E0B' : '#EF4444' }} />
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary }}>
                {suggestion.attendanceRate}% attendance
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* AI reasoning */}
      <Box
        sx={{
          backgroundColor: '#F0F9FF',
          border: `1px solid ${colors.primary.blue}20`,
          borderRadius: '8px',
          padding: '10px 12px',
          mb: suggestion.warnings.length > 0 ? 1.5 : 1.5,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <AutoAwesome sx={{ fontSize: 13, color: colors.primary.blue, mt: 0.15, flexShrink: 0 }} />
          <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.primary.navy, lineHeight: 1.5 }}>
            {suggestion.reasoning}
          </Box>
        </Box>
      </Box>

      {/* Skills */}
      {suggestion.skills.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {suggestion.skills.slice(0, 5).map((skill) => (
            <Chip
              key={skill}
              label={skill}
              size="small"
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '11px',
                height: 22,
                backgroundColor: '#F3F4F6',
                color: colors.primary.navy,
              }}
            />
          ))}
          {suggestion.skills.length > 5 && (
            <Chip
              label={`+${suggestion.skills.length - 5}`}
              size="small"
              sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', height: 22, backgroundColor: '#F3F4F6', color: colors.text.secondary }}
            />
          )}
        </Box>
      )}

      {/* Warnings */}
      {suggestion.warnings.length > 0 && (
        <Box sx={{ mb: 1.5 }}>
          {suggestion.warnings.map((w, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 0.5 }}>
              <Warning sx={{ fontSize: 13, color: '#F59E0B', mt: 0.2, flexShrink: 0 }} />
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: '#92400E' }}>
                {w}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Assign button */}
      {onAssign && (
        <Button
          fullWidth
          variant="outlined"
          startIcon={<PersonAdd />}
          size="small"
          onClick={() => onAssign(suggestion)}
          sx={{
            fontFamily: "'Outfit', sans-serif",
            textTransform: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            borderColor: colors.primary.blue,
            color: colors.primary.blue,
            '&:hover': { backgroundColor: '#EFF6FF', borderColor: colors.interactive.hover },
          }}
        >
          Assign to Shift
        </Button>
      )}
    </WorkerCard>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

const EXAMPLES = [
  '5 forklift drivers this Saturday, must have warehouse experience',
  '3 security guards for overnight Friday shift, London Bridge area',
  '2 healthcare workers with DBS check, day shift Monday',
  '4 event staff for weekend, good with customers',
];

interface AISuggestPanelProps {
  open:        boolean;
  onClose:     () => void;
  shiftId?:    string;
  defaultDate?: string;
  onAssign?:   (suggestion: WorkerSuggestion) => void;
}

export function AISuggestPanel({
  open,
  onClose,
  shiftId,
  defaultDate,
  onAssign,
}: AISuggestPanelProps) {
  const toast = useToast();

  const [description, setDescription] = useState('');
  const [date, setDate]               = useState(defaultDate ?? '');
  const [count, setCount]             = useState(5);

  const [suggestWorkers, { isLoading, data, reset }] = useSuggestWorkersMutation();

  const suggestions = data?.data ?? [];

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please describe your shift requirements');
      return;
    }
    try {
      await suggestWorkers({
        description: description.trim(),
        date:           date || undefined,
        requiredCount:  count,
        shiftId:        shiftId,
      }).unwrap();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Failed to generate suggestions. Check your ANTHROPIC_API_KEY.');
    }
  };

  const handleReset = () => {
    setDescription('');
    reset();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480 },
          backgroundColor: '#F9FAFB',
        },
      }}
    >
      {/* Header */}
      <PanelHeader>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <AutoAwesome sx={{ fontSize: 20, color: colors.primary.blue }} />
            <PanelTitle>AI Shift Scheduling</PanelTitle>
          </Box>
          <PanelSubtitle>
            Describe your needs — Claude will rank the best available workers.
          </PanelSubtitle>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ mt: -0.5 }}>
          <Close fontSize="small" />
        </IconButton>
      </PanelHeader>

      <Box sx={{ overflowY: 'auto', flex: 1, p: 3 }}>
        {/* Input section */}
        <Box sx={{ mb: 3 }}>
          <SectionLabel>Describe your shift requirements</SectionLabel>
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            placeholder='e.g. "5 forklift drivers this Saturday, warehouse experience required, reliable attendance"'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
              },
              mb: 2,
            }}
          />

          {/* Example chips */}
          {!description && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: colors.text.secondary, mb: 1 }}>
                Try an example:
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {EXAMPLES.map((ex) => (
                  <ExampleChip key={ex} onClick={() => setDescription(ex)}>
                    {ex.length > 50 ? ex.slice(0, 50) + '…' : ex}
                  </ExampleChip>
                ))}
              </Box>
            </Box>
          )}

          {/* Date + count row */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <SectionLabel>Date (optional)</SectionLabel>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#FFFFFF', fontFamily: "'Outfit', sans-serif", fontSize: '13px' },
                }}
              />
            </Box>
            <Box sx={{ width: 110 }}>
              <SectionLabel>Workers needed</SectionLabel>
              <TextField
                type="number"
                size="small"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                inputProps={{ min: 1, max: 50 }}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#FFFFFF', fontFamily: "'Outfit', sans-serif", fontSize: '13px' },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesome />}
            onClick={handleGenerate}
            disabled={isLoading || !description.trim()}
            disableElevation
            sx={{
              fontFamily: "'Outfit', sans-serif",
              textTransform: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14px',
              py: 1.25,
              backgroundColor: colors.primary.blue,
              '&:hover': { backgroundColor: colors.interactive.hover },
            }}
          >
            {isLoading ? 'Asking Claude…' : 'Generate Suggestions'}
          </Button>
          {suggestions.length > 0 && (
            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{
                fontFamily: "'Outfit', sans-serif",
                textTransform: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '14px',
                borderColor: '#E5E7EB',
                color: colors.text.secondary,
                minWidth: 80,
                '&:hover': { borderColor: '#D1D5DB', backgroundColor: '#F9FAFB' },
              }}
            >
              Clear
            </Button>
          )}
        </Box>

        {/* Loading bar */}
        {isLoading && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress sx={{ borderRadius: 2, '& .MuiLinearProgress-bar': { backgroundColor: colors.primary.blue } }} />
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: colors.text.secondary, mt: 1, textAlign: 'center' }}>
              Analysing {count} worker slots — Claude is reviewing skills, attendance, and availability…
            </Box>
          </Box>
        )}

        {/* Results */}
        {suggestions.length > 0 && (
          <>
            <Divider sx={{ mb: 2.5 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CheckCircle sx={{ fontSize: 18, color: '#10B981' }} />
              <Box sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '14px', color: colors.primary.navy }}>
                {suggestions.length} workers recommended
              </Box>
            </Box>

            {suggestions.map((s, i) => (
              <WorkerResultCard
                key={s.workerId}
                suggestion={s}
                rank={i + 1}
                onAssign={onAssign}
              />
            ))}
          </>
        )}
      </Box>
    </Drawer>
  );
}

export default AISuggestPanel;
