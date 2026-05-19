import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { useVault } from '../vault/VaultContext';

export default function UnlockScreen() {
  const { unlockVault, lastError } = useVault();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Unlock CardVault</Text>
        <Text style={styles.subtitle}>Use biometrics to access your encrypted vault.</Text>
      </View>

      {lastError ? <Text style={styles.error}>{lastError}</Text> : null}
      <PrimaryButton title="Unlock with biometrics" onPress={unlockVault} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  hero: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
  },
});
