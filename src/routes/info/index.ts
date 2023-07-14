import { Router } from "express";
import { version } from "../../../package.json"

const router = Router()

router.get("/", (_request, response) => {
  response.status(200).json({ version })
});

export default router;