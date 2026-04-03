import { Box, styled, IconButton, Drawer, useMediaQuery, InputBase, Avatar, Badge, Modal } from '@mui/material';
import { useState, type ReactNode } from 'react';
import { Menu, Close, Search, Notifications } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { colors } from '../../utilities/colors';
import { getRoutesForRole } from '../../routes';
import LogoBrand from './LogoBrand';
import { NotificationDropdown, ProfileModal } from '../modals';
import { useAppSelector } from '../../store';
import { useGetUnreadCountQuery } from '../../store/slices/notificationSlice';
import type { User, Worker, ClientAuthUser } from '../../types/api';
import type { UserRole } from '../../utilities/roles';

const SIDEBAR_WIDTH = 240;
const MOBILE_BREAKPOINT = '@media (max-width: 1023px)';

export interface DashboardContainerProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
}

const LayoutWrapper = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: colors.secondary.lightGray,
});

const SidebarWrapper = styled(Box)({
  width: `${SIDEBAR_WIDTH}px`,
  backgroundColor: colors.primary.navy,
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  zIndex: 100,
  overflow: 'hidden',
  [MOBILE_BREAKPOINT]: {
    display: 'none',
  },
});

const MobileSidebarContent = styled(Box)({
  width: `${SIDEBAR_WIDTH}px`,
  backgroundColor: colors.primary.navy,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
});

const SidebarWaveBackground = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  zIndex: 0,
  pointerEvents: 'none',
  '& svg': {
    position: 'absolute',
    width: '200%',
    height: '100%',
    opacity: 0.4,
  },
});

const SidebarContentWrapper = styled(Box)({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

const MainWrapper = styled(Box)({
  flex: 1,
  marginLeft: `${SIDEBAR_WIDTH}px`,
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  [MOBILE_BREAKPOINT]: {
    marginLeft: 0,
  },
});

const HeaderWrapper = styled(Box)({
  height: '72px',
  backgroundColor: colors.secondary.white,
  borderBottom: '1px solid #E5E7EB',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 32px',
  position: 'sticky',
  top: 0,
  zIndex: 50,
  [MOBILE_BREAKPOINT]: {
    padding: '0 16px',
  },
});

const MenuButton = styled(IconButton)({
  display: 'none',
  color: colors.text.primary,
  marginRight: '12px',
  [MOBILE_BREAKPOINT]: {
    display: 'flex',
  },
});

const HeaderLeft = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  flex: 1,
});

const HeaderRight = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

const SearchWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#F3F4F6',
  borderRadius: '8px',
  padding: '8px 16px',
  gap: '8px',
  minWidth: '280px',
  [MOBILE_BREAKPOINT]: {
    minWidth: '160px',
    display: 'none',
  },
  '& svg': {
    color: colors.text.secondary,
    fontSize: '1.25rem',
  },
});

const SearchInput = styled(InputBase)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  color: colors.text.primary,
  flex: 1,
  '& input': {
    padding: 0,
    '&::placeholder': {
      color: colors.text.secondary,
      opacity: 1,
    },
  },
});

const NotificationButton = styled(IconButton)({
  color: colors.text.primary,
  '&:hover': {
    backgroundColor: '#F3F4F6',
  },
});

const UserAvatar = styled(Avatar)({
  width: 40,
  height: 40,
  cursor: 'pointer',
  border: `2px solid ${colors.primary.blue}`,
});

const ContentWrapper = styled(Box)({
  flex: 1,
  padding: '24px 32px',
  overflowY: 'auto',
  [MOBILE_BREAKPOINT]: {
    padding: '16px',
  },
});

const Logo = styled(Box)({
  padding: '24px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const LogoIcon = styled('div')({
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  backgroundColor: colors.primary.blue,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const LogoText = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1.25rem',
  fontWeight: 700,
  color: colors.secondary.white,
});

const NavSection = styled(Box)({
  flex: 1,
  padding: '0 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const BottomSection = styled(Box)({
  padding: '12px',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const NavItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  fontWeight: 500,
  color: active ? colors.secondary.white : 'rgba(255, 255, 255, 0.7)',
  backgroundColor: active ? colors.primary.blue : 'transparent',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    backgroundColor: active ? colors.primary.blue : 'rgba(255, 255, 255, 0.08)',
    color: colors.secondary.white,
  },
  
  '& svg': {
    fontSize: '1.25rem',
  },
}));

export const PageTitle = styled('h1')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1.75rem',
  fontWeight: 600,
  color: colors.text.primary,
  margin: 0,
});

export const SectionTitle = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1.125rem',
  fontWeight: 600,
  color: colors.text.primary,
  margin: 0,
});

export const GridRow = styled(Box)({
  display: 'grid',
  gap: '24px',
});

export const GridCols4 = styled(GridRow)({
  gridTemplateColumns: 'repeat(4, 1fr)',
  '@media (max-width: 1200px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr',
  },
});

export const GridCols2 = styled(GridRow)({
  gridTemplateColumns: 'repeat(2, 1fr)',
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr',
  },
});

function getUserRole(user: User | Worker | ClientAuthUser | null): UserRole | null {
  if (!user) return null;
  if ('role' in user) {
    return user.role as UserRole;
  }
  return 'WORKER';
}

export function DashboardContainer({
  children,
  sidebar,
  header,
}: DashboardContainerProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { data: unreadData } = useGetUnreadCountQuery(undefined, { 
    pollingInterval: 15000,
    skip: !user || !('role' in user) || (!!user.role && user.role.startsWith('CLIENT_')) // Skip for client users
  });
  
  const unreadCount = unreadData?.count || 0;
  const role = getUserRole(user);
  const { main: mainNavRoutes, bottom: bottomNavRoutes } = getRoutesForRole(role);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    // Remove specific keys first
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('persist:auth');
    // Clear everything else
    localStorage.clear();
    sessionStorage.clear();
    // Set a flag to force persist migration on next load
    localStorage.setItem('forceAuthClear', 'true');
    // Force immediate redirect to correct login page based on user role
    const isClientUser = role === 'CLIENT_ADMIN' || role === 'CLIENT_USER';
    window.location.replace(isClientUser ? '/#/client-login' : '/#/login');
  };

  const handleNavigation = (path: string) => {
    if (path === '/logout') {
      handleLogout();
      return;
    }
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const renderNavigation = () => (
    <>
      <NavSection>
        {mainNavRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = location.pathname === route.path || location.pathname.startsWith(route.path + '/');
          return (
            <NavItem
              key={route.path}
              active={isActive}
              onClick={() => handleNavigation(route.path)}
            >
              {Icon && <Icon />}
              {route.label}
            </NavItem>
          );
        })}
      </NavSection>
      <BottomSection>
        {bottomNavRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = location.pathname === route.path || location.pathname.startsWith(route.path + '/');
          return (
            <NavItem
              key={route.path}
              active={isActive}
              onClick={() => handleNavigation(route.path)}
            >
              {Icon && <Icon />}
              {route.label}
            </NavItem>
          );
        })}
      </BottomSection>
    </>
  );

  const waveBackground = (
    <SidebarWaveBackground>
      <svg viewBox="0 0 1200 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
        <defs>
          <filter id="sidebarGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path d="M0 150 Q150 100 300 150 T600 150 T900 150 T1200 150" stroke={colors.primary.blue} strokeWidth="0.5" fill="none" opacity="0.5"/>
        <path d="M0 170 Q150 120 300 170 T600 170 T900 170 T1200 170" stroke="white" strokeWidth="0.5" fill="none" opacity="0.4"/>
        <path d="M0 130 Q150 80 300 130 T600 130 T900 130 T1200 130" stroke={colors.primary.blue} strokeWidth="0.5" fill="none" opacity="0.3"/>
        <path d="M0 190 Q150 140 300 190 T600 190 T900 190 T1200 190" stroke="white" strokeWidth="0.5" fill="none" opacity="0.35"/>
        <path d="M0 110 Q150 60 300 110 T600 110 T900 110 T1200 110" stroke={colors.primary.blue} strokeWidth="0.5" fill="none" opacity="0.5"/>
        <path d="M0 150 Q150 100 300 150 T600 150 T900 150 T1200 150" stroke={colors.primary.blue} strokeWidth="1" fill="none" filter="url(#sidebarGlow)" strokeDasharray="100 1100" strokeLinecap="round">
          <animate attributeName="stroke-dashoffset" values="0;-1200" dur="8s" repeatCount="indefinite"/>
        </path>
        <path d="M0 170 Q150 120 300 170 T600 170 T900 170 T1200 170" stroke={colors.primary.blue} strokeWidth="0.8" fill="none" filter="url(#sidebarGlow)" strokeDasharray="80 1120" strokeLinecap="round">
          <animate attributeName="stroke-dashoffset" values="0;-1200" dur="10s" repeatCount="indefinite" begin="1s"/>
        </path>
        <path d="M0 130 Q150 80 300 130 T600 130 T900 130 T1200 130" stroke={colors.primary.blue} strokeWidth="0.8" fill="none" filter="url(#sidebarGlow)" strokeDasharray="60 1140" strokeLinecap="round">
          <animate attributeName="stroke-dashoffset" values="0;-1200" dur="7s" repeatCount="indefinite" begin="2s"/>
        </path>
      </svg>
    </SidebarWaveBackground>
  );

  const sidebarContent = (
    <>
      {waveBackground}
      <SidebarContentWrapper>
        <Logo>
          <LogoBrand />
          {isMobile && (
            <IconButton 
              onClick={handleDrawerToggle} 
              sx={{ marginLeft: 'auto', color: 'white' }}
            >
              <Close />
            </IconButton>
          )}
        </Logo>
        {sidebar ? sidebar : renderNavigation()}
      </SidebarContentWrapper>
    </>
  );

  return (
    <LayoutWrapper>
      {/* Desktop Sidebar */}
      <SidebarWrapper>{sidebarContent}</SidebarWrapper>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: SIDEBAR_WIDTH,
            backgroundColor: colors.primary.navy,
          },
        }}
      >
        <MobileSidebarContent>{sidebarContent}</MobileSidebarContent>
      </Drawer>

      <MainWrapper>
        <HeaderWrapper>
          <HeaderLeft>
            <MenuButton onClick={handleDrawerToggle}>
              <Menu />
            </MenuButton>
            <SearchWrapper>
              <Search />
              <SearchInput placeholder="Search here..." />
            </SearchWrapper>
          </HeaderLeft>
          <HeaderRight>
            {/* Only show notifications for non-client users */}
            {(!user || !('role' in user) || !(user.role && user.role.startsWith('CLIENT_'))) && (
              <NotificationButton onClick={() => setNotificationOpen(true)}>
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </NotificationButton>
            )}
            <UserAvatar 
              src={user && 'profilePicture' in user ? (user.profilePicture as string | undefined) : undefined}
              alt={user?.fullName ?? 'User'}
              onClick={() => setProfileOpen(true)}
            >
              {user?.fullName?.charAt(0) ?? 'U'}
            </UserAvatar>
          </HeaderRight>
        </HeaderWrapper>
        {header && (
          <Box sx={{ padding: '24px 32px 0', '@media (max-width: 1023px)': { padding: '16px 16px 0' } }}>
            {header}
          </Box>
        )}
        <ContentWrapper>{children}</ContentWrapper>
      </MainWrapper>

      {/* Profile Details Modal */}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} user={user} />

      {/* Notification Dropdown */}
      <NotificationDropdown open={notificationOpen} onClose={() => setNotificationOpen(false)} />
    </LayoutWrapper>
  );
}

export { 
  SidebarWrapper, 
  NavSection, 
  BottomSection, 
  HeaderWrapper, 
  ContentWrapper,
  Logo,
  LogoIcon,
  LogoText,
};

export default DashboardContainer;
