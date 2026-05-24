import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useVault } from '../vault/VaultContext';
import { useState, useMemo } from 'react';
import { CardType, VaultCard } from '../vault/types';
import AddCardModal from '../components/AddCardModal';
import ViewCardModal from '../components/ViewCardModal';

const filterChips: { label: string; type: CardType | 'all'; icon: string }[] = [
  { label: 'All Cards', type: 'all', icon: 'apps' },
  { label: 'Payment', type: 'payment', icon: 'credit-card' },
  { label: 'ID Cards', type: 'id', icon: 'portrait' },
  { label: 'Insurance', type: 'insurance', icon: 'healing' },
  { label: '... More', type: 'other', icon: 'more-horiz' },
];

type SortMode = 'recent' | 'name';

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

const getTagLabel = (type: CardType): string => {
  switch (type) {
    case 'payment': return 'Payment Card';
    case 'id': return 'ID Card';
    case 'insurance': return 'Insurance';
    case 'license': return 'License';
    default: return 'Other';
  }
};

const getTagBgColor = (type: CardType): string => {
  switch (type) {
    case 'payment': return 'rgba(99, 102, 241, 0.12)';
    case 'id': return 'rgba(139, 92, 246, 0.12)';
    case 'insurance': return 'rgba(16, 185, 129, 0.12)';
    case 'license': return 'rgba(245, 158, 11, 0.12)';
    default: return 'rgba(107, 114, 128, 0.12)';
  }
};

const getTagTextColor = (type: CardType): string => {
  switch (type) {
    case 'payment': return '#6366f1';
    case 'id': return '#8b5cf6';
    case 'insurance': return '#10b981';
    case 'license': return '#f59e0b';
    default: return '#6b7280';
  }
};

export default function CardsScreen() {
  const { data, deleteCard, showToast } = useVault();
  const cards = data?.cards ?? [];
  const navigation = useNavigation<any>();
  const profile = data?.profile;
  
  const [activeFilter, setActiveFilter] = useState<CardType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<VaultCard | null>(null);

  const initials = useMemo(() => {
    const name = profile?.name || 'JD';
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }, [profile?.name]);

  const filteredCards = useMemo(() => {
    let result = cards;

    if (activeFilter !== 'all') {
      if (activeFilter === 'other') {
        result = result.filter((c) => c.type === 'other' || c.type === 'license');
      } else {
        result = result.filter((c) => c.type === activeFilter);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.subtitle.toLowerCase().includes(q) ||
          (c.last4 && c.last4.includes(q)) ||
          (c.details?.cardholderName && c.details.cardholderName.toLowerCase().includes(q)),
      );
    }

    if (sortMode === 'recent') {
      result = [...result].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    } else {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [cards, activeFilter, searchQuery, sortMode]);

  const summaryData = useMemo(() => {
    return [
      { label: 'Total', value: cards.length.toString(), icon: 'credit-card', color: colors.primary, bgColor: 'rgba(99, 102, 241, 0.1)', filter: 'all' as const },
      { label: 'Insurance', value: cards.filter((c) => c.type === 'insurance').length.toString(), icon: 'healing', color: colors.accentGreen, bgColor: 'rgba(16, 185, 129, 0.1)', filter: 'insurance' as const },
      { label: 'ID', value: cards.filter((c) => c.type === 'id').length.toString(), icon: 'portrait', color: colors.accentPurple, bgColor: 'rgba(139, 92, 246, 0.1)', filter: 'id' as const },
      { label: 'License', value: cards.filter((c) => c.type === 'license').length.toString(), icon: 'directions-car', color: colors.accentOrange, bgColor: 'rgba(245, 158, 11, 0.1)', filter: 'other' as const },
      { label: 'Others', value: cards.filter((c) => c.type === 'other').length.toString(), icon: 'apps', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)', filter: 'other' as const },
    ];
  }, [cards]);

  const toggleSort = () => {
    setSortMode((prev) => (prev === 'recent' ? 'name' : 'recent'));
  };

  const handleDeleteCard = (id: string, title: string) => {
    Alert.alert('Delete Card', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteCard(id);
          showToast('Card Deleted', `"${title}" has been removed from your vault.`, 'info');
        },
      },
    ]);
  };

  const renderCardLogo = (item: VaultCard) => {
    const titleLower = item.title.toLowerCase();
    
    if (item.type === 'payment') {
      let cardBg = ['#0F245B', '#243C8B'] as [string, string];
      let brandName = 'VISA';
      let fontStyle: 'italic' | 'normal' = 'italic';
      let isAxis = false;
      
      if (titleLower.includes('axis')) {
        cardBg = ['#5B1032', '#7A1643'];
        brandName = 'AXIS BANK';
        fontStyle = 'normal';
        isAxis = true;
      } else if (titleLower.includes('hdfc')) {
        cardBg = ['#0A2540', '#1C3D5A'];
        brandName = 'HDFC BANK';
        fontStyle = 'normal';
      } else if (titleLower.includes('mastercard') || titleLower.includes('master')) {
        cardBg = ['#FF5F00', '#EB001B'];
        brandName = 'mastercard';
        fontStyle = 'normal';
      }
      
      if (isAxis) {
        return (
          <LinearGradient
            colors={cardBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoPaymentCard}
          >
            <View style={styles.axisContainer}>
              <Text style={styles.axisTriangle}>▲</Text>
              <Text style={styles.logoPaymentText}>AXIS BANK</Text>
            </View>
          </LinearGradient>
        );
      }
      
      return (
        <LinearGradient
          colors={cardBg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoPaymentCard}
        >
          <Text style={[styles.logoPaymentText, { fontStyle, fontSize: brandName === 'VISA' ? 9 : 5 }]}>{brandName}</Text>
        </LinearGradient>
      );
    }
    
    if (item.type === 'insurance') {
      return (
        <View style={styles.logoInsurance}>
          <View style={styles.logoInsuranceCircle}>
            <MaterialIcons name="add" size={7} color="#FFFFFF" />
          </View>
          <View style={styles.insuranceRight}>
            <View style={styles.insuranceLogoTextContainer}>
              <Text style={styles.logoStarHealthText1}>star health</Text>
              <Text style={styles.logoStarHealthText2}>INSURANCE</Text>
            </View>
          </View>
        </View>
      );
    }
    
    if (item.type === 'id') {
      return (
        <LinearGradient
          colors={['#ede9fe', '#c7d2fe']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoIDCard}
        >
          <MaterialIcons name="menu-book" size={16} color="#7C3AED" />
        </LinearGradient>
      );
    }
    
    if (item.type === 'license') {
      return (
        <LinearGradient
          colors={['#BFDBFE', '#93C5FD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoLicenseCard}
        >
          <View style={styles.licensePhotoBox} />
          <View style={styles.licenseLines}>
            <View style={styles.licenseLine} />
            <View style={styles.licenseLineShort} />
            <View style={styles.licenseLine} />
          </View>
        </LinearGradient>
      );
    }
    
    return (
      <View style={[styles.logoDefaultCard, { backgroundColor: colors.primarySoft }]}>
        <MaterialIcons name="apps" size={16} color={colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#e8e6ff', '#f0eeff', '#fde8f0', '#fff0fa']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.gradient}
      >
        <FlatList
          ListHeaderComponent={
            <View>
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
                    {profile?.photoUri ? (
                      <Image source={{ uri: profile.photoUri }} style={styles.avatarImage} />
                    ) : (
                      <View style={[styles.avatarImage, { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={styles.avatarText}>{initials}</Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Title Section */}
              <View style={styles.header}>
                <Text style={styles.title}>My Cards</Text>
                <Text style={styles.subtitle}>Manage and organize all your cards in one place.</Text>
              </View>

              {/* Search Row */}
              <View style={styles.searchRow}>
                <View style={styles.searchInput}>
                  <MaterialIcons name="search" size={18} color={colors.textMuted} />
                  <TextInput
                    style={styles.searchTextInput}
                    placeholder="Search cards"
                    placeholderTextColor={colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                  {searchQuery.length > 0 ? (
                    <Pressable onPress={() => setSearchQuery('')}>
                      <MaterialIcons name="close" size={16} color={colors.textMuted} />
                    </Pressable>
                  ) : null}
                </View>
                <Pressable style={styles.filterButton} onPress={toggleSort}>
                  <MaterialIcons name="filter-alt" size={18} color={colors.textMuted} />
                </Pressable>
              </View>

              {/* Filter Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
              >
                {filterChips.map((chip) => (
                  <Pressable
                    key={chip.type}
                    style={[
                      styles.chip,
                      activeFilter === chip.type ? styles.chipActive : null,
                    ]}
                    onPress={() => setActiveFilter(chip.type)}
                  >
                    <MaterialIcons
                      name={chip.icon as any}
                      size={13}
                      color={activeFilter === chip.type ? colors.primary : '#8B96B4'}
                      style={styles.chipIcon}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        activeFilter === chip.type ? styles.chipTextActive : null,
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Stats Strip */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.summaryRow}
              >
                {summaryData.map((item) => (
                  <Pressable
                    key={item.label}
                    style={styles.summaryCard}
                    onPress={() => setActiveFilter(item.filter)}
                  >
                    <View style={[styles.summaryIcon, { backgroundColor: item.bgColor }]}>
                      <MaterialIcons name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={styles.summaryValue}>{item.value}</Text>
                    <Text style={styles.summaryLabel} numberOfLines={1}>{item.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Card List Header */}
              <View style={styles.listHeader}>
                <Text style={styles.sectionTitle}>
                  {activeFilter === 'all' ? 'All Cards' : filterChips.find((c) => c.type === activeFilter)?.label ?? 'Cards'}{' '}
                  ({filteredCards.length})
                </Text>
                <Pressable onPress={toggleSort} style={styles.sortToggleRow}>
                  <Text style={styles.sortLabel}>
                    Sort by:{' '}
                    <Text style={styles.sortValue}>
                      {sortMode === 'recent' ? 'Recent' : 'Name'}
                    </Text>
                  </Text>
                  <MaterialIcons name="keyboard-arrow-down" size={16} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          }
          data={filteredCards}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => setSelectedCard(item)}
              onLongPress={() => handleDeleteCard(item.id, item.title)}
            >
              {renderCardLogo(item)}
              
              <View style={styles.rowCopy}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                
                <View style={styles.cardSubtitleRow}>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    {item.type === 'payment' ? `•••• ${item.last4 || '••••'}` : item.subtitle}
                  </Text>
                  <View style={[styles.typeTag, { backgroundColor: getTagBgColor(item.type) }]}>
                    <Text style={[styles.typeTagText, { color: getTagTextColor(item.type) }]}>
                      {getTagLabel(item.type)}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.rowRight}>
                <Text style={styles.cardMeta}>{timeAgo(item.updatedAt)}</Text>
                <MaterialIcons name="chevron-right" size={18} color={colors.textMuted} />
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="inbox" size={44} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No cards found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try a different search term' : 'Add your first card to get started'}
              </Text>
            </View>
          }
          ListFooterComponent={
            <Pressable
              style={({ pressed }) => [styles.addCardRow, pressed && styles.rowPressed]}
              onPress={() => setAddModalVisible(true)}
            >
              <View style={styles.addCardIcon}>
                <MaterialIcons name="add" size={20} color={colors.primary} />
              </View>
              <View style={styles.addCardCopy}>
                <Text style={styles.cardTitle}>Add a new card</Text>
                <Text style={styles.cardSubtitle}>Store any card securely in your vault</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={colors.textMuted} style={styles.addCardChevron} />
            </Pressable>
          }
        />
      </LinearGradient>

      <AddCardModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} />
      <ViewCardModal visible={!!selectedCard} card={selectedCard} onClose={() => setSelectedCard(null)} />
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    marginBottom: 10,
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
    gap: 12,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.borderSoft,
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
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'DMSans',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  searchRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 20,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  chipRow: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  chipIcon: {
    marginRight: 4,
  },
  chipText: {
    fontSize: 11,
    color: '#8B96B4',
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  summaryRow: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    gap: 10,
  },
  summaryCard: {
    width: 92,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    fontFamily: 'DMSans',
  },
  summaryLabel: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'DMSans',
  },
  sortLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  sortValue: {
    color: colors.primary,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 130,
    gap: 12,
  },
  row: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  rowPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  rowCopy: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'DMSans',
  },
  cardSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  typeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTagText: {
    fontSize: 9,
    fontWeight: '700',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardMeta: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  addCardRow: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardCopy: {
    flex: 1,
  },
  addCardChevron: {
    marginLeft: 'auto',
  },
  
  // Card logos
  logoPaymentCard: {
    width: 52,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOpacity: 0.15,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1.5 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoPaymentText: {
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.2,
    color: '#FFFFFF',
  },
  axisContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  axisTriangle: {
    color: '#FFFFFF',
    fontSize: 6,
    fontWeight: '900',
  },
  logoInsurance: {
    width: 52,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECFDF5',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 4,
    gap: 3,
  },
  logoInsuranceCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insuranceRight: {
    flex: 1,
    justifyContent: 'center',
  },
  insuranceLogoTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  logoStarHealthText1: {
    fontSize: 5,
    fontWeight: '900',
    color: '#137333',
    lineHeight: 5,
  },
  logoStarHealthText2: {
    fontSize: 3,
    fontWeight: '700',
    color: '#6B7280',
    lineHeight: 3,
    marginTop: 0.5,
  },
  logoIDCard: {
    width: 52,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLicenseCard: {
    width: 52,
    height: 34,
    borderRadius: 10,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  licensePhotoBox: {
    width: 12,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  licenseLines: {
    flex: 1,
    gap: 2.5,
  },
  licenseLine: {
    height: 1.5,
    backgroundColor: '#94A3B8',
    borderRadius: 0.5,
    width: '90%',
  },
  licenseLineShort: {
    height: 1.5,
    backgroundColor: '#94A3B8',
    borderRadius: 0.5,
    width: '60%',
  },
  logoDefaultCard: {
    width: 52,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
