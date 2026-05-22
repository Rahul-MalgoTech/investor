import { Order } from '../models/order.model.js';

export async function createOrder(payload, userId) {
  const order = await Order.create({
    ...payload,
    userId,
    status: 'confirmed',
  });
  return order.toJSON();
}

export async function listOrders(userId) {
  return Order.find({ userId }).sort({ createdAt: -1 }).lean();
}
