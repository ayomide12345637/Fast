import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// ================================
// 🚀 TEST ROUTE
// ================================
app.get("/", (req, res) => {
    res.json({ message: "Payout Backend Running Successfully 🚀" });
});

// ================================
// 🚀 SQUAD PAYOUT ENDPOINT
// ================================
app.post("/withdraw", async (req, res) => {
    try {
        const { amount, account_number, bank_code } = req.body;

        if (!amount || !account_number || !bank_code) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields"
            });
        }

        // ================================
        // 🔴 CHANGE THIS URL BASED ON MODE
        // ================================
        const squadURL = process.env.SQUAD_MODE === "live"
            ? "https://api.squadco.com/transfer"
            : "https://sandbox-api.squadco.com/transfer";

        const response = await axios.post(
            squadURL,
            {
                amount: amount,
                bank_code: bank_code,
                account_number: account_number,
                currency: "NGN"
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.SQUAD_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // ================================
        // 🟢 SUCCESS
        // ================================
        if (response.data && response.data.status === true) {
            return res.json({
                status: "success",
                message: "Payout successful ✅",
                data: response.data
            });
        }

        // ================================
        // 🔴 FAILED (BUT VALID RESPONSE)
        // ================================
        return res.status(400).json({
            status: "failed",
            message: response.data.message || "Payout failed",
            squad: response.data
        });

    } catch (err) {
        const squadErr = err.response?.data;
        console.log("RAW Squad Error:", squadErr);

        // ================================
        // 🔥 CUSTOM ERROR DETECTION
        // ================================

        // 1️⃣ Insufficient balance
        if (squadErr?.message?.toLowerCase().includes("insufficient")) {
            return res.status(400).json({
                status: "failed",
                message: "Insufficient balance in your Squad wallet ❌",
                squad_error: squadErr
            });
        }

        // 2️⃣ Invalid bank or account
        if (
            squadErr?.message?.toLowerCase().includes("account") ||
            squadErr?.message?.toLowerCase().includes("bank")
        ) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid bank or account number ❌",
                squad_error: squadErr
            });
        }

        // 3️⃣ Default error
        return res.status(500).json({
            status: "error",
            message: "Something went wrong with payout ❌",
            squad_error: squadErr || err.message
        });
    }
});

// ================================
// 🚀 START SERVER
// ================================
app.listen(process.env.PORT || 3000, () => {
    console.log(`Backend Running on PORT ${process.env.PORT || 3000}`);
});
