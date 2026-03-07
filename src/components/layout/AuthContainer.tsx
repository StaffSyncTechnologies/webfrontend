import { Box, styled } from '@mui/material';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../utilities/colors';

export interface AuthContainerProps {
  children: ReactNode;
  maxWidth?: number;
}

const PageWrapper = styled(Box)({
  minHeight: '100vh',
  width: '100%',
  backgroundColor: colors.secondary.white,
  display: 'flex',
  flexDirection: 'column',
});

const Header = styled(Box)({
  padding: '24px 32px',
  display: 'flex',
  alignItems: 'center',
  '@media (max-width: 768px)': {
    padding: '16px 20px',
  },
});

const LogoWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
});

const LogoIcon = styled('img')({
  height: '32px',
  width: 'auto',
});

const LogoText = styled('span')({
  fontSize: '20px',
  fontWeight: 700,
  letterSpacing: '-0.5px',
  '& .staff': {
    color: colors.primary.navy,
  },
  '& .sync': {
    color: colors.primary.blue,
  },
});

const ContentArea = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  position: 'relative',
  overflow: 'hidden',
});

const DotPatternTopLeft = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '455px',
  height: '140px',
  backgroundImage: 'url(/dot.svg)',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'top left',
  opacity: 0.6,
  pointerEvents: 'none',
  '@media (max-width: 768px)': {
    width: '300px',
    height: '100px',
    backgroundSize: 'contain',
  },
});

const DotPatternBottomRight = styled(Box)({
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: '455px',
  height: '140px',
  backgroundImage: 'url(/dot.svg)',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'bottom right',
  opacity: 0.6,
  pointerEvents: 'none',
  '@media (max-width: 768px)': {
    width: '300px',
    height: '100px',
    backgroundSize: 'contain',
  },
});

const CardWrapper = styled(Box)<{ maxWidth?: number }>(({ maxWidth }) => ({
  backgroundColor: colors.secondary.white,
  borderRadius: '16px',
  boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${colors.border.light}`,
  padding: '40px',
  width: '100%',
  maxWidth: maxWidth || 600,
  position: 'relative',
  zIndex: 1,
  '@media (max-width: 768px)': {
    padding: '24px 20px',
    borderRadius: '12px',
  },
}));

export function AuthContainer({ children, maxWidth }: AuthContainerProps) {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <Header>
        <LogoWrapper onClick={() => navigate('/')}>
          <LogoIcon src="/logo.png" alt="StaffSync" />
          <LogoText>
            <span className="staff">STAFF</span>
            <span className="sync">SYNC</span>
          </LogoText>
        </LogoWrapper>
      </Header>
      <ContentArea>
        <DotPatternTopLeft />
        <DotPatternBottomRight />
        <CardWrapper maxWidth={maxWidth}>
          {children}
        </CardWrapper>
      </ContentArea>
    </PageWrapper>
  );
}

export default AuthContainer;
