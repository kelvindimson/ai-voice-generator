// app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Mic, 
  Sparkles, 
  Zap, 
  Headphones,
  SlidersHorizontal,
  Download,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: <Mic className="h-5 w-5" />,
      title: "8 Natural Voices",
      description: "Choose from a variety of high-quality, natural-sounding AI voices"
    },
    {
      icon: <SlidersHorizontal className="h-5 w-5" />,
      title: "Custom Voice Controls",
      description: "Fine-tune tone, emotion, pacing, and delivery for perfect results"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Instant Generation",
      description: "Convert your text to speech in seconds with OpenAI technology"
    },
    {
      icon: <Download className="h-5 w-5" />,
      title: "Easy Download",
      description: "Save your audio files and access them anytime from your library"
    }
  ];

  const voiceStyles = [
    "Neutral & Balanced",
    "Warm & Friendly", 
    "Expressive & Emotional",
    "Clear & Articulate",
    "Smooth & Calming",
    "Wise & Authoritative",
    "Bright & Energetic",
    "Dynamic & Versatile"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
            <Sparkles className="mr-2 h-3 w-3" />
            Powered by OpenAI
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Transform Text into
            <span className="text-primary"> Natural Speech</span>
          </h1>
          
          <p className="text-xl text-muted-foreground">
            Create realistic AI voices with advanced customization. 
            Perfect for content creators, educators, and developers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="group" asChild>
              <Link href="/new-audio">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground">
              Professional text-to-speech with powerful features
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 border-muted hover:border-primary/50 transition-colors">
                <div className="rounded-lg bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Voice Styles Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Voice Styles Available</h2>
            <p className="text-muted-foreground">
              Each voice has its own unique character and tone
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {voiceStyles.map((style, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-2 rounded-lg border border-muted p-3 hover:border-primary/50 transition-colors"
              >
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">{style}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Three simple steps to create your audio
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </div>
              <h3 className="font-semibold mb-2">Enter Your Text</h3>
              <p className="text-sm text-muted-foreground">
                Type or paste your script up to 1000 characters
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </div>
              <h3 className="font-semibold mb-2">Customize Voice</h3>
              <p className="text-sm text-muted-foreground">
                Select a voice and adjust tone, emotion, and pacing
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                3
              </div>
              <h3 className="font-semibold mb-2">Generate & Save</h3>
              <p className="text-sm text-muted-foreground">
                Create your audio and save it to your library
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="mx-auto max-w-2xl p-8 text-center border-primary/20">
          <Headphones className="mx-auto h-12 w-12 text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-4">
            Ready to Create Amazing Audio?
          </h2>
          <p className="text-muted-foreground mb-6">
            Start generating professional AI voices in seconds. No credit card required.
          </p>
          <Button size="lg" asChild>
            <Link href="/new-audio">
              Start Generating
              <Sparkles className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="rounded-lg bg-primary p-1.5">
                <Mic className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold">AI Voice Generator</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/audio" className="hover:text-primary transition-colors">
                My Audio
              </Link>
              <Link href="/new-audio" className="hover:text-primary transition-colors">
                Generate
              </Link>
              <span>© 2025 AI Voice Generator</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}