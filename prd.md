# Product Requirements Document

## Product

A native-style password manager app built with React Native and Expo, designed to start fast in Expo Go, keep the initial release simple, and introduce native Android autofill only after the core product is stable.

## Vision

Build a secure, local-first password manager with modern password storage, password generation, TOTP support, and encrypted backup/restore. Keep the MVP lightweight, fast to iterate, and free for users. Add Android autofill later as a native enhancement once the core experience is proven.

## Goals

- Deliver a polished password manager UI quickly using Expo.

- Store all sensitive data encrypted locally.

- Support password generation and TOTP codes.

- Provide local backup and restore first.

- Add Google Drive backup/sync later with minimal permissions.

- Add Android autofill only in the final stage.

- Keep the app free to use for the core experience.

## Non-Goals for Early Phases

- No native autofill service in the first build.

- No backend server.

- No user accounts outside Google sign-in for backup/sync.

- No multi-device account system managed by your own server.

- No complicated enterprise features.

- No browser extension in the initial version.

## Product Principles

- Local first.

- Encrypt everything sensitive.

- Keep the first version simple.

- Use Expo for speed early on.

- Add native complexity only when it clearly unlocks value.

- Minimize permissions and external dependencies.

## Target Users

- Individual users who want a simple password manager.

- Beginner to intermediate users who prefer local control.

- Users who want backup/restore without relying on a central server.

- Android users who may later want autofill in other apps.

## Core User Stories

- As a user, I can create and store login credentials securely.

- As a user, I can generate strong passwords.

- As a user, I can store and view TOTP secrets.

- As a user, I can unlock the vault with biometrics or a master password.

- As a user, I can back up my vault locally.

- As a user, I can restore my vault from a local backup.

- As a user, I can later sync my encrypted vault to Google Drive.

- As a user, I can later autofill credentials in other Android apps.

## Phased Delivery Plan

### Phase 1: Expo-first foundation

Focus on the app experience only. No native autofill code yet.

Deliverables:

- App shell and navigation.

- Onboarding flow.

- Master password setup.

- Vault unlock flow.

- Credential list screen.

- Add/edit/delete credential screens.

- Password generator UI.

- TOTP secret storage and code display.

- Search and basic organization.

- Local encryption and local database.

- Local backup/export.

- Local restore/import.

- Settings screen.

Success criteria:

- A user can install, set up, unlock, store credentials, generate passwords, and restore a backup.

- The app feels complete even without autofill.

- Development is fast in Expo Go or Expo development builds without native Android work.

### Phase 2: Cloud backup and sync

Add Google Drive backup and restore after the local product works well.

Deliverables:

- Google sign-in using browser-based OAuth.

- Consent screen and Drive API setup.

- Encrypted vault upload to Google Drive app data storage.

- Download and restore from Google Drive.

- Token storage and refresh handling.

- Sync status UI.

Success criteria:

- A user can connect Google Drive and back up encrypted data.

- The app never uploads plaintext vault data.

- Sync works without a backend.

### Phase 3: Native Android autofill

Add native autofill only after the UI, vault, and sync are stable.

Deliverables:

- Android AutofillService implementation.

- App/package and website matching.

- Dataset generation for login fields.

- Save flow for new credentials.

- User prompt to enable autofill in Android settings.

- Fallbacks for unsupported apps.

Success criteria:

- The app can fill credentials in supported Android apps.

- The autofill flow is reliable enough to be useful.

- Native complexity is isolated and does not slow initial product iteration.

## Functional Requirements

### Vault and Credentials

- Create, update, delete, and view credentials.

- Store title, username, password, URL/domain, notes, and tags.

- Support multiple accounts for the same site or app.

- Allow copy actions for username, password, and TOTP code.

### Password Generation

- Generate secure passwords with configurable length and character sets.

- Provide one-tap regenerate.

- Allow copying or auto-inserting into fields.

### TOTP

- Store TOTP secret securely.

- Display current OTP code and countdown.

- Support common OTP secret formats.

- Allow copy-to-clipboard.

### Security

- Encrypt vault data at rest.

- Keep sensitive tokens in secure storage.

- Require authentication before revealing secrets.

- Support biometrics as a convenience layer.

### Local Backup and Restore

- Export encrypted vault file locally.

- Import encrypted vault file locally.

- Confirm before overwrite.

- Validate backup file format before restore.

### Google Drive Backup and Restore

- Use browser-based OAuth.

- Request the minimum viable Drive scope.

- Store encrypted backup in Drive app data storage.

- Restore encrypted data from Drive.

- Handle token refresh.

### Autofill Later

- Detect app package names on Android.

- Detect website domains for web login forms.

- Return matching saved credentials.

- Prompt user to enable autofill in Android settings.

- Respect apps that cannot be filled.

## Data Model Draft

### Credential Entry

- id

- title

- username

- password

- urlOrDomain

- packageName

- displayLabel

- iconSource

- notes

- totpSecret

- category

- createdAt

- updatedAt

### Backup Metadata

- backupVersion

- createdAt

- vaultHash

- encryptionVersion

- syncSource

### Auth Metadata

- provider

- accessTokenReference

- refreshTokenReference

- tokenExpiry

- grantedScopes

## Tech Stack

### Phase 1 stack

- Expo React Native

- Zustand for state management

- Expo Secure Store for secrets

- Expo SQLite for local vault storage

- Expo File System for encrypted backup files

- Expo Local Authentication for biometrics

- A TOTP library such as otplib

### Phase 2 stack

- Expo AuthSession

- Expo Web Browser

- Google Cloud OAuth client setup

- Google Drive API calls through REST

### Phase 3 stack

- Native Android AutofillService

- Expo prebuild and development build

- Android native module code only for autofill

## Configuration Requirements

### Expo app configuration

- app name

- app slug

- app icon

- custom scheme

- Android package name

- iOS bundle identifier if later needed

- versioning configuration

### Google Cloud configuration

- Google Cloud project

- Drive API enabled

- OAuth consent screen configured

- Android OAuth client created

- SHA-1 certificate fingerprint registered

- package name registered

- redirect URI configured

### Security configuration

- Encryption key generation strategy

- Secure local secret storage

- Backup encryption strategy

- Session timeout policy

## UX Requirements

- Fast unlock.

- Clear vault list.

- One-tap copy actions.

- Simple add-entry flow.

- Password generator visible during creation.

- TOTP visible in credential detail screen.

- Backup and restore easy to find.

- Settings should explain what is local and what is cloud-based.

- Autofill should be introduced later as a dedicated Android feature, not part of the first UI sprint.

## Release Strategy

### Release 1

- Local vault

- Password generation

- TOTP

- Biometrics

- Local backup/restore

- No native autofill

- Expo-first build speed

### Release 2

- Google Drive backup/restore

- OAuth sign-in

- Sync status

### Release 3

- Android autofill service

- App matching and website matching

- Better icon detection and metadata matching

## Risks

- Autofill native work can slow early iteration if introduced too soon.

- Google OAuth setup can be confusing for beginners.

- Encryption and restore flow must be tested carefully to avoid data loss.

- Different Android apps will support autofill differently.

- Token refresh and sync edge cases can be tricky.

## Mitigation

- Delay autofill until the core app is stable.

- Keep the first version local-first and simple.

- Use encrypted backups only.

- Keep Google permissions minimal.

- Test restore flows repeatedly before cloud sync launch.

- Add autofill only after the app UI and vault behavior are dependable.

## Definition of Done for Phase 1

- User can create vault and unlock it.

- User can store and retrieve credentials.

- User can generate passwords.

- User can store and view TOTP codes.

- User can export and restore encrypted backups locally.

- App works well in Expo without native autofill code.

## Definition of Done for Phase 2

- User can sign in with Google.

- User can back up encrypted vault to Drive.

- User can restore from Drive.

- No plaintext secrets are uploaded.

## Definition of Done for Phase 3

- Android autofill works for supported login screens.

- App/package matching and website matching are reliable.

- Autofill setup is documented inside the app.

- Native code is isolated to the autofill layer only.
