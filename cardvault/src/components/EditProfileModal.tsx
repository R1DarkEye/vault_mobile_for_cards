import { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { PrimaryButton } from './PrimaryButton';

type ProfileData = {
  name: string;
  email: string;
  phone: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  profileData: ProfileData;
  onSave: (data: ProfileData) => void;
};

export default function EditProfileModal({ visible, onClose, profileData, onSave }: Props) {
  const [name, setName] = useState(profileData.name);
  const [email, setEmail] = useState(profileData.email);
  const [phone, setPhone] = useState(profileData.phone);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Sync form state when modal opens with fresh data
  useEffect(() => {
    if (visible) {
      setName(profileData.name);
      setEmail(profileData.email);
      setPhone(profileData.phone);
      setErrors({});
    }
  }, [visible, profileData]);

  const handleSave = () => {
    const newErrors: Record<string, boolean> = {};
    if (!name.trim()) newErrors.name = true;
    if (!email.trim() || !email.includes('@')) newErrors.email = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const hasChanges =
    name.trim() !== profileData.name ||
    email.trim() !== profileData.email ||
    phone.trim() !== profileData.phone;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={() => {
        Keyboard.dismiss();
        handleClose();
      }}>
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10}
          style={styles.sheetContainer}
        >
          <Pressable style={styles.sheet} onPress={() => Keyboard.dismiss()}>
            <View style={styles.handle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Edit Profile</Text>
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              {/* Avatar Section */}
              <View style={styles.avatarSection}>
                <View style={styles.avatarCircle}>
                  <MaterialIcons name="person" size={32} color="#4D6BFF" />
                </View>
                <Pressable style={styles.changePhotoButton}>
                  <MaterialIcons name="camera-alt" size={14} color="#4D6BFF" />
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </Pressable>
              </View>

              {/* Full Name */}
              <Text style={styles.label}>Full Name</Text>
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
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <MaterialIcons name="email" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: false }));
                  }}
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

              {/* Save Button */}
              <View style={styles.buttonRow}>
                <PrimaryButton
                  title="Save Changes"
                  onPress={handleSave}
                  disabled={!hasChanges}
                />
                <PrimaryButton title="Cancel" onPress={handleClose} variant="ghost" />
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetContainer: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingBottom: 20,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6EBFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#4D6BFF',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(77, 107, 255, 0.08)',
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4D6BFF',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  labelOptional: {
    fontWeight: '400',
    color: colors.textMuted,
    fontSize: 11,
  },
  inputWrapper: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
  buttonRow: {
    marginTop: 28,
    gap: 12,
  },
});
