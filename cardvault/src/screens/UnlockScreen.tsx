import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { useVault } from '../vault/VaultContext';

export default function UnlockScreen() {
  const { unlockVault, lastError } = useVault();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.gradientStops}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.lockCard}>
            <View style={styles.logoBadge}>
              <MaterialIcons name="shield" size={32} color={colors.primary} />
            </View>

            <View style={styles.hero}>
              <Text style={styles.title}>Unlock CardVault</Text>
              <Text style={styles.subtitle}>Use biometrics to access your securely encrypted vault.</Text>
            </View>

            <View style={styles.iconContainer}>
              <View style={styles.fingerprintRing}>
                <MaterialIcons name="fingerprint" size={56} color={colors.primary} />
              </View>
            </View>

            {lastError ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={16} color={colors.danger} />
                <Text style={styles.error}>{lastError}</Text>
              </View>
            ) : null}

            <View style={styles.buttonContainer}>
              <PrimaryButton title="Unlock with biometrics" onPress={unlockVault} />
            </View>
          </View>

          <Text style={styles.footerText}>Secure local AES-256 encryption active</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  lockCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#5B5B94',
        shadowOpacity: 0.12,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    fontFamily: 'DMSans',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  fingerprintRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
  },
  footerText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 24,
    opacity: 1,
  },
});
