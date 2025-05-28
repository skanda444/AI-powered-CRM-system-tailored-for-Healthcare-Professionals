//Stores the state/data for user interactions — like typed input, selected options, current mode, etc.
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Material {
  id: string;
  name: string;
}

export interface Sample {
  id: string;
  name: string;
  quantity: number;
}

export interface InteractionState {
  hcpName: string;
  interactionType: 'Meeting' | 'Call' | '';
  date: string;
  time: string;
  attendees: string[];
  topicsDiscussed: string;
  materialsShared: Material[];
  samplesDistributed: Sample[];
  hcpSentiment: 'Positive' | 'Neutral' | 'Negative' | '';
  outcomes: string;
  followUpActions: string;
  aiSuggestedFollowUps: string[];
  isFormUpdated: boolean;
  lastUpdatedField: string | null;
}

const initialState: InteractionState = {
  hcpName: '',
  interactionType: '',
  date: '',
  time: '',
  attendees: [],
  topicsDiscussed: '',
  materialsShared: [],
  samplesDistributed: [],
  hcpSentiment: '',
  outcomes: '',
  followUpActions: '',
  aiSuggestedFollowUps: [],
  isFormUpdated: false,
  lastUpdatedField: null,
};

export const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {
    setHcpName: (state, action: PayloadAction<string>) => {
      state.hcpName = action.payload;
      state.isFormUpdated = true;
      state.lastUpdatedField = 'hcpName';
    },
    setInteractionType: (state, action: PayloadAction<'Meeting' | 'Call' | ''>) => {
      state.interactionType = action.payload;
      state.isFormUpdated = true;
      state.lastUpdatedField = 'interactionType';
    },
    setDate: (state, action: PayloadAction<string>) => {
      state.date = action.payload;
      state.isFormUpdated = true;
      state.lastUpdatedField = 'date';
    },
    setTime: (state, action: PayloadAction<string>) => {
      state.time = action.payload;
      state.isFormUpdated = true;
      state.lastUpdatedField = 'time';
    },
    setAttendees: (state, action: PayloadAction<string[]>) => {
      state.attendees = action.payload;
      state.isFormUpdated = true;
      state.lastUpdatedField = 'attendees';
    },
    setTopicsDiscussed: (state, action: PayloadAction<string>) => {
      state.topicsDiscussed = action.payload;
      state.isFormUpdated = true;
      state.lastUpdatedField = 'topicsDiscussed';
    },
    setMaterialsShared: (state, action: PayloadAction<Material[]>) => {
      state.materialsShared = action.payload;
      state.isFormUpdated = true;
      state.lastUpdatedField = 'materialsShared';
    },
    setSamplesDistributed: (state, action: PayloadAction<Sample[]>) => {
      state.samplesDistributed = action.payload;
      state.isFormUpdated = true;
      state.lastUpdatedField = 'samplesDistributed';
    },
    setHcpSentiment: (state, action: PayloadAction<'Positive' | 'Neutral' | 'Negative' | ''>) => {
      state.hcpSentiment = action.payload;
      state.isFormUpdated = true;
      state.lastUpdatedField = 'hcpSentiment';
    },
    setOutcomes: (state, action: PayloadAction<string>) => {
      state.outcomes = action.payload;
      state.isFormUpdated = true;
      state.lastUpdatedField = 'outcomes';
    },
    setFollowUpActions: (state, action: PayloadAction<string>) => {
      state.followUpActions = action.payload;
      state.isFormUpdated = true;
      state.lastUpdatedField = 'followUpActions';
    },
    setAiSuggestedFollowUps: (state, action: PayloadAction<string[]>) => {
      state.aiSuggestedFollowUps = action.payload;
      state.isFormUpdated = true;
      state.lastUpdatedField = 'aiSuggestedFollowUps';
    },
    resetFormUpdatedFlag: (state) => {
      state.isFormUpdated = false;
      state.lastUpdatedField = null;
    },
    updateFormFromAiResponse: (state, action: PayloadAction<Partial<InteractionState>>) => {
      const updates = action.payload;
      
      // Only update fields that are present in the payload
      Object.keys(updates).forEach((key) => {
        if (key in state && key !== 'isFormUpdated' && key !== 'lastUpdatedField') {
          // @ts-ignore: key is a valid key of state
          state[key] = updates[key as keyof InteractionState];
        }
      });
      
      state.isFormUpdated = true;
    },
    resetInteractionForm: (state) => {
      return initialState;
    },
  },
});

export const {
  setHcpName,
  setInteractionType,
  setDate,
  setTime,
  setAttendees,
  setTopicsDiscussed,
  setMaterialsShared,
  setSamplesDistributed,
  setHcpSentiment,
  setOutcomes,
  setFollowUpActions,
  setAiSuggestedFollowUps,
  resetFormUpdatedFlag,
  updateFormFromAiResponse,
  resetInteractionForm,
} = interactionSlice.actions;

export default interactionSlice.reducer;