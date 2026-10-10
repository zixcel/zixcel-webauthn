import type { CreationChallenge, ProofChallenge, RegistrationEvidence, AssertionEvidence, BrowserCredentials } from './types/contracts.mjs'
import type { CredentialRepresentation } from './types/browser.mjs'
export type { RegistrationEvidence, AssertionEvidence, BrowserCredentials } from './types/contracts.mjs'
import { passkeyCreationOptions, passkeyProofOptions, passkeyAuthenticatorEvidence } from './index.mjs'

// Only browser representation belongs here. Signature, challenge, origin and
// policy validation belong to the caller's authority, never to this UI helper.
export async function createPasskey(challenge: CreationChallenge, credentials: BrowserCredentials | undefined = globalThis.navigator?.credentials): Promise<RegistrationEvidence> {
  requireCredentials(credentials)
  const value = representation(await credentials.create({ publicKey: passkeyCreationOptions(challenge) }), 'creation-not-completed')
  const response = value.response
  if (typeof response.getAuthenticatorData !== 'function' || typeof response.getPublicKey !== 'function') {
    fail('credential-response-unsupported')
  }
  const authenticatorData: unknown = response.getAuthenticatorData()
  requireLocalVerification(authenticatorData)
  return { credentialId: encode(value.rawId), clientDataJSON: encode(response.clientDataJSON),
    authenticatorData: encode(authenticatorData), publicKeySpki: encode(response.getPublicKey()) }
}

export async function provePasskey(challenge: ProofChallenge, credentials: BrowserCredentials | undefined = globalThis.navigator?.credentials): Promise<AssertionEvidence> {
  requireCredentials(credentials)
  const value = representation(await credentials.get({ publicKey: passkeyProofOptions(challenge) }), 'proof-not-completed')
  if (encode(value.rawId) !== challenge.credentialId) fail('credential-mismatch')
  requireLocalVerification(value.response.authenticatorData)
  return { credentialId: encode(value.rawId), clientDataJSON: encode(value.response.clientDataJSON),
    authenticatorData: encode(value.response.authenticatorData), signature: encode(value.response.signature) }
}

function requireLocalVerification(value: unknown) {
  if (!(value instanceof ArrayBuffer) && !(value instanceof Uint8Array)) fail('response-invalid')
  const evidence = passkeyAuthenticatorEvidence(value)
  if (!evidence.userPresent || !evidence.userVerified) fail('user-verification-required')
  if (evidence.backupEligible || evidence.backedUp) fail('device-bound-credential-required')
}
function requireCredentials(value: BrowserCredentials | undefined): asserts value is BrowserCredentials {
  if (typeof value?.create !== 'function' || typeof value?.get !== 'function') fail('unavailable')
}
function encode(value: unknown): string {
  if (!(value instanceof ArrayBuffer) && !ArrayBuffer.isView(value)) fail('response-invalid')
  const bytes = ArrayBuffer.isView(value)
    ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength) : new Uint8Array(value)
  if (!bytes.length || bytes.length > 98_304) fail('response-invalid')
  let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '')
}
function fail(reason: string): never { throw new Error(`zixcel-webauthn-${reason}`) }

/** Accept WebAuthn-shaped values without assuming browser globals exist in Node. */
function representation(value: unknown, reason: string): CredentialRepresentation {
  if (!value || typeof value !== 'object' || !('type' in value) || value.type !== 'public-key') fail(reason)
  if (!('rawId' in value) || !('response' in value) || !value.response
    || typeof value.response !== 'object' || Array.isArray(value.response)) fail('response-invalid')
  return { rawId: value.rawId, response: value.response as Record<string, unknown> }
}
