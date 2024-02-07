const CLIENT_ID = "a03f59d7-5f38-414e-ae51-827e0d72ae75";
const NONCE_URL = (address: string) =>
  `http://localhost:4444/oauth2/auth?response_type=code&client_id=${CLIENT_ID}&address=${address}&redirect_uri=http://localhost:5173/callback&scope=openid%20offline&state=323e22wd&code_challenge=2GhciXN-1MJwKYFV0gNgoCwVHpgAYeBv2hFyICQQnsw&code_challenge_method=S256`;

export async function getNonce(address: string) {
  const result = await fetch(NONCE_URL(address),
  {
    credentials: 'include',
  })
    .then((r) => r.json() as Promise<{ nonce: string; challenge: string }>)
    .then((d) => ({
      nonce: d.nonce,
      loginChallenge: d.challenge, // TEMP since cookies was failing
    }));

  return result;
}

