import express from "express";
import appRouter from "./app/index.js";
import userRouter from "./user/index.js";
import weiboLoginRouter from "./crawlers/weibo/index.js"

const router = express.Router();

router.use("/app", appRouter);

router.use("/user", userRouter);

router.use("/weibo", weiboLoginRouter);

export default router;
