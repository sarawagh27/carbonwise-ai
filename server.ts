import app from "./app.js";
import path from "path";
import express from "express";

const PORT = Number(process.env.PORT || 3000);

async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`CarbonWise AI full-stack server running securely on port ${PORT}`);
  });

  server.on("error", (error) => {
    if ((error as any).code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use.`);
    }
    throw error;
  });
}

if (!process.env.VERCEL) {
  initializeServer().catch((err) => {
    console.error("Critical server bootstrap error:", err);
  });
}
