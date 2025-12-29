import { Request, Response } from 'express';
import { orderService } from '../services';
import { sendSuccess, sendError } from '../utils';
import { CreateOrderInput, GetOrdersQuery, UpdateServiceStatusInput } from '../validators';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: CreateOrderInput = req.body;
    const result = await orderService.createOrder(data);
    sendSuccess(res, result, 201, 'Order created successfully');
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 'Failed to create order', 500, error.message);
    } else {
      sendError(res, 'Failed to create order', 500);
    }
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const query: GetOrdersQuery = (req as any).validatedQuery || req.query as unknown as GetOrdersQuery;
    const result = await orderService.getOrders(query);
    sendSuccess(res, result, 200);
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, 'Failed to fetch orders', 500, error.message);
    } else {
      sendError(res, 'Failed to fetch orders', 500);
    }
  }
};

export const advanceOrderState = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await orderService.advanceOrderState(id);
    sendSuccess(res, result, 200, 'Order state advanced successfully');
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Order not found') {
        sendError(res, 'Order not found', 404);
      } else if (error.message === 'Order is already in final state') {
        sendError(res, 'Order is already in final state', 400);
      } else if (error.message.includes('Cannot advance to COMPLETED')) {
        sendError(res, error.message, 400);
      } else {
        sendError(res, 'Failed to advance order state', 500, error.message);
      }
    } else {
      sendError(res, 'Failed to advance order state', 500);
    }
  }
};

export const updateServiceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, serviceIndex } = req.params;
    const data: UpdateServiceStatusInput = req.body;
    const result = await orderService.updateServiceStatus(
      orderId,
      parseInt(serviceIndex, 10),
      data
    );
    sendSuccess(res, result, 200, 'Service status updated successfully');
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Order not found') {
        sendError(res, 'Order not found', 404);
      } else if (error.message === 'Service index out of bounds') {
        sendError(res, 'Service index out of bounds', 400);
      } else {
        sendError(res, 'Failed to update service status', 500, error.message);
      }
    } else {
      sendError(res, 'Failed to update service status', 500);
    }
  }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await orderService.deleteOrder(id);
    sendSuccess(res, result, 200, 'Order deleted successfully');
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Order not found') {
        sendError(res, 'Order not found', 404);
      } else if (error.message === 'Order is already deleted') {
        sendError(res, 'Order is already deleted', 400);
      } else {
        sendError(res, 'Failed to delete order', 500, error.message);
      }
    } else {
      sendError(res, 'Failed to delete order', 500);
    }
  }
};
