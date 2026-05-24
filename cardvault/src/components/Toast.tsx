import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
};

export function Toast({ title, message, type, onDismiss }: Props) {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after 3 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return {
          name: 'check-circle' as const,
          color: colors.success,
          bg: '#DCFCE7',
          border: '#86EFAC',
        };
      case 'error':
        return {
          name: 'error-outline' as const,
          color: colors.danger,
          bg: '#FEE2E2',
          border: '#FCA5A5',
        };
      default:
        return {
          name: 'info-outline' as const,
          color: colors.primary,
          bg: colors.primarySoft,
          border: '#BFDBFE',
        };
    }
  };

  const icon = getIconConfig();

  return (
    <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Pressable onPress={handleDismiss} style={styles.pressableContainer}>
          {/* Accent vertical bar */}
          <View style={[styles.accentBar, { backgroundColor: icon.color }]} />

          {/* Content Row */}
          <View style={styles.row}>
            {/* Icon Box */}
            <View style={[styles.iconContainer, { backgroundColor: icon.bg, borderColor: icon.border }]}>
              <MaterialIcons name={icon.name} size={22} color={icon.color} />
            </View>

            {/* Texts */}
            <View style={styles.textContainer}>
              <Text style={styles.titleText}>{title}</Text>
              <Text style={styles.messageText} numberOfLines={2}>
                {message}
              </Text>
            </View>

            {/* Close Button */}
            <View style={styles.closeIcon}>
              <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 12 : 24,
    left: 0,
    right: 0,
    zIndex: 99999,
  },
  container: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
    overflow: 'hidden',
  },
  pressableContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  closeIcon: {
    opacity: 0.7,
  },
});
