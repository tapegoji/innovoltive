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
        
        {/* About Us Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">About Us</h2>
          <div className="text-lg text-muted-foreground space-y-6">
            <p>
              Welcome to InnoVoltive, where innovation knows no limits. We are a group of seasoned power electronics experts, each with a wealth of knowledge and extensive hands-on experience in the field. Our collective expertise is rooted in years of dedicated research and development at the forefront of power electronics innovation.
            </p>
            
            <p>
              At InnoVoltive, our mission is to bridge the gap between cutting-edge research and practical industry applications in the power electronics field. We specialize in designing efficient, high-frequency, and high-power density power converters, including DC-DC and DC-AC converters. Our goal is to create a transformative impact by bringing unparalleled performance and high efficiencies to existing markets while pioneering innovative technologies that bridge the research-to-industry divide.
            </p>
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
