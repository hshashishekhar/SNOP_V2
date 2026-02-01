import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Calendar,
  Filter,
  MoreHorizontal,
  GripVertical,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  Factory,
  Flame,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { GanttTask, GanttResource } from '@/types';

// Gantt Chart Configuration
interface GanttConfig {
  startDate: Date;
  endDate: Date;
  cellWidth: number;
  cellHeight: number;
  headerHeight: number;
  rowHeight: number;
  minDate: Date;
  maxDate: Date;
}

type ViewMode = 'day' | 'week' | 'month' | 'quarter';

interface GanttChartProps {
  tasks: GanttTask[];
  resources: GanttResource[];
  onTaskClick?: (task: GanttTask) => void;
  onTaskMove?: (taskId: string, newStartDate: Date, newEndDate: Date) => void;
  onTaskResize?: (taskId: string, newEndDate: Date) => void;
  className?: string;
  readOnly?: boolean;
  showWeekends?: boolean;
  viewMode?: ViewMode;
}

export function GanttChart({
  tasks,
  resources,
  onTaskClick,
  onTaskMove,
  onTaskResize,
  className,
  readOnly = false,
  showWeekends = true,
  viewMode: initialViewMode = 'week',
}: GanttChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [zoom, setZoom] = useState(1);
  const [scrollX, setScrollX] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTask, setDragTask] = useState<GanttTask | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Calculate date range
  const dateRange = useMemo(() => {
    if (tasks.length === 0) {
      const now = new Date();
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      };
    }

    const startDates = tasks.map(t => t.startDate.getTime());
    const endDates = tasks.map(t => t.endDate.getTime());
    
    return {
      start: new Date(Math.min(...startDates)),
      end: new Date(Math.max(...endDates)),
    };
  }, [tasks]);

  // Extend range for better visibility
  const extendedRange = useMemo(() => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    // Add buffer
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);
    
    return { start, end };
  }, [dateRange]);

  // Calculate cell width based on view mode and zoom
  const cellWidth = useMemo(() => {
    const baseWidths = {
      day: 40,
      week: 60,
      month: 100,
      quarter: 150,
    };
    return baseWidths[viewMode] * zoom;
  }, [viewMode, zoom]);

  // Generate time columns
  const timeColumns = useMemo(() => {
    const columns: Date[] = [];
    const current = new Date(extendedRange.start);
    
    while (current <= extendedRange.end) {
      columns.push(new Date(current));
      
      switch (viewMode) {
        case 'day':
          current.setDate(current.getDate() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'quarter':
          current.setMonth(current.getMonth() + 3);
          break;
      }
    }
    
    return columns;
  }, [extendedRange, viewMode]);

  // Calculate total width
  const totalWidth = timeColumns.length * cellWidth;

  // Group tasks by resource
  const tasksByResource = useMemo(() => {
    const grouped = new Map<string, GanttTask[]>();
    
    resources.forEach(resource => {
      const resourceTasks = tasks.filter(t => t.resourceId === resource.id);
      // Sort by start date
      resourceTasks.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      grouped.set(resource.id, resourceTasks);
    });
    
    return grouped;
  }, [tasks, resources]);

  // Helper: Get position for a date
  const getDatePosition = useCallback((date: Date) => {
    const diffMs = date.getTime() - extendedRange.start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    let cells: number;
    switch (viewMode) {
      case 'day':
        cells = diffDays;
        break;
      case 'week':
        cells = diffDays / 7;
        break;
      case 'month':
        cells = diffDays / 30;
        break;
      case 'quarter':
        cells = diffDays / 90;
        break;
      default:
        cells = diffDays;
    }
    
    return cells * cellWidth;
  }, [extendedRange.start, viewMode, cellWidth]);

  // Helper: Get date from position
  const getDateFromPosition = useCallback((x: number) => {
    const cells = x / cellWidth;
    
    let days: number;
    switch (viewMode) {
      case 'day':
        days = cells;
        break;
      case 'week':
        days = cells * 7;
        break;
      case 'month':
        days = cells * 30;
        break;
      case 'quarter':
        days = cells * 90;
        break;
      default:
        days = cells;
    }
    
    const date = new Date(extendedRange.start);
    date.setDate(date.getDate() + Math.round(days));
    return date;
  }, [extendedRange.start, viewMode, cellWidth]);

  // Handle zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5));

  // Handle scroll
  const handleScroll = (direction: 'left' | 'right') => {
    const scrollAmount = containerRef.current?.clientWidth ? containerRef.current.clientWidth * 0.5 : 300;
    setScrollX(prev => {
      const newScroll = direction === 'left' ? prev - scrollAmount : prev + scrollAmount;
      return Math.max(0, Math.min(newScroll, totalWidth - (containerRef.current?.clientWidth || 0)));
    });
  };

  // Task drag handlers
  const handleTaskMouseDown = (e: React.MouseEvent, task: GanttTask) => {
    if (readOnly) return;
    
    e.stopPropagation();
    setIsDragging(true);
    setDragTask(task);
    setSelectedTaskId(task.id);
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragTask || !chartRef.current) return;
      
      const chartRect = chartRef.current.getBoundingClientRect();
      const x = e.clientX - chartRect.left - dragOffset.x + scrollX;
      
      // Visual feedback during drag
      const taskElement = document.getElementById(`task-${dragTask.id}`);
      if (taskElement) {
        taskElement.style.left = `${x}px`;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging || !dragTask || !chartRef.current) return;
      
      const chartRect = chartRef.current.getBoundingClientRect();
      const x = e.clientX - chartRect.left - dragOffset.x + scrollX;
      
      const newStartDate = getDateFromPosition(x);
      const duration = dragTask.endDate.getTime() - dragTask.startDate.getTime();
      const newEndDate = new Date(newStartDate.getTime() + duration);
      
      onTaskMove?.(dragTask.id, newStartDate, newEndDate);
      
      setIsDragging(false);
      setDragTask(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragTask, dragOffset, scrollX, getDateFromPosition, onTaskMove]);

  // Format date for header
  const formatHeaderDate = (date: Date) => {
    switch (viewMode) {
      case 'day':
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      case 'week':
        return `W${Math.ceil(date.getDate() / 7)} ${date.toLocaleDateString('en-IN', { month: 'short' })}`;
      case 'month':
        return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      case 'quarter':
        return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
    }
  };

  // Get task color based on type
  const getTaskColor = (task: GanttTask) => {
    switch (task.type) {
      case 'production':
        return task.color || 'bg-bf-blue';
      case 'changeover':
        return 'bg-bf-amber';
      case 'downtime':
        return 'bg-bf-red';
      case 'maintenance':
        return 'bg-bf-steel';
      case 'die_unavailable':
        return 'bg-bf-orange';
      default:
        return 'bg-bf-blue';
    }
  };

  // Get task icon
  const getTaskIcon = (task: GanttTask): React.ReactNode => {
    switch (task.type) {
      case 'production':
        return <Factory className="w-3 h-3" />;
      case 'changeover':
        return <Clock className="w-3 h-3" />;
      case 'downtime':
        return <AlertTriangle className="w-3 h-3" />;
      case 'maintenance':
        return <Wrench className="w-3 h-3" />;
      case 'die_unavailable':
        return <Flame className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <Card className={cn("flex flex-col h-full", className)}>
        <CardHeader className="pb-3 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-bf-blue" />
              Capacity Planning Gantt
            </CardTitle>
            
            {/* View Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-muted rounded-lg p-1">
                {(['day', 'week', 'month', 'quarter'] as ViewMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize",
                      viewMode === mode 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
              
              <Button variant="outline" size="icon" onClick={() => handleScroll('left')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleScroll('right')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs flex-wrap">
            <span className="text-muted-foreground">Legend:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-bf-blue" />
              <span>Production</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-bf-amber" />
              <span>Changeover</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-bf-red" />
              <span>Downtime</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-bf-steel" />
              <span>Maintenance</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-bf-orange" />
              <span>Die Unavailable</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          <div 
            ref={containerRef}
            className="h-full overflow-auto scrollbar-thin"
            onScroll={(e) => setScrollX(e.currentTarget.scrollLeft)}
          >
            <div 
              ref={chartRef}
              className="relative min-h-full"
              style={{ width: totalWidth + 200 }}
            >
              {/* Header */}
              <div 
                className="sticky top-0 z-20 flex bg-background border-b"
                style={{ height: 48 }}
              >
                {/* Resource column header */}
                <div 
                  className="sticky left-0 z-30 bg-background border-r flex items-center px-4 font-semibold text-sm"
                  style={{ width: 200, minWidth: 200 }}
                >
                  <GripVertical className="w-4 h-4 mr-2 text-muted-foreground" />
                  Resources
                </div>
                
                {/* Time columns header */}
                <div className="flex">
                  {timeColumns.map((date, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center justify-center text-xs font-medium border-r",
                        viewMode === 'day' && date.getDay() === 0 && "bg-muted/50",
                        viewMode === 'day' && date.getDay() === 6 && "bg-muted/50"
                      )}
                      style={{ width: cellWidth, minWidth: cellWidth }}
                    >
                      {formatHeaderDate(date)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div className="relative">
                {resources.map((resource, resourceIdx) => {
                  const resourceTasks = tasksByResource.get(resource.id) || [];
                  
                  return (
                    <div 
                      key={resource.id}
                      className="flex border-b hover:bg-muted/30 transition-colors"
                      style={{ height: 48 }}
                    >
                      {/* Resource name */}
                      <div 
                        className="sticky left-0 z-10 bg-background border-r flex items-center px-4"
                        style={{ width: 200, minWidth: 200 }}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {resource.type === 'line' && <Factory className="w-4 h-4 text-bf-orange flex-shrink-0" />}
                          {resource.type === 'die' && <Wrench className="w-4 h-4 text-bf-steel flex-shrink-0" />}
                          {resource.type === 'furnace' && <Flame className="w-4 h-4 text-bf-red flex-shrink-0" />}
                          <span className="text-sm font-medium truncate">{resource.name}</span>
                        </div>
                      </div>

                      {/* Task bars */}
                      <div className="relative flex-1">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex">
                          {timeColumns.map((_, idx) => (
                            <div
                              key={idx}
                              className="border-r border-dashed border-muted"
                              style={{ width: cellWidth, minWidth: cellWidth }}
                            />
                          ))}
                        </div>

                        {/* Tasks */}
                        {resourceTasks.map(task => {
                          const left = getDatePosition(task.startDate);
                          const width = getDatePosition(task.endDate) - left;
                          const isSelected = selectedTaskId === task.id;
                          
                          return (
                            <Tooltip key={task.id}>
                              <TooltipTrigger asChild>
                                <div
                                  id={`task-${task.id}`}
                                  className={cn(
                                    "absolute top-2 h-8 rounded-md cursor-pointer transition-all",
                                    getTaskColor(task),
                                    isSelected && "ring-2 ring-ring ring-offset-2",
                                    "hover:brightness-110"
                                  )}
                                  style={{
                                    left,
                                    width: Math.max(width, 20),
                                  }}
                                  onMouseDown={(e) => handleTaskMouseDown(e, task)}
                                  onClick={() => {
                                    setSelectedTaskId(task.id);
                                    onTaskClick?.(task);
                                  }}
                                >
                                  <div className="flex items-center gap-1 px-2 h-full text-white text-xs font-medium truncate">
                                    {getTaskIcon()}
                                    <span className="truncate">{task.name}</span>
                                  </div>
                                  
                                  {/* Progress indicator */}
                                  {task.progress > 0 && (
                                    <div 
                                      className="absolute bottom-0 left-0 h-1 bg-white/50 rounded-b-md"
                                      style={{ width: `${task.progress}%` }}
                                    />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-semibold">{task.name}</p>
                                  <p className="text-xs text-muted-foreground">{task.resourceName}</p>
                                  <div className="text-xs">
                                    <span className="text-muted-foreground">Start: </span>
                                    {task.startDate.toLocaleDateString('en-IN')}
                                  </div>
                                  <div className="text-xs">
                                    <span className="text-muted-foreground">End: </span>
                                    {task.endDate.toLocaleDateString('en-IN')}
                                  </div>
                                  {task.progress > 0 && (
                                    <div className="text-xs">
                                      <span className="text-muted-foreground">Progress: </span>
                                      {task.progress}%
                                    </div>
                                  )}
                                  {task.details && (
                                    <div className="pt-1 border-t mt-1">
                                      {Object.entries(task.details).map(([key, value]) => (
                                        <div key={key} className="text-xs">
                                          <span className="text-muted-foreground">{key}: </span>
                                          {String(value)}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Current time indicator */}
              <div 
                className="absolute top-0 bottom-0 w-px bg-bf-red z-10 pointer-events-none"
                style={{ 
                  left: getDatePosition(new Date()) + 200,
                  display: new Date() >= extendedRange.start && new Date() <= extendedRange.end ? 'block' : 'none'
                }}
              >
                <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-bf-red" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

// Mini Gantt for compact displays
interface MiniGanttProps {
  tasks: { start: Date; end: Date; color?: string }[];
  startDate: Date;
  endDate: Date;
  height?: number;
  className?: string;
}

export function MiniGantt({
  tasks,
  startDate,
  endDate,
  height = 24,
  className,
}: MiniGanttProps) {
  const totalDuration = endDate.getTime() - startDate.getTime();
  
  return (
    <div 
      className={cn("relative bg-muted rounded-full overflow-hidden", className)}
      style={{ height }}
    >
      {tasks.map((task, idx) => {
        const taskStart = Math.max(task.start.getTime(), startDate.getTime());
        const taskEnd = Math.min(task.end.getTime(), endDate.getTime());
        
        const left = ((taskStart - startDate.getTime()) / totalDuration) * 100;
        const width = ((taskEnd - taskStart) / totalDuration) * 100;
        
        return (
          <div
            key={idx}
            className={cn("absolute top-0 bottom-0 rounded-full", task.color || 'bg-bf-blue')}
            style={{
              left: `${left}%`,
              width: `${Math.max(width, 2)}%`,
            }}
          />
        );
      })}
    </div>
  );
}
