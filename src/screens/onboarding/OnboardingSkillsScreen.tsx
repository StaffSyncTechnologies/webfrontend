import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme } from '../../contexts';
import { Button, H1, Body, StepHeader } from '../../components/ui';
import { API_BASE_URL } from '../../services/endpoints';
import { useTranslation } from 'react-i18next';
import type { AuthStackScreenProps } from '../../types/navigation';

type Props = AuthStackScreenProps<'OnboardingSkills'>;

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

export function OnboardingSkillsScreen({ navigation }: Props) {
  const { primaryColor } = useOrgTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/skills`);
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

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => {
      const next = new Set(prev);
      if (next.has(skillId)) next.delete(skillId);
      else next.add(skillId);
      return next;
    });
  };

  const handleContinue = () => {
    // TODO: Save selected skills to backend
    navigation.navigate('OnboardingDocuments');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary items-center justify-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <StepHeader currentStep={3} totalSteps={6} onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <H1 className="mb-2">{t('onboarding.selectSkills')}</H1>
        <Body color="secondary" className="mb-6 leading-6">
          {t('onboarding.selectSkillsDesc')}
        </Body>

        {categories.map((cat) => (
          <View key={cat.category} className="mb-6">
            {/* Category Header */}
            <View className="flex-row items-center mb-3">
              <Body className="text-lg mr-2">{cat.icon}</Body>
              <Body className="font-outfit-semibold text-base">{CATEGORY_LABELS[cat.category] || cat.category}</Body>
            </View>

            {/* Skill Chips */}
            <View className="flex-row flex-wrap gap-2">
              {cat.skills.map((skill) => {
                const isSelected = selectedSkills.has(skill.id);
                return (
                  <TouchableOpacity
                    key={skill.id}
                    onPress={() => toggleSkill(skill.id)}
                    style={[
                      {
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 1.5,
                      },
                      isSelected
                        ? { backgroundColor: primaryColor, borderColor: primaryColor }
                        : { backgroundColor: 'transparent', borderColor: '#D1D5DB' },
                    ]}
                  >
                    <View className="flex-row items-center">
                      <Body
                        className="text-sm"
                        style={{ color: isSelected ? '#FFFFFF' : '#374151' }}
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

      <View className="px-6 pb-4 pt-2 border-t border-light-border-light">
        <Button onPress={handleContinue}>
          {t('auth.continue')}
        </Button>
      </View>
    </View>
  );
}

export default OnboardingSkillsScreen;
