import { useState } from 'react';
import {
  Search,
  FilterList,
  Edit,
  CheckCircle,
  Close,
  AccountBalance,
  VerifiedUser,
  Warning,
  Person,
} from '@mui/icons-material';
import {
  Box,
  styled,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Avatar,
  Modal,
  IconButton,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useDocumentTitle } from '../../hooks';
import { DashboardContainer, GridCols4 } from '../../components/layout';
import { StatsCard } from '../../components/controls';
import { colors } from '../../utilities/colors';
import {
  useListBankAccountsQuery,
  useUpdateWorkerBankAccountMutation,
  useVerifyBankAccountMutation,
  type WorkerBankAccountListItem,
  type SaveBankAccountRequest,
} from '../../store/slices/bankAccountSlice';

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
  width: '280px',
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

const WorkerCell = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.primary.navy,
});

const ActionButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  borderRadius: '6px',
  border: '1px solid #E5E7EB',
  backgroundColor: colors.secondary.white,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: colors.text.secondary,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#F9FAFB' },
  '& svg': { fontSize: '16px' },
});

const VerifyButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: '#10B981',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  fontWeight: 500,
  color: colors.secondary.white,
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#059669' },
  '& svg': { fontSize: '16px' },
});

// Modal Styles
const ModalOverlay = styled(Box)({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ModalCard = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  padding: '32px',
  width: '520px',
  maxWidth: '90vw',
  position: 'relative',
  outline: 'none',
});

const ModalClose = styled(IconButton)({
  position: 'absolute',
  top: '16px',
  right: '16px',
});

const ModalTitle = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '22px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: '0 0 8px',
  textAlign: 'center',
});

const ModalSubtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: colors.text.secondary,
  margin: '0 0 24px',
  textAlign: 'center',
  lineHeight: 1.6,
});

const FormGroup = styled(Box)({
  marginBottom: '16px',
  '& label': {
    display: 'block',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    fontWeight: 500,
    color: colors.text.secondary,
    marginBottom: '6px',
  },
});

const FormInput = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': { borderColor: '#E5E7EB' },
  },
  '& .MuiInputBase-input': {
    padding: '10px 14px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
  },
});

const SaveButton = styled('button')({
  width: '100%',
  padding: '14px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: colors.primary.navy,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.secondary.white,
  cursor: 'pointer',
  marginTop: '8px',
  '&:hover': { backgroundColor: '#1a2d4a' },
  '&:disabled': { opacity: 0.6, cursor: 'not-allowed' },
});

const EmptyState = styled(Box)({
  padding: '60px 24px',
  textAlign: 'center',
  '& svg': { fontSize: '48px', color: '#D1D5DB', marginBottom: '16px' },
});

// ============ HELPERS ============
const formatSortCode = (text: string): string => {
  const digits = text.replace(/\D/g, '').slice(0, 6);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
};

// ============ COMPONENT ============
export function BankAccountsPage() {
  useDocumentTitle('Bank Accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [editOpen, setEditOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<WorkerBankAccountListItem | null>(null);

  // Form state
  const [formAccountHolder, setFormAccountHolder] = useState('');
  const [formBankName, setFormBankName] = useState('');
  const [formSortCode, setFormSortCode] = useState('');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formBuildingSocietyRef, setFormBuildingSocietyRef] = useState('');

  // API Hooks
  const { data, isLoading } = useListBankAccountsQuery({
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter && { status: statusFilter }),
  });
  const [updateBankAccount, { isLoading: updating }] = useUpdateWorkerBankAccountMutation();
  const [verifyBankAccount] = useVerifyBankAccountMutation();

  const workers = data?.workers ?? [];
  const stats = data?.stats ?? { total: 0, withBankAccount: 0, missingBankAccount: 0, verified: 0, unverified: 0 };

  const openEditModal = (worker: WorkerBankAccountListItem) => {
    setSelectedWorker(worker);
    if (worker.bankAccount) {
      setFormAccountHolder(worker.bankAccount.accountHolder);
      setFormBankName(worker.bankAccount.bankName);
      setFormSortCode(worker.bankAccount.sortCode);
      setFormAccountNumber(worker.bankAccount.accountNumber);
      setFormBuildingSocietyRef(worker.bankAccount.buildingSocietyRef || '');
    } else {
      setFormAccountHolder(worker.fullName);
      setFormBankName('');
      setFormSortCode('');
      setFormAccountNumber('');
      setFormBuildingSocietyRef('');
    }
    setEditOpen(true);
  };

  const closeEditModal = () => {
    setEditOpen(false);
    setSelectedWorker(null);
  };

  const handleSave = async () => {
    if (!selectedWorker) return;
    try {
      const payload: SaveBankAccountRequest = {
        accountHolder: formAccountHolder.trim(),
        bankName: formBankName.trim(),
        sortCode: formSortCode.trim(),
        accountNumber: formAccountNumber.trim(),
        ...(formBuildingSocietyRef.trim() && { buildingSocietyRef: formBuildingSocietyRef.trim() }),
      };
      await updateBankAccount({ workerId: selectedWorker.id, data: payload }).unwrap();
      closeEditModal();
    } catch (error) {
      console.error('Failed to update bank account:', error);
    }
  };

  const handleVerify = async (workerId: string) => {
    try {
      await verifyBankAccount(workerId).unwrap();
    } catch (error) {
      console.error('Failed to verify bank account:', error);
    }
  };

  const getStatusChip = (worker: WorkerBankAccountListItem) => {
    if (!worker.hasBankAccount) {
      return <Chip label="Missing" size="small" sx={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontFamily: "'Outfit', sans-serif", fontSize: '12px', fontWeight: 500 }} />;
    }
    if (worker.isVerified) {
      return <Chip label="Verified" size="small" sx={{ backgroundColor: '#D1FAE5', color: '#059669', fontFamily: "'Outfit', sans-serif", fontSize: '12px', fontWeight: 500 }} />;
    }
    return <Chip label="Unverified" size="small" sx={{ backgroundColor: '#FEF3C7', color: '#D97706', fontFamily: "'Outfit', sans-serif", fontSize: '12px', fontWeight: 500 }} />;
  };

  const isFormValid = formAccountHolder.trim() && formBankName.trim() && /^\d{2}-\d{2}-\d{2}$/.test(formSortCode.trim()) && /^\d{8}$/.test(formAccountNumber.trim());

  return (
    <DashboardContainer>
      <HeaderRow>
        <TitleSection>
          <PageTitle>Bank Accounts</PageTitle>
          <PageSubtitle>Manage worker bank details for payroll BACS payments</PageSubtitle>
        </TitleSection>
      </HeaderRow>

      {/* Stats Cards */}
      <GridCols4>
        <StatsCard
          title="Total Workers"
          value={stats.total}
          icon={<Person />}
          color="#3B82F6"
        />
        <StatsCard
          title="Bank Details Provided"
          value={stats.withBankAccount}
          icon={<AccountBalance />}
          color="#10B981"
        />
        <StatsCard
          title="Missing Details"
          value={stats.missingBankAccount}
          icon={<Warning />}
          color="#EF4444"
        />
        <StatsCard
          title="Verified"
          value={stats.verified}
          icon={<VerifiedUser />}
          color="#8B5CF6"
        />
      </GridCols4>

      {/* Table */}
      <TableCard>
        <CardHeader>
          <h3>Worker Bank Account Details</h3>
        </CardHeader>

        <FilterRow>
          <FilterLeft>
            <SearchInput
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 20, color: '#9CA3AF' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
              size="small"
              sx={{
                borderRadius: '8px',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
                minWidth: '160px',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
              }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="provided">Details Provided</MenuItem>
              <MenuItem value="missing">Missing Details</MenuItem>
              <MenuItem value="verified">Verified</MenuItem>
              <MenuItem value="unverified">Unverified</MenuItem>
            </Select>
          </FilterLeft>
        </FilterRow>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <CircularProgress />
          </Box>
        ) : workers.length === 0 ? (
          <EmptyState>
            <AccountBalance />
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '16px', fontWeight: 600, color: colors.primary.navy }}>
              No workers found
            </Box>
            <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: colors.text.secondary, mt: 1 }}>
              {searchTerm || statusFilter ? 'Try adjusting your filters' : 'Workers will appear here once added to your organisation'}
            </Box>
          </EmptyState>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Worker</Th>
                  <Th>Bank Name</Th>
                  <Th>Sort Code</Th>
                  <Th>Account Number</Th>
                  <Th>Status</Th>
                  <Th style={{ textAlign: 'right' }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id}>
                    <Td>
                      <WorkerCell>
                        <Avatar
                          src={worker.profilePicUrl || undefined}
                          sx={{ width: 36, height: 36, fontSize: '14px', bgcolor: colors.primary.navy }}
                        >
                          {worker.fullName?.charAt(0) ?? '?'}
                        </Avatar>
                        <Box>
                          <Box sx={{ fontWeight: 500 }}>{worker.fullName}</Box>
                          <Box sx={{ fontSize: '12px', color: colors.text.secondary, fontWeight: 400 }}>{worker.email}</Box>
                        </Box>
                      </WorkerCell>
                    </Td>
                    <Td>
                      {worker.bankAccount ? (
                        <Box sx={{ fontWeight: 500 }}>{worker.bankAccount.bankName}</Box>
                      ) : (
                        <Box sx={{ color: '#D1D5DB', fontStyle: 'italic' }}>—</Box>
                      )}
                    </Td>
                    <Td>
                      {worker.bankAccount ? (
                        <Box sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>{worker.bankAccount.sortCode}</Box>
                      ) : (
                        <Box sx={{ color: '#D1D5DB' }}>—</Box>
                      )}
                    </Td>
                    <Td>
                      {worker.bankAccount ? (
                        <Box sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>
                          ****{worker.bankAccount.accountNumber.slice(-4)}
                        </Box>
                      ) : (
                        <Box sx={{ color: '#D1D5DB' }}>—</Box>
                      )}
                    </Td>
                    <Td>{getStatusChip(worker)}</Td>
                    <Td style={{ textAlign: 'right' }}>
                      <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <ActionButton onClick={() => openEditModal(worker)}>
                          <Edit /> {worker.hasBankAccount ? 'Edit' : 'Add'}
                        </ActionButton>
                        {worker.hasBankAccount && !worker.isVerified && (
                          <VerifyButton onClick={() => handleVerify(worker.id)}>
                            <CheckCircle /> Verify
                          </VerifyButton>
                        )}
                      </Box>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </TableCard>

      {/* Edit Bank Account Modal */}
      <Modal open={editOpen} onClose={closeEditModal}>
        <ModalOverlay>
          <ModalCard>
            <ModalClose onClick={closeEditModal}><Close /></ModalClose>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <AccountBalance sx={{ fontSize: 48, color: '#3B82F6' }} />
            </Box>
            <ModalTitle>{selectedWorker?.hasBankAccount ? 'Edit' : 'Add'} Bank Details</ModalTitle>
            <ModalSubtitle>
              {selectedWorker?.hasBankAccount ? 'Update' : 'Enter'} bank account details for <strong>{selectedWorker?.fullName}</strong>
            </ModalSubtitle>

            <FormGroup>
              <label>Account Holder Name *</label>
              <FormInput
                placeholder="Name as shown on bank account"
                value={formAccountHolder}
                onChange={(e) => setFormAccountHolder(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <label>Bank Name *</label>
              <FormInput
                placeholder="e.g. Barclays, HSBC, Lloyds"
                value={formBankName}
                onChange={(e) => setFormBankName(e.target.value)}
              />
            </FormGroup>

            <Box sx={{ display: 'flex', gap: '16px' }}>
              <FormGroup sx={{ flex: 1 }}>
                <label>Sort Code *</label>
                <FormInput
                  placeholder="e.g. 12-34-56"
                  value={formSortCode}
                  onChange={(e) => setFormSortCode(formatSortCode(e.target.value))}
                  inputProps={{ maxLength: 8 }}
                />
              </FormGroup>
              <FormGroup sx={{ flex: 1 }}>
                <label>Account Number *</label>
                <FormInput
                  placeholder="e.g. 12345678"
                  value={formAccountNumber}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                    setFormAccountNumber(digits);
                  }}
                  inputProps={{ maxLength: 8 }}
                />
              </FormGroup>
            </Box>

            <FormGroup>
              <label>Building Society Reference (optional)</label>
              <FormInput
                placeholder="If applicable"
                value={formBuildingSocietyRef}
                onChange={(e) => setFormBuildingSocietyRef(e.target.value)}
              />
            </FormGroup>

            <SaveButton onClick={handleSave} disabled={updating || !isFormValid}>
              {updating ? <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} /> : null}
              {selectedWorker?.hasBankAccount ? 'Update Bank Details' : 'Save Bank Details'}
            </SaveButton>
          </ModalCard>
        </ModalOverlay>
      </Modal>
    </DashboardContainer>
  );
}

export default BankAccountsPage;
