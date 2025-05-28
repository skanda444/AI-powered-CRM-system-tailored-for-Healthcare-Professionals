//Stores the state/data for the assistant — like messages, loading status, open/close state.
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { InteractionState } from './interactionSlice';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AiAssistantState {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
}

const initialState: AiAssistantState = {
  messages: [],
  isTyping: false,
  error: null,
};

// Mock API call for demo purposes
// In a real app, this would connect to the LangGraph backend
export const sendMessage = createAsyncThunk(
  'aiAssistant/sendMessage',
  async (content: string, { getState }) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Example response to simulate AI processing
    // In a real app, this would come from the backend
    const response = processMessage(content);
    
    return {
      message: {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: response.message,
        timestamp: Date.now(),
      },
      formUpdates: response.formUpdates,
    };
  }
);

// Simple processing function to simulate AI extraction
function processMessage(content: string): { message: string, formUpdates: Partial<InteractionState> } {
  const formUpdates: Partial<InteractionState> = {};
  let responseMessage = "I've processed your input.";
  
  // Extract HCP name (simple pattern matching)
  const hcpMatch = content.match(/Dr\.\s+(\w+)/i);
  if (hcpMatch) {
    formUpdates.hcpName = hcpMatch[0];
  }
  
  // Extract interaction type
  if (content.toLowerCase().includes('met')) {
    formUpdates.interactionType = 'Meeting';
  } else if (content.toLowerCase().includes('call')) {
    formUpdates.interactionType = 'Call';
  }
  
  // Extract date and time
  const timeMatch = content.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    formUpdates.time = `${timeMatch[1]}:${timeMatch[2]}`;
  }
  
  const dateMatch = content.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/i);
  if (dateMatch) {
    const month = dateMatch[1].toLowerCase();
    const day = dateMatch[2];
    const monthNum = {
      january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
      july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
    }[month];
    
    const currentYear = new Date().getFullYear();
    formUpdates.date = `${currentYear}-${monthNum}-${day.padStart(2, '0')}`;
  }
  
  // Extract topics
  if (content.includes('discuss')) {
    const topicsMatch = content.match(/discuss\s+([^.]+)/i);
    if (topicsMatch) {
      formUpdates.topicsDiscussed = topicsMatch[1].trim();
    }
  }
  
  // Extract sentiment
  if (content.toLowerCase().includes('positive')) {
    formUpdates.hcpSentiment = 'Positive';
  } else if (content.toLowerCase().includes('negative')) {
    formUpdates.hcpSentiment = 'Negative';
  } else if (content.toLowerCase().includes('neutral')) {
    formUpdates.hcpSentiment = 'Neutral';
  }
  
  // Extract follow-up actions
  if (content.toLowerCase().includes('follow-up') || content.toLowerCase().includes('follow up')) {
    const followUpMatch = content.match(/follow-?up\s+([^.]+)/i);
    if (followUpMatch) {
      formUpdates.followUpActions = followUpMatch[1].trim();
    }
  }
  
  // Generate suggested follow-ups based on content
  if (content.toLowerCase().includes('oncoboost') && formUpdates.hcpSentiment === 'Positive') {
    formUpdates.aiSuggestedFollowUps = [
      'Schedule follow-up meeting to discuss patient selection criteria',
      'Share latest OncoBoost efficacy data from Phase III trials',
      'Invite to upcoming OncoBoost symposium next month'
    ];
    
    responseMessage = "I've processed your interaction with Dr. Patel about OncoBoost. Based on the positive sentiment, I've suggested some follow-up actions related to patient selection and sharing additional data. Would you like to add any outcomes from this meeting?";
  } else {
    formUpdates.aiSuggestedFollowUps = [
      'Schedule follow-up call in 2 weeks',
      'Send additional materials via email',
      'Connect with office manager to arrange next visit'
    ];
  }
  
  return {
    message: responseMessage,
    formUpdates
  };
}

export const aiAssistantSlice = createSlice({
  name: 'aiAssistant',
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: Date.now().toString(),
        role: 'user',
        content: action.payload,
        timestamp: Date.now(),
      });
    },
    addAssistantMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: Date.now().toString(),
        role: 'assistant',
        content: action.payload,
        timestamp: Date.now(),
      });
    },
    setIsTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isTyping = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload.message);
        state.isTyping = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isTyping = false;
        state.error = action.error.message || 'An error occurred';
      });
  },
});

export const {
  addUserMessage,
  addAssistantMessage,
  setIsTyping,
  clearMessages,
} = aiAssistantSlice.actions;

export default aiAssistantSlice.reducer;