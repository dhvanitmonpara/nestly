import { Router } from "express";
import * as UserController from "../controllers/user.controller";
import { verifyUserJWT } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import * as AuthSchemas from "../schema/user/auth.schema";
import * as RegistrationSchemas from "../schema/user/registration.schema";
import * as GoogleSchemas from "../schema/user/google.schema";

const router = Router();

// Public routes
router.post(
  "/register",
  validate(RegistrationSchemas.registrationSchema),
  UserController.registerUser
);
router.post(
  "/initialize",
  validate(RegistrationSchemas.initializeUserSchema),
  UserController.initializeUser
);
router.post(
  "/login",
  validate(AuthSchemas.logicSchema),
  UserController.loginUser
);
router.post(
  "/auth/finalize",
  validate(AuthSchemas.tempTokenSchema),
  UserController.handleTempToken
);
router.get(
  "/google/callback",
  validate(GoogleSchemas.googleCallbackSchema, "query"),
  UserController.googleCallback
);
router.post(
  "/oauth",
  validate(AuthSchemas.userOAuthSchema),
  UserController.handleUserOAuth
);
router.post("/refresh", UserController.refreshAccessToken);
router.post(
  "/otp/send",
  validate(AuthSchemas.sendOtpSchema),
  UserController.sendOtp
);
router.post(
  "/otp/verify",
  validate(AuthSchemas.verifyOtpSchema),
  UserController.verifyOtp
);

// Protected routes
router.use(verifyUserJWT);

router.get("/me", UserController.getUserData);
router.get(
  "/id/:userId",
  validate(AuthSchemas.userIdSchema, "params"),
  UserController.getUserById
);
router.post("/logout", UserController.logoutUser);
router.put("/update", UserController.updateUser);
router.get("/search/:query", UserController.searchUsers);

export default router;
