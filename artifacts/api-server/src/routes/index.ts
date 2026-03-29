import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import botRouter from "./bot";
import statsRouter from "./stats";
import settingsRouter from "./settings";
import sseRouter from "./sse";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/bot", botRouter);
router.use("/stats", statsRouter);
router.use("/settings", settingsRouter);
router.use("/sse", sseRouter);

export default router;
