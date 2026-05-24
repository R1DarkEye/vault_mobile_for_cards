import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { useVault } from '../vault/VaultContext';
import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import EditProfileModal from '../components/EditProfileModal';

const settings = [
  { title: 'Personal Information', subtitle: 'Update your personal details', icon: 'person', iconColor: colors.primary, iconBg: colors.primarySoft },
  { title: 'Email & Notifications', subtitle: 'Manage your email preferences', icon: 'email', iconColor: colors.accentGreen, iconBg: '#ECFDF5' },
  { title: 'Security Settings', subtitle: 'Manage password and security', icon: 'security', iconColor: colors.accentOrange, iconBg: '#FEF3C7' },
  { title: 'Language', subtitle: 'Choose your preferred language', icon: 'language', iconColor: colors.accentPurple, iconBg: '#F5F3FF' },
] as const;

const more = [
  { title: 'Help Center', subtitle: 'Get help and support', icon: 'help', iconColor: colors.info, iconBg: '#EFF6FF' },
  { title: 'Terms & Privacy', subtitle: 'Read our policies', icon: 'description', iconColor: colors.textMuted, iconBg: '#F3F4F6' },
  { title: 'Log Out', subtitle: 'Lock your vault and sign out', icon: 'logout', iconColor: colors.danger, iconBg: '#FEE2E2' },
] as const;

export default function ProfileScreen() {
  const { lockVault, data, updateProfile, showToast } = useVault();
  const navigation = useNavigation<any>();
  const cards = data?.cards ?? [];
  const profile = data?.profile ?? { name: 'Vault User', email: '', phone: '' };
  const [editModalVisible, setEditModalVisible] = useState(false);

  const overview = useMemo(() => {
    const types = new Set(cards.map((c) => c.type));
    return [
      { label: 'Total Cards', value: cards.length.toString(), icon: 'credit-card' as const, color: colors.primary, bgColor: 'rgba(99, 102, 241, 0.1)' },
      { label: 'Categories', value: types.size.toString(), icon: 'category' as const, color: colors.accentPurple, bgColor: 'rgba(139, 92, 246, 0.1)' },
      { label: 'Security', value: '100%', icon: 'verified-user' as const, color: colors.accentGreen, bgColor: 'rgba(16, 185, 129, 0.1)' },
      { label: 'Status', value: 'Active', icon: 'check-circle' as const, color: colors.accentOrange, bgColor: 'rgba(245, 158, 11, 0.1)' },
    ];
  }, [cards]);

  const initials = useMemo(() => {
    const name = profile.name || 'Vault User';
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [profile.name]);

  const handleLogout = () => {
    Alert.alert('Log Out', 'This will lock your vault. You\'ll need biometric authentication to unlock it again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: lockVault },
    ]);
  };

  const handleSettingPress = (title: string) => {
    switch (title) {
      case 'Personal Information':
        setEditModalVisible(true);
        break;
      case 'Email & Notifications':
        showToast('Notifications', 'Notification preferences will be available in a future update.', 'info');
        break;
      case 'Security Settings':
        navigation.navigate('Security');
        break;
      case 'Language':
        showToast('Language', 'Currently set to English. Multi-language support coming soon.', 'info');
        break;
      default:
        break;
    }
  };

  const handleMorePress = (title: string) => {
    switch (title) {
      case 'Help Center':
        showToast('Help Center', 'Support: support@cardvault.app\nFAQ: Data is 100% sandboxed locally.', 'info');
        break;
      case 'Terms & Privacy':
        showToast('Terms & Privacy', 'All data is stored locally with AES-256 encryption. We collect zero user data.', 'info');
        break;
      case 'Log Out':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const handleProfileSave = async (newData: { name: string; email: string; phone: string }) => {
    try {
      await updateProfile(newData);
      showToast('Profile Updated', `Your profile has been updated successfully.`, 'success');
    } catch {
      showToast('Error', `Failed to update profile.`, 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={colors.gradientStops}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.profileCopy}>
                <Text style={styles.profileName}>{profile.name}</Text>
                {profile.email ? <Text style={styles.profileEmail}>{profile.email}</Text> : null}
                {profile.phone ? <Text style={styles.profileEmail}>{profile.phone}</Text> : null}
              </View>
              <Pressable
                style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
                onPress={() => setEditModalVisible(true)}
              >
                <MaterialIcons name="edit" size={14} color={colors.primary} />
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
            </View>
            <View style={styles.profileBadgeRow}>
              <View style={styles.profileBadge}>
                <MaterialIcons name="star" size={10} color="#D97706" />
                <Text style={styles.profileBadgeText}>Premium User</Text>
              </View>
              <View style={styles.profileBadgeSecondary}>
                <MaterialIcons name="verified-user" size={10} color="#059669" />
                <Text style={styles.profileBadgeTextSecondary}>Vault Active</Text>
              </View>
            </View>
          </View>

          {/* Overview Grid */}
          <View style={styles.panel}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Account Overview</Text>
              <Pressable onPress={() => navigation.navigate('Cards')}>
                <Text style={styles.sectionLink}>View all →</Text>
              </Pressable>
            </View>
            <View style={styles.overviewGrid}>
              {overview.map((item) => (
                <View key={item.label} style={styles.overviewCard}>
                  <View style={[styles.overviewIcon, { backgroundColor: item.bgColor }]}>
                    <MaterialIcons name={item.icon} size={16} color={item.color} />
                  </View>
                  <Text style={styles.overviewValue}>{item.value}</Text>
                  <Text style={styles.overviewLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Profile Settings */}
          <Text style={styles.sectionTitleStandalone}>Profile Settings</Text>
          <View style={styles.listPanel}>
            {settings.map((item, index) => (
              <Pressable
                key={item.title}
                style={({ pressed }) => [
                  styles.listItem,
                  pressed && styles.pressed,
                  index < settings.length - 1 && styles.listItemBorder,
                ]}
                onPress={() => handleSettingPress(item.title)}
              >
                <View style={[styles.listIcon, { backgroundColor: item.iconBg }]}>
                  <MaterialIcons name={item.icon} size={18} color={item.iconColor} />
                </View>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitle}>{item.title}</Text>
                  <Text style={styles.listSubtitle}>{item.subtitle}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>

          {/* More Section */}
          <Text style={styles.sectionTitleStandalone}>More</Text>
          <View style={styles.listPanel}>
            {more.map((item, index) => (
              <Pressable
                key={item.title}
                style={({ pressed }) => [
                  styles.listItem,
                  pressed && styles.pressed,
                  item.title === 'Log Out' && styles.logoutItem,
                  index < more.length - 1 && styles.listItemBorder,
                ]}
                onPress={() => handleMorePress(item.title)}
              >
                <View style={[styles.listIcon, { backgroundColor: item.iconBg }]}>
                  <MaterialIcons
                    name={item.icon}
                    size={18}
                    color={item.iconColor}
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

          {/* App Version Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>CardVault v1.0.0</Text>
            <Text style={styles.footerSubtext}>Built with ♥ and AES-256 encryption</Text>
          </View>
        </ScrollView>
      </LinearGradient>

      <EditProfileModal 
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleProfileSave}
        profileData={{
          name: profile.name,
          email: profile.email || '',
          phone: profile.phone || '',
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
    paddingBottom: 130,
  },
  profileCard: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...Platform.select({
      ios: {
        shadowColor: '#5B5B94',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'DMSans',
  },
  profileCopy: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'DMSans',
  },
  profileEmail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  editButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  profileBadgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  profileBadgeText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '600',
  },
  profileBadgeSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  profileBadgeTextSecondary: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  panel: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...Platform.select({
      ios: {
        shadowColor: '#5B5B94',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'DMSans',
  },
  sectionTitleStandalone: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'DMSans',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionLink: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  overviewCard: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  overviewIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'DMSans',
  },
  overviewLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  listPanel: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: 24,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...Platform.select({
      ios: {
        shadowColor: '#5B5B94',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.4)',
    borderRadius: 0,
  },
  logoutItem: {
    // No special background color, just text coloring
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    fontFamily: 'DMSans',
  },
  footerSubtext: {
    fontSize: 10,
    color: colors.textMuted,
    opacity: 0.7,
  },
});
