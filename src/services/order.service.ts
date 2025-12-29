import { Order } from '../models';
import {
  IOrderResponse,
  IPaginatedOrdersResponse,
  OrderState,
  OrderStatus,
  IOrderDocument,
} from '../types';
import { CreateOrderInput, GetOrdersQuery, UpdateServiceStatusInput } from '../validators';

const mapOrderToResponse = (order: IOrderDocument): IOrderResponse => {
  return {
    id: order._id.toString(),
    lab: order.lab,
    patient: order.patient,
    customer: order.customer,
    state: order.state,
    status: order.status,
    services: order.services,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

export const createOrder = async (data: CreateOrderInput): Promise<IOrderResponse> => {
  const order = await Order.create(data);
  return mapOrderToResponse(order);
};

export const getOrders = async (
  query: GetOrdersQuery
): Promise<IPaginatedOrdersResponse> => {
  const { page, limit, state } = query;

  const filter: { state?: OrderState } = {};
  if (state) {
    filter.state = state;
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Order.countDocuments(filter),
  ]);

  return {
    orders: orders.map(mapOrderToResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const advanceOrderState = async (orderId: string): Promise<IOrderResponse> => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  const stateTransitions: Record<OrderState, OrderState | null> = {
    [OrderState.CREATED]: OrderState.ANALYSIS,
    [OrderState.ANALYSIS]: OrderState.COMPLETED,
    [OrderState.COMPLETED]: null,
  };

  const nextState = stateTransitions[order.state];

  if (!nextState) {
    throw new Error('Order is already in final state');
  }

  // Validate all services are DONE before transitioning to COMPLETED
  if (nextState === OrderState.COMPLETED) {
    const pendingServices = order.services
      .map((service, index) => ({ ...service, index }))
      .filter((service) => service.status !== 'DONE');

    if (pendingServices.length > 0) {
      const pendingNames = pendingServices.map((s) => s.name).join(', ');
      throw new Error(
        `Cannot advance to COMPLETED. Pending services: ${pendingNames}`
      );
    }
  }

  order.state = nextState;
  await order.save();

  return mapOrderToResponse(order);
};

export const updateServiceStatus = async (
  orderId: string,
  serviceIndex: number,
  data: UpdateServiceStatusInput
): Promise<IOrderResponse> => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  if (serviceIndex < 0 || serviceIndex >= order.services.length) {
    throw new Error('Service index out of bounds');
  }

  order.services[serviceIndex].status = data.status;
  await order.save();

  return mapOrderToResponse(order);
};

export const deleteOrder = async (orderId: string): Promise<IOrderResponse> => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status === OrderStatus.DELETED) {
    throw new Error('Order is already deleted');
  }

  order.status = OrderStatus.DELETED;
  await order.save();

  return mapOrderToResponse(order);
};
