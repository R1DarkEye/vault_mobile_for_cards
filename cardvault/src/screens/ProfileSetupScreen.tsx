import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { useVault } from '../vault/VaultContext';

export default function ProfileSetupScreen() {
  const { updateProfile, showToast } = useVault();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleSave = async () => {
    const newErrors: Record<string, boolean> = {};
    if (!name.trim()) newErrors.name = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Validation Error', 'Please enter your full name to continue.', 'error');
      return;
    }

    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      showToast('Profile Saved', 'Welcome to CardVault!', 'success');
    } catch (err) {
      showToast('Error', 'Unable to save profile.', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.gradientStops}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <Pressable style={styles.dismissWrapper} onPress={() => Keyboard.dismiss()}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              
              <View style={styles.header}>
                <View style={styles.logoBadge}>
                  <MaterialIcons name="person-add" size={24} color={colors.primary} />
                </View>
                <Text style={styles.title}>Set up your profile</Text>
                <Text style={styles.subtitle}>
                  Let's personalize your vault. Only your name is required.
                </Text>
              </View>

              <View style={styles.card}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                  <View style={styles.avatarCircle}>
                    <MaterialIcons name="person" size={32} color={colors.primary} />
                  </View>
                  <Pressable
                    style={styles.changePhotoButton}
                    onPress={() => showToast('Photo', 'Photo upload will be added in a future update.', 'info')}
                  >
                    <MaterialIcons name="camera-alt" size={14} color={colors.primary} />
                    <Text style={styles.changePhotoText}>Add Photo</Text>
                  </Pressable>
                </View>

                {/* Full Name */}
                <Text style={styles.label}>Full Name <Text style={styles.labelRequired}>*</Text></Text>
                <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                  <MaterialIcons name="person-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={(t) => {
                      setName(t);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: false }));
                    }}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="words"
                  />
                </View>

                {/* Email */}
                <Text style={styles.label}>Email Address <Text style={styles.labelOptional}>(optional)</Text></Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="email" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Phone */}
                <Text style={styles.label}>Phone Number <Text style={styles.labelOptional}>(optional)</Text></Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="phone" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter your phone number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <PrimaryButton
                    title="Complete Setup"
                    onPress={handleSave}
                  />
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  dismissWrapper: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'DMSans',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: 24,
    padding: 24,
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
    fontFamily: 'DMSans',
  },
  labelOptional: {
    fontWeight: '400',
    color: colors.textMuted,
    fontSize: 11,
  },
  labelRequired: {
    color: colors.danger,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    gap: 10,
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: 1.5,
  },
  inputIcon: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  buttonContainer: {
    marginTop: 32,
  },
});
