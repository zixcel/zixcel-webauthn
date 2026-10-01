import { passkeyCreationOptions, passkeyProofOptions, passkeyAuthenticatorEvidence } from './index.mjs'

// Only browser representation belongs here. Signature, challenge, origin and
// policy validation belong to the caller's authority, never to this UI helper.
export async function createPasskey(challenge, credentials = globalThis.navigator?.credentials) {
  requireCredentials(credentials)
  const value = await credentials.create({ publicKey: passkeyCreationOptions(challenge) })
  if (!value || value.type !== 'public-key') fail('creation-not-completed')
  const response = value.response
  if (typeof response.getAuthenticatorData !== 'function' || typeof response.getPublicKey !== 'function') {
    fail('credential-response-unsupported')
  }
  const authenticatorData = response.getAuthenticatorData()
  requireLocalVerification(authenticatorData)
  return { credentialId: encode(value.rawId), clientDataJSON: encode(response.clientDataJSON),
    authenticatorData: encode(authenticatorData), publicKeySpki: encode(response.getPublicKey()) }
}

export async function provePasskey(challenge, credentials = globalThis.navigator?.credentials) {
  requireCredentials(credentials)
  const value = await credentials.get({ publicKey: passkeyProofOptions(challenge) })
  if (!value || value.type !== 'public-key') fail('proof-not-completed')
  if (encode(value.rawId) !== challenge.credentialId) fail('credential-mismatch')
  requireLocalVerification(value.response.authenticatorData)
  return { credentialId: encode(value.rawId), clientDataJSON: encode(value.response.clientDataJSON),
    authenticatorData: encode(value.response.authenticatorData), signature: encode(value.response.signature) }
}

function requireLocalVerification(value) {
  const evidence = passkeyAuthenticatorEvidence(value)
  if (!evidence.userPresent || !evidence.userVerified) fail('user-verification-required')
  if (evidence.backupEligible || evidence.backedUp) fail('device-bound-credential-required')
}
function requireCredentials(value) {
  if (typeof value?.create !== 'function' || typeof value?.get !== 'function') fail('unavailable')
}
function encode(value) {
  if (!(value instanceof ArrayBuffer) && !ArrayBuffer.isView(value)) fail('response-invalid')
  const bytes = ArrayBuffer.isView(value)
    ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength) : new Uint8Array(value)
  if (!bytes.length || bytes.length > 98_304) fail('response-invalid')
  let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '')
}
function fail(reason) { throw new Error(`zixcel-webauthn-${reason}`) }
