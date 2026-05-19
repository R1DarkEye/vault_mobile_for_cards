# CardVault

Offline-first card vault for React Native (Expo). Data is encrypted on-device using a mnemonic-derived key and unlocked with biometrics.

## Development

- Install dependencies: `npm install`
- Start Metro: `npm run start`
- Android: `npm run android`
- iOS (macOS only): `npm run ios`
- Web: `npm run web`

## Security Notes

- Vault data is encrypted with AES-GCM in `vault.enc`.
- The encryption key is derived from a BIP-39 mnemonic using PBKDF2.
- The mnemonic is stored in the OS secure store and gated by biometrics.
