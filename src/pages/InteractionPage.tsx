//it acts like a page in your website or app.Each file usually shows one full view to the user.
import React from 'react';
import InteractionForm from '../features/interactions/InteractionForm';
import AiAssistant from '../features/interactions/AiAssistant';

const InteractionPage: React.FC = () => {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">HCP Interaction Logging</h1>
        <p className="text-neutral-500 mt-1">
          Log your healthcare professional interactions with AI assistance
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100%-80px)]">
        <InteractionForm />
        <AiAssistant />
      </div>
    </div>
  );
};

export default InteractionPage;