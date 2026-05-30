import { Box, styled, IconButton, Drawer } from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../controls';
import { colors } from '../../utilities/colors';
import LogoBrand from './LogoBrand';

const HeaderContainer = styled('header', {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})<{ bgColor?: string }>(({ bgColor }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 48px',
  backgroundColor: bgColor || colors.primary.navy,
  borderBottom: 'none',
  transition: 'background-color 0.3s ease',
  '@media (max-width: 768px)': {
    padding: '12px 16px',
  },
}));

const RightSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '32px',
  '@media (max-width: 968px)': {
    gap: '16px',
  },
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

const Nav = styled('nav')({
  display: 'flex',
  alignItems: 'center',
  gap: '32px',
  '@media (max-width: 968px)': {
    display: 'none',
  },
});

const NavLink = styled('a')<{ textColor?: string }>(({ textColor }) => ({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: textColor || colors.secondary.white,
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'color 0.3s ease, opacity 0.2s ease',
  '&:hover': {
    opacity: 0.8,
  },
}));

const DesktopCTA = styled(Box)({
  '@media (max-width: 968px)': {
    display: 'none',
  },
});

const MobileMenuButton = styled(IconButton)({
  display: 'none',
  color: colors.secondary.white,
  '@media (max-width: 968px)': {
    display: 'flex',
  },
});

const MobileDrawer = styled(Drawer)({
  '& .MuiDrawer-paper': {
    width: '100%',
    maxWidth: '320px',
    padding: '24px',
    backgroundColor: colors.primary.navy,
  },
});

const MobileNav = styled('nav')({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  marginTop: '24px',
});

const MobileNavLink = styled('a')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 500,
  color: colors.secondary.white,
  textDecoration: 'none',
  padding: '12px 0',
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: colors.primary.blue,
  },
});

const MobileHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  // { label: 'Testimonial', href: '#testimonial' },
  { label: 'Contact Us', href: '#contact-us' },
];

const Header = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLightBg, setIsLightBg] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 80;
      const heroHeight = window.innerHeight;
      
      // Default to navy (dark) when in hero section
      if (scrollPosition < heroHeight) {
        setIsLightBg(false);
        return;
      }
 
      // Check each section
      const sections = [
        { id: 'about', isLight: true },
        { id: 'features', isLight: true },
        { id: 'how-it-works', isLight: false },
        { id: 'pricing', isLight: true },
        // { id: 'testimonial', isLight: true },
      ];

      let currentIsLight = false;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const bottom = top + element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < bottom) {
            currentIsLight = section.isLight;
            break;
          }
        }
      }

      setIsLightBg(currentIsLight);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <HeaderContainer bgColor={isLightBg ? colors.secondary.white : colors.primary.navy}>
      <LogoBrand textColor={isLightBg ? colors.primary.navy : colors.secondary.white} />

      <RightSection>
        <Nav>
          {navLinks.map((link) => (
            <NavLink 
              key={link.label} 
              href={link.href}
              textColor={isLightBg ? colors.primary.navy : colors.secondary.white}
              onClick={(e) => {
                e.preventDefault();
                if (link.href.startsWith('/')) {
                  navigate(link.href);
                } else if (window.location.pathname !== '/') {
                  navigate('/' + link.href);
                } else {
                  const element = document.querySelector(link.href);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
            >
              {link.label}
            </NavLink>
          ))}
        </Nav>

        <DesktopCTA>
          <Button variant="primary" onClick={() => navigate('/get-started')}>
            Get Started
          </Button>
        </DesktopCTA>

        <MobileMenuButton onClick={handleDrawerToggle} aria-label="menu">
          <MenuIcon sx={{ color: isLightBg ? colors.primary.navy : colors.secondary.white }} />
        </MobileMenuButton>
      </RightSection>

      <MobileDrawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
      >
        <MobileHeader>
          <LogoIcon src="/logo.png" alt="StaffSync" />
          <IconButton onClick={handleDrawerToggle} sx={{ color: colors.secondary.white }}>
            <CloseIcon />
          </IconButton>
        </MobileHeader>

        <MobileNav>
          {navLinks.map((link) => (
            <MobileNavLink 
              key={link.label} 
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                if (link.href.startsWith('/')) {
                  navigate(link.href);
                } else if (window.location.pathname !== '/') {
                  navigate('/' + link.href);
                } else {
                  const element = document.querySelector(link.href);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }
                handleNavClick();
              }}
            >
              {link.label}
            </MobileNavLink>
          ))}
        </MobileNav>

        <Box sx={{ marginTop: '24px' }}>
          <Button 
            variant="primary" 
            fullWidth 
            onClick={() => {
              navigate('/get-started');
              setMobileOpen(false);
            }}
          >
            Get Started
          </Button>
        </Box>
      </MobileDrawer>
    </HeaderContainer>
  );
};

export default Header;