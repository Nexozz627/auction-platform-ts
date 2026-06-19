import express from "express";
import { register, login, logout, googleAuth } from "../controllers/authController.js"; 
import { validateRequest } from "../middleware/validateRequest.js"; 
import { registerSchema } from "../validators/authValidators.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register",validateRequest(registerSchema), register);
router.post("/login" , login);
router.post("/logout" , logout);
router.post("/google", googleAuth);

router.get("/me", authMiddleware, (req, res) => {
    res.status(200).json({
        status: "success",
        user: req.user
    })
});


export default router;