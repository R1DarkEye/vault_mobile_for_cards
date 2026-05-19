import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { useVault } from '../vault/VaultContext';

export default function SecurityScreen() {
  const { lockVault, viewMnemonic } = useVault();

  const handleViewMnemonic = async () => {
    const mnemonic = await viewMnemonic();
    if (!mnemonic) {
      Alert.alert('Unable to load recovery words');
      return;
    }
    Alert.alert('Recovery words', mnemonic);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Security</Text>
        <Text style={styles.subtitle}>Manage biometric access and recovery options.</Text>
      </View>

      <View style={styles.panel}>
        <PrimaryButton title="View recovery words" onPress={handleViewMnemonic} />
        <PrimaryButton title="Lock vault now" onPress={lockVault} variant="ghost" style={styles.lock} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  hero: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  lock: {
    marginTop: 4,
  },
});
