import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnection } from "@/db";
import { audioFiles } from "@/db/schema";
import { statusCodes } from "@/constants/statusCodes";
import { eq, and } from "drizzle-orm";
import { supabaseAdmin } from "@/lib/supabase";
import { DateTime } from "luxon";

// GET single audio file
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    // Await the params object
    const { id } = await params;
    
    const [audioFile] = await dbConnection
      .select()
      .from(audioFiles)
      .where(
        and(
          eq(audioFiles.id, id),
          eq(audioFiles.userId, session.user.id)
        )
      )
      .limit(1);

    if (!audioFile) {
      return NextResponse.json({
        message: "Audio file not found",
        status: statusCodes.NOT_FOUND,
        success: false
      }, { status: statusCodes.NOT_FOUND });
    }

    return NextResponse.json({
      message: "Audio file retrieved successfully",
      status: statusCodes.OK,
      success: true,
      data: audioFile
    }, { status: statusCodes.OK });

  } catch (error) {
    console.error("Error fetching audio:", error);
    return NextResponse.json({
      message: "Internal server error",
      status: statusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: statusCodes.INTERNAL_SERVER_ERROR });
  }
}

// PATCH - Update audio file (name, category)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    // Await the params object
    const { id } = await params;
    const body = await req.json();
    const { name, categoryId } = body;

    // Check if audio file exists and belongs to user
    const [existingFile] = await dbConnection
      .select()
      .from(audioFiles)
      .where(
        and(
          eq(audioFiles.id, id),
          eq(audioFiles.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existingFile) {
      return NextResponse.json({
        message: "Audio file not found",
        status: statusCodes.NOT_FOUND,
        success: false
      }, { status: statusCodes.NOT_FOUND });
    }

    // Update the audio file
    const updateData: AudioFileUpdate = {
      updatedAt: DateTime.now().toUTC().toJSDate()
    };

    if (name !== undefined) updateData.name = name;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    const [updatedFile] = await dbConnection
      .update(audioFiles)
      .set(updateData)
      .where(
        and(
          eq(audioFiles.id, id),
          eq(audioFiles.userId, session.user.id)
        )
      )
      .returning();

    return NextResponse.json({
      message: "Audio file updated successfully",
      status: statusCodes.OK,
      success: true,
      data: updatedFile
    }, { status: statusCodes.OK });

  } catch (error) {
    console.error("Error updating audio:", error);
    return NextResponse.json({
      message: "Internal server error",
      status: statusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: statusCodes.INTERNAL_SERVER_ERROR });
  }
}

// DELETE audio file
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    // Await the params object
    const { id } = await params;
    
    // Get the audio file first to get the storage key
    const [audioFile] = await dbConnection
      .select()
      .from(audioFiles)
      .where(
        and(
          eq(audioFiles.id, id),
          eq(audioFiles.userId, session.user.id)
        )
      )
      .limit(1);

    if (!audioFile) {
      return NextResponse.json({
        message: "Audio file not found",
        status: statusCodes.NOT_FOUND,
        success: false
      }, { status: statusCodes.NOT_FOUND });
    }

    // Delete from Supabase Storage
    const { error: storageError } = await supabaseAdmin.storage
      .from('audio-files')
      .remove([audioFile.fileKey]);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    await dbConnection
      .delete(audioFiles)
      .where(
        and(
          eq(audioFiles.id, id),
          eq(audioFiles.userId, session.user.id)
        )
      );

    return NextResponse.json({
      message: "Audio file deleted successfully",
      status: statusCodes.OK,
      success: true
    }, { status: statusCodes.OK });

  } catch (error) {
    console.error("Error deleting audio:", error);
    return NextResponse.json({
      message: "Internal server error",
      status: statusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: statusCodes.INTERNAL_SERVER_ERROR });
  }
}