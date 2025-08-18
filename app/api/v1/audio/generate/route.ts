import { NextRequest, NextResponse, userAgent } from "next/server";
import { auth } from "@/auth";
import { MAX_INPUT_LENGTH, MAX_PROMPT_LENGTH } from "@/constants";
import { voiceGenerationSchema } from "@/models/voiceGenerationSchema";
import { DateTime } from "luxon";
import { statusCodes } from "@/constants/statusCodes";
import { buildPromptInstructions } from "@/lib/buildPrompt";
import { 
  sanitizeForTTS, 
  sanitizePrompt, 
  validateTextLength 
} from "@/lib/textSanitizer";

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
      { status: statusCodes.UNAUTHORIZED, 
        headers: { 
          "Content-Type": "application/json" 
        } 
      }
    );
  }

  const ua = userAgent(req);
  const response_format = ua.engine?.name === "Blink" ? "wav" : "mp3";

  try {
    // Parse request body
    const body = await req.json();
    
    // Validate with schema
    const validationResult = voiceGenerationSchema.safeParse(body);
    
   if (!validationResult.success) {
        return NextResponse.json({
            message: "Invalid request data",
            status: statusCodes.BAD_REQUEST,
            success: false
        }, {
            status: statusCodes.BAD_REQUEST,
            headers: { "Content-Type": "application/json" }
        })
   }

    const validatedData = validationResult.data;

    // Build prompt from fields or use custom instructions
    const rawPrompt = validatedData.customInstructions || 
                      buildPromptInstructions({
                        voiceAffect: validatedData.voiceAffect,
                        tone: validatedData.tone,
                        emotion: validatedData.emotion,
                        pacing: validatedData.pacing,
                        pronunciation: validatedData.pronunciation,
                        pauses: validatedData.pauses,
                        personality: validatedData.personality,
                        delivery: validatedData.delivery,
                      });

    // Sanitize input script and prompt
    let sanitizedInput: string;
    let sanitizedInstructions: string = '';

    try {
      // Sanitize the input script (preserve line breaks for natural pausing)
      sanitizedInput = sanitizeForTTS(validatedData.inputScript);
      sanitizedInput = validateTextLength(sanitizedInput, MAX_INPUT_LENGTH);

      // Sanitize the prompt instructions (single line, no special formatting)
      if (rawPrompt) {
        sanitizedInstructions = sanitizePrompt(rawPrompt);
        sanitizedInstructions = validateTextLength(sanitizedInstructions, MAX_PROMPT_LENGTH);
      }
    } catch (sanitizationError) {
      console.error("Sanitization error:", sanitizationError);
      return NextResponse.json({
        message: "Failed to process input text. Please check for special characters.",
        status: statusCodes.BAD_REQUEST,
        success: false,
        error: sanitizationError instanceof Error ? sanitizationError.message : "Text sanitization failed"
      }, {
        status: statusCodes.BAD_REQUEST,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Log sanitized content for debugging (remove in production)
    console.log("Sanitized input length:", sanitizedInput.length);
    console.log("Sanitized instructions length:", sanitizedInstructions.length);

    // Call OpenAI API
    const apiResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        input: sanitizedInput, // The sanitized script to be spoken
        response_format,
        voice: validatedData.voice,
        ...(sanitizedInstructions && { instructions: sanitizedInstructions }), // The sanitized voice directions
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("OpenAI API error:", errorText);
      
      // Parse error message if possible
      let errorMessage = "Failed to generate audio";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        // If not JSON, use the raw text (truncated)
        errorMessage = errorText.slice(0, 200);
      }

      return NextResponse.json({
        message: errorMessage,
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
      }, {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Generate timestamp in UTC
    const timestamp = DateTime.now().toUTC().toISO();
    const filename = `audio-${validatedData.voice}-${DateTime.now().toUTC().toMillis()}.${response_format}`;

    // Sanitize metadata for headers (headers must be ASCII)
    const metadataForHeaders = {
      inputScript: sanitizedInput, // Use sanitized version for headers
      voice: validatedData.voice,
      promptInstructions: sanitizedInstructions || '', // Already sanitized
      timestamp,
      // userId: session.user.id
    };

    // Ensure the JSON string is ASCII-safe
    const metadataJson = JSON.stringify(metadataForHeaders);
    // Additional safety: encode to base64 to ensure no special characters in headers
    const safeMetadata = Buffer.from(metadataJson).toString('base64');

    // Stream response back to client with metadata
    return new Response(apiResponse.body, {
      headers: {
        "Content-Type": response_format === "wav" ? "audio/wav" : "audio/mpeg",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-cache",
        "X-Audio-Params": safeMetadata, // Base64 encoded to ensure ASCII safety
        "X-Audio-Params-Encoding": "base64" // Indicate encoding method
      },
    });

  } catch (error) {
    console.error("Error in audio generation:", error);
    return NextResponse.json({
      message: "Internal server error",
      status: statusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, {
      status: statusCodes.INTERNAL_SERVER_ERROR,
      headers: { "Content-Type": "application/json" }
    });
  }
}