import {
  Checkbox as MuiCheckbox,
  FormControlLabel,
  styled,
  type CheckboxProps as MuiCheckboxProps,
} from '@mui/material';
import { colors } from '../../utilities/colors';

export interface CheckboxProps extends Omit<MuiCheckboxProps, 'size'> {
  label?: React.ReactNode;
  size?: 'small' | 'medium';
}

const StyledCheckbox = styled(MuiCheckbox)({
  padding: '8px',
  color: '#D1D5DB',
  
  '&.Mui-checked': {
    color: colors.primary.navy,
  },
  '&.Mui-disabled': {
    color: '#E5E7EB',
  },
  '&:hover': {
    backgroundColor: 'rgba(44, 45, 72, 0.04)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.25rem',
  },
  '&.MuiCheckbox-sizeMedium .MuiSvgIcon-root': {
    fontSize: '1.5rem',
  },
});

const StyledFormControlLabel = styled(FormControlLabel)({
  marginLeft: '-8px',
  '& .MuiFormControlLabel-label': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 400,
    color: colors.text.primary,
    marginLeft: '4px',
  },
  '& .MuiFormControlLabel-label.Mui-disabled': {
    color: colors.text.secondary,
  },
});

export function Checkbox({
  label,
  size = 'medium',
  ...props
}: CheckboxProps) {
  const checkbox = <StyledCheckbox size={size} {...props} />;

  if (label) {
    return <StyledFormControlLabel control={checkbox} label={label} />;
  }

  return checkbox;
}

export default Checkbox;
