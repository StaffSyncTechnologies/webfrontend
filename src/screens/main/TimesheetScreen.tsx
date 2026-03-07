import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabScreenProps } from '../../types/navigation';
import { colors } from '../../constants/colors';

export function TimesheetScreen({ navigation }: MainTabScreenProps<'Timesheet'>) {
  const insets = useSafeAreaInsets();
  const [selectedWeek, setSelectedWeek] = useState('This Week');

  const timesheetData = [
    { day: 'Mon', date: '3 Mar', hours: '8h', clockIn: '08:00', clockOut: '16:00', status: 'approved' },
    { day: 'Tue', date: '4 Mar', hours: '8h', clockIn: '14:00', clockOut: '22:00', status: 'pending' },
    { day: 'Wed', date: '5 Mar', hours: '-', clockIn: '-', clockOut: '-', status: 'upcoming' },
    { day: 'Thu', date: '6 Mar', hours: '-', clockIn: '-', clockOut: '-', status: 'upcoming' },
    { day: 'Fri', date: '7 Mar', hours: '-', clockIn: '-', clockOut: '-', status: 'upcoming' },
  ];

  const totalHours = '16h';
  const totalEarnings = '£200';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Timesheet</Text>
        <TouchableOpacity style={styles.weekSelector}>
          <Text style={styles.weekText}>{selectedWeek}</Text>
          <Text style={styles.weekArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalHours}</Text>
          <Text style={styles.summaryLabel}>Total Hours</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalEarnings}</Text>
          <Text style={styles.summaryLabel}>Estimated Pay</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {timesheetData.map((entry, index) => (
          <View key={index} style={styles.entryCard}>
            <View style={styles.dayInfo}>
              <Text style={styles.day}>{entry.day}</Text>
              <Text style={styles.date}>{entry.date}</Text>
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>In: <Text style={styles.timeValue}>{entry.clockIn}</Text></Text>
              <Text style={styles.timeLabel}>Out: <Text style={styles.timeValue}>{entry.clockOut}</Text></Text>
            </View>
            <View style={styles.hoursInfo}>
              <Text style={styles.hours}>{entry.hours}</Text>
              <View style={[
                styles.statusDot,
                entry.status === 'approved' && styles.statusApproved,
                entry.status === 'pending' && styles.statusPending,
                entry.status === 'upcoming' && styles.statusUpcoming,
              ]} />
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.clockButtonContainer}>
        <TouchableOpacity style={styles.clockInButton}>
          <Text style={styles.clockInText}>Clock In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    padding: 20,
    backgroundColor: colors.background.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  weekText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  weekArrow: {
    fontSize: 10,
    color: colors.text.secondary,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: colors.primary.navy,
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.text.inverse,
    opacity: 0.8,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  dayInfo: {
    width: 60,
  },
  day: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  date: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  timeInfo: {
    flex: 1,
    paddingHorizontal: 16,
  },
  timeLabel: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  timeValue: {
    fontWeight: '500',
    color: colors.text.primary,
  },
  hoursInfo: {
    alignItems: 'flex-end',
    gap: 6,
  },
  hours: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary.navy,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusApproved: {
    backgroundColor: colors.status.success,
  },
  statusPending: {
    backgroundColor: colors.status.warning,
  },
  statusUpcoming: {
    backgroundColor: colors.border.light,
  },
  clockButtonContainer: {
    padding: 16,
    backgroundColor: colors.background.primary,
  },
  clockInButton: {
    backgroundColor: colors.status.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  clockInText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});

export default TimesheetScreen;
