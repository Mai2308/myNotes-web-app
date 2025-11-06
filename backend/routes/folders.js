import express from "express";
import { createFolder, getFolders } from "../controllers/folderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createFolder);
router.get("/", protect, getFolders);

export default router;