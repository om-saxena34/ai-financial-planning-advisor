const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const config = require('../config/env');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

async function register(req, res, next) {
  try {
    const data = req.validated || req.body;
    const { user, accessToken, refreshToken } = await authService.register(data);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    return ApiResponse.created(
      res,
      { user, accessToken },
      'Registration successful'
    );
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const data = req.validated || req.body;
    const { user, accessToken, refreshToken } = await authService.login(data);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    return ApiResponse.success(
      res,
      { user, accessToken },
      'Login successful'
    );
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    const { user, accessToken, refreshToken } = await authService.refresh(token);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    return ApiResponse.success(
      res,
      { user, accessToken },
      'Token refreshed successfully'
    );
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const userId = req.user?.userId;
    await authService.logout(userId);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return ApiResponse.success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.userId);
    return ApiResponse.success(res, { user }, 'User profile retrieved');
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.validated || req.body;
    const result = await authService.changePassword(
      req.user.userId,
      currentPassword,
      newPassword
    );
    return ApiResponse.success(res, result, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  changePassword,
};
