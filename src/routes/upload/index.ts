import { Router } from "express";
import { uploadController, multer } from "../../controllers/upload";
import { isAuthenticatedClient } from "../../utils/middlewares";

const router = Router();

router.post("/", isAuthenticatedClient, multer, uploadController);

export default router;