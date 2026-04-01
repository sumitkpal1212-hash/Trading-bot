import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// AI route
app.post("/ai", async (req, res) => {
  try {
    const { price, rsi, trend } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `BTC price: ${price}, RSI: ${rsi}, trend: ${trend}. Should I BUY, SELL or HOLD?`
          }
        ]
      })
    });

    const data = await response.json();

    res.json({
      decision: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (err) {
    console.log("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Auto trading (simulation)
let balance = 1000;
let btc = 0;

async function autoTrade() {
  try {
    const res = await fetch("http://localhost:3000/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        price: 68000,
        rsi: 30,
        trend: "UP"
      })
    });

    const data = await res.json();
    const decision = data.decision;

    console.log("Decision:", decision);

    if (decision.includes("BUY") && balance > 100) {
      let amount = 100;
      btc += amount / 68000;
      balance -= amount;
      console.log("BUY executed");
    }

    if (decision.includes("SELL") && btc > 0) {
      balance += btc * 68000;
      btc = 0;
      console.log("SELL executed");
    }

    console.log("Balance:", balance, "BTC:", btc);

  } catch (err) {
    console.log("AutoTrade Error:", err.message);
  }
}

// Run every 15 sec
setInterval(autoTrade, 15000);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
