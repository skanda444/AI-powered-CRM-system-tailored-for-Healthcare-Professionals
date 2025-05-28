import { configureStore } from '@reduxjs/toolkit';
import interactionReducer from './slices/interactionSlice';
import aiAssistantReducer from './slices/aiAssistantSlice';

export const store = configureStore({
  reducer: {
    interaction: interactionReducer,
    aiAssistant: aiAssistantReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;