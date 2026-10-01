# Browser ceremony

This package implements the local device-bound profile, not arbitrary RP or
synced-credential policy. Callers reference the package interface and own UI integration.
Types are shipped for both option builders and browser operations.

```js
import { createPasskey, provePasskey } from '@zixcel/webauthn/browser'
// request() is the host's authorized transport, including its CSRF protection.
const { registration } = await request('/passkey/start', {})
const created = await createPasskey({ ...registration,
  rpName: 'Example application', userName: 'owner', userDisplayName: 'Owner' })
const next = await request('/passkey/stage', {
  registrationRef: registration.registrationRef, ...created
})
const proof = await provePasskey(next.registration)
await request('/passkey/confirm', {
  registrationRef: next.registration.registrationRef, ...proof
})
```

The authority must independently validate origin, RP, challenge freshness,
signature, credential identity and its own trust policy. Client evidence is not
authorization. A private key or recovery phrase is never returned by this API.

Independent verification: `pnpm test` and `pnpm test:browser` (pinned Playwright
Chromium required). The latter verifies a real browser's virtual-authenticator
signature using Node crypto; it does not claim Windows Hello hardware testing.
