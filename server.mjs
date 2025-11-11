import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Importa directamente tus handlers
import status from "./api/calendar/status.js";
import createEvent from "./api/calendar/create-event.js";
import authCallback from "./api/auth/callback.js";
import authGoogle from "./api/auth/google.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

// rutas API
app.get("/api/calendar/status", status);
app.post("/api/calendar/create-event", createEvent);
app.get("/api/auth/callback", authCallback);
app.get("/api/auth/google", authGoogle);

// servir tu frontend (vite build)
app.use(express.static(path.join(__dirname, "dist")));

app.listen(3000, () => console.log("? Servidor listo en http://localhost:3000"));
