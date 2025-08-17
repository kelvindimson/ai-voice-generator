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

// Form fields for generation
export const voiceGenerationSchema = z.object({
 input: z.string().min(1).max(5000),
 voice: voiceSchema,
 instructions: z.string().optional(),
 
 // Granular controls
 emotion: z.string().optional(), // calm, excited, sympathetic, dramatic
 tone: z.string().optional(), // professional, friendly, authoritative
 pacing: z.enum(['slow', 'moderate', 'fast']).optional(),
 energy: z.enum(['low', 'medium', 'high']).optional(),
 accent: z.string().optional(), // British, French, neutral, etc.
 emphasis: z.string().optional(), // Words to emphasize
 pauseStrategy: z.enum(['natural', 'dramatic', 'minimal']).optional(),
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