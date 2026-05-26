import { Order } from '../models/order.model.js';
import { createNotification } from './notification.service.js';

export async function createOrder(payload, userId) {
  const order = await Order.create({
    ...payload,
    userId,
    status: 'confirmed',
  });
  const json = order.toJSON();

  await createNotification({
    userId,
    type: 'booking',
    title: 'Booking Confirmed',
    body: `${payload.plot?.title || 'Your selected plot'} has been successfully reserved.`,
    metadata: {
      orderId: json._id?.toString() ?? json.id,
      plotTitle: payload.plot?.title,
      paymentMode: payload.summary?.paymentMode,
    },
  });

  return json;
}

export async function listOrders(userId) {
  return Order.find({ userId }).sort({ createdAt: -1 }).lean();
}
