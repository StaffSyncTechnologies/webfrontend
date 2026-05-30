import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  styled,
  TextField,
  InputAdornment,
  Checkbox,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
} from '@mui/material';
import { Search, Close, PersonAdd } from '@mui/icons-material';
import { colors } from '../../utilities/colors';
import { useGetWorkersQuery } from '../../store/slices/workerSlice';
import { useAssignWorkersMutation, useGetShiftAssignmentsQuery } from '../../store/slices/shiftSlice';

interface AssignWorkerModalProps {
  open: boolean;
  onClose: () => void;
  shiftId: string;
  shiftTitle?: string;
}

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    maxWidth: '600px',
    width: '100%',
  },
});

const StyledDialogTitle = styled(DialogTitle)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '20px',
  fontWeight: 600,
  color: colors.text.primary,
  padding: '24px 24px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const CloseButton = styled(Box)({
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backgroundColor: colors.secondary.lightGray,
  '&:hover': {
    backgroundColor: colors.border.light,
  },
});

const SearchField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#F8F9FA',
    fontFamily: "'Inter', sans-serif",
    '& fieldset': { border: 'none' },
  },
});

const WorkerList = styled(Box)({
  maxHeight: '400px',
  overflowY: 'auto',
  marginTop: '16px',
});

const WorkerRow = styled(Box)<{ selected?: boolean }>(({ selected }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: '10px',
  cursor: 'pointer',
  backgroundColor: selected ? colors.primary.blue + '20' : 'transparent',
  border: selected ? `1px solid ${colors.primary.blue}` : '1px solid transparent',
  marginBottom: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: selected ? colors.primary.blue + '30' : colors.secondary.lightGray,
  },
}));

const WorkerInfo = styled(Box)({
  flex: 1,
});

const WorkerName = styled(Box)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.text.primary,
});

const WorkerEmail = styled(Box)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  color: colors.text.secondary,
});

const WorkerSkills = styled(Box)({
  display: 'flex',
  gap: '4px',
  flexWrap: 'wrap',
  marginTop: '4px',
});

const SkillChip = styled(Chip)({
  height: '20px',
  fontSize: '10px',
  fontFamily: "'Outfit', sans-serif",
  backgroundColor: colors.primary.blue + '15',
  color: colors.primary.blue,
  fontWeight: 500,
  '& .MuiChip-label': {
    padding: '0 6px',
  },
});

const NoSkillsText = styled(Box)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '10px',
  color: colors.text.secondary,
  fontStyle: 'italic',
});

const SelectedCount = styled(Box)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  padding: '8px 0',
});

const ActionButton = styled(Box)<{ variant?: 'primary' | 'secondary' }>(({ variant = 'secondary' }) => ({
  padding: '10px 24px',
  borderRadius: '10px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ...(variant === 'primary' ? {
    backgroundColor: colors.primary.navy,
    color: '#fff',
    '&:hover': { opacity: 0.9 },
  } : {
    backgroundColor: colors.secondary.lightGray,
    color: colors.text.primary,
    '&:hover': { backgroundColor: colors.border.light },
  }),
}));

const StyledDialogActions = styled(DialogActions)({
  padding: '16px 24px 24px',
  gap: '12px',
});

const AlreadyAssignedBadge = styled(Box)({
  padding: '4px 8px',
  borderRadius: '6px',
  backgroundColor: colors.status.success + '20',
  color: colors.status.success,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '11px',
  fontWeight: 500,
});

export const AssignWorkerModal = ({ open, onClose, shiftId, shiftTitle }: AssignWorkerModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: workersData, isLoading: isLoadingWorkers } = useGetWorkersQuery({});
  const { data: assignmentsData } = useGetShiftAssignmentsQuery(shiftId);
  const [assignWorkers, { isLoading: isAssigning }] = useAssignWorkersMutation();

  // Extract workers array from API response
  const workers = useMemo(() => {
    if (!workersData) return [];
    if (Array.isArray(workersData)) return workersData;
    if (Array.isArray((workersData as any)?.data)) return (workersData as any).data;
    return [];
  }, [workersData]);

  // Get already assigned worker IDs
  const assignedWorkerIds = useMemo(() => {
    if (!assignmentsData) return [];
    const assignments = Array.isArray(assignmentsData) ? assignmentsData : [];
    return assignments.map((a: any) => a.workerId);
  }, [assignmentsData]);

  // Filter workers by search term and exclude already assigned
  const filteredWorkers = useMemo(() => {
    if (!searchTerm) return workers;
    const term = searchTerm.toLowerCase();
    return workers.filter((w: any) =>
      w.fullName?.toLowerCase().includes(term) ||
      w.email?.toLowerCase().includes(term)
    );
  }, [workers, searchTerm]);

  const handleToggleWorker = (workerId: string) => {
    if (assignedWorkerIds.includes(workerId)) return; // Can't toggle already assigned
    setSelectedWorkerIds(prev =>
      prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handleAssign = async () => {
    if (selectedWorkerIds.length === 0) {
      setError('Please select at least one worker');
      return;
    }

    try {
      setError(null);
      await assignWorkers({ shiftId, workerIds: selectedWorkerIds }).unwrap();
      setSelectedWorkerIds([]);
      onClose();
    } catch (err: any) {
      setError(err.data?.message || 'Failed to assign workers');
    }
  };

  const handleClose = () => {
    setSelectedWorkerIds([]);
    setSearchTerm('');
    setError(null);
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <StyledDialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAdd sx={{ color: colors.primary.navy }} />
          Assign Workers {shiftTitle && `to "${shiftTitle}"`}
        </Box>
        <CloseButton onClick={handleClose}>
          <Close sx={{ fontSize: 18 }} />
        </CloseButton>
      </StyledDialogTitle>

      <DialogContent sx={{ px: 3, pb: 0 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <SearchField
          fullWidth
          placeholder="Search workers by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: colors.text.secondary }} />
              </InputAdornment>
            ),
          }}
        />

        <SelectedCount>
          {selectedWorkerIds.length > 0
            ? `${selectedWorkerIds.length} worker(s) selected`
            : `${filteredWorkers.length} workers available`}
        </SelectedCount>

        <WorkerList>
          {isLoadingWorkers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : filteredWorkers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: colors.text.secondary }}>
              No workers found
            </Box>
          ) : (
            filteredWorkers.map((worker: any) => {
              const isAssigned = assignedWorkerIds.includes(worker.id);
              const isSelected = selectedWorkerIds.includes(worker.id);

              return (
                <WorkerRow
                  key={worker.id}
                  selected={isSelected}
                  onClick={() => handleToggleWorker(worker.id)}
                  sx={{ opacity: isAssigned ? 0.6 : 1 }}
                >
                  <Checkbox
                    checked={isSelected || isAssigned}
                    disabled={isAssigned}
                    sx={{
                      color: colors.border.default,
                      '&.Mui-checked': { color: colors.primary.blue },
                    }}
                  />
                  <Avatar
                    src={worker.profilePic}
                    sx={{ width: 40, height: 40, bgcolor: colors.primary.blue + '30' }}
                  >
                    {worker.fullName?.charAt(0) || 'W'}
                  </Avatar>
                  <WorkerInfo>
                    <WorkerName>{worker.fullName}</WorkerName>
                    <WorkerEmail>{worker.email}</WorkerEmail>
                    <WorkerSkills>
                      {worker.workerSkills && worker.workerSkills.length > 0 ? (
                        worker.workerSkills.slice(0, 3).map((skill: any) => (
                          <SkillChip
                            key={skill.id || skill.skillId || Math.random()}
                            label={skill.skill?.name || skill.name || 'Unknown Skill'}
                            size="small"
                          />
                        ))
                      ) : (
                        <NoSkillsText>No skills listed</NoSkillsText>
                      )}
                      {worker.workerSkills && worker.workerSkills.length > 3 && (
                        <SkillChip
                          label={`+${worker.workerSkills.length - 3} more`}
                          size="small"
                          sx={{ backgroundColor: colors.secondary.lightGray, color: colors.text.secondary }}
                        />
                      )}
                    </WorkerSkills>
                  </WorkerInfo>
                  {isAssigned && (
                    <AlreadyAssignedBadge>Already Assigned</AlreadyAssignedBadge>
                  )}
                </WorkerRow>
              );
            })
          )}
        </WorkerList>
      </DialogContent>

      <StyledDialogActions>
        <ActionButton variant="secondary" onClick={handleClose}>
          Cancel
        </ActionButton>
        <ActionButton
          variant="primary"
          onClick={handleAssign}
          sx={{
            opacity: isAssigning || selectedWorkerIds.length === 0 ? 0.6 : 1,
            pointerEvents: isAssigning ? 'none' : 'auto',
          }}
        >
          {isAssigning ? (
            <CircularProgress size={16} sx={{ color: '#fff' }} />
          ) : (
            `Assign ${selectedWorkerIds.length > 0 ? `(${selectedWorkerIds.length})` : ''}`
          )}
        </ActionButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default AssignWorkerModal;
