import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Order } from '@/models';
import { OrderState, OrderStatus, ServiceStatus } from '@/types';

describe('Order Model', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Order.deleteMany({});
  });

  describe('Order Schema', () => {
    it('should create an order with valid data', async () => {
      const orderData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [
          {
            name: 'Service 1',
            value: 100,
          },
        ],
      };

      const order = await Order.create(orderData);

      expect(order).toBeDefined();
      expect(order.lab).toBe('Lab Name');
      expect(order.patient).toBe('Patient Name');
      expect(order.customer).toBe('Customer Name');
      expect(order.state).toBe(OrderState.CREATED);
      expect(order.status).toBe(OrderStatus.ACTIVE);
      expect(order.services).toHaveLength(1);
      expect(order.services[0].name).toBe('Service 1');
      expect(order.services[0].value).toBe(100);
      expect(order.services[0].status).toBe(ServiceStatus.PENDING);
    });

    it('should require lab field', async () => {
      const orderData = {
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [{ name: 'Service 1', value: 100 }],
      };

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should require patient field', async () => {
      const orderData = {
        lab: 'Lab Name',
        customer: 'Customer Name',
        services: [{ name: 'Service 1', value: 100 }],
      };

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should require customer field', async () => {
      const orderData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        services: [{ name: 'Service 1', value: 100 }],
      };

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should require services array', async () => {
      const orderData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
      };

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should reject empty services array', async () => {
      const orderData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [],
      };

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should default state to CREATED', async () => {
      const orderData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [{ name: 'Service 1', value: 100 }],
      };

      const order = await Order.create(orderData);

      expect(order.state).toBe(OrderState.CREATED);
    });

    it('should default status to ACTIVE', async () => {
      const orderData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [{ name: 'Service 1', value: 100 }],
      };

      const order = await Order.create(orderData);

      expect(order.status).toBe(OrderStatus.ACTIVE);
    });

    it('should default service status to PENDING', async () => {
      const orderData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [{ name: 'Service 1', value: 100 }],
      };

      const order = await Order.create(orderData);

      expect(order.services[0].status).toBe(ServiceStatus.PENDING);
    });

    it('should accept multiple services', async () => {
      const orderData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [
          { name: 'Service 1', value: 100 },
          { name: 'Service 2', value: 200 },
          { name: 'Service 3', value: 300 },
        ],
      };

      const order = await Order.create(orderData);

      expect(order.services).toHaveLength(3);
      expect(order.services[0].name).toBe('Service 1');
      expect(order.services[1].name).toBe('Service 2');
      expect(order.services[2].name).toBe('Service 3');
    });

    it('should allow setting custom state', async () => {
      const orderData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        state: OrderState.ANALYSIS,
        services: [{ name: 'Service 1', value: 100 }],
      };

      const order = await Order.create(orderData);

      expect(order.state).toBe(OrderState.ANALYSIS);
    });

    it('should allow setting custom status', async () => {
      const orderData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        status: OrderStatus.DELETED,
        services: [{ name: 'Service 1', value: 100 }],
      };

      const order = await Order.create(orderData);

      expect(order.status).toBe(OrderStatus.DELETED);
    });

    it('should allow setting custom service status', async () => {
      const orderData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [
          { name: 'Service 1', value: 100, status: ServiceStatus.DONE },
        ],
      };

      const order = await Order.create(orderData);

      expect(order.services[0].status).toBe(ServiceStatus.DONE);
    });

    it('should have timestamps', async () => {
      const orderData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [{ name: 'Service 1', value: 100 }],
      };

      const order = await Order.create(orderData);

      expect(order.createdAt).toBeInstanceOf(Date);
      expect(order.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on modification', async () => {
      const orderData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [{ name: 'Service 1', value: 100 }],
      };

      const order = await Order.create(orderData);
      const originalUpdatedAt = order.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      order.state = OrderState.ANALYSIS;
      await order.save();

      expect(order.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should validate state enum values', async () => {
      const orderData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        state: 'INVALID_STATE' as any,
        services: [{ name: 'Service 1', value: 100 }],
      };

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should validate status enum values', async () => {
      const orderData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        status: 'INVALID_STATUS' as any,
        services: [{ name: 'Service 1', value: 100 }],
      };

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should validate service status enum values', async () => {
      const orderData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [
          { name: 'Service 1', value: 100, status: 'INVALID_STATUS' as any },
        ],
      };

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should require service name', async () => {
      const orderData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [{ value: 100 }] as any,
      };

      await expect(Order.create(orderData)).rejects.toThrow();
    });

    it('should require service value', async () => {
      const orderData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [{ name: 'Service 1' }] as any,
      };

      await expect(Order.create(orderData)).rejects.toThrow();
    });
  });
});
