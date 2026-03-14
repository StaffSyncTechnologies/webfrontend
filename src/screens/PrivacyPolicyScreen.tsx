import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { H2, Body } from '../components/ui';

const LOREM = `Lorem ipsum dolor sit amet consectetur. Felis est cursus maecenas sit placerat sit viverra sit. Egestas eu nascetur tempus ipsum etiam egestas nibh neque duis. Id condimentum vestibulum nunc sagittis tempus diam elementum. Ullamcorper urna lobortis sed aliquet tellus. Amet viverra vulputate suspendisse vitae nisi a eget urna enim. Imperdiet sagittis non sit at ullamcorper nullam feugiat. Sit tincidunt dolor adipiscing condimentum pretium pellentesque. Ut accumsan nisi platea non vitae turpis. Pellentesque purus mattis nulla ac pulvinar. Lacinia id sed tempor pellentesque mauris ut senectus. Fermentum molestie ullamcorper libero adipiscing dapibus integer suspendisse at. Et sit mattis neque erat lorem. Ornare pellentesque nulla sed sed sapien id quam sodales. Varius fames proin ac nulla mi aliquam bibendum.

Lorem posuere nibh posuere enim parturient in faucibus ultrices. Blandit ornare quis odio arcu non et duis faucibus et. Vulputate arcu diam potenti volutpat tristique sem ac. Nibh id mauris erat iaculis luctus eget faucibus libero commodo. Posuere eget viverra eget aenean magna ut. Sed sed risus praesent lectus. Rhoncus accumsan ligula odio egestas lacus. Dui purus nunc ac sit. Faucibus dui cras condimentum sit arcu sed. Viverra commodo in pretium vel. Scelerisque mauris tortor aliquam vitae sed viverra dictum. Varius ipsum ornare est auctor est. At quis massa in cras cras. Ipsum convallis mauris tortor risus. Consequat at fermentum cras tempor mollis. Nisl ac mi pharetra augue. Quisque massa ut ipsum nunc nisi habitant sit consequat nullam. Iaculis ornare enim amet mattis.

Penatibus dictum diam eget et leo odio sollicitudin. Ut amet viverra vulputate suspendisse vitae nisi a eget urna enim. Imperdiet sagittis non sit at ullamcorper nullam feugiat. Sit tincidunt dolor adipiscing condimentum pretium pellentesque. Ut accumsan nisi platea non vitae turpis. Pellentesque purus mattis nulla ac pulvinar.`;

export function PrivacyPolicyScreen({ navigation }: RootStackScreenProps<'PrivacyPolicy'>) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#000035" />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <H2>Privacy & Policy</H2>
        </View>
      </View>

      <View className="h-px bg-light-border-light dark:bg-dark-border-light" />

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        <Body color="secondary" className="leading-6">{LOREM}</Body>
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}

export default PrivacyPolicyScreen;
