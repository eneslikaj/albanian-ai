import React, { useState, useEffect } from 'react';
import { SubscriptionTier, TIER_PRICES } from '../types';
import { processStripePayment } from '../services/stripeService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: SubscriptionTier;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, selectedTier, onSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setProcessing(false);
      setError(null);
      setCardNumber('');
      setExpiry('');
      setCvc('');
      setName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      const result = await processStripePayment(selectedTier, {
        number: cardNumber,
        expiry,
        cvc,
        name
      });

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Payment failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Formatters
  const formatCardNumber = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + ' / ' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden relative text-gray-900">
        
        {/* Header */}
        <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-xl text-gray-900">Subscribe to {selectedTier === SubscriptionTier.PREMIUM ? 'Premium' : 'Standard'}</h3>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-bold text-gray-900">{TIER_PRICES[selectedTier]} LEK</span> due today
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handlePayment} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
             {/* Name */}
             <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Cardholder Name</label>
              <input 
                type="text" 
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                required
              />
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Card Information</label>
              <div className="relative">
                <input 
                  type="text" 
                  inputMode="numeric"
                  maxLength={19}
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-t-lg px-4 py-2.5 pl-10 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all z-10 relative"
                  required
                />
                <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400 z-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="flex -mt-[1px]">
                <input 
                  type="text" 
                  inputMode="numeric"
                  placeholder="MM / YY"
                  maxLength={7}
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  className="w-1/2 bg-white border border-gray-300 rounded-bl-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  required
                />
                <input 
                  type="text" 
                  inputMode="numeric"
                  placeholder="CVC"
                  maxLength={4}
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g,''))}
                  className="w-1/2 bg-white border border-gray-300 border-l-0 rounded-br-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className={`w-full mt-6 py-3 rounded-lg font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all
              ${processing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl transform active:scale-[0.98]'
              }`}
          >
            {processing ? (
                <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </>
            ) : (
                `Subscribe • ${TIER_PRICES[selectedTier]} LEK`
            )}
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Encrypted by Stripe
          </div>
        </form>
      </div>
    </div>
  );
};