import { ethers } from "ethers";
import { getNonce } from "./nonce";
import { SiweMessage } from "siwe";

const LOGIN_URL = "https://authentication.dev-api.cx.metamask.io/api/v2/siwe/login";

export async function accessToken(token:string) {
  const tokenEndpoint = 'https://oidc.dev-api.cx.metamask.io/oauth2/token';
  const clientId = '8223d149-a75a-4fb1-8a5f-e19b19f558c6';

  const headers = new Headers();
  headers.append('Content-Type', 'application/x-www-form-urlencoded');

  const urlEncodedBody = new URLSearchParams();
  urlEncodedBody.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
  urlEncodedBody.append('client_id', clientId);
  urlEncodedBody.append('assertion', token);
  /// urlEncodedBody.append('scope', []string{"scp1", "scp2"}); << we can config scope in hydra 

  const access = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: headers,
    body: urlEncodedBody,
  })
    .then(response => response.json())
    .then(data => {
      console.log("ACCESS TOKEN FROM HYDRA")
      console.log("***********************")
      console.log(data);
      console.log("***********************")
    })
    .catch((error) => {
      alert(error)
      console.error('Error:', error);
    });
  return access
}

export async function login() {
  const { address, chainId, signMessage } = await getLoginProps();

  // 1. get nonce
  const nonceResult = await getNonce(address);
  console.log("NONCE FROM AUTH API")
  console.log("***********************")
  console.log(nonceResult);
  console.log("***********************")

  // 2.1 create message
  const rawMessage = createMessage(address, chainId, nonceResult.nonce);
  const signature = await signMessage(rawMessage);

  // 2.2 login
  const loginResult = await fetch(LOGIN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      signature,
      raw_message: rawMessage,
      nonce: nonceResult.nonce,
    }),
  }).then((res) => res.json());

  console.log("SIWE LOGIN RESULT")
  console.log("***********************")
  console.log(loginResult);
  console.log("***********************")
  accessToken(loginResult.token)
}

async function getLoginProps() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const chainId = 1;

  return {
    address,
    chainId,
    signMessage: (message: string) => signer.signMessage(message),
  };
}

function createMessage(address: string, chainId: number, nonce: string) {
  return new SiweMessage({
    domain: window.location.host,
    address,
    uri: "http://localhost/some-login-endpoint", // i dont think this matters,
    version: "1",
    chainId,
    nonce,
    issuedAt: new Date().toISOString(),
  }).prepareMessage();
}
