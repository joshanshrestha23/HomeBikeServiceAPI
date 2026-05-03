import axios from 'axios';

const otpStore = new Map();

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOtp = (key, otp, expiresAt) => {
  otpStore.set(key, {
    otp: otp.toString(),
    expiresAt: new Date(expiresAt),
  });
};

export const verifyOtp = (key, otp) => {
  const storedOtp = otpStore.get(key);

  if (!storedOtp) {
    return false;
  }

  if (storedOtp.expiresAt < new Date()) {
    otpStore.delete(key);
    return false;
  }

  const isValid = storedOtp.otp === otp.toString();

  if (isValid) {
    otpStore.delete(key);
  }

  return isValid;
};

export const sendPhoneOtp = async (phone, otp) => {
  if (!process.env.SMS_API_KEY) {
    console.warn('SMS API key is not configured; skipping phone OTP.');
    return false;
  }

  const url = process.env.SMS_API_URL || 'https://api.managepoint.co/api/sms/send';
  const payload = {
    apiKey: process.env.SMS_API_KEY,
    to: phone,
    message: `Your OTP is ${otp}`,
  };

  try {
    const res = await axios.post(url, payload);
    return res.status === 200;
  } catch (error) {
    console.log('Error Sending OTP', error.message);
    return false;
  }
};

export default sendPhoneOtp;
