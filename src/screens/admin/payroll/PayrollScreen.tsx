import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme } from '../../../contexts';
import { H2, H3, Body, Caption, Card, Badge, Input } from '../../../components/ui';

type TabKey = 'bulk' | 'individual';

export function PayrollScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<TabKey>('bulk');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Mock data - replace with API later
  const stats = {
    totalGrossPay: { value: '£45,230', trend: '28 paid', trendDirection: 'up' },
    totalNetPay: { value: '£38,450', trend: '15 processing', trendDirection: 'up' },
    totalDeductions: { value: '£6,780', trend: '0%', trendDirection: 'down' },
    outstandingPayroll: { value: '£12,340', trend: '8 pending', trendDirection: 'up' },
  };

  const payslips = [
    { id: '1', workerName: 'Alice Johnson', period: '01/05/2026 - 31/05/2026', hours: 160, grossPay: 3200, deductions: 480, netPay: 2720, status: 'PAID' },
    { id: '2', workerName: 'Bob Smith', period: '01/05/2026 - 31/05/2026', hours: 150, grossPay: 3000, deductions: 450, netPay: 2550, status: 'PAID' },
    { id: '3', workerName: 'Carol Davis', period: '01/05/2026 - 31/05/2026', hours: 140, grossPay: 2800, deductions: 420, netPay: 2380, status: 'APPROVED' },
    { id: '4', workerName: 'David Wilson', period: '01/05/2026 - 31/05/2026', hours: 135, grossPay: 2700, deductions: 405, netPay: 2295, status: 'DRAFT' },
    { id: '5', workerName: 'Emma Brown', period: '01/05/2026 - 31/05/2026', hours: 145, grossPay: 2900, deductions: 435, netPay: 2465, status: 'DRAFT' },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'PAID') return 'success';
    if (status === 'APPROVED') return 'warning';
    if (status === 'DRAFT') return 'warning';
    return 'default';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'DRAFT') return 'Pending';
    if (status === 'APPROVED') return 'Processing';
    if (status === 'PAID') return 'Paid';
    return status;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSelectAll = () => {
    const draftIds = payslips.filter(p => p.status === 'DRAFT').map(p => p.id);
    setSelectedIds(selectedIds.length === draftIds.length ? [] : draftIds);
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleApprovePayment = () => {
    setApproveModalOpen(false);
    setSuccessModalOpen(true);
    setSelectedIds([]);
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 py-4">
        <H2>Payroll</H2>
        <Caption color="secondary">Access your payment records and financial statements</Caption>
      </View>

      {/* Action Buttons */}
      <View className="px-5 mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            <TouchableOpacity className="flex-row items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: '#3B82F6' }}>
              <Ionicons name="card-outline" size={18} color="#FFFFFF" />
              <Body className="text-white text-xs font-outfit-semibold">Payment Sheet</Body>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: '#10B981' }}>
              <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
              <Body className="text-white text-xs font-outfit-semibold">Generate Payslips</Body>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: primaryColor }}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
              <Body className="text-white text-xs font-outfit-semibold">Approve all outstanding (8)</Body>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View className="px-5 flex-row flex-wrap gap-3 mb-6">
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="w-10 h-10 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: '#E0F2FE' }}>
              <Ionicons name="wallet-outline" size={20} color="#3B82F6" />
            </View>
            <H3 className="text-xl">{stats.totalGrossPay.value}</H3>
            <Caption color="secondary">Total Gross Pay</Caption>
            <Caption className="text-xs" style={{ color: '#10B981' }}>{stats.totalGrossPay.trend} paid</Caption>
          </Card>
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="w-10 h-10 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: '#D1FAE5' }}>
              <Ionicons name="receipt-outline" size={20} color="#10B981" />
            </View>
            <H3 className="text-xl">{stats.totalNetPay.value}</H3>
            <Caption color="secondary">Total Net Pay</Caption>
            <Caption className="text-xs" style={{ color: '#10B981' }}>{stats.totalNetPay.trend} processing</Caption>
          </Card>
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="w-10 h-10 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: '#FFE4E6' }}>
              <Ionicons name="remove-circle-outline" size={20} color="#EF4444" />
            </View>
            <H3 className="text-xl">{stats.totalDeductions.value}</H3>
            <Caption color="secondary">Total Deductions</Caption>
            <Caption className="text-xs" style={{ color: '#EF4444' }}>{stats.totalDeductions.trend} this period</Caption>
          </Card>
          <Card className="flex-1 min-w-[45%] p-4">
            <View className="w-10 h-10 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: '#FEF3C7' }}>
              <Ionicons name="time-outline" size={20} color="#F59E0B" />
            </View>
            <H3 className="text-xl">{stats.outstandingPayroll.value}</H3>
            <Caption color="secondary">Outstanding Payroll</Caption>
            <Caption className="text-xs" style={{ color: '#F59E0B' }}>{stats.outstandingPayroll.trend} pending</Caption>
          </Card>
        </View>

        {/* Payslip Management */}
        <Card className="mx-5 mb-6">
          <View className="p-4 border-b border-light-border-light dark:border-dark-border-light">
            <Body className="font-outfit-semibold">Payslip Management</Body>
          </View>

          {/* Tabs */}
          <View className="flex-row border-b border-light-border-light dark:border-dark-border-light">
            <TouchableOpacity
              className={`flex-1 py-3 ${activeTab === 'bulk' ? 'border-b-2' : ''}`}
              style={activeTab === 'bulk' ? { borderColor: primaryColor } : {}}
              onPress={() => setActiveTab('bulk')}
            >
              <Body
                className="text-center font-outfit-semibold text-xs"
                style={{ color: activeTab === 'bulk' ? primaryColor : (isDark ? '#9CA3AF' : '#6B7280') }}
              >
                Bulk
              </Body>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 ${activeTab === 'individual' ? 'border-b-2' : ''}`}
              style={activeTab === 'individual' ? { borderColor: primaryColor } : {}}
              onPress={() => setActiveTab('individual')}
            >
              <Body
                className="text-center font-outfit-semibold text-xs"
                style={{ color: activeTab === 'individual' ? primaryColor : (isDark ? '#9CA3AF' : '#6B7280') }}
              >
                Individual
              </Body>
            </TouchableOpacity>
          </View>

          <View className="p-4">
            {activeTab === 'bulk' && (
              <View className="gap-4">
                <Caption color="secondary">Export a pre-filled Excel template with all workers, fill in payslip data, then import to create/update payslip records.</Caption>

                <TouchableOpacity className="flex-row items-center gap-2 px-4 py-3 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary">
                  <Ionicons name="download-outline" size={18} color={primaryColor} />
                  <Body className="text-sm">Download Template</Body>
                </TouchableOpacity>

                <View>
                  <Caption color="secondary" className="mb-2">Period Type</Caption>
                  <View className="flex-row gap-2">
                    <TouchableOpacity className="flex-1 py-3 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary items-center">
                      <Body className="text-sm">Monthly (1-12)</Body>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 py-3 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary items-center">
                      <Body className="text-sm">Weekly (Tax Week 1-52)</Body>
                    </TouchableOpacity>
                  </View>
                </View>

                <View>
                  <Caption color="secondary" className="mb-2">Upload Filled File</Caption>
                  <View className="p-6 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center bg-light-background-secondary dark:bg-dark-background-secondary">
                    <Ionicons name="cloud-upload-outline" size={32} color="#9CA3AF" />
                    <Caption color="secondary" className="text-center mt-2">Click or drag to upload filled Excel file</Caption>
                    <Caption color="secondary" className="text-xs text-center">.xlsx or .xls files only, max 5MB</Caption>
                  </View>
                </View>

                <TouchableOpacity className="py-3 rounded-xl items-center" style={{ backgroundColor: primaryColor }}>
                  <Body className="text-white font-outfit-semibold">Import Payslips</Body>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'individual' && (
              <View className="p-6 items-center justify-center bg-light-background-secondary dark:bg-dark-background-secondary rounded-xl">
                <Ionicons name="person-outline" size={48} color="#9CA3AF" />
                <Body className="text-center mt-2">Select a worker from the payment history table</Body>
                <Caption color="secondary" className="text-center text-xs">Click on a worker's name in the table to access their payslip management tools</Caption>
              </View>
            )}
          </View>
        </Card>

        {/* Payment History */}
        <Card className="mx-5 mb-6">
          <View className="p-4 border-b border-light-border-light dark:border-dark-border-light">
            <Body className="font-outfit-semibold">Payment History</Body>
          </View>

          {/* Filters */}
          <View className="p-4 flex-row gap-2">
            <View className="flex-1">
              <Input
                placeholder="Search here..."
                value={search}
                onChangeText={setSearch}
                leftIcon={<Ionicons name="search-outline" size={20} color="#9CA3AF" />}
              />
            </View>
            <TouchableOpacity className="w-12 h-12 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary items-center justify-center">
              <Ionicons name="filter-outline" size={20} color={isDark ? '#FFFFFF' : '#000035'} />
            </TouchableOpacity>
          </View>

          {/* Select All */}
          <View className="px-4 pb-2 flex-row items-center gap-2">
            <TouchableOpacity onPress={handleSelectAll}>
              <View className="w-5 h-5 rounded border-2 flex items-center justify-center" style={{ borderColor: selectedIds.length > 0 ? primaryColor : '#E5E7EB', backgroundColor: selectedIds.length > 0 ? primaryColor : 'transparent' }}>
                {selectedIds.length > 0 && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
            <Caption color="secondary" className="text-xs">Select all pending</Caption>
          </View>

          {/* Payslip List */}
          <View className="px-4 pb-4">
            <View className="gap-3">
              {payslips.map((payslip) => (
                <Card key={payslip.id} className="p-4">
                  <View className="flex-row items-center gap-3 mb-3">
                    <TouchableOpacity onPress={() => handleSelectOne(payslip.id)} disabled={payslip.status !== 'DRAFT'}>
                      <View className="w-5 h-5 rounded border-2 flex items-center justify-center" style={{ borderColor: selectedIds.includes(payslip.id) ? primaryColor : '#E5E7EB', backgroundColor: selectedIds.includes(payslip.id) ? primaryColor : 'transparent' }}>
                        {selectedIds.includes(payslip.id) && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                      </View>
                    </TouchableOpacity>
                    <View className="w-9 h-9 rounded-full items-center justify-center bg-light-background-secondary dark:bg-dark-background-secondary">
                      <Body className="text-xs font-outfit-semibold">{getInitials(payslip.workerName)}</Body>
                    </View>
                    <View className="flex-1">
                      <Body className="font-outfit-semibold">{payslip.workerName}</Body>
                      <Caption color="secondary" className="text-xs">{payslip.period}</Caption>
                    </View>
                    <Badge variant={getStatusColor(payslip.status) as any} className="text-[10px]">
                      {getStatusLabel(payslip.status)}
                    </Badge>
                  </View>
                  <View className="flex-row flex-wrap gap-4 mb-3">
                    <View>
                      <Caption color="secondary" className="text-xs">Hours</Caption>
                      <Body className="text-sm">{payslip.hours}h</Body>
                    </View>
                    <View>
                      <Caption color="secondary" className="text-xs">Gross Pay</Caption>
                      <Body className="text-sm">£{payslip.grossPay}</Body>
                    </View>
                    <View>
                      <Caption color="secondary" className="text-xs">Deductions</Caption>
                      <Body className="text-sm">£{payslip.deductions}</Body>
                    </View>
                    <View>
                      <Caption color="secondary" className="text-xs">Net Pay</Caption>
                      <Body className="text-sm font-outfit-semibold">£{payslip.netPay}</Body>
                    </View>
                  </View>
                  <View className="flex-row gap-2 pt-3 border-t border-light-border-light dark:border-dark-border-light">
                    <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary">
                      <Ionicons name="eye-outline" size={16} color={isDark ? '#FFFFFF' : '#000035'} />
                      <Body className="ml-1 text-xs">View</Body>
                    </TouchableOpacity>
                    {payslip.status === 'DRAFT' && (
                      <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 rounded-lg" style={{ backgroundColor: primaryColor }}>
                        <Ionicons name="checkmark-outline" size={16} color="#FFFFFF" />
                        <Body className="ml-1 text-xs text-white">Approve</Body>
                      </TouchableOpacity>
                    )}
                    {payslip.status === 'APPROVED' && (
                      <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary">
                        <Ionicons name="receipt-outline" size={16} color="#10B981" />
                        <Body className="ml-1 text-xs" style={{ color: '#10B981' }}>Mark as Paid</Body>
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              ))}
            </View>
          </View>
        </Card>

        <View className="h-24" />
      </ScrollView>

      {/* Approve Modal */}
      {approveModalOpen && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center px-6">
          <View className="bg-light-background-primary dark:bg-dark-background-primary rounded-2xl p-6 w-full max-w-sm">
            <TouchableOpacity className="self-end mb-4" onPress={() => setApproveModalOpen(false)}>
              <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
            </TouchableOpacity>
            <H3 className="text-center mb-2">Approve outstanding payroll</H3>
            <Caption color="secondary" className="text-center mb-4">Do you want to approve the outstanding payroll? Once approved, payment will be processed and cannot be reversed.</Caption>
            
            <View className="flex-row gap-2 mb-6">
              <View className="flex-1 p-4 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary">
                <Caption color="secondary" className="text-xs mb-1">Total Net Pay</Caption>
                <Body className="text-lg font-outfit-semibold">£12,340</Body>
              </View>
              <View className="flex-1 p-4 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary">
                <Caption color="secondary" className="text-xs mb-1">Deductions</Caption>
                <Body className="text-lg font-outfit-semibold" style={{ color: '#EF4444' }}>£1,850</Body>
              </View>
              <View className="flex-1 p-4 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary">
                <Caption color="secondary" className="text-xs mb-1">Total Workers</Caption>
                <Body className="text-lg font-outfit-semibold">8</Body>
              </View>
            </View>

            <TouchableOpacity className="py-4 rounded-xl items-center" style={{ backgroundColor: primaryColor }} onPress={handleApprovePayment}>
              <Body className="text-white font-outfit-semibold">Approve Payment</Body>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Success Modal */}
      {successModalOpen && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center px-6">
          <View className="bg-light-background-primary dark:bg-dark-background-primary rounded-2xl p-6 w-full max-w-sm items-center">
            <TouchableOpacity className="self-end mb-4" onPress={() => setSuccessModalOpen(false)}>
              <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
            </TouchableOpacity>
            <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: '#D1FAE5' }}>
              <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            </View>
            <H3 className="text-center mb-2">Payroll approved successfully</H3>
            <Caption color="secondary" className="text-center mb-6">The payment has been processed and will be transferred to the workers' accounts.</Caption>
            <TouchableOpacity className="py-4 rounded-xl items-center w-full" style={{ backgroundColor: primaryColor }} onPress={() => setSuccessModalOpen(false)}>
              <Body className="text-white font-outfit-semibold">Done</Body>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
