import React, { useState, useCallback, useMemo } from 'react';
import { View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrgTheme, useTheme } from '../../contexts';
import { Body, Caption, Card } from '../../components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterOption {
  label: string;
  value: string;
}

export interface PaginatedCardListProps<T> {
  /** Full data array to paginate over */
  data: T[];

  /** Default number of cards per page (default: 5) */
  defaultPageSize?: number;

  /** Allowed rows-per-page options shown in the selector */
  pageSizeOptions?: number[];

  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;

  /** Fields to search across. Dot-notation supported e.g. "profile.name" */
  searchKeys?: (keyof T | string)[];

  /** Search input placeholder */
  searchPlaceholder?: string;

  /** Filter options rendered as pills below the search bar */
  filterOptions?: FilterOption[];

  /** Key in T used for the filter value comparison */
  filterKey?: keyof T;

  /** Called whenever page, search, filter, or pageSize changes */
  onStateChange?: (state: { page: number; search: string; filter: string; pageSize: number }) => void;

  /** Override the empty-state message */
  emptyTitle?: string;
  emptySubtitle?: string;

  /** Optional header slot rendered above the search bar */
  headerSlot?: React.ReactNode;

  /** Label for the list section (defaults to "Results") */
  sectionLabel?: string;

  /** Extra className on the outer wrapper */
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNestedValue(obj: any, path: string): string {
  return (
    path
      .split('.')
      .reduce((acc, key) => (acc != null ? acc[key] : ''), obj)
      ?.toString()
      ?.toLowerCase() ?? ''
  );
}

function useDebounce<T>(value: T, delay = 220): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Pagination sub-component ─────────────────────────────────────────────────

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPage: (page: number) => void;
  primaryColor: string;
  isDark: boolean;
  totalItems: number;
  pageSize: number;
}

function PaginationBar({
  currentPage,
  totalPages,
  onPage,
  primaryColor,
  isDark,
  totalItems,
  pageSize,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2)
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  const start = (currentPage - 1) * pageSize + 1;
  const end   = Math.min(currentPage * pageSize, totalItems);
  const btnBg = isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6';
  const textClr = isDark ? '#FFF' : '#374151';

  return (
    <View className="mt-4">
      <View className="flex-row items-center justify-between">
        {/* Prev */}
        <TouchableOpacity
          onPress={() => onPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl"
          style={{ backgroundColor: btnBg, opacity: currentPage === 1 ? 0.35 : 1 }}
        >
          <Ionicons name="chevron-back" size={15} color={textClr} />
          <Body className="text-xs font-outfit-medium" style={{ color: textClr }}>Prev</Body>
        </TouchableOpacity>

        {/* Page pills */}
        <View className="flex-row items-center gap-1.5">
          {getPageNumbers().map(page => {
            const active = page === currentPage;
            return (
              <TouchableOpacity
                key={page}
                onPress={() => onPage(page)}
                className="w-9 h-9 rounded-xl items-center justify-center"
                style={{ backgroundColor: active ? primaryColor : btnBg }}
              >
                <Body
                  className="text-xs font-outfit-semibold"
                  style={{ color: active ? '#FFF' : textClr }}
                >
                  {page}
                </Body>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Next */}
        <TouchableOpacity
          onPress={() => onPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl"
          style={{ backgroundColor: btnBg, opacity: currentPage === totalPages ? 0.35 : 1 }}
        >
          <Body className="text-xs font-outfit-medium" style={{ color: textClr }}>Next</Body>
          <Ionicons name="chevron-forward" size={15} color={textClr} />
        </TouchableOpacity>
      </View>

      {/* Results summary */}
      <View className="items-center mt-3">
        <Caption color="secondary" className="text-xs">
          Showing {start}–{end} of {totalItems} results
        </Caption>
      </View>
    </View>
  );
}

// ─── Rows-per-page selector ───────────────────────────────────────────────────

interface RowsPerPageProps {
  value: number;
  options: number[];
  onChange: (n: number) => void;
  primaryColor: string;
  isDark: boolean;
}

function RowsPerPage({ value, options, onChange, primaryColor, isDark }: RowsPerPageProps) {
  const btnBg  = isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6';
  const textClr = isDark ? '#D1D5DB' : '#374151';

  return (
    <View className="flex-row items-center gap-2">
      <Caption color="secondary" className="text-xs">Rows per page:</Caption>
      <View className="flex-row gap-1.5">
        {options.map(opt => {
          const active = opt === value;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => onChange(opt)}
              className="px-3 py-1.5 rounded-lg"
              style={{
                backgroundColor: active ? primaryColor : btnBg,
              }}
            >
              <Body
                className="text-xs font-outfit-semibold"
                style={{ color: active ? '#FFF' : textClr }}
              >
                {opt}
              </Body>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PaginatedCardList<T extends Record<string, any>>({
  data,
  defaultPageSize = 5,
  pageSizeOptions = [3, 5, 10],
  renderItem,
  searchKeys = [],
  searchPlaceholder = 'Search...',
  filterOptions,
  filterKey,
  onStateChange,
  emptyTitle    = 'No results found',
  emptySubtitle = 'Try adjusting your search or filters',
  headerSlot,
  sectionLabel = 'Results',
  className,
}: PaginatedCardListProps<T>) {
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();

  const [searchRaw,    setSearchRaw]    = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [currentPage,  setCurrentPage]  = useState(1);
  const [pageSize,     setPageSize]     = useState(defaultPageSize);

  const search = useDebounce(searchRaw, 220);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return data.filter(item => {
      const matchesSearch =
        search.trim() === '' ||
        searchKeys.some(key =>
          getNestedValue(item, key as string).includes(search.toLowerCase()),
        );
      const matchesFilter =
        !filterKey ||
        activeFilter === 'ALL' ||
        String(item[filterKey]) === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [data, search, searchKeys, activeFilter, filterKey]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const notify = useCallback(
    (overrides: Partial<{ page: number; search: string; filter: string; pageSize: number }>) => {
      onStateChange?.({
        page: currentPage, search: searchRaw, filter: activeFilter, pageSize,
        ...overrides,
      });
    },
    [currentPage, searchRaw, activeFilter, pageSize, onStateChange],
  );

  const handleSearch = useCallback((text: string) => {
    setSearchRaw(text);
    setCurrentPage(1);
    notify({ search: text, page: 1 });
  }, [notify]);

  const handleFilter = useCallback((value: string) => {
    setActiveFilter(value);
    setCurrentPage(1);
    notify({ filter: value, page: 1 });
  }, [notify]);

  const handlePage = useCallback((page: number) => {
    setCurrentPage(page);
    notify({ page });
  }, [notify]);

  const handlePageSize = useCallback((n: number) => {
    setPageSize(n);
    setCurrentPage(1);
    notify({ pageSize: n, page: 1 });
  }, [notify]);

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const inputBg      = isDark ? 'rgba(255,255,255,0.06)' : '#F9FAFB';
  const inputBorder  = isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB';
  const surfaceBg    = isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6';
  const textColor    = isDark ? '#FFFFFF' : '#111827';
  const placeholder  = '#9CA3AF';

  return (
    <View className={className}>

      {/* Optional header slot */}
      {headerSlot}

      {/* ── Search bar ──────────────────────────────────────────────────── */}
      <View
        className="flex-row items-center gap-2 px-3 h-12 rounded-xl border mb-3"
        style={{ backgroundColor: inputBg, borderColor: inputBorder }}
      >
        <Ionicons name="search-outline" size={18} color={placeholder} />
        <TextInput
          value={searchRaw}
          onChangeText={handleSearch}
          placeholder={searchPlaceholder}
          placeholderTextColor={placeholder}
          style={{ flex: 1, color: textColor, fontSize: 13, fontFamily: 'Outfit-Regular' }}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchRaw.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={16} color={placeholder} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filter pills ────────────────────────────────────────────────── */}
      {filterOptions && filterOptions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
          className="mb-4"
        >
          {[{ label: 'All', value: 'ALL' }, ...filterOptions].map(opt => {
            const active = activeFilter === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => handleFilter(opt.value)}
                className="px-4 py-1.5 rounded-full"
                style={{
                  backgroundColor: active ? primaryColor : surfaceBg,
                  borderWidth: 1.5,
                  borderColor: active ? primaryColor : 'transparent',
                }}
              >
                <Body
                  className="text-xs font-outfit-medium"
                  style={{ color: active ? '#FFF' : (isDark ? '#D1D5DB' : '#374151') }}
                >
                  {opt.label}
                </Body>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* ── Section label + rows-per-page ───────────────────────────────── */}
      <View className="flex-row items-center justify-between mb-3">
        <Body className="font-outfit-semibold text-sm">
          {sectionLabel}{' '}
          <Caption color="secondary">{filtered.length}</Caption>
        </Body>
        <RowsPerPage
          value={pageSize}
          options={pageSizeOptions}
          onChange={handlePageSize}
          primaryColor={primaryColor}
          isDark={isDark}
        />
      </View>

      {/* ── Card list ───────────────────────────────────────────────────── */}
      <View className="gap-3">
        {paginated.length === 0 ? (
          <Card className="p-8 items-center justify-center">
            <View
              className="w-12 h-12 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: surfaceBg }}
            >
              <Ionicons name="search-outline" size={22} color={placeholder} />
            </View>
            <Body className="font-outfit-semibold text-sm mb-1">{emptyTitle}</Body>
            <Caption color="secondary" className="text-xs text-center">{emptySubtitle}</Caption>
          </Card>
        ) : (
          paginated.map((item, i) => (
            <React.Fragment key={item.id ?? i}>
              {renderItem(item, i)}
            </React.Fragment>
          ))
        )}
      </View>

      {/* ── Pagination bar ──────────────────────────────────────────────── */}
      <PaginationBar
        currentPage={safePage}
        totalPages={totalPages}
        onPage={handlePage}
        primaryColor={primaryColor}
        isDark={isDark}
        totalItems={filtered.length}
        pageSize={pageSize}
      />

    </View>
  );
}

export default PaginatedCardList;
