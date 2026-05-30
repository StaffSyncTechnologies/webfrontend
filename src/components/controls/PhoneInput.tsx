import { useState } from 'react';
import { Box, styled, TextField, Select, MenuItem } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import { colors } from '../../utilities/colors';

const countryToFlag = (countryCode: string) => {
  return countryCode
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
};

const countryCodes = getCountries().map(country => ({
  country,
  code: `+${getCountryCallingCode(country)}`,
  flag: countryToFlag(country),
}));

const Container = styled(Box)({
  display: 'flex',
  gap: '8px',
});

const CountrySelect = styled(Select)({
  minWidth: '100px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  backgroundColor: '#F9FAFB',
  borderRadius: '8px',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E5E7EB',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.primary.navy,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.primary.blue,
  },
  '& .MuiSelect-select': {
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
});

const PhoneTextField = styled(TextField)({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    borderRadius: '8px',
    backgroundColor: '#F9FAFB',
    '& fieldset': {
      borderColor: '#E5E7EB',
    },
    '&:hover fieldset': {
      borderColor: colors.primary.navy,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.primary.blue,
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '14px 16px',
  },
});

const MenuItemContent = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
});

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  placeholder?: string;
  name?: string;
}

const PhoneInput = ({ value, onChange, placeholder = 'Enter phone number', name }: PhoneInputProps) => {
  const [countryCode, setCountryCode] = useState('+44');
  const [phoneNumber, setPhoneNumber] = useState(value.replace(/^\+\d+\s*/, ''));

  const handleCountryChange = (e: SelectChangeEvent<unknown>) => {
    const newCode = e.target.value as string;
    setCountryCode(newCode);
    onChange(`${newCode} ${phoneNumber}`);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value;
    setPhoneNumber(newNumber);
    onChange(`${countryCode} ${newNumber}`);
  };

  return (
    <Container>
      <CountrySelect
        value={countryCode}
        onChange={handleCountryChange}
        variant="outlined"
      >
        {countryCodes.map((country) => (
          <MenuItem key={`${country.country}-${country.code}`} value={country.code}>
            <MenuItemContent>
              <span>{country.flag}</span>
              <span>{country.code}</span>
            </MenuItemContent>
          </MenuItem>
        ))}
      </CountrySelect>
      <PhoneTextField
        name={name}
        placeholder={placeholder}
        value={phoneNumber}
        onChange={handlePhoneChange}
        variant="outlined"
      />
    </Container>
  );
};

export default PhoneInput;
