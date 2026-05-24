import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useMemo, useState } from 'react';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { useVault } from '../vault/VaultContext';

type Step = 1 | 2 | 3 | 4 | 5;

const verifyTips = [
  'Enter each word exactly as you wrote it down, in the same order.',
  'Double-check the spelling of each word before continuing.',
];

export default function OnboardingScreen() {
  const { pendingMnemonic, createVault, finalizeVault, lastError, showToast } = useVault();
  const [step, setStep] = useState<Step>(1);
  const [verifyWords, setVerifyWords] = useState<string[]>(Array.from({ length: 12 }, () => ''));
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const words = useMemo(() => pendingMnemonic?.split(' ') ?? [], [pendingMnemonic]);

  const handleCopyMnemonic = async () => {
    if (!pendingMnemonic) {
      return;
    }
    await Clipboard.setStringAsync(pendingMnemonic);
    showToast('Copied', 'Recovery words copied to clipboard.', 'success');
  };

  const handleCreate = () => {
    createVault();
    setStep(2);
  };

  const handleShowPassphrase = () => {
    if (!pendingMnemonic) {
      createVault();
    }
    setStep(4);
  };

  const handleVerify = async () => {
    if (isFinalizing) {
      return;
    }
    if (!pendingMnemonic) {
      setVerifyError('Recovery words are missing.');
      return;
    }

    const normalized = verifyWords.map((word) => word.trim().toLowerCase());
    if (normalized.some((word) => !word)) {
      setVerifyError('Please fill all 12 words.');
      return;
    }

    if (normalized.join(' ') !== pendingMnemonic) {
      setVerifyError('Words do not match. Please try again.');
      return;
    }

    setVerifyError(null);
    setIsFinalizing(true);
    try {
      const success = await finalizeVault();
      setIsFinalizing(false);
      if (!success) {
        showToast('Unable to continue', lastError ?? 'Please try again.', 'error');
      }
    } catch (e) {
      setIsFinalizing(false);
      showToast('Unable to continue', 'Please try again.', 'error');
    }
  };

  const handleRestore = () => {
    showToast('Restore Wallet', 'Recovery flow is not implemented yet.', 'info');
  };

  const handleBack = () => {
    if (step === 1) {
      return;
    }
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      {step > 1 ? (
        <Pressable onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={18} color={colors.text} />
        </Pressable>
      ) : null}
      <View style={styles.logoBadge}>
        <MaterialIcons name="shield" size={20} color={colors.primary} />
      </View>
      <Text style={styles.logoText}>CardVault</Text>
    </View>
  );

  /* 3D-style wallet SVG illustration using Views */
  const renderWalletIllustration = () => (
    <View style={styles.heroCard}>
      <View style={styles.heroInner}>
        {/* Floating decorative elements */}
        <View style={styles.floatingLock}>
          <MaterialIcons name="lock" size={16} color={colors.primaryLight} />
        </View>
        <View style={styles.floatingCard}>
          <MaterialIcons name="credit-card" size={14} color={colors.accentBlue} />
        </View>
        <View style={styles.floatingShield}>
          <MaterialIcons name="verified-user" size={14} color={colors.accentGreen} />
        </View>

        {/* Main wallet shape */}
        <View style={styles.heroWallet}>
          <LinearGradient
            colors={['#a78bfa', '#818cf8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.walletGradient}
          >
            <View style={styles.heroStripe} />
            <View style={[styles.heroStripe, { width: 80 }]} />
            <View style={styles.heroStripe} />
          </LinearGradient>
        </View>

        {/* Wallet clasp */}
        <View style={styles.walletClasp}>
          <MaterialIcons name="account-balance-wallet" size={28} color="#FFFFFF" />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#e8e6ff', '#f0eeff', '#fde8f0', '#fff0fa']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {renderHeader()}

          {step === 1 ? (
            <View>
              {renderWalletIllustration()}

              <Text style={styles.headline}>
                Own, control, and leverage the power of your digital assets
              </Text>

              <View style={styles.actionStack}>
                <PrimaryButton
                  title="Create new wallet →"
                  onPress={handleCreate}
                />
                <PrimaryButton
                  title="I already have a wallet"
                  onPress={handleRestore}
                  variant="ghost"
                />
                <Text style={styles.footerText}>
                  By tapping any button you agree and consent to our Terms of Service and Privacy Policy.
                </Text>
              </View>
            </View>
          ) : null}

          {step === 2 ? (
            <View>
              <View style={styles.heroSplit}>
                <View style={styles.heroCopy}>
                  <Text style={styles.sectionTitle}>Create new wallet</Text>
                  <Text style={styles.sectionSubtitle}>
                    Secure your wallet with a 12-word recovery passphrase.
                  </Text>
                </View>
                <View style={styles.heroPreview}>
                  <View style={styles.heroWalletSmall}>
                    <MaterialIcons name="account-balance-wallet" size={28} color={colors.primary} />
                  </View>
                </View>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureTitle}>You're in control</Text>
                <Text style={styles.featureText}>Only you will have access to your wallet and funds.</Text>
              </View>
              <View style={styles.featureCard}>
                <Text style={styles.featureTitle}>Write it down</Text>
                <Text style={styles.featureText}>
                  Your recovery passphrase is the only way to recover your wallet.
                </Text>
              </View>
              <View style={styles.featureCard}>
                <Text style={styles.featureTitle}>Keep it safe</Text>
                <Text style={styles.featureText}>Store it offline and never share it with anyone.</Text>
              </View>

              <View style={styles.noticeCard}>
                <Text style={styles.noticeTitle}>Important</Text>
                <Text style={styles.noticeText}>We never store your passphrase.</Text>
                <Text style={styles.noticeText}>CardVault cannot recover it for you.</Text>
                <Text style={styles.noticeText}>Anyone with your passphrase can access your wallet.</Text>
              </View>

              <PrimaryButton title="Get started →" onPress={() => setStep(3)} />
              <Pressable onPress={() => setStep(1)} style={styles.linkButton}>
                <Text style={styles.linkText}>I'll do this later</Text>
              </Pressable>
            </View>
          ) : null}

          {step === 3 ? (
            <View>
              <View style={styles.heroSplit}>
                <View style={styles.heroCopy}>
                  <Text style={styles.sectionTitle}>Your recovery passphrase</Text>
                  <Text style={styles.sectionSubtitle}>
                    This 12-word passphrase is the only way to recover your wallet.
                  </Text>
                </View>
                <View style={styles.heroPreview}>
                  <View style={styles.heroNotebook}>
                    <MaterialIcons name="menu-book" size={28} color={colors.primary} />
                  </View>
                </View>
              </View>

              <View style={styles.stepCard}>
                <View style={styles.stepLabelWrap}>
                  <Text style={styles.stepLabel}>1</Text>
                </View>
                <View style={styles.stepCopy}>
                  <Text style={styles.featureTitle}>You'll see 12 words</Text>
                  <Text style={styles.featureText}>
                    We'll generate a unique 12-word passphrase for your wallet.
                  </Text>
                </View>
              </View>
              <View style={styles.stepCard}>
                <View style={styles.stepLabelWrap}>
                  <Text style={styles.stepLabel}>2</Text>
                </View>
                <View style={styles.stepCopy}>
                  <Text style={styles.featureTitle}>Write them down</Text>
                  <Text style={styles.featureText}>
                    Write the words down on paper in the correct order.
                  </Text>
                </View>
              </View>
              <View style={styles.stepCard}>
                <View style={styles.stepLabelWrap}>
                  <Text style={styles.stepLabel}>3</Text>
                </View>
                <View style={styles.stepCopy}>
                  <Text style={styles.featureTitle}>Keep it safe</Text>
                  <Text style={styles.featureText}>
                    Store it in a secure place and never share it with anyone.
                  </Text>
                </View>
              </View>

              <View style={styles.noticeCard}>
                <Text style={styles.noticeTitle}>Important</Text>
                <Text style={styles.noticeText}>We never store your passphrase.</Text>
                <Text style={styles.noticeText}>CardVault cannot recover it for you.</Text>
                <Text style={styles.noticeText}>Anyone with your passphrase can access your wallet.</Text>
              </View>

              <PrimaryButton
                title="Show me my passphrase →"
                onPress={handleShowPassphrase}
              />
              <Pressable onPress={() => setStep(1)} style={styles.linkButton}>
                <Text style={styles.linkText}>I'll do this later</Text>
              </Pressable>
            </View>
          ) : null}

          {step === 4 ? (
            <View>
              <View style={styles.heroSplit}>
                <View style={styles.heroCopy}>
                  <Text style={styles.sectionTitle}>Your 12-word passphrase</Text>
                  <Text style={styles.sectionSubtitle}>
                    Write these words down in order and keep them in a safe place.
                  </Text>
                </View>
                <View style={styles.heroPreview}>
                  <View style={styles.heroShieldIcon}>
                    <MaterialIcons name="shield" size={28} color={colors.primary} />
                  </View>
                </View>
              </View>

              <View style={styles.noticeCard}>
                <Text style={styles.noticeTitle}>Keep it safe and private</Text>
                <Text style={styles.noticeText}>
                  Anyone with these words can access your wallet and funds. Never share it with anyone.
                </Text>
              </View>

              <View style={styles.wordGrid}>
                {words.map((word, index) => (
                  <View key={`${word}-${index}`} style={styles.wordCell}>
                    <Text style={styles.wordIndex}>{index + 1}.</Text>
                    <Text style={styles.wordText}>{word}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.noticeCard}>
                <Text style={styles.noticeTitle}>What's next?</Text>
                <Text style={styles.noticeText}>
                  Once you've written down and secured your passphrase, you can continue to your wallet.
                </Text>
                <Text style={styles.noticeText}>Make sure the words are written in the exact order.</Text>
                <Text style={styles.noticeText}>Double-check that you've copied all 12 words.</Text>
              </View>

              <PrimaryButton title="I've written it down →" onPress={() => setStep(5)} />
              <Pressable onPress={handleCopyMnemonic} style={styles.copyButtonWide}>
                <Text style={styles.copyText}>Copy to clipboard</Text>
              </Pressable>
              <Pressable onPress={handleBack} style={styles.linkButton}>
                <Text style={styles.linkText}>Go back</Text>
              </Pressable>
            </View>
          ) : null}

          {step === 5 ? (
            <View>
              <View style={styles.heroSplit}>
                <View style={styles.heroCopy}>
                  <Text style={styles.sectionTitle}>Verify your passphrase</Text>
                  <Text style={styles.sectionSubtitle}>
                    To make sure you've written it down, please re-enter your 12-word passphrase in the correct order.
                  </Text>
                </View>
                <View style={styles.heroPreview}>
                  <View style={styles.heroShieldIcon}>
                    <MaterialIcons name="shield" size={28} color={colors.primary} />
                  </View>
                </View>
              </View>

              <View style={styles.noticeCard}>
                <Text style={styles.noticeTitle}>Keep it safe and private</Text>
                <Text style={styles.noticeText}>
                  Anyone with these words can access your wallet and funds. Never share it with anyone.
                </Text>
              </View>

              <View style={styles.verifyGrid}>
                {verifyWords.map((value, index) => (
                  <View key={`verify-${index}`} style={styles.verifyCell}>
                    <Text style={styles.wordIndex}>{index + 1}.</Text>
                    <TextInput
                      value={value}
                      onChangeText={(text) => {
                        setVerifyError(null);
                        setVerifyWords((prev) => {
                          const next = [...prev];
                          next[index] = text;
                          return next;
                        });
                      }}
                      placeholder="Type word"
                      placeholderTextColor={colors.textMuted}
                      style={styles.verifyInput}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                ))}
              </View>

              <View style={styles.noticeCard}>
                <Text style={styles.noticeTitle}>Tip</Text>
                {verifyTips.map((tip) => (
                  <Text key={tip} style={styles.noticeText}>
                    {tip}
                  </Text>
                ))}
              </View>

              {verifyError ? <Text style={styles.error}>{verifyError}</Text> : null}
              {lastError ? <Text style={styles.error}>{lastError}</Text> : null}

              <PrimaryButton
                title={isFinalizing ? 'Securing your vault…' : 'Continue to wallet →'}
                onPress={handleVerify}
                disabled={isFinalizing}
              />
              <Pressable onPress={handleBack} style={styles.linkButton}>
                <Text style={styles.linkText}>Go back</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
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
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    fontFamily: 'DMSans',
  },
  heroCard: {
    height: 280,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1,
    borderColor: colors.borderSoft,
    shadowColor: '#7c3aed',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    marginBottom: 28,
    overflow: 'hidden',
  },
  heroInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingLock: {
    position: 'absolute',
    top: 35,
    right: 40,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingCard: {
    position: 'absolute',
    top: 60,
    left: 30,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingShield: {
    position: 'absolute',
    bottom: 40,
    right: 50,
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroWallet: {
    width: 180,
    height: 120,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  walletGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
  },
  heroStripe: {
    width: 120,
    height: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  walletClasp: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    marginLeft: -24,
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 34,
    marginBottom: 28,
    fontFamily: 'DMSans',
  },
  actionStack: {
    gap: 14,
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  heroSplit: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroCopy: {
    flex: 1.2,
  },
  heroPreview: {
    flex: 0.8,
    alignItems: 'flex-end',
  },
  heroWalletSmall: {
    width: 100,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroNotebook: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroShieldIcon: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'DMSans',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  featureCard: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    fontFamily: 'DMSans',
  },
  featureText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  noticeCard: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginTop: 12,
    marginBottom: 20,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    fontFamily: 'DMSans',
  },
  noticeText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginBottom: 12,
  },
  stepLabelWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontWeight: '800',
    color: colors.primary,
    fontSize: 14,
  },
  stepCopy: {
    flex: 1,
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  wordCell: {
    width: '30%',
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  wordIndex: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  wordText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'DMSans',
  },
  copyButtonWide: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    marginTop: 12,
  },
  copyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  verifyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  verifyCell: {
    width: '30%',
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  verifyInput: {
    fontSize: 13,
    color: colors.text,
    padding: 0,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
  },
  error: {
    marginTop: 8,
    color: colors.danger,
  },
});
