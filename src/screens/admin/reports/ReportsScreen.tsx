import React, { useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOrgTheme, useTheme } from '../../../contexts';
import { H2, H3, Body, Caption, Card } from '../../../components/ui';
import {
  useGetExecutiveSummaryQuery,
  useGetShiftReportQuery,
  useGetAttendanceReportQuery,
  useGetWorkforceReportQuery,
  useGetClientReportQuery,
} from '../../../store/slices/adminSlices/reportSlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
  APPROVED: { bg: '#D1FAE5', color: '#059669', icon: 'checkmark-circle-outline' },
  PENDING:  { bg: '#FEF3C7', color: '#D97706', icon: 'time-outline'             },
  REJECTED: { bg: '#FFE4E6', color: '#DC2626', icon: 'close-circle-outline'     },
};

function trendIcon(trend?: string) {
  return trend === 'down' ? 'arrow-down-outline' : 'arrow-up-outline';
}
function trendColor(trend?: string) {
  return trend === 'down' ? '#EF4444' : '#10B981';
}

// ─── Bar chart (native View-based) ────────────────────────────────────────────

function BarChart({ data, primaryColor }: { data: Array<{ day: string; count: number }>; primaryColor: string }) {
  const BAR_H = 120;
  const maxVal = Math.max(...data.map(d => d.count), 1);
  return (
    <View style={{ height: BAR_H + 28, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 4 }}>
      {data.map((d) => {
        const h = Math.max((d.count / maxVal) * BAR_H, 4);
        const label = d.day.substring(0, 3).toUpperCase();
        return (
          <View key={label} style={{ flex: 1, alignItems: 'center', marginHorizontal: 2 }}>
            <Caption color="secondary" style={{ fontSize: 10, marginBottom: 2 }}>{d.count}</Caption>
            <View style={{ width: '100%', height: h, backgroundColor: primaryColor, borderRadius: 4, opacity: 0.9 }} />
            <Caption color="secondary" style={{ fontSize: 10, marginTop: 4 }}>{label}</Caption>
          </View>
        );
      })}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();

  const { data: summary, isLoading: summaryLoading } = useGetExecutiveSummaryQuery({ period: '30' });
  const { data: shiftReport, isLoading: shiftsLoading } = useGetShiftReportQuery({});
  const { data: attendanceReport, isLoading: attendanceLoading } = useGetAttendanceReportQuery({});
  const { data: workforceReport } = useGetWorkforceReportQuery();
  const { data: clientReport } = useGetClientReportQuery({});

  const isLoading = summaryLoading || shiftsLoading || attendanceLoading;

  const kpis = summary?.kpis ?? [];
  const totalWorkers   = kpis.find(k => k.name === 'Active Workers')?.value  ?? workforceReport?.summary?.totalWorkers ?? 0;
  const totalClients   = clientReport?.summary?.totalClients ?? 0;
  const totalRevenue   = kpis.find(k => k.name === 'Gross Payroll')?.value   ?? 0;
  const totalShifts    = shiftReport?.summary?.totalShifts ?? 0;
  const workersTrend   = kpis.find(k => k.name === 'Active Workers');
  const shiftsTrend    = kpis.find(k => k.name === 'Shifts Created');

  const dayBreakdown   = shiftReport?.dayBreakdown ?? [];
  const activePercent  = workforceReport?.statusBreakdown?.find(s => s.status === 'ACTIVE')?.percentage ?? 90;
  const attendanceRows = attendanceReport?.statusBreakdown ?? [];
  const attSummary     = attendanceReport?.summary;
  const punctuality    = attendanceReport?.punctuality?.punctualityRate ?? 0;

  const statCards = useMemo(() => [
    { icon: 'people', bg: '#E0F2FE', iconColor: '#3B82F6', value: String(totalWorkers),   label: 'Total Workers',   trend: workersTrend?.trend, change: Math.abs(workersTrend?.change ?? 0) },
    { icon: 'business', bg: '#D1FAE5', iconColor: '#10B981', value: String(totalClients), label: 'Total Clients',   trend: 'up' as const,       change: clientReport?.summary?.activityRate ?? 0 },
    { icon: 'cash',     bg: '#FEF3C7', iconColor: '#F59E0B', value: `£${totalRevenue >= 1000 ? (totalRevenue / 1000).toFixed(1) + 'k' : totalRevenue}`, label: 'Total Revenue', trend: 'up' as const, change: 0 },
    { icon: 'calendar', bg: '#EDE9FE', iconColor: '#7C3AED', value: String(totalShifts),  label: 'Shifts (30 days)', trend: shiftsTrend?.trend,  change: Math.abs(shiftsTrend?.change ?? 0) },
  ], [totalWorkers, totalClients, totalRevenue, totalShifts, workersTrend, shiftsTrend, clientReport]);

  const rowBg = isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB';

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4">
        {navigation.canGoBack() && (
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color={isDark ? '#FFF' : '#000035'} />
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <H2>Reports</H2>
          <Caption color="secondary">Review attendance, approve hours, and resolve exceptions</Caption>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Caption color="secondary" className="mt-3 text-xs">Loading report data...</Caption>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

          {/* ── Hero card ─────────────────────────────────────────────── */}
          <View className="px-5 mb-5">
            <Card className="p-5" style={{ backgroundColor: primaryColor }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Caption className="text-white/70 text-xs mb-1">Total Shifts (30 days)</Caption>
                  <H2 className="text-white text-4xl font-outfit-bold">{totalShifts}</H2>
                  <View className="flex-row items-center gap-1.5 mt-2">
                    <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      <Caption className="text-white/90 text-xs">
                        {shiftReport?.summary?.completionRate ?? 0}% completion rate
                      </Caption>
                    </View>
                  </View>
                </View>
                <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
                  <Ionicons name="bar-chart" size={26} color="#FFF" />
                </View>
              </View>
            </Card>
          </View>

          {/* ── KPI cards 2×2 ────────────────────────────────────────── */}
          <View className="px-5 mb-5">
            <View className="flex-row gap-3 mb-3">
              {statCards.slice(0, 2).map((s) => (
                <Card key={s.label} className="flex-1 p-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: s.bg }}>
                      <Ionicons name={s.icon as any} size={20} color={s.iconColor} />
                    </View>
                    {s.change > 0 && (
                      <View className="flex-row items-center gap-0.5">
                        <Ionicons name={trendIcon(s.trend)} size={12} color={trendColor(s.trend)} />
                        <Caption style={{ color: trendColor(s.trend), fontSize: 11 }}>{s.change}%</Caption>
                      </View>
                    )}
                  </View>
                  <H3 className="text-xl font-outfit-bold mb-0.5">{s.value}</H3>
                  <Caption color="secondary" className="text-xs">{s.label}</Caption>
                </Card>
              ))}
            </View>
            <View className="flex-row gap-3">
              {statCards.slice(2, 4).map((s) => (
                <Card key={s.label} className="flex-1 p-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: s.bg }}>
                      <Ionicons name={s.icon as any} size={20} color={s.iconColor} />
                    </View>
                    {s.change > 0 && (
                      <View className="flex-row items-center gap-0.5">
                        <Ionicons name={trendIcon(s.trend)} size={12} color={trendColor(s.trend)} />
                        <Caption style={{ color: trendColor(s.trend), fontSize: 11 }}>{s.change}%</Caption>
                      </View>
                    )}
                  </View>
                  <H3 className="text-xl font-outfit-bold mb-0.5">{s.value}</H3>
                  <Caption color="secondary" className="text-xs">{s.label}</Caption>
                </Card>
              ))}
            </View>
          </View>

          {/* ── Shifts by Day bar chart ───────────────────────────────── */}
          <View className="px-5 mb-5">
            <Card className="p-4">
              <View className="flex-row items-center justify-between mb-4">
                <Body className="font-outfit-semibold">Shifts by Day</Body>
                <View className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg" style={{ backgroundColor: rowBg }}>
                  <Caption className="text-xs">Last 30 days</Caption>
                  <Ionicons name="chevron-down" size={13} color="#9CA3AF" />
                </View>
              </View>
              {dayBreakdown.length > 0 ? (
                <BarChart data={dayBreakdown} primaryColor={primaryColor} />
              ) : (
                <View className="h-20 items-center justify-center">
                  <Caption color="secondary" className="text-xs">No shift data available</Caption>
                </View>
              )}
            </Card>
          </View>

          {/* ── Workers Availability ──────────────────────────────────── */}
          <View className="px-5 mb-5">
            <Card className="p-4">
              <Body className="font-outfit-semibold mb-4">Workers Availability</Body>
              <View className="flex-row items-center gap-4">
                {/* Ring */}
                <View className="w-24 h-24 rounded-full items-center justify-center" style={{ backgroundColor: '#E0F2FE' }}>
                  <View className="w-20 h-20 rounded-full items-center justify-center bg-light-background-primary dark:bg-dark-background-primary">
                    <H3 className="text-xl font-outfit-bold" style={{ color: primaryColor }}>{activePercent}%</H3>
                    <Caption color="secondary" style={{ fontSize: 10 }}>Active</Caption>
                  </View>
                </View>
                {/* Legend */}
                <View className="flex-1 gap-2">
                  {(workforceReport?.statusBreakdown ?? [{ status: 'ACTIVE', count: 0, percentage: activePercent }, { status: 'OTHER', count: 0, percentage: 100 - activePercent }]).slice(0, 4).map((s) => (
                    <View key={s.status} className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.status === 'ACTIVE' ? primaryColor : s.status === 'SUSPENDED' ? '#F59E0B' : '#E5E7EB' }} />
                        <Caption color="secondary" className="text-xs capitalize">{s.status.toLowerCase()}</Caption>
                      </View>
                      <Body className="text-xs font-outfit-semibold">{s.percentage}%</Body>
                    </View>
                  ))}
                  {/* Progress bar */}
                  <View className="h-1.5 rounded-full mt-1" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}>
                    <View className="h-1.5 rounded-full" style={{ width: `${activePercent}%`, backgroundColor: primaryColor }} />
                  </View>
                </View>
              </View>
            </Card>
          </View>

          {/* ── Shift summary strip ───────────────────────────────────── */}
          {shiftReport && (
            <View className="px-5 mb-5">
              <Card className="p-4">
                <Body className="font-outfit-semibold mb-3">Shift Summary</Body>
                <View className="flex-row gap-3">
                  {[
                    { label: 'Total',     value: shiftReport.summary.totalShifts,     color: primaryColor  },
                    { label: 'Completed', value: shiftReport.summary.completedShifts,  color: '#059669'     },
                    { label: 'Cancelled', value: shiftReport.summary.cancelledShifts,  color: '#DC2626'     },
                    { label: 'Rate',      value: `${shiftReport.summary.completionRate}%`, color: '#7C3AED' },
                  ].map((s) => (
                    <View key={s.label} className="flex-1 items-center py-3 rounded-xl" style={{ backgroundColor: rowBg }}>
                      <Body className="font-outfit-bold text-base" style={{ color: s.color }}>{s.value}</Body>
                      <Caption color="secondary" style={{ fontSize: 10, marginTop: 2 }}>{s.label}</Caption>
                    </View>
                  ))}
                </View>
              </Card>
            </View>
          )}

          {/* ── Attendance Summary ────────────────────────────────────── */}
          <View className="px-5 mb-5">
            <Card>
              <View className="p-4" style={{ borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }}>
                <Body className="font-outfit-semibold">Attendance Summary</Body>
              </View>

              {/* Status breakdown */}
              <View className="p-4 gap-3">
                {attendanceRows.length > 0 ? attendanceRows.map((item) => {
                  const st = STATUS_STYLE[item.status] ?? { bg: '#F3F4F6', color: '#6B7280', icon: 'ellipse-outline' };
                  return (
                    <View key={item.status} className="p-3.5 rounded-xl" style={{ backgroundColor: rowBg }}>
                      <View className="flex-row items-center gap-3">
                        <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: st.bg }}>
                          <Ionicons name={st.icon as any} size={16} color={st.color} />
                        </View>
                        <View className="flex-1">
                          <Body className="font-outfit-semibold text-sm capitalize">{item.status.toLowerCase()}</Body>
                          <View className="mt-1.5 h-1.5 rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}>
                            <View className="h-1.5 rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: st.color }} />
                          </View>
                        </View>
                        <View className="items-end">
                          <Body className="font-outfit-bold text-sm">{item.count}</Body>
                          <Caption style={{ color: st.color, fontSize: 11 }}>{item.percentage}%</Caption>
                        </View>
                      </View>
                    </View>
                  );
                }) : (
                  <View className="py-6 items-center">
                    <Caption color="secondary" className="text-xs">No attendance data available</Caption>
                  </View>
                )}
              </View>

              {/* 4-metric summary footer */}
              {attSummary && (
                <View
                  className="p-4"
                  style={{ borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }}
                >
                  <View className="flex-row">
                    {[
                      { label: 'Total Records', value: String(attSummary.totalRecords),          color: isDark ? '#FFF' : '#111827' },
                      { label: 'Approval Rate', value: `${attSummary.approvalRate ?? 0}%`,       color: '#059669'  },
                      { label: 'Total Hours',   value: `${(attSummary.totalHoursWorked ?? 0).toFixed(0)}h`, color: primaryColor },
                      { label: 'Punctuality',   value: `${punctuality}%`,                        color: '#7C3AED'  },
                    ].map((m, i) => (
                      <View key={m.label} className="flex-1 items-center" style={i > 0 ? { borderLeftWidth: 1, borderLeftColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' } : {}}>
                        <Body className="font-outfit-bold text-lg" style={{ color: m.color }}>{m.value}</Body>
                        <Caption color="secondary" style={{ fontSize: 10, textAlign: 'center', marginTop: 2 }}>{m.label}</Caption>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Card>
          </View>

          <View className="h-24" />
        </ScrollView>
      )}
    </View>
  );
}

export default ReportsScreen;
