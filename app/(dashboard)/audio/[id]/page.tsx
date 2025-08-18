"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
import { formatDateTime } from "@/lib/dateUtils";
import { useParams } from "next/navigation";

interface AudioFileDetail {
  id: string;
  name: string;
  voice: string;
  fileSize: number | null;
  duration: string | null;
  createdAt: string;
  updatedAt: string | null;
  fileUrl: string;
  fileKey: string;
  inputScript: string;
  promptInstructions: string | null;
  categoryId: string | null;
}

export default function AudioDetailPage() {

  const { data: session, status } = useSession();
  const params = useParams();

  const router = useRouter();
  const [audioFile, setAudioFile] = useState<AudioFileDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    }
  }, [session, status, router]);

  // Fetch audio file details
  useEffect(() => {
    if (!session) return;

    const fetchAudioFile = async () => {
      try {
        const response = await fetch(`/api/v1/audio/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Audio file not found");
            router.push("/audio");
            return;
          }
          throw new Error("Failed to fetch audio file");
        }
        const data = await response.json();
        setAudioFile(data.data);
      } catch (error) {
        toast.error("Failed to load audio file");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioFile();
  }, [session, params.id, router]);

  const handleDownload = () => {
    if (!audioFile) return;
    const a = document.createElement("a");
    a.href = audioFile.fileUrl;
    a.download = `${audioFile.name}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Download started");
  };

  const handleDelete = async () => {
    if (!audioFile || !confirm("Are you sure you want to delete this audio file?")) return;

    try {
      const response = await fetch(`/api/v1/audio/${audioFile.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Audio file deleted successfully");
      router.push("/audio");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to delete audio file");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!audioFile) {
    return null;
  }

  const formatDuration = (duration: string | null) => {
    if (!duration) return "-";
    const seconds = parseFloat(duration);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (size: number | null) => {
    if (!size) return "-";
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Button
        variant="ghost"
        onClick={() => router.push("/audio")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Audio Files
      </Button>

      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{audioFile.name}</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="capitalize">
                    {audioFile.voice}
                  </Badge>
                  <Badge variant="outline">
                    {formatDuration(audioFile.duration)}
                  </Badge>
                  <Badge variant="outline">
                    {formatFileSize(audioFile.fileSize)}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleDelete}
                  title="Delete audio"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Player Card */}
        <Card>
          <CardHeader>
            <CardTitle>Audio Player</CardTitle>
          </CardHeader>
          <CardContent>
            <AudioPlayer 
              src={audioFile.fileUrl}
              title={audioFile.name}
              onDownload={handleDownload}
            />
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Input Script</h4>
              <p className="text-sm whitespace-pre-wrap">{audioFile.inputScript}</p>
            </div>
            
            {audioFile.promptInstructions && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Voice Instructions</h4>
                  <p className="text-sm whitespace-pre-wrap">{audioFile.promptInstructions}</p>
                </div>
              </>
            )}
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <p>{formatDateTime(audioFile.createdAt)}</p>
              </div>
              {audioFile.updatedAt && (
                <div>
                  <span className="text-muted-foreground">Updated:</span>
                  <p>{formatDateTime(audioFile.updatedAt)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}