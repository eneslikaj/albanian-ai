import React from 'react';
import { SubscriptionTier, TIER_LIMITS, TIER_PRICES } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTier: (tier: SubscriptionTier) => void;
  currentTier: SubscriptionTier;
}

const PlanCard: React.FC<{
  tier: SubscriptionTier;
  price: number;
  limit: number;
  isCurrent: boolean;
  onSelect: () => void;
}> = ({ tier, price, limit, isCurrent, onSelect }) => {
  const isPremium = tier === SubscriptionTier.PREMIUM;
  const isStandard = tier === SubscriptionTier.STANDARD;
  const isFree = tier === SubscriptionTier.FREE;

  return (
    <div 
      className={`relative p-6 rounded-2xl border transition-all duration-300 flex flex-col h-full
        ${isCurrent ? 'bg-white/10 border-albanian-red shadow-lg shadow-albanian-red/10' : 'bg-black/40 border-gray-800 hover:border-gray-600 hover:bg-black/60'}
      `}
    >
      {isPremium && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
          MOST POPULAR
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-1 capitalize">{tier.toLowerCase()}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">{price}</span>
          <span className="text-sm text-gray-400">LEK / mo</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        <li className="flex items-center gap-3 text-sm text-gray-300">
          <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-bold text-white">{limit} Generations</span>
          <span className="text-gray-500 text-xs">/ day</span>
        </li>
        <li className="flex items-center gap-3 text-sm text-gray-300">
          <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>3 Variations per generation</span>
        </li>
        <li className="flex items-center gap-3 text-sm text-gray-300">
          <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Fast GPU Processing</span>
        </li>
        {isFree && (
          <li className="flex items-center gap-3 text-sm text-gray-500">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Standard Quality</span>
          </li>
        )}
        {!isFree && (
          <li className="flex items-center gap-3 text-sm text-gray-300">
            <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-albanian-red font-semibold">Priority Access</span>
          </li>
        )}
      </ul>

      <button
        onClick={onSelect}
        disabled={isCurrent}
        className={`w-full py-3 rounded-lg font-bold text-sm transition-all
          ${isCurrent 
            ? 'bg-gray-800 text-gray-400 cursor-default' 
            : isPremium 
              ? 'bg-gradient-to-r from-albanian-red to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg' 
              : 'bg-white text-black hover:bg-gray-200'
          }
        `}
      >
        {isCurrent ? 'Current Plan' : 'Upgrade'}
      </button>
    </div>
  );
};

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSelectTier, currentTier }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-start mb-8 text-white px-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Upgrade your Creativity</h2>
            <p className="text-gray-400">Choose a plan that fits your artistic needs.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
             <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 pb-8 overflow-y-auto max-h-[80vh]">
          <PlanCard 
            tier={SubscriptionTier.FREE}
            price={TIER_PRICES[SubscriptionTier.FREE]}
            limit={TIER_LIMITS[SubscriptionTier.FREE]}
            isCurrent={currentTier === SubscriptionTier.FREE}
            onSelect={() => onSelectTier(SubscriptionTier.FREE)}
          />
          <PlanCard 
            tier={SubscriptionTier.STANDARD}
            price={TIER_PRICES[SubscriptionTier.STANDARD]}
            limit={TIER_LIMITS[SubscriptionTier.STANDARD]}
            isCurrent={currentTier === SubscriptionTier.STANDARD}
            onSelect={() => onSelectTier(SubscriptionTier.STANDARD)}
          />
          <PlanCard 
            tier={SubscriptionTier.PREMIUM}
            price={TIER_PRICES[SubscriptionTier.PREMIUM]}
            limit={TIER_LIMITS[SubscriptionTier.PREMIUM]}
            isCurrent={currentTier === SubscriptionTier.PREMIUM}
            onSelect={() => onSelectTier(SubscriptionTier.PREMIUM)}
          />
        </div>
      </div>
    </div>
  );
};
