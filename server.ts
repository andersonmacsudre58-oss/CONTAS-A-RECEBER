import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Google Sheets Auth
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    console.warn("AVISO: Credenciais do Google Sheets não configuradas. As rotas de API podem falhar.");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey?.replace(/\\n/g, "\n"),
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
        return res.status(500).json({ error: "GOOGLE_SHEETS_ID não configurado nos Secrets." });
      }

      const { values } = req.body;
      
      // Usar apenas "A:AC" para acomodar as novas colunas
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "A:AC",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [values],
        },
      });

      res.json({ success: true, data: response.data });
    } catch (error: any) {
      console.error("Sheets Append Error:", error.response?.data || error.message);
      const detail = error.response?.data?.error?.message || error.message;
      res.status(500).json({ error: detail });
    }
  });

  app.get("/api/sheets/data", async (req, res) => {
    try {
      if (!spreadsheetId) {
        return res.status(500).json({ error: "GOOGLE_SHEETS_ID not configured" });
      }

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "A:AC",
      });

      res.json({ success: true, data: response.data.values || [] });
    } catch (error: any) {
      console.error("Sheets Get Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/sheets/update/:row", async (req, res) => {
    try {
      if (!spreadsheetId) {
        return res.status(500).json({ error: "GOOGLE_SHEETS_ID não configurado." });
      }

      const { row } = req.params;
      const { values } = req.body;

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `A${row}:AC${row}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [values],
        },
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Sheets Update Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/sheets/delete/:row", async (req, res) => {
    try {
      if (!spreadsheetId) {
        return res.status(500).json({ error: "GOOGLE_SHEETS_ID não configurado." });
      }

      const { row } = req.params;
      
      // Clearing the row is safer than deleting (which shifts rows and breaks index references)
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `A${row}:AC${row}`,
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Sheets Delete Error:", error);
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
