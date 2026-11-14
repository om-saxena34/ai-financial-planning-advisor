const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const config = require('../config/env');

/**
 * Generate Access Token (short-lived JWT)
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_ACCESS_EXPIRY }
  );
}

/**
 * Generate cryptographically secure Refresh Token
 */
function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

/**
 * Register a new user
 */
async function register({ name, email, password, currency = 'INR' }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('An account with this email address already exists');
  }

  const passwordHash = await User.hashPassword(password);
  const refreshToken = generateRefreshToken();
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const user = await User.create({
    name,
    email,
    passwordHash,
    currency,
    refreshToken,
    refreshTokenExpiry,
  });

  const accessToken = generateAccessToken(user);

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
}

/**
 * Authenticate user by email & password
 */
async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const refreshToken = generateRefreshToken();
  user.refreshToken = refreshToken;
  user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.save();

  const accessToken = generateAccessToken(user);

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
}

/**
 * Rotate / exchange refresh token for a new access token
 */
async function refresh(incomingRefreshToken) {
  if (!incomingRefreshToken) {
    throw ApiError.unauthorized('Refresh token is required');
  }

  const user = await User.findOne({
    refreshToken: incomingRefreshToken,
    refreshTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  // Generate fresh access token and rotate refresh token
  const newRefreshToken = generateRefreshToken();
  user.refreshToken = newRefreshToken;
  user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.save();

  const accessToken = generateAccessToken(user);

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken: newRefreshToken,
  };
}

/**
 * Invalidate user refresh token
 */
async function logout(userId) {
  if (userId) {
    await User.findByIdAndUpdate(userId, {
      refreshToken: null,
      refreshTokenExpiry: null,
    });
  }
}

/**
 * Fetch current authenticated user
 */
async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user.toJSON();
}

/**
 * Change user password
 */
async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.passwordHash = await User.hashPassword(newPassword);
  user.refreshToken = null; // force re-login on other devices
  user.refreshTokenExpiry = null;
  await user.save();

  return { message: 'Password updated successfully' };
}

module.exports = {
  generateAccessToken,
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
  changePassword,
};
