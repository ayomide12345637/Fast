import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// LIVE SECRET KEY
const SQUAD_SECRET_KEY = process.env.SQUAD_SECRET_KEY;

// LIVE BASE URL
const BASE_URL = "https://api-d.squadco.com";

app.post("/withdraw", async (req, res) => {
    try {
        const { amount, account_number, bank_code } = req.body;

        if (!amount || !account_number || !bank_code) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields"
            });
        }

        // Convert Naira → Kobo
        const kobo = amount * 100;

        const payload = {
            amount: kobo,
            bank_code,
            account_number
        };

        const response = await axios.post(
            `${BASE_URL}/transaction/bank_transfer`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${SQUAD_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return res.json({
            status: "success",
            message: "Withdrawal initiated",
            squad_response: response.data
        });

    } catch (error) {
        console.error("Squad Error:", error.response?.data || error.message);

        return res.status(500).json({
            status: "error",
            message: error.response?.data?.message || "Internal server error",
            squad_error: error.response?.data || {}
        });
    }
});

// Railway uses process.env.PORT
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
