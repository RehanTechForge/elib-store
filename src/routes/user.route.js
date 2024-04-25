import express, { Router } from 'express';
import { loginUser, registerUser, logoutUser } from '../controllers/user.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(
    verifyJWT,
    logoutUser);


export default router;