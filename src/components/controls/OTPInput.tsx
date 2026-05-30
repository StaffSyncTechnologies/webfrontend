import { useRef, useEffect } from 'react';
import { Box, styled } from '@mui/material';
import { colors } from '../../utilities/colors';

interface OTPInputProps {
  length?: number;
  value: string[];
  onChange: (otp: string[]) => void;
  onComplete?: (otp: string) => void;
}

const Container = styled(Box)({
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
});

const Input = styled('input')({
  width: '100%',
  maxWidth: '60px',
  height: '60px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '24px',
  fontWeight: 600,
  textAlign: 'center',
  color: colors.primary.navy,
  outline: 'none',
  transition: 'border-color 0.2s ease',
  '&:focus': {
    borderColor: colors.primary.blue,
    boxShadow: '0 0 0 2px rgba(0, 163, 255, 0.1)',
  },
  '@media (max-width: 500px)': {
    maxWidth: '45px',
    height: '50px',
    fontSize: '20px',
  },
});

const OTPInput = ({ length = 6, value, onChange, onComplete }: OTPInputProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, inputValue: string) => {
    // Only allow digits
    if (!/^\d*$/.test(inputValue)) return;

    // Take only the last character if multiple are pasted/entered
    const digit = inputValue.slice(-1);
    
    const newOtp = [...value];
    newOtp[index] = digit;
    onChange(newOtp);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    if (digit && index === length - 1) {
      const completeOtp = newOtp.join('');
      if (completeOtp.length === length && onComplete) {
        onComplete(completeOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // If current input is empty, go to previous
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...value];
        newOtp[index] = '';
        onChange(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    
    if (!pastedData) return;

    const newOtp = [...value];
    pastedData.split('').forEach((char, i) => {
      if (i < length) newOtp[i] = char;
    });
    onChange(newOtp);

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex(v => !v);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus();
      if (onComplete) {
        onComplete(newOtp.join(''));
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <Container onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={el => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={handleFocus}
          autoComplete="one-time-code"
        />
      ))}
    </Container>
  );
};

export default OTPInput;
