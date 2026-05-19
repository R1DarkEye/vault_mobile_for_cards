import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { useVault } from '../vault/VaultContext';

const categories = [
  { type: 'payment', label: 'Payment Cards' },
  { type: 'id', label: 'ID Cards' },
  { type: 'insurance', label: 'Insurance' },
  { type: 'license', label: 'License' },
  { type: 'other', label: 'Others' },
] as const;

export default function HomeScreen() {
  const { data } = useVault();
  const cards = data?.cards ?? [];

  const counts = categories.map((category) => {
    const count = cards.filter((card) => card.type === category.type).length;
    return { ...category, count };
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Good morning</Text>
      <Text style={styles.headline}>Secure what matters. Access it anywhere.</Text>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Overview</Text>
        <View style={styles.grid}>
          {counts.map((item) => (
            <View key={item.type} style={styles.card}>
              <Text style={styles.cardCount}>{item.count}</Text>
              <Text style={styles.cardLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
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
  header: {
    fontSize: 16,
    color: colors.textMuted,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 6,
  },
  panel: {
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.chip,
  },
  cardCount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  cardLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
});
