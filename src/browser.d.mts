import type { CreationChallenge, ProofChallenge } from './index.mjs'
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
export function createPasskey(value: CreationChallenge, credentials?: CredentialsContainer): Promise<RegistrationEvidence>
export function provePasskey(value: ProofChallenge, credentials?: CredentialsContainer): Promise<AssertionEvidence>
