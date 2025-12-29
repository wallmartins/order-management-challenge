import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as orderService from '@/services/order.service';
import { Order } from '@/models';
import { OrderState, OrderStatus, ServiceStatus } from '@/types';

vi.mock('@/models');

describe('Order Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create a new order successfully', async () => {
      const mockOrder = {
        _id: '123',
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(Order.create).mockResolvedValue(mockOrder as any);

      const result = await orderService.createOrder({
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [{ name: 'Service 1', value: 100 }],
      });

      expect(Order.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: '123',
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
        createdAt: mockOrder.createdAt,
        updatedAt: mockOrder.updatedAt,
      });
    });

    it('should throw error if order creation fails', async () => {
      vi.mocked(Order.create).mockRejectedValue(new Error('Database error'));

      await expect(
        orderService.createOrder({
          lab: 'Lab Name',
          patient: 'Patient Name',
          customer: 'Customer Name',
          services: [{ name: 'Service 1', value: 100 }],
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('getOrders', () => {
    it('should get orders with pagination', async () => {
      const mockOrders = [
        {
          _id: '123',
          lab: 'Lab 1',
          patient: 'Patient 1',
          customer: 'Customer 1',
          state: OrderState.CREATED,
          status: OrderStatus.ACTIVE,
          services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockFind = {
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue(mockOrders),
      };

      vi.mocked(Order.find).mockReturnValue(mockFind as any);
      vi.mocked(Order.countDocuments).mockResolvedValue(1);

      const result = await orderService.getOrders({ page: 1, limit: 10 });

      expect(Order.find).toHaveBeenCalledWith({});
      expect(mockFind.skip).toHaveBeenCalledWith(0);
      expect(mockFind.limit).toHaveBeenCalledWith(10);
      expect(result.orders).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should filter orders by state', async () => {
      const mockOrders = [];
      const mockFind = {
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue(mockOrders),
      };

      vi.mocked(Order.find).mockReturnValue(mockFind as any);
      vi.mocked(Order.countDocuments).mockResolvedValue(0);

      await orderService.getOrders({ page: 1, limit: 10, state: OrderState.ANALYSIS });

      expect(Order.find).toHaveBeenCalledWith({ state: OrderState.ANALYSIS });
    });

    it('should handle pagination correctly', async () => {
      const mockOrders = [];
      const mockFind = {
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue(mockOrders),
      };

      vi.mocked(Order.find).mockReturnValue(mockFind as any);
      vi.mocked(Order.countDocuments).mockResolvedValue(25);

      const result = await orderService.getOrders({ page: 2, limit: 10 });

      expect(mockFind.skip).toHaveBeenCalledWith(10);
      expect(result.totalPages).toBe(3);
    });
  });

  describe('advanceOrderState', () => {
    it('should advance order from CREATED to ANALYSIS', async () => {
      const mockOrder = {
        _id: '123',
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
        createdAt: new Date(),
        updatedAt: new Date(),
        save: vi.fn(),
      };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);

      await orderService.advanceOrderState('123');

      expect(mockOrder.state).toBe(OrderState.ANALYSIS);
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('should throw error when advancing to COMPLETED with pending service', async () => {
      const mockOrder = {
        _id: '123',
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        state: OrderState.ANALYSIS,
        status: OrderStatus.ACTIVE,
        services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
        createdAt: new Date(),
        updatedAt: new Date(),
        save: vi.fn(),
      };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);

      await expect(orderService.advanceOrderState('123')).rejects.toThrow(
        'Cannot advance to COMPLETED. Pending services: Service 1'
      );
      expect(mockOrder.save).not.toHaveBeenCalled();
    });

    it('should throw error if order not found', async () => {
      vi.mocked(Order.findById).mockResolvedValue(null);

      await expect(orderService.advanceOrderState('123')).rejects.toThrow('Order not found');
    });

    it('should throw error if order is already in final state', async () => {
      const mockOrder = {
        _id: '123',
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        state: OrderState.COMPLETED,
        status: OrderStatus.ACTIVE,
        services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
        createdAt: new Date(),
        updatedAt: new Date(),
        save: vi.fn(),
      };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);

      await expect(orderService.advanceOrderState('123')).rejects.toThrow(
        'Order is already in final state'
      );
    });

    it('should return updated order after state advance', async () => {
      const mockOrder = {
        _id: '123',
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
        createdAt: new Date(),
        updatedAt: new Date(),
        save: vi.fn(),
      };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);

      const result = await orderService.advanceOrderState('123');

      expect(result.state).toBe(OrderState.ANALYSIS);
      expect(result.id).toBe('123');
    });

    it('should advance order from ANALYSIS to COMPLETED when all services are DONE', async () => {
      const mockOrder = {
        _id: '123',
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        state: OrderState.ANALYSIS,
        status: OrderStatus.ACTIVE,
        services: [
          { name: 'Service 1', value: 100, status: ServiceStatus.DONE },
          { name: 'Service 2', value: 200, status: ServiceStatus.DONE },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        save: vi.fn(),
      };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);

      const result = await orderService.advanceOrderState('123');

      expect(mockOrder.state).toBe(OrderState.COMPLETED);
      expect(mockOrder.save).toHaveBeenCalled();
      expect(result.state).toBe(OrderState.COMPLETED);
    });

    it('should throw error when advancing to COMPLETED with pending services', async () => {
      const mockOrder = {
        _id: '123',
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        state: OrderState.ANALYSIS,
        status: OrderStatus.ACTIVE,
        services: [
          { name: 'Service 1', value: 100, status: ServiceStatus.DONE },
          { name: 'Service 2', value: 200, status: ServiceStatus.PENDING },
          { name: 'Service 3', value: 150, status: ServiceStatus.PENDING },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        save: vi.fn(),
      };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);

      await expect(orderService.advanceOrderState('123')).rejects.toThrow(
        'Cannot advance to COMPLETED. Pending services: Service 2, Service 3'
      );
      expect(mockOrder.save).not.toHaveBeenCalled();
    });
  });

  describe('updateServiceStatus', () => {
    it('should update service status successfully', async () => {
      const mockOrder = {
        _id: '123',
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        services: [
          { name: 'Service 1', value: 100, status: ServiceStatus.PENDING },
          { name: 'Service 2', value: 200, status: ServiceStatus.PENDING },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        save: vi.fn(),
      };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);

      const result = await orderService.updateServiceStatus('123', 0, {
        status: ServiceStatus.DONE,
      });

      expect(mockOrder.services[0].status).toBe(ServiceStatus.DONE);
      expect(mockOrder.save).toHaveBeenCalled();
      expect(result.id).toBe('123');
    });

    it('should throw error if order not found', async () => {
      vi.mocked(Order.findById).mockResolvedValue(null);

      await expect(
        orderService.updateServiceStatus('123', 0, { status: ServiceStatus.DONE })
      ).rejects.toThrow('Order not found');
    });

    it('should throw error if service index is negative', async () => {
      const mockOrder = {
        _id: '123',
        services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
        save: vi.fn(),
      };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);

      await expect(
        orderService.updateServiceStatus('123', -1, { status: ServiceStatus.DONE })
      ).rejects.toThrow('Service index out of bounds');
    });

    it('should throw error if service index exceeds array length', async () => {
      const mockOrder = {
        _id: '123',
        services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
        save: vi.fn(),
      };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);

      await expect(
        orderService.updateServiceStatus('123', 5, { status: ServiceStatus.DONE })
      ).rejects.toThrow('Service index out of bounds');
    });

    it('should update last service in array', async () => {
      const mockOrder = {
        _id: '123',
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        services: [
          { name: 'Service 1', value: 100, status: ServiceStatus.PENDING },
          { name: 'Service 2', value: 200, status: ServiceStatus.PENDING },
          { name: 'Service 3', value: 300, status: ServiceStatus.PENDING },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        save: vi.fn(),
      };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);

      await orderService.updateServiceStatus('123', 2, { status: ServiceStatus.DONE });

      expect(mockOrder.services[2].status).toBe(ServiceStatus.DONE);
      expect(mockOrder.services[0].status).toBe(ServiceStatus.PENDING);
      expect(mockOrder.services[1].status).toBe(ServiceStatus.PENDING);
    });
  });

  describe('deleteOrder', () => {
    it('should delete order successfully', async () => {
      const mockOrder = {
        _id: '123',
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
        createdAt: new Date(),
        updatedAt: new Date(),
        save: vi.fn(),
      };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);

      const result = await orderService.deleteOrder('123');

      expect(mockOrder.status).toBe(OrderStatus.DELETED);
      expect(mockOrder.save).toHaveBeenCalled();
      expect(result.id).toBe('123');
      expect(result.status).toBe(OrderStatus.DELETED);
    });

    it('should throw error if order not found', async () => {
      vi.mocked(Order.findById).mockResolvedValue(null);

      await expect(orderService.deleteOrder('123')).rejects.toThrow('Order not found');
    });

    it('should throw error if order is already deleted', async () => {
      const mockOrder = {
        _id: '123',
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        state: OrderState.CREATED,
        status: OrderStatus.DELETED,
        services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
        createdAt: new Date(),
        updatedAt: new Date(),
        save: vi.fn(),
      };

      vi.mocked(Order.findById).mockResolvedValue(mockOrder as any);

      await expect(orderService.deleteOrder('123')).rejects.toThrow(
        'Order is already deleted'
      );
      expect(mockOrder.save).not.toHaveBeenCalled();
    });
  });
});
