/** Browser challenge and evidence contracts; no private key material is represented. */
export interface CreationChallenge {
  challenge: string
  rpId: 'localhost'
  rpName: string
  userHandle: string
  userName: string
  userDisplayName: string
  timeout: number
}
export interface ProofChallenge {
  challenge: string
  rpId: 'localhost'
  credentialId: string
  timeout: number
  expiresAtUnixMs: number
}
export interface AuthenticatorEvidence {
  userPresent: boolean
  userVerified: boolean
  backupEligible: boolean
  backedUp: boolean
}
export interface RegistrationEvidence {
  credentialId: string
  clientDataJSON: string
  authenticatorData: string
  publicKeySpki: string
}
export interface AssertionEvidence {
  credentialId: string
  clientDataJSON: string
  authenticatorData: string
  signature: string
}

/** Preserve the device hint until it is available in all supported DOM declarations. */
export interface DeviceBoundRequestOptions extends PublicKeyCredentialRequestOptions {
  hints: ['client-device'];
  allowCredentials: DeviceBoundDescriptor[];
}

export interface DeviceBoundCreationOptions extends PublicKeyCredentialCreationOptions {
  authenticatorSelection: {
    authenticatorAttachment: 'platform'; residentKey: 'required';
    requireResidentKey: true; userVerification: 'required';
  };
}
/** A browser-owned credential access port, also implemented by test-only virtual providers. */
export interface BrowserCredentials {
  create(options: { publicKey: DeviceBoundCreationOptions }): Promise<unknown>;
  get(options: { publicKey: DeviceBoundRequestOptions }): Promise<unknown>;
}

export interface DeviceBoundDescriptor extends PublicKeyCredentialDescriptor {
  id: Uint8Array<ArrayBuffer>;
  transports: ['internal'];
}
