import { useState, useMemo } from 'react';
import {
  Grid3X3,
  Play,
  Repeat,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  ChevronRight,
  Filter,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Die, DieCategory } from '@/types';

// Die Classification Matrix Data
interface ClassificationCell {
  category: DieCategory;
  title: string;
  description: string;
  strategy: string;
  policy: string;
  color: string;
  icon: React.ElementType;
  count: number;
  dies: Die[];
}

interface DieClassificationMatrixProps {
  dies: Die[];
  onDieClick?: (die: Die) => void;
  className?: string;
}

export function DieClassificationMatrix({
  dies,
  onDieClick,
  className,
}: DieClassificationMatrixProps) {
  const [selectedCategory, setSelectedCategory] = useState<DieCategory | null>(null);

  // Calculate classification data
  const matrix = useMemo(() => {
    const runnerDies = dies.filter(d => d.category === 'runner');
    const repeaterDies = dies.filter(d => d.category === 'repeater');
    const strangerDies = dies.filter(d => d.category === 'stranger');

    const cells: ClassificationCell[] = [
      {
        category: 'runner',
        title: 'Runner Dies',
        description: 'High-volume, continuous production dies (>80% utilization)',
        strategy: 'Maximize utilization, minimize changeovers, continuous improvement',
        policy: 'Priority scheduling, dedicated lines, predictive maintenance',
        color: 'bg-bf-green',
        icon: Play,
        count: runnerDies.length,
        dies: runnerDies,
      },
      {
        category: 'repeater',
        title: 'Repeater Dies',
        description: 'Moderate volume dies with regular demand (40-80% utilization)',
        strategy: 'Balance efficiency with flexibility, scheduled production',
        policy: 'Standard scheduling, planned changeovers, regular maintenance',
        color: 'bg-bf-amber',
        icon: Repeat,
        count: repeaterDies.length,
        dies: repeaterDies,
      },
      {
        category: 'stranger',
        title: 'Stranger Dies',
        description: 'Low-volume, intermittent dies (<40% utilization)',
        strategy: 'Minimize setup costs, batch production, window scheduling',
        policy: 'Restricted windows, minimum batch sizes, setup optimization',
        color: 'bg-bf-red',
        icon: AlertTriangle,
        count: strangerDies.length,
        dies: strangerDies,
      },
    ];

    return cells;
  }, [dies]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalDies = dies.length;
    const totalLife = dies.reduce((sum, d) => sum + d.totalLife, 0);
    const avgRemainingLife = dies.reduce((sum, d) => sum + (d.remainingLife / d.totalLife), 0) / totalDies * 100;
    const criticalDies = dies.filter(d => (d.remainingLife / d.totalLife) < 0.1).length;

    return { totalDies, totalLife, avgRemainingLife, criticalDies };
  }, [dies]);

  return (
    <TooltipProvider>
      <Card className={cn("h-full", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-bf-blue" />
              Die Classification Matrix
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatBox label="Total Dies" value={totals.totalDies} />
            <StatBox label="Runner Dies" value={matrix[0].count} color="text-bf-green" />
            <StatBox label="Repeater Dies" value={matrix[1].count} color="text-bf-amber" />
            <StatBox label="Stranger Dies" value={matrix[2].count} color="text-bf-red" />
          </div>

          {/* Matrix Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {matrix.map((cell) => (
              <Tooltip key={cell.category}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "relative p-4 rounded-lg border-2 cursor-pointer transition-all",
                      selectedCategory === cell.category
                        ? "border-bf-blue ring-2 ring-bf-blue/20"
                        : "border-transparent hover:border-muted",
                      "bg-muted/30"
                    )}
                    onClick={() => setSelectedCategory(
                      selectedCategory === cell.category ? null : cell.category
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn("p-2 rounded-lg", cell.color.replace('bg-', 'bg-opacity-20 bg-'))}>
                        <cell.icon className={cn("w-5 h-5", cell.color.replace('bg-', 'text-'))} />
                      </div>
                      <Badge variant="secondary" className="text-lg font-bold">
                        {cell.count}
                      </Badge>
                    </div>

                    {/* Content */}
                    <h3 className="font-semibold text-sm mb-1">{cell.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{cell.description}</p>

                    {/* Strategy & Policy */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-medium text-muted-foreground">Strategy: </span>
                        <span>{cell.strategy}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Policy: </span>
                        <span>{cell.policy}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {((cell.count / totals.totalDies) * 100).toFixed(1)}% of fleet
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-semibold">{cell.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{cell.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Selected Category Details */}
          {selectedCategory && (
            <div className="border rounded-lg p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  {matrix.find(m => m.category === selectedCategory)?.title} Details
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedCategory(null)}
                >
                  Close
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {matrix
                  .find(m => m.category === selectedCategory)
                  ?.dies.slice(0, 6)
                  .map((die) => (
                    <DieMiniCard 
                      key={die.id} 
                      die={die} 
                      onClick={() => onDieClick?.(die)}
                    />
                  ))}
              </div>
              
              {matrix.find(m => m.category === selectedCategory)!.dies.length > 6 && (
                <Button variant="link" size="sm" className="mt-3 w-full">
                  View all {matrix.find(m => m.category === selectedCategory)?.dies.length} dies
                </Button>
              )}
            </div>
          )}

          {/* Critical Alerts */}
          {totals.criticalDies > 0 && (
            <div className="bg-bf-red/10 border border-bf-red/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-bf-red" />
                <h3 className="font-semibold text-bf-red">Critical Die Alerts</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {totals.criticalDies} dies have less than 10% remaining life and require immediate attention.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

// Die Mini Card Component
function DieMiniCard({ die, onClick }: { die: Die; onClick?: () => void }) {
  const lifePercent = (die.remainingLife / die.totalLife) * 100;
  
  const getLifeColor = () => {
    if (lifePercent > 50) return 'bg-bf-green';
    if (lifePercent > 20) return 'bg-bf-amber';
    return 'bg-bf-red';
  };

  const getCategoryIcon = () => {
    switch (die.category) {
      case 'runner': return <Play className="w-3 h-3" />;
      case 'repeater': return <Repeat className="w-3 h-3" />;
      case 'stranger': return <AlertTriangle className="w-3 h-3" />;
    }
  };

  const getCategoryColor = () => {
    switch (die.category) {
      case 'runner': return 'text-bf-green bg-bf-green/10';
      case 'repeater': return 'text-bf-amber bg-bf-amber/10';
      case 'stranger': return 'text-bf-red bg-bf-red/10';
    }
  };

  return (
    <div
      className="p-3 border rounded-lg hover:border-bf-blue cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{die.code}</span>
        <Badge variant="outline" className={cn("text-xs", getCategoryColor())}>
          {getCategoryIcon()}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground truncate mb-2">{die.name}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Life</span>
          <span className={cn(
            "font-medium",
            lifePercent > 50 ? 'text-bf-green' : lifePercent > 20 ? 'text-bf-amber' : 'text-bf-red'
          )}>
            {lifePercent.toFixed(0)}%
          </span>
        </div>
        <Progress value={lifePercent} className="h-1">
          <div className={cn("h-full rounded-full", getLifeColor())} style={{ width: `${lifePercent}%` }} />
        </Progress>
      </div>
    </div>
  );
}

// Stat Box Component
function StatBox({ 
  label, 
  value, 
  color = 'text-foreground' 
}: { 
  label: string; 
  value: number; 
  color?: string;
}) {
  return (
    <div className="text-center p-3 bg-muted/30 rounded-lg">
      <p className={cn("text-2xl font-bold", color)}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// Die Availability Calendar Component
interface DieAvailabilityCalendarProps {
  dies: Die[];
  unavailabilityData: Array<{
    dieId: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    type: 'refurbishment' | 'repair' | 'inspection' | 'trial';
  }>;
  startDate: Date;
  endDate: Date;
  className?: string;
}

export function DieAvailabilityCalendar({
  dies,
  unavailabilityData,
  startDate,
  endDate,
  className,
}: DieAvailabilityCalendarProps) {
  const days = useMemo(() => {
    const daysArray: Date[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      daysArray.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return daysArray;
  }, [startDate, endDate]);

  const getDayStatus = (dieId: string, date: Date) => {
    const unavail = unavailabilityData.find(u => 
      u.dieId === dieId && 
      date >= u.startDate && 
      date <= u.endDate
    );
    
    if (unavail) {
      const colors = {
        refurbishment: 'bg-bf-orange',
        repair: 'bg-bf-red',
        inspection: 'bg-bf-blue',
        trial: 'bg-bf-steel',
      };
      return { status: 'unavailable', color: colors[unavail.type], reason: unavail.reason };
    }
    
    return { status: 'available', color: 'bg-bf-green', reason: 'Available' };
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-bf-blue" />
          Die Availability Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="sticky left-0 bg-background z-10 px-4 py-2 text-left text-sm font-medium text-muted-foreground min-w-[200px]">
                  Die
                </th>
                {days.map((day, idx) => (
                  <th 
                    key={idx} 
                    className={cn(
                      "px-1 py-2 text-center text-xs font-medium min-w-[32px]",
                      day.getDay() === 0 || day.getDay() === 6 ? "bg-muted/50" : ""
                    )}
                  >
                    <div>{day.getDate()}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {day.toLocaleDateString('en-IN', { weekday: 'narrow' })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dies.slice(0, 10).map((die) => (
                <tr key={die.id} className="border-b hover:bg-muted/30">
                  <td className="sticky left-0 bg-background z-10 px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        die.category === 'runner' ? 'bg-bf-green' :
                        die.category === 'repeater' ? 'bg-bf-amber' : 'bg-bf-red'
                      )} />
                      <div>
                        <p className="text-sm font-medium">{die.code}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {die.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  {days.map((day, idx) => {
                    const status = getDayStatus(die.id, day);
                    return (
                      <td key={idx} className="px-0.5 py-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={cn(
                                "w-full h-6 rounded-sm cursor-pointer hover:opacity-80",
                                status.color
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{die.code}</p>
                            <p className="text-xs">{day.toLocaleDateString('en-IN')}</p>
                            <p className="text-xs text-muted-foreground">{status.reason}</p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-3 border-t text-xs flex-wrap">
          <span className="text-muted-foreground">Legend:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-bf-green" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-bf-orange" />
            <span>Refurbishment</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-bf-red" />
            <span>Repair</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-bf-blue" />
            <span>Inspection</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-bf-steel" />
            <span>Trial</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Import Calendar icon
import { Calendar } from 'lucide-react';
