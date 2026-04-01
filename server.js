import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.post("/ai", async (req, res) => {
  const { price, rsi, trend } = req.body;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${process.env.OPENAI_KEY}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: \`BTC \${price}, RSI \${rsi}, trend \${trend}. BUY SELL HOLD?\`
        }
      ]
    })
  });

  const data = await response.json();
  res.json({ decision: data.choices[0].message.content });
});

app.listen(3000, () => console.log("Server running"));
