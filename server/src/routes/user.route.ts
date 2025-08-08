import { Router } from "express";
import {
  registerUser,
  initializeUser,
  getUserData,
  loginUser,
  logoutUser,
  refreshAccessToken,
  sendOtp,
  verifyOtp,
  getUserById,
} from "../controllers/user.controller";
import { verifyUserJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/register").post(registerUser);
router.route("/initialize").post(initializeUser);
router.route("/me").get(verifyUserJWT, getUserData);
router.route("/id/:userId").get(verifyUserJWT, getUserById);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyUserJWT, logoutUser);
router.route("/refresh").post(refreshAccessToken);
router.route("/otp/send").post(sendOtp);
router.route("/otp/verify").post(verifyOtp);

export default router;
