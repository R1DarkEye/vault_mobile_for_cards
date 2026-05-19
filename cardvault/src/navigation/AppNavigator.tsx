import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { enableScreens } from 'react-native-screens';
import HomeScreen from '../screens/HomeScreen';
import CardsScreen from '../screens/CardsScreen';
import SecurityScreen from '../screens/SecurityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UnlockScreen from '../screens/UnlockScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { useVault } from '../vault/VaultContext';
import { colors } from '../theme/colors';

enableScreens();

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { isInitialized, isUnlocked, isLoading } = useVault();

  if (isLoading) {
    return null;
  }

  if (!isInitialized) {
    return <OnboardingScreen />;
  }

  if (!isUnlocked) {
    return <UnlockScreen />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            borderTopColor: colors.border,
            backgroundColor: colors.surface,
            height: 64,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            paddingBottom: 8,
          },
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Cards" component={CardsScreen} />
        <Tab.Screen name="Security" component={SecurityScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
