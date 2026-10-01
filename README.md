# Zixcel WebAuthn

Version 0.10.0. Framework-independent browser ceremonies, option builders and
authenticator flag decoding. Callers explicitly provide RP/user display names, user handle,
challenge, expiry and credential identifier. Callers own identity and account integration.

The current profile is local, device-bound, resident and user-verifying. It
requires localhost and an internal authenticator; it is not a generic remote
RP or synced-key policy. Flags are evidence only: server-side signature, origin,
challenge and credential checks remain the relying party's responsibility.

Run `npm test` to check option bindings, expiration and authenticator evidence.
Run `npm run test:browser` for an isolated Playwright virtual-authenticator
ceremony with independently verified signatures; this is not a physical-device test.
The `@zixcel/webauthn/browser` export provides `createPasskey` and `provePasskey`.
See [browser ceremony integration](docs/browser-ceremony.md) for the explicit
Crowsi boundary and validation responsibilities.
Use `passkeyCreationOptions` with `navigator.credentials.create`, then
`passkeyProofOptions` with `navigator.credentials.get`. No network or storage
side effect occurs inside the package. Recovery logic belongs to the existing
zixcel-owner-recovery and Crowsi packages, not these browser utilities.

## Package integration

The package is an independently consumable unit. Callers reference its documented
interface through a versioned dependency and own application-specific composition
and integration.
