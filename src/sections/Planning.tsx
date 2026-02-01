import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Hierarchy Tree Component - Removed from Planning page
interface HierarchyItem {
  id: string;
  name: string;
  type: 'corporate' | 'division' | 'plant' | 'line';
  children?: HierarchyItem[];
  utilization?: number;
  status?: 'active' | 'inactive';
}

const hierarchyData: HierarchyItem[] = [
  {
    id: '1',
    name: 'BFL Corporate',
    type: 'corporate',
    children: [
      {
        id: '2',
        name: 'Forging & Machining Division',
        type: 'division',
        children: [
          {
            id: '3',
            name: 'Pune Plant',
            type: 'plant',
            status: 'active',
            children: [
              { id: '4', name: 'Forging Line 01', type: 'line', utilization: 88 },
              { id: '5', name: 'Forging Line 02', type: 'line', utilization: 82 },
              { id: '6', name: 'Forging Line 03', type: 'line', utilization: 91 },
              { id: '7', name: 'Heat Treatment 01', type: 'line', utilization: 79 },
              { id: '8', name: 'Machining Line 01', type: 'line', utilization: 85 },
              { id: '9', name: 'Machining Line 02', type: 'line', utilization: 78 },
            ],
          },
          {
            id: '10',
            name: 'Chakan Plant',
            type: 'plant',
            status: 'active',
            children: [],
          },
        ],
      },
    ],
  },
];

function HierarchyTree({ item, level = 0 }: { item: HierarchyItem; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = item.children && item.children.length > 0;

  const getIcon = (type: string) => {
    switch (type) {
      case 'corporate':
        return <Building2 className="w-4 h-4 text-blue-400" />;
      case 'division':
        return <Factory className="w-4 h-4 text-blue-400" />;
      case 'plant':
        return <Factory className="w-4 h-4 text-blue-400" />;
      case 'line':
        return <Settings className="w-4 h-4 text-slate-400" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <button
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
          level === 0 ? 'bg-blue-500/10' : 'hover:bg-slate-800/50'
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {hasChildren && (
          <ChevronDown
            className={cn(
              'w-4 h-4 text-slate-500 transition-transform',
              !isExpanded && '-rotate-90'
            )}
          />
        )}
        {!hasChildren && <div className="w-4" />}
        {getIcon(item.type)}
        <span className={cn(
          'text-sm flex-1 text-left',
          item.type === 'corporate' ? 'text-blue-400 font-medium' : 'text-slate-300'
        )}>
          {item.name}
        </span>
        {item.utilization && (
          <span className="text-xs text-slate-500">{item.utilization}%</span>
        )}
        {item.status === 'active' && (
          <div className="w-2 h-2 rounded-full bg-green-500" />
        )}
      </button>
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {item.children!.map((child) => (
            <HierarchyTree key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// Planning Horizon Types
const planningHorizons = [
  { id: 'aop', name: 'AOP', period: '4 Years', active: false },
  { id: 'snop', name: 'SNOP', period: '13 Weeks', active: true },
  { id: 'mps', name: 'MPS', period: '4 Weeks', active: false },
  { id: 'execution', name: 'Execution', period: '48 Hours', active: false },
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

export function Planning() {
  const [selectedHorizon, setSelectedHorizon] = useState('snop');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Planning Horizon */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-semibold text-white">Planning Horizon</CardTitle>
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
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                  )}
                >
                  <div className="text-sm font-medium">{horizon.name}</div>
                  <div className="text-xs opacity-80">{horizon.period}</div>
                </button>
              ))}
            </div>

            {/* Week Selector */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Week 1-13"
                  className="pl-10 bg-slate-700/50 border-slate-600 text-slate-200"
                />
              </div>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

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
          {/* Shift Legend */}
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

          {/* Schedule Table */}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
        </CardContent>
      </Card>
    </div>
  );
}
