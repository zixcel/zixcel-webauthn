import assert from 'node:assert/strict'
import test from 'node:test'
import { createPasskey, provePasskey } from '../src/browser.mjs'
test('serializes exact browser evidence and never accepts a different, synced or UV-less key', async () => {
  const bytes = new Uint8Array([1, 2, 3]); const auth = new Uint8Array(37); auth[32] = 5
  const challenge = { rpId: 'localhost', rpName: 'Example', userName: 'owner', userDisplayName: 'Owner',
    userHandle: 'AQID', credentialId: 'AQID', challenge: 'AQID', timeout: 60_000,
    expiresAtUnixMs: Date.now() + 60_000 }
  const response = { clientDataJSON: bytes, getAuthenticatorData: () => auth,
    getPublicKey: () => bytes, authenticatorData: auth, signature: bytes }
  const value = { type: 'public-key', rawId: bytes, response }
  const credentials = { create: async options => {
    assert.equal(options.publicKey.authenticatorSelection.userVerification, 'required'); return value
  }, get: async options => {
    assert.equal(options.publicKey.userVerification, 'required'); return value
  } }
  const registration = await createPasskey(challenge, credentials)
  assert.deepEqual(Object.keys(registration), ['credentialId', 'clientDataJSON', 'authenticatorData', 'publicKeySpki'])
  assert.equal(registration.credentialId, 'AQID')
  const proof = await provePasskey(challenge, credentials)
  assert.equal(proof.signature, 'AQID')
  assert.equal(proof.authenticatorData, registration.authenticatorData)
  await assert.rejects(provePasskey({ ...challenge, credentialId: 'BAUG' }, credentials), /credential-mismatch/u)
  auth[32] = 1
  await assert.rejects(createPasskey(challenge, credentials), /user-verification-required/u)
  auth[32] = 29
  await assert.rejects(provePasskey(challenge, credentials), /device-bound-credential-required/u)
  assert.equal('privateKey' in proof, false)
})
