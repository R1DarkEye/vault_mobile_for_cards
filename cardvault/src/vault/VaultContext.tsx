import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  base64ToBytes,
  bytesToBase64,
  deriveKey,
  deriveKeyAsync,
  encryptText,
  randomBytes,
  decryptText,
} from './crypto';
import { readVaultData, readVaultMeta, writeVaultData, writeVaultMeta } from './storage';
import { CardType, VaultCard, VaultData } from './types';
import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

const VERIFY_TEXT = 'cardvault-verify';
const MNEMONIC_KEY = 'cardvault.mnemonic';

type VaultContextValue = {
  isInitialized: boolean;
  isUnlocked: boolean;
  isLoading: boolean;
  pendingMnemonic: string | null;
  data: VaultData | null;
  lastError: string | null;
  createVault: () => void;
  finalizeVault: () => Promise<boolean>;
  unlockVault: () => Promise<boolean>;
  lockVault: () => void;
  addCard: (title: string, subtitle: string, type: CardType, last4?: string) => Promise<void>;
  viewMnemonic: () => Promise<string | null>;
};

const VaultContext = createContext<VaultContextValue | null>(null);

const defaultData: VaultData = {
  cards: [
    {
      id: '1',
      title: 'HDFC Bank Credit Card',
      subtitle: 'Payment Card',
      type: 'payment',
      last4: '4567',
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Passport',
      subtitle: 'ID Card',
      type: 'id',
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Star Health Insurance',
      subtitle: 'Insurance',
      type: 'insurance',
      updatedAt: new Date().toISOString(),
    },
  ],
};

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingMnemonic, setPendingMnemonic] = useState<string | null>(null);
  const [data, setData] = useState<VaultData | null>(null);
  const [keyBytes, setKeyBytes] = useState<Uint8Array | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const withTimeout = async <T,>(label: string, task: Promise<T>, ms: number) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
    });
    try {
      return await Promise.race([task, timeout]);
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  };

  useEffect(() => {
    const loadMeta = async () => {
      const meta = await readVaultMeta();
      setIsInitialized(Boolean(meta));
      setIsLoading(false);
    };
    loadMeta();
  }, []);

  const createVault = useCallback(() => {
    const mnemonic = generateMnemonic(wordlist, 128);
    setPendingMnemonic(mnemonic);
  }, []);

  const finalizeVault = useCallback(async () => {
    if (!pendingMnemonic) {
      return false;
    }
    setLastError(null);
    try {
      const salt = await randomBytes(16);
      const key = await deriveKeyAsync(pendingMnemonic, salt);
      const verify = await encryptText(key, VERIFY_TEXT);

      await withTimeout(
        'Write vault meta',
        writeVaultMeta({
          saltB64: bytesToBase64(salt),
          verifyNonceB64: verify.nonceB64,
          verifyDataB64: verify.dataB64,
          createdAt: new Date().toISOString(),
        }),
        6000
      );

      await withTimeout('Write vault data', writeVaultData(key, defaultData), 6000);

      await withTimeout('Store mnemonic', SecureStore.setItemAsync(MNEMONIC_KEY, pendingMnemonic), 6000);

      setKeyBytes(key);
      setIsInitialized(true);
      setIsUnlocked(true);
      setPendingMnemonic(null);
      setData(defaultData);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to secure the vault.';
      setLastError(message);
      console.error(error);
      return false;
    }
  }, [pendingMnemonic]);

  const unlockVault = useCallback(async () => {
    setLastError(null);
    const meta = await readVaultMeta();
    if (!meta) {
      setLastError('Vault is not initialized.');
      return false;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !isEnrolled) {
      setLastError('Biometric authentication is not available.');
      return false;
    }

    const mnemonic = await SecureStore.getItemAsync(MNEMONIC_KEY, {
      requireAuthentication: true,
    });

    if (!mnemonic) {
      setLastError('Unable to unlock vault.');
      return false;
    }

    const key = deriveKey(mnemonic, base64ToBytes(meta.saltB64));
    try {
      const verify = decryptText(key, meta.verifyNonceB64, meta.verifyDataB64);
      if (verify !== VERIFY_TEXT) {
        setLastError('Incorrect credentials.');
        return false;
      }
    } catch {
      setLastError('Incorrect credentials.');
      return false;
    }

    const storedData = await readVaultData(key);
    setKeyBytes(key);
    setIsUnlocked(true);
    setData(storedData ?? defaultData);
    return true;
  }, []);

  const lockVault = useCallback(() => {
    setKeyBytes(null);
    setIsUnlocked(false);
    setLastError(null);
  }, []);

  const addCard = useCallback(
    async (title: string, subtitle: string, type: CardType, last4?: string) => {
      if (!keyBytes) {
        return;
      }
      const next: VaultCard = {
        id: `${Date.now()}-${Math.floor(Math.random() * 10_000)}`,
        title,
        subtitle,
        type,
        last4,
        updatedAt: new Date().toISOString(),
      };
      const updated: VaultData = {
        cards: [...(data?.cards ?? []), next],
      };
      setData(updated);
      await writeVaultData(keyBytes, updated);
    },
    [data, keyBytes]
  );

  const viewMnemonic = useCallback(async () => {
    const mnemonic = await SecureStore.getItemAsync(MNEMONIC_KEY, {
      requireAuthentication: true,
    });
    return mnemonic;
  }, []);

  const value = useMemo(
    () => ({
      isInitialized,
      isUnlocked,
      isLoading,
      pendingMnemonic,
      data,
      lastError,
      createVault,
      finalizeVault,
      unlockVault,
      lockVault,
      addCard,
      viewMnemonic,
    }),
    [
      isInitialized,
      isUnlocked,
      isLoading,
      pendingMnemonic,
      data,
      lastError,
      createVault,
      finalizeVault,
      unlockVault,
      lockVault,
      addCard,
      viewMnemonic,
    ]
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within VaultProvider');
  }
  return context;
}
