import React, { useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { VaultCard } from '../vault/types';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const AVAILABLE_WIDTH = width - 40 - 32; // screen padding + panel padding + gap
const CARD_WIDTH = AVAILABLE_WIDTH * 0.6; // flex 1.5 out of 2.5 is 60%
const CARD_HEIGHT = CARD_WIDTH * 0.65 + 2; // ~1.54 aspect ratio, close to credit card

const gradientMap: Record<string, [string, string]> = {
  payment: ['#0F245B', '#243C8B'],
  id: ['#4C1D95', '#7C3AED'],
  insurance: ['#064E3B', '#059669'],
  license: ['#78350F', '#D97706'],
  other: ['#374151', '#6B7280'],
};

interface CardSliderProps {
  cards: VaultCard[];
  onAddCard: () => void;
  onPressCard?: (card: VaultCard) => void;
}

export default function CardSlider({ cards, onAddCard, onPressCard }: CardSliderProps) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  if (cards.length === 0) {
    return (
      <Pressable style={styles.emptyContainer} onPress={onAddCard}>
        <View style={styles.addCardIcon}>
          <MaterialIcons name="add" size={28} color={colors.primary} />
        </View>
        <Text style={styles.addCardText}>Add a Card</Text>
        <Text style={styles.addCardSub}>Your vault is empty</Text>
      </Pressable>
    );
  }

  const numDots = Math.min(cards.length, 4);
  let activeDotIndex = activeIndex;
  if (cards.length > 4 && activeIndex >= 3) {
    activeDotIndex = 3;
  }

  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        <Animated.FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH}
          decelerationRate="fast"
          style={{ overflow: 'visible' }}
          contentContainerStyle={{ overflow: 'visible' }}
          removeClippedSubviews={false}
          CellRendererComponent={({ children, index, style, ...props }) => {
            const zIndex = cards.length - index;
            return (
              <View
                style={[
                  style,
                  { overflow: 'visible', zIndex }
                ]}
                {...props}
              >
                {children}
              </View>
            );
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item, index }) => {
            const position = Animated.divide(scrollX, CARD_WIDTH);
            const distance = Animated.subtract(index, position);

            const scale = distance.interpolate({
              inputRange: [-1, 0, 1, 2],
              outputRange: [1, 1, 0.92, 0.84],
              extrapolate: 'clamp',
            });

            const translateX = distance.interpolate({
              inputRange: [-1, 0, 1, 2, 3],
              outputRange: [
                0,
                0,
                -(CARD_WIDTH - 32),
                -(CARD_WIDTH * 2 - 64),
                -(CARD_WIDTH * 3 - 96),
              ],
              extrapolate: 'clamp',
            });

            const opacity = distance.interpolate({
              inputRange: [-1, 0, 1, 2, 3],
              outputRange: [0, 1, 1, 1, 0],
              extrapolate: 'clamp',
            });

            const zIndex = cards.length - index;
            const colors = gradientMap[item.type] || gradientMap.other;

            return (
              <Animated.View
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  transform: [{ translateX }, { scale }],
                  opacity,
                  zIndex,
                }}
              >
                <Pressable style={styles.cardPressable} onPress={() => onPressCard?.(item)}>
                  <LinearGradient
                    colors={colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardPrimary}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardBrand}>
                        {item.type === 'payment' ? 'VISA' : item.type.toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.cardBody}>
                      <Text style={styles.cardNumber}>
                        •••• {item.last4 || '----'}
                      </Text>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={styles.cardFooterText}>
                        <Text style={styles.cardHolder} numberOfLines={1}>
                          {item.details?.cardholderName || 'Cardholder Name'}
                        </Text>
                        <Text style={styles.cardMeta} numberOfLines={1}>
                          {item.title}
                        </Text>
                      </View>
                      {item.type === 'payment' && (
                        <MaterialIcons
                          name="wifi"
                          size={18}
                          color="rgba(255,255,255,0.8)"
                          style={styles.contactlessIcon}
                        />
                      )}
                    </View>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            );
          }}
        />
      </View>

      {cards.length > 1 && (
        <View style={styles.dotsContainer}>
          {Array.from({ length: numDots }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeDotIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'visible',
  },
  sliderContainer: {
    height: CARD_HEIGHT + 24,
    width: '100%',
    paddingTop: 8,
    overflow: 'visible',
  },
  emptyContainer: {
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardIcon: {
    width: 18,
    height: 18,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  addCardText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  addCardSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardPressable: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardPrimary: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardHeader: {
    alignItems: 'flex-end',
  },
  cardBrand: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
  cardBody: {
    justifyContent: 'center',
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardFooterText: {
    flex: 1,
    paddingRight: 10,
  },
  cardHolder: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardMeta: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 2,
    opacity: 0.85,
  },
  contactlessIcon: {
    transform: [{ rotate: '90deg' }],
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 14,
  },
  inactiveDot: {
    backgroundColor: colors.border,
  },
});
