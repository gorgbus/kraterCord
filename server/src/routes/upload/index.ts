import { Router } from "express";
import { uploadController, multer } from "../../controllers/upload";
import { isAuthenticated } from "../../utils/middlewares";

const router = Router();

router.post("/", isAuthenticated, multer, uploadController);

export default router;