import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";

export default function Home() {
const features = [
  {
    title: "Magnetics Design Analysis",
    description: [
      "Design inductors, transformers, common mode chokes, and custom magnetics",
      "Define circuits — cores, windings, excitation patterns",
      "Run Finite Element Analysis (FEA) (2D and 3D) for precise field solutions",
      "Optimize designs using advanced optimization algorithms"
    ]
  },
  {
    title: "PCB Simulation",
    description: [
      "Import PCB design from EDA tools KiCad and or ODB++",
      "Trace resistance, inductance, capacitance, and coupling",
      "DC, AC, and transient analysis",
      "EMI/EMC simulation, harmonic or transient analysis",
      "Thermal simulation with 3D FEA. Solve the full physics problem"
    ]
  },
  {
    title: "Predictive Thermal Engineering",
    description: [
      "Import CAD files and generate mesh automatically or refine mesh manually",
      "Steady-State and Transient analysis for power cycling evaluation",
      "Optimize cooling before first power-on",
      "Fans and heatsink optimization for efficient thermal management"
    ]
  },
  {
    title: "CFD Simulation",
    description: [
      "Optimize cooling for electronic components and PCBs",
      "Simulate forced and natural convection for heat dissipation",
      "Size cooling systems right the first time"
    ]
  },
  {
    title: "Web-Based Convenience",
    description: "No license servers, no IT setup — just upload and simulate. Built on open source, your designs stay secure."
  },
  {
    title: "Standing on the Shoulders of Giants",
    description: "Using decades of battle-tested open source engineering tools. We support these proven solutions and provide assistance for open source development through our platform—complete transparency, no vendor lock-in."
  },
];

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 pt-16 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-4xl font-bold mb-6">
            Welcome to InFEM
          </h1>
          <p className="text-xl font-bold mb-8">
            A Multi Physics Simulation Built By Engineers to Accelerate Design Process.
          </p>        
        </div>        
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(feature.description) ? (
                    <ul className="text-muted-foreground space-y-1">
                      {feature.description.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">{feature.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
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
      </main>
      <Footer />
    </div>
  );
}
