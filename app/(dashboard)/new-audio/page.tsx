import { auth } from "@/auth";
import { redirect } from "next/navigation";
// import AudioGenerator from "@/components/AudioGenerator";
import AudioGenerator from "@/components/AudioGeneratorTwo";

export default async function NewAudioPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  return <AudioGenerator />;
}