import express from "express";
import { create } from "../controllers/itemsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { select } from "../controllers/itemsController.js";
import { createBid } from "../controllers/bidsController.js";
import { getActiveItems } from "../controllers/itemsController.js";

const router = express.Router();

router.get("/", getActiveItems);
router.post("/create", authMiddleware, create);
router.get("/:id", select);

router.post("/:id/bid",authMiddleware, createBid);

export default router;