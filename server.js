import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// ==========================================
// 🚀 TEST ROUTE
// ==========================================
app.get("/", (req, res) => {
    res.json({ message: "Payout Backend Running Successfully 🚀" });
});

// ==========================================
// 🚀 AUTO WITHDRAW ENDPOINT
// ==========================================
app.post("/withdraw", async (req, res) => {
    try {
        const { amount, account_number, bank_code } = req.body;

        if (!amount || !account_number || !bank_code) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields"
            });
        }

        // Squad API request
        const response = await axios.post(
            "https://sandbox-api.squadco.com/transfer",
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

        // If Squad says success
        if (response.data && response.data.status === true) {
            return res.json({
                status: "success",
                message: "Payout successful",
                data: response.data
            });
        } else {
            return res.status(400).json({
                status: "failed",
                message: "Payout failed",
                data: response.data
            });
        }

    } catch (err) {
        console.error("Payout Error:", err.response?.data || err.message);

        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            squad_error: err.response?.data || null
        });
    }
});

// ==========================================
// 🚀 START SERVER
// ==========================================
app.listen(process.env.PORT, () => {
    console.log(`Backend Running on PORT ${process.env.PORT}`);
});
