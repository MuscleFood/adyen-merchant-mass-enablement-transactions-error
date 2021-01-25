import { createSlice } from "@reduxjs/toolkit";
import { CoreOptions } from '@adyen/adyen-web/dist/types/core/types';

const config: CoreOptions = {
  paymentMethodsConfiguration: {
    ideal: {
      showImage: true,
    },
    card: {
      hasHolderName: true,
      holderNameRequired: true,
      name: "Credit or debit card",
      amount: {
        value: 1000, // 10€ in minor units
        currency: "EUR",
      },
    },
    applepay: {
      amount: {
          value: 1000,
          currency: 'GBP',
      },
      countryCode: 'GB',
      onSubmit: () => { console.log('>>> onSubmit!!') },
      //onValidateMerchant: () => { console.log('>>> onValidateMerchant!!')},
      //onError: () => { console.log('>>> onError!!')},
      buttonType: 'buy',
      totalPriceLabel: 'test',
      //merchantCapabilities: ["supports3DS"],
      //supportedNetworks: ["masterCard", "visa", "amex"],
      //totalPriceStatus: "final",
      //version: 4
      //configuration: {
      //    merchantId: 'merchant.com.adyen.musclefood.test',
      //    merchantName: 'MuscleFood',
      //},
    },
  },
  locale: "en_US",
  showPayButton: true,
  clientKey: process.env.REACT_APP_CLIENT_KEY,
  environment: "test",
};

console.log('>>> ', JSON.stringify(config));

export const slice = createSlice({
  name: "payment",
  initialState: {
    error: "",
    paymentMethodsRes: null,
    paymentRes: null,
    paymentDetailsRes: null,
    config: config,
  },
  reducers: {
    paymentMethods: (state, action) => {
      const [res, status] = action.payload;
      if (status >= 300) {
        state.error = res;
      } else {
        res.paymentMethods = res.paymentMethods.filter((it) =>
          ["eps", "scheme", "dotpay", "giropay", "ideal", "directEbanking", "bcmc", "paysafecard", "applepay"].includes(it.type)
        );
        state.paymentMethodsRes = res;
      }
    },
    payments: (state, action) => {
      const [res, status] = action.payload;
      if (status >= 300) {
        state.error = res;
      } else {
        state.paymentRes = res;
      }
    },
    paymentDetails: (state, action) => {
      const [res, status] = action.payload;
      if (status >= 300) {
        state.error = res;
      } else {
        state.paymentDetailsRes = res;
      }
    },
  },
});

export const { paymentMethods, payments, paymentDetails } = slice.actions;

export const getPaymentMethods = () => async (dispatch) => {
  const response = await fetch("/api/getPaymentMethods", {
    method: "POST",
  });
  dispatch(paymentMethods([await response.json(), response.status]));
};

export const initiatePayment = (data) => async (dispatch) => {
  const response = await fetch("/api/initiatePayment", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  dispatch(payments([await response.json(), response.status]));
};

export const submitAdditionalDetails = (data) => async (dispatch) => {
  const response = await fetch("/api/submitAdditionalDetails", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  dispatch(paymentDetails([await response.json(), response.status]));
};

export default slice.reducer;
