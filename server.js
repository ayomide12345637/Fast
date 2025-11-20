import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const SQUAD_SECRET = process.env.SQUAD_SECRET;

// --- ACCOUNT LOOKUP ---
app.post("/lookup", async (req, res) => {
  const { bank, account } = req.body;

  const response = await fetch("https://api.squadco.com/v1/banks/resolve", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SQUAD_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bank_code: bank,
      account_number: account,
    }),
  });

  const data = await response.json();
  res.json(data);
});

// --- PAYOUT / WITHDRAW ---
app.post("/withdraw", async (req, res) => {
  const { bank, account, amount } = req.body;
  const reference = "WD" + Date.now();

  const response = await fetch("https://api.squadco.com/v1/payout/initiate", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SQUAD_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reference: reference,
      amount: Number(amount),
      bank_code: bank,
      account_number: account,
    }),
  });

  const data = await response.json();
  res.json(data);
});

// --- REQUERY ---
app.get("/requery/:ref", async (req, res) => {
  const reference = req.params.ref;

  const response = await fetch(
    `https://api.squadco.com/v1/payout/verify/${reference}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${SQUAD_SECRET}`,
      },
    }
  );

  const data = await response.json();
  res.json(data);
});

// LISTEN
app.listen(3000, () => {
  console.log("Server running on port 3000");
});