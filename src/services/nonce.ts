const AUTH_ENDPOINT = "https://authentication.dev-api.cx.metamask.io";
export const AUTH_NONCE_ENDPOINT = `${AUTH_ENDPOINT}/api/v2/nonce`;
export const AUTH_LOGIN_ENDPOINT = `${AUTH_ENDPOINT}/api/v2/snaps/login`;

const OIDC_ENDPOINT = "https://oidc.dev-api.cx.metamask.io";
export const OIDC_TOKENS_ENDPOINT = `${OIDC_ENDPOINT}/oauth2/token`;
export const OIDC_CLIENT_ID = "8223d149-a75a-4fb1-8a5f-e19b19f558c6";
export const OIDC_GRANT_TYPE = "urn:ietf:params:oauth:grant-type:jwt-bearer";

export type NonceResponse = {
  nonce: string;
};
export async function getNonce(publicKey: string): Promise<string | null> {
  const nonceUrl = new URL(AUTH_NONCE_ENDPOINT);
  nonceUrl.searchParams.set("identifier", publicKey);

  try {
    const nonceResponse = await fetch(nonceUrl.toString());
    if (!nonceResponse.ok) {
      return null;
    }

    const nonceJson: NonceResponse = await nonceResponse.json();
    return nonceJson?.nonce ?? null;
  } catch (e) {
    console.error("authentication-controller/services: unable to get nonce", e);
    return null;
  }
}
