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
        </div>        
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="text-lg text-muted-foreground space-y-6">
            <ul className="space-y-3 text-left max-w-4xl mx-auto">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><span className="font-bold text-foreground">Design and Simulate Magnetics in 1D, 2D, and 3D</span> — from core losses to complex field interactions</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><span className="font-bold text-foreground">PCB Trace Simulation</span> — analyze current flow, predict temperature rise, and optimize layouts</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><span className="font-bold text-foreground">Thermal Prediction</span> — forecast heating effects across your design before prototyping</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><span className="font-bold text-foreground">Extract Parasitics</span> — get accurate inductance, capacitance, and resistance values directly from your geometry</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><span className="font-bold text-foreground">Cloud-Based</span> — no heavy installs, just upload your design and start simulating</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><span className="font-bold text-foreground">For Engineers, by Engineers</span> — tools built to accelerate innovation and cut down trial-and-error</span>
              </li>
            </ul>
          </div>
        </div>        
        {/* Call to Action Section */}
        <div className="mt-20 max-w-4xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-in">
              <Button className="text-secondary">Get Started</Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="outline" className="text-foreground">
                Sign Up
              </Button>
            </Link>
            {/* <Link href="/pricing">
              <Button variant="outline" className="text-foreground">
                View Pricing
              </Button>
            </Link> */}
          </div>
        </div>

        {/* Features Grid Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
