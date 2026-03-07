import React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabScreenProps } from '../../types/navigation';
import { useOrgTheme } from '../../contexts';
import { H2, H3, Body, Caption } from '../../components/ui';
import { useGetPayslipListQuery } from '../../store/api/workerApi';

type PayslipStatus = 'pending' | 'processed';

const STATUS_CONFIG: Record<PayslipStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'PENDING', bg: '#FEF3C7', text: '#D97706' },
  processed: { label: 'PROCESSED', bg: '#DCFCE7', text: '#16A34A' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function PayslipScreen({ navigation }: MainTabScreenProps<'Payslip'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor, secondaryColor } = useOrgTheme();
  const { data: payslipResponse, isLoading } = useGetPayslipListQuery();
  const payData = payslipResponse?.data;

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <View className="w-6" />
        <H2>Payslip</H2>
        <TouchableOpacity>
          <Ionicons name="options-outline" size={22} color="#000035" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : (
          <>
            {/* Total Net Earnings Banner */}
            <View
              className="mx-5 mb-6 rounded-2xl p-5"
              style={{ backgroundColor: primaryColor || '#06B6D4' }}
            >
              <Caption style={{ color: 'rgba(255,255,255,0.8)' }} className="mb-1">Total Net Earnings</Caption>
              <H2 className="text-3xl font-outfit-bold mb-2" style={{ color: '#FFFFFF' }}>
                £{(payData?.summary.totalNetEarnings ?? 0).toFixed(2)}
              </H2>
              <View className="flex-row items-center">
                <Caption style={{ color: 'rgba(255,255,255,0.8)' }}>Gross pay:  </Caption>
                <Caption className="font-outfit-semibold" style={{ color: '#FFFFFF' }}>
                  £{(payData?.summary.totalGrossPay ?? 0).toFixed(2)}
                </Caption>
                <Caption style={{ color: 'rgba(255,255,255,0.6)' }}>  |  </Caption>
                <Caption style={{ color: 'rgba(255,255,255,0.8)' }}>Tax:  </Caption>
                <Caption className="font-outfit-semibold" style={{ color: '#FFFFFF' }}>
                  £{(payData?.summary.totalTax ?? 0).toFixed(2)}
                </Caption>
              </View>
            </View>

            {/* Monthly Payslip Sections */}
            {(payData?.months ?? []).length === 0 && (
              <View className="items-center py-8">
                <Body color="secondary">No payslips yet</Body>
              </View>
            )}
            {(payData?.months ?? []).map((monthGroup) => (
              <View key={`${monthGroup.month}-${monthGroup.year}`} className="mb-4">
                <View className="px-5 mb-3">
                  <H3>{monthGroup.month} {monthGroup.year}</H3>
                </View>

                {monthGroup.payslips.map((ps) => {
                  const status: PayslipStatus = ps.status === 'PAID' ? 'processed' : 'pending';
                  const config = STATUS_CONFIG[status];
                  const dateRange = `${formatDate(ps.periodStart)} - ${formatDate(ps.periodEnd)}`;
                  const paymentInfo = ps.payDate
                    ? `Paid on ${new Date(ps.payDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                    : 'Payment pending';

                  return (
                    <View
                      key={ps.id}
                      className="mx-5 mb-3 rounded-2xl p-4"
                      style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
                    >
                      <View className="flex-row items-center justify-between mb-1.5">
                        <Body className="font-outfit-bold">
                          {ps.periodLabel} ({dateRange})
                        </Body>
                        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: config.bg }}>
                          <Caption className="font-outfit-bold" style={{ color: config.text, fontSize: 10 }}>
                            {config.label}
                          </Caption>
                        </View>
                      </View>

                      <Caption color="secondary" className="mb-3">{paymentInfo}</Caption>

                      <View className="flex-row items-center justify-between mb-1.5">
                        <Body color="secondary">Gross pay</Body>
                        <H3>£{ps.grossPay.toFixed(2)}</H3>
                      </View>
                      <View className="flex-row items-center justify-between mb-3">
                        <Body color="secondary">Net Pay</Body>
                        <H3>£{ps.netPay.toFixed(2)}</H3>
                      </View>

                      <TouchableOpacity
                        className="flex-row items-center justify-center py-2.5 rounded-xl"
                        style={{ backgroundColor: primaryColor }}
                        onPress={() => navigation.getParent()?.navigate('PayslipDetail', { payslipId: ps.id })}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
                        <Body className="font-outfit-semibold ml-1.5" style={{ color: '#FFFFFF' }}>View</Body>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ))}
          </>
        )}

        <View className="h-5" />
      </ScrollView>
    </View>
  );
}

export default PayslipScreen;
