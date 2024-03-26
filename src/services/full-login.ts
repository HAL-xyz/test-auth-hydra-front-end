import {
  AUTH_LOGIN_ENDPOINT,
  OIDC_CLIENT_ID,
  OIDC_GRANT_TYPE,
  OIDC_TOKENS_ENDPOINT,
  getNonce,
} from "./nonce";
import { MESSAGE_SIGNING_SNAP, connectSnap } from "./snap";

export type OAuthTokenResponse = {
  access_token: string;
  expires_in: number;
};
export async function getAccessToken(jwtToken: string): Promise<string | null> {
  const headers = new Headers({
    "Content-Type": "application/x-www-form-urlencoded",
  });

  const urlEncodedBody = new URLSearchParams();
  urlEncodedBody.append("grant_type", OIDC_GRANT_TYPE);
  urlEncodedBody.append("client_id", OIDC_CLIENT_ID);
  urlEncodedBody.append("assertion", jwtToken);

  try {
    const response = await fetch(OIDC_TOKENS_ENDPOINT, {
      method: "POST",
      headers,
      body: urlEncodedBody.toString(),
    });

    if (!response.ok) {
      return null;
    }

    const accessTokenResponse: OAuthTokenResponse = await response.json();
    return accessTokenResponse?.access_token ?? null;
  } catch (e) {
    console.error(
      "authentication-controller/services: unable to get access token",
      e
    );
    return null;
  }
}

export type LoginResponse = {
  token: string;
  expires_in: string;
  /**
   * Contains anonymous information about the logged in profile.
   *
   * @property identifier_id - a deterministic unique identifier on the method used to sign in
   * @property profile_id - a unique id for a given profile
   * @property metametrics_id - an anonymous server id
   */
  profile: {
    identifier_id: string;
    profile_id: string;
    metametrics_id: string;
  };
};
export async function login(signature: string, rawMessage: string) {
  try {
    const response = await fetch(AUTH_LOGIN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        signature,
        raw_message: rawMessage,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const loginResponse: LoginResponse = await response.json();
    return loginResponse ?? null;
  } catch (e) {
    console.error("authentication-controller/services: unable to login", e);
    return null;
  }
}

export function createLoginRawMessage(
  nonce: string,
  publicKey: string
): `metamask:${string}:${string}` {
  return `metamask:${nonce}:${publicKey}` as const;
}

// Actual implementation (shoving it in here just for testing)
export async function authenticateAndAuthorize() {
  // This connect snap is mandatory until we have preinstalled snaps
  console.log("Step 0 Start - Connect Snap");
  await connectSnap();
  const publicKey = await MESSAGE_SIGNING_SNAP.getPublicKey();
  console.log("Step 0 Complete");

  // 1. Get Nonce
  console.log("Step 1 - Get Nonce");
  const nonce = await getNonce(publicKey);
  if (!nonce) throw new Error("No nonce found");
  console.log("Step 1 Complete", { nonce });

  // 2. Create Message And Login
  console.log("Step 2 - Create Message & Login");
  const rawMessage = createLoginRawMessage(nonce, publicKey);
  const signature = await MESSAGE_SIGNING_SNAP.signMessage(rawMessage);
  console.log("Step 2 Intermediate Vars", { rawMessage, signature });
  const loginResult = await login(signature, rawMessage);
  const jwt = loginResult?.token;
  if (!jwt) throw new Error("Failed to Authenticate");
  console.log("Step 2 Complete", { loginResult });

  // 3. Trade in for Access Token
  console.log("Step 3 - Trade JWT for Access Token");
  const accessToken = await getAccessToken(jwt);
  if (!accessToken)
    throw new Error("Failed to Authorize and issue access token");
  console.log("Step 3 Complete", { accessToken });

  return accessToken;
}
