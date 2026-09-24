import multer from "multer";
import { AppError } from "../lib/AppError";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB, límite de negocio ya acordado
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const uploadProductImages = multer({
  storage: multer.memoryStorage(), // no se guarda en disco; va directo a MySQL como BLOB
  limits: { fileSize: MAX_FILE_SIZE, files: 5 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new AppError(400, "INVALID_FILE_TYPE", "Solo se permiten imágenes JPEG, PNG o WEBP"));
    }
    cb(null, true);
  },
});