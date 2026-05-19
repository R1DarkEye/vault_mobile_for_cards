# CardVault Mobile - Codebase & Architecture Guide

Welcome to the **CardVault** codebase documentation. This document provides a comprehensive walkthrough of the application's folder structure, core components, secure storage systems, cryptographic architecture, navigation flow, and screen behaviors.

---

## 📂 Codebase Directory Structure

The application is structured as a clean, highly modular React Native application managed by **Expo**. Here is the high-level outline of the repository:

```
cardvault/
├── App.tsx                    # App entry point, registers providers
├── app.json                   # Expo configuration file
├── package.json               # Package dependencies & scripts
├── tsconfig.json              # TypeScript configuration options
└── src/                       # Application source folder
    ├── components/            # Shared presentation & modal components
    │   ├── PrimaryButton.tsx  # Styled custom pressable with animations
    │   ├── AddCardModal.tsx   # Interactive sheet for secure card enrollment
    │   └── ViewCardModal.tsx  # Dynamic modal for previewing secure card data
    ├── navigation/            # Routing state machine
    │   └── AppNavigator.tsx   # Bottom-tab navigator & gatekeeping screens
    ├── theme/                 # Styling system
    │   └── colors.ts          # Core and accent color tokens
    ├── screens/               # Screen-level components
    │   ├── OnboardingScreen.tsx # 12-word mnemonic generation & verification
    │   ├── UnlockScreen.tsx   # Local biometric vault unlocking gate
    │   ├── HomeScreen.tsx     # Dashboard, summary cards & quick actions
    │   ├── CardsScreen.tsx    # List, search, filter, delete, and view cards
    │   ├── SecurityScreen.tsx # Security scores, actions & recovery phrases
    │   └── ProfileScreen.tsx  # Settings, metadata summary & logout controls
    └── vault/                 # Security, cryptographic and storage engines
        ├── crypto.ts          # PBKDF2, AES-GCM 256 encryption functions
        ├── storage.ts         # Secure local disk file read/write mechanisms
        ├── types.ts           # Type models for Cards, VaultData & Types
        └── VaultContext.tsx   # Global state machine context provider
```

---

## 🔒 Cryptographic Architecture & Flow

CardVault provides bank-grade, on-device security. No data ever leaves the user's device. Security is implemented using industry-standard cryptographic primitives through `@noble/ciphers` and `@noble/hashes`.

### 1. Key Derivation Function (KDF)
When a user sets up a vault:
- A unique **12-word BIP39 mnemonic passphrase** is generated on-device.
- An random **16-byte salt** is generated.
- A **32-byte master key** is derived from the mnemonic passphrase using **PBKDF2-HMAC-SHA256** with **10,000 iterations** (defined in [crypto.ts](file:///e:/projects/cards_vault_mobile/cardvault/src/vault/crypto.ts#L23-L35)).

### 2. Encryption Engine (AES-GCM-256)
- Plaintext data (JSON array of cards) is encrypted using **AES-256 in Galois/Counter Mode (GCM)**.
- GCM provides both **confidentiality** and **authenticity** (Authenticated Encryption with Associated Data - AEAD).
- A unique, cryptographically secure **12-byte initialization vector (IV / Nonce)** is generated for every encryption pass.

### 3. Storage Hierarchy
```
[12-word Passphrase] --> (expo-secure-store) --> [Secure OS Keychain/Keystore]
                                                        | (Biometric Auth)
[vault.enc (AES-GCM encrypted file)] <-- (Master Key) --+
            | (Decrypt)
    [Plaintext JSON] --> [App UI Screens]
```

- **`vault.meta.json`**: Contains non-sensitive metadata (base64-encoded salt, timestamp, and a verification payload) stored in standard document directories.
- **`vault.enc`**: Contains the AES-GCM-256 encrypted vault JSON database payload.
- **Keychain / Keystore**: The raw 12-word passphrase is stored in the device's secure system-level keychain utilizing `expo-secure-store`. This is guarded directly by hardware protection (`requireAuthentication: true`), demanding FaceID, TouchID, or passcode prompts from the operating system to authorize read access.

---

## 🗺️ Navigation & Vault State Machine

The top-level navigator (`AppNavigator.tsx`) operates as a secure state machine based on the current state of the decrypted in-memory vault. It acts as an absolute gateway.

```
       [App Boot]
           │
      (isLoading?) ──── Yes ───> [Show Splash / null]
           │ No
    (isInitialized?) ── No ───> [OnboardingScreen] ───> (Setup Wallet) ───┐
           │ Yes                                                           │
     (isUnlocked?) ──── No ───> [UnlockScreen] ───────> (Biometric Auth) ─┤
           │ Yes                                                           │
      [Main Tab Navigation] <──────────────────────────────────────────────┘
    (Home, Cards, Security, Profile)
           │
     (User Locks Vault / Log out)
           │
           ▼
     [UnlockScreen]
```

### Navigation Route Conditions:
1. **Loading State (`isLoading = true`)**:
   - The app reads `vault.meta.json` from the disk.
   - Displays a clean loading state (returns `null` or splash screen).
2. **Onboarding Gateway (`!isInitialized`)**:
   - The user has never set up a vault on this device.
   - Redirects completely to `OnboardingScreen.tsx`.
3. **Lock Gate (`!isUnlocked`)**:
   - The vault metadata exists but the key has not been decrypted into runtime memory (or the app just launched / unlocked state timed out).
   - Redirects completely to `UnlockScreen.tsx`.
4. **Unlocked Tab View (`isUnlocked = true`)**:
   - The master key is held securely in RAM.
   - Mounting the bottom-tab navigator with the primary screens: **Home**, **Cards**, **Security**, and **Profile**.

---

## 🛠️ File-by-File Code Breakdown

### 📂 Vault Layer (`src/vault/`)

#### 1. [VaultContext.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/vault/VaultContext.tsx)
The global state provider of the app. It holds:
- **State variables**: `isInitialized`, `isUnlocked`, `isLoading`, `data` (in-memory plaintext cards list), and `keyBytes` (runtime decryption key).
- **Core actions**:
  - `createVault()`: Generates a new 12-word BIP39 mnemonic.
  - `finalizeVault()`: Derives the encryption key, encrypts verification payload, creates the secure metadata file, writes empty card structure to disk, and stores mnemonic in `SecureStore`.
  - `unlockVault()`: Requests local biometric prompt, reads mnemonic, derives runtime keys, verifies integrity, and loads data.
  - `lockVault()`: Immediately wipes key and data arrays from runtime memory.
  - `addCard(title, subtitle, type, last4, details)`: Generates metadata, appends card, encrypts, and writes to disk. Accommodates rich, type-specific `CardDetails`.
  - `deleteCard(id)`: Removes card, updates list state, encrypts, and writes to disk.

#### 2. [crypto.ts](file:///e:/projects/cards_vault_mobile/cardvault/src/vault/crypto.ts)
Contains wrappers around raw cryptoprimitives:
- Base64 encoding/decoding using `base64-js`.
- Secure system-level hardware random byte generation using `expo-crypto`.
- PBKDF2 key derivation using `@noble/hashes/pbkdf2`.
- Symmetric GCM cryptography wraps through `@noble/ciphers/aes.js`.

#### 3. [storage.ts](file:///e:/projects/cards_vault_mobile/cardvault/src/vault/storage.ts)
Binds filesystem read/write tasks:
- Writes plain metadata to `vault.meta.json`.
- Encrypts and writes standard card collections to `vault.enc` as secure text blocks.

#### 4. [types.ts](file:///e:/projects/cards_vault_mobile/cardvault/src/vault/types.ts)
Defines the `VaultCard` shapes and the comprehensive `CardDetails` interface allowing dynamic storage of structured payment, id, insurance, and license data within the AES-256 payload.

---

### 📂 Screen Implementations (`src/screens/`)

#### 1. [HomeScreen.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/screens/HomeScreen.tsx)
The dashboard hub of CardVault:
- **Overview Grid**: Tallies card types dynamically (Payment, ID, Insurance, License, Others). Clicking any badge redirects to the filtered cards tab.
- **Card Preview Panel**: Dynamically displays a beautifully designed bank-style digital card representing the first payment card stored in the vault.
- **Recent Activity Feed**: Computes human-friendly relative time (e.g. "Just now", "2h ago", "1 day ago") using `updatedAt` timestamps and shows recently added cards.
- **Action Buttons**:
  - *Add Card*: Opens the custom secure bottom-sheet enrollment form modal.
  - *Scan Card*: Informational alert explaining camera scanner integration.
  - *Lock Vault*: Triggers vault security shutdown with prompt.
  - *Backup Cards*: Confirms local sandbox security context.

#### 2. [CardsScreen.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/screens/CardsScreen.tsx)
The interactive vault explorer:
- **Search Bar**: Fully functional live filtering based on name, description, or payment card last 4 digits.
- **Filter Chips**: Toggles views between category segments (Payment, ID, Insurance, License, Other, and All).
- **Sort Switch**: Reorders lists dynamically by timestamp ("Recent") or alphabetically ("Name").
- **Dynamic Summaries**: Recalculates card type metrics directly from live data.
- **Card Previewing**: Tapping any card opens the detailed `ViewCardModal`.
- **Card Removal**: Safely delete cards by **long-pressing** any list item (triggers confirmation prompt before disk sync).

#### 3. [SecurityScreen.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/screens/SecurityScreen.tsx)
Security posture and configuration dashboard:
- **Vault Security Score**: Calculated dynamically based on configuration parameters (number of cards enrolled, biometric authentication locks, active cryptographic storage).
- **Interactive Action Menu**:
  - *Change Master Password*: Explains mnemonic mechanics.
  - *Recovery Options / View Recovery Words*: Safely shows recovery mnemonic words in a secure format.
  - *Manage Trusted Devices*: Verifies sandbox local integrity.
  - *Lock Vault Now*: Triggers instant lock mechanism.

#### 4. [ProfileScreen.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/screens/ProfileScreen.tsx)
User settings and system parameters:
- **Interactive Badges**: Displays user registration flags (e.g. Premium tier).
- **Summary Metrics**: Calculates card counts, active category tags, and duration/lifetime indicators.
- **Security Navigations**: Deep links directly to the tab configurations.
- **Secure Log Out**: Confirms shutdown protocol before wiping variables from memory.

---

### 📂 Components & Theme (`src/components/` & `src/theme/`)

#### 1. [AddCardModal.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/components/AddCardModal.tsx)
Custom bottom sheet designed for entering new cards into the decrypted store.
- **Dynamic Forms**: Auto-swaps fields based on card type selection (e.g. Cardholder Name vs Policy Provider).
- **Data Formatting**: Auto-spaces credit cards and manages slashes for dates.
- Communicates directly with the `addCard` provider logic, formatting subsets to properly derive `subtitle` and `last4` identifiers.

#### 2. [ViewCardModal.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/components/ViewCardModal.tsx)
Interactive and secure preview component:
- **Visual Card Representation**: Renders high-fidelity gradients based on the category (e.g., Purple for ID, Blue for Payment) showing relevant masked headers.
- **Information List**: Reads the detailed parameters of the `CardDetails` block mapping keys.
- **Copy Actions**: Includes built-in `expo-clipboard` functionality allowing the user to copy values directly to their clipboard.

#### 3. [PrimaryButton.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/components/PrimaryButton.tsx)
Universal pressable wrapper supporting color styles (primary gradient / ghost outlines), disabled opacities, and standard touch responses.

#### 4. [colors.ts](file:///e:/projects/cards_vault_mobile/cardvault/src/theme/colors.ts)
Declares the palette of the application (backgrounds, surfaces, brand colors like primary blue, success greens, and accent purples).

---

## 🚀 Key Security Invariants

When contributing to this codebase, always ensure the following rules are strictly followed:
1. **Never log secrets**: Do not print `keyBytes`, derived keys, salt, or mnemonics to `console.log`.
2. **Immediate Lock**: The `lockVault` action must clear the runtime reference of `keyBytes` to `null` to ensure the garbage collector purges the key material from memory.
3. **No Network Sync**: Keep the data storage sandboxed within `expo-file-system` and `expo-secure-store` unless explicitly requested and approved through a secure HTTPS endpoint.
