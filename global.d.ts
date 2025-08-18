// global.d.ts
export declare global {
  export interface LibraryEntry {
    name: string;
    input: string;
    prompt: string;
    voice: string;
  }

  // Audio file update type
  export interface AudioFileUpdate {
    name?: string;
    categoryId?: string | null;
    updatedAt: Date;
  }

  // Audio file create type
  export interface AudioFileCreate {
    userId: string;
    categoryId?: string | null;
    name: string;
    fileUrl: string;
    fileKey: string;
    fileSize: number;
    duration?: string | null;
    inputScript: string;
    voice: string;
    promptInstructions?: string | null;
  }

  // Audio file type (from database)
  export interface AudioFile {
    id: string;
    userId: string;
    categoryId: string | null;
    name: string;
    fileUrl: string;
    fileKey: string;
    fileSize: number | null;
    duration: string | null;
    inputScript: string;
    voice: string;
    promptInstructions: string | null;
    createdAt: Date;
    updatedAt: Date | null;
    deletedAt: Date | null;
  }

  // Category type
  export interface Category {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date | null;
  }

  export interface AudioMetadata {
    inputScript: string;
    voice: string;
    promptInstructions: string;
    timestamp: string;
    userId: string;
  }

}