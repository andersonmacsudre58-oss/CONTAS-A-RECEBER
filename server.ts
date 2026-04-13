import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Google Sheets Auth
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/sheets/append", async (req, res) => {
    try {
      if (!spreadsheetId) {
        return res.status(500).json({ error: "GOOGLE_SHEETS_ID not configured" });
      }

      const { values } = req.body; // Array of values
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Sheet1!A:L",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [values],
        },
      });

      res.json({ success: true, data: response.data });
    } catch (error: any) {
      console.error("Sheets Append Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/sheets/data", async (req, res) => {
    try {
      if (!spreadsheetId) {
        return res.status(500).json({ error: "GOOGLE_SHEETS_ID not configured" });
      }

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Sheet1!A:L",
      });

      res.json({ success: true, data: response.data.values || [] });
    } catch (error: any) {
      console.error("Sheets Get Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
