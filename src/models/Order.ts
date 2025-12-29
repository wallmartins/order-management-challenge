import mongoose, { Schema } from 'mongoose';
import { IOrderDocument, OrderState, OrderStatus, ServiceStatus } from '../types';

const serviceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ServiceStatus),
      default: ServiceStatus.PENDING,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrderDocument>(
  {
    lab: {
      type: String,
      required: true,
    },
    patient: {
      type: String,
      required: true,
    },
    customer: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      enum: Object.values(OrderState),
      default: OrderState.CREATED,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.ACTIVE,
    },
    services: {
      type: [serviceSchema],
      required: true,
      validate: {
        validator: (services: unknown[]) => services.length > 0,
        message: 'Services array must contain at least one service',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<IOrderDocument>('Order', orderSchema);
