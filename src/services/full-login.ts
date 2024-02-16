import { ethers } from "ethers";
import { getNonce } from "./nonce";
import { SiweMessage } from "siwe";

const LOGIN_URL = "http://127.0.0.1:8080/api/v2/siwe/login";

async function getUserInfo(data:any) {
  const result = await fetch("http://localhost:4444/userinfo",
  {
    method: 'GET',
    headers: {
      Authorization: "Bearer " + data.access_token 
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log("USER INFO!!");
    console.log(data);
  })
  .catch(error => {
    console.error("failed to fetch user info");
    console.log(error);
  })

  return result
}

export async function accessToken() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code') || 'UNKNOWN';
  if (code) {
    console.log('Authorization Code:', code);
  } else {
    console.error('Authorization code not found in the URL');
  }

  const tokenEndpoint = 'http://localhost:4444/oauth2/token';
  const clientId = '3b279b11-c0b8-4150-8f3a-9ad7ee79502d';

  const headers = new Headers();
  headers.append('Content-Type', 'application/x-www-form-urlencoded');

  const urlEncodedBody = new URLSearchParams();
  urlEncodedBody.append('grant_type', 'authorization_code');
  urlEncodedBody.append('client_id', clientId);
  urlEncodedBody.append('redirect_uri', 'http://localhost:5173/callback');
  urlEncodedBody.append('code', code);
  urlEncodedBody.append('code_verifier', 'G2od-V2zubWEmy7G1JnhNwAr3Xz_hDsrAwvpK4J1XgyOmPGS');

  const access = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: headers,
    body: urlEncodedBody,
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      console.log('Access Token:', data.access_token);
      console.log('Id Token:', data.id_token);
      getUserInfo(data);
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
  console.log("NONCE RESULT", { nonceResult });

  // 2.1 create message
  const rawMessage = createMessage(address, chainId, nonceResult.nonce);
  const signature = await signMessage(rawMessage);

  // 2.2 login
  const loginResult = await fetch(LOGIN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-login-challenge": nonceResult.loginChallenge, // temp since cookies/cors failure
    },
    body: JSON.stringify({
      signature,
      raw_message: rawMessage,
      nonce: nonceResult.nonce,
    }),
    credentials: "include",
  }).then((res) => res.json());

  console.log("LOGIN RESULT", { loginResult });
  window.location.href = loginResult.redirect_to;
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
