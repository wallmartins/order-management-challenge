import { Router } from "express";
import { orderController } from "../controllers";
import { authenticate, validate, validateQuery } from "../middlewares";
import { createOrderSchema, getOrdersQuerySchema, updateServiceStatusSchema } from "../validators";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createOrderSchema),
  orderController.createOrder
);

router.get(
  "/",
  authenticate,
  validateQuery(getOrdersQuerySchema),
  orderController.getOrders
);

router.patch("/:id/advance", authenticate, orderController.advanceOrderState);

router.patch(
  "/:orderId/services/:serviceIndex",
  authenticate,
  validate(updateServiceStatusSchema),
  orderController.updateServiceStatus
);

router.delete("/:id", authenticate, orderController.deleteOrder);

export default router;
