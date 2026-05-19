import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useVault } from '../vault/VaultContext';
import { CardType, CardDetails } from '../vault/types';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const cardTypes: { type: CardType; label: string; icon: string }[] = [
  { type: 'payment', label: 'Payment Card', icon: 'credit-card' },
  { type: 'id', label: 'ID Card', icon: 'badge' },
  { type: 'insurance', label: 'Insurance', icon: 'health-and-safety' },
  { type: 'license', label: 'License', icon: 'directions-car' },
  { type: 'other', label: 'Other', icon: 'apps' },
];

export default function AddCardModal({ visible, onClose }: Props) {
  const { addCard } = useVault();
  
  // Generic fields
  const [selectedType, setSelectedType] = useState<CardType>('payment');
  const [saving, setSaving] = useState(false);
  
  // Input states
  const [title, setTitle] = useState(''); // E.g., HDFC Credit Card, Passport, etc.
  
  // Payment
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  // ID / License
  const [idNumber, setIdNumber] = useState('');
  const [dob, setDob] = useState('');
  const [issueDate, setIssueDate] = useState('');
  
  // Insurance
  const [provider, setProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  
  // Other
  const [notes, setNotes] = useState('');
  const [description, setDescription] = useState(''); // subtitle for 'other'

  const resetForm = () => {
    setSelectedType('payment');
    setTitle('');
    setCardNumber('');
    setCardholderName('');
    setExpiryDate('');
    setCvv('');
    setIdNumber('');
    setDob('');
    setIssueDate('');
    setProvider('');
    setPolicyNumber('');
    setGroupNumber('');
    setNotes('');
    setDescription('');
  };

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add space every 4 digits
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const formatDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }
    return formatted;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing field', 'Please enter a title for this card.');
      return;
    }

    let subtitle = '';
    let last4: string | undefined = undefined;
    const details: CardDetails = {};

    switch (selectedType) {
      case 'payment':
        if (!cardNumber.trim()) {
          Alert.alert('Missing field', 'Please enter the card number.');
          return;
        }
        subtitle = cardholderName.trim() || 'Payment Card';
        const cleanedCardNumber = cardNumber.replace(/\D/g, '');
        if (cleanedCardNumber.length >= 4) {
          last4 = cleanedCardNumber.slice(-4);
        }
        details.cardNumber = cardNumber;
        details.cardholderName = cardholderName;
        details.expiryDate = expiryDate;
        details.cvv = cvv;
        break;

      case 'id':
      case 'license':
        if (!idNumber.trim()) {
          Alert.alert('Missing field', `Please enter the ${selectedType === 'id' ? 'ID' : 'License'} number.`);
          return;
        }
        subtitle = cardholderName.trim() || (selectedType === 'id' ? 'ID Card' : 'License');
        details.cardholderName = cardholderName;
        details.idNumber = idNumber;
        details.dob = dob;
        details.expiryDate = expiryDate;
        if (selectedType === 'id') {
          details.issueDate = issueDate;
        }
        break;

      case 'insurance':
        if (!policyNumber.trim()) {
          Alert.alert('Missing field', 'Please enter the policy number.');
          return;
        }
        subtitle = provider.trim() || 'Insurance';
        details.provider = provider;
        details.policyNumber = policyNumber;
        details.groupNumber = groupNumber;
        break;

      case 'other':
        if (!description.trim()) {
          Alert.alert('Missing field', 'Please enter a description.');
          return;
        }
        subtitle = description.trim();
        details.notes = notes;
        break;
    }

    setSaving(true);
    try {
      await addCard(title.trim(), subtitle, selectedType, last4, details);
      Alert.alert('Card Added', `"${title.trim()}" has been securely stored in your vault.`);
      resetForm();
      onClose();
    } catch {
      Alert.alert('Error', 'Unable to save card. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Add New Item</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody}>
            {/* Card Type Selector */}
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              {cardTypes.map((ct) => (
                <Pressable
                  key={ct.type}
                  style={[
                    styles.typeChip,
                    selectedType === ct.type && styles.typeChipActive,
                  ]}
                  onPress={() => setSelectedType(ct.type)}
                >
                  <MaterialIcons
                    name={ct.icon as any}
                    size={16}
                    color={selectedType === ct.type ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.typeChipText,
                      selectedType === ct.type && styles.typeChipTextActive,
                    ]}
                  >
                    {ct.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Common Title */}
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder={
                selectedType === 'payment' ? 'e.g., HDFC Credit Card' :
                selectedType === 'id' ? 'e.g., US Passport' :
                selectedType === 'insurance' ? 'e.g., Star Health Insurance' :
                selectedType === 'license' ? 'e.g., Driving License' :
                'e.g., Gym Membership'
              }
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />

            {/* Dynamic Fields based on Type */}
            {selectedType === 'payment' && (
              <>
                <Text style={styles.label}>Cardholder Name</Text>
                <TextInput
                  style={styles.input}
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  placeholder="John Doe"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                />

                <Text style={styles.label}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  value={cardNumber}
                  onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={19}
                />

                <View style={styles.row}>
                  <View style={styles.halfCol}>
                    <Text style={styles.label}>Expiry Date</Text>
                    <TextInput
                      style={styles.input}
                      value={expiryDate}
                      onChangeText={(t) => setExpiryDate(formatExpiry(t))}
                      placeholder="MM/YY"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                  <View style={styles.halfCol}>
                    <Text style={styles.label}>CVV</Text>
                    <TextInput
                      style={styles.input}
                      value={cvv}
                      onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))}
                      placeholder="123"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      secureTextEntry
                    />
                  </View>
                </View>
              </>
            )}

            {(selectedType === 'id' || selectedType === 'license') && (
              <>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  placeholder="John Doe"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                />

                <Text style={styles.label}>{selectedType === 'id' ? 'ID Number' : 'License Number'}</Text>
                <TextInput
                  style={styles.input}
                  value={idNumber}
                  onChangeText={setIdNumber}
                  placeholder="ABC123456"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                />

                <View style={styles.row}>
                  <View style={styles.halfCol}>
                    <Text style={styles.label}>Date of Birth</Text>
                    <TextInput
                      style={styles.input}
                      value={dob}
                      onChangeText={(t) => setDob(formatDate(t))}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      maxLength={10}
                    />
                  </View>
                  <View style={styles.halfCol}>
                    <Text style={styles.label}>Expiry Date</Text>
                    <TextInput
                      style={styles.input}
                      value={expiryDate}
                      onChangeText={(t) => setExpiryDate(formatDate(t))}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      maxLength={10}
                    />
                  </View>
                </View>

                {selectedType === 'id' && (
                  <>
                    <Text style={styles.label}>Issue Date (optional)</Text>
                    <TextInput
                      style={styles.input}
                      value={issueDate}
                      onChangeText={(t) => setIssueDate(formatDate(t))}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      maxLength={10}
                    />
                  </>
                )}
              </>
            )}

            {selectedType === 'insurance' && (
              <>
                <Text style={styles.label}>Provider Name</Text>
                <TextInput
                  style={styles.input}
                  value={provider}
                  onChangeText={setProvider}
                  placeholder="e.g., Aetna, Blue Cross"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                />

                <Text style={styles.label}>Policy Number</Text>
                <TextInput
                  style={styles.input}
                  value={policyNumber}
                  onChangeText={setPolicyNumber}
                  placeholder="POL-123456789"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                />

                <Text style={styles.label}>Group Number (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={groupNumber}
                  onChangeText={setGroupNumber}
                  placeholder="GRP-98765"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                />
              </>
            )}

            {selectedType === 'other' && (
              <>
                <Text style={styles.label}>Short Description</Text>
                <TextInput
                  style={styles.input}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="e.g., Library Card"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="sentences"
                />

                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Enter any additional details, numbers, or PINs..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </>
            )}

            <View style={styles.buttonRow}>
              <PrimaryButton
                title={saving ? 'Saving…' : 'Add to Vault'}
                onPress={handleSave}
                disabled={saving}
              />
              <PrimaryButton title="Cancel" onPress={handleClose} variant="ghost" />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: '90%',
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  typeChipText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  typeChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  buttonRow: {
    marginTop: 24,
    gap: 12,
  },
});
