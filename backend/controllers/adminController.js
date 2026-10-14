import User from '../models/User.js';
import Session from '../models/Session.js';
import Subject from '../models/Subject.js';
import { removeStoredPdf } from '../config/multer.js';

const safeUser = (user) => ({
  id: String(user._id), username: user.username, email: user.email,
  role: user.role, isBlocked: user.isBlocked, createdAt: user.createdAt,
  lastSeenAt: user.lastSeenAt || null
});

export const adminOverview = async (_req, res, next) => {
  try {
    const activeCutoff = new Date(Date.now() - 5 * 60 * 1000);
    const [users, activeUserIds] = await Promise.all([
      User.find().sort({ createdAt: -1 }).lean(),
      Session.distinct('userId', { revokedAt: null, expiresAt: { $gt: new Date() }, updatedAt: { $gte: activeCutoff } })
    ]);
    res.json({
      users: users.map(safeUser),
      metrics: {
        totalUsers: users.length,
        activeUsers: activeUserIds.length
      }
    });
  } catch (error) { next(error); }
};

export const setUserBlocked = async (req, res, next) => {
  try {
    if (String(req.user._id) === req.params.userId) return res.status(400).json({ error: 'You cannot block your own administrator account.' });
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const blocked = req.body.isBlocked === true;
    if (blocked && user.role === 'admin' && await User.countDocuments({ role: 'admin', isBlocked: false }) <= 1) {
      return res.status(409).json({ error: 'Keep at least one active administrator account.' });
    }
    user.isBlocked = blocked;
    await user.save();
    if (blocked) await Session.updateMany({ userId: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
    res.json({ user: safeUser(user) });
  } catch (error) { next(error); }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (String(req.user._id) === req.params.userId) return res.status(400).json({ error: 'You cannot delete your own administrator account.' });
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.role === 'admin' && await User.countDocuments({ role: 'admin', isBlocked: false }) <= 1) {
      return res.status(409).json({ error: 'Keep at least one active administrator account.' });
    }
    const subjects = await Subject.find({ ownerId: user._id });
    for (const subject of subjects) for (const topic of subject.topics) await removeStoredPdf(topic.pdf?.storageName);
    await Promise.all([
      user.deleteOne(),
      Session.deleteMany({ userId: user._id }),
      Subject.deleteMany({ ownerId: user._id })
    ]);
    res.json({ ok: true });
  } catch (error) { next(error); }
};
