
import React, { useState, useRef } from 'react';
import { PromptDetails, GenerationStatus, SubscriptionTier, TIER_LIMITS } from './types';
import { transformAlbanianPrompt, generateImagesFromPrompt } from './services/geminiService';
import { ImageDisplay } from './components/ImageDisplay';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { PricingModal } from './components/PricingModal';
import { PaymentModal } from './components/PaymentModal';
import { AdminDashboard } from './components/AdminDashboard';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [mediaUrls, setMediaUrls] = useState<string[] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [pendingTier, setPendingTier] = useState<SubscriptionTier | null>(null);

  // Auth Context
  const { user, isAuthenticated, logout, canGenerate, remainingGenerations, incrementUsage, upgradeTier } = useAuth();
  
  const currentPromptData = useRef<PromptDetails | null>(null);

  // Hardcoded admin email for demonstration
  const isAdmin = user?.email === 'admin@albanian.ai';

  const triggerGeneration = () => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }

    if (!canGenerate) {
      setIsPricingOpen(true);
      return;
    }

    performGeneration();
  };

  const performGeneration = async () => {
    if (!input.trim()) return;

    setStatus(GenerationStatus.ANALYZING);
    setError(null);

    try {
      // 1. Transform Prompt
      const enhancedPrompt = await transformAlbanianPrompt(input);
      currentPromptData.current = enhancedPrompt;

      // 2. Generate Images (3 variations)
      setStatus(GenerationStatus.GENERATING);
      const generatedImages = await generateImagesFromPrompt(enhancedPrompt.finalGenerationPrompt, 3);

      setMediaUrls(generatedImages);
      setSelectedIndex(0);
      setStatus(GenerationStatus.COMPLETED);
      
      // Update usage count
      incrementUsage();

    } catch (err: any) {
      console.error("Generation error:", err);
      setError("Failed to generate images. Please try again.");
      setStatus(GenerationStatus.ERROR);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      triggerGeneration();
    }
  };

  const handleTierSelection = (tier: SubscriptionTier) => {
    if (tier === SubscriptionTier.FREE) {
        // Downgrade or stay free logic if needed, but for now mostly for upgrades
        setIsPricingOpen(false);
        return;
    }
    setPendingTier(tier);
    setIsPricingOpen(false);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    if (pendingTier) {
        upgradeTier(pendingTier);
        setIsPaymentOpen(false);
        setPendingTier(null);
        // Show success message
        setSuccessMsg(`Successfully upgraded to ${pendingTier} Plan!`);
        setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      {/* Navbar */}
      <nav className="w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-albanian-red rounded-lg flex items-center justify-center font-bold text-sm">AL</div>
           <span className="font-semibold tracking-tight">Albanian AI</span>
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
             <div className="flex items-center gap-4">
                 {isAdmin && (
                    <button
                        onClick={() => setIsAdminOpen(true)}
                        className="bg-gray-800 hover:bg-gray-700 text-albanian-red border border-albanian-red/30 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-2 mr-2"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin
                    </button>
                 )}

                 <div className="flex flex-col items-end mr-2">
                     <span className="text-xs text-gray-400">
                        {user?.tier} PLAN
                     </span>
                     <div className="flex items-center gap-1">
                        <span className={`text-sm font-bold ${!canGenerate ? 'text-red-500' : 'text-white'}`}>
                            {remainingGenerations}/{TIER_LIMITS[user!.tier]}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase">Daily Gens</span>
                     </div>
                 </div>
                 
                 {user?.tier !== SubscriptionTier.PREMIUM && (
                     <button 
                        onClick={() => setIsPricingOpen(true)}
                        className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-full transition-colors"
                     >
                        Upgrade
                     </button>
                 )}
                 
                 <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold border border-white/10">
                     {user?.name.charAt(0).toUpperCase()}
                 </div>
                 
                 <button onClick={logout} className="text-gray-500 hover:text-white text-xs">
                    Log out
                 </button>
             </div>
          ) : (
             <button 
                onClick={() => setIsAuthOpen(true)}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
             >
                Sign In
             </button>
          )}
        </div>
      </nav>

      {/* Main Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative w-full max-w-5xl mx-auto px-4">
        
        {/* Error Toast */}
        {error && (
          <div className="absolute top-0 bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm mb-4 animate-fade-in z-[60]">
            {error}
          </div>
        )}

        {/* Success Toast */}
        {successMsg && (
          <div className="absolute top-0 bg-green-500/10 border border-green-500/50 text-green-200 px-4 py-2 rounded-lg text-sm mb-4 animate-fade-in z-[60] flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMsg}
          </div>
        )}

        {/* Media Display Container */}
        <div className="w-full relative group">
           <ImageDisplay 
              mediaUrls={mediaUrls} 
              selectedIndex={selectedIndex}
              onSelectIndex={setSelectedIndex}
              isVideo={false} 
              status={status} 
           />
        </div>

      </main>

      {/* Input Bar (Bottom Fixed) */}
      <footer className="w-full p-6 pb-10 z-50">
        <div className="max-w-3xl mx-auto relative flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
                !isAuthenticated 
                    ? "Sign in to start creating..." 
                    : !canGenerate 
                        ? "Daily limit reached. Upgrade to continue." 
                        : "Type in Albanian... (e.g. Nje djale duke luajtur)"
            }
            disabled={status === GenerationStatus.ANALYZING || status === GenerationStatus.GENERATING || (!canGenerate && isAuthenticated)}
            className={`w-full bg-[#111] border rounded-full py-4 px-8 text-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-albanian-red/50 focus:border-albanian-red transition-all shadow-2xl
                ${!canGenerate && isAuthenticated ? 'border-red-900/50 opacity-50 cursor-not-allowed' : 'border-gray-800'}
            `}
          />
          <button 
            onClick={triggerGeneration}
            disabled={status === GenerationStatus.ANALYZING || status === GenerationStatus.GENERATING || (!input.trim() && isAuthenticated && canGenerate)}
            className={`
                bg-albanian-red hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 rounded-full font-bold transition-colors shadow-lg flex items-center justify-center min-w-[80px]
                ${!canGenerate && isAuthenticated ? 'grayscale' : ''}
            `}
          >
            {status === GenerationStatus.ANALYZING || status === GenerationStatus.GENERATING ? (
               <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-center text-gray-700 text-xs mt-4">
          Real-time Albanian-to-Prompt Generation Engine. Powered by Google Gemini.
        </p>
      </footer>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <PricingModal 
        isOpen={isPricingOpen} 
        onClose={() => setIsPricingOpen(false)} 
        onSelectTier={handleTierSelection}
        currentTier={user?.tier || SubscriptionTier.FREE}
      />
      {pendingTier && (
        <PaymentModal 
          isOpen={isPaymentOpen} 
          onClose={() => setIsPaymentOpen(false)} 
          selectedTier={pendingTier}
          onSuccess={handlePaymentSuccess}
        />
      )}
      <AdminDashboard 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        currentUserEmail={user?.email || ''} 
      />
    </div>
  );
};

export default App;
