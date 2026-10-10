# @zixcel/webauthn

Build device-bound WebAuthn options and browser evidence for a caller-owned localhost identity flow.

## What you can do

- Prepare registration and authentication options.
- Decode and validate bounded evidence fields.

## Current scope

The relying party supplies identities, challenges, expiry and credential records. This package does not become an identity authority.

Package distribution is not activated by this documentation. Use the checked-in source and the declared dependency versions; published availability must be verified separately.

## Getting started

Use the package manager matching the checked-in lockfile and the Node.js version declared in `engines` in `package.json`. Run from this repository:

```sh
npm ci --ignore-scripts
npm run typecheck
npm test
```

## Documentation and source

[Usage guide](docs/getting-started.md)

[Detailed documentation](docs) · [Implementation and public interfaces](src) · [Verification cases](test) · [Contributing](CONTRIBUTING.md) · [Security reporting](SECURITY.md) · [License](LICENSE) · [Attribution notices](NOTICE)

## Development and typed boundaries

Develop with Node.js 24. Runtime source is TypeScript in `src/`; shared challenge and evidence types live
in `src/types/`. Run `npm ci --ignore-scripts`, `npm run typecheck`, and `npm test`.
The build emits ESM and matching declarations to `dist/`. Package exports use
these generated files. No credential signature or authorization is verified by
the browser adapter; the server authority owns those checks.

## Host integration

The adapter supports the `localhost` relying party and a platform authenticator
with user verification. The identity authority must issue the challenge and
validate the returned signature, origin, expiry and exact credential binding.

```ts
import { createPasskey, type RegistrationEvidence } from '@zixcel/webauthn/browser'
import type { CreationChallenge } from '@zixcel/webauthn'

export async function collectRegistrationEvidence(
  challengeIssuedByAuthority: CreationChallenge,
): Promise<RegistrationEvidence> {
  return createPasskey(challengeIssuedByAuthority)
}
```

Send the evidence to the issuing authority; this browser result does not grant
access. Private keys remain in the authenticator. Development uses a virtual
authenticator; tests do not exercise a real account or hardware credential.
