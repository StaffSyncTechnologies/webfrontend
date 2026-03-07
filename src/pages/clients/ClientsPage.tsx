import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  People,
  CheckCircle,
  Cancel,
  Receipt,
  Search,
  FilterList,
  FileDownload,
  KeyboardArrowDown,
  ChevronLeft,
  ChevronRight,
  Add,
  Visibility,
  Edit,
  Block,
  MoreVert,
} from '@mui/icons-material';
import { Box, styled, TextField, InputAdornment, Select, MenuItem, Checkbox, IconButton, Menu as MuiMenu, Avatar, CircularProgress } from '@mui/material';
import { useDocumentTitle } from '../../hooks';
import { useClientStats, useClientList, type ClientListParams } from '../../hooks/api/useClientsApi';
import { DashboardContainer, GridCols4 } from '../../components/layout';
import { StatsCard } from '../../components/controls';
import { colors } from '../../utilities/colors';
import { AddClientModal, EditClientModal } from '../../components/modals';

// ============ STYLED COMPONENTS ============
const HeaderRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '24px',
});

const TitleSection = styled(Box)({});

const PageTitle = styled('h1')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '28px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: 0,
});

const PageSubtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: '4px 0 0',
});

const AddButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 24px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: colors.primary.navy,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.secondary.white,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#1a2d4a' },
});

const TableCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  marginTop: '24px',
});

const CardHeader = styled(Box)({
  padding: '20px 24px',
  borderBottom: '1px solid #E5E7EB',
  '& h3': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
    color: colors.primary.navy,
    margin: 0,
  },
});

const FilterRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 24px',
  flexWrap: 'wrap',
  gap: '12px',
});

const FilterLeft = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const FilterRight = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const SearchInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#F9FAFB',
    '& fieldset': { borderColor: '#E5E7EB' },
  },
  '& .MuiInputBase-input': {
    padding: '10px 14px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
  },
  width: '240px',
});

const FilterButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#F9FAFB' },
});

const DropdownButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#F9FAFB' },
});

const ExportButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: colors.primary.navy,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.secondary.white,
  cursor: 'pointer',
  '&:hover': { opacity: 0.9 },
});

const Table = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
});

const Th = styled('th')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  fontWeight: 500,
  color: colors.text.secondary,
  textAlign: 'left',
  padding: '12px 16px',
  borderBottom: '1px solid #E5E7EB',
});

const Td = styled('td')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.primary.navy,
  padding: '16px',
  borderBottom: '1px solid #E5E7EB',
  verticalAlign: 'middle',
});

const ClientCell = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  '& .name': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: colors.primary.navy,
  },
  '& .id': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    color: colors.text.secondary,
  },
});

const WorkerProgress = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  minWidth: '100px',
});

const ProgressHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  color: colors.text.secondary,
});

const ProgressBar = styled(Box)({
  width: '100%',
  height: '4px',
  backgroundColor: '#E5E7EB',
  borderRadius: '2px',
  overflow: 'hidden',
});

const ProgressFill = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'percentage',
})<{ percentage: number }>(({ percentage }) => ({
  width: `${percentage}%`,
  height: '100%',
  backgroundColor: percentage === 100 ? colors.status.success : colors.primary.blue,
  borderRadius: '2px',
  transition: 'width 0.3s ease',
}));

const BillingBadge = styled('span', {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: string }>(({ status }) => {
  const bgMap: Record<string, string> = {
    paid: '#D1FAE5',
    pending: '#FEF3C7',
    overdue: '#FFE4E6',
  };
  const colorMap: Record<string, string> = {
    paid: '#059669',
    pending: '#D97706',
    overdue: '#DC2626',
  };
  return {
    padding: '4px 12px',
    borderRadius: '16px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 500,
    backgroundColor: bgMap[status.toLowerCase()] ?? '#F3F4F6',
    color: colorMap[status.toLowerCase()] ?? '#6B7280',
  };
});

const ActionMenuItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'danger',
})<{ danger?: boolean }>(({ danger }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: danger ? colors.status.error : colors.primary.navy,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#F9FAFB' },
  '& svg': { fontSize: '18px' },
}));

const Pagination = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '24px',
  padding: '16px 24px',
});

const PaginationText = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
});

const PaginationControls = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const PageButton = styled('button')({
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  '&:hover': { backgroundColor: '#F9FAFB' },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
});

// ============ HELPERS ============
const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatClientId = (id: string) => {
  return `#CL-${id.slice(0, 6).toUpperCase()}`;
};

// ============ COMPONENT ============
export function ClientsPage() {
  useDocumentTitle('Clients');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuClientId, setMenuClientId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editClientId, setEditClientId] = useState<string | null>(null);

  // API hooks
  const params: ClientListParams = {
    page: currentPage,
    limit: rowsPerPage,
    ...(statusFilter && { status: statusFilter }),
    ...(searchTerm && { search: searchTerm }),
  };

  const { data: stats, isLoading: statsLoading } = useClientStats();
  const { data: listData, isLoading: listLoading } = useClientList(params);

  const clients = listData?.clients ?? [];
  const pagination = listData?.pagination;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, clientId: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuClientId(clientId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuClientId(null);
  };

  return (
    <DashboardContainer>
      <HeaderRow>
        <TitleSection>
          <PageTitle>Clients</PageTitle>
          <PageSubtitle>Manage your clients and</PageSubtitle>
        </TitleSection>
        <AddButton onClick={() => setAddModalOpen(true)}>
          <Add sx={{ fontSize: 18 }} />
          Add New Client
        </AddButton>
      </HeaderRow>

      <GridCols4>
        <StatsCard
          title="Total Clients"
          value={statsLoading ? 0 : (stats?.total.count ?? 0)}
          icon={<People />}
          iconBgColor="#FEF3C7"
          iconColor="#F59E0B"
          trend={{ value: `${stats?.total.change ?? 0}%`, label: 'this week', direction: (stats?.total.change ?? 0) >= 0 ? 'up' : 'down' }}
        />
        <StatsCard
          title="Active Clients"
          value={statsLoading ? 0 : (stats?.active.count ?? 0)}
          icon={<CheckCircle />}
          iconBgColor="#D1FAE5"
          iconColor="#10B981"
          trend={{ value: `${stats?.active.change ?? 0}%`, label: 'this week', direction: (stats?.active.change ?? 0) >= 0 ? 'up' : 'down' }}
        />
        <StatsCard
          title="Inactive Clients"
          value={statsLoading ? 0 : (stats?.inactive.count ?? 0)}
          icon={<Cancel />}
          iconBgColor="#FFE4E6"
          iconColor="#EF4444"
          trend={{ value: `${stats?.inactive.change ?? 0}%`, label: 'this week', direction: (stats?.inactive.change ?? 0) >= 0 ? 'up' : 'down' }}
        />
        <StatsCard
          title="Outstanding Invoice"
          value={statsLoading ? 0 : (stats?.outstandingInvoices.count ?? 0)}
          icon={<Receipt />}
          iconBgColor="#EDE9FE"
          iconColor="#7C3AED"
          trend={{ value: `${stats?.outstandingInvoices.change ?? 0}%`, label: 'this week', direction: (stats?.outstandingInvoices.change ?? 0) >= 0 ? 'up' : 'down' }}
        />
      </GridCols4>

      <TableCard>
        <CardHeader><h3>Client History</h3></CardHeader>

        <FilterRow>
          <FilterLeft>
            <SearchInput
              placeholder="Search here..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#9CA3AF', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            <FilterButton>
              <FilterList sx={{ fontSize: 18 }} />
              Filter
            </FilterButton>
          </FilterLeft>
          <FilterRight>
            <DropdownButton>
              Date Range <KeyboardArrowDown sx={{ fontSize: 18 }} />
            </DropdownButton>
            <DropdownButton>
              All Status <KeyboardArrowDown sx={{ fontSize: 18 }} />
            </DropdownButton>
            <ExportButton>
              Export as XLS <FileDownload sx={{ fontSize: 18 }} />
            </ExportButton>
          </FilterRight>
        </FilterRow>

        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: '40px' }}><Checkbox size="small" /></Th>
                <Th>Worker</Th>
                <Th>Primary Contact</Th>
                <Th>Email address</Th>
                <Th>Sector</Th>
                <Th>Active Shifts</Th>
                <Th>Billing Status</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {listLoading ? (
                <tr>
                  <Td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                    <CircularProgress size={24} />
                  </Td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <Td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: colors.text.secondary }}>
                    No clients found
                  </Td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id}>
                    <Td><Checkbox size="small" /></Td>
                    <Td>
                      <ClientCell>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: colors.primary.blue, fontSize: 13, fontWeight: 600 }}>
                          {getInitials(client.name)}
                        </Avatar>
                        <Box>
                          <span className="name">{client.name}</span>
                          <div className="id">{formatClientId(client.id)}</div>
                        </Box>
                      </ClientCell>
                    </Td>
                    <Td>{client.contactName || '-'}</Td>
                    <Td>{client.contactEmail || '-'}</Td>
                    <Td>{client.industry || '-'}</Td>
                    <Td>
                      <WorkerProgress>
                        <ProgressHeader>
                          <span>{client.activeShifts.filled}/{client.activeShifts.needed} filled</span>
                          <span>{client.activeShifts.percentage}%</span>
                        </ProgressHeader>
                        <ProgressBar>
                          <ProgressFill percentage={client.activeShifts.percentage} />
                        </ProgressBar>
                      </WorkerProgress>
                    </Td>
                    <Td>
                      <BillingBadge status={client.billingStatus}>
                        {client.billingStatus === 'NONE' ? 'N/A' : client.billingStatus}
                      </BillingBadge>
                    </Td>
                    <Td>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, client.id)}>
                        <MoreVert sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Box>

        <MuiMenu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', minWidth: '160px' },
          }}
        >
          <ActionMenuItem onClick={() => { handleMenuClose(); navigate(`/clients/${menuClientId}`); }}>
            <Visibility /> View Client
          </ActionMenuItem>
          <ActionMenuItem onClick={() => { setEditClientId(menuClientId); handleMenuClose(); }}>
            <Edit /> Edit Client
          </ActionMenuItem>
          <ActionMenuItem danger onClick={handleMenuClose}>
            <Block /> Block Client
          </ActionMenuItem>
        </MuiMenu>

        <Pagination>
          <Box display="flex" alignItems="center" gap="8px">
            <PaginationText>Rows per page</PaginationText>
            <Select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              size="small"
              sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', '& .MuiSelect-select': { padding: '6px 12px' } }}
            >
              <MenuItem value={8}>08</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </Select>
          </Box>
          <PaginationText>
            Showing {clients.length} out of {pagination?.total ?? 0} items
          </PaginationText>
          <PaginationControls>
            <PageButton 
              disabled={currentPage <= 1} 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft sx={{ fontSize: 18 }} />
            </PageButton>
            <PageButton style={{ backgroundColor: colors.primary.navy, color: 'white', border: 'none' }}>
              {currentPage}
            </PageButton>
            <PageButton 
              disabled={currentPage >= (pagination?.totalPages ?? 1)}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight sx={{ fontSize: 18 }} />
            </PageButton>
          </PaginationControls>
        </Pagination>
      </TableCard>

      {/* Add Client Modal */}
      <AddClientModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      {/* Edit Client Modal */}
      <EditClientModal
        open={!!editClientId}
        onClose={() => setEditClientId(null)}
        clientId={editClientId}
      />
    </DashboardContainer>
  );
}

export default ClientsPage;
