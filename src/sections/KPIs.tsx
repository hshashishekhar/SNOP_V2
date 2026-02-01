import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Download,
  Printer,
  BarChart3,
  Factory,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// KPI Card Component matching Dashboard styling
interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  target?: string | number;
  trend?: 'up' | 'down';
  trendValue?: string;
  variant?: 'green' | 'yellow' | 'red' | 'blue';
  showProgress?: boolean;
  progressValue?: number;
  tooltip?: string;
}

function KPICard({
  title,
  value,
  unit,
  target,
  trend,
  trendValue,
  variant = 'green',
  showProgress,
  progressValue,
}: KPICardProps) {
  const variantStyles = {
    green: 'border-t-4 border-t-green-500',
    yellow: 'border-t-4 border-t-yellow-500',
    red: 'border-t-4 border-t-red-500',
    blue: 'border-t-4 border-t-blue-500',
  };

  return (
    <Card className={cn('bg-slate-800/50 border-slate-700', variantStyles[variant])}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">{value}</span>
              {unit && <span className="text-sm text-slate-400">{unit}</span>}
            </div>
            {target && (
              <p className="text-xs text-slate-500 mt-1">Target: {target}</p>
            )}
          </div>
          {trend && trendValue && (
            <div className={cn(
              'flex items-center gap-1 text-sm',
              trend === 'up' ? 'text-green-400' : 'text-red-400'
            )}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {showProgress && progressValue !== undefined && (
          <div className="mt-3">
            <Progress value={progressValue} className="h-1.5 bg-slate-700" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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
          <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-slate-200">
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
          <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* KPI Cards - Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Order Fulfillment (OTIF)"
          value="97.8"
          unit="%"
          target="98%"
          trend="up"
          trendValue="+1.2%"
          variant="green"
          showProgress
          progressValue={97.8}
        />
        <KPICard
          title="Revenue"
          value="1247.5"
          unit="Cr"
          trend="up"
          trendValue="+8.3%"
          variant="green"
        />
        <KPICard
          title="Profit"
          value="186.2"
          unit="Cr"
          trend="up"
          trendValue="+12.5%"
          variant="green"
        />
        <KPICard
          title="Capacity Utilization"
          value="84.3"
          unit="%"
          target="85%"
          trend="down"
          trendValue="-2.1%"
          variant="yellow"
          showProgress
          progressValue={84.3}
        />
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
        <KPICard
          title="On-Time Delivery"
          value="94.5"
          unit="%"
          trend="up"
          trendValue="+2.3%"
          variant="green"
        />
        <KPICard
          title="Quality Rate"
          value="99.2"
          unit="%"
          trend="up"
          trendValue="+0.5%"
          variant="green"
        />
        <KPICard
          title="Safety Incidents"
          value="0"
          variant="green"
        />
      </div>
    </div>
  );
}
