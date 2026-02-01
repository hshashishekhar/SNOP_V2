import { useState, useMemo } from 'react';
import {
  GitCompare,
  Plus,
  Save,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Calculator,
  Download,
  History,
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Scenario, ScenarioChange } from '@/types';

interface ScenarioPlannerProps {
  scenarios: Scenario[];
  activeScenarioId: string | null;
  onScenarioSelect: (id: string) => void;
  onScenarioCreate: (name: string, description?: string, baseScenarioId?: string) => void;
  onScenarioUpdate: (id: string, updates: Partial<Scenario>) => void;
  onScenarioDelete: (id: string) => void;
  onScenarioPromote: (id: string) => void;
  kpiComparison: {
    baseline: Record<string, number>;
    current: Record<string, number>;
    delta: Record<string, number>;
  };
  changes: ScenarioChange[];
  className?: string;
}

export function ScenarioPlanner({
  scenarios,
  activeScenarioId,
  onScenarioSelect,
  onScenarioCreate,
  onScenarioUpdate,
  onScenarioDelete,
  onScenarioPromote,
  kpiComparison,
  changes,
  className,
}: ScenarioPlannerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDescription, setNewScenarioDescription] = useState('');
  const [selectedBaseScenario, setSelectedBaseScenario] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'comparison'>('list');

  const activeScenario = scenarios.find(s => s.id === activeScenarioId);
  const baselineScenario = scenarios.find(s => s.isPromoted) || scenarios[0];

  const handleCreateScenario = () => {
    if (newScenarioName.trim()) {
      onScenarioCreate(
        newScenarioName,
        newScenarioDescription,
        selectedBaseScenario || undefined
      );
      setNewScenarioName('');
      setNewScenarioDescription('');
      setSelectedBaseScenario('');
      setIsCreateDialogOpen(false);
    }
  };

  const formatKPIValue = (key: string, value: number) => {
    if (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('profit')) {
      return `₹${(value / 1000000).toFixed(1)}Cr`;
    }
    if (key.toLowerCase().includes('percent') || key.toLowerCase().includes('utilization') || key.toLowerCase().includes('otif')) {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Scenario Planning</h2>
          {activeScenario && (
            <Badge 
              variant={activeScenario.isPromoted ? "default" : "secondary"}
              className={cn(
                activeScenario.isPromoted && "bg-bf-green"
              )}
            >
              {activeScenario.isPromoted ? 'Live Plan' : 'Draft'}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setViewMode(viewMode === 'list' ? 'comparison' : 'list')}
          >
            <GitCompare className="w-4 h-4" />
            {viewMode === 'list' ? 'Compare' : 'List'}
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            New Scenario
          </Button>
        </div>
      </div>

      {/* KPI Comparison Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calculator className="w-4 h-4 text-bf-blue" />
            KPI Impact Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(kpiComparison.current).map(([key, value]) => {
              const baseline = kpiComparison.baseline[key] || 0;
              const delta = kpiComparison.delta[key] || 0;
              const isPositive = delta >= 0;
              
              return (
                <div key={key} className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-lg font-bold">{formatKPIValue(key, value)}</p>
                  <div className={cn(
                    "flex items-center justify-center gap-1 text-xs mt-1",
                    isPositive ? "text-bf-green" : "text-bf-red"
                  )}>
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{delta > 0 ? '+' : ''}{delta.toFixed(1)}%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    vs {formatKPIValue(key, baseline)}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Scenario List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Scenarios</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-1 p-4">
                  {scenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                        activeScenarioId === scenario.id
                          ? "bg-bf-blue/10 border border-bf-blue/20"
                          : "hover:bg-muted border border-transparent"
                      )}
                      onClick={() => onScenarioSelect(scenario.id)}
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        scenario.isPromoted ? "bg-bf-green" : "bg-bf-amber"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{scenario.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(scenario.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onScenarioSelect(scenario.id)}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Select
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onScenarioCreate(
                            `${scenario.name} (Copy)`,
                            scenario.description,
                            scenario.id
                          )}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          {!scenario.isPromoted && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => onScenarioPromote(scenario.id)}
                                className="text-bf-green"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Promote to Live
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onScenarioDelete(scenario.id)}
                                className="text-bf-red"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Changes Panel */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <History className="w-4 h-4" />
                Scenario Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {changes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No changes in this scenario</p>
                  <p className="text-sm">Make modifications to see them tracked here</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {changes.map((change, idx) => (
                      <ChangeItem key={idx} change={change} />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <ScenarioComparisonView 
          scenarios={scenarios}
          baselineScenario={baselineScenario}
        />
      )}

      {/* Create Scenario Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Scenario</DialogTitle>
            <DialogDescription>
              Create a new planning scenario based on an existing one or from scratch.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Scenario Name</label>
              <Input
                placeholder="e.g., Q1 Optimized Plan"
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                placeholder="Brief description of this scenario..."
                value={newScenarioDescription}
                onChange={(e) => setNewScenarioDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Base Scenario</label>
              <select
                className="w-full p-2 border rounded-md text-sm"
                value={selectedBaseScenario}
                onChange={(e) => setSelectedBaseScenario(e.target.value)}
              >
                <option value="">Start from scratch</option>
                {scenarios.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateScenario} disabled={!newScenarioName.trim()}>
              Create Scenario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Change Item Component
function ChangeItem({ change }: { change: ScenarioChange }) {
  const getChangeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      demand_qty: 'Demand Quantity',
      demand_date: 'Delivery Date',
      line_downtime: 'Line Downtime',
      die_downtime: 'Die Downtime',
      priority: 'Priority',
      route: 'Route',
      capacity: 'Capacity',
    };
    return labels[type] || type;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg text-sm">
      <Badge variant="outline" className="text-xs shrink-0">
        {getChangeTypeLabel(change.changeType)}
      </Badge>
      <div className="flex-1 min-w-0">
        <span className="text-muted-foreground">{change.entityType}:</span>{' '}
        <span className="font-medium">{change.entityId}</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-bf-red line-through max-w-[100px] truncate">
          {change.oldValue}
        </span>
        <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
        <span className="text-bf-green font-medium max-w-[100px] truncate">
          {change.newValue}
        </span>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {new Date(change.createdAt).toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </span>
    </div>
  );
}

// Scenario Comparison View
function ScenarioComparisonView({ 
  scenarios,
  baselineScenario 
}: { 
  scenarios: Scenario[];
  baselineScenario?: Scenario;
}) {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(
    baselineScenario ? [baselineScenario.id] : []
  );

  const comparisonScenarios = scenarios.filter(s => selectedScenarios.includes(s.id));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Side-by-Side Comparison</CardTitle>
          <div className="flex items-center gap-2">
            {scenarios.map(s => (
              <label key={s.id} className="flex items-center gap-1 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedScenarios.includes(s.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedScenarios([...selectedScenarios, s.id]);
                    } else {
                      setSelectedScenarios(selectedScenarios.filter(id => id !== s.id));
                    }
                  }}
                  className="rounded"
                />
                <span className="truncate max-w-[100px]">{s.name}</span>
              </label>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 text-sm font-medium">KPI</th>
                {comparisonScenarios.map(s => (
                  <th key={s.id} className="text-center py-2 px-4 text-sm font-medium">
                    <div className="flex items-center justify-center gap-2">
                      {s.name}
                      {s.isPromoted && (
                        <Badge className="bg-bf-green text-[10px]">Live</Badge>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['Revenue', 'Profit', 'Utilization', 'OTIF', 'Bottlenecks'].map(kpi => (
                <tr key={kpi} className="border-b hover:bg-muted/30">
                  <td className="py-3 px-4 font-medium">{kpi}</td>
                  {comparisonScenarios.map(s => (
                    <td key={s.id} className="py-3 px-4 text-center">
                      {kpi === 'Revenue' && s.projectedRevenue && (
                        <span>₹{(s.projectedRevenue / 1000000).toFixed(1)}Cr</span>
                      )}
                      {kpi === 'Profit' && s.projectedProfit && (
                        <span>₹{(s.projectedProfit / 1000000).toFixed(1)}Cr</span>
                      )}
                      {kpi === 'Utilization' && s.projectedUtilization && (
                        <span>{s.projectedUtilization.toFixed(1)}%</span>
                      )}
                      {kpi === 'OTIF' && s.projectedOTIF && (
                        <span>{s.projectedOTIF.toFixed(1)}%</span>
                      )}
                      {kpi === 'Bottlenecks' && (
                        <span className="text-bf-red">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
