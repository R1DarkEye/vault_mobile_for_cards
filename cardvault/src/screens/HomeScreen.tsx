import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useVault } from '../vault/VaultContext';
import { useMemo, useState } from 'react';
import AddCardModal from '../components/AddCardModal';

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
  const { data, lockVault } = useVault();
  const navigation = useNavigation<any>();
  const cards = data?.cards ?? [];
  const [addModalVisible, setAddModalVisible] = useState(false);

  const counts = overviewCards.map((item) => ({
    ...item,
    count: cards.filter((card) => card.type === item.type).length,
  }));

  const recentActivity = useMemo(() => {
    return [...cards]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map((card) => ({
        title: `${card.type === 'payment' ? 'Payment Card' : card.type === 'id' ? 'ID Card' : card.type === 'insurance' ? 'Insurance' : card.type === 'license' ? 'License' : 'Card'} added`,
        subtitle: `${card.title}${card.last4 ? ` •••• ${card.last4}` : ''}`,
        when: timeAgo(card.updatedAt),
        icon: card.type === 'payment' ? 'credit-card' : card.type === 'id' ? 'badge' : card.type === 'insurance' ? 'health-and-safety' : card.type === 'license' ? 'directions-car' : 'apps',
      }));
  }, [cards]);

  const firstPaymentCard = cards.find((c) => c.type === 'payment');

  const handleAction = (label: string) => {
    switch (label) {
      case 'Add Card':
        setAddModalVisible(true);
        break;
      case 'Scan Card':
        Alert.alert('Scan Card', 'Card scanning via camera will be available in a future update.');
        break;
      case 'Lock Vault':
        Alert.alert('Lock Vault', 'Are you sure you want to lock the vault?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Lock Now', style: 'destructive', onPress: lockVault },
        ]);
        break;
      case 'Backup Cards':
        Alert.alert('Backup', 'Cloud backup will be available in a future update. Your data is stored securely on-device.');
        break;
    }
  };

  const goToCards = () => {
    navigation.navigate('Cards');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <MaterialIcons name="lock" size={18} color={colors.primary} />
            </View>
            <Text style={styles.brandTitle}>CardVault</Text>
          </View>
          <View style={styles.avatarRow}>
            <Pressable
              style={styles.iconButton}
              onPress={() => Alert.alert('Notifications', 'No new notifications.')}
            >
              <MaterialIcons name="notifications" size={18} color={colors.primary} />
            </Pressable>
            <Pressable style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
              <MaterialIcons name="person" size={18} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <LinearGradient
          colors={['#EEF2FF', '#F1E7FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroCopy}>
            <Text style={styles.heroGreeting}>Good morning, John</Text>
            <Text style={styles.heroTitle}>Secure what matters. Access it anywhere.</Text>
            <Text style={styles.heroSubtitle}>All your cards in one safe and smart vault.</Text>
          </View>
          <View style={styles.heroIllustration}>
            <View style={styles.heroWallet}>
              <MaterialIcons name="account-balance-wallet" size={44} color={colors.primary} />
            </View>
            <View style={styles.heroShield}>
              <MaterialIcons name="verified-user" size={20} color={colors.accentPurple} />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Pressable onPress={goToCards}>
            <Text style={styles.sectionLink}>View all cards →</Text>
          </Pressable>
        </View>

        <View style={styles.overviewGrid}>
          {counts.map((item) => (
            <Pressable key={item.type} style={styles.overviewCard} onPress={goToCards}>
              <View style={[styles.overviewIcon, { backgroundColor: `${item.tone}1A` }]}>
                <MaterialIcons name={item.icon} size={18} color={item.tone} />
              </View>
              <Text style={styles.overviewCount}>{item.count}</Text>
              <Text style={styles.overviewLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Cards</Text>
          <Pressable onPress={goToCards}>
            <Text style={styles.sectionLink}>See all</Text>
          </Pressable>
        </View>

        <View style={styles.cardsPanel}>
          <View style={styles.cardStack}>
            <LinearGradient
              colors={['#0F245B', '#243C8B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardPrimary}
            >
              <Text style={styles.cardBrand}>VISA</Text>
              <Text style={styles.cardNumber}>
                •••• {firstPaymentCard?.last4 ?? '----'}
              </Text>
              <Text style={styles.cardHolder}>John Doe</Text>
              <Text style={styles.cardMeta}>
                {firstPaymentCard?.title ?? 'No payment card yet'}
              </Text>
            </LinearGradient>
            <View style={styles.cardStackShadow} />
          </View>
          <View style={styles.cardActions}>
            {[
              { label: 'Add Card', icon: 'add-circle-outline', color: colors.primary },
              { label: 'Scan Card', icon: 'qr-code-scanner', color: colors.accentGreen },
              { label: 'Lock Vault', icon: 'lock', color: colors.accentPurple },
              { label: 'Backup Cards', icon: 'cloud-upload', color: colors.accentBlue },
            ].map((item) => (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  styles.cardActionItem,
                  pressed && styles.actionPressed,
                ]}
                onPress={() => handleAction(item.label)}
              >
                <View style={[styles.cardActionIcon, { backgroundColor: `${item.color}1A` }]}>
                  <MaterialIcons name={item.icon as any} size={16} color={item.color} />
                </View>
                <Text style={styles.cardActionText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

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
              <View key={`${item.subtitle}-${index}`} style={styles.activityRow}>
                <View style={styles.activityIcon}>
                  <MaterialIcons name={item.icon as any} size={16} color={colors.primary} />
                </View>
                <View style={styles.activityCopy}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.activityWhen}>{item.when}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <AddCardModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} />
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
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: '700',
    color: colors.primary,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconDot: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCE3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    gap: 16,
  },
  heroCopy: {
    flex: 1.2,
  },
  heroGreeting: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
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
    width: 110,
    height: 90,
    borderRadius: 20,
    backgroundColor: '#DDE2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroShield: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8ECFF',
    position: 'absolute',
    right: 6,
    bottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  sectionLink: {
    fontSize: 13,
    color: colors.primary,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
    width: '30%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overviewIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  overviewCount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 10,
  },
  overviewLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  cardsPanel: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    gap: 16,
  },
  cardStack: {
    flex: 1.1,
  },
  cardPrimary: {
    height: 140,
    borderRadius: 20,
    padding: 16,
  },
  cardBrand: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'right',
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    letterSpacing: 1,
    marginTop: 24,
  },
  cardHolder: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 12,
  },
  cardMeta: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 4,
  },
  cardStackShadow: {
    width: 140,
    height: 140,
    borderRadius: 20,
    backgroundColor: '#D6DCFF',
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: -1,
  },
  cardActions: {
    flex: 0.9,
    gap: 10,
  },
  cardActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    padding: 10,
  },
  actionPressed: {
    opacity: 0.7,
  },
  cardActionIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActionText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  activityPanel: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
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
});
