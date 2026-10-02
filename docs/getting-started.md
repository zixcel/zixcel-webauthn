# Using @zixcel/webauthn

Build WebAuthn ceremony options and interpret browser evidence for a caller-owned identity flow.

## Before you start

The relying party supplies identities, challenges, expiry and credential records. This package does not become an identity authority.

## First steps

Run from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm test
```

## How to assess the result

- Prepare registration and authentication options.
- Decode and validate bounded evidence fields.

A passing source-level check establishes only what that check observes. Keep missing configuration, unavailable services and unverified deployment paths visible.

## Continue reading

[Repository overview](../README.md)
