// Zixcel-owned WebAuthn option builders. Credential ID and signature bind both ceremonies.

export function passkeyCreationOptions(value) {
  return {
    challenge: decode(value.challenge), rp: { id: localRp(value.rpId), name: display(value.rpName) },
    user: { id: decode(required(value.userHandle)), name: display(value.userName),
      displayName: display(value.userDisplayName) },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 },
      { type: 'public-key', alg: -257 }], timeout: timeout(value.timeout),
    authenticatorSelection: { authenticatorAttachment: 'platform', residentKey: 'required',
      requireResidentKey: true, userVerification: 'required' },
    attestation: 'none',
    extensions: { credProps: true }
  }
}

export function passkeyProofOptions(value, now = Date.now()) {
  const remaining = value.expiresAtUnixMs - now
  if (!Number.isSafeInteger(remaining) || remaining <= 0) {
    throw Error('zixcel-webauthn-challenge-expired')
  }
  return {
    challenge: decode(value.challenge), rpId: localRp(value.rpId),
    timeout: Math.min(timeout(value.timeout), remaining), userVerification: 'required',
    allowCredentials: [{ type: 'public-key', id: decode(required(value.credentialId)),
      transports: ['internal'] }],
    hints: ['client-device']
  }
}

/** Decodes the WebAuthn authenticator flags used by the local custody policy. */
export function passkeyAuthenticatorEvidence(value) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value)
  if (bytes.byteLength < 37) invalid()
  const flags = bytes[32]
  return {
    userPresent: (flags & 0x01) !== 0,
    userVerified: (flags & 0x04) !== 0,
    backupEligible: (flags & 0x08) !== 0,
    backedUp: (flags & 0x10) !== 0
  }
}
function localRp(value) { if (value !== 'localhost') invalid(); return value }
function timeout(value) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 300_000) invalid()
  return value
}
function required(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,131072}$/u.test(value)) invalid()
  return value
}
function decode(value) {
  const encoded = required(value)
  const binary = atob(encoded.replaceAll('-', '+').replaceAll('_', '/')
    .padEnd(Math.ceil(encoded.length / 4) * 4, '='))
  return Uint8Array.from(binary, item => item.charCodeAt(0))
}
function invalid() { throw Error('zixcel-webauthn-options-invalid') }

function display(value) {
  if (typeof value !== "string" || !value.trim() || value.length > 128) invalid()
  return value
}
