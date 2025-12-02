import "../utils/injectEnv.js"

import Express from "express";
import Cors from "cors";
import CookieParser from "cookie-parser";

const app = Express();

app.use(Express.json({ limit: "18kb" }));
app.use(CookieParser());
app.use(Express.static("public"));
app.use(Cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store"); 
  next();
});


import userRouter from "./routes/user.route.js";

app.use("/v1/user", userRouter);

export default app;