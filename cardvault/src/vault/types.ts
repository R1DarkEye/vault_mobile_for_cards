export type CardType = 'payment' | 'id' | 'insurance' | 'license' | 'other';

export type VaultCard = {
  id: string;
  title: string;
  subtitle: string;
  type: CardType;
  last4?: string;
  updatedAt: string;
};

export type VaultData = {
  cards: VaultCard[];
};
