import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Building2,
  Factory,
  Settings,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Clock,
  Calendar,
  Zap,
  Plus,
  X,
  GanttChart,
  Move,
  GripVertical,
  Wrench,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLines } from '@/hooks/useLines';
import { useDies } from '@/hooks/useDies';

// Planning Horizon Types
const planningHorizons = [
  { id: 'aop', name: 'AOP', period: '4 Years', timeframe: 'year', color: 'bg-purple-600' },
  { id: 'snop', name: 'SNOP', period: '13 Weeks', timeframe: 'week', color: 'bg-blue-600' },
  { id: 'mps', name: 'MPS', period: '4 Weeks', timeframe: 'day', color: 'bg-green-600' },
  { id: 'execution', name: 'Execution', period: '48 Hours', timeframe: 'hour', color: 'bg-orange-600' },
];

// Shift Types
const shiftTypes = [
  { id: 'A', name: 'Complex', color: 'bg-blue-500' },
  { id: 'B', name: 'Standard', color: 'bg-blue-600' },
  { id: 'C', name: 'Auto', color: 'bg-slate-600' },
];

// Weekly Shift Schedule
const weeklySchedule = [
  { time: '07:00-15:00', shift: 'A', days: ['A', 'A', 'A', 'A', 'A', 'A', 'A'] },
  { time: '15:00-00:00', shift: 'B', days: ['B', 'B', 'B', 'B', 'B', 'B', '-'] },
  { time: '00:00-07:00', shift: 'C', days: ['C', 'C', 'C', 'C', 'C', 'C', '-'] },
];

// Plan interface
interface Plan {
  id: string;
  lineId: string;
  dieId: string;
  dieCode: string;
  dieName: string;
  quantity: number;
  startDate: number; // Absolute day number from a reference date
  durationDays: number; // Duration in days
  status: 'planned' | 'confirmed' | 'in-progress' | 'completed';
  type: 'runner' | 'repeater' | 'stranger' | 'npd';
}

// Sample plans data with absolute dates
const initialPlans: Plan[] = [
  { id: 'p1', lineId: 'F-01', dieId: 'die-1', dieCode: 'FD-8278', dieName: 'Crankshaft Die A', quantity: 933, startDate: 0, durationDays: 14, status: 'planned', type: 'runner' },
  { id: 'p2', lineId: 'F-01', dieId: 'die-2', dieCode: 'FD-8330', dieName: 'Connecting Rod Die', quantity: 1890, startDate: 14, durationDays: 21, status: 'confirmed', type: 'stranger' },
  { id: 'p3', lineId: 'F-02', dieId: 'die-3', dieCode: 'FD-8390', dieName: 'Cam Shaft Die', quantity: 830, startDate: 0, durationDays: 14, status: 'planned', type: 'stranger' },
  { id: 'p4', lineId: 'F-02', dieId: 'die-4', dieCode: 'FD-8077', dieName: 'Gear Die Large', quantity: 1245, startDate: 14, durationDays: 21, status: 'in-progress', type: 'stranger' },
];

// Draggable die type
interface DraggableDie {
  id: string;
  code: string;
  name: string;
  type: string;
}

export function Planning() {
  const [selectedHorizon, setSelectedHorizon] = useState('snop');
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [draggedPlan, setDraggedPlan] = useState<Plan | null>(null);
  const [draggedDie, setDraggedDie] = useState<DraggableDie | null>(null);
  const [resizingPlan, setResizingPlan] = useState<{
    id: string;
    side: 'left' | 'right';
    startX: number;
    startDuration: number;
    startTime: number;
  } | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [timelineStart, setTimelineStart] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const timelineRef = useRef<HTMLDivElement>(null);

  // Form state
  const [newPlan, setNewPlan] = useState({
    lineId: '',
    dieId: '',
    dieCode: '',
    dieName: '',
    quantity: 0,
    durationDays: 7, // Default to 1 week
    type: 'runner' as Plan['type'],
    status: 'planned' as Plan['status'],
  });

  const { lines } = useLines();
  const { dies } = useDies();

  const selectedHorizonData = planningHorizons.find(h => h.id === selectedHorizon)!;

  // Column width configuration
  const COLUMN_WIDTH = 60; // Base width in pixels

  // Helper function to snap position to nearest column
  const snapToColumn = (position: number): number => {
    return Math.round(position);
  };

  // Helper function to get default duration based on horizon
  const getDefaultDuration = (): number => {
    switch (selectedHorizon) {
      case 'aop':
        return 365 / 4; // 1 quarter in days (91.25 days)
      case 'snop':
        return 7; // 1 week in days
      case 'mps':
        return 1; // 1 day
      case 'execution':
        return 2 / 24; // 2 hours in days (2/24 = 0.0833 days)
      default:
        return 7;
    }
  };

  // Get timeline configuration based on horizon
  const getTimelineConfig = () => {
    switch (selectedHorizon) {
      case 'aop':
        return {
          totalDays: 365 * 4, // 4 years
          slotLabel: 'Year',
          slotsPerUnit: 4, // 4 quarters per year
          formatSlot: (idx: number) => `Year ${Math.floor(idx / 4) + 1} - Q${(idx % 4) + 1}`,
          totalSlots: 48, // Show all 48 quarters
        };
      case 'snop':
        return {
          totalDays: 13 * 7, // 13 weeks
          slotLabel: 'Week',
          slotsPerUnit: 1,
          formatSlot: (idx: number) => `Week ${idx + 1}`,
          totalSlots: 13, // Show all 13 weeks
        };
      case 'mps':
        return {
          totalDays: 4 * 7, // 4 weeks
          slotLabel: 'Day',
          slotsPerUnit: 1,
          formatSlot: (idx: number) => `Day ${idx + 1}`,
          totalSlots: 28, // Show all 28 days
        };
      case 'execution':
        return {
          totalDays: 2, // 48 hours = 2 days
          slotLabel: 'Hour',
          slotsPerUnit: 1,
          formatSlot: (idx: number) => {
            const hours = idx * 2; // Every 2 hours
            return `${hours}:00`;
          },
          totalSlots: 25, // Show 25 slots (0, 2, 4, 6... 46, 48 hours = 0:00 to 48:00)
        };
      default:
        return {
          totalDays: 13 * 7,
          slotLabel: 'Week',
          slotsPerUnit: 1,
          formatSlot: (idx: number) => `Week ${idx + 1}`,
          totalSlots: 13,
        };
    }
  };

  const timelineConfig = getTimelineConfig();
  const TOTAL_COLUMNS = timelineConfig.totalSlots; // Use actual total slots for each horizon

  // Generate timeline slots based on horizon - show ALL slots
  const generateTimelineSlots = () => {
    return Array.from({ length: timelineConfig.totalSlots }, (_, i) => timelineConfig.formatSlot(i));
  };

  // Convert absolute day to timeline slot position
  const dayToSlotPosition = (day: number) => {
    const daysPerSlot = timelineConfig.totalDays / timelineConfig.totalSlots;
    return day / daysPerSlot;
  };

  // Convert timeline slot position to absolute day
  const slotPositionToDay = (position: number) => {
    const daysPerSlot = timelineConfig.totalDays / timelineConfig.totalSlots;
    return position * daysPerSlot;
  };

  const timeSlots = generateTimelineSlots();

  // Get plans for a specific line with converted positions
  const getLinePlans = (lineId: string) => {
    return plans.filter(p => p.lineId === lineId).map(plan => {
      // Convert absolute days to timeline position for display
      const startTime = dayToSlotPosition(plan.startDate);
      const endTime = dayToSlotPosition(plan.startDate + plan.durationDays);
      
      // Clamp to timeline bounds to prevent overflow
      const clampedStartTime = Math.max(0, Math.min(startTime, TOTAL_COLUMNS));
      const clampedEndTime = Math.max(0, Math.min(endTime, TOTAL_COLUMNS));
      const clampedDuration = clampedEndTime - clampedStartTime;
      
      return {
        ...plan,
        startTime: clampedStartTime,
        duration: Math.max(0, clampedDuration),
        isOverflow: endTime > TOTAL_COLUMNS || startTime < 0,
      };
    });
  };

  // Filter dies for the sidebar
  const filteredDies = dies.filter(die => {
    const matchesSearch = searchTerm === '' || 
      die.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      die.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || die.category === typeFilter;
    return matchesSearch && matchesType;
  });

  // Handle plan drag start
  const handlePlanDragStart = (plan: Plan) => {
    if (!resizingPlan) {
      setDraggedPlan(plan);
      setDraggedDie(null);
    }
  };

  // Handle die drag start
  const handleDieDragStart = (die: DraggableDie) => {
    setDraggedDie(die);
    setDraggedPlan(null);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle drop on line timeline
  const handleDropOnLine = (lineId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const dropPosition = (x / rect.width) * TOTAL_COLUMNS;
    
    // Snap to nearest column
    const snappedPosition = snapToColumn(dropPosition);
    const newStartDate = slotPositionToDay(snappedPosition);

    if (draggedPlan) {
      setPlans(prev => prev.map(p => 
        p.id === draggedPlan.id 
          ? { ...p, lineId, startDate: newStartDate }
          : p
      ));
      setDraggedPlan(null);
    } else if (draggedDie) {
      const defaultDuration = getDefaultDuration();
      const plan: Plan = {
        id: `p${Date.now()}`,
        lineId,
        dieId: draggedDie.id,
        dieCode: draggedDie.code,
        dieName: draggedDie.name,
        quantity: 1000,
        startDate: newStartDate,
        durationDays: defaultDuration,
        status: 'planned',
        type: draggedDie.type as Plan['type'],
      };
      setPlans(prev => [...prev, plan]);
      setDraggedDie(null);
    }
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, plan: Plan, side: 'left' | 'right') => {
    e.stopPropagation();
    
    // Calculate current position in slot coordinates
    const currentStartSlot = dayToSlotPosition(plan.startDate);
    const currentEndSlot = dayToSlotPosition(plan.startDate + plan.durationDays);
    
    setResizingPlan({
      id: plan.id,
      side,
      startX: e.clientX,
      startDuration: currentEndSlot - currentStartSlot,
      startTime: currentStartSlot,
    });
    setDraggedPlan(null);
    setDraggedDie(null);
  };

  // Handle resize move
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizingPlan || !timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const slotWidth = rect.width / TOTAL_COLUMNS;
    const deltaSlots = (e.clientX - resizingPlan.startX) / slotWidth;
    
    if (resizingPlan.side === 'left') {
      // Left resize: adjust start time and duration
      const newStartSlot = Math.max(0, resizingPlan.startTime + deltaSlots);
      const maxNewStartSlot = resizingPlan.startTime + resizingPlan.startDuration - 1;
      const clampedStartSlot = Math.min(newStartSlot, maxNewStartSlot);
      
      // Snap to nearest column
      const snappedStartSlot = snapToColumn(clampedStartSlot);
      const newDurationSlot = resizingPlan.startDuration + resizingPlan.startTime - snappedStartSlot;
      
      // Convert back to absolute days
      const newStartDate = slotPositionToDay(snappedStartSlot);
      const newDurationDays = slotPositionToDay(newDurationSlot);
      
      setPlans(prev => prev.map(p => 
        p.id === resizingPlan.id 
          ? { ...p, startDate: newStartDate, durationDays: Math.max(getDefaultDuration(), newDurationDays) }
          : p
      ));
    } else {
      // Right resize: only adjust duration
      const newDurationSlot = Math.max(1, resizingPlan.startDuration + deltaSlots);
      
      // Snap to nearest column
      const snappedDurationSlot = Math.max(1, snapToColumn(newDurationSlot));
      const newDurationDays = slotPositionToDay(snappedDurationSlot);
      
      setPlans(prev => prev.map(p => 
        p.id === resizingPlan.id 
          ? { ...p, durationDays: Math.max(getDefaultDuration(), newDurationDays) }
          : p
      ));
    }
  }, [resizingPlan, selectedHorizon, TOTAL_COLUMNS]);

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    setResizingPlan(null);
  }, []);

  // Add mouse move and up listeners for resizing
  useEffect(() => {
    if (resizingPlan) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingPlan, handleResizeMove, handleResizeEnd]);

  // Add new plan
  const handleAddPlan = () => {
    const plan: Plan = {
      id: `p${Date.now()}`,
      ...newPlan,
      startDate: 0,
      durationDays: getDefaultDuration(),
    };
    setPlans(prev => [...prev, plan]);
    setNewPlan({
      lineId: '',
      dieId: '',
      dieCode: '',
      dieName: '',
      quantity: 0,
      durationDays: 7,
      type: 'runner',
      status: 'planned',
    });
    setAddPlanOpen(false);
  };

  // Delete plan
  const handleDeletePlan = (planId: string) => {
    setPlans(prev => prev.filter(p => p.id !== planId));
  };

  // Handle quantity edit start
  const handleQuantityEditStart = (plan: Plan) => {
    setEditingQuantity(`${plan.id}:${plan.quantity}`);
  };

  // Handle quantity change
  const handleQuantityChange = (value: string) => {
    setEditingQuantity(value);
  };

  // Handle quantity save
  const handleQuantitySave = () => {
    if (editingQuantity) {
      const [planId, quantityStr] = editingQuantity.split(':');
      const newQuantity = parseInt(quantityStr) || 0;
      setPlans(prev => prev.map(p => 
        p.id === planId 
          ? { ...p, quantity: newQuantity }
          : p
      ));
    }
    setEditingQuantity(null);
  };

  // Handle quantity blur/cancel
  const handleQuantityCancel = () => {
    setEditingQuantity(null);
  };

  // Get die color based on type
  const getDieColor = (type: string) => {
    switch (type) {
      case 'runner': return 'bg-green-500';
      case 'repeater': return 'bg-yellow-500';
      case 'stranger': return 'bg-red-500';
      case 'npd': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
      planned: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50', label: 'Plan' },
      confirmed: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50', label: 'Conf' },
      'in-progress': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50', label: 'Prog' },
      completed: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/50', label: 'Done' },
    };
    const config = statusConfig[status] || statusConfig.planned;
    return (
      <Badge className={cn('border text-[10px] px-1.5 py-0', config.bg, config.text, config.border)}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Add Plan Dialog */}
      <Dialog open={addPlanOpen} onOpenChange={setAddPlanOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Planning Mode</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 border-slate-600 text-slate-300"
                >
                  Line Wise
                </Button>
                <Button 
                  variant="default" 
                  className="flex-1 bg-blue-600"
                >
                  Die Wise
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Production Line</Label>
              <Select 
                value={newPlan.lineId} 
                onValueChange={(value) => setNewPlan({ ...newPlan, lineId: value })}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select Line" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {lines.map((line) => (
                    <SelectItem key={line.id} value={line.id}>
                      {line.code} - {line.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Die</Label>
              <Select 
                value={newPlan.dieId} 
                onValueChange={(value) => {
                  const die = dies.find(d => d.id === value);
                  setNewPlan({ 
                    ...newPlan, 
                    dieId: value,
                    dieCode: die?.code || '',
                    dieName: die?.name || '',
                    type: die?.category as Plan['type'] || 'runner'
                  });
                }}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select Die" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {dies.map((die) => (
                    <SelectItem key={die.id} value={die.id}>
                      {die.code} - {die.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Quantity</Label>
                <Input
                  type="number"
                  value={newPlan.quantity}
                  onChange={(e) => setNewPlan({ ...newPlan, quantity: parseInt(e.target.value) || 0 })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Duration ({selectedHorizonData.timeframe}s)</Label>
                <Input
                  type="number"
                  value={newPlan.durationDays}
                  onChange={(e) => setNewPlan({ ...newPlan, durationDays: parseInt(e.target.value) || 1 })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Die Type</Label>
                <Select 
                  value={newPlan.type} 
                  onValueChange={(value) => setNewPlan({ ...newPlan, type: value as Plan['type'] })}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="runner">Runner</SelectItem>
                    <SelectItem value="repeater">Repeater</SelectItem>
                    <SelectItem value="stranger">Stranger</SelectItem>
                    <SelectItem value="npd">NPD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Status</Label>
                <Select 
                  value={newPlan.status} 
                  onValueChange={(value) => setNewPlan({ ...newPlan, status: value as Plan['status'] })}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPlanOpen(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleAddPlan} className="bg-blue-600 hover:bg-blue-700">
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Available Dies Sidebar */}
        <Card className="lg:col-span-1 bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-semibold text-white">Available Dies</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Search dies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-slate-200 text-sm"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-200 text-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="runner">Runner</SelectItem>
                  <SelectItem value="repeater">Repeater</SelectItem>
                  <SelectItem value="stranger">Stranger</SelectItem>
                  <SelectItem value="npd">NPD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Draggable Dies List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              <p className="text-xs text-slate-500 mb-2">
                <Move className="w-3 h-3 inline mr-1" />
                Drag dies to lines
              </p>
              {filteredDies.length === 0 ? (
                <div className="text-center text-slate-400 py-4 text-sm">No dies found</div>
              ) : (
                filteredDies.map((die) => (
                  <div
                    key={die.id}
                    className={cn(
                      'p-3 rounded-lg border border-slate-700 bg-slate-800/50 cursor-grab active:cursor-grabbing transition-all',
                      'hover:border-slate-500 hover:bg-slate-800 hover:shadow-md',
                      draggedDie?.id === die.id && 'opacity-50 border-blue-500 ring-1 ring-blue-500/50'
                    )}
                    draggable
                    onDragStart={() => handleDieDragStart({
                      id: die.id,
                      code: die.code,
                      name: die.name,
                      type: die.category
                    })}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={cn('text-xs font-medium', getDieColor(die.category))}>
                        {die.category}
                      </Badge>
                      <span className="text-sm font-semibold text-white">{die.code}</span>
                    </div>
                    <p className="text-xs text-slate-300 truncate mb-2">{die.name}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Life</span>
                        <span className="text-slate-400">{((die.remainingLife / die.totalLife) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            'h-full rounded-full transition-all',
                            (die.remainingLife / die.totalLife) > 0.8 ? 'bg-green-500' :
                            (die.remainingLife / die.totalLife) > 0.3 ? 'bg-yellow-500' : 'bg-red-500'
                          )}
                          style={{ width: `${(die.remainingLife / die.totalLife) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Planning Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Planning Horizon Selector */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <CardTitle className="text-base font-semibold text-white">Planning Horizon</CardTitle>
                </div>
                <Dialog open={addPlanOpen} onOpenChange={setAddPlanOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Plan
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Horizon Selector */}
              <div className="grid grid-cols-4 gap-2">
                {planningHorizons.map((horizon) => (
                  <button
                    key={horizon.id}
                    onClick={() => setSelectedHorizon(horizon.id)}
                    className={cn(
                      'p-3 rounded-lg text-center transition-all',
                      selectedHorizon === horizon.id
                        ? `${horizon.color} text-white shadow-lg shadow-${horizon.color}/20`
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-600/50'
                    )}
                  >
                    <div className="text-sm font-semibold">{horizon.name}</div>
                    <div className="text-xs opacity-80 mt-1">{horizon.period}</div>
                  </button>
                ))}
              </div>

              {/* Timeline Selection Controls */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input
                    placeholder={`Search ${selectedHorizonData.timeframe}s...`}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-slate-200"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-slate-200">
                    <SelectValue placeholder="All Lines" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Lines</SelectItem>
                    {lines.map((line) => (
                      <SelectItem key={line.id} value={line.id}>
                        {line.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-white"
                    onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-slate-400 px-2">{zoomLevel}x</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-white"
                    onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
                  >
                    <GanttChart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Planning Gantt Chart */}
          <Card className="bg-slate-800/50 border-slate-700 overflow-hidden shadow-lg">
            <CardHeader className="pb-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <GanttChart className="w-5 h-5 text-blue-400" />
                  <CardTitle className="text-base font-semibold text-white">
                    {selectedHorizonData.name} Planning - {selectedHorizonData.period}
                  </CardTitle>
                  <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/50">{plans.length} plans</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Move className="w-3.5 h-3.5" />
                    <span>Drag to reschedule</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronLeftIcon className="w-3.5 h-3.5" />
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                    <span>Resize edges</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 bg-slate-700/50 rounded">
                    <span className="font-medium">Zoom:</span>
                    <span className="text-white">{zoomLevel}x</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto custom-scrollbar" ref={timelineRef}>
                <div style={{ minWidth: `${192 + (TOTAL_COLUMNS * COLUMN_WIDTH * zoomLevel) + 80}px` }}>
                  {/* Timeline Header */}
                  <div className="flex border-b-2 border-slate-600 bg-slate-800/80 h-12 sticky top-0 z-30">
                    <div className="w-48 px-3 text-sm font-semibold text-slate-200 sticky left-0 bg-slate-800/90 z-10 border-r border-slate-700 flex items-center shadow-sm">
                      Line / Die
                    </div>
                    <div className="flex h-12">
                      {timeSlots.map((slot, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "px-2 py-2 text-xs font-medium text-slate-400 text-center border-l border-slate-700/50 bg-slate-800/50 flex items-center justify-center",
                            idx % 4 === 0 && "border-l-slate-600 border-l-2"
                          )}
                          style={{ width: `${COLUMN_WIDTH * zoomLevel}px`, minWidth: `${COLUMN_WIDTH * zoomLevel}px` }}
                          title={slot}
                        >
                          <span className="truncate">{slot}</span>
                        </div>
                      ))}
                    </div>
                    <div className="w-20 px-3 text-xs font-semibold text-slate-400 text-center border-l border-slate-700 bg-slate-800/50 flex items-center justify-center h-full">
                      Actions
                    </div>
                  </div>

                  {/* Gantt Rows by Line */}
                  {lines.slice(0, 5).map((line) => {
                    const linePlans = getLinePlans(line.id);
                    return (
                      <div key={line.id} className="border-b border-slate-700/50">
                        {/* Line Header - Full Width */}
                        <div className="flex items-center h-12 bg-slate-800/50 border-b border-slate-700/50 sticky top-0 z-20">
                          <div className="w-48 px-3 flex items-center gap-2 border-r border-slate-700">
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                            <Settings className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-white truncate">{line.code}</span>
                          </div>
                          <div className="flex-1 px-3 flex items-center gap-2">
                            <span className="text-sm text-slate-300">{line.name}</span>
                            <Badge variant="outline" className="bg-slate-700/50 text-slate-300 text-xs">
                              {linePlans.length} {linePlans.length === 1 ? 'plan' : 'plans'}
                            </Badge>
                          </div>
                          <div className="w-20 border-l border-slate-700" />
                        </div>
                        
                        {/* Die Rows */}
                        <div 
                          className={cn(
                            'relative min-h-[48px]',
                            draggedDie && 'bg-blue-500/10 border-2 border-dashed border-blue-500/50'
                          )}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDropOnLine(line.id, e)}
                        >
                          {linePlans.length === 0 ? (
                            <div className="h-16 flex items-center justify-center text-center text-slate-500 text-sm border-b border-slate-700/30">
                              {draggedDie ? (
                                <div className="flex items-center gap-2 text-blue-400 animate-pulse">
                                  <Move className="w-4 h-4" />
                                  <span className="font-medium">Drop die here to create plan</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span>No plans scheduled.</span>
                                  <span className="text-slate-600">Drag a die here to start planning.</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            linePlans.map((plan) => (
                              <div
                                key={plan.id}
                                className={cn(
                                  'flex items-center h-12 border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors',
                                  draggedDie && 'pointer-events-none opacity-50',
                                  draggedPlan?.id === plan.id && 'bg-blue-500/10'
                                )}
                                draggable
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  handlePlanDragStart(plan);
                                }}
                              >
                                <div className="w-48 h-12 px-2 sticky left-0 bg-slate-800/90 z-10 flex items-center gap-2 border-r border-slate-700">
                                  <GripVertical className="w-4 h-4 text-slate-500 cursor-grab flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1 mb-0.5">
                                      <Badge className={cn('text-[10px] px-1 py-0', getDieColor(plan.type))}>
                                        {plan.type}
                                      </Badge>
                                      <span className="text-xs text-slate-400 truncate">{plan.dieCode}</span>
                                    </div>
                                    <span className="text-xs text-white truncate block">{plan.dieName}</span>
                                  </div>
                                </div>
                                
                                {/* Plan Bar with Resize Handles */}
                                <div className="relative h-12" style={{ height: '48px', width: `${TOTAL_COLUMNS * COLUMN_WIDTH * zoomLevel}px` }}>
                                  {/* Grid lines for visual alignment */}
                                  <div className="absolute inset-0 flex pointer-events-none">
                                    {Array.from({ length: TOTAL_COLUMNS }).map((_, idx) => (
                                      <div
                                        key={idx}
                                        className={cn(
                                          "border-l",
                                          idx % 4 === 0 ? "border-slate-700/30" : "border-slate-700/10"
                                        )}
                                        style={{ width: `${COLUMN_WIDTH * zoomLevel}px` }}
                                      />
                                    ))}
                                  </div>

                                  {/* Current time indicator (for first column as reference) */}
                                  {plan.startTime === 0 && (
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500/50 pointer-events-none z-10" />
                                  )}

                                  <div
                                    className={cn(
                                      'absolute top-2 h-8 rounded-md flex flex-col justify-center px-3 transition-all hover:shadow-lg group cursor-move',
                                      getDieColor(plan.type),
                                      plan.type === 'runner' && 'bg-gradient-to-r from-green-600 to-green-500',
                                      plan.type === 'repeater' && 'bg-gradient-to-r from-yellow-600 to-yellow-500',
                                      plan.type === 'stranger' && 'bg-gradient-to-r from-red-600 to-red-500',
                                      plan.type === 'npd' && 'bg-gradient-to-r from-blue-600 to-blue-500',
                                      draggedPlan?.id === plan.id && 'opacity-50 scale-105',
                                      plan.isOverflow && 'ring-2 ring-orange-500/50',
                                      'border border-white/20 shadow-md'
                                    )}
                                    style={{
                                      left: `${plan.startTime * COLUMN_WIDTH * zoomLevel}px`,
                                      width: `${plan.duration * COLUMN_WIDTH * zoomLevel}px`,
                                      minWidth: '60px',
                                    }}
                                    title={`${plan.dieCode}: ${plan.quantity} units | Status: ${plan.status} | Days: ${Math.round(plan.startDate)}-${Math.round(plan.startDate + plan.durationDays)} (${Math.round(plan.durationDays)} days)${plan.isOverflow ? ' | ⚠️ Exceeds timeline range' : ''}`}
                                  >
                                    <span className="text-xs font-medium text-white truncate drop-shadow-md">{plan.dieCode}</span>
                                    
                                    {/* Editable Quantity */}
                                    {editingQuantity?.startsWith(plan.id) ? (
                                      <input
                                        type="number"
                                        className="w-16 bg-black/30 text-white text-[10px] rounded px-1 py-0.5 focus:outline-none focus:bg-black/50 border border-white/20"
                                        value={editingQuantity.split(':')[1]}
                                        onChange={(e) => handleQuantityChange(`${plan.id}:${e.target.value}`)}
                                        onBlur={handleQuantitySave}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleQuantitySave();
                                          if (e.key === 'Escape') handleQuantityCancel();
                                        }}
                                        autoFocus
                                        min="0"
                                      />
                                    ) : (
                                      <span 
                                        className="text-white/90 text-[10px] cursor-text hover:text-white font-medium"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleQuantityEditStart(plan);
                                        }}
                                      >
                                        {plan.quantity.toLocaleString()} units
                                      </span>
                                    )}
                                    
                                    {/* Left Resize Handle */}
                                    <div
                                      className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-black/30 to-transparent"
                                      onMouseDown={(e) => handleResizeStart(e, plan, 'left')}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="w-0.5 h-6 bg-white/80 rounded-full shadow-sm" />
                                    </div>
                                    
                                    {/* Right Resize Handle */}
                                    <div
                                      className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-black/30 to-transparent"
                                      onMouseDown={(e) => handleResizeStart(e, plan, 'right')}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="w-0.5 h-6 bg-white/80 rounded-full shadow-sm" />
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="w-20 h-12 px-2 flex items-center justify-center border-l border-slate-700/50 gap-1 bg-slate-800/30">
                                  <div className="flex flex-col items-center gap-1">
                                    {getStatusBadge(plan.status)}
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-5 w-5 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                      onClick={() => handleDeletePlan(plan.id)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Timeline Axis */}
              <div className="flex border-t-2 border-slate-600 bg-slate-800/50 sticky bottom-0 z-10">
                <div className="w-48 p-2 text-xs text-slate-500 sticky left-0 bg-slate-800/90 z-10 border-r border-slate-700 flex items-center">
                  <span className="font-medium">Timeline Scale</span>
                </div>
                <div className="flex relative h-8">
                  {timeSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "border-l border-slate-700/30 relative flex items-end justify-center pb-1",
                        idx % 4 === 0 && "border-l-slate-600"
                      )}
                      style={{ width: `${COLUMN_WIDTH * zoomLevel}px`, minWidth: `${COLUMN_WIDTH * zoomLevel}px` }}
                    >
                      {idx % 4 === 0 && (
                        <div className="absolute bottom-0 left-0 w-0.5 h-3 bg-slate-500" />
                      )}
                      {idx % 2 === 0 && idx % 4 !== 0 && (
                        <div className="absolute bottom-0 left-0 w-0.5 h-2 bg-slate-600" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="w-20 border-l border-slate-700" />
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700">
            <div className="flex items-center gap-6">
              <span className="text-sm text-slate-400">Die Types:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500" />
                <span className="text-sm text-green-400">Runner</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500" />
                <span className="text-sm text-yellow-400">Repeater</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span className="text-sm text-red-400">Stranger</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500" />
                <span className="text-sm text-blue-400">NPD</span>
              </div>
            </div>
          </div>

          {/* Weekly Shift Operations & Capacity Calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Shift Operations */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <CardTitle className="text-base font-semibold text-white">Weekly Shift Operations</CardTitle>
                </div>
                <div className="flex gap-2 mt-3">
                  {shiftTypes.map((shift) => (
                    <Badge
                      key={shift.id}
                      className={cn(
                        'px-3 py-1',
                        shift.color,
                        'text-white'
                      )}
                    >
                      <span className="font-bold mr-1">{shift.id}</span>
                      <span className="text-xs opacity-90">{shift.name}</span>
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-500" />
                    <span className="text-slate-400">Shift A (07:00-15:00)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-600" />
                    <span className="text-slate-400">Shift B (15:00-00:00)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slate-600" />
                    <span className="text-slate-400">Shift C (00:00-07:00)</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left">
                        <th className="pb-3 text-sm font-medium text-slate-400">Time</th>
                        <th className="pb-3 text-sm font-medium text-slate-400 text-center">Mon</th>
                        <th className="pb-3 text-sm font-medium text-slate-400 text-center">Tue</th>
                        <th className="pb-3 text-sm font-medium text-slate-400 text-center">Wed</th>
                        <th className="pb-3 text-sm font-medium text-slate-400 text-center">Thu</th>
                        <th className="pb-3 text-sm font-medium text-slate-400 text-center">Fri</th>
                        <th className="pb-3 text-sm font-medium text-slate-400 text-center">Sat</th>
                        <th className="pb-3 text-sm font-medium text-slate-400 text-center">Sun</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklySchedule.map((row, idx) => (
                        <tr key={idx} className="border-t border-slate-700/50">
                          <td className="py-3 text-sm text-slate-400">{row.time}</td>
                          {row.days.map((day, dayIdx) => (
                            <td key={dayIdx} className="py-3 px-1">
                              {day !== '-' ? (
                                <div
                                  className={cn(
                                    'px-3 py-2 rounded text-center text-sm font-medium text-white',
                                    day === 'A' && 'bg-blue-600',
                                    day === 'B' && 'bg-green-600',
                                    day === 'C' && 'bg-slate-600'
                                  )}
                                >
                                  {day}
                                </div>
                              ) : (
                                <div className="px-3 py-2 rounded text-center text-sm text-slate-600">-</div>
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

            {/* Capacity Calculator */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <CardTitle className="text-base font-semibold text-white">Capacity Calculator</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Gross Hours</p>
                    <p className="text-lg font-semibold text-white">168 hrs/week</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Changeover</p>
                    <p className="text-lg font-semibold text-yellow-400">-8 hrs</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Planned Downtime</p>
                    <p className="text-lg font-semibold text-yellow-400">-12 hrs</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Absenteeism (5%)</p>
                    <p className="text-lg font-semibold text-yellow-400">-7.4 hrs</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Net Available Capacity</span>
                    <span className="text-lg font-semibold text-green-400">140.6 hrs</span>
                  </div>
                  <Progress value={83.7} className="h-2 bg-slate-700" />
                  <p className="text-xs text-slate-500 mt-1">83.7% utilization</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
