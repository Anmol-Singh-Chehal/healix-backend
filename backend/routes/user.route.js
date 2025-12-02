import { Router } from "express";
import { getUserDetails, refreshTheAccessToken, signIn, signOut, signUp, updateUserPassword } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/sign-up").post(signUp);
userRouter.route("/sign-in").post(signIn);
userRouter.route("/sign-out").post(verifyJwt, signOut);
userRouter.route("/refresh-token").post(refreshTheAccessToken);
userRouter.route("/update-password").post(verifyJwt, updateUserPassword);
userRouter.route("/get-user").get(verifyJwt, getUserDetails);

export default userRouter;