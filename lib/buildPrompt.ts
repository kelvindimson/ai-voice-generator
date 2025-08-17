export function buildPromptInstructions(params: { voiceAffect?: string; tone?: string; emotion?: string; pacing?: string;
     pronunciation?: string; pauses?: string; personality?: string; delivery?: string; }): string {

 const promptParts = [];
 
 if (params.voiceAffect) {
   promptParts.push(`Voice Affect: ${params.voiceAffect}`);
 }
 if (params.tone) {
   promptParts.push(`Tone: ${params.tone}`);
 }
 if (params.emotion) {
   promptParts.push(`Emotion: ${params.emotion}`);
 }
 if (params.pacing) {
   promptParts.push(`Pacing: ${params.pacing}`);
 }
 if (params.pronunciation) {
   promptParts.push(`Pronunciation: ${params.pronunciation}`);
 }
 if (params.pauses) {
   promptParts.push(`Pauses: ${params.pauses}`);
 }
 if (params.personality) {
   promptParts.push(`Personality: ${params.personality}`);
 }
 if (params.delivery) {
   promptParts.push(`Delivery: ${params.delivery}`);
 }
 
 return promptParts.join("\n\n");
}
