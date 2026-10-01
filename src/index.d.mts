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
export function passkeyCreationOptions(value: CreationChallenge): PublicKeyCredentialCreationOptions
export function passkeyProofOptions(value: ProofChallenge, now?: number): PublicKeyCredentialRequestOptions
export function passkeyAuthenticatorEvidence(value: ArrayBuffer | Uint8Array): AuthenticatorEvidence
