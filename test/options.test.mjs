import assert from 'node:assert/strict'
import test from 'node:test'
import {
  passkeyAuthenticatorEvidence, passkeyCreationOptions, passkeyProofOptions
} from '../src/index.mjs'

const challenge = {
  rpName: 'Example', userName: 'owner', userDisplayName: 'Owner', challenge: 'AQID', rpId: 'localhost', origin: 'http://localhost:4213',
  timeout: 60_000, expiresAtUnixMs: 70_000, userHandle: 'BAUG', credentialId: 'BwgJ'
}

test('binds both registration ceremonies to the same local device authenticator', () => {
  const creation = passkeyCreationOptions(challenge)
  assert.equal(creation.authenticatorSelection.authenticatorAttachment, 'platform')
  assert.equal(creation.authenticatorSelection.residentKey, 'required')
  assert.equal(creation.authenticatorSelection.requireResidentKey, true)
  assert.equal(creation.authenticatorSelection.userVerification, 'required')
  assert.deepEqual(creation.pubKeyCredParams.map(value => value.alg), [-7, -257])
  assert.equal('hints' in creation, false)
  assert.deepEqual(creation.extensions, { credProps: true })
  const proof = passkeyProofOptions(challenge, 10_000)
  assert.equal(proof.allowCredentials.length, 1)
  assert.deepEqual([...proof.allowCredentials[0].id], [7, 8, 9])
  assert.deepEqual(proof.allowCredentials[0].transports, ['internal'])
  assert.deepEqual(proof.hints, ['client-device'])
  assert.equal(proof.userVerification, 'required')
  assert.equal(proof.timeout, 60_000)
})

test('fails closed after the exact credential proof expires', () => {
  assert.throws(() => passkeyProofOptions(challenge, 70_000),
    /zixcel-webauthn-challenge-expired/u)
})

test('distinguishes a device-bound authenticator from a synced passkey', () => {
  const deviceBound = new Uint8Array(37)
  deviceBound[32] = 0x05
  assert.deepEqual(passkeyAuthenticatorEvidence(deviceBound), {
    userPresent: true, userVerified: true, backupEligible: false, backedUp: false
  })
  const synced = new Uint8Array(deviceBound)
  synced[32] = 0x1d
  assert.deepEqual(passkeyAuthenticatorEvidence(synced), {
    userPresent: true, userVerified: true, backupEligible: true, backedUp: true
  })
})

test('rejects malformed authenticator evidence', () => {
  assert.throws(() => passkeyAuthenticatorEvidence(new Uint8Array(36)),
    /zixcel-webauthn-options-invalid/u)
})
