'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {SidebarProvider } from '@/components/ui/sidebar'
import { 
  ChevronDown, 
  ChevronRight, 
  Zap, 
  Component, 
  Settings, 
  CheckCircle2,
  Eye,
  Layers
} from 'lucide-react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import Image from 'next/image'

interface Selection {
  topology: string | null
  magneticType: string | null
}

export default function Workflow() {
  const [selection, setSelection] = useState<Selection>({
    topology: null,
    magneticType: null
  })
  
  const [openPanels, setOpenPanels] = useState({
    topology: true,
    magneticType: false
  })

  const topologies = [
    { 
      name: 'Buck', 
      svg: '/buck.svg', 
      description: 'Step-down converter',
      specs: '• Vin > Vout\n• Continuous current\n• High efficiency'
    },
    { 
      name: 'Boost', 
      svg: '/boost.svg', 
      description: 'Step-up converter',
      specs: '• Vout > Vin\n• Pulsating input\n• Energy storage'
    },
    { 
      name: 'Flyback', 
      svg: '/flyback.svg', 
      description: 'Isolated converter',
      specs: '• Galvanic isolation\n• Multiple outputs\n• Energy storage'
    }
  ]

  const magneticTypes = [
    { 
      name: 'Inductor', 
      icon: <Component className="w-6 h-6" />,
      description: 'Single winding component',
      characteristics: 'Energy storage, current smoothing, filtering'
    },
    { 
      name: 'Transformer', 
      icon: <Zap className="w-6 h-6" />,
      description: 'Multi-winding component',
      characteristics: 'Isolation, voltage scaling, impedance matching'
    },
    { 
      name: 'Custom', 
      icon: <Settings className="w-6 h-6" />,
      description: 'User-defined component',
      characteristics: 'Specialized design, custom parameters, research'
    }
  ]

  const handleSelection = (type: keyof Selection, value: string) => {
    setSelection(prev => ({ ...prev, [type]: value }))
    
    // Auto-collapse current panel and open next panel
    if (type === 'topology') {
      setOpenPanels(prev => ({ 
        ...prev, 
        topology: false, 
        magneticType: true 
      }))
    }
    if (type === 'magneticType') {
      setOpenPanels(prev => ({ 
        ...prev, 
        magneticType: false 
      }))
    }
  }

  const togglePanel = (panel: keyof typeof openPanels) => {
    setOpenPanels(prev => ({ ...prev, [panel]: !prev[panel] }))
  }

  const getCompletionCount = () => {
    return Object.values(selection).filter(Boolean).length
  }

  const isComplete = () => {
    return selection.topology && selection.magneticType
  }

  const getPanelStatus = (type: keyof Selection) => {
    if (selection[type]) return 'completed'
    if (openPanels[type]) return 'active'
    return 'inactive'
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div className="w-96 bg-card border-r border-border overflow-y-auto">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Component Setup</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{getCompletionCount()}/2 Complete</Badge>
              {isComplete() && <CheckCircle2 className="w-4 h-4 text-chart-1" />}
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Topology Panel */}
            <Card className={`${
              getPanelStatus('topology') === 'completed' ? 'border-chart-1 bg-chart-1/10' :
              getPanelStatus('topology') === 'active' ? 'border-primary bg-primary/5' :
              'border-border'
            }`}>
              <Collapsible 
                open={openPanels.topology} 
                onOpenChange={() => togglePanel('topology')}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Zap className={`w-5 h-5 ${
                          getPanelStatus('topology') === 'completed' ? 'text-chart-1' :
                          getPanelStatus('topology') === 'active' ? 'text-primary' :
                          'text-muted-foreground'
                        }`} />
                        <div>
                          <CardTitle className="text-base">Power Topology</CardTitle>
                          {selection.topology && (
                            <CardDescription className="text-sm">
                              {selection.topology} selected
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selection.topology && <CheckCircle2 className="w-4 h-4 text-chart-1" />}
                        {openPanels.topology ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {topologies.map((topology) => (
                        <Card
                          key={topology.name}
                          className={`cursor-pointer transition-all hover:bg-muted/50 ${
                            selection.topology === topology.name ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                          onClick={() => handleSelection('topology', topology.name)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <Image 
                                src={topology.svg} 
                                alt={topology.name}
                                width={40}
                                height={30}
                                className="object-contain"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium">{topology.name}</h4>
                                <p className="text-xs text-muted-foreground">{topology.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Magnetic Type Panel */}
            <Card className={`${
              getPanelStatus('magneticType') === 'completed' ? 'border-chart-1 bg-chart-1/10' :
              getPanelStatus('magneticType') === 'active' ? 'border-primary bg-primary/5' :
              'border-border'
            }`}>
              <Collapsible 
                open={openPanels.magneticType} 
                onOpenChange={() => togglePanel('magneticType')}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Component className={`w-5 h-5 ${
                          getPanelStatus('magneticType') === 'completed' ? 'text-chart-1' :
                          getPanelStatus('magneticType') === 'active' ? 'text-primary' :
                          'text-muted-foreground'
                        }`} />
                        <div>
                          <CardTitle className="text-base">Magnetic Component</CardTitle>
                          {selection.magneticType && (
                            <CardDescription className="text-sm">
                              {selection.magneticType} selected
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selection.magneticType && <CheckCircle2 className="w-4 h-4 text-chart-1" />}
                        {openPanels.magneticType ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {magneticTypes.map((type) => (
                        <Card
                          key={type.name}
                          className={`cursor-pointer transition-all hover:bg-muted/50 ${
                            selection.magneticType === type.name ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                          onClick={() => handleSelection('magneticType', type.name)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="text-primary">{type.icon}</div>
                              <div className="flex-1">
                                <h4 className="font-medium">{type.name}</h4>
                                <p className="text-xs text-muted-foreground">{type.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>

          {/* Action Footer */}
          {isComplete() && (
            <div className="p-4 border-t border-border bg-muted/20">
              <Button className="w-full" size="lg">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Create Component
              </Button>
            </div>
          )}
        </div>

        {/* Main Preview Area */}
        <div className="flex-1 bg-background">
          <div className="h-full">
            {selection.topology ? (
              <Card className="h-full rounded-none border-0 border-l">
                <CardContent className="flex-1 flex flex-col items-center justify-center px-6 pb-6 space-y-6">
                  {/* Breadcrumb Navigation */}
                  <div className="bg-muted/20 rounded-lg p-4 w-full max-w-2xl">
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbLink 
                            className={`flex items-center gap-2 ${selection.topology ? 'text-primary' : 'text-muted-foreground'}`}
                          >
                            <Zap className="w-4 h-4" />
                            {selection.topology || 'Topology'}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        {selection.topology && (
                          <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbLink 
                                className={`flex items-center gap-2 ${selection.magneticType ? 'text-primary' : 'text-muted-foreground'}`}
                              >
                                <Component className="w-4 h-4" />
                                {selection.magneticType || 'Magnetic Type'}
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                          </>
                        )}
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>

                  {/* Large Topology Display */}
                  <Card className="p-8 bg-muted/20 w-full max-w-2xl">
                    <div className="text-center">
                      <Image 
                        src={topologies.find(t => t.name === selection.topology)?.svg || '/buck.svg'} 
                        alt={selection.topology || 'Topology'}
                        width={300}
                        height={200}
                        className="mx-auto mb-4 max-h-64 object-contain"
                      />
                      <h4 className="text-xl font-semibold mb-2">{selection.topology} Topology</h4>
                      <p className="text-muted-foreground">
                        {topologies.find(t => t.name === selection.topology)?.description}
                      </p>
                    </div>
                  </Card>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full rounded-none border-0 border-l">
                <CardContent className="h-full flex items-center justify-center px-6">
                  <div className="text-center text-muted-foreground">
                    <Zap className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <CardTitle className="text-xl mb-2">Select a topology to begin</CardTitle>
                    <CardDescription>
                      Choose from the options in the sidebar to see a preview here
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}