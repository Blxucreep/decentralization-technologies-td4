import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT } from "../config";
import { REGISTRY_PORT } from "../config";
import { generateRsaKeyPair, exportPubKey, exportPrvKey } from "../crypto";

export async function simpleOnionRouter(nodeId: number) {
  let lastReceivedEncryptedMessage: string | null = null;
  let lastReceivedDecryptedMessage: string | null = null;
  let lastMessageDestination: number | null = null;
  let lastMessageSource: number | null = null;

  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  // 1.1 implement the status route
  onionRouter.get("/status", (req, res) => {
    res.send("live");
  });

  // 2.1 nodes' GET routes
  // /getLastReceivedEncryptedMessage
  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    res.json({ result: lastReceivedEncryptedMessage });
  });
  // /getLastReceivedDecryptedMessage
  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    res.json({ result: lastReceivedDecryptedMessage });
  });
  // /getLastMessageDestination
  onionRouter.get("/getLastMessageDestination", (req, res) => {
    res.json({ result: lastMessageDestination });
  });
  // /getLastMessageDestination
  onionRouter.get("/getLastMessageSource", (req, res) => {
    res.json({ result: lastMessageSource });
  });

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      `Onion router ${nodeId} is listening on port ${
        BASE_ONION_ROUTER_PORT + nodeId
      }`
    );
  });

  // 3.2 create a pair of private and public key for each node
  // generate key pair
  const keyPair = await generateRsaKeyPair();
  const publicKey = await exportPubKey(keyPair.publicKey);
  const privateKey = await exportPrvKey(keyPair.privateKey);

  // 3.3 register each node
  const response = await fetch(`http://localhost:${REGISTRY_PORT}/registerNode`, {
    method: "POST",
    body: JSON.stringify({
      nodeId,
      pubKey: publicKey,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(await response.json());

  // /getPrivateKey
  onionRouter.get("/getPrivateKey", (req, res) => {
    res.json({ result: privateKey });
  });

  return server;
}
