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
    todayProduction: mockProductionConfirmations.reduce((sum, p) => sum + p.goodQuantity, 0),
    rejectionRate: (mockProductionConfirmations.reduce((sum, p) => sum + p.defectiveQuantity, 0) / 
      mockProductionConfirmations.reduce((sum, p) => sum + p.plannedQuantity, 0) * 100).toFixed(2),
    avgCycleTime: (mockProductionConfirmations.reduce((sum, p) => sum + p.actualCycleTime, 0) / 
      mockProductionConfirmations.length).toFixed(1),
    totalDowntime: mockDowntimeReports.reduce((sum, d) => sum + d.duration, 0),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shop Floor Feedback</h1>
          <p className="text-muted-foreground text-sm">
            Production confirmation, downtime reporting, and variance analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setIsDowntimeDialogOpen(true)}
          >
            <AlertTriangle className="w-4 h-4" />
            Report Downtime
          </Button>
          <Button 
            size="sm" 
            className="gap-2"
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
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="confirmation" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">Production Confirmation</span>
          </TabsTrigger>
          <TabsTrigger value="downtime" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Downtime Reports</span>
          </TabsTrigger>
          <TabsTrigger value="variance" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Variance Analysis</span>
          </TabsTrigger>
        </TabsList>

        {/* Production Confirmation Tab */}
        <TabsContent value="confirmation" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Recent Confirmations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead>Planned</TableHead>
                      <TableHead>Good</TableHead>
                      <TableHead>Defective</TableHead>
                      <TableHead>Rejection %</TableHead>
                      <TableHead>Cycle Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockProductionConfirmations.map((conf) => {
                      const rejectionRate = (conf.defectiveQuantity / conf.plannedQuantity * 100).toFixed(1);
                      
                      return (
                        <TableRow key={conf.id}>
                          <TableCell>
                            {new Date(conf.confirmedAt).toLocaleTimeString('en-IN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </TableCell>
                          <TableCell>{conf.confirmedBy}</TableCell>
                          <TableCell>{conf.plannedQuantity}</TableCell>
                          <TableCell className="text-bf-green font-medium">{conf.goodQuantity}</TableCell>
                          <TableCell className="text-bf-red">{conf.defectiveQuantity}</TableCell>
                          <TableCell>
                            <span className={cn(
                              parseFloat(rejectionRate) > 3 ? 'text-bf-red' : 'text-bf-green'
                            )}>
                              {rejectionRate}%
                            </span>
                          </TableCell>
                          <TableCell>{conf.actualCycleTime}s</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={cn(
                                conf.status === 'approved' && "bg-bf-green/10 text-bf-green",
                                conf.status === 'submitted' && "bg-bf-amber/10 text-bf-amber",
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Downtime Reports</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                  <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDowntimeReports.map((dt) => (
                      <TableRow key={dt.id}>
                        <TableCell>
                          {new Date(dt.startTime).toLocaleTimeString('en-IN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </TableCell>
                        <TableCell>{dt.reportedBy}</TableCell>
                        <TableCell>{dt.reason}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={cn(
                              dt.category === 'planned' && "bg-bf-blue/10 text-bf-blue",
                              dt.category === 'unplanned' && "bg-bf-red/10 text-bf-red",
                            )}
                          >
                            {dt.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{dt.duration} min</TableCell>
                        <TableCell className="max-w-[200px] truncate">{dt.notes}</TableCell>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Plan vs Actual</CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Suggestions</CardTitle>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Production Confirmation</DialogTitle>
            <DialogDescription>
              Enter production details for the completed job
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Production Order</label>
                <Input placeholder="Select order..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Line</label>
                <Input placeholder="Select line..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Good Quantity</label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Defective Quantity</label>
                <Input type="number" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Shots Completed</label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Actual Cycle Time (sec)</label>
                <Input type="number" placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Input placeholder="Any observations..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmationDialogOpen(false)}>
              Cancel
            </Button>
            <Button>Submit Confirmation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Downtime Report Dialog */}
      <Dialog open={isDowntimeDialogOpen} onOpenChange={setIsDowntimeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Downtime</DialogTitle>
            <DialogDescription>
              Record unplanned or planned downtime event
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Line</label>
                <Input placeholder="Select line..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select className="w-full p-2 border rounded-md text-sm">
                  <option>Planned</option>
                  <option>Unplanned</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Input placeholder="e.g., Die Changeover, Maintenance..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <Input type="datetime-local" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (min)</label>
                <Input type="number" placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Input placeholder="Additional details..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDowntimeDialogOpen(false)}>
              Cancel
            </Button>
            <Button>Submit Report</Button>
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
  color = 'text-foreground',
  alert = false 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ElementType;
  color?: string;
  alert?: boolean;
}) {
  return (
    <Card className={cn(alert && "border-bf-red")}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={cn("text-xl font-bold", color)}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
          <div className={cn("p-2 rounded-lg bg-muted", color)}>
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
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">
          Planned: {planned} {unit}
        </p>
      </div>
      <div className="text-right">
        <p className="font-medium">{actual} {unit}</p>
        <p className={cn(
          "text-xs",
          isPositive ? 'text-bf-green' : 'text-bf-red'
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
    High: 'border-bf-red bg-bf-red/5',
    Medium: 'border-bf-amber bg-bf-amber/5',
    Low: 'border-bf-blue bg-bf-blue/5',
  };
  
  const Icon = icons[type];
  
  return (
    <div className={cn("flex items-start gap-3 p-3 rounded-lg border", colors[impact])}>
      <Icon className="w-5 h-5 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm">{message}</p>
        <Badge variant="outline" className="mt-2 text-[10px]">
          Impact: {impact}
        </Badge>
      </div>
    </div>
  );
}
