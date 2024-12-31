import express from "express";
import appRouter from "./app/index.js";
import userRouter from "./user/index.js"

const router = express.Router();

router.use("/app", appRouter);

router.use("/user", userRouter);

export default router;
