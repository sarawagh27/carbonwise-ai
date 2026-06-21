const fs = require('fs');
const serverCode = fs.readFileSync('server.ts', 'utf8');

const splitMarker = '// VITE CLIENT INTEGRATION';
const splitIndex = serverCode.indexOf(splitMarker);
if (splitIndex === -1) throw new Error('Split comment not found');

// Find the line start of the split marker
const lineStart = serverCode.lastIndexOf('\n', splitIndex);
const appCode = serverCode.substring(0, lineStart) + '\nexport default app;\n';
fs.writeFileSync('app.ts', appCode);

const newServerCode = `import app from "./app.js";
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
    console.log(\`CarbonWise AI full-stack server running securely on port \${PORT}\`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(\`Port \${PORT} is already in use.\`);
    }
    throw error;
  });
}

if (!process.env.VERCEL) {
  initializeServer().catch((err) => {
    console.error("Critical server bootstrap error:", err);
  });
}
`;
fs.writeFileSync('server.ts', newServerCode);
console.log('Refactored correctly.');
