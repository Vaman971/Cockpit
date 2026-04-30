/**
 * Unit tests — authController (signIn / signOut)
 * Mocks: User model, bcrypt, jsonwebtoken
 */
const { mockRow } = require('./helpers/modelMock');

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockUser = mockRow({
  user_id: 1,
  email: 'alice@test.com',
  password: 'hashed_pw',
  user_type: 'admin',
  active: true,
});

jest.mock('../models/userModel', () => ({
  findOne: jest.fn(),
  afterCreate: jest.fn(),
  afterUpdate: jest.fn(),
}));
jest.mock('bcryptjs', () => ({ compare: jest.fn() }));
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'mock.jwt.token') }));

const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { signIn, signOut } = require('../controllers/authController');

// ── Helpers ───────────────────────────────────────────────────────────────────
const mockReq = (body = {}) => ({ body });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = () => jest.fn();

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('authController — signIn', () => {
  it('returns 400 when email or password is missing', async () => {
    const req = mockReq({ email: '' });
    const res = mockRes();
    await signIn(req, res, mockNext());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 401 when user is not found', async () => {
    User.findOne.mockResolvedValue(null);
    const req = mockReq({ email: 'no@user.com', password: 'pw' });
    const res = mockRes();
    await signIn(req, res, mockNext());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 403 when account is inactive', async () => {
    User.findOne.mockResolvedValue(mockRow({ ...mockUser.dataValues, active: false }));
    const req = mockReq({ email: 'alice@test.com', password: 'pw' });
    const res = mockRes();
    await signIn(req, res, mockNext());
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 401 when password does not match', async () => {
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);
    const req = mockReq({ email: 'alice@test.com', password: 'wrong' });
    const res = mockRes();
    await signIn(req, res, mockNext());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 200 with cookie on successful sign-in', async () => {
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    const req = mockReq({ email: 'alice@test.com', password: 'correct' });
    const res = mockRes();
    await signIn(req, res, mockNext());
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalledWith('jwtToken', expect.any(String), expect.any(Object));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('calls next(error) on unexpected DB error', async () => {
    User.findOne.mockRejectedValue(new Error('DB down'));
    const req = mockReq({ email: 'alice@test.com', password: 'pw' });
    const res = mockRes();
    const next = mockNext();
    await signIn(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('authController — signOut', () => {
  it('returns 200 and clears the jwtToken cookie', () => {
    const req = mockReq();
    const res = mockRes();
    signOut(req, res);
    expect(res.clearCookie).toHaveBeenCalledWith('jwtToken', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
