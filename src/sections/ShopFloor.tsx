import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Factory,
  TrendingUp,
  TrendingDown,
  Plus,
  RefreshCw,
  BarChart3,
  FileText,
  User,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data
const mockProductionConfirmations = [
  {
    id: 'conf-1',
    scheduleId: 'sched-1',
    lineId: 'line-1',
    dieId: 'die-1',
    partId: 'part-1',
    confirmedBy: 'Operator A',
    confirmedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    plannedQuantity: 500,
    goodQuantity: 485,
    defectiveQuantity: 12,
    reworkQuantity: 3,
    shotsCompleted: 520,
    actualCycleTime: 28.5,
    downtimeMinutes: 15,
    status: 'submitted',
  },
  {
    id: 'conf-2',
    scheduleId: 'sched-2',
    lineId: 'line-2',
    dieId: 'die-2',
    partId: 'part-2',
    confirmedBy: 'Operator B',
    confirmedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    plannedQuantity: 800,
    goodQuantity: 792,
    defectiveQuantity: 6,
    reworkQuantity: 2,
    shotsCompleted: 810,
    actualCycleTime: 32.1,
    downtimeMinutes: 0,
    status: 'approved',
  },
];

const mockDowntimeReports = [
  {
    id: 'dt-1',
    lineId: 'line-1',
    reportedBy: 'Operator A',
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2.75 * 60 * 60 * 1000).toISOString(),
    duration: 15,
    reason: 'Die Changeover',
    category: 'planned',
    notes: 'Standard changeover between jobs',
  },
  {
    id: 'dt-2',
    lineId: 'line-2',
    reportedBy: 'Operator B',
    startTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
    duration: 30,
    reason: 'Hydraulic Pressure Issue',
    category: 'unplanned',
    notes: 'Maintenance team resolved the issue',
  },
];

export function ShopFloor() {
  const [activeTab, setActiveTab] = useState('confirmation');
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [isDowntimeDialogOpen, setIsDowntimeDialogOpen] = useState(false);

  // Calculate stats
  const stats = {
    todayProduction: mockProductionConfirmations.reduce((sum: number, p) => sum + p.goodQuantity, 0),
    rejectionRate: (mockProductionConfirmations.reduce((sum: number, p) => sum + p.defectiveQuantity, 0) /
      mockProductionConfirmations.reduce((sum: number, p) => sum + p.plannedQuantity, 0) * 100).toFixed(2),
    avgCycleTime: (mockProductionConfirmations.reduce((sum: number, p) => sum + p.actualCycleTime, 0) /
      mockProductionConfirmations.length).toFixed(1),
    totalDowntime: mockDowntimeReports.reduce((sum: number, d) => sum + d.duration, 0),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Shop Floor Feedback</h1>
          <p className="text-slate-400 text-sm">
            Production confirmation, downtime reporting, and variance analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            size="sm" 
            className="gap-2 bg-bf-orange hover:bg-bf-orange-light"
            onClick={() => setIsDowntimeDialogOpen(true)}
          >
            <AlertTriangle className="w-4 h-4" />
            Report Downtime
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="gap-2 bg-bf-blue hover:bg-bf-blue/90"
            onClick={() => setIsConfirmationDialogOpen(true)}
          >
            <CheckCircle2 className="w-4 h-4" />
            Production Confirmation
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard 
          label="Today's Production" 
          value={stats.todayProduction.toLocaleString()} 
          icon={Factory} 
          color="text-bf-green"
        />
        <StatCard 
          label="Rejection Rate" 
          value={`${stats.rejectionRate}%`} 
          icon={TrendingDown} 
          color={parseFloat(stats.rejectionRate) > 3 ? 'text-bf-red' : 'text-bf-green'}
          alert={parseFloat(stats.rejectionRate) > 3}
        />
        <StatCard 
          label="Avg Cycle Time" 
          value={`${stats.avgCycleTime}s`} 
          icon={Clock} 
          color="text-bf-blue"
        />
        <StatCard 
          label="Total Downtime" 
          value={`${stats.totalDowntime} min`} 
          icon={AlertTriangle} 
          color="text-bf-orange"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="confirmation" className="gap-2 text-slate-300 data-[state=active]:bg-bf-blue data-[state=active]:text-white hover:text-white">
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">Production Confirmation</span>
          </TabsTrigger>
          <TabsTrigger value="downtime" className="gap-2 text-slate-300 data-[state=active]:bg-bf-orange data-[state=active]:text-white hover:text-white">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Downtime Reports</span>
          </TabsTrigger>
          <TabsTrigger value="variance" className="gap-2 text-slate-300 data-[state=active]:bg-bf-green data-[state=active]:text-white hover:text-white">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Variance Analysis</span>
          </TabsTrigger>
        </TabsList>

        {/* Production Confirmation Tab */}
        <TabsContent value="confirmation" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-100">Recent Confirmations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-800/50">
                      <TableHead className="text-slate-300">Time</TableHead>
                      <TableHead className="text-slate-300">Operator</TableHead>
                      <TableHead className="text-slate-300">Planned</TableHead>
                      <TableHead className="text-slate-300">Good</TableHead>
                      <TableHead className="text-slate-300">Defective</TableHead>
                      <TableHead className="text-slate-300">Rejection %</TableHead>
                      <TableHead className="text-slate-300">Cycle Time</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockProductionConfirmations.map((conf) => {
                      const rejectionRate = (conf.defectiveQuantity / conf.plannedQuantity * 100).toFixed(1);
                      
                      return (
                        <TableRow key={conf.id} className="border-slate-700 hover:bg-slate-800/50">
                          <TableCell className="text-slate-300">
                            {new Date(conf.confirmedAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell className="text-slate-300">{conf.confirmedBy}</TableCell>
                          <TableCell className="text-slate-300">{conf.plannedQuantity}</TableCell>
                          <TableCell className="text-green-400 font-medium">{conf.goodQuantity}</TableCell>
                          <TableCell className="text-red-400">{conf.defectiveQuantity}</TableCell>
                          <TableCell>
                            <span className={cn(
                              parseFloat(rejectionRate) > 3 ? 'text-red-400' : 'text-green-400'
                            )}>
                              {rejectionRate}%
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-300">{conf.actualCycleTime}s</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                conf.status === 'approved' && "bg-green-500/20 text-green-400 border-green-500/50",
                                conf.status === 'submitted' && "bg-amber-500/20 text-amber-400 border-amber-500/50",
                              )}
                            >
                              {conf.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Downtime Reports Tab */}
        <TabsContent value="downtime" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-100">Downtime Reports</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-800/50">
                      <TableHead className="text-slate-300">Time</TableHead>
                      <TableHead className="text-slate-300">Reported By</TableHead>
                      <TableHead className="text-slate-300">Reason</TableHead>
                      <TableHead className="text-slate-300">Category</TableHead>
                      <TableHead className="text-slate-300">Duration</TableHead>
                      <TableHead className="text-slate-300">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDowntimeReports.map((dt) => (
                      <TableRow key={dt.id} className="border-slate-700 hover:bg-slate-800/50">
                        <TableCell className="text-slate-300">
                          {new Date(dt.startTime).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell className="text-slate-300">{dt.reportedBy}</TableCell>
                        <TableCell className="text-slate-300">{dt.reason}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              dt.category === 'planned' && "bg-blue-500/20 text-blue-400 border-blue-500/50",
                              dt.category === 'unplanned' && "bg-red-500/20 text-red-400 border-red-500/50",
                            )}
                          >
                            {dt.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">{dt.duration} min</TableCell>
                        <TableCell className="max-w-[200px] truncate text-slate-400">{dt.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variance Analysis Tab */}
        <TabsContent value="variance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-100">Plan vs Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <VarianceItem 
                    label="Production Quantity"
                    planned={5000}
                    actual={4850}
                    unit="pcs"
                  />
                  <VarianceItem 
                    label="Cycle Time"
                    planned={30}
                    actual={28.5}
                    unit="sec"
                    inverse
                  />
                  <VarianceItem 
                    label="Yield Rate"
                    planned={95}
                    actual={94.2}
                    unit="%"
                  />
                  <VarianceItem 
                    label="Downtime"
                    planned={60}
                    actual={45}
                    unit="min"
                    inverse
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-100">Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <SuggestionCard 
                    type="yield"
                    message="Yield rate below target. Check die condition on Line 1."
                    impact="High"
                  />
                  <SuggestionCard 
                    type="cycle"
                    message="Cycle time improved by 5%. Consider updating standard."
                    impact="Medium"
                  />
                  <SuggestionCard 
                    type="scrap"
                    message="Scrap factor trending up for Material RM-42CrMo4."
                    impact="Low"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Production Confirmation Dialog */}
      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <DialogContent className="max-w-lg bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Production Confirmation</DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter production details for the completed job
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Production Order</label>
                <Input placeholder="Select order..." className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Line</label>
                <Input placeholder="Select line..." className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Good Quantity</label>
                <Input type="number" placeholder="0" className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Defective Quantity</label>
                <Input type="number" placeholder="0" className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Shots Completed</label>
                <Input type="number" placeholder="0" className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Actual Cycle Time (sec)</label>
                <Input type="number" placeholder="0" className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Notes</label>
              <Input placeholder="Any observations..." className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmationDialogOpen(false)} className="border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100">
              Cancel
            </Button>
            <Button className="bg-bf-blue hover:bg-bf-blue/90">Submit Confirmation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Downtime Report Dialog */}
      <Dialog open={isDowntimeDialogOpen} onOpenChange={setIsDowntimeDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Report Downtime</DialogTitle>
            <DialogDescription className="text-slate-400">
              Record unplanned or planned downtime event
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Line</label>
                <Input placeholder="Select line..." className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Category</label>
                <select className="w-full p-2 border rounded-md text-sm bg-slate-700 border-slate-600 text-slate-200">
                  <option>Planned</option>
                  <option>Unplanned</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Reason</label>
              <Input placeholder="e.g., Die Changeover, Maintenance..." className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Start Time</label>
                <Input type="datetime-local" className="bg-slate-700 border-slate-600 text-slate-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Duration (min)</label>
                <Input type="number" placeholder="0" className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Notes</label>
              <Input placeholder="Additional details..." className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDowntimeDialogOpen(false)} className="border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100">
              Cancel
            </Button>
            <Button className="bg-bf-orange hover:bg-bf-orange-light">Submit Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper Components
function StatCard({
  label,
  value,
  icon: Icon,
  color = 'text-slate-200',
  alert = false
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  alert?: boolean;
}) {
  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", alert && "border-red-500")}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={cn("text-xl font-bold", color)}>{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
          <div className={cn("p-2 rounded-lg bg-slate-700/50", color)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VarianceItem({
  label,
  planned,
  actual,
  unit,
  inverse = false
}: {
  label: string;
  planned: number;
  actual: number;
  unit: string;
  inverse?: boolean;
}) {
  const variance = ((actual - planned) / planned) * 100;
  const isPositive = inverse ? variance < 0 : variance > 0;

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
      <div>
        <p className="font-medium text-sm text-slate-200">{label}</p>
        <p className="text-xs text-slate-400">
          Planned: {planned} {unit}
        </p>
      </div>
      <div className="text-right">
        <p className="font-medium text-slate-200">{actual} {unit}</p>
        <p className={cn(
          "text-xs",
          isPositive ? 'text-green-400' : 'text-red-400'
        )}>
          {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}

function SuggestionCard({
  type,
  message,
  impact
}: {
  type: 'yield' | 'cycle' | 'scrap';
  message: string;
  impact: 'High' | 'Medium' | 'Low';
}) {
  const icons = {
    yield: TrendingUp,
    cycle: Clock,
    scrap: AlertTriangle,
  };

  const colors = {
    High: 'border-red-500/50 bg-red-500/10',
    Medium: 'border-amber-500/50 bg-amber-500/10',
    Low: 'border-blue-500/50 bg-blue-500/10',
  };

  const Icon = icons[type];

  return (
    <div className={cn("flex items-start gap-3 p-3 rounded-lg border", colors[impact])}>
      <Icon className="w-5 h-5 mt-0.5 text-slate-300" />
      <div className="flex-1">
        <p className="text-sm text-slate-200">{message}</p>
        <Badge variant="outline" className="mt-2 text-[10px] border-slate-600 text-slate-400">
          Impact: {impact}
        </Badge>
      </div>
    </div>
  );
}
