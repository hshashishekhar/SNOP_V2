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
  startTime: number;
  duration: number;
  status: 'planned' | 'confirmed' | 'in-progress' | 'completed';
  type: 'runner' | 'repeater' | 'stranger' | 'npd';
}

// Sample plans data
const initialPlans: Plan[] = [
  { id: 'p1', lineId: 'F-01', dieId: 'die-1', dieCode: 'FD-8278', dieName: 'Crankshaft Die A', quantity: 933, startTime: 0, duration: 2, status: 'planned', type: 'runner' },
  { id: 'p2', lineId: 'F-01', dieId: 'die-2', dieCode: 'FD-8330', dieName: 'Connecting Rod Die', quantity: 1890, startTime: 2, duration: 3, status: 'confirmed', type: 'stranger' },
  { id: 'p3', lineId: 'F-02', dieId: 'die-3', dieCode: 'FD-8390', dieName: 'Cam Shaft Die', quantity: 830, startTime: 0, duration: 2, status: 'planned', type: 'stranger' },
  { id: 'p4', lineId: 'F-02', dieId: 'die-4', dieCode: 'FD-8077', dieName: 'Gear Die Large', quantity: 1245, startTime: 2, duration: 3, status: 'in-progress', type: 'stranger' },
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
    duration: 1,
    type: 'runner' as Plan['type'],
    status: 'planned' as Plan['status'],
  });

  const { lines } = useLines();
  const { dies } = useDies();

  const selectedHorizonData = planningHorizons.find(h => h.id === selectedHorizon)!;

  // Generate timeline slots based on horizon
  const generateTimelineSlots = () => {
    const slots: string[] = [];
    const count = selectedHorizon === 'aop' ? 48 : selectedHorizon === 'snop' ? 13 : selectedHorizon === 'mps' ? 28 : 48;
    
    for (let i = 0; i < count; i++) {
      if (selectedHorizon === 'aop') {
        slots.push(`Year ${Math.floor(i / 4) + 1} - Q${(i % 4) + 1}`);
      } else if (selectedHorizon === 'snop') {
        slots.push(`Week ${i + 1}`);
      } else if (selectedHorizon === 'mps') {
        slots.push(`Day ${i + 1}`);
      } else {
        const hours = i % 24;
        slots.push(`Hour ${hours}:00`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimelineSlots();

  // Get plans for a specific line
  const getLinePlans = (lineId: string) => {
    return plans.filter(p => p.lineId === lineId);
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
    const dropPosition = (x / rect.width) * timeSlots.length;
    const newStartTime = Math.max(0, Math.min(Math.floor(dropPosition), timeSlots.length - 1));

    if (draggedPlan) {
      setPlans(prev => prev.map(p => 
        p.id === draggedPlan.id 
          ? { ...p, lineId, startTime: newStartTime }
          : p
      ));
      setDraggedPlan(null);
    } else if (draggedDie) {
      const plan: Plan = {
        id: `p${Date.now()}`,
        lineId,
        dieId: draggedDie.id,
        dieCode: draggedDie.code,
        dieName: draggedDie.name,
        quantity: 1000,
        startTime: newStartTime,
        duration: 2,
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
    setResizingPlan({
      id: plan.id,
      side,
      startX: e.clientX,
      startDuration: plan.duration,
      startTime: plan.startTime,
    });
    setDraggedPlan(null);
    setDraggedDie(null);
  };

  // Handle resize move
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizingPlan || !timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const slotWidth = rect.width / timeSlots.length;
    const deltaX = e.clientX - resizingPlan.startX;
    const deltaSlots = deltaX / slotWidth;
    
    if (resizingPlan.side === 'left') {
      // Left resize: adjust start time and duration
      const newStartTime = Math.max(0, Math.round(resizingPlan.startTime + deltaSlots));
      const maxNewStartTime = resizingPlan.startTime + resizingPlan.startDuration - 1;
      const clampedStartTime = Math.min(newStartTime, maxNewStartTime);
      const newDuration = resizingPlan.startDuration + resizingPlan.startTime - clampedStartTime;
      
      setPlans(prev => prev.map(p => 
        p.id === resizingPlan.id 
          ? { ...p, startTime: clampedStartTime, duration: Math.max(1, newDuration) }
          : p
      ));
    } else {
      // Right resize: only adjust duration
      const newDuration = Math.max(1, Math.round(resizingPlan.startDuration + deltaSlots));
      
      setPlans(prev => prev.map(p => 
        p.id === resizingPlan.id 
          ? { ...p, duration: newDuration }
          : p
      ));
    }
  }, [resizingPlan, timeSlots.length]);

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
      startTime: 0,
    };
    setPlans(prev => [...prev, plan]);
    setNewPlan({
      lineId: '',
      dieId: '',
      dieCode: '',
      dieName: '',
      quantity: 0,
      duration: 1,
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
    const statusColors: Record<string, string> = {
      planned: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      confirmed: 'bg-green-500/20 text-green-400 border-green-500/50',
      'in-progress': 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      completed: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
    };
    return (
      <Badge className={cn('border', statusColors[status] || statusColors.planned)}>
        {status}
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
                  value={newPlan.duration}
                  onChange={(e) => setNewPlan({ ...newPlan, duration: parseInt(e.target.value) || 1 })}
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
                      'p-3 rounded-lg border border-slate-700 bg-slate-800/50 cursor-grab active:cursor-grabbing',
                      'hover:border-slate-600 hover:bg-slate-800 transition-colors',
                      draggedDie?.id === die.id && 'opacity-50 border-blue-500'
                    )}
                    draggable
                    onDragStart={() => handleDieDragStart({
                      id: die.id,
                      code: die.code,
                      name: die.name,
                      type: die.category
                    })}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn('text-xs', getDieColor(die.category))}>
                        {die.category}
                      </Badge>
                      <span className="text-sm font-medium text-white">{die.code}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{die.name}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                      <span>Life: {die.remainingLife.toLocaleString()}</span>
                      <span>/</span>
                      <span>{die.totalLife.toLocaleString()}</span>
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
                      'p-3 rounded-lg text-center transition-colors',
                      selectedHorizon === horizon.id
                        ? `${horizon.color} text-white`
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                    )}
                  >
                    <div className="text-sm font-medium">{horizon.name}</div>
                    <div className="text-xs opacity-80">{horizon.period}</div>
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
          <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GanttChart className="w-5 h-5 text-blue-400" />
                  <CardTitle className="text-base font-semibold text-white">
                    {selectedHorizonData.name} Planning - {selectedHorizonData.period}
                  </CardTitle>
                  <Badge className="bg-slate-700 text-slate-300">{plans.length} plans</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-slate-400 mr-4">
                    <Move className="w-4 h-4" />
                    <span>Drag to reschedule</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <ChevronLeftIcon className="w-4 h-4" />
                    <ChevronRightIcon className="w-4 h-4" />
                    <span>Drag edges to resize</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto" ref={timelineRef}>
                <div className="min-w-[1200px]">
                  {/* Timeline Header */}
                  <div className="flex border-b border-slate-700 bg-slate-800/30">
                    <div className="w-48 p-3 text-sm font-medium text-slate-400 sticky left-0 bg-slate-800/50 z-10">
                      Line / Die
                    </div>
                    <div className="flex-1 flex">
                      {timeSlots.map((slot, idx) => (
                        <div
                          key={idx}
                          className="flex-1 p-2 text-xs text-center text-slate-400 border-l border-slate-700/50"
                          style={{ minWidth: `${60 * zoomLevel}px` }}
                        >
                          {slot}
                        </div>
                      ))}
                    </div>
                    <div className="w-20 p-3 text-xs text-right text-slate-400 border-l border-slate-700/50">
                      Actions
                    </div>
                  </div>

                  {/* Gantt Rows by Line */}
                  {lines.slice(0, 5).map((line) => {
                    const linePlans = getLinePlans(line.id);
                    return (
                      <div key={line.id} className="border-b border-slate-700/50">
                        {/* Line Header */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/30 border-b border-slate-700/50 sticky top-0 z-10">
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                          <Settings className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium text-white">{line.code} - {line.name}</span>
                          <Badge variant="outline" className="bg-slate-700/50 text-slate-300">
                            {linePlans.length} plans
                          </Badge>
                        </div>
                        
                        {/* Die Rows */}
                        <div 
                          className={cn(
                            'relative',
                            draggedDie && 'bg-blue-500/5'
                          )}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDropOnLine(line.id, e)}
                        >
                          {linePlans.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-sm">
                              {draggedDie ? (
                                <span className="text-blue-400">Drop here to add plan</span>
                              ) : (
                                <>No plans scheduled. Drag a die here or create a new one.</>
                              )}
                            </div>
                          ) : (
                            linePlans.map((plan) => (
                              <div
                                key={plan.id}
                                className={cn(
                                  'flex items-center border-b border-slate-700/30 hover:bg-slate-800/30',
                                  draggedDie && 'pointer-events-none opacity-50'
                                )}
                                draggable
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  handlePlanDragStart(plan);
                                }}
                              >
                                <div className="w-48 p-2 sticky left-0 bg-slate-800/50 z-10 flex items-center gap-2">
                                  <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <Badge className={cn('text-xs', getDieColor(plan.type))}>
                                        {plan.type}
                                      </Badge>
                                      <span className="text-xs text-slate-400">{plan.dieCode}</span>
                                    </div>
                                    <span className="text-xs text-white">{plan.dieName}</span>
                                  </div>
                                </div>
                                
                                {/* Plan Bar with Resize Handles */}
                                <div className="flex-1 relative h-12" style={{ height: '48px' }}>
                                  <div
                                    className={cn(
                                      'absolute top-2 h-8 rounded-md flex flex-col justify-center px-3 transition-all hover:brightness-110 hover:shadow-lg group',
                                      getDieColor(plan.type),
                                      draggedPlan?.id === plan.id && 'opacity-50'
                                    )}
                                    style={{
                                      left: `${(plan.startTime / timeSlots.length) * 100}%`,
                                      width: `${(plan.duration / timeSlots.length) * 100}%`,
                                      minWidth: '60px',
                                    }}
                                    title={`${plan.dieCode}: ${plan.quantity} units | Status: ${plan.status} | Duration: ${plan.duration} | Start: ${plan.startTime}`}
                                  >
                                    <span className="text-xs font-medium text-white truncate">{plan.dieCode}</span>
                                    
                                    {/* Editable Quantity */}
                                    {editingQuantity?.startsWith(plan.id) ? (
                                      <input
                                        type="number"
                                        className="w-16 bg-white/20 text-white text-[10px] rounded px-1 py-0.5 focus:outline-none focus:bg-white/30"
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
                                        className="text-white/80 text-[10px] cursor-text hover:text-white"
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
                                      className="absolute left-0 top-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-r border-white/20"
                                      onMouseDown={(e) => handleResizeStart(e, plan, 'left')}
                                    >
                                      <div className="w-1 h-4 bg-white/50 rounded-full" />
                                    </div>
                                    
                                    {/* Right Resize Handle */}
                                    <div
                                      className="absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-l border-white/20"
                                      onMouseDown={(e) => handleResizeStart(e, plan, 'right')}
                                    >
                                      <div className="w-1 h-4 bg-white/50 rounded-full" />
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="w-20 p-2 flex items-center justify-center border-l border-slate-700/50 gap-1">
                                  {getStatusBadge(plan.status)}
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-slate-400 hover:text-red-400"
                                    onClick={() => handleDeletePlan(plan.id)}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
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
