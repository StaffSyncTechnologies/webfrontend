import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrgTheme } from '../../contexts';
import { H3, Body, Caption } from './Typography';
import { Card } from './Card';
import { Badge } from './Badge';

export interface ShiftCardData {
  id: string;
  title: string;
  location: string;
  type: string;
  time: string;
  month: string;
  day: string;
  payRate?: string;
  status?: 'urgent' | 'confirmed' | 'open' | 'completed' | 'limited_slot' | 'high_pay';
}

interface ShiftCardProps {
  shift: ShiftCardData;
  onPress?: () => void;
  onViewDetails?: () => void;
  compact?: boolean;
}

export function ShiftCard({ shift, onPress, onViewDetails, compact = false }: ShiftCardProps) {
  const { primaryColor } = useOrgTheme();

  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    urgent: { label: 'URGENT', bg: '#DCFCE7', text: '#16A34A' },
    confirmed: { label: 'CONFIRMED', bg: '#DBEAFE', text: '#2563EB' },
    open: { label: 'OPEN', bg: '#FEF3C7', text: '#D97706' },
    completed: { label: 'COMPLETED', bg: '#F3F4F6', text: '#6B7280' },
    limited_slot: { label: 'LIMITED SLOT', bg: '#DCFCE7', text: '#16A34A' },
    high_pay: { label: 'HIGH PAY', bg: '#DCFCE7', text: '#16A34A' },
  };

  const statusInfo = shift.status ? statusConfig[shift.status] : null;

  return (
    <Card variant="outlined" padding="sm" className="mb-2.5">
      <TouchableOpacity
        className="flex-row items-start"
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Date Box */}
        <View
          className="w-14 h-14 rounded-xl items-center justify-center mr-3.5"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          <Caption color="secondary" className="font-outfit-semibold">{shift.month}</Caption>
          <H3>{shift.day}</H3>
        </View>

        {/* Shift Info */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-0.5">
            <Body className="font-outfit-semibold flex-1 mr-2">{shift.title}</Body>
            {statusInfo && (
              <View className="px-2 py-0.5 rounded" style={{ backgroundColor: statusInfo.bg }}>
                <Caption className="font-outfit-bold" style={{ color: statusInfo.text, fontSize: 10 }}>
                  {statusInfo.label}
                </Caption>
              </View>
            )}
          </View>

          <View className="flex-row items-center gap-1 mb-0.5">
            <Ionicons name="location-outline" size={13} color="#6B7280" />
            <Caption color="secondary">{shift.location}</Caption>
          </View>

          <Caption color="muted" className="mb-1.5">{shift.type} • {shift.time}</Caption>

          {!compact && (
            <View className="flex-row items-center justify-between">
              {shift.payRate && (
                <Body className="font-outfit-bold">{shift.payRate}</Body>
              )}
              {onViewDetails && (
                <TouchableOpacity onPress={onViewDetails} activeOpacity={0.7}>
                  <Body className="font-outfit-semibold" style={{ color: primaryColor }}>
                    View Details
                  </Body>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {compact && (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={{ marginTop: 16 }} />
        )}
      </TouchableOpacity>
    </Card>
  );
}

export default ShiftCard;
