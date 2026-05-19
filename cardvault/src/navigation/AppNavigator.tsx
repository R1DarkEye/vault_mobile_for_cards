import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { enableScreens } from 'react-native-screens';
import { StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
            borderTopColor: 'transparent',
            backgroundColor: colors.surface,
            height: 78,
            paddingBottom: 10,
            paddingTop: 10,
            borderTopWidth: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            paddingBottom: 8,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
          }}
        />
        <Tab.Screen
          name="Cards"
          component={CardsScreen}
          options={{
            tabBarIcon: ({ color }) => <MaterialIcons name="credit-card" size={24} color={color} />,
          }}
        />
        <Tab.Screen
          name="Security"
          component={SecurityScreen}
          options={{
            tabBarIcon: ({ color }) => <MaterialIcons name="verified-user" size={24} color={color} />,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  empty: {},
});
