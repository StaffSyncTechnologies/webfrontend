import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { useOrgTheme, useToast } from '../contexts';
import { H2, H3, Body, Caption, Button } from '../components/ui';
import {
  useGetMySkillsQuery,
  useGetAllSkillsQuery,
  useAddMySkillMutation,
  useRemoveMySkillMutation,
  useGetMyDocumentsQuery,
  useUploadMyDocumentMutation,
  useDeleteDocumentMutation,
} from '../store/api/workerApi';

const CATEGORY_LABELS: Record<string, string> = {
  WAREHOUSE: 'Warehouse & Logistics',
  HEALTHCARE: 'Healthcare',
  CLEANING: 'Cleaning',
  SECURITY: 'Security',
  HOSPITALITY: 'Hospitality & Events',
  LABOUR: 'General Labour',
  CERTIFICATION: 'Certifications',
};

const STATUS_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; bg: string; color: string }> = {
  VERIFIED: { icon: 'checkmark-circle', bg: '#DCFCE7', color: '#16A34A' },
  PENDING: { icon: 'time', bg: '#FEF3C7', color: '#D97706' },
  REJECTED: { icon: 'close-circle', bg: '#FEE2E2', color: '#DC2626' },
  EXPIRED: { icon: 'alert-circle', bg: '#FEE2E2', color: '#DC2626' },
};

function formatDocDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' | '
    + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function SkillsCertificateScreen({ navigation }: RootStackScreenProps<'SkillsCertificate'>) {
  const insets = useSafeAreaInsets();
  const { primaryColor, secondaryColor } = useOrgTheme();
  const toast = useToast();

  // Skills data
  const { data: mySkillsRes, isLoading: loadingMySkills } = useGetMySkillsQuery();
  const { data: allSkillsRes, isLoading: loadingAllSkills } = useGetAllSkillsQuery();
  const [addMySkill] = useAddMySkillMutation();
  const [removeMySkill] = useRemoveMySkillMutation();

  // Documents data
  const { data: myDocsRes, isLoading: loadingDocs } = useGetMyDocumentsQuery();
  const [uploadDoc] = useUploadMyDocumentMutation();
  const [deleteDoc] = useDeleteDocumentMutation();

  const [showSkillPicker, setShowSkillPicker] = useState(false);

  const mySkills = mySkillsRes?.data || [];
  const mySkillIds = useMemo(() => new Set(mySkills.map((s) => s.skillId)), [mySkills]);
  const myDocs = myDocsRes?.data || [];

  // Group my skills by category
  const groupedMySkills = useMemo(() => {
    const groups: Record<string, Array<{ id: string; skillId: string; name: string }>> = {};
    for (const ws of mySkills) {
      const cat = ws.skill.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ id: ws.id, skillId: ws.skillId, name: ws.skill.name });
    }
    return groups;
  }, [mySkills]);

  // Available skills (not yet added)
  const availableSkills = useMemo(() => {
    const all = allSkillsRes?.data?.grouped || {};
    const filtered: Record<string, Array<{ id: string; name: string }>> = {};
    for (const [cat, skills] of Object.entries(all)) {
      const available = skills.filter((s) => !mySkillIds.has(s.id));
      if (available.length > 0) filtered[cat] = available;
    }
    return filtered;
  }, [allSkillsRes, mySkillIds]);

  const handleAddSkill = async (skillId: string) => {
    try {
      await addMySkill({ skillId }).unwrap();
      toast.success('Skill added');
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      await removeMySkill(skillId).unwrap();
      toast.success('Skill removed');
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to remove skill');
    }
  };

  const handleAddCertificate = async () => {
    try {
      await uploadDoc({ type: 'CERTIFICATION', title: `Certificate ${myDocs.length + 1}` }).unwrap();
      toast.success('Certificate added');
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to add certificate');
    }
  };

  const handleDeleteDocument = (docId: string, title: string) => {
    Alert.alert('Delete Document', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(docId).unwrap();
            toast.success('Document deleted');
          } catch (err: any) {
            toast.error(err?.data?.error || 'Failed to delete document');
          }
        },
      },
    ]);
  };

  const isLoading = loadingMySkills || loadingDocs;

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#000035" />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>Skills and Certificate</H2>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Skills Section */}
          <View className="px-5 pt-2 pb-4">
            <H2 className="mb-4">Skills</H2>

            {Object.keys(groupedMySkills).length === 0 && (
              <View className="items-center py-4">
                <Body color="secondary">No skills added yet</Body>
              </View>
            )}

            {Object.entries(groupedMySkills).map(([category, skills]) => (
              <View key={category} className="mb-4">
                <H3 className="mb-2">{CATEGORY_LABELS[category] || category}</H3>
                {skills.map((skill) => (
                  <View key={skill.skillId} className="flex-row items-center justify-between py-2">
                    <Body color="secondary">{skill.name}</Body>
                    <TouchableOpacity onPress={() => handleRemoveSkill(skill.skillId)}>
                      <Ionicons name="close" size={18} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))}

            {/* Add More Skills */}
            <TouchableOpacity
              className="flex-row items-center justify-center py-3 mt-1"
              onPress={() => setShowSkillPicker(true)}
            >
              <Ionicons name="add" size={18} color={secondaryColor || '#38BDF8'} />
              <Body className="font-outfit-semibold ml-1" style={{ color: secondaryColor || '#38BDF8' }}>
                Add more skills
              </Body>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="h-px bg-light-border-light dark:bg-dark-border-light mx-5" />

          {/* Certificates Section */}
          <View className="px-5 pt-5 pb-4">
            <H2 className="mb-4">Certificates</H2>

            {myDocs.length === 0 && (
              <View className="items-center py-4">
                <Body color="secondary">No certificates uploaded yet</Body>
              </View>
            )}

            {myDocs.map((doc: any) => {
              const cfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.PENDING;
              return (
                <View key={doc.id} className="mb-4">
                  <Body className="font-outfit-semibold mb-2">{doc.title || doc.type}</Body>
                  <View
                    className="flex-row items-center p-3 rounded-xl"
                    style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
                  >
                    <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: cfg.bg }}>
                      <Ionicons name={cfg.icon} size={22} color={cfg.color} />
                    </View>
                    <View className="flex-1">
                      <Body className="font-outfit-semibold">{doc.title || doc.type}</Body>
                      <Caption color="secondary">{formatDocDate(doc.createdAt)}</Caption>
                    </View>
                    {!doc.verified && (
                      <TouchableOpacity onPress={() => handleDeleteDocument(doc.id, doc.title || doc.type)}>
                        <Ionicons name="trash-outline" size={20} color="#DC2626" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}

            {/* Add More Certification */}
            <TouchableOpacity
              className="flex-row items-center justify-center py-3 mt-1"
              onPress={handleAddCertificate}
            >
              <Ionicons name="add" size={18} color={secondaryColor || '#38BDF8'} />
              <Body className="font-outfit-semibold ml-1" style={{ color: secondaryColor || '#38BDF8' }}>
                Add more certification
              </Body>
            </TouchableOpacity>
          </View>

          <View className="h-24" />
        </ScrollView>
      )}

      {/* Save Button */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-3 bg-light-background-primary dark:bg-dark-background-primary">
        <Button onPress={() => navigation.goBack()}>
          Done
        </Button>
      </View>

      {/* Skill Picker Modal */}
      <Modal visible={showSkillPicker} animationType="slide" transparent>
        <View className="flex-1 justify-end">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowSkillPicker(false)}
          />
          <View
            className="bg-white dark:bg-dark-background-primary rounded-t-3xl px-5 pt-5"
            style={{ maxHeight: '70%', paddingBottom: insets.bottom + 16 }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <H2>Add Skills</H2>
              <TouchableOpacity onPress={() => setShowSkillPicker(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {loadingAllSkills ? (
              <ActivityIndicator size="small" color={primaryColor} />
            ) : Object.keys(availableSkills).length === 0 ? (
              <View className="items-center py-8">
                <Body color="secondary">All available skills have been added</Body>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {Object.entries(availableSkills).map(([category, skills]) => (
                  <View key={category} className="mb-4">
                    <H3 className="mb-2">{CATEGORY_LABELS[category] || category}</H3>
                    {skills.map((skill) => (
                      <TouchableOpacity
                        key={skill.id}
                        className="flex-row items-center justify-between py-3 border-b"
                        style={{ borderBottomColor: '#F1F5F9' }}
                        onPress={() => handleAddSkill(skill.id)}
                      >
                        <Body>{skill.name}</Body>
                        <Ionicons name="add-circle-outline" size={22} color={primaryColor} />
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
                <View className="h-8" />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default SkillsCertificateScreen;
