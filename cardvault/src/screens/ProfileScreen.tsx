import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { useVault } from '../vault/VaultContext';
import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';

const settings = [
  { title: 'Personal Information', subtitle: 'Update your personal details', icon: 'person' },
  { title: 'Email & Notifications', subtitle: 'Manage your email preferences', icon: 'email' },
  { title: 'Security Settings', subtitle: 'Manage password and security', icon: 'security' },
  { title: 'Language', subtitle: 'Choose your preferred language', icon: 'language' },
] as const;

const more = [
  { title: 'Help Center', subtitle: 'Get help and support', icon: 'help' },
  { title: 'Terms & Privacy', subtitle: 'Read our policies', icon: 'description' },
  { title: 'Log Out', subtitle: 'Lock your vault and sign out', icon: 'logout' },
] as const;

export default function ProfileScreen() {
  const { lockVault, data } = useVault();
  const navigation = useNavigation<any>();
  const cards = data?.cards ?? [];

  const overview = useMemo(() => {
    const types = new Set(cards.map((c) => c.type));
    return [
      { label: 'Total Cards', value: cards.length.toString() },
      { label: 'Categories', value: types.size.toString() },
      { label: 'Security Score', value: '100%' },
      { label: 'Vault Status', value: 'Active' },
    ];
  }, [cards]);

  const handleLogout = () => {
    Alert.alert('Log Out', 'This will lock your vault. You\'ll need biometric authentication to unlock it again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: lockVault },
    ]);
  };

  const handleSettingPress = (title: string) => {
    switch (title) {
      case 'Personal Information':
        Alert.alert('Personal Information', 'Profile editing will be available in a future update. Your data is stored securely on-device.');
        break;
      case 'Email & Notifications':
        Alert.alert('Notifications', 'Notification preferences will be available in a future update.');
        break;
      case 'Security Settings':
        navigation.navigate('Security');
        break;
      case 'Language':
        Alert.alert('Language', 'Currently set to English. Multi-language support coming soon.');
        break;
      default:
        break;
    }
  };

  const handleMorePress = (title: string) => {
    switch (title) {
      case 'Help Center':
        Alert.alert('Help Center', 'For support, contact us at support@cardvault.app\n\nFAQ:\n• Your data never leaves your device\n• Recovery words are your only backup\n• Biometrics protect vault access');
        break;
      case 'Terms & Privacy':
        Alert.alert('Terms & Privacy', 'CardVault stores all data locally on your device with AES-256 encryption. We never collect, transmit, or store your personal information on any server.');
        break;
      case 'Log Out':
        handleLogout();
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={24} color={colors.primary} />
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@email.com</Text>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>Premium User</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
            onPress={() => Alert.alert('Edit Profile', 'Profile editing will be available in a future update.')}
          >
            <MaterialIcons name="edit" size={14} color={colors.textMuted} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account Overview</Text>
            <Pressable onPress={() => navigation.navigate('Cards')}>
              <Text style={styles.sectionLink}>View all</Text>
            </Pressable>
          </View>
          <View style={styles.overviewGrid}>
            {overview.map((item) => (
              <View key={item.label} style={styles.overviewCard}>
                <View style={styles.overviewIcon}>
                  <MaterialIcons name="insights" size={14} color={colors.primary} />
                </View>
                <Text style={styles.overviewValue}>{item.value}</Text>
                <Text style={styles.overviewLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Profile Settings</Text>
        <View style={styles.listPanel}>
          {settings.map((item) => (
            <Pressable
              key={item.title}
              style={({ pressed }) => [styles.listItem, pressed && styles.pressed]}
              onPress={() => handleSettingPress(item.title)}
            >
              <View style={styles.listIcon}>
                <MaterialIcons name={item.icon} size={18} color={colors.primary} />
              </View>
              <View style={styles.listCopy}>
                <Text style={styles.listTitle}>{item.title}</Text>
                <Text style={styles.listSubtitle}>{item.subtitle}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>More</Text>
        <View style={styles.listPanel}>
          {more.map((item) => (
            <Pressable
              key={item.title}
              style={({ pressed }) => [
                styles.listItem,
                pressed && styles.pressed,
                item.title === 'Log Out' && styles.logoutItem,
              ]}
              onPress={() => handleMorePress(item.title)}
            >
              <View style={[styles.listIcon, item.title === 'Log Out' && styles.logoutIcon]}>
                <MaterialIcons
                  name={item.icon}
                  size={18}
                  color={item.title === 'Log Out' ? colors.danger : colors.primary}
                />
              </View>
              <View style={styles.listCopy}>
                <Text style={[styles.listTitle, item.title === 'Log Out' && styles.logoutText]}>
                  {item.title}
                </Text>
                <Text style={styles.listSubtitle}>{item.subtitle}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <PrimaryButton title="Log out" onPress={handleLogout} variant="ghost" />
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DDE3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCopy: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  profileEmail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  profileBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  profileBadgeText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editButtonText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  sectionLink: {
    fontSize: 12,
    color: colors.primary,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
    width: '47%',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    padding: 12,
  },
  overviewIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  overviewLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
  },
  listPanel: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
  },
  logoutItem: {
    backgroundColor: '#FEF2F2',
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    backgroundColor: '#FEE2E2',
  },
  listCopy: {
    flex: 1,
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  logoutText: {
    color: colors.danger,
  },
  listSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  listChevron: {
    fontSize: 18,
    color: colors.textMuted,
  },
});
