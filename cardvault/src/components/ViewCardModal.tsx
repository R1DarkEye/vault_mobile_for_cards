import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../theme/colors';
import { VaultCard } from '../vault/types';

type Props = {
  visible: boolean;
  card: VaultCard | null;
  onClose: () => void;
};

export default function ViewCardModal({ visible, card, onClose }: Props) {
  if (!card) return null;

  const { title, subtitle, type, last4, details } = card;

  const handleCopy = async (text: string | undefined, label: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${label} copied to clipboard.`);
  };

  const getGradientColors = () => {
    switch (type) {
      case 'payment': return ['#0F245B', '#243C8B'];
      case 'id': return ['#4C1D95', '#7C3AED'];
      case 'insurance': return ['#064E3B', '#059669'];
      case 'license': return ['#78350F', '#D97706'];
      default: return ['#374151', '#6B7280'];
    }
  };

  const getIconName = () => {
    switch (type) {
      case 'payment': return 'credit-card';
      case 'id': return 'badge';
      case 'insurance': return 'health-and-safety';
      case 'license': return 'directions-car';
      default: return 'apps';
    }
  };

  const renderField = (label: string, value: string | undefined, isSecret = false) => {
    if (!value) return null;
    return (
      <View style={styles.fieldRow} key={label}>
        <View style={styles.fieldInfo}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.fieldValue}>
            {isSecret ? '•••• •••• •••• ' + value.slice(-4) : value}
          </Text>
        </View>
        <Pressable
          style={styles.copyButton}
          onPress={() => handleCopy(value, label)}
        >
          <MaterialIcons name="content-copy" size={16} color={colors.primary} />
        </Pressable>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Card Details</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody}>
            
            {/* Visual Card Representation */}
            <LinearGradient
              colors={getGradientColors() as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardPreview}
            >
              <View style={styles.cardPreviewHeader}>
                <MaterialIcons name={getIconName() as any} size={24} color="rgba(255,255,255,0.8)" />
                <Text style={styles.cardPreviewType}>{type.toUpperCase()}</Text>
              </View>
              
              <Text style={styles.cardPreviewTitle} numberOfLines={1}>{title}</Text>
              
              {type === 'payment' && details?.cardNumber ? (
                <Text style={styles.cardPreviewNumber}>
                  {details.cardNumber.replace(/(.{4})/g, '$1 ').trim()}
                </Text>
              ) : type === 'payment' && last4 ? (
                <Text style={styles.cardPreviewNumber}>•••• •••• •••• {last4}</Text>
              ) : null}

              <View style={styles.cardPreviewFooter}>
                <View>
                  <Text style={styles.cardPreviewLabel}>Name / Info</Text>
                  <Text style={styles.cardPreviewValue} numberOfLines={1}>
                    {details?.cardholderName || subtitle || 'N/A'}
                  </Text>
                </View>
                {type === 'payment' && details?.expiryDate && (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.cardPreviewLabel}>Expires</Text>
                    <Text style={styles.cardPreviewValue}>{details.expiryDate}</Text>
                  </View>
                )}
              </View>
            </LinearGradient>

            {/* Detailed Data Fields */}
            <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>Information</Text>
              <View style={styles.fieldsCard}>
                {renderField('Title', title)}
                {renderField('Description', subtitle)}

                {/* Payment Fields */}
                {type === 'payment' && (
                  <>
                    {renderField('Cardholder Name', details?.cardholderName)}
                    {renderField('Card Number', details?.cardNumber)}
                    {renderField('Expiry Date', details?.expiryDate)}
                    {renderField('CVV', details?.cvv)}
                  </>
                )}

                {/* ID & License Fields */}
                {(type === 'id' || type === 'license') && (
                  <>
                    {renderField('Full Name', details?.cardholderName)}
                    {renderField(type === 'id' ? 'ID Number' : 'License Number', details?.idNumber)}
                    {renderField('Date of Birth', details?.dob)}
                    {renderField('Issue Date', details?.issueDate)}
                    {renderField('Expiry Date', details?.expiryDate)}
                  </>
                )}

                {/* Insurance Fields */}
                {type === 'insurance' && (
                  <>
                    {renderField('Provider', details?.provider)}
                    {renderField('Policy Number', details?.policyNumber)}
                    {renderField('Group Number', details?.groupNumber)}
                  </>
                )}

                {/* Other Fields */}
                {type === 'other' && (
                  <>
                    {details?.notes && (
                      <View style={styles.notesContainer}>
                        <Text style={styles.fieldLabel}>Notes</Text>
                        <Text style={styles.notesText}>{details.notes}</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>

          </ScrollView>
        </View>
      </View>
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
  cardPreview: {
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  cardPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardPreviewType: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  cardPreviewTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  cardPreviewNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    letterSpacing: 2,
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cardPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardPreviewLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  cardPreviewValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 200,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  fieldsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  notesContainer: {
    marginTop: 8,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    backgroundColor: colors.surfaceAlt,
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
});
