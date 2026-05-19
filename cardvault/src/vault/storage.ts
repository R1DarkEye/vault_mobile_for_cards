import * as FileSystem from 'expo-file-system/legacy';
import { decryptText, encryptText, base64ToBytes } from './crypto';
import { VaultData } from './types';

const vaultMetaPath = `${FileSystem.documentDirectory}vault.meta.json`;
const vaultDataPath = `${FileSystem.documentDirectory}vault.enc`;

export type VaultMeta = {
  saltB64: string;
  verifyNonceB64: string;
  verifyDataB64: string;
  createdAt: string;
};

export async function readVaultMeta(): Promise<VaultMeta | null> {
  const info = await FileSystem.getInfoAsync(vaultMetaPath);
  if (!info.exists) {
    return null;
  }
  const raw = await FileSystem.readAsStringAsync(vaultMetaPath);
  return JSON.parse(raw) as VaultMeta;
}

export async function writeVaultMeta(meta: VaultMeta) {
  await FileSystem.writeAsStringAsync(vaultMetaPath, JSON.stringify(meta));
}

export async function writeVaultData(key: Uint8Array, data: VaultData) {
  const payload = JSON.stringify(data);
  const encrypted = await encryptText(key, payload);
  await FileSystem.writeAsStringAsync(
    vaultDataPath,
    JSON.stringify(encrypted)
  );
}

export async function readVaultData(key: Uint8Array): Promise<VaultData | null> {
  const info = await FileSystem.getInfoAsync(vaultDataPath);
  if (!info.exists) {
    return null;
  }
  const raw = await FileSystem.readAsStringAsync(vaultDataPath);
  const encrypted = JSON.parse(raw) as { nonceB64: string; dataB64: string };
  const payload = decryptText(key, encrypted.nonceB64, encrypted.dataB64);
  return JSON.parse(payload) as VaultData;
}

export function decodeSalt(meta: VaultMeta) {
  return base64ToBytes(meta.saltB64);
}
