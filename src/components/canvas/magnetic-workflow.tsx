'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  ChevronDown, 
  ChevronRight, 
  Zap, 
  Component, 
  Settings, 
  CheckCircle2,
  Eye
} from 'lucide-react'
import Image from 'next/image'

interface Selection {
  topology: string | null
  magneticType: string | null
  configuration: string | null
}

export default function Workflow() {
  const [selection, setSelection] = useState<Selection>({
    topology: null,
    magneticType: null,
    configuration: null
  })
  
  const [openPanels, setOpenPanels] = useState({
    topology: true,
    magneticType: false,
    configuration: false
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

  const configurations = [
    { name: 'Buck', category: 'Standard', complexity: 'Simple' },
    { name: 'Boost', category: 'Standard', complexity: 'Simple' },
    { name: 'Flyback', category: 'Isolated', complexity: 'Medium' },
    { name: 'SEPIC', category: 'Advanced', complexity: 'Medium' },
    { name: 'CUK', category: 'Advanced', complexity: 'Complex' },
    { name: 'Custom', category: 'User-defined', complexity: 'Variable' }
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
        magneticType: false, 
        configuration: true 
      }))
    }
    if (type === 'configuration') {
      setOpenPanels(prev => ({ 
        ...prev, 
        configuration: false 
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
    return selection.topology && selection.magneticType && selection.configuration
  }

  const getPanelStatus = (type: keyof Selection) => {
    if (selection[type]) return 'completed'
    if (openPanels[type]) return 'active'
    return 'inactive'
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold mb-2">Component Setup</h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{getCompletionCount()}/3 Complete</Badge>
            {isComplete() && <CheckCircle2 className="w-4 h-4 text-green-600" />}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Topology Panel */}
          <Collapsible 
            open={openPanels.topology} 
            onOpenChange={() => togglePanel('topology')}
          >
            <CollapsibleTrigger asChild>
              <div className={`w-full p-4 rounded-lg border-2 cursor-pointer transition-all ${
                getPanelStatus('topology') === 'completed' ? 'border-green-500 bg-green-50' :
                getPanelStatus('topology') === 'active' ? 'border-blue-500 bg-blue-50' :
                'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className={`w-5 h-5 ${
                      getPanelStatus('topology') === 'completed' ? 'text-green-600' :
                      getPanelStatus('topology') === 'active' ? 'text-blue-600' :
                      'text-gray-400'
                    }`} />
                    <div>
                      <h3 className="font-semibold">Power Topology</h3>
                      {selection.topology && (
                        <p className="text-sm text-gray-600">{selection.topology} selected</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selection.topology && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                    {openPanels.topology ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-2">
              <div className="space-y-2 pl-4">
                {topologies.map((topology) => (
                  <div
                    key={topology.name}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 ${
                      selection.topology === topology.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleSelection('topology', topology.name)}
                  >
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
                        <p className="text-xs text-gray-600">{topology.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Magnetic Type Panel */}
          <Collapsible 
            open={openPanels.magneticType} 
            onOpenChange={() => togglePanel('magneticType')}
          >
            <CollapsibleTrigger asChild>
              <div className={`w-full p-4 rounded-lg border-2 cursor-pointer transition-all ${
                getPanelStatus('magneticType') === 'completed' ? 'border-green-500 bg-green-50' :
                getPanelStatus('magneticType') === 'active' ? 'border-blue-500 bg-blue-50' :
                'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Component className={`w-5 h-5 ${
                      getPanelStatus('magneticType') === 'completed' ? 'text-green-600' :
                      getPanelStatus('magneticType') === 'active' ? 'text-blue-600' :
                      'text-gray-400'
                    }`} />
                    <div>
                      <h3 className="font-semibold">Magnetic Component</h3>
                      {selection.magneticType && (
                        <p className="text-sm text-gray-600">{selection.magneticType} selected</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selection.magneticType && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                    {openPanels.magneticType ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-2">
              <div className="space-y-2 pl-4">
                {magneticTypes.map((type) => (
                  <div
                    key={type.name}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 ${
                      selection.magneticType === type.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleSelection('magneticType', type.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600">{type.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{type.name}</h4>
                        <p className="text-xs text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Configuration Panel */}
          <Collapsible 
            open={openPanels.configuration} 
            onOpenChange={() => togglePanel('configuration')}
          >
            <CollapsibleTrigger asChild>
              <div className={`w-full p-4 rounded-lg border-2 cursor-pointer transition-all ${
                getPanelStatus('configuration') === 'completed' ? 'border-green-500 bg-green-50' :
                getPanelStatus('configuration') === 'active' ? 'border-blue-500 bg-blue-50' :
                'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className={`w-5 h-5 ${
                      getPanelStatus('configuration') === 'completed' ? 'text-green-600' :
                      getPanelStatus('configuration') === 'active' ? 'text-blue-600' :
                      'text-gray-400'
                    }`} />
                    <div>
                      <h3 className="font-semibold">Configuration</h3>
                      {selection.configuration && (
                        <p className="text-sm text-gray-600">{selection.configuration} selected</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selection.configuration && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                    {openPanels.configuration ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-2">
              <div className="space-y-2 pl-4">
                {configurations.map((config) => (
                  <div
                    key={config.name}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 ${
                      selection.configuration === config.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleSelection('configuration', config.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{config.name}</h4>
                        <p className="text-xs text-gray-600">{config.category}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {config.complexity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Action Footer */}
        {isComplete() && (
          <div className="p-4 border-t bg-gray-50">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Create Component
            </Button>
          </div>
        )}
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 p-6">
        <div className="h-full">
          {selection.topology ? (
            <Card className="h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Preview</h3>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm text-gray-600">Live Preview</span>
                  </div>
                </div>

                {/* Large Topology Display */}
                <div className="flex-1 flex items-center justify-center mb-6">
                  <div className="text-center">
                    <Image 
                      src={topologies.find(t => t.name === selection.topology)?.svg || '/buck.svg'} 
                      alt={selection.topology || 'Topology'}
                      width={300}
                      height={200}
                      className="mx-auto mb-4 max-h-64 object-contain"
                    />
                    <h4 className="text-xl font-semibold mb-2">{selection.topology} Topology</h4>
                    <p className="text-gray-600">
                      {topologies.find(t => t.name === selection.topology)?.description}
                    </p>
                  </div>
                </div>

                {/* Selection Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold mb-3">Current Selection</h5>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Topology</div>
                      <div className="font-medium">{selection.topology || 'Not selected'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Magnetic Type</div>
                      <div className="font-medium">{selection.magneticType || 'Not selected'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Configuration</div>
                      <div className="font-medium">{selection.configuration || 'Not selected'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="p-6 h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">Select a topology to begin</h3>
                  <p>Choose from the options in the sidebar to see a preview here</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}