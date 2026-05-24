export type CardType = 'payment' | 'id' | 'insurance' | 'license' | 'other';

export type CardDetails = {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  idNumber?: string;
  dob?: string;
  issueDate?: string;
  policyNumber?: string;
  groupNumber?: string;
  provider?: string;
  notes?: string;
};

export type VaultCard = {
  id: string;
  title: string;
  subtitle: string;
  type: CardType;
  last4?: string;
  updatedAt: string;
  details?: CardDetails;
};

export type ProfileData = {
  name: string;
  email: string;
  phone: string;
  photoUri?: string;
};

export type VaultData = {
  cards: VaultCard[];
  profile?: ProfileData;
};
