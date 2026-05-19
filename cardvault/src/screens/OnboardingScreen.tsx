import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const { pendingMnemonic, createVault, finalizeVault, lastError } = useVault();
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
    Alert.alert('Copied', 'Recovery words copied to clipboard.');
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
    const watchdog = new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), 8000);
    });
    const success = await Promise.race([finalizeVault(), watchdog]);
    setIsFinalizing(false);
    if (!success) {
      Alert.alert('Unable to continue', lastError ?? 'Please try again.');
    }
  };

  const handleRestore = () => {
    Alert.alert('Restore wallet', 'Recovery flow is not implemented yet.');
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
          <Text style={styles.backText}>←</Text>
        </Pressable>
      ) : null}
      <View style={styles.logoBadge}>
        <Text style={styles.logoIcon}>🔒</Text>
      </View>
      <Text style={styles.logoText}>CardVault</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#EEF2FF', '#F1E7FF', '#FCE7F3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {renderHeader()}

          {step === 1 ? (
            <View>
              <View style={styles.heroCard}>
                <View style={styles.heroInner}>
                  <View style={styles.heroOrb} />
                  <View style={[styles.heroOrb, styles.heroOrbAlt]} />
                  <View style={styles.heroWallet}>
                    <View style={styles.heroStripe} />
                    <View style={styles.heroStripe} />
                    <View style={styles.heroStripe} />
                  </View>
                </View>
              </View>

              <Text style={styles.headline}>
                Own, control, and leverage the power of your digital assets
              </Text>

              <View style={styles.actionStack}>
                <PrimaryButton
                  title="Create new wallet →"
                  onPress={handleCreate}
                  style={styles.primaryCta}
                />
                <PrimaryButton
                  title="I already have a wallet"
                  onPress={handleRestore}
                  variant="ghost"
                  style={styles.secondaryCta}
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
                  <View style={styles.heroWalletSmall} />
                </View>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureTitle}>You’re in control</Text>
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

              <PrimaryButton title="Get started →" onPress={() => setStep(3)} style={styles.primaryCta} />
              <Pressable onPress={() => setStep(1)} style={styles.linkButton}>
                <Text style={styles.linkText}>I’ll do this later</Text>
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
                  <View style={styles.heroNotebook} />
                </View>
              </View>

              <View style={styles.stepCard}>
                <Text style={styles.stepLabel}>1</Text>
                <View style={styles.stepCopy}>
                  <Text style={styles.featureTitle}>You’ll see 12 words</Text>
                  <Text style={styles.featureText}>
                    We’ll generate a unique 12-word passphrase for your wallet.
                  </Text>
                </View>
              </View>
              <View style={styles.stepCard}>
                <Text style={styles.stepLabel}>2</Text>
                <View style={styles.stepCopy}>
                  <Text style={styles.featureTitle}>Write them down</Text>
                  <Text style={styles.featureText}>
                    Write the words down on paper in the correct order.
                  </Text>
                </View>
              </View>
              <View style={styles.stepCard}>
                <Text style={styles.stepLabel}>3</Text>
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
                style={styles.primaryCta}
              />
              <Pressable onPress={() => setStep(1)} style={styles.linkButton}>
                <Text style={styles.linkText}>I’ll do this later</Text>
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
                  <View style={styles.heroShield} />
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
                <Text style={styles.noticeTitle}>What’s next?</Text>
                <Text style={styles.noticeText}>
                  Once you’ve written down and secured your passphrase, you can continue to your wallet.
                </Text>
                <Text style={styles.noticeText}>Make sure the words are written in the exact order.</Text>
                <Text style={styles.noticeText}>Double-check that you’ve copied all 12 words.</Text>
              </View>

              <PrimaryButton title="I’ve written it down →" onPress={() => setStep(5)} style={styles.primaryCta} />
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
                    To make sure you’ve written it down, please re-enter your 12-word passphrase in the correct order.
                  </Text>
                </View>
                <View style={styles.heroPreview}>
                  <View style={styles.heroShield} />
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
                style={styles.primaryCta}
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 16,
    color: colors.text,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 18,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  heroCard: {
    height: 260,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#5B5B94',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    marginBottom: 28,
  },
  heroInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroWallet: {
    width: 180,
    height: 120,
    borderRadius: 24,
    backgroundColor: '#EDEBFF',
    borderWidth: 1,
    borderColor: '#D6D2FF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#8B8BFF',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  heroStripe: {
    width: 120,
    height: 10,
    borderRadius: 8,
    backgroundColor: '#C9C4FF',
  },
  heroOrb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#7C8CFF',
    top: 40,
    right: 50,
  },
  heroOrbAlt: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#B986FF',
    top: 90,
    left: 60,
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 34,
    marginBottom: 28,
  },
  actionStack: {
    gap: 14,
  },
  primaryCta: {
    backgroundColor: '#5C6CFF',
  },
  secondaryCta: {
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
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
    width: 120,
    height: 90,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  heroNotebook: {
    width: 120,
    height: 120,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  heroShield: {
    width: 120,
    height: 120,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  featureCard: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  featureText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  noticeCard: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    marginTop: 12,
    marginBottom: 20,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
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
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
  },
  stepLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8E5FF',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '700',
    color: colors.text,
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
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  wordIndex: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  wordText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  copyButtonWide: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    marginTop: 12,
  },
  copyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
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
    color: '#6B5CFF',
    fontWeight: '600',
  },
  error: {
    marginTop: 8,
    color: colors.danger,
  },
});
