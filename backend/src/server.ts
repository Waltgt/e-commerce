import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler";
import { fail } from "./lib/apiResponse";
import authRoutes from "./modules/auth/auth.routes";

const app = express();
const PORT = process.env.PORT || 3000;
const INSTANCE_NAME = process.env.INSTANCE_NAME || "unknown";

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Health check: usado para verificar manualmente qué instancia respondió,
// útil para comprobar que Nginx está balanceando de verdad
app.get("/health", (req, res) => {
  res.json({ status: "ok", instance: INSTANCE_NAME });
});

// Rutas de la API se agregarán aquí conforme construyamos cada módulo
app.use("/api/auth", authRoutes);

// 404 para rutas no encontradas
app.use((req, res) => {
  res.status(404).json(fail("NOT_FOUND", "Recurso no encontrado"));
});

// Manejador de errores centralizado: SIEMPRE al final, después de todas las rutas
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[${INSTANCE_NAME}] Servidor escuchando en el puerto ${PORT}`);
});