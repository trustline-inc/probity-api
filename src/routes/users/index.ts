import { Router } from "express";
import { userController } from "../../controllers";

const router = Router()

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/:id", userController.getUser);
router.patch("/:id", userController.updateUser);

export default router;