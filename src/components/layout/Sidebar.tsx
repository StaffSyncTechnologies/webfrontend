import { Box, styled } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { colors } from '../../utilities/colors';
import { getRoutesForRole } from '../../routes';
import { useAppSelector } from '../../store';
import type { User, Worker } from '../../types/api';
import type { UserRole } from '../../utilities/roles';

const SidebarContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
});

const NavSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  padding: '8px 12px',
  gap: '4px',
  flex: 1,
});

const BottomSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  padding: '8px 12px',
  gap: '4px',
  borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
  marginTop: 'auto',
});

const NavItemWrapper = styled(Box, {
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
  backgroundColor: active ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: colors.secondary.white,
  },
  '& svg': {
    fontSize: '1.25rem',
  },
}));

interface SidebarProps {
  onNavigate?: () => void;
}

function getUserRole(user: User | Worker | null): UserRole | null {
  if (!user) return null;
  if ('role' in user) {
    return user.role as UserRole;
  }
  return 'WORKER';
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state: { auth: { user: User | Worker | null } }) => state.auth);
  
  const role = getUserRole(user);
  const { main: mainNavRoutes, bottom: bottomNavRoutes } = getRoutesForRole(role);

  const handleLogout = () => {
    // Remove specific keys first (before any async operations)
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('persist:auth'); // Redux persist key
    // Clear everything else
    localStorage.clear();
    sessionStorage.clear();
    // Set a flag to force persist migration on next load
    localStorage.setItem('forceAuthClear', 'true');
    // Force immediate redirect - don't wait for Redux
    window.location.replace('/login');
  };

  const handleNavigation = (path: string) => {
    if (path === '/logout') {
      handleLogout();
      return;
    }
    navigate(path);
    onNavigate?.();
  };

  return (
    <SidebarContainer>
      <NavSection>
        {mainNavRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = location.pathname === route.path;
          return (
            <NavItemWrapper
              key={route.path}
              active={isActive}
              onClick={() => handleNavigation(route.path)}
            >
              {Icon && <Icon />}
              {route.label}
            </NavItemWrapper>
          );
        })}
      </NavSection>
      <BottomSection>
        {bottomNavRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = location.pathname === route.path;
          return (
            <NavItemWrapper
              key={route.path}
              active={isActive}
              onClick={() => handleNavigation(route.path)}
            >
              {Icon && <Icon />}
              {route.label}
            </NavItemWrapper>
          );
        })}
      </BottomSection>
    </SidebarContainer>
  );
}

export default Sidebar;
