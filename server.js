import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// ===============================
// 🚀 TEST ROUTE
// ===============================
app.get("/", (req, res) => {
    res.json({ status: "OK", message: "Payout Backend Running 🚀" });
});

// ===============================
// 🚀 WITHDRAW ROUTE
// ===============================
app.post("/withdraw", async (req, res) => {
    try {
        const { amount, account_number, bank_code } = req.body;

        if (!amount || !account_number || !bank_code) {
            return res.status(400).json({
                status: "error",
                message: "amount, account_number & bank_code are required"
            });
        }

        // ============================
        // SEND REQUEST TO SQUAD
        // ============================
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

        console.log("SQUAD RESPONSE:", response.data);

        // ===============================
        // HANDLE SUCCESS
        // ===============================
        if (response.data?.success === true || response.data?.status === true) {
            return res.json({
                status: "success",
                message: "Transfer queued successfully",
                data: response.data
            });
        }

        // ===============================
        // HANDLE FAILED
        // ===============================
        return res.status(400).json({
            status: "failed",
            message: response.data?.message || "Transfer failed",
            data: response.data
        });

    } catch (err) {
        console.log("WITHDRAW ERROR:", err.response?.data || err.message);

        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            squad_error: err.response?.data || null
        });
    }
});

// ===============================
// 🚀 START SERVER
// ===============================
app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on PORT", process.env.PORT || 3000);
});
