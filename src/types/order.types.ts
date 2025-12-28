import { Document } from 'mongoose';

export enum OrderState {
  CREATED = 'CREATED',
  ANALYSIS = 'ANALYSIS',
  COMPLETED = 'COMPLETED',
}

export enum OrderStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

export enum ServiceStatus {
  PENDING = 'PENDING',
  DONE = 'DONE',
}

export interface IService {
  name: string;
  value: number;
  status: ServiceStatus;
}

export interface IOrder {
  lab: string;
  patient: string;
  customer: string;
  state: OrderState;
  status: OrderStatus;
  services: IService[];
}

export interface IOrderDocument extends IOrder, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderResponse {
  id: string;
  lab: string;
  patient: string;
  customer: string;
  state: OrderState;
  status: OrderStatus;
  services: IService[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaginatedOrdersResponse {
  orders: IOrderResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
