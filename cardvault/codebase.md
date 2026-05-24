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
    │   ├── PrimaryButton.tsx  # Custom premium pressable with purple gradient and spring animations
    │   ├── AddCardModal.tsx   # Interactive sheet for secure card enrollment
    │   ├── EditProfileModal.tsx # Bottom-sheet modal for editing user profile
    │   ├── ViewCardModal.tsx  # Dynamic modal for previewing secure card data
    │   ├── CardSlider.tsx     # Premium credit card sliding selector with smooth snap animations
    │   └── Toast.tsx          # Custom premium animated banner notification overlay
    ├── navigation/            # Routing state machine
    │   └── AppNavigator.tsx   # Floating premium tab bar & FAB with custom purple gradient styling
    ├── theme/                 # Styling system
    │   └── colors.ts          # Core and accent color tokens
    ├── screens/               # Screen-level components
    │   ├── OnboardingScreen.tsx # Premium welcome flow with 3D-wallet, floating icons, and mnemonic recovery
    │   ├── UnlockScreen.tsx   # Premium glassmorphic biometric unlock gate
    │   ├── HomeScreen.tsx     # Lavender-to-pink dashboard with overview chips, CardSlider, and quick actions
    │   ├── CardsScreen.tsx    # Branded glassmorphic card list with search, sort, and filters
    │   ├── SecurityScreen.tsx # Security scores, actions, and biometrics monitor
    │   └── ProfileScreen.tsx  # Glassmorphic profile dashboard, settings, and logs
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
- A **32-byte master key** is derived from the mnemonic passphrase using **PBKDF2-HMAC-SHA256** with **10,000 iterations** (defined in [crypto.ts](file:///e:/projects/cards_vault_mobile/cardvault/src/vault/crypto.ts#L23-L35)). Since PBKDF2 runs in JavaScript, this computation is secure and heavy, taking 3-10s depending on device hardware. The app awaits this calculation naturally without any fragile timeout thresholds to avoid premature cancellation.

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
             | (Biometric-Gated Export)
     [HTML Template] --> (expo-print) --> [PDF File] --> (expo-sharing) --> [Native Share Sheet]
```

- **`vault.meta.json`**: Contains non-sensitive metadata (base64-encoded salt, timestamp, and a verification payload) stored in standard document directories.
- **`vault.enc`**: Contains the AES-GCM-256 encrypted vault JSON database payload.
- **Keychain / Keystore / Biometrics**: The raw 12-word passphrase is stored securely in the device's sandboxed environment utilizing `expo-secure-store`. Retrieval and view actions are strictly gated by explicit hardware-level biometric authentication prompts using `expo-local-authentication` (`LocalAuthentication.authenticateAsync`), which demands FaceID, TouchID, or OS passcodes before the key is read or decrypted.

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
  - `showToast(title, message, type)`: Triggers the global, animated spring notification overlay banner sliding down from the top of the viewport.

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
- **Design & Layout**: Styled with a beautiful, soft lavender-to-pink gradient background and modern, rounded glassmorphic panels. Uses `'DMSans'` for primary headings.
- **Overview Section**: Tallies card types dynamically (Payment, ID, Insurance, License, Others) inside elegant horizontal overview chips. Clicking any chip redirects to the filtered cards tab.
- **Hero Greeting Card**: Features a premium greetings panel ("Good morning, John 👋") with a 3D-wallet illustration and floating shield badge.
- **Card Slider**: Embeds the custom `CardSlider` inside a semi-transparent glass panel with thin white borders, allowing users to scroll securely through all payment/other cards.
- **Recent Activity Feed**: Displays recently modified cards with dynamic relative timestamps. Clicking any activity item opens the `ViewCardModal`.
- **Action Buttons**:
  - *Add Card*: Opens the secure bottom-sheet enrollment form modal.
  - *Scan Card*: Informational alert explaining camera scanner integration.
  - *Lock Vault*: Triggers vault security shutdown with confirmation alert.
  - *Backup Cards*: **Biometric-gated PDF export** utilizing `expo-local-authentication`, `expo-print`, and `expo-sharing`.

#### 2. [CardsScreen.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/screens/CardsScreen.tsx)
The interactive vault explorer:
- **Design**: Completely redesigned with the new lavender-to-pink gradient, premium glassmorphic cards, and curated filter chips.
- **Search Bar**: Live searching on names, descriptions, or last 4 digits of cards.
- **Filter & Sort**: Auto-updates lists by categories and allows alphabetical or chronological sorting.
- **Interactive Details**: Tapping any card pops up the secure `ViewCardModal`. Long-pressing triggers an elegant delete prompt.

#### 3. [SecurityScreen.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/screens/SecurityScreen.tsx)
Security posture and configuration dashboard:
- **Design**: Styled with a high-end gradient backdrop and glassmorphic list panels.
- **Vault Security Score**: Calculated dynamically and presented inside a clean, modern green-accent ring indicator.
- **Interactive Action Menu**: Allows changing credentials, viewing BIP39 recovery passphrases, checking device trusted status, and executing immediate secure lockdowns.

#### 4. [ProfileScreen.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/screens/ProfileScreen.tsx)
User settings and system parameters:
- **Design**: Built on a soft gradient background with transparent glassmorphic lists and components using DMSans fonts.
- **Summary Metrics**: Calculates card counts, active category tags, and duration/lifetime indicators.
- **Settings & Logging**: Bridges profile modifications via `EditProfileModal`, accesses system help menus, and gates vault logouts.

#### 5. [ProfileSetupScreen.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/screens/ProfileSetupScreen.tsx)
Gated profile personalization for new vaults:
- **Design**: Styled with lavender-to-pink gradient background stops, a premium glassmorphic setup card, and bold purple/indigo accent colors.
- **Fields**: Inputs for name, email, and phone, with animated validation error indicators.

#### 6. [UnlockScreen.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/screens/UnlockScreen.tsx)
Highly secure entry gate to decrypted vault:
- **Design**: Renders a stunning glassmorphic secure card on top of the soft background gradient, featuring a purple lock shield, giant interactive fingerprint icon, and clear `'DMSans'` titles.

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

#### 3. [EditProfileModal.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/components/EditProfileModal.tsx)
Functional bottom-sheet modal for editing user profile:
- **Editable Fields**: Full Name, Email Address, and Phone Number with validation.
- **Change Detection**: Save button is disabled unless the user has actually modified a field.
- **Premium Avatar Section**: Displays a styled avatar circle with "Change Photo" action button.
- **Keyboard Avoiding**: Uses `KeyboardAvoidingView` with `behavior="padding"` and `Keyboard.dismiss()` on backdrop tap to prevent field obstruction.
- **Error Handling**: Inline validation highlights empty required fields with a red border.

#### 4. [PrimaryButton.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/components/PrimaryButton.tsx)
Universal pressable wrapper supporting color styles (premium purple/indigo linear gradient / ghost outlines), disabled opacities, and standard touch responses.

#### 5. [CardSlider.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/components/CardSlider.tsx)
Custom credit card selector with horizontal swipepaging and snap-to-interval animations, showing branded details, contactless indicators, and beautiful gradient backgrounds.

#### 6. [Toast.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/components/Toast.tsx)
Premium, animated notification banner overlay:
- **Visual Harmony**: Employs dynamic icon and background color tones matching the context of the action (`success`, `error`, `info`) utilizing pre-defined colors.
- **Fluid Animation**: Implements spring physics animations (`Animated.spring`) for slide-down entries and smooth decay transitions, with custom timing-based opacity fades.
- **Hierarchical Resilience**: Can be triggered globally via the application-level context OR locally nested inside React Native native `<Modal>` sheets. This ensures that the notification banner displays flawlessly *on top* of active modals instead of being obscured by the OS-level modal window hierarchy.

#### 7. [colors.ts](file:///e:/projects/cards_vault_mobile/cardvault/src/theme/colors.ts)
Declares the palette of the application (soft lavender-to-pink gradient stops background, white semi-transparent glass surfaces, purple/indigo primary accents, success greens, and warning ambers).

---

## 🚀 Key Security Invariants

When contributing to this codebase, always ensure the following rules are strictly followed:
1. **Never log secrets**: Do not print `keyBytes`, derived keys, salt, or mnemonics to `console.log`.
2. **Immediate Lock**: The `lockVault` action must clear the runtime reference of `keyBytes` to `null` to ensure the garbage collector purges the key material from memory.
3. **No Network Sync**: Keep the data storage sandboxed within `expo-file-system` and `expo-secure-store` unless explicitly requested and approved through a secure HTTPS endpoint.
