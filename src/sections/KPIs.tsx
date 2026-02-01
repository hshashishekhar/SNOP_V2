import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Download,
  Printer,
  BarChart3,
  Factory,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// KPI Data
const kpiData = [
  {
    title: 'Order Fulfillment (OTIF)',
    value: '97.8',
    unit: '%',
    target: '98%',
    trend: 'up',
    trendValue: '+1.2%',
    progress: 97.8,
    variant: 'green',
  },
  {
    title: 'Revenue',
    value: '1247.5',
    unit: 'Cr',
    trend: 'up',
    trendValue: '+8.3%',
    variant: 'green',
  },
  {
    title: 'Profit',
    value: '186.2',
    unit: 'Cr',
    trend: 'up',
    trendValue: '+12.5%',
    variant: 'green',
  },
  {
    title: 'Capacity Utilization',
    value: '84.3',
    unit: '%',
    target: '85%',
    trend: 'down',
    trendValue: '+2.1%',
    progress: 84.3,
    variant: 'yellow',
  },
];

// Line Utilization Data
const lineUtilizationData = [
  { line: 'F-01', forging: 92, machining: 88 },
  { line: 'F-02', forging: 85, machining: 82 },
  { line: 'F-03', forging: 95, machining: 91 },
  { line: 'HT-01', forging: 0, machining: 82 },
  { line: 'M-01', forging: 0, machining: 89 },
  { line: 'M-02', forging: 0, machining: 81 },
];

export function KPIs() {
  const [timeRange, setTimeRange] = useState('this-week');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-slate-200">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="last-week">Last Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <Card
            key={kpi.title}
            className={cn(
              'bg-slate-800/50 border-slate-700',
              kpi.variant === 'green' && 'border-t-4 border-t-green-500',
              kpi.variant === 'yellow' && 'border-t-4 border-t-yellow-500',
              kpi.variant === 'red' && 'border-t-4 border-t-red-500'
            )}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{kpi.title}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">{kpi.value}</span>
                    <span className="text-sm text-slate-400">{kpi.unit}</span>
                  </div>
                  {kpi.target && (
                    <p className="text-xs text-slate-500 mt-1">Target: {kpi.target}</p>
                  )}
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-sm',
                  kpi.trend === 'up' ? 'text-green-400' : 'text-red-400'
                )}>
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{kpi.trendValue}</span>
                </div>
              </div>
              {kpi.progress && (
                <div className="mt-3">
                  <Progress
                    value={kpi.progress}
                    className="h-1.5 bg-slate-700"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-semibold text-white">Revenue Trend</CardTitle>
            </div>
            <p className="text-xs text-slate-500">Last 6 months</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => {
                const actual = 1000 + index * 50 + Math.random() * 100;
                const target = 1050 + index * 40;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center gap-1" style={{ height: '200px' }}>
                      {/* Target line */}
                      <div
                        className="w-2 bg-slate-600 rounded-t"
                        style={{ height: `${(target / 1400) * 100}%` }}
                      />
                      {/* Actual bar */}
                      <div
                        className="w-6 bg-blue-500 rounded-t"
                        style={{ height: `${(actual / 1400) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{month}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-xs text-slate-400">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-slate-600" />
                <span className="text-xs text-slate-400">Target</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Utilization */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Factory className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-semibold text-white">Line Utilization</CardTitle>
            </div>
            <p className="text-xs text-slate-500">Current Week</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-4">
              {lineUtilizationData.map((line) => (
                <div key={line.line} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1" style={{ height: '200px' }}>
                    {line.forging > 0 && (
                      <div
                        className="w-6 bg-orange-500 rounded-t"
                        style={{ height: `${line.forging}%` }}
                      />
                    )}
                    {line.machining > 0 && (
                      <div
                        className="w-6 bg-cyan-500 rounded-t"
                        style={{ height: `${line.machining}%` }}
                      />
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{line.line}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500" />
                <span className="text-xs text-slate-400">Forging</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-cyan-500" />
                <span className="text-xs text-slate-400">Machining</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-slate-300">On-Time Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">94.5%</p>
                <p className="text-xs text-green-400 mt-1">+2.3% vs last month</p>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center">
                <span className="text-sm font-bold text-green-400">A</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-slate-300">Quality Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">99.2%</p>
                <p className="text-xs text-green-400 mt-1">+0.5% vs last month</p>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center">
                <span className="text-sm font-bold text-green-400">A+</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-slate-300">Safety Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">0</p>
                <p className="text-xs text-green-400 mt-1">No incidents this month</p>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center">
                <span className="text-sm font-bold text-green-400">A+</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
