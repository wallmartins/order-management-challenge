import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as orderController from '@/controllers/order.controller';
import * as orderService from '@/services/order.service';
import { Request, Response } from 'express';
import { OrderState, OrderStatus, ServiceStatus } from '@/types';

vi.mock('@/services/order.service');

describe('Order Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      body: {},
      query: {},
      params: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const mockResult = {
        id: '123',
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [{ name: 'Service 1', value: 100 }],
      };

      vi.mocked(orderService.createOrder).mockResolvedValue(mockResult);

      await orderController.createOrder(mockRequest as Request, mockResponse as Response);

      expect(orderService.createOrder).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Order created successfully',
      });
    });

    it('should handle creation errors', async () => {
      mockRequest.body = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [{ name: 'Service 1', value: 100 }],
      };

      const error = new Error('Database error');
      vi.mocked(orderService.createOrder).mockRejectedValue(error);

      await orderController.createOrder(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to create order',
        details: 'Database error',
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockRequest.body = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [{ name: 'Service 1', value: 100 }],
      };

      vi.mocked(orderService.createOrder).mockRejectedValue('Unknown error');

      await orderController.createOrder(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to create order',
      });
    });
  });

  describe('getOrders', () => {
    it('should get orders successfully', async () => {
      const mockResult = {
        orders: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockRequest.query = {
        page: 1,
        limit: 10,
      };

      vi.mocked(orderService.getOrders).mockResolvedValue(mockResult);

      await orderController.getOrders(mockRequest as Request, mockResponse as Response);

      expect(orderService.getOrders).toHaveBeenCalledWith(mockRequest.query);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
    });

    it('should handle fetch errors', async () => {
      mockRequest.query = { page: 1, limit: 10 };

      const error = new Error('Database error');
      vi.mocked(orderService.getOrders).mockRejectedValue(error);

      await orderController.getOrders(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to fetch orders',
        details: 'Database error',
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockRequest.query = { page: 1, limit: 10 };

      vi.mocked(orderService.getOrders).mockRejectedValue('Unknown error');

      await orderController.getOrders(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to fetch orders',
      });
    });
  });

  describe('advanceOrderState', () => {
    it('should advance order state successfully', async () => {
      const mockResult = {
        id: '123',
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        state: OrderState.ANALYSIS,
        status: OrderStatus.ACTIVE,
        services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.params = { id: '123' };

      vi.mocked(orderService.advanceOrderState).mockResolvedValue(mockResult);

      await orderController.advanceOrderState(mockRequest as Request, mockResponse as Response);

      expect(orderService.advanceOrderState).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Order state advanced successfully',
      });
    });

    it('should handle order not found error', async () => {
      mockRequest.params = { id: '123' };

      const error = new Error('Order not found');
      vi.mocked(orderService.advanceOrderState).mockRejectedValue(error);

      await orderController.advanceOrderState(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Order not found',
      });
    });

    it('should handle final state error', async () => {
      mockRequest.params = { id: '123' };

      const error = new Error('Order is already in final state');
      vi.mocked(orderService.advanceOrderState).mockRejectedValue(error);

      await orderController.advanceOrderState(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Order is already in final state',
      });
    });

    it('should handle generic errors', async () => {
      mockRequest.params = { id: '123' };

      const error = new Error('Database error');
      vi.mocked(orderService.advanceOrderState).mockRejectedValue(error);

      await orderController.advanceOrderState(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to advance order state',
        details: 'Database error',
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockRequest.params = { id: '123' };

      vi.mocked(orderService.advanceOrderState).mockRejectedValue('Unknown error');

      await orderController.advanceOrderState(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to advance order state',
      });
    });

    it('should handle pending services error when advancing to COMPLETED', async () => {
      mockRequest.params = { id: '123' };

      const error = new Error('Cannot advance to COMPLETED. Pending services: Service 1, Service 2');
      vi.mocked(orderService.advanceOrderState).mockRejectedValue(error);

      await orderController.advanceOrderState(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Cannot advance to COMPLETED. Pending services: Service 1, Service 2',
      });
    });
  });

  describe('updateServiceStatus', () => {
    it('should update service status successfully', async () => {
      const mockResult = {
        id: '123',
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        services: [
          { name: 'Service 1', value: 100, status: ServiceStatus.DONE },
          { name: 'Service 2', value: 200, status: ServiceStatus.PENDING },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.params = { orderId: '123', serviceIndex: '0' };
      mockRequest.body = { status: ServiceStatus.DONE };

      vi.mocked(orderService.updateServiceStatus).mockResolvedValue(mockResult);

      await orderController.updateServiceStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(orderService.updateServiceStatus).toHaveBeenCalledWith('123', 0, {
        status: ServiceStatus.DONE,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Service status updated successfully',
      });
    });

    it('should handle order not found error', async () => {
      mockRequest.params = { orderId: '123', serviceIndex: '0' };
      mockRequest.body = { status: ServiceStatus.DONE };

      const error = new Error('Order not found');
      vi.mocked(orderService.updateServiceStatus).mockRejectedValue(error);

      await orderController.updateServiceStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Order not found',
      });
    });

    it('should handle service index out of bounds error', async () => {
      mockRequest.params = { orderId: '123', serviceIndex: '10' };
      mockRequest.body = { status: ServiceStatus.DONE };

      const error = new Error('Service index out of bounds');
      vi.mocked(orderService.updateServiceStatus).mockRejectedValue(error);

      await orderController.updateServiceStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Service index out of bounds',
      });
    });

    it('should handle generic errors', async () => {
      mockRequest.params = { orderId: '123', serviceIndex: '0' };
      mockRequest.body = { status: ServiceStatus.DONE };

      const error = new Error('Database error');
      vi.mocked(orderService.updateServiceStatus).mockRejectedValue(error);

      await orderController.updateServiceStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to update service status',
        details: 'Database error',
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockRequest.params = { orderId: '123', serviceIndex: '0' };
      mockRequest.body = { status: ServiceStatus.DONE };

      vi.mocked(orderService.updateServiceStatus).mockRejectedValue('Unknown error');

      await orderController.updateServiceStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to update service status',
      });
    });
  });

  describe('deleteOrder', () => {
    it('should delete order successfully', async () => {
      const mockResult = {
        id: '123',
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        state: OrderState.CREATED,
        status: OrderStatus.DELETED,
        services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.params = { id: '123' };

      vi.mocked(orderService.deleteOrder).mockResolvedValue(mockResult);

      await orderController.deleteOrder(mockRequest as Request, mockResponse as Response);

      expect(orderService.deleteOrder).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Order deleted successfully',
      });
    });

    it('should handle order not found error', async () => {
      mockRequest.params = { id: '123' };

      const error = new Error('Order not found');
      vi.mocked(orderService.deleteOrder).mockRejectedValue(error);

      await orderController.deleteOrder(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Order not found',
      });
    });

    it('should handle order already deleted error', async () => {
      mockRequest.params = { id: '123' };

      const error = new Error('Order is already deleted');
      vi.mocked(orderService.deleteOrder).mockRejectedValue(error);

      await orderController.deleteOrder(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Order is already deleted',
      });
    });

    it('should handle generic errors', async () => {
      mockRequest.params = { id: '123' };

      const error = new Error('Database error');
      vi.mocked(orderService.deleteOrder).mockRejectedValue(error);

      await orderController.deleteOrder(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to delete order',
        details: 'Database error',
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockRequest.params = { id: '123' };

      vi.mocked(orderService.deleteOrder).mockRejectedValue('Unknown error');

      await orderController.deleteOrder(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to delete order',
      });
    });
  });
});
