# @zixcel/webauthn

Build WebAuthn ceremony options and interpret browser evidence for a caller-owned identity flow.

## What you can do

- Prepare registration and authentication options.
- Decode and validate bounded evidence fields.

## Current scope

The relying party supplies identities, challenges, expiry and credential records. This package does not become an identity authority.

Package distribution is not activated by this documentation. Use the checked-in source and the declared dependency versions; published availability must be verified separately.

## Getting started

Use the package manager matching the checked-in lockfile and the Node.js version declared in `engines` in `package.json`. Run from this repository:

```sh
pnpm install --frozen-lockfile
pnpm test
```

## Documentation and source

[Usage guide](docs/getting-started.md)

[Detailed documentation](docs) · [Implementation and public interfaces](src) · [Verification cases](test) · [Contributing](CONTRIBUTING.md) · [Security reporting](SECURITY.md) · [License](LICENSE) · [Attribution notices](NOTICE)
