const CLIENT_ID = "c4bc8e5a-2146-4652-9fa1-ed66bd496121";
const NONCE_URL = (address: string) =>
  `http://localhost:4444/oauth2/auth?response_type=code&client_id=${CLIENT_ID}&address=${address}&redirect_uri=http://localhost:3000/&scope=openid%20offline&state=323e22wd`;

export async function getNonce(address: string) {
  const result = await fetch(NONCE_URL(address))
    .then((r) => r.json() as Promise<{ nonce: string; challenge: string }>)
    .then((d) => ({
      nonce: d.nonce,
      loginChallenge: d.challenge, // TEMP since cookies was failing
    }));

  return result;
}
