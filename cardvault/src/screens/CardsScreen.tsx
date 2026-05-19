import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useVault } from '../vault/VaultContext';
import { useState, useMemo } from 'react';
import { CardType, VaultCard } from '../vault/types';
import AddCardModal from '../components/AddCardModal';
import ViewCardModal from '../components/ViewCardModal';

const filterChips: { label: string; type: CardType | 'all' }[] = [
  { label: 'All Cards', type: 'all' },
  { label: 'Payment', type: 'payment' },
  { label: 'ID Cards', type: 'id' },
  { label: 'Insurance', type: 'insurance' },
  { label: 'License', type: 'license' },
  { label: 'Other', type: 'other' },
];

type SortMode = 'recent' | 'name';

export default function CardsScreen() {
  const { data, deleteCard } = useVault();
  const cards = data?.cards ?? [];
  const [activeFilter, setActiveFilter] = useState<CardType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<VaultCard | null>(null);

  const filteredCards = useMemo(() => {
    let result = cards;

    // Filter by type
    if (activeFilter !== 'all') {
      result = result.filter((c) => c.type === activeFilter);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.subtitle.toLowerCase().includes(q) ||
          (c.last4 && c.last4.includes(q)),
      );
    }

    // Sort
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
      { label: 'Total Cards', value: cards.length.toString() },
      { label: 'Payment', value: cards.filter((c) => c.type === 'payment').length.toString() },
      { label: 'ID Cards', value: cards.filter((c) => c.type === 'id').length.toString() },
      { label: 'Insurance', value: cards.filter((c) => c.type === 'insurance').length.toString() },
      { label: 'License', value: cards.filter((c) => c.type === 'license').length.toString() },
    ];
  }, [cards]);

  const toggleSort = () => {
    setSortMode((prev) => (prev === 'recent' ? 'name' : 'recent'));
  };

  const iconForType = (type: CardType): string => {
    switch (type) {
      case 'payment': return 'credit-card';
      case 'id': return 'badge';
      case 'insurance': return 'health-and-safety';
      case 'license': return 'directions-car';
      default: return 'apps';
    }
  };

  const handleDeleteCard = (id: string, title: string) => {
    Alert.alert('Delete Card', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteCard(id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>My Cards</Text>
                <Text style={styles.subtitle}>Manage and organize all your cards in one place.</Text>
              </View>
              <Pressable style={styles.addButtonTop} onPress={() => setAddModalVisible(true)}>
                <MaterialIcons name="add" size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchInput}>
                <MaterialIcons name="search" size={16} color={colors.textMuted} />
                <TextInput
                  style={styles.searchTextInput}
                  placeholder="Search cards"
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 ? (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <MaterialIcons name="close" size={16} color={colors.textMuted} />
                  </Pressable>
                ) : null}
              </View>
              <Pressable
                style={styles.filterButton}
                onPress={toggleSort}
              >
                <MaterialIcons name="tune" size={16} color={colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.chipRow}>
              {filterChips.map((chip) => (
                <Pressable
                  key={chip.type}
                  style={[styles.chip, activeFilter === chip.type ? styles.chipActive : null]}
                  onPress={() => setActiveFilter(chip.type)}
                >
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
            </View>

            <View style={styles.summaryRow}>
              {summaryData.map((item) => (
                <LinearGradient
                  key={item.label}
                  colors={['#FFFFFF', '#F3F5FF']}
                  style={styles.summaryCard}
                >
                  <View style={styles.summaryIcon}>
                    <MaterialIcons name="dashboard" size={14} color={colors.primary} />
                  </View>
                  <Text style={styles.summaryValue}>{item.value}</Text>
                  <Text style={styles.summaryLabel}>{item.label}</Text>
                </LinearGradient>
              ))}
            </View>

            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>
                {activeFilter === 'all' ? 'All Cards' : filterChips.find((c) => c.type === activeFilter)?.label ?? 'Cards'}{' '}
                ({filteredCards.length})
              </Text>
              <Pressable onPress={toggleSort}>
                <Text style={styles.sectionLink}>
                  Sort by: {sortMode === 'recent' ? 'Recent' : 'Name'}
                </Text>
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
            <View style={styles.rowIcon}>
              <MaterialIcons name={iconForType(item.type) as any} size={18} color={colors.primary} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.cardMeta}>{item.last4 ? `•••• ${item.last4}` : item.type}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="inbox" size={40} color={colors.textMuted} />
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
            <View>
              <Text style={styles.cardTitle}>Add a new card</Text>
              <Text style={styles.cardSubtitle}>Store any card securely in your vault</Text>
            </View>
          </Pressable>
        }
      />

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
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    maxWidth: 240,
  },
  addButtonTop: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    padding: 0,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    paddingHorizontal: 20,
    paddingTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  summaryRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    width: '30%',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  sectionLink: {
    fontSize: 12,
    color: colors.primary,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 12,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowPressed: {
    opacity: 0.8,
  },
  rowIcon: {
    width: 44,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#E8ECFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: colors.textMuted,
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
    marginTop: 10,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  addCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
