import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Session from '../models/Session.js';

const cookieName = 'ailearningassistant_session';
const tokenHash = (token) => crypto.createHash('sha256').update(token).digest('hex');

function readCookie(req, name) {
  const pair = (req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  if (!pair) return null;
  try { return decodeURIComponent(pair.slice(name.length + 1)); } catch { return null; }
}

export default async function protect(req, res, next) {
  try {
    const token = readCookie(req, cookieName);
    if (!token) return res.status(401).json({ error: 'Please sign in to continue.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const [session, user] = await Promise.all([
      Session.findOne({ tokenHash: tokenHash(token), revokedAt: null, expiresAt: { $gt: new Date() } }),
      User.findById(payload.sub)
    ]);
    if (!session || !user || user.isBlocked) return res.status(401).json({ error: 'Your session is no longer active.' });
    req.user = user;
    req.session = session;
    User.updateOne({ _id: user._id }, { $set: { lastSeenAt: new Date() } }).exec().catch(() => {});
    if (Date.now() - new Date(session.updatedAt || 0).getTime() > 30_000) {
      Session.updateOne({ _id: session._id }, { $set: { updatedAt: new Date() } }).exec().catch(() => {});
    }
    next();
  } catch {
    res.status(401).json({ error: 'Please sign in to continue.' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Administrator access is required.' });
  next();
}
