const CLIENT_ID = "76a9537a-60cf-4072-9ba1-a79fb320b428";
const NONCE_URL = (address: string) =>
  `http://localhost:4444/oauth2/auth?response_type=code&client_id=${CLIENT_ID}&address=${address}&redirect_uri=http://localhost:5173/callback&scope=openid%20offline&state=323e22wd`;

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

