export interface EyeContactInterval {
  startS: number;
  endS: number;
}

export interface EyeContactTimes {
  eyeContactS: number;
  noEyeContactS: number;
  offscreenS: number;
}

export interface EyeContactData {
  ecIntervals?: EyeContactInterval[];
  ecTimes?: EyeContactTimes;
  ratio?: number;
}

export interface CenteringData {
  avgBoundingBox?: [[number, number], [number, number]];
  centeredPct?: number;
  centeringGrade?: string; // e.g., "CENTERED_PERFECT"
  centeringList?: string[]; // e.g., ["good", "good"]
}

export interface WpmPlotData {
  x?: number[];
  y?: (number | null)[]; // Y-values can be numbers or null
}

export interface PacingData {
  wordsPerMinute?: number;
  wpmPlotData?: WpmPlotData;
}

export interface PauseDetail {
  duration: number;
  prevStartS: number; // Assuming this is the start second of the word/phrase *before* the pause
  text: string; // e.g., "word_before_pause ... word_after_pause"
}

export interface TranscriptWord {
  word: string;
  startS: number;
  endS: number;
  confidence?: number;
  speaker?: string; // or number
}

export interface TranscriptEntry {
  speaker?: string; // or number
  transcript: string;
  words?: TranscriptWord[]; // Detailed word-level timings
  startS?: number; // Start time of this transcript segment
  endS?: number; // End time of this transcript segment
}

// Interface for individual scenario goals (from the scenarios example)
export interface ScenarioGoal {
  id: string;
  name: string;
  goalKind: string; // "score", "binary", "compound"
  userDescription: string;
  isCustom: boolean;
  // createdDate, modifiedDate, createdByEmail, state can be added if needed
}

// Interface for a selected scenario linked to a recording
export interface SelectedScenarioInfo {
  scenarioId: string;
  title: string;
  goalIds?: string[]; // IDs of the goals for this scenario
  // We can expand this if we need to store more scenario details directly with the recording
}

export interface Recording {
  id: string;
  userId: string;
  title?: string;
  videoUrl?: string; // Original uploaded video URL
  transcodedVideoUrl?: string; // URL of the processed/optimized video for playback
  audioUrl?: string; // URL of the extracted audio
  createdAt: any; // Firestore Timestamp
  durationSeconds?: number; // Timer-based duration
  thumbnailUrl?: string; // Optional: URL for a video thumbnail
  uploadStatus?: 'uploading' | 'completed' | 'failed'; // Status of the raw video upload

  // AI Analysis Fields
  transcript?: TranscriptEntry[]; // Array of transcript segments or a single entry
  transcriptText?: string; // Concatenated full transcript for simpler display/search
  eyeContact?: EyeContactData;
  centering?: CenteringData;
  pacing?: PacingData;
  pauses?: PauseDetail[];
  
  // AI Coach & Overall Analysis
  selectedScenario?: SelectedScenarioInfo; // If a scenario was chosen for this recording
  achievedGoals?: { goalId: string; achieved: boolean; score?: number; details?: string }[]; // Feedback on scenario goals
  coachFeedback?: string; // General AI coach summary or detailed suggestions
  overallAnalysis?: {
    clarityScore?: number;
    engagementScore?: number;
    // other summary metrics
  };
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
}

// For the list of available scenarios (global configuration, not per recording)
export interface ScenarioDefinition {
  id: string;
  templateDefiningPromptDetails?: string;
  description: string;
  userProvidedContext?: string;
  personaIds?: string[];
  enabled: boolean;
  isTemplate: boolean;
  templateSubType?: string;
  title: string;
  scenarioTypeId: string;
  scenarioUX: string; // "conversation", "presentation"
  goalIds: string[];
  autoEndEnabled?: boolean;
  defaultCompany?: string;
  defaultRole?: string;
  path?: string; // Firestore path or identifier
  // persona: null; // Can be expanded if persona details are fetched/needed
  // usedByPrograms: boolean; // Can be added if needed
  goals: ScenarioGoal[]; // Full goal objects
  qaModeEnabled?: boolean;
}

export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  // any other user-specific fields
} 