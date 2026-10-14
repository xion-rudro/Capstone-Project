import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Session from '../models/Session.js';

const cookieName = 'ailearningassistant_session';
const sessionMs = 7 * 24 * 60 * 60 * 1000;
const digest = (token) => crypto.createHash('sha256').update(token).digest('hex');
const viewUser = (user) => ({
  id: String(user._id), username: user.username, email: user.email,
  role: user.role, profileImage: user.profileImage, createdAt: user.createdAt,
  lastSeenAt: user.lastSeenAt || null
});

function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(sessionMs / 1000)}${secure}`);
}

function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

async function startSession(user, res) {
  const token = jwt.sign({ sub: String(user._id), role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const expiresAt = new Date(Date.now() + sessionMs);
  await Session.create({ userId: user._id, tokenHash: digest(token), expiresAt });
  setSessionCookie(res, token);
}

export const register = async (req, res, next) => {
  try {
    const validation = validationResult(req);
    if (!validation.isEmpty()) return res.status(400).json({ error: validation.array()[0].msg });
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const username = String(req.body.username || email.split('@')[0]).trim().slice(0, 40);
    const role = req.body.role === 'admin' ? 'admin' : 'student';
    if (password.length < 10 || password.length > 128) return res.status(400).json({ error: 'Use a password between 10 and 128 characters.' });
    if (role === 'admin' && (!process.env.ADMIN_INVITE_CODE || req.body.inviteCode !== process.env.ADMIN_INVITE_CODE)) {
      return res.status(403).json({ error: 'A valid administrator invite code is required.' });
    }
    const user = await User.create({ username: username || 'Student', email, password, role });
    await startSession(user, res);
    return res.status(201).json({ user: viewUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'An account with that email already exists.' });
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const validation = validationResult(req);
    if (!validation.isEmpty()) return res.status(400).json({ error: validation.array()[0].msg });
    const email = String(req.body.email || '').trim().toLowerCase();
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(String(req.body.password || '')))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    if (user.isBlocked) return res.status(403).json({ error: 'This account has been blocked. Contact an administrator.' });
    user.lastSeenAt = new Date();
    await user.save();
    await startSession(user, res);
    res.json({ user: viewUser(user) });
  } catch (error) { next(error); }
};

export const logout = async (req, res, next) => {
  try {
    const pair = (req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
    if (pair) {
      let token = '';
      try { token = decodeURIComponent(pair.slice(cookieName.length + 1)); } catch { /* Clear malformed cookies too. */ }
      if (token) await Session.updateOne({ tokenHash: digest(token), revokedAt: null }, { $set: { revokedAt: new Date() } }).catch(() => {});
    }
    clearSessionCookie(res);
    res.json({ ok: true });
  } catch (error) { next(error); }
};

export const getProfile = (req, res) => res.json({ user: viewUser(req.user) });

export const updateProfile = async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim();
    if (username.length < 2 || username.length > 40) return res.status(400).json({ error: 'Username must be 2 to 40 characters.' });
    req.user.username = username;
    await req.user.save();
    res.json({ user: viewUser(req.user) });
  } catch (error) { next(error); }
};

export const changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const nextPassword = String(req.body.newPassword || '');
    if (!(await user.matchPassword(String(req.body.currentPassword || '')))) return res.status(400).json({ error: 'Current password is incorrect.' });
    if (nextPassword.length < 10 || nextPassword.length > 128) return res.status(400).json({ error: 'Use a password between 10 and 128 characters.' });
    user.password = nextPassword;
    await user.save();
    await Session.updateMany({ userId: user._id, _id: { $ne: req.session?._id }, revokedAt: null }, { $set: { revokedAt: new Date() } });
    res.json({ ok: true, message: 'Password changed. Other sessions have been signed out.' });
  } catch (error) { next(error); }
};
