import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Electrify Your Imagination
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Welcome to InFEM - where innovation meets creativity
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-in">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="outline" size="lg">
                Sign Up
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Innovation</h3>
            <p className="text-muted-foreground">
              Cutting-edge solutions for modern challenges
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Creativity</h3>
            <p className="text-muted-foreground">
              Unleash your creative potential with our tools
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-3">Excellence</h3>
            <p className="text-muted-foreground">
              Delivering quality results every time
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
