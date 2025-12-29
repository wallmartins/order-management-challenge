import { z } from "zod";
import { OrderState, ServiceStatus } from "../types";

const serviceStatusValues = [
  ServiceStatus.PENDING,
  ServiceStatus.DONE,
] as const;
const orderStateValues = [
  OrderState.CREATED,
  OrderState.ANALYSIS,
  OrderState.COMPLETED,
] as const;

export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  value: z.number().positive("Service value must be positive"),
  status: z.enum(serviceStatusValues).optional(),
});

export const createOrderSchema = z.object({
  lab: z.string().min(1, "Lab is required"),
  patient: z.string().min(1, "Patient is required"),
  customer: z.string().min(1, "Customer is required"),
  services: z
    .array(serviceSchema)
    .min(1, "At least one service is required")
    .refine(
      (services) =>
        services.reduce((sum, service) => sum + service.value, 0) > 0,
      "Total order value must be greater than zero"
    ),
});

export const getOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  state: z.enum(orderStateValues).optional(),
});

export const updateServiceStatusSchema = z.object({
  status: z.enum(serviceStatusValues),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;
export type UpdateServiceStatusInput = z.infer<typeof updateServiceStatusSchema>;
