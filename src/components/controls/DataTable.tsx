import { Box, styled } from '@mui/material';
import type { ReactNode } from 'react';
import { colors } from '../../utilities/colors';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  render?: (row: T) => ReactNode;
}

export interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
}

const TableWrapper = styled(Box)({
  backgroundColor: colors.secondary.white,
  borderRadius: '12px',
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
  border: '1px solid #E5E7EB',
  overflow: 'hidden',
});

const Table = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
});

const TableHead = styled('thead')({
  backgroundColor: '#F9FAFB',
  borderBottom: '1px solid #E5E7EB',
});

const TableBody = styled('tbody')({});

const HeaderCell = styled('th')<{ width?: string }>(({ width }) => ({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.75rem',
  fontWeight: 600,
  color: colors.text.secondary,
  textAlign: 'left',
  padding: '12px 16px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  width: width ?? 'auto',
}));

const TableRow = styled('tr')<{ clickable?: boolean }>(({ clickable }) => ({
  borderBottom: '1px solid #E5E7EB',
  transition: 'background-color 0.15s ease',
  cursor: clickable ? 'pointer' : 'default',
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: clickable ? '#F9FAFB' : 'transparent',
  },
}));

const TableCell = styled('td')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  color: colors.text.primary,
  padding: '16px',
  verticalAlign: 'middle',
});

const EmptyState = styled(Box)({
  padding: '48px 24px',
  textAlign: 'center',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  color: colors.text.secondary,
});

const LoadingState = styled(Box)({
  padding: '48px 24px',
  textAlign: 'center',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  color: colors.text.secondary,
});

export function DataTable<T extends object>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available',
  loading = false,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <TableWrapper>
        <LoadingState>Loading...</LoadingState>
      </TableWrapper>
    );
  }

  if (data.length === 0) {
    return (
      <TableWrapper>
        <EmptyState>{emptyMessage}</EmptyState>
      </TableWrapper>
    );
  }

  return (
    <TableWrapper>
      <Table>
        <TableHead>
          <tr>
            {columns.map((col) => (
              <HeaderCell key={String(col.key)} width={col.width}>
                {col.header}
              </HeaderCell>
            ))}
          </tr>
        </TableHead>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow
              key={idx}
              clickable={!!onRowClick}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <TableCell key={String(col.key)}>
                  {col.render
                    ? col.render(row)
                    : (row[col.key as keyof T] as ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}

export default DataTable;
