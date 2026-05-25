import { getDashboard, getLeaderboard } from '../services/analytics.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const dashboard = asyncHandler(async (req, res) => {
  const data = await getDashboard(req.auth.sub);
  res.json({ success: true, data });
});

export const leaderboard = asyncHandler(async (req, res) => {
  const period = ['daily', 'weekly', 'monthly'].includes(req.query.period)
    ? req.query.period
    : 'daily';
  const entries = await getLeaderboard(period);
  res.json({ success: true, data: { period, entries } });
});
