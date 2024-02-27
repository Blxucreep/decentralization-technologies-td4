import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT } from "../config";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  let lastReceivedMessage: string | null = null;
  let lastSentMessage: number | null = null;

  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  // 1.2 implement the status route
  _user.get("/status", (req, res) => {
    res.send("live");
  });

  // 2.2 user's GET routes
  // /getLastReceivedMessage
  _user.get("/getLastReceivedMessage", (req, res) => {
    res.json({ result: lastReceivedMessage });
  });
  // /getLastSentMessage
  _user.get("/getLastSentMessage", (req, res) => {
    res.json({ result: lastSentMessage });
  });

  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}
