// app/api/v1/audio/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnection } from "@/db";
import { audioFiles } from "@/db/schema";
import { statusCodes } from "@/constants/statusCodes";
import { eq, desc } from "drizzle-orm";

// GET all audio files for the authenticated user
export async function GET(req: NextRequest) {

if (req.method !== "GET") {
    return NextResponse.json({
        message: "Method Not Allowed",
        status: statusCodes.METHOD_NOT_ALLOWED,
        success: false
    }, { status: statusCodes.METHOD_NOT_ALLOWED });
  } 

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
    // Fetch all audio files for the user, ordered by creation date (newest first)
    const userAudioFiles = await dbConnection
      .select()
      .from(audioFiles)
      .where(eq(audioFiles.userId, session.user.id))
      .orderBy(desc(audioFiles.createdAt));

    return NextResponse.json({
      message: "Audio files retrieved successfully",
      status: statusCodes.OK,
      success: true,
      data: userAudioFiles
    }, { status: statusCodes.OK });

  } catch (error) {
    console.error("Error fetching audio files:", error);
    return NextResponse.json({
      message: "Internal server error",
      status: statusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: statusCodes.INTERNAL_SERVER_ERROR });
  }
}