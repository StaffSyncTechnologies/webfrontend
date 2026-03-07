import { CalendarMonth } from '@mui/icons-material';
import { useDocumentTitle } from '../../hooks';
import { Box, styled } from '@mui/material';
import { DashboardContainer, PageTitle } from '../../components/layout';
import { Card } from '../../components/controls';
import { colors } from '../../utilities/colors';

const PageHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
});

const PlaceholderContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '64px 24px',
  textAlign: 'center',
  '& svg': {
    fontSize: '64px',
    color: colors.text.secondary,
    marginBottom: '16px',
  },
});

const PlaceholderTitle = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1.5rem',
  fontWeight: 600,
  color: colors.text.primary,
  margin: '0 0 8px',
});

const PlaceholderText = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  color: colors.text.secondary,
  margin: 0,
});

export function SchedulePage() {
  useDocumentTitle('Schedule');
  return (
    <DashboardContainer
      header={<PageTitle>Schedule</PageTitle>}
    >
      <PageHeader>
        {/* Add date picker, view toggle, filters here */}
      </PageHeader>
      
      <Card>
        <PlaceholderContent>
          <CalendarMonth />
          <PlaceholderTitle>Schedule Calendar</PlaceholderTitle>
          <PlaceholderText>
            View and manage schedules. Plan shifts and track worker availability.
          </PlaceholderText>
        </PlaceholderContent>
      </Card>
    </DashboardContainer>
  );
}

export default SchedulePage;
