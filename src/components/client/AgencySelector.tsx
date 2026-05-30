import { useState } from 'react';
import { 
  Box, 
  Select, 
  MenuItem, 
  FormControl, 
  Typography, 
  Chip, 
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { Business, SwitchAccount } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { useSwitchAgencyMutation } from '../../store/slices/clientSlice';
import { useToast } from '../../hooks';
import { colors } from '../../utilities/colors';
import type { Agency } from '../../types/api';

interface AgencySelectorProps {
  compact?: boolean;
}

export function AgencySelector({ compact = false }: AgencySelectorProps) {
  const dispatch = useDispatch();
  const toast = useToast();
  
  const { agencies, currentAgency, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [switchAgency, { isLoading }] = useSwitchAgencyMutation();

  const handleAgencySwitch = async (agencyId: string) => {
    if (!agencyId || agencyId === currentAgency?.id) return;
    
    const targetAgency = agencies?.find(a => a.id === agencyId);
    
    try {
      // Show switching message
      toast.info(`Switching to ${targetAgency?.name}...`, { duration: 2000 });
      
      await switchAgency({ clientCompanyId: agencyId }).unwrap();
      
      // Success message
      toast.success(`Switched to ${targetAgency?.name}`, { duration: 3000 });
      
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to switch agency');
    }
  };

  // Don't show if not authenticated or no agencies available
  if (!isAuthenticated) {
    return null;
  }

  // Show loading state while agencies are being fetched
  if (!agencies) {
    if (compact) {
      return (
        <Tooltip title="Loading agencies...">
          <IconButton size="small" disabled>
            <CircularProgress size={16} thickness={2} sx={{ color: colors.secondary.white }} />
          </IconButton>
        </Tooltip>
      );
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} thickness={2} />
        <Typography variant="body2" color="text.secondary">
          Loading agencies...
        </Typography>
      </Box>
    );
  }

  // Show message if no agencies assigned
  if (agencies.length === 0) {
    if (compact) {
      return (
        <Tooltip title="No agencies available">
          <IconButton size="small" disabled>
            <Business fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Business sx={{ color: colors.text.secondary }} />
        <Typography variant="body2" color="text.secondary">
          No agencies available
        </Typography>
      </Box>
    );
  }

  if (compact) {
    return (
      <Tooltip title={`Current: ${currentAgency?.name || 'Unknown Agency'}`}>
        <IconButton 
          size="small" 
          sx={{ 
            color: colors.secondary.white,
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <Business fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Business sx={{ fontSize: 20, color: colors.primary.navy }} />
        <Typography variant="body2" sx={{ fontWeight: 500, color: colors.text.secondary }}>
          Agency:
        </Typography>
      </Box>
      
      {agencies.length === 1 ? (
        // Single agency - just display the name
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          px: 2,
          py: 1,
          backgroundColor: colors.secondary.white,
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          minWidth: 200,
        }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {agencies[0].name}
          </Typography>
          {agencies[0].isPrimary && (
            <Chip 
              label="Primary" 
              size="small" 
              sx={{ 
                height: 18, 
                fontSize: '10px',
                backgroundColor: colors.primary.blue,
                color: colors.secondary.white,
              }} 
            />
          )}
        </Box>
      ) : (
        // Multiple agencies - show dropdown
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={currentAgency?.id || ''}
            onChange={(e) => handleAgencySwitch(e.target.value)}
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: colors.secondary.white,
                '& fieldset': { borderColor: '#E5E7EB' },
                '&:hover fieldset': { borderColor: colors.primary.blue },
                '&.Mui-focused fieldset': { borderColor: colors.primary.blue },
              },
            }}
            startAdornment={
              agencies?.find(a => a.id === currentAgency?.id)?.isPrimary && (
                <Chip 
                  label="Primary" 
                  size="small" 
                  sx={{ 
                    mr: 1, 
                    height: 20, 
                    fontSize: '11px',
                    backgroundColor: colors.primary.blue,
                    color: colors.secondary.white,
                  }} 
                />
              )
            }
          >
            {agencies.map((agency) => (
              <MenuItem key={agency.id} value={agency.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Typography variant="body2">{agency.name}</Typography>
                  {agency.isPrimary && (
                    <Chip 
                      label="Primary" 
                      size="small" 
                      sx={{ 
                        height: 18, 
                        fontSize: '10px',
                        backgroundColor: colors.primary.blue,
                        color: colors.secondary.white,
                      }} 
                    />
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      
      {agencies.length > 1 && (
        <Tooltip title="Quick switch between agencies">
          <IconButton 
            size="small" 
            sx={{ 
              color: colors.primary.blue,
              '&:hover': { backgroundColor: 'rgba(0, 175, 239, 0.1)' }
            }}
          >
            <SwitchAccount fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

export default AgencySelector;
