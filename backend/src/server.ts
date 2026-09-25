import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler";
import { fail } from "./lib/apiResponse";
import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./modules/products/product.routes";
import cartRoutes from "./modules/cart/cart.routes";
import orderRoutes from "./modules/orders/order.routes";
import userRoutes from "./modules/users/user.routes";
import reviewRoutes, { adminReviewRouter } from "./modules/reviews/review.routes";

const app = express();
const PORT = process.env.PORT || 3000;
const INSTANCE_NAME = process.env.INSTANCE_NAME || "unknown";

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());


app.get("/health", (req, res) => {
  res.json({ status: "ok", instance: INSTANCE_NAME });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/products/:id/reviews", reviewRoutes);
app.use("/api/admin/reviews", adminReviewRouter);

// 404 para rutas no encontradas
app.use((req, res) => {
  res.status(404).json(fail("NOT_FOUND", "Recurso no encontrado"));
});

// Manejador de errores centralizado
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[${INSTANCE_NAME}] Servidor escuchando en el puerto ${PORT}`);
});