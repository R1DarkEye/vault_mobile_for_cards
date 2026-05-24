import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { enableScreens } from 'react-native-screens';
import { StyleSheet, View, Pressable, Text, Platform, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import HomeScreen from '../screens/HomeScreen';
import CardsScreen from '../screens/CardsScreen';
import SecurityScreen from '../screens/SecurityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UnlockScreen from '../screens/UnlockScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import { useVault } from '../vault/VaultContext';
import { colors } from '../theme/colors';
import AddCardModal from '../components/AddCardModal';

enableScreens();

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Home:     { active: 'home',          inactive: 'home' },
  Cards:    { active: 'credit-card',   inactive: 'credit-card' },
  Security: { active: 'verified-user', inactive: 'verified-user' },
  Profile:  { active: 'person',        inactive: 'person' },
};

export default function AppNavigator() {
  const { isInitialized, isUnlocked, isLoading, data } = useVault();
  const [addModalVisible, setAddModalVisible] = useState(false);

  if (isLoading) {
    return null;
  }

  if (!isInitialized) {
    return <OnboardingScreen />;
  }

  if (!isUnlocked) {
    return <UnlockScreen />;
  }

  // Profile setup is mandatory for new vaults
  if (!data?.profile?.name) {
    return <ProfileSetupScreen />;
  }

  // Custom premium floating bottom tab bar — matching the mockup exactly
  const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    const routes = state.routes;

    const renderTab = (route: any, index: number) => {
      const { options } = descriptors[route.key];
      const label =
        options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

      const isFocused = state.index === index;

      const onPress = () => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
          navigation.navigate({ name: route.name, merge: true });
        }
      };

      const iconName = isFocused
        ? TAB_ICONS[route.name]?.active ?? 'apps'
        : TAB_ICONS[route.name]?.inactive ?? 'apps';

      return (
        <Pressable
          key={route.key}
          onPress={onPress}
          style={styles.tabButton}
          android_ripple={{ color: 'rgba(77, 107, 255, 0.1)', borderless: true }}
        >
          <View style={styles.tabInner}>
            <MaterialIcons
              name={iconName as any}
              size={24}
              color={isFocused ? colors.primary : '#9CA3AF'}
            />
            <Text style={[
              styles.tabLabel,
              isFocused && styles.tabLabelActive,
            ]}>
              {label}
            </Text>
          </View>
        </Pressable>
      );
    };

    return (
      <View style={styles.tabBarOuter} pointerEvents="box-none">
        {/* Tab bar pill */}
        <View style={styles.tabBar}>
          {/* Left half */}
          {renderTab(routes[0], 0)}
          {renderTab(routes[1], 1)}

          {/* Center FAB */}
          <View style={styles.fabContainer}>
            <Pressable
              style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
              onPress={() => setAddModalVisible(true)}
            >
              <LinearGradient
                colors={[colors.primaryLight, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fabGradient}
              >
                <MaterialIcons name="add" size={30} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
          </View>

          {/* Right half */}
          {renderTab(routes[2], 2)}
          {renderTab(routes[3], 3)}
        </View>

        {/* Home Indicator safe area spacer (transparent) */}
        {Platform.OS === 'ios' && <View style={styles.homeIndicatorSpacer} />}
      </View>
    );
  };

  return (
    <>
      <NavigationContainer>
        <Tab.Navigator
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ tabBarLabel: 'Home' }}
          />
          <Tab.Screen
            name="Cards"
            component={CardsScreen}
            options={{ tabBarLabel: 'Cards' }}
          />
          <Tab.Screen
            name="Security"
            component={SecurityScreen}
            options={{ tabBarLabel: 'Security' }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ tabBarLabel: 'Profile' }}
          />
        </Tab.Navigator>
      </NavigationContainer>

      <AddCardModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} />
    </>
  );
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const BAR_H = 64;
const BAR_MARGIN_H = 16;
const FAB_SIZE = 56;

const styles = StyleSheet.create({
  tabBarOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBar: {
    width: SCREEN_WIDTH - BAR_MARGIN_H * 2,
    height: BAR_H,
    borderRadius: BAR_H / 2,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 28 : 12,
    ...Platform.select({
      ios: {
        shadowColor: '#23235B',
        shadowOpacity: 0.10,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 1,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  fabContainer: {
    width: FAB_SIZE + 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    padding: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#3B5BFF',
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 10,
      },
    }),
  },
  fabPressed: {
    transform: [{ scale: 0.92 }],
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: (FAB_SIZE - 6) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicatorSpacer: {
    height: 0, // Handled by marginBottom on tabBar
  },
});
