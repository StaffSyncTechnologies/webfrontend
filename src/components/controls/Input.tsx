import { TextField, styled, InputLabel, FormControl, Box, InputAdornment, type TextFieldProps } from '@mui/material';
import type { ReactNode } from 'react';
import { colors } from '../../utilities/colors';

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  label?: string;
  required?: boolean;
  optional?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    borderRadius: '8px',
    backgroundColor: colors.secondary.white,
    
    '& fieldset': {
      borderColor: '#E5E7EB',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: '#D1D5DB',
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.primary.blue,
      borderWidth: '2px',
    },
    '&.Mui-error fieldset': {
      borderColor: colors.status.error,
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '14px 16px',
    color: colors.text.primary,
    '&::placeholder': {
      color: colors.text.secondary,
      opacity: 1,
    },
  },
  '& .MuiInputAdornment-root': {
    color: colors.text.secondary,
    '& svg': {
      fontSize: '1.25rem',
    },
  },
  '& .MuiFormHelperText-root': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.75rem',
    marginLeft: 0,
    marginTop: '6px',
  },
});

const StyledLabel = styled(InputLabel)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  fontWeight: 500,
  color: colors.text.primary,
  marginBottom: '8px',
  position: 'relative',
  transform: 'none',
  
  '& .required-asterisk': {
    color: colors.status.error,
    marginLeft: '2px',
  },
  '& .optional-text': {
    color: colors.text.secondary,
    fontWeight: 400,
    marginLeft: '4px',
  },
});

export function Input({
  label,
  required = false,
  optional = false,
  placeholder,
  startIcon,
  endIcon,
  ...props
}: InputProps) {
  return (
    <FormControl fullWidth>
      {label && (
        <StyledLabel shrink={false}>
          {label}
          {required && <span className="required-asterisk">*</span>}
          {optional && <span className="optional-text">(optional)</span>}
        </StyledLabel>
      )}
      <Box>
        <StyledTextField
          fullWidth
          variant="outlined"
          placeholder={placeholder}
          required={required}
          slotProps={{
            input: {
              startAdornment: startIcon ? (
                <InputAdornment position="start">{startIcon}</InputAdornment>
              ) : undefined,
              endAdornment: endIcon ? (
                <InputAdornment position="end">{endIcon}</InputAdornment>
              ) : undefined,
            },
          }}
          {...props}
        />
      </Box>
    </FormControl>
  );
}

export default Input;
