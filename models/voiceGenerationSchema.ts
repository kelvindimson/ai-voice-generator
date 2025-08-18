import z from 'zod';

// Voice models
export const voiceSchema = z.enum([
 "alloy",
 "ash",
 "ballad",
 "coral",
 "echo",
 "sage",
 "shimmer",
 "verse",
]);

export const voiceGenerationSchema = z.object({
  // Core required fields
  inputScript: z.string().min(1, "Input script is required").max(1000),
  voice: voiceSchema,
  
  // Most common instruction components from LIBRARY
  voiceAffect: z.string().optional(), // "calm and composed", "deep and commanding", "energetic"
  tone: z.string(), // "friendly", "serious", "playful", "dramatic"
  emotion: z.string().optional(), // "empathy", "excitement", "calm reassurance"
  pacing: z.string().optional(), // "slow and deliberate", "steady", "rapid", "moderate"
  
  // Secondary common fields
  pronunciation: z.string().optional(), // Special pronunciation instructions
  pauses: z.string().optional(), // Where and how to pause
  personality: z.string().optional(), // "cheerful guide", "noir detective", "exuberant chef"
  delivery: z.string().optional(), // "monotone", "dynamic", "theatrical"
  
  // Full custom instructions (if user wants to override granular controls)
  customInstructions: z.string().max(2000).optional(),
});

// For preset generation based on LIBRARY examples
export const presetSchema = z.enum([
  'calm', 'dramatic', 'fitness-instructor', 'sincere', 'sympathetic',
  'serene', 'sports-coach', 'medieval-knight', 'patient-teacher',
  'connoisseur', 'emo-teenager', 'santa', 'bedtime-story', 'robot',
  'friendly', 'gourmet-chef', 'old-timey', 'smooth-jazz-dj', 'auctioneer',
  'mad-scientist', 'true-crime-buff', 'professional', 'cowboy',
  'chill-surfer', 'pirate', 'nyc-cabbie', 'cheerleader', 'noir-detective',
  'eternal-optimist'
]);

// When generating from preset
export const generateFromPresetSchema = z.object({
  preset: presetSchema,
  customInput: z.string().optional(), // Override the default input text
});

// Audio file record schema
export const audioFileSchema = z.object({
 id: z.string(),
 userId: z.string(),
 name: z.string().min(1).max(100),
 fileUrl: z.url(),
 metadata: voiceGenerationSchema,
 duration: z.number().optional(),
 fileSize: z.number().optional(),
 createdAt: z.date(),
 updatedAt: z.date().optional(),
 deletedAt: z.date().optional()
});

export type Voice = z.infer<typeof voiceSchema>;
export type VoiceGeneration = z.infer<typeof voiceGenerationSchema>;
export type AudioFile = z.infer<typeof audioFileSchema>;

export const Voices = voiceSchema.options;
export const defaultVoice: Voice = "alloy";