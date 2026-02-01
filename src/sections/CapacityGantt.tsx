import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GanttChart,
  Search,
  ZoomIn,
  ZoomOut,
  Move,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Job Types
const jobTypes = [
  { id: 'runner', name: 'Runner', color: 'bg-green-500', textColor: 'text-green-400' },
  { id: 'repeater', name: 'Repeater', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  { id: 'stranger', name: 'Stranger', color: 'bg-red-500', textColor: 'text-red-400' },
  { id: 'npd', name: 'NPD', color: 'bg-blue-500', textColor: 'text-blue-400' },
];

// Gantt Data
const ganttData = [
  {
    line: 'F-01',
    utilization: 68,
    jobs: [
      { id: 'FD-8278', quantity: 933, type: 'runner', start: 0, duration: 2, color: 'bg-green-500' },
      { id: 'FD-8330', quantity: 1890, type: 'stranger', start: 2, duration: 3, color: 'bg-red-500' },
      { id: 'FD-8001', quantity: 1180, type: 'runner', start: 6, duration: 2, color: 'bg-green-500' },
      { id: 'FD-8612', quantity: 1922, type: 'stranger', start: 9, duration: 2, color: 'bg-red-500' },
      { id: 'FD-8474', quantity: 1135, type: 'stranger', start: 12, duration: 2, color: 'bg-red-500' },
    ],
  },
  {
    line: 'F-02',
    utilization: 80,
    jobs: [
      { id: 'FD-8390', quantity: 830, type: 'stranger', start: 0, duration: 2, color: 'bg-red-500' },
      { id: 'FD-8077', quantity: 1245, type: 'stranger', start: 2, duration: 3, color: 'bg-red-500' },
      { id: 'FD-8411', quantity: 1794, type: 'runner', start: 6, duration: 2, color: 'bg-green-500' },
      { id: 'FD-8090', quantity: 559, type: 'stranger', start: 9, duration: 2, color: 'bg-red-500' },
      { id: 'FD-8...', quantity: 7, type: 'runner', start: 12, duration: 1, color: 'bg-green-500' },
    ],
  },
  {
    line: 'F-03',
    utilization: 70,
    jobs: [
      { id: 'FD-7844', quantity: 1779, type: 'stranger', start: 0, duration: 3, color: 'bg-red-500' },
      { id: 'F...', quantity: 1, type: 'npd', start: 3, duration: 1, color: 'bg-blue-500', small: true },
      { id: 'FD-8710', quantity: 758, type: 'runner', start: 4, duration: 3, color: 'bg-green-500' },
      { id: 'F...', quantity: 8, type: 'npd', start: 8, duration: 1, color: 'bg-blue-500', small: true },
      { id: 'FD-8762', quantity: 1317, type: 'runner', start: 9, duration: 4, color: 'bg-green-500' },
    ],
  },
  {
    line: 'HT-01',
    utilization: 73,
    jobs: [
      { id: 'FD-8208', quantity: 508, type: 'repeater', start: 0, duration: 3, color: 'bg-yellow-500' },
      { id: 'F...', quantity: 8, type: 'stranger', start: 3, duration: 1, color: 'bg-red-500', small: true },
      { id: 'FD-8841', quantity: 1397, type: 'runner', start: 4, duration: 3, color: 'bg-green-500' },
      { id: 'FD-7964', quantity: 859, type: 'repeater', start: 8, duration: 3, color: 'bg-yellow-500' },
      { id: 'FD-8212', quantity: 541, type: 'npd', start: 12, duration: 2, color: 'bg-blue-500' },
      { id: 'F...', quantity: 6, type: 'npd', start: 15, duration: 1, color: 'bg-blue-500', small: true },
    ],
  },
  {
    line: 'M-01',
    utilization: 87,
    jobs: [
      { id: 'FD-80...', quantity: 1056, type: 'stranger', start: 0, duration: 2, color: 'bg-red-500' },
      { id: 'FD-8381', quantity: 1378, type: 'stranger', start: 2, duration: 2, color: 'bg-red-500' },
      { id: 'FD-8086', quantity: 1209, type: 'stranger', start: 5, duration: 2, color: 'bg-red-500' },
      { id: 'F...', quantity: 1, type: 'stranger', start: 8, duration: 1, color: 'bg-red-500', small: true },
      { id: 'FD-7887', quantity: 1808, type: 'repeater', start: 9, duration: 2, color: 'bg-yellow-500' },
      { id: 'FD-8270', quantity: 1344, type: 'npd', start: 12, duration: 2, color: 'bg-blue-500' },
      { id: 'FD-8081', quantity: 1170, type: 'repeater', start: 15, duration: 2, color: 'bg-yellow-500' },
      { id: 'F...', quantity: 1, type: 'repeater', start: 18, duration: 1, color: 'bg-yellow-500', small: true },
    ],
  },
  {
    line: 'M-02',
    utilization: 78,
    jobs: [
      { id: 'FD-7994', quantity: 1371, type: 'runner', start: 0, duration: 3, color: 'bg-green-500' },
      { id: 'FD-8528', quantity: 1375, type: 'repeater', start: 4, duration: 3, color: 'bg-yellow-500' },
      { id: 'FD-8798', quantity: 1161, type: 'runner', start: 8, duration: 3, color: 'bg-green-500' },
      { id: 'FD-8787', quantity: 913, type: 'npd', start: 12, duration: 3, color: 'bg-blue-500' },
      { id: 'FD-80...', quantity: 1778, type: 'npd', start: 16, duration: 2, color: 'bg-blue-500' },
    ],
  },
];

// Time slots (representing days)
const timeSlots = ['Feb 1', 'Feb 1', 'Feb 1', 'Feb 1', 'Feb 2', 'Feb 2', 'Feb 2', 'Feb 2', 'Feb 2', 'Feb 3', 'Feb 3'];

export function CapacityGantt() {
  const [zoomLevel, setZoomLevel] = useState(1);

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 85) return 'text-green-400';
    if (utilization >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GanttChart className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-semibold text-white">Capacity Planning Gantt</CardTitle>
              <Badge className="bg-slate-700 text-slate-300">38 jobs</Badge>
            </div>
            <div className="flex items-center gap-3">
              <Select defaultValue="all">
                <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600 text-slate-200">
                  <SelectValue placeholder="All Lines" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Lines</SelectItem>
                  <SelectItem value="forging">Forging</SelectItem>
                  <SelectItem value="ht">Heat Treatment</SelectItem>
                  <SelectItem value="machining">Machining</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Search..."
                  className="w-48 pl-10 bg-slate-700/50 border-slate-600 text-slate-200"
                />
              </div>
              <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-white"
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-slate-400 px-2">{zoomLevel}x</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-white"
                  onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Gantt Chart */}
      <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Timeline Header */}
              <div className="flex border-b border-slate-700">
                <div className="w-24 p-3 text-sm font-medium text-slate-400 sticky left-0 bg-slate-800/50 z-10">
                  Line
                </div>
                <div className="flex-1 flex">
                  {timeSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="flex-1 p-3 text-xs text-center text-slate-400 border-l border-slate-700/50"
                      style={{ minWidth: `${60 * zoomLevel}px` }}
                    >
                      {slot}
                    </div>
                  ))}
                </div>
                <div className="w-16 p-3 text-xs text-right text-slate-400 border-l border-slate-700/50">
                  Util
                </div>
              </div>

              {/* Gantt Rows */}
              {ganttData.map((row) => (
                <div key={row.line} className="flex border-b border-slate-700/50 hover:bg-slate-800/30">
                  {/* Line Label */}
                  <div className="w-24 p-3 sticky left-0 bg-slate-800/50 z-10">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-white">{row.line}</p>
                        <p className={cn('text-xs', getUtilizationColor(row.utilization))}>
                          {row.utilization}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Job Bars */}
                  <div className="flex-1 relative" style={{ height: '60px' }}>
                    {row.jobs.map((job, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'absolute top-2 h-10 rounded-md flex flex-col justify-center px-2 cursor-pointer hover:brightness-110 transition-all',
                          job.color,
                          job.small ? 'text-xs' : 'text-xs'
                        )}
                        style={{
                          left: `${(job.start / timeSlots.length) * 100}%`,
                          width: `${(job.duration / timeSlots.length) * 100}%`,
                          minWidth: job.small ? '20px' : '60px',
                        }}
                        title={`${job.id}: ${job.quantity} units`}
                      >
                        {!job.small && (
                          <>
                            <span className="font-medium text-white truncate">{job.id}</span>
                            <span className="text-white/80 text-xs">{job.quantity}</span>
                          </>
                        )}
                        {job.small && (
                          <span className="font-medium text-white text-center">{job.id}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Utilization Indicator */}
                  <div className="w-16 p-3 flex items-center justify-end border-l border-slate-700/50">
                    <div className="text-right">
                      <div className={cn('text-xs font-medium', getUtilizationColor(row.utilization))}>
                        {row.utilization}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-sm text-slate-400">Job Types:</span>
          {jobTypes.map((type) => (
            <div key={type.id} className="flex items-center gap-2">
              <div className={cn('w-4 h-4 rounded', type.color)} />
              <span className={cn('text-sm', type.textColor)}>{type.name}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Move className="w-4 h-4" />
          <span>Drag to reschedule</span>
        </div>
      </div>
    </div>
  );
}
