import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Share,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme } from '../contexts';
import { H2, H3, Body, Caption, Button } from '../components/ui';
import { useGetPayslipDetailQuery, useGetPayslipHtmlQuery } from '../store/api/workerApi';

const fmt = (n: number) => `£${Number(n).toFixed(2)}`;

const fmtDate = (iso: string | undefined) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export function PayslipDetailScreen({ route, navigation }: RootStackScreenProps<'PayslipDetail'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { payslipId } = route.params;

  const [pdfModalVisible, setPdfModalVisible] = useState(false);

  const { data: payslipResponse, isLoading, isError } = useGetPayslipDetailQuery(payslipId);

  const p = payslipResponse?.data;
  const isUploaded = p?.source === 'UPLOADED';

  // Only fetch generated HTML when: modal is open AND this is a generated payslip
  const { data: htmlResponse, isFetching: htmlLoading } = useGetPayslipHtmlQuery(payslipId, {
    skip: !pdfModalVisible || isUploaded,
  });

  // For generated payslips the query returns HTML string;
  // For uploaded payslips we use the file URL directly
  const htmlContent = typeof htmlResponse === 'string' ? htmlResponse : (htmlResponse as any)?.html;

  const statusConfig =
    p?.status === 'PAID'
      ? { label: 'PAID', bg: '#DCFCE7', text: '#16A34A' }
      : p?.status === 'APPROVED'
      ? { label: 'APPROVED', bg: '#DBEAFE', text: '#1D4ED8' }
      : { label: 'PENDING', bg: '#FEF3C7', text: '#D97706' };

  const handleShare = async () => {
    if (!p) return;
    try {
      await Share.share({
        message: `StaffSync Payslip\n\nPeriod: ${fmtDate(p.period?.startDate)} – ${fmtDate(p.period?.endDate)}\nGross Pay: ${fmt(p.summary?.grossPay ?? 0)}\nNet Pay: ${fmt(p.summary?.netPay ?? 0)}\n\nView full payslip in the StaffSync app.`,
        title: 'Payslip',
      });
    } catch {}
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (isError || !p) {
    return (
      <View className="flex-1 items-center justify-center bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
        <Body color="secondary">Could not load payslip</Body>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
          <Body style={{ color: primaryColor }}>Go back</Body>
        </TouchableOpacity>
      </View>
    );
  }

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
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color="#000035" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Pay Period */}
        <View className="mx-5 mb-4 p-4 rounded-2xl" style={{ borderWidth: 1, borderColor: '#E2E8F0' }}>
          <View className="flex-row items-center justify-between mb-1.5">
            <Caption color="secondary">Pay Period</Caption>
            <View className="px-2.5 py-0.5 rounded-full" style={{ backgroundColor: statusConfig.bg }}>
              <Caption className="font-outfit-bold" style={{ color: statusConfig.text, fontSize: 10 }}>
                {statusConfig.label}
              </Caption>
            </View>
          </View>
          <H2>
            {fmtDate(p.period?.startDate)} – {fmtDate(p.period?.endDate)}
          </H2>
          {p.period?.payDate && (
            <Caption color="secondary" className="mt-1">
              Paid: {fmtDate(p.period.payDate)} via {p.period.payMethod ?? 'BACS'}
            </Caption>
          )}
        </View>

        {/* Divider */}
        <View className="h-px bg-light-border-light dark:bg-dark-border-light mx-5" />

        {/* Employee Details */}
        <View className="px-5 py-4">
          <Caption color="secondary" className="mb-2">Employee Details</Caption>
          <H3 className="mb-1.5">{p.employee?.name}</H3>
          <Caption color="secondary" className="mb-0.5">Employee ID: {p.employee?.empCode}</Caption>
          <Caption color="secondary" className="mb-0.5">Payroll No: {p.employee?.payrollNumber}</Caption>
          <Caption color="secondary" className="mb-0.5">Tax Code: {p.employee?.taxCode ?? '1257L'}</Caption>
          <Caption color="secondary">NI Number: {p.employee?.niNumber ?? 'Not provided'}</Caption>
        </View>

        {/* Divider */}
        <View className="h-px bg-light-border-light dark:bg-dark-border-light mx-5" />

        {/* Earning Breakdown */}
        <View className="px-5 py-4">
          <H3 className="mb-4">Earning Breakdown</H3>

          {/* Table Header */}
          <View className="flex-row items-center mb-2 pb-2" style={{ borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
            <Caption color="secondary" className="flex-1">Description</Caption>
            <Caption color="secondary" className="w-14 text-right">Hrs</Caption>
            <Caption color="secondary" className="w-16 text-right">Rate</Caption>
            <Caption color="secondary" className="w-20 text-right">Total</Caption>
          </View>

          {(p.payments ?? []).map((item: any, index: number) => (
            <View key={index} className="flex-row items-center mb-2">
              <Caption color="secondary" className="flex-1">Regular Hours</Caption>
              <Caption color="secondary" className="w-14 text-right">{Number(item.time).toFixed(2)}</Caption>
              <Caption color="secondary" className="w-16 text-right">{fmt(item.rate)}</Caption>
              <Body className="w-20 text-right font-outfit-semibold" style={{ fontSize: 13 }}>{fmt(item.amount)}</Body>
            </View>
          ))}

          {(p.benefits ?? []).map((b: any, index: number) => (
            <View key={`b-${index}`} className="flex-row items-center mb-2">
              <Caption color="secondary" className="flex-1">{b.name}</Caption>
              <Caption color="secondary" className="w-14 text-right">—</Caption>
              <Caption color="secondary" className="w-16 text-right">—</Caption>
              <Body className="w-20 text-right font-outfit-semibold" style={{ fontSize: 13 }}>{fmt(b.amount)}</Body>
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

          {(p.deductions ?? []).map((item: any, index: number) => (
            <View key={index} className="flex-row items-center mb-2">
              <Caption color="secondary" className="flex-1">{item.name}</Caption>
              <Body className="w-24 text-right font-outfit-semibold" style={{ fontSize: 13, color: '#DC2626' }}>
                -{fmt(item.amount)}
              </Body>
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
            <H3>{fmt(p.summary?.grossPay ?? 0)}</H3>
          </View>
          <View className="flex-row items-center justify-between mb-2">
            <Body color="secondary">Total Deductions</Body>
            <H3 style={{ color: '#DC2626' }}>-{fmt(p.summary?.deductions ?? 0)}</H3>
          </View>

          <View className="h-px bg-light-border-light dark:bg-dark-border-light my-2" />

          <View className="flex-row items-center justify-between mt-2">
            <Body className="font-outfit-bold">Total Net Pay</Body>
            <H2>{fmt(p.summary?.netPay ?? 0)}</H2>
          </View>
        </View>

        {/* Year to Date */}
        {p.yearToDate && (
          <>
            <View className="h-px bg-light-border-light dark:bg-dark-border-light mx-5" />
            <View className="px-5 py-4">
              <H3 className="mb-3">Year to Date</H3>
              <View className="flex-row items-center justify-between mb-1.5">
                <Caption color="secondary">Gross Pay</Caption>
                <Caption>{fmt(p.yearToDate.grossPay)}</Caption>
              </View>
              <View className="flex-row items-center justify-between mb-1.5">
                <Caption color="secondary">Tax Paid</Caption>
                <Caption>{fmt(p.yearToDate.tax)}</Caption>
              </View>
              <View className="flex-row items-center justify-between mb-1.5">
                <Caption color="secondary">Employee NI</Caption>
                <Caption>{fmt(p.yearToDate.employeeNI)}</Caption>
              </View>
              <View className="flex-row items-center justify-between">
                <Caption color="secondary">Employee Pension</Caption>
                <Caption>{fmt(p.yearToDate.employeePension)}</Caption>
              </View>
            </View>
          </>
        )}

        {/* Buttons */}
        <View className="px-5 pt-4 pb-10">
          <Button onPress={() => setPdfModalVisible(true)} className="mb-3">
            View / Download PDF
          </Button>
          <Button variant="outline" onPress={handleShare} className="mb-3">
            Share Payslip
          </Button>
          <Button variant="outline" onPress={() => navigation.goBack()}>
            Back
          </Button>
        </View>

        <View className="h-5" />
      </ScrollView>

      {/* PDF WebView Modal */}
      <Modal
        visible={pdfModalVisible}
        animationType="slide"
        onRequestClose={() => setPdfModalVisible(false)}
      >
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
          <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
            <TouchableOpacity onPress={() => setPdfModalVisible(false)} className="mr-4">
              <Ionicons name="close" size={24} color="#000035" />
            </TouchableOpacity>
            <H3 className="flex-1">Payslip PDF</H3>
            <TouchableOpacity onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color="#000035" />
            </TouchableOpacity>
          </View>
          {htmlLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={primaryColor} />
              <Body color="secondary" className="mt-3">Loading payslip...</Body>
            </View>
          ) : isUploaded && p?.uploadedFileUrl ? (
            // Uploaded PDF — load directly by URL
            <WebView
              source={{ uri: `https://dev.staffsynctech.co.uk${p.uploadedFileUrl}` }}
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              startInLoadingState
              renderLoading={() => (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator size="large" color={primaryColor} />
                </View>
              )}
            />
          ) : (
            // System-generated payslip HTML
            <WebView
              source={{ html: htmlContent ?? '<p>Unable to load payslip</p>' }}
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

export default PayslipDetailScreen;
