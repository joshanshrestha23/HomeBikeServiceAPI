import axios from 'axios';

export const verifyKhaltiPayment = async (pidx) => {
  const headersList = {
    Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };

  const reqOptions = {
    url: `${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/lookup/`,
    method: 'POST',
    headers: headersList,
    data: { pidx },
  };

  const response = await axios.request(reqOptions);
  return response.data;
};

export const initializeKhaltiPayment = async (details) => {
  const headersList = {
    Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };

  const reqOptions = {
    url: `${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/initiate/`,
    method: 'POST',
    headers: headersList,
    data: details,
  };

  const response = await axios.request(reqOptions);
  return response.data;
};

export default { verifyKhaltiPayment, initializeKhaltiPayment };
