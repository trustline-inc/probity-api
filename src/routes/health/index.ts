import { Router } from "express";
import { healthController } from "../../controllers";

const router = Router()

router.get("/", healthController.checkHealth);

export default router;