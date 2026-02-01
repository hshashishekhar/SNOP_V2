import { useState } from 'react';
import { GanttChart } from '@/components/custom/GanttChart';
import { ScenarioPlanner } from '@/components/custom/ScenarioPlanner';
import { HierarchySelector } from '@/components/custom/HierarchyNavigator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  TrendingUp,
  Factory,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Save,
  GitCompare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GanttTask, GanttResource, Scenario, ScenarioChange, Location, Division, Line } from '@/types';

// Mock data
const mockLocations: Location[] = [
  { id: 'loc-1', code: 'PUN', name: 'Pune Plant', isActive: true, createdAt: '', updatedAt: '' },
  { id: 'loc-2', code: 'CHE', name: 'Chennai Plant', isActive: true, createdAt: '', updatedAt: '' },
];

const mockDivisions: Division[] = [
  { id: 'div-1', locationId: 'loc-1', code: 'AUTO', name: 'Automotive', isActive: true, createdAt: '', updatedAt: '' },
  { id: 'div-2', locationId: 'loc-1', code: 'IND', name: 'Industrial', isActive: true, createdAt: '', updatedAt: '' },
];

const mockLines: Line[] = [
  { 
    id: 'line-1', 
    divisionId: 'div-1', 
    code: 'L01', 
    name: 'Line 1 - 6000T',
    pressTonnage: 6000,
    isContinuous: true,
    grossHoursPerWeek: 168,
    absenteeismFactor: 0.05,
    unplannedDowntimeBuffer: 0.10,
    isActive: true,
    createdAt: '',
    updatedAt: ''
  },
  { 
    id: 'line-2', 
    divisionId: 'div-1', 
    code: 'L02', 
    name: 'Line 2 - 8000T',
    pressTonnage: 8000,
    isContinuous: true,
    grossHoursPerWeek: 168,
    absenteeismFactor: 0.05,
    unplannedDowntimeBuffer: 0.10,
    isActive: true,
    createdAt: '',
    updatedAt: ''
  },
  { 
    id: 'line-3', 
    divisionId: 'div-2', 
    code: 'L03', 
    name: 'Line 3 - 10000T',
    pressTonnage: 10000,
    isContinuous: true,
    grossHoursPerWeek: 168,
    absenteeismFactor: 0.05,
    unplannedDowntimeBuffer: 0.10,
    isActive: true,
    createdAt: '',
    updatedAt: ''
  },
];

const mockGanttTasks: GanttTask[] = [
  {
    id: 'task-1',
    name: 'Crankshaft A - Batch 1',
    resourceId: 'line-1',
    resourceName: 'Line 1 - 6000T',
    startDate: new Date(Date.now()),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    progress: 25,
    type: 'production',
    status: 'in_progress',
    color: 'bg-bf-blue',
  },
  {
    id: 'task-2',
    name: 'Changeover',
    resourceId: 'line-1',
    resourceName: 'Line 1 - 6000T',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 3.5 * 24 * 60 * 60 * 1000),
    progress: 0,
    type: 'changeover',
    status: 'planned',
    color: 'bg-bf-amber',
  },
  {
    id: 'task-3',
    name: 'Crankshaft B - Batch 1',
    resourceId: 'line-1',
    resourceName: 'Line 1 - 6000T',
    startDate: new Date(Date.now() + 3.5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    progress: 0,
    type: 'production',
    status: 'planned',
    color: 'bg-bf-blue',
  },
  {
    id: 'task-4',
    name: 'Connecting Rod X',
    resourceId: 'line-2',
    resourceName: 'Line 2 - 8000T',
    startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    progress: 40,
    type: 'production',
    status: 'in_progress',
    color: 'bg-bf-blue',
  },
  {
    id: 'task-5',
    name: 'Maintenance',
    resourceId: 'line-2',
    resourceName: 'Line 2 - 8000T',
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    progress: 0,
    type: 'maintenance',
    status: 'planned',
    color: 'bg-bf-steel',
  },
  {
    id: 'task-6',
    name: 'Custom Flange - Special',
    resourceId: 'line-3',
    resourceName: 'Line 3 - 10000T',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    progress: 0,
    type: 'production',
    status: 'planned',
    color: 'bg-bf-blue',
  },
];

const mockGanttResources: GanttResource[] = mockLines.map(line => ({
  id: line.id,
  name: line.name,
  type: 'line',
  group: mockDivisions.find(d => d.id === line.divisionId)?.name,
}));

const mockScenarios: Scenario[] = [
  {
    id: 'scenario-1',
    name: 'Baseline Plan',
    description: 'Current production plan',
    createdBy: 'Admin',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isLocked: true,
    isPromoted: true,
    promotedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    projectedRevenue: 1250000000,
    projectedProfit: 350000000,
    projectedUtilization: 82.5,
    projectedOTIF: 96.5,
  },
  {
    id: 'scenario-2',
    name: 'Optimized Plan A',
    description: 'With Line 3 overtime',
    baseScenarioId: 'scenario-1',
    createdBy: 'PPC Manager',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isLocked: false,
    isPromoted: false,
    projectedRevenue: 1280000000,
    projectedProfit: 365000000,
    projectedUtilization: 85.2,
    projectedOTIF: 97.8,
  },
  {
    id: 'scenario-3',
    name: 'What-If: Die Refurb Early',
    description: 'Early refurbishment of critical dies',
    baseScenarioId: 'scenario-1',
    createdBy: 'Die Manager',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isLocked: false,
    isPromoted: false,
    projectedRevenue: 1220000000,
    projectedProfit: 340000000,
    projectedUtilization: 78.5,
    projectedOTIF: 94.2,
  },
];

const mockChanges: ScenarioChange[] = [
  {
    id: 'change-1',
    scenarioId: 'scenario-2',
    changeType: 'capacity',
    entityType: 'line',
    entityId: 'line-3',
    oldValue: '168 hrs/week',
    newValue: '180 hrs/week',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'change-2',
    scenarioId: 'scenario-2',
    changeType: 'priority',
    entityType: 'demand',
    entityId: 'demand-123',
    oldValue: 'Priority 3',
    newValue: 'Priority 1',
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'change-3',
    scenarioId: 'scenario-3',
    changeType: 'die_downtime',
    entityType: 'die',
    entityId: 'die-001',
    oldValue: '2024-02-15',
    newValue: '2024-02-08',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

export function Capacity() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scenario-1');
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>();
  const [selectedDivision, setSelectedDivision] = useState<string | undefined>();
  const [selectedLine, setSelectedLine] = useState<string | undefined>();

  const activeScenario = mockScenarios.find(s => s.id === activeScenarioId);

  const kpiComparison = {
    baseline: {
      Revenue: 1250000000,
      Profit: 350000000,
      Utilization: 82.5,
      OTIF: 96.5,
      Bottlenecks: 4,
    },
    current: {
      Revenue: activeScenario?.projectedRevenue || 1250000000,
      Profit: activeScenario?.projectedProfit || 350000000,
      Utilization: activeScenario?.projectedUtilization || 82.5,
      OTIF: activeScenario?.projectedOTIF || 96.5,
      Bottlenecks: 3,
    },
    delta: {
      Revenue: ((activeScenario?.projectedRevenue || 1250000000) - 1250000000) / 1250000000 * 100,
      Profit: ((activeScenario?.projectedProfit || 350000000) - 350000000) / 350000000 * 100,
      Utilization: ((activeScenario?.projectedUtilization || 82.5) - 82.5),
      OTIF: ((activeScenario?.projectedOTIF || 96.5) - 96.5),
      Bottlenecks: -1,
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Capacity Planning</h1>
          <p className="text-muted-foreground text-sm">
            Schedule production and manage capacity across lines
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <HierarchySelector
            locations={mockLocations}
            divisions={mockDivisions}
            lines={mockLines}
            selectedLocationId={selectedLocation}
            selectedDivisionId={selectedDivision}
            selectedLineId={selectedLine}
            onLocationChange={setSelectedLocation}
            onDivisionChange={setSelectedDivision}
            onLineChange={setSelectedLine}
          />
        </div>
      </div>

      {/* Active Scenario Banner */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          <GitCompare className="w-5 h-5 text-bf-blue" />
          <div>
            <span className="text-sm text-muted-foreground">Active Scenario:</span>
            <span className="ml-2 font-semibold">{activeScenario?.name}</span>
            {activeScenario?.isPromoted && (
              <Badge className="ml-2 bg-bf-green">Live Plan</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Scenario
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="schedule" className="gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="gap-2">
            <GitCompare className="w-4 h-4" />
            <span className="hidden sm:inline">Scenarios</span>
          </TabsTrigger>
          <TabsTrigger value="utilization" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Utilization</span>
          </TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <GanttChart
            tasks={mockGanttTasks}
            resources={mockGanttResources}
            onTaskClick={(task) => console.log('Task clicked:', task)}
            className="h-[600px]"
          />
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <ScenarioPlanner
            scenarios={mockScenarios}
            activeScenarioId={activeScenarioId}
            onScenarioSelect={setActiveScenarioId}
            onScenarioCreate={(name, desc, baseId) => console.log('Create:', name, desc, baseId)}
            onScenarioUpdate={(id, updates) => console.log('Update:', id, updates)}
            onScenarioDelete={(id) => console.log('Delete:', id)}
            onScenarioPromote={(id) => console.log('Promote:', id)}
            kpiComparison={kpiComparison}
            changes={mockChanges.filter(c => c.scenarioId === activeScenarioId)}
          />
        </TabsContent>

        {/* Utilization Tab */}
        <TabsContent value="utilization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockLines.map(line => {
              const utilization = 75 + Math.random() * 20;
              return (
                <Card key={line.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">{line.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {mockDivisions.find(d => d.id === line.divisionId)?.name}
                        </p>
                      </div>
                      <Factory className="w-5 h-5 text-bf-orange" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Utilization</span>
                        <span className={cn(
                          "font-medium",
                          utilization > 85 ? 'text-bf-green' : utilization > 70 ? 'text-bf-amber' : 'text-bf-red'
                        )}>
                          {utilization.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            utilization > 85 ? 'bg-bf-green' : utilization > 70 ? 'bg-bf-amber' : 'bg-bf-red'
                          )}
                          style={{ width: `${utilization}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                        <span>Capacity: {line.grossHoursPerWeek} hrs/week</span>
                        <span>{line.pressTonnage}T</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Weekly Capacity Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-bf-blue" />
                Weekly Capacity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLines.map(line => (
                  <div key={line.id} className="flex items-center gap-4">
                    <div className="w-32 shrink-0">
                      <p className="font-medium text-sm">{line.code}</p>
                      <p className="text-xs text-muted-foreground">{line.name}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex gap-1">
                        {Array.from({ length: 7 }).map((_, dayIdx) => {
                          const isWeekend = dayIdx >= 5;
                          const hasTask = Math.random() > 0.3;
                          return (
                            <div
                              key={dayIdx}
                              className={cn(
                                "h-8 flex-1 rounded-sm",
                                isWeekend ? "bg-muted/50" : "",
                                hasTask && !isWeekend ? "bg-bf-blue/80" : "",
                                hasTask && isWeekend ? "bg-bf-blue/40" : ""
                              )}
                              title={`Day ${dayIdx + 1}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div className="w-24 text-right">
                      <p className="text-sm font-medium">{Math.floor(Math.random() * 40 + 120)} hrs</p>
                      <p className="text-xs text-muted-foreground">Scheduled</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
