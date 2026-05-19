import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { VaultProvider } from './src/vault/VaultContext';

export default function App() {
  return (
    <VaultProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </VaultProvider>
  );
}
