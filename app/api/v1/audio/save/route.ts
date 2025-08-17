import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnection } from "@/db";
import { audioFiles } from "@/db/schema";
import { statusCodes } from "@/constants/statusCodes";
import { DateTime } from "luxon";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { 
        message: "Unauthorized access",
        status: statusCodes.UNAUTHORIZED,
        success: false
      },
      { status: statusCodes.UNAUTHORIZED }
    );
  }

  try {
    const formData = await req.formData();
    
    // Get the audio file and metadata
    const audioFile = formData.get("audio") as File;
    const name = formData.get("name") as string;
    const categoryId = formData.get("categoryId") as string | null;
    const inputScript = formData.get("inputScript") as string;
    const voice = formData.get("voice") as string;
    const promptInstructions = formData.get("promptInstructions") as string;
    const duration = formData.get("duration") as string | null;

    if (!audioFile || !name || !inputScript || !voice) {
      return NextResponse.json({
        message: "Missing required fields",
        status: statusCodes.BAD_REQUEST,
        success: false
      }, { status: statusCodes.BAD_REQUEST });
    }

    // Generate unique file key
    const timestamp = DateTime.now().toUTC().toMillis();
    const fileKey = `${session.user.id}/${timestamp}-${name.replace(/\s+/g, '-')}.mp3`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(fileKey, audioFile, {
        contentType: 'audio/mpeg',
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({
        message: "Failed to upload audio file",
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        error: uploadError.message
      }, { status: statusCodes.INTERNAL_SERVER_ERROR });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(fileKey);

    // Save to database
    const [newAudioFile] = await dbConnection
      .insert(audioFiles)
      .values({
        userId: session.user.id,
        categoryId: categoryId || null,
        name,
        fileUrl: publicUrl,
        fileKey,
        fileSize: audioFile.size,
        duration: duration ? duration.toString() : null,
        inputScript,
        voice,
        promptInstructions: promptInstructions || null,
      })
      .returning();

    return NextResponse.json({
      message: "Audio file saved successfully",
      status: statusCodes.OK,
      success: true,
      data: newAudioFile
    }, { status: statusCodes.OK });

  } catch (error) {
    console.error("Error saving audio:", error);
    return NextResponse.json({
      message: "Internal server error",
      status: statusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: statusCodes.INTERNAL_SERVER_ERROR });
  }
}