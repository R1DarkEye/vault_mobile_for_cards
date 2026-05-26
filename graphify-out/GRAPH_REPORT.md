# Graph Report - cards_vault_mobile  (2026-05-26)

## Corpus Check
- 44 files · ~77,457 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 279 nodes · 377 edges · 29 communities (17 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cd141d44`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 28|Community 28]]

## God Nodes (most connected - your core abstractions)
1. `useVault()` - 19 edges
2. `colors` - 15 edges
3. `expo` - 13 edges
4. `📂 Components & Theme (`src/components/` & `src/theme/`)` - 10 edges
5. `PrimaryButton()` - 8 edges
6. `📂 Screen Implementations (`src/screens/`)` - 7 edges
7. `encryptText()` - 6 edges
8. `VaultCard` - 6 edges
9. `CardVault Mobile - Codebase & Architecture Guide` - 6 edges
10. `Biometric Authentication Gate` - 6 edges

## Surprising Connections (you probably didn't know these)
- `HomeScreen()` --calls--> `useVault()`  [EXTRACTED]
  cardvault/src/screens/HomeScreen.tsx → cardvault/src/vault/VaultContext.tsx
- `AddCardModal()` --calls--> `useVault()`  [EXTRACTED]
  cardvault/src/components/AddCardModal.tsx → cardvault/src/vault/VaultContext.tsx
- `AppNavigator()` --calls--> `useVault()`  [EXTRACTED]
  cardvault/src/navigation/AppNavigator.tsx → cardvault/src/vault/VaultContext.tsx
- `CardsScreen()` --calls--> `useVault()`  [EXTRACTED]
  cardvault/src/screens/CardsScreen.tsx → cardvault/src/vault/VaultContext.tsx
- `OnboardingScreen()` --calls--> `useVault()`  [EXTRACTED]
  cardvault/src/screens/OnboardingScreen.tsx → cardvault/src/vault/VaultContext.tsx

## Hyperedges (group relationships)
- **Cryptographic Pipeline (Mnemonic → Key → Encryption)** — bip39_mnemonic, pbkdf2_key_derivation, aes_gcm_256_encryption, noble_ciphers_lib, noble_hashes_lib [EXTRACTED 1.00]
- **Vault Access Security Flow** — vault_state_machine, biometric_authentication, expo_secure_store, expo_local_authentication [EXTRACTED 1.00]
- **Security Design Invariants** — no_network_invariant, offline_first_architecture, biometric_authentication, aes_gcm_256_encryption [EXTRACTED 0.95]

## Communities (29 total, 12 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (27): AddCardModal(), ProfileData, Props, styles, PrimaryButton(), Props, styles, AppNavigator() (+19 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (29): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, projectId (+21 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (20): base64ToBytes(), bytesToBase64(), decryptText(), deriveKey(), deriveKeyAsync(), encryptText(), randomBytes(), textDecoder (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (23): dependencies, base64-js, expo, expo-clipboard, expo-crypto, expo-file-system, expo-font, expo-linear-gradient (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (20): AES-GCM-256 Encryption Engine, Biometric Authentication Gate, BIP-39 Mnemonic Passphrase, Card Type System (Payment, ID, Insurance, License), CardVault Application, expo-local-authentication, expo-secure-store, Expo React Native Framework (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (23): cardTypes, Props, styles, CardSliderProps, gradientMap, styles, { width }, Props (+15 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (13): buildType, build, development, preview, production, cli, version, developmentClient (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (12): devDependencies, @types/react, typescript, main, name, private, scripts, android (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (25): 1. [HomeScreen.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/screens/HomeScreen.tsx), 1. Key Derivation Function (KDF), 1. [VaultContext.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/vault/VaultContext.tsx), 2. [CardsScreen.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/screens/CardsScreen.tsx), 2. [crypto.ts](file:///e:/projects/cards_vault_mobile/cardvault/src/vault/crypto.ts), 2. Encryption Engine (AES-GCM-256), 3. [SecurityScreen.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/screens/SecurityScreen.tsx), 3. Storage Hierarchy (+17 more)

### Community 11 - "Community 11"
Cohesion: 0.50
Nodes (3): compilerOptions, strict, extends

### Community 19 - "Community 19"
Cohesion: 0.50
Nodes (3): CardVault, Development, Security Notes

### Community 28 - "Community 28"
Cohesion: 0.20
Nodes (10): 1. [AddCardModal.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/components/AddCardModal.tsx), 2. [ViewCardModal.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/components/ViewCardModal.tsx), 3. [EditProfileModal.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/components/EditProfileModal.tsx), 4. [PrimaryButton.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/components/PrimaryButton.tsx), 5. [CardSlider.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/components/CardSlider.tsx), 5. [Toast.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/components/Toast.tsx), 6. [colors.ts](file:///e:/projects/cards_vault_mobile/cardvault/src/theme/colors.ts), 6. [Toast.tsx](file:///e:/projects/cards_vault_mobile/cardvault/src/components/Toast.tsx) (+2 more)

## Knowledge Gaps
- **138 isolated node(s):** `java.compile.nullAnalysis.mode`, `name`, `slug`, `version`, `orientation` (+133 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 3` to `Community 4`, `Community 7`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Why does `Expo Secure Store` connect `Community 4` to `Community 2`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `Expo Local Authentication` connect `Community 4` to `Community 2`, `Community 5`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **What connects `java.compile.nullAnalysis.mode`, `name`, `slug` to the rest of the system?**
  _146 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09047619047619047 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1476923076923077 - nodes in this community are weakly interconnected._