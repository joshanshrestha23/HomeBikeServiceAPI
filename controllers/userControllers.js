import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

import User from '../models/userModel.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { sendOtpEmail } from '../service/otpEmailService.js';
import { generateOtp, storeOtp, verifyOtp } from '../service/sendOtp.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const createUser = asyncHandler(async (req, res) => {
  const { fullName, phoneNumber, email, password } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email }, { phoneNumber }],
  });

  if (existingUser) {
    throw new AppError(
      `User already exists with this ${
        existingUser.email === email ? 'email' : 'phone number'
      }`,
      400,
    );
  }

  const newUser = new User({
    fullName,
    phoneNumber,
    email,
    password,
  });

  await newUser.save();

  const token = generateToken(newUser._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: newUser.getPublicProfile(),
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: user.getPublicProfile(),
  });
});

export const getCurrentProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    user: user.getPublicProfile(),
  });
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const { fullName, phoneNumber, profileImage } = req.body;
  const updateData = {};

  if (fullName) updateData.fullName = fullName;
  if (phoneNumber) updateData.phoneNumber = phoneNumber;
  if (profileImage) updateData.profileImage = profileImage;

  const user = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: user.getPublicProfile(),
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('User not found with this email', 404);
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  storeOtp(email, otp, otpExpiry);
  await sendOtpEmail(email, otp);

  res.status(200).json({
    success: true,
    message: 'OTP sent to your email',
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const isValidOtp = verifyOtp(email, otp);

  if (!isValidOtp) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
});

export const getAllUser = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

export const getToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
  });
});

export const forgotPasswordByEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('User not found with this email', 404);
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.resetPasswordOTP = otp;
  user.resetPasswordOTPExpiry = otpExpiry;
  await user.save();

  await sendOtpEmail(email, otp);

  res.status(200).json({
    success: true,
    message: 'OTP sent to your email',
  });
});

export const resetPasswordByEmail = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email }).select(
    '+resetPasswordOTP +resetPasswordOTPExpiry',
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.resetPasswordOTP !== otp) {
    throw new AppError('Invalid OTP', 400);
  }

  if (new Date() > user.resetPasswordOTPExpiry) {
    throw new AppError('OTP expired', 400);
  }

  user.password = newPassword;
  user.resetPasswordOTP = null;
  user.resetPasswordOTPExpiry = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { email, name, picture } = ticket.getPayload();
  let user = await User.findOne({ email });

  if (!user) {
    user = new User({
      fullName: name,
      email,
      phoneNumber: `GOOGLE_${email}`,
      password: Math.random().toString(36),
      profileImage: picture,
      isVerified: true,
    });
    await user.save();
  }

  const jwtToken = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Google login successful',
    token: jwtToken,
    user: user.getPublicProfile(),
  });
});

export const getUserByGoogleEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({
      success: false,
      message: 'User not found',
      user: null,
    });
  }

  res.status(200).json({
    success: true,
    user: user.getPublicProfile(),
  });
});

export default {
  createUser,
  loginUser,
  getCurrentProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  getAllUser,
  getToken,
  forgotPasswordByEmail,
  resetPasswordByEmail,
  googleLogin,
  getUserByGoogleEmail,
};
