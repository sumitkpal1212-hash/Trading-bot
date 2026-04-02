import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// 1. Defined PORT globally so it can be used in both the server and the fetch call
const PORT = process.env.PORT || 3000;

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
            content: `BTC price: ${price}, RSI: ${rsi}, trend: ${trend}. Should I BUY, SELL or HOLD? Respond with only the word.`
          }
        ]
      })
    });

    const data = await response.json();

    res.json({
      decision: data.choices?.[0]?.message?.content || "HOLD"
    });

  } catch (err) {
    console.error("AI Route Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Auto trading (simulation)
let balance = 1000;
let btc = 0;

async function autoTrade() {
  try {
    // 2. Fix: Use the dynamic PORT variable instead of hardcoded 3000
    const res = await fetch(`http://localhost:${PORT}/ai`, {
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

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    const decision = data.decision ? data.decision.toUpperCase() : "";

    console.log("Decision:", decision);

    if (decision.includes("BUY") && balance > 100) {
      let amount = 100;
      btc += amount / 68000;
      balance -= amount;
      console.log("✅ BUY executed");
    } else if (decision.includes("SELL") && btc > 0) {
      balance += btc * 68000;
      btc = 0;
      console.log("✅ SELL executed");
    } else {
      console.log("No action taken (HOLD or insufficient funds/assets)");
    }

    console.log(`Current Balance: $${balance.toFixed(2)} | BTC: ${btc.toFixed(6)}`);

  } catch (err) {
    console.log("AutoTrade Loop Error:", err.message);
  }
}

// 3. Fix: Start the server FIRST, then start the interval inside the callback
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Starting the interval here ensures the server is actually listening 
  // before the first autoTrade attempt is made.
  setInterval(autoTrade, 15000);
});
