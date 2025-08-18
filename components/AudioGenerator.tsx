"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import { toast } from "react-hot-toast";
import SaveAudioModal from "./SaveAudioModal";
import AudioPlayer from "@/components/AudioPlayer";
import { Voices } from "@/models/voiceGenerationSchema";

interface FormData {
  inputScript: string;
  voice: string;
  voiceAffect?: string;
  tone?: string;
  emotion?: string;
  pacing?: string;
  pronunciation?: string;
  pauses?: string;
  personality?: string;
  delivery?: string;
  customInstructions?: string;
}

export default function AudioGenerator() {
  const router = useRouter();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [audioMetadata, setAudioMetadata] = useState<AudioMetadata | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    inputScript: "",
    voice: "",
    voiceAffect: "",
    tone: "",
    emotion: "",
    pacing: "",
    pronunciation: "",
    pauses: "",
    personality: "",
    delivery: "",
    customInstructions: ""
  });

  // Generate audio mutation
  const generateMutation = useMutation({
    mutationFn: async (data: FormData) => {
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
      const metadata = response.headers.get("X-Audio-Params");
      if (metadata) {
        setAudioMetadata(JSON.parse(metadata));
      }

      return response.blob();
    },
    onSuccess: (blob) => {
      setAudioBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
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

  const handleGenerate = () => {
    if (!formData.inputScript.trim()) {
      toast.error("Please enter a script");
      return;
    }
    generateMutation.mutate(formData);
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `audio-${formData.voice}-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Audio downloaded!");
  };

  return (
    <div className="container max-w-6xl mx-auto p-6">
      
      <h1 className="text-3xl font-bold mb-8">Generate New Audio</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>Audio Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Script Input */}
            <div className="space-y-2">
              <Label htmlFor="script">Script *</Label>
              <Textarea
                id="script"
                placeholder="Enter the text you want to convert to speech..."
                value={formData.inputScript}
                onChange={(e) => setFormData({ ...formData, inputScript: e.target.value })}
                rows={6}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.inputScript.length}/1000
              </p>
            </div>

            {/* Voice Selection */}
            <div className="space-y-2">
              <Label htmlFor="voice">Voice *</Label>
              <Select
                value={formData.voice}
                onValueChange={(value) => setFormData({ ...formData, voice: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {Voices.map((voice) => (
                    <SelectItem key={voice} value={voice}>
                      {voice.charAt(0).toUpperCase() + voice.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Voice Customization Tabs */}
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Controls</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-3">
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Input
                    id="tone"
                    placeholder="e.g., friendly, professional, serious"
                    value={formData.tone}
                    onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="emotion">Emotion</Label>
                  <Input
                    id="emotion"
                    placeholder="e.g., excited, calm, empathetic"
                    value={formData.emotion}
                    onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="pacing">Pacing</Label>
                  <Input
                    id="pacing"
                    placeholder="e.g., slow, moderate, fast"
                    value={formData.pacing}
                    onChange={(e) => setFormData({ ...formData, pacing: e.target.value })}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-3">
                <div>
                  <Label htmlFor="custom">Custom Instructions</Label>
                  <Textarea
                    id="custom"
                    placeholder="Override all other settings with custom voice instructions..."
                    value={formData.customInstructions}
                    onChange={(e) => setFormData({ ...formData, customInstructions: e.target.value })}
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="w-full"
              size="lg"
            >
              {generateMutation.isPending ? "Generating..." : "Generate Audio"}
            </Button>
          </CardContent>
        </Card>

        {/* Player Section */}
        <Card>
          <CardHeader>
            <CardTitle>Audio Player</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {audioUrl ? (
              <>
                <AudioPlayer 
                  src={audioUrl}
                  title="Generated Audio"
                  onDownload={handleDownload}
                />

                {/* Save Button */}
                <Button
                  onClick={() => setShowSaveModal(true)}
                  className="w-full"
                  size="lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save to Library
                </Button>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Generate audio to see the player
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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