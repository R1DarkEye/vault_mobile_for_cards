import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as LocalAuthentication from 'expo-local-authentication';
import { colors } from '../theme/colors';
import { useVault } from '../vault/VaultContext';
import { useMemo, useState } from 'react';
import AddCardModal from '../components/AddCardModal';
import ViewCardModal from '../components/ViewCardModal';
import CardSlider from '../components/CardSlider';
import { VaultCard } from '../vault/types';

const overviewCards = [
  { type: 'payment', label: 'Payment Cards', tone: colors.accentBlue, icon: 'credit-card' },
  { type: 'id', label: 'ID Cards', tone: colors.accentPurple, icon: 'badge' },
  { type: 'insurance', label: 'Insurance', tone: colors.accentGreen, icon: 'health-and-safety' },
  { type: 'license', label: 'License', tone: colors.accentOrange, icon: 'directions-car' },
  { type: 'other', label: 'Others', tone: '#8B96B4', icon: 'apps' },
] as const;

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return '1 day ago';
  if (diffDay < 7) return `${diffDay} days ago`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek === 1) return '1 week ago';
  return `${diffWeek} weeks ago`;
}

export default function HomeScreen() {
  const { data, lockVault, showToast } = useVault();
  const navigation = useNavigation<any>();
  const cards = data?.cards ?? [];
  const profile = data?.profile;
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<VaultCard | null>(null);

  const initials = useMemo(() => {
    const name = profile?.name || 'John Doe';
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }, [profile?.name]);

  const firstName = useMemo(() => {
    return (profile?.name || 'John').split(' ')[0];
  }, [profile?.name]);

  const counts = overviewCards.map((item) => ({
    ...item,
    count: cards.filter((card) => card.type === item.type).length,
  }));

  const recentActivity = useMemo(() => {
    return [...cards]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3)
      .map((card) => ({
        card,
        title: `${card.type === 'payment' ? 'Payment Card' : card.type === 'id' ? 'ID Card' : card.type === 'insurance' ? 'Insurance' : card.type === 'license' ? 'License' : 'Card'} added`,
        subtitle: `${card.title}${card.last4 ? ` •••• ${card.last4}` : ''}`,
        when: timeAgo(card.updatedAt),
        icon: card.type === 'payment' ? 'credit-card' : card.type === 'id' ? 'badge' : card.type === 'insurance' ? 'health-and-safety' : card.type === 'license' ? 'directions-car' : 'apps',
      }));
  }, [cards]);

  const generateBackupHtml = (allCards: VaultCard[]): string => {
    const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const gradientMap: Record<string, string> = {
      payment: 'linear-gradient(135deg, #0F245B 0%, #243C8B 100%)',
      id: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)',
      insurance: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)',
      license: 'linear-gradient(135deg, #78350F 0%, #D97706 100%)',
      other: 'linear-gradient(135deg, #374151 0%, #6B7280 100%)',
    };

    const labelMap: Record<string, string> = {
      payment: 'Payment Card',
      id: 'ID Card',
      insurance: 'Insurance',
      license: 'License',
      other: 'Other',
    };

    const renderDetails = (card: VaultCard): string => {
      const rows: string[] = [];
      const add = (label: string, value?: string) => {
        if (value) rows.push(`<div class="field"><span class="label">${label}</span><span class="value">${value}</span></div>`);
      };
      add('Title', card.title);
      add('Description', card.subtitle);
      if (card.type === 'payment') {
        add('Cardholder', card.details?.cardholderName);
        add('Card Number', card.details?.cardNumber);
        add('Last 4', card.last4);
        add('Expiry', card.details?.expiryDate);
        add('CVV', card.details?.cvv);
      } else if (card.type === 'id' || card.type === 'license') {
        add('Full Name', card.details?.cardholderName);
        add(card.type === 'id' ? 'ID Number' : 'License Number', card.details?.idNumber);
        add('Date of Birth', card.details?.dob);
        add('Issue Date', card.details?.issueDate);
        add('Expiry Date', card.details?.expiryDate);
      } else if (card.type === 'insurance') {
        add('Provider', card.details?.provider);
        add('Policy Number', card.details?.policyNumber);
        add('Group Number', card.details?.groupNumber);
      } else {
        add('Notes', card.details?.notes);
      }
      return rows.join('');
    };

    const cardBlocks = allCards.map((card) => `
      <div class="card-block">
        <div class="card-header" style="background: ${gradientMap[card.type] || gradientMap.other};">
          <span class="card-type">${labelMap[card.type] || 'Card'}</span>
          <span class="card-title">${card.title}</span>
        </div>
        <div class="card-body">
          ${renderDetails(card)}
        </div>
      </div>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #F8F9FC;
          color: #1A1F36;
          padding: 32px 24px;
        }
        .header {
          text-align: center;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 2px solid #E2E6F0;
        }
        .header h1 {
          font-size: 26px;
          font-weight: 700;
          color: #6366f1;
          margin-bottom: 6px;
        }
        .header p {
          font-size: 12px;
          color: #8B96B4;
        }
        .warning {
          background: #FFF8E7;
          border: 1px solid #F5D06B;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 11px;
          color: #7A5C00;
          margin-bottom: 24px;
          text-align: center;
        }
        .card-block {
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid #E2E6F0;
        }
        .card-header {
          padding: 18px 20px;
          color: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .card-type {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.85;
        }
        .card-title {
          font-size: 16px;
          font-weight: 700;
        }
        .card-body {
          background: #fff;
          padding: 16px 20px;
        }
        .field {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #F0F2F8;
        }
        .field:last-child { border-bottom: none; }
        .label {
          font-size: 12px;
          color: #8B96B4;
          font-weight: 500;
        }
        .value {
          font-size: 13px;
          font-weight: 600;
          color: #1A1F36;
          text-align: right;
          max-width: 60%;
          word-break: break-all;
        }
        .footer {
          text-align: center;
          margin-top: 28px;
          padding-top: 16px;
          border-top: 2px solid #E2E6F0;
          font-size: 10px;
          color: #B0B8CC;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🛡️ CardVault Backup</h1>
        <p>Generated on ${now} · ${allCards.length} card${allCards.length !== 1 ? 's' : ''}</p>
      </div>
      <div class="warning">
        ⚠️ CONFIDENTIAL — This document contains sensitive card data. Store it securely and delete after use.
      </div>
      ${cardBlocks}
      <div class="footer">
        CardVault · Encrypted On-Device Storage · This backup was generated locally.
      </div>
    </body>
    </html>
    `;
  };

  const handleBackupCards = async () => {
    if (cards.length === 0) {
      showToast('No Cards', 'Add some cards to your vault before creating a backup.', 'info');
      return;
    }

    try {
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to export backup',
        disableDeviceFallback: false,
      });

      if (!authResult.success) {
        showToast('Auth Failed', 'Biometric authentication is required to export card data.', 'error');
        return;
      }

      showToast('Generating PDF', 'Preparing your secure backup...', 'info');

      const html = generateBackupHtml(cards);
      const { uri } = await Print.printToFileAsync({ html });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save CardVault Backup',
          UTI: 'com.adobe.pdf',
        });
        showToast('Backup Ready', `PDF with ${cards.length} card${cards.length !== 1 ? 's' : ''} is ready to save.`, 'success');
      } else {
        showToast('Sharing Unavailable', 'Your device does not support file sharing.', 'error');
      }
    } catch (error) {
      console.error('Backup error:', error);
      showToast('Backup Failed', 'Something went wrong while generating the PDF.', 'error');
    }
  };

  const handleAction = (label: string) => {
    switch (label) {
      case 'Add Card':
        setAddModalVisible(true);
        break;
      case 'Scan Card':
        showToast('Scan Card', 'Card scanning via camera will be available in a future update.', 'info');
        break;
      case 'Lock Vault':
        Alert.alert('Lock Vault', 'Are you sure you want to lock the vault?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Lock Now', style: 'destructive', onPress: lockVault },
        ]);
        break;
      case 'Backup Cards':
        handleBackupCards();
        break;
    }
  };

  const goToCards = () => {
    navigation.navigate('Cards');
  };

  const actionItems = [
    { label: 'Add Card', icon: 'add-circle-outline', color: colors.primary, bg: 'rgba(99, 102, 241, 0.1)' },
    { label: 'Scan Card', icon: 'qr-code-scanner', color: colors.accentGreen, bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Lock Vault', icon: 'lock', color: colors.accentRed, bg: 'rgba(239, 68, 68, 0.1)' },
    { label: 'Backup Cards', icon: 'cloud-upload', color: colors.accentPurple, bg: 'rgba(139, 92, 246, 0.1)' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#e8e6ff', '#f0eeff', '#fde8f0', '#fff0fa']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Top Bar */}
          <View style={styles.topRow}>
            <View style={styles.brandRow}>
              <View style={styles.logoBadge}>
                <MaterialIcons name="shield" size={18} color={colors.primary} />
              </View>
              <Text style={styles.brandTitle}>CardVault</Text>
            </View>
            <View style={styles.avatarRow}>
              <Pressable
                style={styles.iconButton}
                onPress={() => showToast('Notifications', 'No new notifications.', 'info')}
              >
                <MaterialIcons name="notifications" size={18} color={colors.primary} />
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>3</Text>
                </View>
              </Pressable>
              <Pressable style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
                <Text style={styles.avatarText}>{initials}</Text>
              </Pressable>
            </View>
          </View>

          {/* Hero Card */}
          <View style={styles.heroCard}>
            <LinearGradient
              colors={['#ede9fe', '#e0e7ff', '#fce7f3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroCopy}>
                <Text style={styles.heroGreeting}>Good morning, {firstName} 👋</Text>
                <Text style={styles.heroTitle}>Secure what matters. Access it anywhere.</Text>
                <Text style={styles.heroSubtitle}>All your cards in one safe and smart vault.</Text>
              </View>
              <View style={styles.heroIllustration}>
                <View style={styles.heroWallet}>
                  <MaterialIcons name="account-balance-wallet" size={40} color={colors.primary} />
                </View>
                <View style={styles.heroShield}>
                  <MaterialIcons name="verified-user" size={18} color={colors.accentPurple} />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Overview Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Pressable onPress={goToCards}>
              <Text style={styles.sectionLink}>View all cards →</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.overviewScroll}>
            {counts.map((item) => (
              <Pressable key={item.type} style={styles.overviewChip} onPress={goToCards}>
                <View style={[styles.overviewIcon, { backgroundColor: `${item.tone}15` }]}>
                  <MaterialIcons name={item.icon as any} size={16} color={item.tone} />
                </View>
                <Text style={styles.overviewCount}>{item.count}</Text>
                <Text style={styles.overviewLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* My Cards Section */}
          <View style={styles.glassyWrapper}>
            <View style={styles.glassyInner}>
              <View style={styles.glassyHeader}>
                <Text style={styles.sectionTitle}>My Cards</Text>
                <Pressable onPress={goToCards}>
                  <Text style={styles.sectionLink}>See all</Text>
                </Pressable>
              </View>

              <View style={styles.cardsPanel}>
                <View style={styles.cardStack}>
                  <CardSlider
                    cards={cards}
                    onAddCard={() => setAddModalVisible(true)}
                    onPressCard={(card) => {
                      setSelectedCard(card);
                      setViewModalVisible(true);
                    }}
                  />
                </View>
                <View style={styles.cardActions}>
                  {actionItems.map((item) => (
                    <Pressable
                      key={item.label}
                      style={({ pressed }) => [
                        styles.cardActionItem,
                        pressed && styles.actionPressed,
                      ]}
                      onPress={() => handleAction(item.label)}
                    >
                      <View style={[styles.cardActionIcon, { backgroundColor: item.bg }]}>
                        <MaterialIcons name={item.icon as any} size={18} color={item.color} />
                      </View>
                      <Text style={styles.cardActionText}>{item.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Pressable onPress={goToCards}>
              <Text style={styles.sectionLink}>View all</Text>
            </Pressable>
          </View>

          <View style={styles.activityPanel}>
            {recentActivity.length === 0 ? (
              <View style={styles.activityRow}>
                <View style={styles.activityIcon}>
                  <MaterialIcons name="info" size={16} color={colors.textMuted} />
                </View>
                <View style={styles.activityCopy}>
                  <Text style={styles.activityTitle}>No activity yet</Text>
                  <Text style={styles.activitySubtitle}>Add a card to see your activity here</Text>
                </View>
              </View>
            ) : (
              recentActivity.map((item, index) => (
                <Pressable
                  key={`${item.subtitle}-${index}`}
                  style={({ pressed }) => [
                    styles.activityRow,
                    pressed && { opacity: 0.7, backgroundColor: colors.primarySoft },
                  ]}
                  onPress={() => {
                    setSelectedCard(item.card);
                    setViewModalVisible(true);
                  }}
                >
                  <View style={styles.activityIcon}>
                    <MaterialIcons name={item.icon as any} size={16} color={colors.primary} />
                  </View>
                  <View style={styles.activityCopy}>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
                  </View>
                  <View style={styles.activityTrail}>
                    <Text style={styles.activityWhen}>{item.when}</Text>
                    <MaterialIcons name="chevron-right" size={16} color={colors.textMuted} />
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </ScrollView>
      </LinearGradient>

      <AddCardModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} />
      <ViewCardModal
        visible={viewModalVisible}
        card={selectedCard}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedCard(null);
        }}
      />
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
    padding: 20,
    paddingBottom: 120,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    fontFamily: 'DMSans',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSoft,
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#6366f1',
        shadowOpacity: 0.12,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  heroGradient: {
    padding: 18,
    flexDirection: 'row',
    gap: 16,
    borderRadius: 24,
  },
  heroCopy: {
    flex: 1.2,
  },
  heroGreeting: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'DMSans',
  },
  heroSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  heroIllustration: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroWallet: {
    width: 100,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  heroShield: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    position: 'absolute',
    right: 2,
    bottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  sectionHeader: {
    marginTop: 22,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'DMSans',
  },
  sectionLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  overviewScroll: {
    // backgroundColor: colors.background,
    gap: 10,
    paddingBottom: 4,
  },
  overviewChip: {
    width: 100,
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    // borderColor: colors.borderSoft,
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.28)',

    shadowColor: '#8B5CFF',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.10,
    shadowRadius: 30,

    elevation: 12,

    overflow: 'hidden',
  },
  overviewIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  overviewCount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    fontFamily: 'DMSans',
  },
  overviewLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  glassyWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 22,
    marginBottom: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...Platform.select({
      ios: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  glassyInner: {
    padding: 12,
  },
  glassyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardsPanel: {
    flexDirection: 'row',
    gap: 16,
  },
  cardStack: {
    flex: 1.5,
    overflow: 'visible',
  },
  cardActions: {
    flex: 1.0,
    gap: 6,
  },
  cardActionItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(134, 115, 115, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  actionPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  cardActionIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActionText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    flexShrink: 1,
    fontFamily: 'DMSans',
  },
  activityPanel: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: 16,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
  },
  activityIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCopy: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'DMSans',
  },
  activitySubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  activityWhen: {
    fontSize: 11,
    color: colors.textMuted,
  },
  activityTrail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
