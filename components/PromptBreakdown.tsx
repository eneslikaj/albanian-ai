import React from 'react';
import { PromptDetails } from '../types';

interface PromptBreakdownProps {
  data: PromptDetails;
}

const DetailRow: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <div className="mb-4 last:mb-0">
    <h4 className="text-xs uppercase tracking-wider text-albanian-red font-bold mb-1">{title}</h4>
    <p className="text-sm text-gray-300 leading-relaxed">{content}</p>
  </div>
);

export const PromptBreakdown: React.FC<PromptBreakdownProps> = ({ data }) => {
  return (
    <div className="glass-panel rounded-xl p-6 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center mb-6">
        <div className="w-2 h-8 bg-albanian-red mr-3 rounded-sm"></div>
        <h3 className="text-xl font-bold text-white">Prompt Analysis</h3>
      </div>
      
      <div className="space-y-6 divide-y divide-white/10">
        <div className="pt-2">
          <DetailRow title="Scene Overview" content={data.sceneOverview} />
        </div>
        <div className="pt-4">
          <DetailRow title="Subject Details" content={data.subjectDetails} />
        </div>
        <div className="pt-4">
          <DetailRow title="Environment (Albanian Context)" content={data.environment} />
        </div>
        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailRow title="Camera & Composition" content={data.cameraComposition} />
            <DetailRow title="Lighting & Atmosphere" content={data.lightingAtmosphere} />
        </div>
        <div className="pt-4">
           <DetailRow title="Style" content={data.styleParameters} />
        </div>
        <div className="pt-4 bg-black/20 -mx-6 px-6 pb-2">
           <div className="mt-4">
             <DetailRow title="Final Generated Prompt (English)" content={data.finalGenerationPrompt} />
           </div>
        </div>
      </div>
    </div>
  );
};
