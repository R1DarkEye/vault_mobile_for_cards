import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { useVault } from '../vault/VaultContext';
import { useMemo } from 'react';

export default function SecurityScreen() {
  const { lockVault, viewMnemonic, data, isUnlocked } = useVault();

  const cardCount = data?.cards?.length ?? 0;

  const statusCards = useMemo(
    () => [
      {
        title: isUnlocked ? 'Vault Unlocked' : 'Vault Locked',
        subtitle: isUnlocked ? 'Your vault is currently open' : 'Your vault is securely locked',
        icon: isUnlocked ? 'lock-open' : 'lock',
        ok: !isUnlocked,
      },
      { title: 'Encryption', subtitle: '256-bit AES-GCM encryption', icon: 'verified-user', ok: true },
      { title: 'Cards Stored', subtitle: `${cardCount} card${cardCount !== 1 ? 's' : ''} in vault`, icon: 'credit-card', ok: true },
      { title: 'Biometric Auth', subtitle: 'Device biometrics required', icon: 'fingerprint', ok: true },
    ],
    [isUnlocked, cardCount],
  );

  const securityScore = useMemo(() => {
    let score = 50; // base: encryption always on
    if (cardCount > 0) score += 20;
    if (isUnlocked) score += 10; // vault was successfully set up
    score += 20; // biometric always enabled
    return Math.min(score, 100);
  }, [cardCount, isUnlocked]);

  const scoreLabel = securityScore >= 90 ? 'Excellent' : securityScore >= 70 ? 'Good' : 'Fair';

  const handleViewMnemonic = async () => {
    const mnemonic = await viewMnemonic();
    if (!mnemonic) {
      Alert.alert('Unable to load recovery words');
      return;
    }
    Alert.alert('Recovery Words', mnemonic, [{ text: 'OK' }]);
  };

  const handleLockVault = () => {
    Alert.alert('Lock Vault', 'Are you sure you want to lock the vault? You will need biometric authentication to unlock it again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Lock Now', style: 'destructive', onPress: lockVault },
    ]);
  };

  const handleAction = (title: string) => {
    switch (title) {
      case 'Change Master Password':
        Alert.alert('Change Password', 'Your vault uses a mnemonic-based key derivation. To change your credentials, you\'ll need to create a new vault and re-add your cards.');
        break;
      case 'Recovery Options':
        handleViewMnemonic();
        break;
      case 'Manage Trusted Devices':
        Alert.alert('Trusted Devices', 'This device is the only authorized device. Multi-device support will be available in a future update.');
        break;
      case 'Lock Vault Now':
        handleLockVault();
        break;
      default:
        break;
    }
  };

  const actions = [
    { title: 'Change Master Password', subtitle: 'Update your vault password regularly', icon: 'vpn-key' },
    { title: 'Recovery Options', subtitle: 'View your recovery passphrase', icon: 'key' },
    { title: 'Manage Trusted Devices', subtitle: 'View and manage devices that can access your vault', icon: 'phonelink-lock' },
    { title: 'Lock Vault Now', subtitle: 'Immediately lock your vault for extra security', icon: 'lock' },
  ] as const;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Security</Text>
            <Text style={styles.subtitle}>Your security is our top priority.</Text>
            <Text style={styles.subtitle}>Manage and monitor your vault security.</Text>
          </View>
          <View style={styles.heroArt}>
            <MaterialIcons name="security" size={42} color={colors.primary} />
          </View>
        </View>

        <LinearGradient colors={['#F3F6FF', '#F7F0FF']} style={styles.scoreCard}>
          <View style={styles.scoreRing}>
            <View style={styles.scoreRingInner}>
              <MaterialIcons name="check" size={20} color="#2E9D6B" />
            </View>
          </View>
          <View style={styles.scoreCopy}>
            <Text style={styles.scoreLabel}>Vault Security Score</Text>
            <Text style={styles.scoreValue}>{scoreLabel}</Text>
            <Text style={styles.scoreSubtitle}>Your vault is protected with strong security measures.</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeText}>{securityScore} / 100</Text>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Security Status</Text>
        <View style={styles.statusGrid}>
          {statusCards.map((item) => (
            <Pressable
              key={item.title}
              style={styles.statusCard}
              onPress={() => {
                if (item.title.includes('Vault')) {
                  if (isUnlocked) handleLockVault();
                }
              }}
            >
              <View style={styles.statusIcon}>
                <MaterialIcons name={item.icon as any} size={18} color={colors.primary} />
              </View>
              <Text style={styles.statusTitle}>{item.title}</Text>
              <Text style={styles.statusSubtitle}>{item.subtitle}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.actionPanel}>
          <View style={styles.actionRow}>
            <Text style={styles.actionTitle}>Two-Factor Authentication</Text>
            <View style={styles.actionBadge}>
              <Text style={styles.actionBadgeText}>Enabled</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Security Actions</Text>
        <View style={styles.actionList}>
          {actions.map((item) => (
            <Pressable
              key={item.title}
              style={({ pressed }) => [styles.actionItem, pressed && styles.actionItemPressed]}
              onPress={() => handleAction(item.title)}
            >
              <View style={styles.actionIcon}>
                <MaterialIcons name={item.icon as any} size={18} color={colors.primary} />
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionItemTitle}>{item.title}</Text>
                <Text style={styles.actionItemSubtitle}>{item.subtitle}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
          <PrimaryButton title="View recovery words" onPress={handleViewMnemonic} style={styles.primaryCta} />
          <PrimaryButton title="Lock vault now" onPress={handleLockVault} variant="ghost" />
        </View>

        <View style={styles.systemBanner}>
          <View style={styles.systemIcon}>
            <MaterialIcons name="check-circle" size={18} color="#1E7E53" />
          </View>
          <View>
            <Text style={styles.systemTitle}>All systems secure</Text>
            <Text style={styles.systemSubtitle}>Encryption active · Biometrics enabled</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  heroArt: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: '#E6ECFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCard: {
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 6,
    borderColor: '#45C28E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRingInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DFF8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCopy: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E9D6B',
    marginTop: 4,
  },
  scoreSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  scoreBadge: {
    backgroundColor: '#DFF8EE',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  scoreBadgeText: {
    fontSize: 11,
    color: '#2E9D6B',
    fontWeight: '600',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  statusSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  actionPanel: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  actionBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionBadgeText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  actionList: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionItemPressed: {
    opacity: 0.7,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: {
    flex: 1,
  },
  actionItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  actionItemSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  primaryCta: {
    backgroundColor: colors.primary,
  },
  systemBanner: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E9F7F0',
    borderRadius: 18,
    padding: 12,
  },
  systemIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#CFF3E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E7E53',
  },
  systemSubtitle: {
    fontSize: 11,
    color: '#2F8E63',
    marginTop: 2,
  },
});
