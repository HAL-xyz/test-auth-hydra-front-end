const NONCE_URL = (address: string) =>
  `https://authentication.dev-api.cx.metamask.io/api/v2/nonce?identifier=${address}`;

export async function getNonce(address: string) {
  console.log(address);

  const result = await fetch(NONCE_URL(address),
  {
    method: 'GET',
  })
    .then((r) => r.json() as Promise<{ nonce: string }>)
    .then((d) => ({
      nonce: d.nonce
    }))

  return result;
}

