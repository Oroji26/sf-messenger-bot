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

  // ถ้าเป็นข้อความ
  if (event.message?.text) {
    sendQuickMenu(sender);
  }

  // ถ้าเป็นการกดปุ่ม
  if (event.postback?.payload) {
    handlePostback(sender, event.postback.payload);
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
function sendQuickMenu(psid) {
  axios.post(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_TOKEN}`,
    {
      recipient: { id: psid },
      message: {
        text: "🍍 SF Season Fruit\nเลือกเมนูได้เลยครับ",
        quick_replies: [
          { content_type: "text", title: "📦 ราคา", payload: "PRICE" },
          { content_type: "text", title: "🛒 สั่งซื้อ", payload: "ORDER" },
          { content_type: "text", title: "📞 ติดต่อ", payload: "CONTACT" }
        ]
      }
    }
  );
}

function handlePostback(psid, payload) {
  let text = "";

  if (payload === "PRICE") {
    text = "📦 ราคาสับปะรดภูแล\nกล่องละ XXX บาท\nสดใหม่วันต่อวัน 🍍";
  } else if (payload === "ORDER") {
    text = "🛒 สั่งซื้อได้ที่ Inbox หรือ Line: 062-404-3999";
  } else if (payload === "CONTACT") {
    text = "📞 ติดต่อเรา\nLine: 062-404-3999\nFB: SF Season Fruit";
  }

  sendText(psid, text);
}
