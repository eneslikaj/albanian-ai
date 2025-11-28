import { SubscriptionTier, TIER_PRICES } from '../types';

interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
}

interface CardDetails {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

// Simulate a secure Stripe backend payment intent creation and confirmation
export const processStripePayment = async (
  tier: SubscriptionTier, 
  cardDetails: CardDetails
): Promise<PaymentResponse> => {
  const amount = TIER_PRICES[tier];
  
  // 1. Simulate Network Latency
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 2. Validate Inputs (Mock Logic)
  const cleanNumber = cardDetails.number.replace(/\s/g, '');
  
  // Basic validation rules
  if (cleanNumber.length < 15 || cleanNumber.length > 16 || isNaN(Number(cleanNumber))) {
    return { success: false, error: 'Your card number is incomplete.' };
  }

  if (cardDetails.cvc.length < 3 || isNaN(Number(cardDetails.cvc))) {
    return { success: false, error: 'Your card\'s security code is incomplete.' };
  }

  if (!cardDetails.name.trim()) {
    return { success: false, error: 'Name on card is required.' };
  }

  // Simulate specific error for testing (e.g. 4000... is failure)
  if (cleanNumber.startsWith('4000')) {
    return { success: false, error: 'Your card was declined.' };
  }

  // 3. Success Response
  return {
    success: true,
    transactionId: `ch_${Math.random().toString(36).substr(2, 24)}`,
  };
};