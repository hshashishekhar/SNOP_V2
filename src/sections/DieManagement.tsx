import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Settings,
  Search,
  Wrench,
  AlertTriangle,
  Clock,
  Info,
  Plus,
  X,
  Calendar,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDies, useDieUnavailability } from '@/hooks/useDies';
import { useLines } from '@/hooks/useLines';
import type { Die, DieUnavailability, DieCategory, DieStatus } from '@/types';

// Die Classification Types
const dieClassifications = [
  {
    id: 'runner',
    name: 'Runner',
    description: 'Daily/Weekly production',
    count: 5,
    color: 'green',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    textColor: 'text-green-400',
    iconColor: 'bg-green-500',
  },
  {
    id: 'repeater',
    name: 'Repeater',
    description: 'Monthly/Quarterly',
    count: 4,
    color: 'yellow',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    textColor: 'text-yellow-400',
    iconColor: 'bg-yellow-500',
  },
  {
    id: 'stranger',
    name: 'Stranger',
    description: '1-2x per year',
    count: 3,
    color: 'red',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/50',
    textColor: 'text-red-400',
    iconColor: 'bg-red-500',
  },
];

// Die Selection Rules
const selectionRules = [
  {
    id: 1,
    title: 'Highest Remaining Life',
    description: 'Prioritize dies with maximum shots remaining',
    icon: 'trophy',
  },
  {
    id: 2,
    title: 'Lowest Changeover Time',
    description: 'Minimize setup time between similar dies',
    icon: 'clock',
  },
  {
    id: 3,
    title: 'Proximity to Reorder',
    description: 'Schedule dies approaching reorder point',
    icon: 'alert',
  },
];

// Die Unavailability Categories
const unavailabilityCategories = [
  { value: 'refurbishment', label: 'Refurbishment' },
  { value: 'repair', label: 'Repair' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'trial', label: 'Trial' },
  { value: 'coating', label: 'Coating' },
  { value: 'storage', label: 'Storage' },
  { value: 'other', label: 'Other' },
];

// Impact Types
const impactTypes = [
  { value: 'full', label: 'Full Impact' },
  { value: 'partial', label: 'Partial Impact' },
];

// Recurrence Options
const recurrenceOptions = [
  { value: 'one-time', label: 'One Time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function DieManagement() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Dialog states
  const [addDieOpen, setAddDieOpen] = useState(false);
  const [addUnavailabilityOpen, setAddUnavailabilityOpen] = useState(false);
  const [selectedDie, setSelectedDie] = useState<Die | null>(null);
  
  // Form states
  const [newDie, setNewDie] = useState({
    code: '',
    name: '',
    lineId: '',
    category: 'runner' as DieCategory,
    totalLife: 50000,
    remainingLife: 50000,
    shotsPerHour: 60,
    status: 'active' as DieStatus,
    geometricCompatibility: '',
    rawMaterialCode: '',
    rawMaterialQtyPerShot: 1,
    rawMaterialLeadTime: 7,
    rawMaterialMOQ: 100,
    alternateRawMaterialCodes: '',
  });
  
  const [newUnavailability, setNewUnavailability] = useState({
    dieId: '',
    reason: '',
    category: 'refurbishment' as DieUnavailability['category'],
    startDateTime: '',
    endDateTime: '',
    duration: 0,
    durationUnit: 'hours' as DieUnavailability['durationUnit'],
    recurrence: 'one-time' as DieUnavailability['recurrence'],
    recurrenceEndDate: '',
    impactType: 'full' as DieUnavailability['impactType'],
    efficiencyLossPercent: 0,
    notes: '',
  });
  
  // Use hooks
  const { dies, isLoading: diesLoading, createDie, updateDie, deleteDie } = useDies();
  const { unavailability, isLoading: unavailabilityLoading, createUnavailability, updateUnavailability, deleteUnavailability } = useDieUnavailability();
  const { lines, isLoading: linesLoading } = useLines();
  
  // Filter dies
  const filteredDies = dies.filter((die) => {
    const matchesCategory = categoryFilter === 'all' || die.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || die.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      die.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      die.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });
  
  // Get category badge
  const getCategoryBadge = (category: string) => {
    const cat = dieClassifications.find((c) => c.id === category);
    if (!cat) return null;
    return (
      <Badge className={cn('border', cat.bgColor, cat.borderColor, cat.textColor)}>
        {cat.name.toLowerCase()}
      </Badge>
    );
  };
  
  // Get life progress color
  const getLifeProgress = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage > 80) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      inactive: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
      refurbishment: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      repair: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      storage: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
    };
    return (
      <Badge className={cn('border', statusColors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/50')}>
        {status}
      </Badge>
    );
  };
  
  // Get unavailability status badge
  const getUnavailabilityStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
      approved: 'bg-green-500/20 text-green-400 border-green-500/50',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/50',
    };
    return (
      <Badge className={cn('border', statusColors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/50')}>
        {status}
      </Badge>
    );
  };
  
  // Handle add die
  const handleAddDie = () => {
    createDie({
      ...newDie,
      isActive: true,
    });
    setNewDie({
      code: '',
      name: '',
      lineId: '',
      category: 'runner',
      totalLife: 50000,
      remainingLife: 50000,
      shotsPerHour: 60,
      status: 'active',
      geometricCompatibility: '',
      rawMaterialCode: '',
      rawMaterialQtyPerShot: 1,
      rawMaterialLeadTime: 7,
      rawMaterialMOQ: 100,
      alternateRawMaterialCodes: '',
    });
    setAddDieOpen(false);
  };
  
  // Handle add unavailability
  const handleAddUnavailability = () => {
    createUnavailability({
      ...newUnavailability,
      createdBy: 'system',
      status: 'draft',
    });
    setNewUnavailability({
      dieId: '',
      reason: '',
      category: 'refurbishment',
      startDateTime: '',
      endDateTime: '',
      duration: 0,
      durationUnit: 'hours',
      recurrence: 'one-time',
      recurrenceEndDate: '',
      impactType: 'full',
      efficiencyLossPercent: 0,
      notes: '',
    });
    setAddUnavailabilityOpen(false);
  };
  
  // Handle die click to manage unavailability
  const handleDieClick = (die: Die) => {
    setSelectedDie(die);
  };
  
  return (
    <div className="space-y-6">
      {/* Die Classification Matrix */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-base font-semibold text-white">Die Classification Matrix</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dieClassifications.map((classification) => (
              <Card
                key={classification.id}
                className={cn(
                  'bg-slate-800/50 border-2 cursor-pointer transition-all hover:brightness-110',
                  selectedCategory === classification.id ? classification.borderColor : 'border-slate-700',
                  classification.bgColor
                )}
                onClick={() => setSelectedCategory(classification.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-full', classification.iconColor)} />
                      <div>
                        <h3 className={cn('text-lg font-semibold', classification.textColor)}>
                          {classification.name}
                        </h3>
                        <p className="text-sm text-slate-400">{classification.description}</p>
                      </div>
                    </div>
                    <Badge className={cn('bg-slate-700 text-white')}>
                      {dies.filter(d => d.category === classification.id).length} dies
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Die Master Grid */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-base font-semibold text-white">Die Master Grid</CardTitle>
                <Badge className="bg-slate-700 text-slate-300">{filteredDies.length} of {dies.length}</Badge>
              </div>
              <Dialog open={addDieOpen} onOpenChange={setAddDieOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Die
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add New Die</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
                    <div className="space-y-2">
                      <Label htmlFor="dieCode" className="text-slate-300">Die Code</Label>
                      <Input
                        id="dieCode"
                        value={newDie.code}
                        onChange={(e) => setNewDie({ ...newDie, code: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="FD-XXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dieName" className="text-slate-300">Die Name</Label>
                      <Input
                        id="dieName"
                        value={newDie.name}
                        onChange={(e) => setNewDie({ ...newDie, name: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Crankshaft Die A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lineId" className="text-slate-300">Production Line</Label>
                      <Select
                        value={newDie.lineId}
                        onValueChange={(value) => setNewDie({ ...newDie, lineId: value })}
                      >
                        <SelectTrigger id="lineId" className="bg-slate-700/50 border-slate-600 text-white">
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
                      <Label htmlFor="category" className="text-slate-300">Category</Label>
                      <Select
                        value={newDie.category}
                        onValueChange={(value) => setNewDie({ ...newDie, category: value as DieCategory })}
                      >
                        <SelectTrigger id="category" className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="runner">Runner</SelectItem>
                          <SelectItem value="repeater">Repeater</SelectItem>
                          <SelectItem value="stranger">Stranger</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalLife" className="text-slate-300">Total Life (shots)</Label>
                      <Input
                        id="totalLife"
                        type="number"
                        value={newDie.totalLife}
                        onChange={(e) => setNewDie({ ...newDie, totalLife: parseInt(e.target.value) || 0 })}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="remainingLife" className="text-slate-300">Remaining Life (shots)</Label>
                      <Input
                        id="remainingLife"
                        type="number"
                        value={newDie.remainingLife}
                        onChange={(e) => setNewDie({ ...newDie, remainingLife: parseInt(e.target.value) || 0 })}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shotsPerHour" className="text-slate-300">Shots Per Hour</Label>
                      <Input
                        id="shotsPerHour"
                        type="number"
                        value={newDie.shotsPerHour}
                        onChange={(e) => setNewDie({ ...newDie, shotsPerHour: parseInt(e.target.value) || 0 })}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-slate-300">Status</Label>
                      <Select
                        value={newDie.status}
                        onValueChange={(value) => setNewDie({ ...newDie, status: value as DieStatus })}
                      >
                        <SelectTrigger id="status" className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="refurbishment">Refurbishment</SelectItem>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="storage">Storage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rawMaterialCode" className="text-slate-300">Raw Material Code</Label>
                      <Input
                        id="rawMaterialCode"
                        value={newDie.rawMaterialCode}
                        onChange={(e) => setNewDie({ ...newDie, rawMaterialCode: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="MAT-XXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rawMaterialMOQ" className="text-slate-300">MOQ (kg)</Label>
                      <Input
                        id="rawMaterialMOQ"
                        type="number"
                        value={newDie.rawMaterialMOQ}
                        onChange={(e) => setNewDie({ ...newDie, rawMaterialMOQ: parseInt(e.target.value) || 0 })}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="geometricCompatibility" className="text-slate-300">Geometric Compatibility</Label>
                      <Input
                        id="geometricCompatibility"
                        value={newDie.geometricCompatibility || ''}
                        onChange={(e) => setNewDie({ ...newDie, geometricCompatibility: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="e.g., F-01, F-02"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddDieOpen(false)} className="border-slate-600 text-slate-300">
                      Cancel
                    </Button>
                    <Button onClick={handleAddDie} className="bg-blue-600 hover:bg-blue-700">
                      Add Die
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Search die code or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-slate-200"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-slate-200">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="runner">Runner</SelectItem>
                  <SelectItem value="repeater">Repeater</SelectItem>
                  <SelectItem value="stranger">Stranger</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-slate-200">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="refurbishment">Refurbishment</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Die List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {diesLoading ? (
                <div className="text-center text-slate-400 py-8">Loading dies...</div>
              ) : filteredDies.length === 0 ? (
                <div className="text-center text-slate-400 py-8">No dies found</div>
              ) : (
                filteredDies.map((die) => (
                  <div
                    key={die.id}
                    className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                    onClick={() => handleDieClick(die)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium text-white">{die.code}</span>
                        {getCategoryBadge(die.category)}
                      </div>
                      <p className="text-sm text-slate-400">{die.name}</p>
                    </div>
                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">Life Remaining</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-sm font-medium',
                          (die.remainingLife / die.totalLife) > 0.8 ? 'text-green-400' :
                          (die.remainingLife / die.totalLife) > 0.3 ? 'text-yellow-400' : 'text-red-400'
                        )}>
                          {die.remainingLife.toLocaleString()}
                        </span>
                        <span className="text-slate-500">/</span>
                        <span className="text-slate-400">{die.totalLife.toLocaleString()}</span>
                      </div>
                      <Progress
                        value={(die.remainingLife / die.totalLife) * 100}
                        className={cn('h-1.5 mt-1 bg-slate-700', getLifeProgress(die.remainingLife, die.totalLife))}
                      />
                    </div>
                    <div>
                      {getStatusBadge(die.status)}
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600">
                        {lines.find(l => l.id === die.lineId)?.code || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Die Selection Rules (Keep as is) */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-semibold text-white">Die Selection Rules</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectionRules.map((rule, index) => (
                <div key={rule.id} className="flex gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{rule.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Die Unavailability Management Section */}
      {selectedDie && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <CardTitle className="text-base font-semibold text-white">
                  Die Unavailability: {selectedDie.code} - {selectedDie.name}
                </CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDie(null)}
                className="border-slate-600 text-slate-300"
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Unavailability Button */}
            <Dialog open={addUnavailabilityOpen} onOpenChange={setAddUnavailabilityOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Unavailability
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">Add Die Unavailability</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="unavReason" className="text-slate-300">Reason</Label>
                    <Input
                      id="unavReason"
                      value={newUnavailability.reason}
                      onChange={(e) => setNewUnavailability({ ...newUnavailability, reason: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="e.g., Scheduled maintenance"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unavCategory" className="text-slate-300">Category</Label>
                    <Select
                      value={newUnavailability.category}
                      onValueChange={(value) => setNewUnavailability({ ...newUnavailability, category: value as DieUnavailability['category'] })}
                    >
                      <SelectTrigger id="unavCategory" className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {unavailabilityCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unavImpactType" className="text-slate-300">Impact Type</Label>
                    <Select
                      value={newUnavailability.impactType}
                      onValueChange={(value) => setNewUnavailability({ ...newUnavailability, impactType: value as DieUnavailability['impactType'] })}
                    >
                      <SelectTrigger id="unavImpactType" className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {impactTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unavStartDateTime" className="text-slate-300">Start Date/Time</Label>
                    <Input
                      id="unavStartDateTime"
                      type="datetime-local"
                      value={newUnavailability.startDateTime}
                      onChange={(e) => setNewUnavailability({ ...newUnavailability, startDateTime: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unavEndDateTime" className="text-slate-300">End Date/Time</Label>
                    <Input
                      id="unavEndDateTime"
                      type="datetime-local"
                      value={newUnavailability.endDateTime}
                      onChange={(e) => setNewUnavailability({ ...newUnavailability, endDateTime: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unavDuration" className="text-slate-300">Duration</Label>
                    <Input
                      id="unavDuration"
                      type="number"
                      value={newUnavailability.duration}
                      onChange={(e) => setNewUnavailability({ ...newUnavailability, duration: parseInt(e.target.value) || 0 })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unavDurationUnit" className="text-slate-300">Duration Unit</Label>
                    <Select
                      value={newUnavailability.durationUnit}
                      onValueChange={(value) => setNewUnavailability({ ...newUnavailability, durationUnit: value as DieUnavailability['durationUnit'] })}
                    >
                      <SelectTrigger id="unavDurationUnit" className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unavRecurrence" className="text-slate-300">Recurrence</Label>
                    <Select
                      value={newUnavailability.recurrence}
                      onValueChange={(value) => setNewUnavailability({ ...newUnavailability, recurrence: value as DieUnavailability['recurrence'] })}
                    >
                      <SelectTrigger id="unavRecurrence" className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {recurrenceOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unavRecurrenceEndDate" className="text-slate-300">Recurrence End Date</Label>
                    <Input
                      id="unavRecurrenceEndDate"
                      type="date"
                      value={newUnavailability.recurrenceEndDate || ''}
                      onChange={(e) => setNewUnavailability({ ...newUnavailability, recurrenceEndDate: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="unavNotes" className="text-slate-300">Notes</Label>
                    <Textarea
                      id="unavNotes"
                      value={newUnavailability.notes || ''}
                      onChange={(e) => setNewUnavailability({ ...newUnavailability, notes: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddUnavailabilityOpen(false)} className="border-slate-600 text-slate-300">
                    Cancel
                  </Button>
                  <Button onClick={handleAddUnavailability} className="bg-orange-600 hover:bg-orange-700">
                    Add Unavailability
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Unavailability List */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Unavailability Records</h4>
              {unavailabilityLoading ? (
                <div className="text-center text-slate-400 py-8">Loading unavailability records...</div>
              ) : unavailability.filter(u => !selectedDie || u.dieId === selectedDie.id).length === 0 ? (
                <div className="text-center text-slate-400 py-8">No unavailability records found</div>
              ) : (
                unavailability
                  .filter(u => !selectedDie || u.dieId === selectedDie.id)
                  .map((unav) => (
                    <div
                      key={unav.id}
                      className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-white">
                            {new Date(unav.startDateTime).toLocaleDateString()} - {new Date(unav.endDateTime).toLocaleDateString()}
                          </span>
                          {getUnavailabilityStatusBadge(unav.status)}
                        </div>
                        <p className="text-sm text-slate-400">{unav.reason}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {unav.duration} {unav.durationUnit}
                          </span>
                          <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600">
                            {unav.category}
                          </Badge>
                          <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600">
                            {unav.impactType === 'full' ? 'Full Impact' : 'Partial Impact'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {unav.status === 'draft' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUnavailability(unav.id, { status: 'approved' })}
                              className="border-green-600 text-green-400 hover:bg-green-600/20"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteUnavailability(unav.id)}
                              className="border-red-600 text-red-400 hover:bg-red-600/20"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {unav.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUnavailability(unav.id, { status: 'cancelled' })}
                            className="border-red-600 text-red-400 hover:bg-red-600/20"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
