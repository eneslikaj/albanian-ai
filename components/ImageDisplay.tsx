import React from 'react';
import { GenerationStatus } from '../types';

interface ImageDisplayProps {
  mediaUrls: string[] | null;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  isVideo: boolean;
  status: GenerationStatus;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  mediaUrls, 
  selectedIndex, 
  onSelectIndex,
  isVideo, 
  status 
}) => {
  const isGenerating = status === GenerationStatus.GENERATING || status === GenerationStatus.ANALYZING;
  const isGeneratingVideo = status === GenerationStatus.GENERATING_VIDEO;
  const currentMedia = mediaUrls ? mediaUrls[selectedIndex] : null;

  if (!currentMedia && !isGenerating) {
    return (
      <div className="glass-panel w-full h-[60vh] flex flex-col items-center justify-center p-8 text-center text-gray-500 border-dashed border-2 border-gray-800/50 rounded-3xl bg-black/40">
        <div className="w-20 h-20 rounded-full bg-gray-900/50 flex items-center justify-center mb-6 animate-pulse">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
           </svg>
        </div>
        <p className="text-xl font-medium text-gray-400">Filloni të shkruani...</p>
        <span className="text-sm mt-2 text-gray-600">(Start typing to generate 3 variations)</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full h-[65vh]">
      {/* Main Display Area */}
      <div className="relative flex-1 rounded-3xl overflow-hidden shadow-2xl bg-black ring-1 ring-white/10 group">
        {/* Loading Overlay */}
        {(isGenerating || isGeneratingVideo) && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-500">
            <div className="relative w-20 h-20">
               <div className="absolute inset-0 border-t-2 border-albanian-red rounded-full animate-spin"></div>
               <div className="absolute inset-2 border-t-2 border-white/20 rounded-full animate-spin direction-reverse"></div>
            </div>
            <p className="mt-4 text-white font-mono tracking-widest text-xs uppercase animate-pulse">
              {isGeneratingVideo ? 'Creating Animation...' : 'Generating 3 Variations...'}
            </p>
          </div>
        )}

        {/* Content Display */}
        <div className={`w-full h-full transition-all duration-700 ${isGenerating || isGeneratingVideo ? 'scale-105 blur-sm opacity-80' : 'scale-100 blur-0 opacity-100'}`}>
          {currentMedia && (
            isVideo ? (
              <video 
                src={currentMedia} 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src={currentMedia} 
                alt="Generated Result" 
                className="w-full h-full object-cover"
              />
            )
          )}
        </div>
        
        {/* Download Button Overlay */}
        {currentMedia && !isGenerating && !isGeneratingVideo && (
          <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <a 
               href={currentMedia} 
               download={isVideo ? "albanian-ai-video.mp4" : `albanian-ai-image-${selectedIndex + 1}.png`}
               className="bg-black/50 hover:bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium text-xs flex items-center gap-2 border border-white/10"
              >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
               {isVideo ? 'Save Video' : 'Save Selected'}
             </a>
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {mediaUrls && mediaUrls.length > 0 && !isGenerating && !isVideo && (
        <div className="h-24 flex gap-3 px-1 overflow-x-auto pb-1">
          {mediaUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => onSelectIndex(index)}
              className={`relative h-full aspect-square rounded-xl overflow-hidden transition-all duration-300 border-2 ${selectedIndex === index ? 'border-albanian-red scale-100 shadow-lg shadow-albanian-red/20' : 'border-transparent opacity-60 hover:opacity-100 scale-95 hover:scale-100'}`}
            >
              <img src={url} alt={`Variation ${index + 1}`} className="w-full h-full object-cover" />
              {selectedIndex === index && (
                <div className="absolute inset-0 bg-albanian-red/10"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};