import { describe, it, expect } from 'vitest';
import {
  createOrderSchema,
  getOrdersQuerySchema,
  updateServiceStatusSchema,
} from '@/validators/order.validator';
import { OrderState, ServiceStatus } from '@/types';

describe('Order Validators', () => {
  describe('createOrderSchema', () => {
    it('should validate correct order data', () => {
      const validData = {
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

      const result = createOrderSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should validate order with multiple services', () => {
      const validData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [
          { name: 'Service 1', value: 50 },
          { name: 'Service 2', value: 100 },
        ],
      };

      const result = createOrderSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should validate service with status', () => {
      const validData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [
          {
            name: 'Service 1',
            value: 100,
            status: ServiceStatus.PENDING,
          },
        ],
      };

      const result = createOrderSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject empty services array', () => {
      const invalidData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [],
      };

      const result = createOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject services with zero total value', () => {
      const invalidData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [
          { name: 'Service 1', value: 0 },
        ],
      };

      const result = createOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject services with negative value', () => {
      const invalidData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [
          { name: 'Service 1', value: -100 },
        ],
      };

      const result = createOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject missing lab', () => {
      const invalidData = {
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [{ name: 'Service 1', value: 100 }],
      };

      const result = createOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject missing patient', () => {
      const invalidData = {
        lab: 'Lab Name',
        customer: 'Customer Name',
        services: [{ name: 'Service 1', value: 100 }],
      };

      const result = createOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject missing customer', () => {
      const invalidData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        services: [{ name: 'Service 1', value: 100 }],
      };

      const result = createOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject empty lab', () => {
      const invalidData = {
        lab: '',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [{ name: 'Service 1', value: 100 }],
      };

      const result = createOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject service with empty name', () => {
      const invalidData = {
        lab: 'Lab Name',
        patient: 'Patient Name',
        customer: 'Customer Name',
        services: [{ name: '', value: 100 }],
      };

      const result = createOrderSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('getOrdersQuerySchema', () => {
    it('should validate query with all parameters', () => {
      const validQuery = {
        page: '2',
        limit: '20',
        state: OrderState.CREATED,
      };

      const result = getOrdersQuerySchema.safeParse(validQuery);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(20);
        expect(result.data.state).toBe(OrderState.CREATED);
      }
    });

    it('should validate query without parameters', () => {
      const validQuery = {};

      const result = getOrdersQuerySchema.safeParse(validQuery);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it('should validate query with only page', () => {
      const validQuery = { page: '3' };

      const result = getOrdersQuerySchema.safeParse(validQuery);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(10);
      }
    });

    it('should validate query with only state', () => {
      const validQuery = { state: OrderState.ANALYSIS };

      const result = getOrdersQuerySchema.safeParse(validQuery);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state).toBe(OrderState.ANALYSIS);
      }
    });

    it('should transform page string to number', () => {
      const validQuery = { page: '5' };

      const result = getOrdersQuerySchema.safeParse(validQuery);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.page).toBe('number');
        expect(result.data.page).toBe(5);
      }
    });

    it('should transform limit string to number', () => {
      const validQuery = { limit: '50' };

      const result = getOrdersQuerySchema.safeParse(validQuery);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.limit).toBe('number');
        expect(result.data.limit).toBe(50);
      }
    });

    it('should reject invalid state', () => {
      const invalidQuery = { state: 'INVALID_STATE' };

      const result = getOrdersQuerySchema.safeParse(invalidQuery);

      expect(result.success).toBe(false);
    });
  });

  describe('updateServiceStatusSchema', () => {
    it('should validate PENDING status', () => {
      const validData = { status: ServiceStatus.PENDING };

      const result = updateServiceStatusSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe(ServiceStatus.PENDING);
      }
    });

    it('should validate DONE status', () => {
      const validData = { status: ServiceStatus.DONE };

      const result = updateServiceStatusSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe(ServiceStatus.DONE);
      }
    });

    it('should reject invalid status', () => {
      const invalidData = { status: 'INVALID_STATUS' };

      const result = updateServiceStatusSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject missing status', () => {
      const invalidData = {};

      const result = updateServiceStatusSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });
});
