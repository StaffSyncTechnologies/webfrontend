import { Box, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../utilities/colors';

const LogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  cursor: 'pointer',
});

const LogoIcon = styled('img')({
  width: '40px',
  height: '40px',
  objectFit: 'contain',
  '@media (max-width: 768px)': {
    width: '32px',
    height: '32px',
  },
});

const LogoText = styled('span')<{ textColor?: string }>(({ textColor }) => ({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '20px',
  fontWeight: 700,
  color: textColor || colors.secondary.white,
  marginLeft: '10px',
  transition: 'color 0.3s ease',
  '@media (max-width: 768px)': {
    fontSize: '18px',
  },
}));

interface LogoBrandProps {
  textColor?: string;
  to?: string;
}

const LogoBrand = ({ textColor, to = '/' }: LogoBrandProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    console.log('LogoBrand clicked, navigating to:', to);
    console.log('Current pathname:', window.location.pathname);
    navigate(to);
  };

  return (
    <LogoContainer onClick={handleClick}>
      <LogoIcon src="/logo.png" alt="StaffSync" />
      <LogoText textColor={textColor}>StaffSync</LogoText>
    </LogoContainer>
  );
};

export default LogoBrand;
