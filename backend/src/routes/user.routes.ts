import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import roleMiddleware from "../middleware/role.middleware";
import { getUsers, updateUserRole } from "../controllers/user.controller";

const router = Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  getUsers
);

router.patch(
  "/:id/role",
  authMiddleware,
  roleMiddleware("admin"),
  updateUserRole
);

export default router;