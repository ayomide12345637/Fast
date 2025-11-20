import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// =========================
//   TEST ROUTE
// =========================
app.get("/", (req, res) => {
    res.json({ message: "Payout Backend Running Successfully 🚀" });
});

// =========================
//   WITHDRAWAL ENDPOINT
// =========================
app.post("/withdraw", async (req, res) => {
    try {
        const { amount, account_number, bank_code } = req.body;

        if (!amount || !account_number || !bank_code) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields"
            });
        }

        const squadURL = "https://api.squadco.com/transfer"; // LIVE ENDPOINT

        const response = await axios.post(
            squadURL,
            {
                amount,
                bank_code,
                account_number,
                currency: "NGN"
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.SQUAD_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return res.json({
            status: "success",
            message: "Transfer completed",
            data: response.data
        });

    } catch (error) {
        console.log("FULL ERROR:", error.response?.data);

        return res.status(500).json({
            status: "error",
            message: error.response?.data?.message || "Internal server error",
            squad_error: error.response?.data || null
        });
    }
});

// =========================
//   START SERVER
// =========================
app.listen(process.env.PORT, () => {
    console.log(`Backend Running on PORT ${process.env.PORT}`);
});
