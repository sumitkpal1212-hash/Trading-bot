import express from "express";

const app = express();

// REQUIRED root route
app.get("/", (req, res) => {
  res.send("Bot is running 🚀");
});

// IMPORTANT: Bind to 0.0.0.0
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
