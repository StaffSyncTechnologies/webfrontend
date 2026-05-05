import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme } from '../../../contexts';
import { H2, Body, Caption } from '../../../components/ui';
import { API_BASE_URL } from '../../../services/endpoints';

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface SkillCategory {
  category: string;
  icon: string;
  skills: Skill[];
}

interface SkillsSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSkillsSelected: (skills: string[]) => void;
  preSelectedSkills?: string[];
}

const CATEGORY_ICONS: Record<string, string> = {
  'WAREHOUSE': '📦',
  'HEALTHCARE': '🏥',
  'CLEANING': '🧹',
  'SECURITY': '🛡️',
  'HOSPITALITY': '🍽️',
  'LABOUR': '👷',
  'CERTIFICATION': '📜',
};

const CATEGORY_LABELS: Record<string, string> = {
  'WAREHOUSE': 'Warehouse & Logistics',
  'HEALTHCARE': 'Healthcare & Care',
  'CLEANING': 'Cleaning',
  'SECURITY': 'Security',
  'HOSPITALITY': 'Hospitality',
  'LABOUR': 'General Labour',
  'CERTIFICATION': 'Certifications',
};

export function SkillsSelectionModal({ visible, onClose, onSkillsSelected, preSelectedSkills = [] }: SkillsSelectionModalProps) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();

  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set(preSelectedSkills));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchSkills();
    }
  }, [visible]);

  useEffect(() => {
    setSelectedSkills(new Set(preSelectedSkills));
  }, [preSelectedSkills]);

  const fetchSkills = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/skills`, {
        headers: { 'X-API-Key': process.env.EXPO_PUBLIC_API_KEY || '' },
      });
      const data = await res.json();
      if (data.success && data.data) {
        const skillsList: Skill[] = data.data.skills || [];
        // Group by category
        const grouped: Record<string, Skill[]> = {};
        skillsList.forEach((skill: Skill) => {
          if (!grouped[skill.category]) grouped[skill.category] = [];
          grouped[skill.category].push(skill);
        });
        const cats = Object.entries(grouped).map(([category, skills]) => ({
          category,
          icon: CATEGORY_ICONS[category] || '📋',
          skills,
        }));
        setCategories(cats);
      }
    } catch (err) {
      console.error('Failed to fetch skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skillName: string) => {
    setSelectedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillName)) {
        newSet.delete(skillName);
      } else {
        newSet.add(skillName);
      }
      return newSet;
    });
  };

  const handleApply = () => {
    onSkillsSelected(Array.from(selectedSkills));
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4" style={{ paddingTop: insets.top }}>
          <TouchableOpacity onPress={onClose} className="px-4 py-2">
            <Body className="text-primary-blue">Cancel</Body>
          </TouchableOpacity>
          <H2>Select Skills</H2>
          <TouchableOpacity onPress={handleApply} className="px-4 py-2">
            <Body className="text-primary-blue font-semibold">Apply</Body>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={primaryColor} />
            <Caption color="secondary" className="mt-3">Loading skills...</Caption>
          </View>
        ) : (
          <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
            {categories.map((cat) => (
              <View key={cat.category} className="mb-6">
                <View className="flex-row items-center gap-2 mb-3">
                  <Body className="text-2xl">{cat.icon}</Body>
                  <Body className="font-outfit-semibold text-base">
                    {CATEGORY_LABELS[cat.category] || cat.category}
                  </Body>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {cat.skills.map((skill) => {
                    const isSelected = selectedSkills.has(skill.name);
                    return (
                      <TouchableOpacity
                        key={skill.id}
                        onPress={() => toggleSkill(skill.name)}
                        className={`px-3 py-2 rounded-full border-2 ${
                          isSelected
                            ? 'border-primary-blue'
                            : 'border-light-border-light dark:border-dark-border-light'
                        }`}
                        style={
                          isSelected
                            ? { backgroundColor: primaryColor, borderColor: primaryColor }
                            : { backgroundColor: 'transparent', borderColor: isDark ? '#4B5563' : '#D1D5DB' }
                        }
                      >
                        <View className="flex-row items-center">
                          <Body
                            className="text-sm"
                            style={{ color: isSelected ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#374151') }}
                          >
                            {skill.name}
                          </Body>
                          {isSelected && (
                            <Body className="ml-1.5" style={{ color: '#FFFFFF', fontSize: 12 }}>✓</Body>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            <View className="h-4" />
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

export default SkillsSelectionModal;
