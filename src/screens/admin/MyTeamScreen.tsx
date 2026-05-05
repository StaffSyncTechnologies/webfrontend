import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrgTheme, useTheme } from '../../contexts';
import { H2, H3, Body, Caption, Card, Badge, Input } from '../../components/ui';

export function MyTeamScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useOrgTheme();
  const { isDark } = useTheme();

  // Mock data - replace with API later
  const workers = [
    { id: '1', name: 'John Smith', status: 'ACTIVE', todayShift: '06:00 - 14:00' },
    { id: '2', name: 'Sarah Johnson', status: 'ACTIVE', todayShift: '14:00 - 22:00' },
    { id: '3', name: 'Mike Williams', status: 'OFF', todayShift: null },
    { id: '4', name: 'Emily Brown', status: 'ACTIVE', todayShift: '22:00 - 06:00' },
    { id: '5', name: 'David Lee', status: 'ACTIVE', todayShift: '06:00 - 14:00' },
  ];

  const stats = {
    myTeam: 15,
    onShift: 8,
    available: 5,
    offDuty: 2,
  };

  return (
    <View className="flex-1 bg-light-background-primary dark:bg-dark-background-primary" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <View>
          <H2>My Team</H2>
          <Caption color="secondary">Manage your assigned workers</Caption>
        </View>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-light-background-secondary dark:bg-dark-background-secondary items-center justify-center">
          <Ionicons name="add-outline" size={24} color={primaryColor} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          <Card className="flex-1 min-w-[45%] p-4">
            <H3 className="text-2xl">{stats.myTeam}</H3>
            <Caption color="secondary">My Team</Caption>
          </Card>
          <Card className="flex-1 min-w-[45%] p-4">
            <H3 className="text-2xl">{stats.onShift}</H3>
            <Caption color="secondary">On Shift</Caption>
          </Card>
          <Card className="flex-1 min-w-[45%] p-4">
            <H3 className="text-2xl">{stats.available}</H3>
            <Caption color="secondary">Available</Caption>
          </Card>
          <Card className="flex-1 min-w-[45%] p-4">
            <H3 className="text-2xl">{stats.offDuty}</H3>
            <Caption color="secondary">Off Duty</Caption>
          </Card>
        </View>

        {/* Search */}
        <Input
          placeholder="Search my team..."
          leftIcon={<Ionicons name="search-outline" size={20} color="#9CA3AF" />}
          containerClassName="mb-4"
        />

        {/* Workers List */}
        <H3 className="mb-3">Team Members</H3>
        <View className="gap-3 mb-6">
          {workers.map((worker) => (
            <Card key={worker.id} className="p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Body className="font-outfit-semibold">{worker.name}</Body>
                <Badge 
                  variant={worker.status === 'ACTIVE' ? 'success' : 'default'}
                  className="text-[10px]"
                >
                  {worker.status}
                </Badge>
              </View>
              <Caption color="secondary">{worker.todayShift || 'No shift today'}</Caption>
            </Card>
          ))}
        </View>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}

export default MyTeamScreen;
