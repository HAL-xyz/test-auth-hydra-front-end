const NONCE_URL = (address: string) =>
  `https://authentication.dev-api.cx.metamask.io/api/v2/nonce?address=${address}`;

export async function getNonce(address: string) {
  console.log(address);

  const result = await fetch(NONCE_URL(address),
  {
    method: 'GET',
  })
    .then((r) => r.json() as Promise<{ nonce: string; login_challenge: string }>)
    .then((d) => ({
      nonce: d.nonce,
      loginChallenge: d.login_challenge, // TEMP since cookies was failing
    }))

  return result;
}

