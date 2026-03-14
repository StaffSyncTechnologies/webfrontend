import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../contexts';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

interface WheelPickerProps {
  data: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  isDark: boolean;
}

function WheelPicker({ data, selectedIndex, onSelect, isDark }: WheelPickerProps) {
  const flatListRef = useRef<FlatList>(null);
  const [ready, setReady] = useState(false);

  // Pad data with empty items for top/bottom spacing
  const paddedData = ['', '', ...data, '', ''];

  useEffect(() => {
    if (flatListRef.current && ready) {
      flatListRef.current.scrollToOffset({
        offset: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [selectedIndex, ready]);

  const handleMomentumScrollEnd = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
    onSelect(clampedIndex);
  };

  return (
    <View style={{ height: PICKER_HEIGHT, overflow: 'hidden', flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={paddedData}
        keyExtractor={(_, i) => i.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onLayout={() => {
          setReady(true);
          flatListRef.current?.scrollToOffset({
            offset: selectedIndex * ITEM_HEIGHT,
            animated: false,
          });
        }}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        renderItem={({ item, index }) => {
          const dataIndex = index - 2; // account for padding
          const isSelected = dataIndex === selectedIndex;
          return (
            <View style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: isSelected ? 18 : 15,
                  fontWeight: isSelected ? '600' : '400',
                  color: !item
                    ? 'transparent'
                    : isSelected
                    ? isDark ? '#FFFFFF' : '#1F2937'
                    : isDark ? '#6B6B80' : '#9CA3AF',
                }}
              >
                {item}
              </Text>
            </View>
          );
        }}
      />
      {/* Selection highlight */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: ITEM_HEIGHT * 2,
          left: 0,
          right: 0,
          height: ITEM_HEIGHT,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: isDark ? '#3A3A4A' : '#E5E7EB',
        }}
      />
    </View>
  );
}

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  primaryColor?: string;
}

export function DatePickerModal({
  visible,
  onClose,
  onConfirm,
  initialDate,
  minimumDate,
  maximumDate,
  primaryColor = '#667eea',
}: DatePickerModalProps) {
  const { isDark } = useTheme();

  const now = initialDate || new Date();
  const minYear = minimumDate?.getFullYear() || 1920;
  const maxYear = maximumDate?.getFullYear() || new Date().getFullYear();

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => (minYear + i).toString());
  const [selectedDay, setSelectedDay] = useState(now.getDate() - 1);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(years.indexOf(now.getFullYear().toString()));

  const currentYear = parseInt(years[selectedYear] || now.getFullYear().toString());
  const daysInMonth = getDaysInMonth(selectedMonth, currentYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, '0'));

  // Clamp day if month/year change reduces available days
  useEffect(() => {
    if (selectedDay >= daysInMonth) {
      setSelectedDay(daysInMonth - 1);
    }
  }, [daysInMonth, selectedDay]);

  const handleConfirm = () => {
    const year = parseInt(years[selectedYear]);
    const date = new Date(year, selectedMonth, selectedDay + 1);
    onConfirm(date);
  };

  const bgColor = isDark ? '#1A1A2E' : '#FFFFFF';
  const headerBg = isDark ? '#252540' : '#F9FAFB';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ backgroundColor: bgColor, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: headerBg, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 16, color: isDark ? '#9CA3AF' : '#6B7280' }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 17, fontWeight: '600', color: isDark ? '#FFFFFF' : '#1F2937' }}>Date of Birth</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: primaryColor }}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Wheels */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, height: PICKER_HEIGHT }}>
            <WheelPicker
              data={days}
              selectedIndex={selectedDay}
              onSelect={setSelectedDay}
              isDark={isDark}
            />
            <WheelPicker
              data={MONTHS}
              selectedIndex={selectedMonth}
              onSelect={setSelectedMonth}
              isDark={isDark}
            />
            <WheelPicker
              data={years}
              selectedIndex={selectedYear}
              onSelect={setSelectedYear}
              isDark={isDark}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default DatePickerModal;
