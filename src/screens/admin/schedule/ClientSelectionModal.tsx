import React, { useState } from 'react';
import { View, Modal, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts';
import { H2, Body, Caption } from '../../../components/ui';

interface Location {
  id: string;
  name: string;
}

interface Client {
  id: string;
  name: string;
  locations: Location[];
}

interface ClientSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (client: Client, location?: Location) => void;
  clients: Client[];
}

export function ClientSelectionModal({ visible, onClose, onSelect, clients }: ClientSelectionModalProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setSelectedLocation(null);
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleConfirm = () => {
    if (selectedClient) {
      onSelect(selectedClient, selectedLocation || undefined);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedClient(null);
    setSelectedLocation(null);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
    >
      <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4" style={{ paddingTop: insets.top }}>
          <TouchableOpacity onPress={handleClose} className="w-10 h-10 rounded-full bg-light-background-secondary dark:bg-dark-background-secondary items-center justify-center">
            <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000035'} />
          </TouchableOpacity>
          <H2 className="flex-1 ml-3">Select Client</H2>
        </View>

        {/* Search */}
        <View className="px-5 mb-4">
          <View className="flex-row items-center px-4 py-3 rounded-xl bg-light-background-secondary dark:bg-dark-background-secondary">
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base"
              placeholder="Search by name..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Client List */}
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {filteredClients.length === 0 ? (
            <View className="items-center justify-center py-16">
              <Ionicons name="business-outline" size={48} color="#9CA3AF" />
              <Caption color="secondary" className="mt-3">No clients found</Caption>
            </View>
          ) : (
            filteredClients.map((client) => (
              <View key={client.id} className="mb-4">
                <TouchableOpacity
                  onPress={() => handleClientSelect(client)}
                  className={`p-4 rounded-xl ${selectedClient?.id === client.id ? 'bg-primary' : 'bg-light-background-secondary dark:bg-dark-background-secondary'}`}
                >
                  <View className="flex-row items-center justify-between">
                    <Body className={`font-outfit-semibold ${selectedClient?.id === client.id ? 'text-white' : ''}`}>
                      {client.name}
                    </Body>
                    <Ionicons name="chevron-down" size={20} color={selectedClient?.id === client.id ? '#FFFFFF' : '#9CA3AF'} />
                  </View>
                </TouchableOpacity>

                {/* Locations */}
                {selectedClient?.id === client.id && client.locations.length > 0 && (
                  <View className="ml-4 mt-2 gap-2">
                    {client.locations.map((location) => (
                      <TouchableOpacity
                        key={location.id}
                        onPress={() => handleLocationSelect(location)}
                        className={`p-3 rounded-lg ${selectedLocation?.id === location.id ? 'bg-primary' : 'bg-light-background-secondary dark:bg-dark-background-secondary'}`}
                      >
                        <Body className={`text-sm ${selectedLocation?.id === location.id ? 'text-white' : ''}`}>
                          {location.name}
                        </Body>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
          <View className="h-32" />
        </ScrollView>

        {/* Footer */}
        <View className="px-5 py-4 border-t border-light-border-light dark:border-dark-border-light">
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!selectedClient}
            className="py-4 rounded-xl"
            style={{
              backgroundColor: selectedClient ? '#10B981' : (isDark ? '#374151' : '#E5E7EB'),
            }}
          >
            <Body className="text-center font-outfit-semibold text-white">
              {selectedLocation ? `Select ${selectedLocation.name}` : 'Select Client Only'}
            </Body>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default ClientSelectionModal;
