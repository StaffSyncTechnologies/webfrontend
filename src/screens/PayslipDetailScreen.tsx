import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme } from '../contexts';
import { H2, H3, Body, Caption, Button } from '../components/ui';

export function PayslipDetailScreen({ route, navigation }: RootStackScreenProps<'PayslipDetail'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { payslipId } = route.params;

  const receipt = {
    payPeriod: '16 Sep - 23 Sep',
    employee: {
      name: 'Adekemi Racheal',
      id: 'HH3902989',
      taxCode: '1257L',
      ni: 'QQ 12 34 56 C',
    },
    earnings: [
      { description: 'Regular Hours', units: '40.00', rate: '£15.50', total: '£620.00' },
      { description: 'Overtime (1.5x)', units: '4.50', rate: '£23.25', total: '£104.63' },
      { description: 'Holiday Pay', units: '1.00', rate: '£62.00', total: '£62.00' },
    ],
    deductions: [
      { description: 'Income Tax', amount: '-£124.80' },
      { description: 'National Insurance', amount: '-£68.20' },
      { description: 'Pension Contribution', amount: '-£31.46' },
    ],
    totalGrossPay: '£786.63',
    totalDeductions: '-£224.46',
    totalNetpay: '£562.17',
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#000035" />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>Payslip receipt</H2>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Pay Period */}
        <View className="mx-5 mb-4 p-4 rounded-2xl" style={{ borderWidth: 1, borderColor: '#E2E8F0' }}>
          <View className="flex-row items-center justify-between mb-1.5">
            <Caption color="secondary">Pay Period</Caption>
            <View className="px-2.5 py-0.5 rounded-full" style={{ backgroundColor: '#DCFCE7' }}>
              <Caption className="font-outfit-bold" style={{ color: '#16A34A', fontSize: 10 }}>PAID</Caption>
            </View>
          </View>
          <H2>{receipt.payPeriod}</H2>
        </View>

        {/* Divider */}
        <View className="h-px bg-light-border-light dark:bg-dark-border-light mx-5" />

        {/* Employee Details */}
        <View className="px-5 py-4">
          <Caption color="secondary" className="mb-2">Employee Details</Caption>
          <H3 className="mb-1.5">{receipt.employee.name}</H3>
          <Caption color="secondary" className="mb-0.5">Employee ID: {receipt.employee.id}</Caption>
          <Caption color="secondary" className="mb-0.5">Tax Code: {receipt.employee.taxCode}</Caption>
          <Caption color="secondary">National Insurance (NI): {receipt.employee.ni}</Caption>
        </View>

        {/* Divider */}
        <View className="h-px bg-light-border-light dark:bg-dark-border-light mx-5" />

        {/* Earning Breakdown */}
        <View className="px-5 py-4">
          <H3 className="mb-4">Earning Breakdown</H3>

          {/* Table Header */}
          <View className="flex-row items-center mb-2 pb-2" style={{ borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
            <Caption color="secondary" className="flex-1">Description</Caption>
            <Caption color="secondary" className="w-14 text-right">Units</Caption>
            <Caption color="secondary" className="w-16 text-right">Rate</Caption>
            <Caption color="secondary" className="w-20 text-right">Total</Caption>
          </View>

          {/* Table Rows */}
          {receipt.earnings.map((item, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <Caption color="secondary" className="flex-1">{item.description}</Caption>
              <Caption color="secondary" className="w-14 text-right">{item.units}</Caption>
              <Caption color="secondary" className="w-16 text-right">{item.rate}</Caption>
              <Body className="w-20 text-right font-outfit-semibold" style={{ fontSize: 13 }}>{item.total}</Body>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View className="h-px bg-light-border-light dark:bg-dark-border-light mx-5" />

        {/* Deduction Breakdown */}
        <View className="px-5 py-4">
          <H3 className="mb-4">Deduction Breakdown</H3>

          {/* Table Header */}
          <View className="flex-row items-center mb-2 pb-2" style={{ borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
            <Caption color="secondary" className="flex-1">Description</Caption>
            <Caption color="secondary" className="w-24 text-right">Amount</Caption>
          </View>

          {/* Table Rows */}
          {receipt.deductions.map((item, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <Caption color="secondary" className="flex-1">{item.description}</Caption>
              <Body className="w-24 text-right font-outfit-semibold" style={{ fontSize: 13, color: '#DC2626' }}>{item.amount}</Body>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View className="h-px bg-light-border-light dark:bg-dark-border-light mx-5" />

        {/* Total Earning Summary */}
        <View className="px-5 py-4">
          <H3 className="mb-4">Total Earning Summary</H3>

          <View className="flex-row items-center justify-between mb-2">
            <Body color="secondary">Total Gross Pay</Body>
            <H3>{receipt.totalGrossPay}</H3>
          </View>
          <View className="flex-row items-center justify-between mb-2">
            <Body color="secondary">Total Deductions</Body>
            <H3 style={{ color: '#DC2626' }}>{receipt.totalDeductions}</H3>
          </View>

          <View className="h-px bg-light-border-light dark:bg-dark-border-light my-2" />

          <View className="flex-row items-center justify-between mt-2">
            <Body className="font-outfit-bold">Total Netpay</Body>
            <H2>{receipt.totalNetpay}</H2>
          </View>
        </View>

        {/* Buttons */}
        <View className="px-5 pt-4 pb-10">
          <Button onPress={() => {}} className="mb-3">
            Download PDF
          </Button>
          <Button variant="outline" onPress={() => navigation.goBack()}>
            Back
          </Button>
        </View>

        <View className="h-5" />
      </ScrollView>
    </View>
  );
}

export default PayslipDetailScreen;
