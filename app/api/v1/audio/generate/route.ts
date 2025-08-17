import { NextRequest, NextResponse, userAgent } from "next/server";
import { auth } from "@/auth";
import { MAX_INPUT_LENGTH, MAX_PROMPT_LENGTH } from "@/constants";
import { voiceGenerationSchema } from "@/models/voiceGenerationSchema";
import { DateTime } from "luxon";
import { statusCodes } from "@/constants/statusCodes";
import { buildPromptInstructions } from "@/lib/buildPrompt";


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
        } }
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
   const prompt = validatedData.customInstructions || 
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

   // Truncate to max lengths
   const input = validatedData.inputScript.slice(0, MAX_INPUT_LENGTH);
   const instructions = prompt.slice(0, MAX_PROMPT_LENGTH);

   // Call OpenAI API
   const apiResponse = await fetch("https://api.openai.com/v1/audio/speech", {
     method: "POST",
     headers: {
       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
       "Content-Type": "application/json",
     },
     body: JSON.stringify({
       model: "gpt-4o-mini-tts",
       input, // The script to be spoken
       response_format,
       voice: validatedData.voice,
       ...(instructions && { instructions }), // The voice directions
     }),
   });

   if (!apiResponse.ok) {
     const errorText = await apiResponse.text();
     console.error("OpenAI API error:", errorText);
     return NextResponse.json({
       message: "Failed to generate audio",
       status: statusCodes.INTERNAL_SERVER_ERROR,
       success: false,
       error: errorText
     }, {
       status: statusCodes.INTERNAL_SERVER_ERROR,
       headers: { "Content-Type": "application/json" }
     });
   }

   // Generate timestamp in UTC
   const timestamp = DateTime.now().toUTC().toISO();
   const filename = `audio-${validatedData.voice}-${DateTime.now().toUTC().toMillis()}.${response_format}`;

   // Stream response back to client with metadata
   return new Response(apiResponse.body, {
     headers: {
       "Content-Type": response_format === "wav" ? "audio/wav" : "audio/mpeg",
       "Content-Disposition": `inline; filename="${filename}"`,
       "Cache-Control": "no-cache",
       "X-Audio-Params": JSON.stringify({
         inputScript: validatedData.inputScript,
         voice: validatedData.voice,
         promptInstructions: instructions,
         timestamp,
        //  userId: session.user.id
       })
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