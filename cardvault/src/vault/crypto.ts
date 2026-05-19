import { gcm } from '@noble/ciphers/aes.js';
import { pbkdf2, pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { fromByteArray, toByteArray } from 'base64-js';
import * as Crypto from 'expo-crypto';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function bytesToBase64(bytes: Uint8Array) {
  return fromByteArray(bytes);
}

export function base64ToBytes(value: string) {
  return toByteArray(value);
}

export async function randomBytes(length: number) {
  const bytes = await Crypto.getRandomBytesAsync(length);
  return Uint8Array.from(bytes);
}

export function deriveKey(mnemonic: string, salt: Uint8Array) {
  return pbkdf2(sha256, textEncoder.encode(mnemonic), salt, {
    c: 10_000,
    dkLen: 32,
  });
}

export function deriveKeyAsync(mnemonic: string, salt: Uint8Array) {
  return pbkdf2Async(sha256, textEncoder.encode(mnemonic), salt, {
    c: 10_000,
    dkLen: 32,
  });
}

export async function encryptText(key: Uint8Array, plaintext: string) {
  const nonce = await randomBytes(12);
  const cipher = gcm(key, nonce);
  const ciphertext = cipher.encrypt(textEncoder.encode(plaintext));
  return {
    nonceB64: bytesToBase64(nonce),
    dataB64: bytesToBase64(ciphertext),
  };
}

export function decryptText(key: Uint8Array, nonceB64: string, dataB64: string) {
  const nonce = base64ToBytes(nonceB64);
  const cipher = gcm(key, nonce);
  const data = base64ToBytes(dataB64);
  const plaintext = cipher.decrypt(data);
  return textDecoder.decode(plaintext);
}
