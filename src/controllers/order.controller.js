import { createOrder, listOrders } from '../services/order.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateCreateOrder } from '../validators/order.validators.js';

export const create = asyncHandler(async (req, res) => {
  const payload = validateCreateOrder(req.body);
  const order = await createOrder(payload, req.auth?.sub);
  res.status(201).json({ success: true, data: { order } });
});

export const mine = asyncHandler(async (req, res) => {
  const orders = await listOrders(req.auth.sub);
  res.json({ success: true, data: { orders } });
});
