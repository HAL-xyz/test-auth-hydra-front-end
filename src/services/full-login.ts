import { ethers } from "ethers";
import { getNonce } from "./nonce";
import { SiweMessage } from "siwe";

const LOGIN_URL = "http://127.0.0.1:8080/api/v1/siwe/login";

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
      login_challenge: nonceResult.loginChallenge, // temp since cookies/cors failure
    },
    body: JSON.stringify({
      signature,
      raw_message: rawMessage,
      nonce: nonceResult.nonce,
    }),
    credentials: "include",
  }).then((res) => res.json());

  console.log("LOGIN RESULT", { loginResult });
  window.location.href = loginResult.redirectTo;
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
