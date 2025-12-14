const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const PAGE_TOKEN = process.env.PAGE_TOKEN;
const VERIFY_TOKEN = "verify123";

// สำหรับ Facebook ตรวจสอบ Webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// รับข้อความจาก Messenger
app.post("/webhook", (req, res) => {
  const entry = req.body.entry?.[0];
  const event = entry?.messaging?.[0];
  if (!event) return res.sendStatus(200);

  const sender = event.sender.id;
  const text = event.message?.text;

  if (text) {
    sendText(
      sender,
      "🍍 สวัสดีครับ SF Season Fruit\nพิมพ์:\n- ราคา\n- สั่งซื้อ\n- ติดต่อ"
    );
  }

  res.sendStatus(200);
});

function sendText(psid, text) {
  axios.post(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_TOKEN}`,
    {
      recipient: { id: psid },
      message: { text }
    }
  );
}

app.listen(process.env.PORT || 3000, () => {
  console.log("Bot is running");
});
