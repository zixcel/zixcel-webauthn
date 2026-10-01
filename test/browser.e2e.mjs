import assert from 'node:assert/strict'
import { createHash, createPublicKey, randomBytes, verify } from 'node:crypto'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { once } from 'node:events'
import { test } from '@playwright/test'

test('standalone WebAuthn creates and proves an exact device key in a real browser', async ({ browser }) => {
  const server = createServer(async (request, response) => {
    if (request.url === '/') {
      response.setHeader('Content-Type', 'text/html')
      response.end('<!doctype html><title>WebAuthn package test</title><script type="module">import * as api from "/browser.mjs"; window.api = api</script>')
    } else if (['/browser.mjs', '/index.mjs'].includes(request.url)) {
      response.setHeader('Content-Type', 'text/javascript')
      response.end(await readFile(new URL('../src' + request.url, import.meta.url)))
    } else { response.statusCode = 404; response.end() }
  })
  server.listen(0, '127.0.0.1'); await once(server, 'listening')
  const context = await browser.newContext()
  try {
    const page = await context.newPage(); const failures = []
    page.on('pageerror', error => failures.push(error.message))
    const cdp = await context.newCDPSession(page)
    await cdp.send('WebAuthn.enable')
    const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', { options: {
      protocol: 'ctap2', transport: 'internal', hasResidentKey: true,
      hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true
    } })
    const origin = 'http://localhost:' + server.address().port
    await page.goto(origin); await page.waitForFunction(() => Boolean(window.api))
    const challenge = { rpId: 'localhost', rpName: 'Package test', userName: 'owner',
      userDisplayName: 'Owner', userHandle: randomBytes(32).toString('base64url'),
      challenge: randomBytes(32).toString('base64url'), timeout: 60_000 }
    const registration = await page.evaluate(value => window.api.createPasskey(value), challenge)
    const createdClient = JSON.parse(Buffer.from(registration.clientDataJSON, 'base64url'))
    assert.equal(createdClient.challenge, challenge.challenge)
    assert.equal(createdClient.origin, origin); assert.equal(createdClient.type, 'webauthn.create')
    const proofChallenge = { ...challenge, credentialId: registration.credentialId,
      challenge: randomBytes(32).toString('base64url'), expiresAtUnixMs: Date.now() + 60_000 }
    const proof = await page.evaluate(value => window.api.provePasskey(value), proofChallenge)
    assert.equal(proof.credentialId, registration.credentialId)
    const clientData = Buffer.from(proof.clientDataJSON, 'base64url')
    const client = JSON.parse(clientData)
    assert.equal(client.challenge, proofChallenge.challenge); assert.equal(client.origin, origin)
    assert.equal(client.type, 'webauthn.get')
    const auth = Buffer.from(proof.authenticatorData, 'base64url')
    assert.deepEqual(auth.subarray(0, 32), createHash('sha256').update('localhost').digest())
    assert.equal(auth[32] & 0x1d, 5)
    const key = createPublicKey({ key: Buffer.from(registration.publicKeySpki, 'base64url'), type: 'spki', format: 'der' })
    const message = Buffer.concat([auth, createHash('sha256').update(clientData).digest()])
    assert.equal(verify('sha256', message, key, Buffer.from(proof.signature, 'base64url')), true)
    message[0] ^= 1
    assert.equal(verify('sha256', message, key, Buffer.from(proof.signature, 'base64url')), false)
    await cdp.send('WebAuthn.setUserVerified', { authenticatorId, isUserVerified: false })
    // The native browser either refuses the assertion or the strict client rejects it.
    await assert.rejects(page.evaluate(value => window.api.provePasskey(value), { ...proofChallenge, timeout: 100 }))
    assert.deepEqual(failures, [])
  } finally {
    await context.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve))
  }
})
