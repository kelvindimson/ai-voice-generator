"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Save, Mic, Sparkles, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import SaveAudioModal from "./SaveAudioModal";
import AudioPlayer from "@/components/AudioPlayer";
import { 
  voiceGenerationSchema, 
  type VoiceGeneration, 
  type Voice,
  Voices,
  defaultVoice 
} from "@/models/voiceGenerationSchema";

// Voice metadata for better UX
const voiceMetadata: Record<Voice, { label: string; description: string; icon?: string }> = {
  alloy: { label: "Alloy", description: "Neutral and balanced" },
  ash: { label: "Ash", description: "Warm and friendly" },
  ballad: { label: "Ballad", description: "Expressive and emotional" },
  coral: { label: "Coral", description: "Clear and articulate" },
  echo: { label: "Echo", description: "Smooth and calming" },
  sage: { label: "Sage", description: "Wise and authoritative" },
  shimmer: { label: "Shimmer", description: "Bright and energetic" },
  verse: { label: "Verse", description: "Dynamic and versatile" },
};

interface AudioMetadata {
  inputScript: string;
  voice: string;
  promptInstructions?: string;
  timestamp?: string;
}

export default function AudioGenerator() {
  const router = useRouter();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [audioMetadata, setAudioMetadata] = useState<AudioMetadata | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  // Form setup with validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VoiceGeneration>({
    resolver: zodResolver(voiceGenerationSchema),
    defaultValues: {
      inputScript: "",
      voice: defaultVoice,
      tone: "neutral",
      pacing: "steady",
      voiceAffect: "",
      emotion: "",
      pronunciation: "",
      pauses: "",
      personality: "",
      delivery: "",
      customInstructions: "",
    },
  });

  const selectedVoice = watch("voice");

  // Generate audio mutation
  const generateMutation = useMutation({
    mutationFn: async (data: VoiceGeneration) => {
      const response = await fetch("/api/v1/audio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate audio");
      }

      // Get metadata from headers
      const metadataHeader = response.headers.get("X-Audio-Params");
      const encodingHeader = response.headers.get("X-Audio-Params-Encoding");
      
      if (metadataHeader) {
        try {
          let metadata;
          if (encodingHeader === "base64") {
            // Decode base64 metadata
            const decodedString = atob(metadataHeader);
            metadata = JSON.parse(decodedString);
          } else {
            // Fallback to direct JSON parse for backwards compatibility
            metadata = JSON.parse(metadataHeader);
          }
          setAudioMetadata(metadata);
        } catch (error) {
          console.error("Failed to parse audio metadata:", error);
          // Set minimal metadata on error
          setAudioMetadata({
            inputScript: data.inputScript,
            voice: data.voice,
            promptInstructions: ""
          });
        }
      }

      return response.blob();
    },
    onSuccess: (blob) => {
      setAudioBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setShowPlayer(true);
      toast.success("Audio generated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Save audio mutation
  const saveMutation = useMutation({
    mutationFn: async ({ name, categoryId }: { name: string; categoryId?: string }) => {
      if (!audioBlob || !audioMetadata) throw new Error("No audio to save");

      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.mp3");
      formData.append("name", name);
      if (categoryId) formData.append("categoryId", categoryId);
      formData.append("inputScript", audioMetadata.inputScript);
      formData.append("voice", audioMetadata.voice);
      formData.append("promptInstructions", audioMetadata.promptInstructions || "");

      const response = await fetch("/api/v1/audio/save", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save audio");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Audio saved successfully!");
      router.push(`/audio/${data.data.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const onSubmit = (data: VoiceGeneration) => {
    generateMutation.mutate(data);
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `audio-${selectedVoice}-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Audio downloaded!");
  };

  const closePlayer = () => {
    setShowPlayer(false);
  };

  return (
    <div className={cn("min-h-screen bg-background", showPlayer && "pb-40")}>
      <div className="container max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Generate Audio</h1>
          <p className="text-muted-foreground">Transform your text into natural-sounding speech</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Script Input Card */}
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Your Script</CardTitle>
              <CardDescription>Enter the text you want to convert to speech</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Textarea
                  {...register("inputScript")}
                  placeholder="Type or paste your text here..."
                  rows={8}
                  className="resize-none font-mono"
                  maxLength={1000}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-destructive">{errors.inputScript?.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {watch("inputScript")?.length || 0}/1000
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice Selection Card */}
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Choose Voice</CardTitle>
              <CardDescription>Select the perfect voice for your content</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedVoice}
                onValueChange={(value) => setValue("voice", value as Voice)}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {Voices.map((voice) => (
                  <div key={voice}>
                    <RadioGroupItem
                      value={voice}
                      id={voice}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={voice}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                        "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                        "peer-data-[state=checked]:text-primary"
                      )}
                    >
                      <Mic className="mb-2 h-6 w-6" />
                      <span className="font-semibold">{voiceMetadata[voice].label}</span>
                      <span className="text-xs text-muted-foreground text-center mt-1">
                        {voiceMetadata[voice].description}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.voice && (
                <p className="text-xs text-destructive mt-2">{errors.voice.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Voice Customization Card */}
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Voice Customization</CardTitle>
              <CardDescription>Fine-tune how your audio sounds</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tone">Tone</Label>
                      <Input
                        id="tone"
                        {...register("tone")}
                        placeholder="e.g., friendly, professional, serious"
                      />
                      <p className="text-xs text-muted-foreground">
                        Default: neutral
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emotion">Emotion</Label>
                      <Input
                        id="emotion"
                        {...register("emotion")}
                        placeholder="e.g., excited, calm, empathetic"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pacing">Pacing</Label>
                      <Input
                        id="pacing"
                        {...register("pacing")}
                        placeholder="e.g., slow, moderate, fast"
                      />
                      <p className="text-xs text-muted-foreground">
                        Default: steady
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="voiceAffect">Voice Affect</Label>
                      <Input
                        id="voiceAffect"
                        {...register("voiceAffect")}
                        placeholder="e.g., deep and commanding"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="personality">Personality</Label>
                      <Input
                        id="personality"
                        {...register("personality")}
                        placeholder="e.g., cheerful guide, noir detective"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="delivery">Delivery Style</Label>
                      <Input
                        id="delivery"
                        {...register("delivery")}
                        placeholder="e.g., monotone, dynamic, theatrical"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pronunciation">Pronunciation Notes</Label>
                      <Input
                        id="pronunciation"
                        {...register("pronunciation")}
                        placeholder="Special pronunciation instructions"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pauses">Pause Instructions</Label>
                      <Input
                        id="pauses"
                        {...register("pauses")}
                        placeholder="Where and how to pause"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom">Custom Instructions</Label>
                    <Textarea
                      id="custom"
                      {...register("customInstructions")}
                      placeholder="Override all other settings with detailed voice instructions..."
                      rows={5}
                      className="resize-none"
                      maxLength={2000}
                    />
                    <p className="text-xs text-muted-foreground">
                      These instructions will override all other voice settings. {watch("customInstructions")?.length || 0}/2000
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button 
            type="submit"
            disabled={generateMutation.isPending}
            className="w-full py-8 text-xl"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {generateMutation.isPending ? "Generating Audio..." : "Generate Audio"}
          </Button>
        </form>
      </div>

      {/* Sticky Player at Bottom */}
      {showPlayer && audioUrl && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
          <div className="container max-w-6xl mx-auto p-1">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <AudioPlayer 
                  src={audioUrl}
                  title="Generated Audio"
                  onDownload={handleDownload}
                  className="border-0 p-0"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowSaveModal(true)}
                  size="sm"
                  variant="default"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={closePlayer}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      <SaveAudioModal
        open={showSaveModal}
        onOpenChange={setShowSaveModal}
        onSave={(name, categoryId) => {
          saveMutation.mutate({ name, categoryId });
          setShowSaveModal(false);
        }}
        isLoading={saveMutation.isPending}
      />
    </div>
  );
}