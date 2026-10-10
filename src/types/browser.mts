/** Narrowed browser representation; every evidence buffer is validated at encoding. */
export interface CredentialRepresentation {
  rawId: unknown;
  response: Record<string, unknown>;
}
