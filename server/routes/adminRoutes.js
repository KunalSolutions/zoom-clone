import express from "express";

import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
} from "../controllers/adminController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerAdmin);

router.post("/login", loginAdmin);

router.get(
  "/profile",
  authMiddleware,
  getAdminProfile
);

export default router;