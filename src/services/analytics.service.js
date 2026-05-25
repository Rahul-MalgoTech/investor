import mongoose from 'mongoose';

import { HomeContent } from '../models/homeContent.model.js';
import { Order } from '../models/order.model.js';
import { User } from '../models/user.model.js';

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export async function getDashboard(userId) {
  const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
  const allOrders = await Order.find().select('summary.selectedLabel').lean();
  const homeContent = await HomeContent.findOne({ key: 'home' }).select('plots').lean();
  const totalPlots = orders.reduce((sum, order) => sum + plotCount(order), 0);
  const totalInvestment = orders.reduce((sum, order) => sum + orderAmount(order), 0);
  const reservedPlots = allOrders.reduce((sum, order) => sum + plotCount(order), 0);
  const totalAvailablePlots = homeContentPlotCount(homeContent);
  const latestEmiOrder =
    orders.find((order) => order.summary?.paymentMode === 'emi') ?? orders[0];

  return {
    stats: {
      plotsOwned: totalPlots.toString(),
      totalInvestment: formatInr(totalInvestment),
    },
    starFrames: orders
      .map((order, index) => {
        const title = order.plot?.edition?.trim() || order.plot?.title?.trim();
        return title ? { title, tone: ['gold', 'bronze', 'silver'][index] ?? 'gold' } : null;
      })
      .filter(Boolean)
      .slice(0, 3),
    plotsInfo: topPlotLocations(orders),
    prebook: {
      reservedPlots: reservedPlots.toString(),
      totalPlots: totalAvailablePlots.toString(),
      payAmount: orders[0] ? formatInr(orderAmount(orders[0])) : formatInr(0),
    },
    emi: latestEmiOrder
      ? {
          title: plotTitle(latestEmiOrder),
          dueLabel: `Next Installment Due in ${nextMonthLabel()}`,
          payAmount: formatInr(orderAmount(latestEmiOrder)),
        }
      : null,
    transactions: orders.slice(0, 10).map((order) => ({
      plotTitle: plotTitle(order),
      plotMeta: [order.summary?.selectedLabel, formatDate(order.createdAt)]
        .filter(Boolean)
        .join(' . '),
      amount: formatInr(orderAmount(order)),
      status: transactionStatus(order),
    })),
  };
}

export async function getLeaderboard(period = 'daily') {
  const startDate = periodStart(period);
  const orders = await Order.find({ createdAt: { $gte: startDate } })
    .sort({ createdAt: -1 })
    .lean();
  const grouped = new Map();

  for (const order of orders) {
    const key = order.userId?.toString() ?? 'guest';
    const current = grouped.get(key) ?? {
      userId: order.userId,
      name: '',
      plots: 0,
      amount: 0,
    };
    current.plots += plotCount(order);
    current.amount += orderAmount(order);
    grouped.set(key, current);
  }

  const users = await User.find({
    _id: {
      $in: [...grouped.values()]
        .map((entry) => entry.userId)
        .filter((id) => mongoose.Types.ObjectId.isValid(id)),
    },
  })
    .select('fullName phoneNumber email')
    .lean();
  const usersById = new Map(users.map((user) => [user._id.toString(), user]));

  return [...grouped.values()]
    .map((entry) => {
      const user = usersById.get(entry.userId?.toString());
      return {
        name: userName(user),
        plots: `${entry.plots} plots`,
        amount: formatInr(entry.amount),
        amountValue: entry.amount,
      };
    })
    .sort((a, b) => b.amountValue - a.amountValue)
    .map((entry, index) => ({
      rank: `#${index + 1}`,
      name: entry.name,
      plots: entry.plots,
      amount: entry.amount,
    }));
}

function topPlotLocations(orders) {
  const grouped = new Map();
  for (const order of orders) {
    const location = order.plot?.location?.trim();
    if (!location) {
      continue;
    }
    const key = location.toLowerCase();
    const current = grouped.get(key) ?? { plots: 0, city: location, state: '' };
    current.plots += plotCount(order);
    grouped.set(key, current);
  }
  return [...grouped.values()]
    .sort((a, b) => b.plots - a.plots)
    .slice(0, 2)
    .map((entry) => ({
      count: `${entry.plots} Plots`,
      city: entry.city,
      state: entry.state,
    }));
}

function plotCount(order) {
  return firstNumber(order.summary?.selectedLabel) || 0;
}

function orderAmount(order) {
  return firstNumber(order.summary?.totalAmount) || firstNumber(order.plot?.priceRange) || 0;
}

function homeContentPlotCount(homeContent) {
  if (!homeContent?.plots?.length) {
    return 0;
  }

  return homeContent.plots.reduce((sum, plot) => {
    return sum + (firstNumber(plot.plotCount) || selectionPlotCount(plot.detail));
  }, 0);
}

function selectionPlotCount(detail) {
  const plots = detail?.selection?.plots;
  return Array.isArray(plots) ? plots.length : 0;
}

function firstNumber(value) {
  const match = value?.toString().replace(/,/g, '').match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function formatInr(value) {
  return INR_FORMATTER.format(value || 0).replace(/^₹/, '₹');
}

function plotTitle(order) {
  const title = order.plot?.title?.trim() || '';
  const size = order.plot?.size?.trim();
  return size ? `${title} (${size})` : title;
}

function transactionStatus(order) {
  if (order.summary?.paymentMode === 'emi') {
    return 'EMI';
  }
  if (order.status === 'completed') {
    return 'Completed';
  }
  return 'Prebook';
}

function userName(user) {
  return (
    user?.fullName?.trim() ||
    user?.phoneNumber?.trim() ||
    user?.email?.split('@')[0] ||
    ''
  );
}

function periodStart(period) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  if (period === 'weekly') {
    date.setDate(date.getDate() - 6);
  } else if (period === 'monthly') {
    date.setDate(1);
  }
  return date;
}

function nextMonthLabel() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN');
}
