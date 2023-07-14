import { Router } from "express";
import { eventsController } from "../../controllers";

const router = Router()

router.get("/modern_treasury", eventsController.modernTreasuryWebhookEndpoint);

export default router;