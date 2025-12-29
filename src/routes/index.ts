import { Router } from 'express';
import authRoutes from './auth.routes';
import orderRoutes from './order.routes';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    message: 'Order Management API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
      },
      orders: {
        create: 'POST /api/orders',
        list: 'GET /api/orders',
        advance: 'PATCH /api/orders/:id/advance',
        updateService: 'PATCH /api/orders/:orderId/services/:serviceIndex',
        delete: 'DELETE /api/orders/:id',
      },
      health: 'GET /health',
    },
  });
});

router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);

export default router;
