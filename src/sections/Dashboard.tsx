import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  AlertTriangle,
  Factory,
  Flame,
  Settings,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// KPI Card Component
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

// Heatmap Cell Component
interface HeatmapCellProps {
  value: number;
  label: string;
}

function HeatmapCell({ value, label }: HeatmapCellProps) {
  const getColor = (val: number) => {
    if (val >= 85) return 'bg-red-500/80 text-white';
    if (val >= 75) return 'bg-yellow-500/80 text-white';
    if (val >= 60) return 'bg-green-500/80 text-white';
    return 'bg-blue-500/80 text-white';
  };

  return (
    <div className={cn(
      'px-3 py-2 rounded-md text-center text-sm font-medium min-w-[60px]',
      getColor(value)
    )}>
      {value}%
    </div>
  );
}

// Plant Performance Heatmap Data
const plantData = [
  { plant: 'Pune', forging: 88, ht: 79, machining: 85, overall: 84 },
  { plant: 'Chakan', forging: 79, ht: 82, machining: 76, overall: 79 },
  { plant: 'Nasik', forging: 74, ht: 71, machining: 72, overall: 72 },
  { plant: 'Jejuri', forging: 68, ht: 65, machining: 64, overall: 66 },
  { plant: 'Bengaluru', forging: 62, ht: 58, machining: 55, overall: 58 },
];

export function Dashboard() {
  const [lastUpdated] = useState(new Date());

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
          trendValue="+2.1%"
          variant="yellow"
          showProgress
          progressValue={84.3}
        />
        <KPICard
          title="Die Utilization"
          value="78.5"
          unit="%"
          trend="up"
          trendValue="+3.2%"
          variant="green"
        />
        <KPICard
          title="Schedule Adherence"
          value="94.2"
          unit="%"
          trend="up"
          trendValue="+1.8%"
          variant="green"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plant Performance Heatmap */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Factory className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-base font-semibold text-white">Plant Performance Heatmap</CardTitle>
              </div>
              <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600">
                Real-time
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-4 text-sm font-medium text-slate-400">Plant</th>
                    <th className="pb-4 text-sm font-medium text-slate-400 text-center">Forging</th>
                    <th className="pb-4 text-sm font-medium text-slate-400 text-center">HT</th>
                    <th className="pb-4 text-sm font-medium text-slate-400 text-center">Machining</th>
                    <th className="pb-4 text-sm font-medium text-slate-400 text-center">Overall</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {plantData.map((row) => (
                    <tr key={row.plant} className="border-t border-slate-700/50">
                      <td className="py-3 text-sm font-medium text-white">{row.plant}</td>
                      <td className="py-3">
                        <div className="flex justify-center">
                          <HeatmapCell value={row.forging} label="Forging" />
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-center">
                          <HeatmapCell value={row.ht} label="HT" />
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-center">
                          <HeatmapCell value={row.machining} label="Machining" />
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-center">
                          <HeatmapCell value={row.overall} label="Overall" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500/80" />
                <span className="text-xs text-slate-400">{'<60%'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500/80" />
                <span className="text-xs text-slate-400">60-75%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-500/80" />
                <span className="text-xs text-slate-400">75-85%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500/80" />
                <span className="text-xs text-slate-400">{'>'}85%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Primary Constraint Alert */}
        <Card className="bg-gradient-to-br from-orange-950/30 to-red-950/30 border-orange-800/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <CardTitle className="text-base font-semibold text-orange-300">Primary Constraint Alert</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Forging Capacity</span>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/50">87% Utilized</Badge>
              </div>
              <Progress value={87} className="h-2 bg-slate-700" />
            </div>
            
            <p className="text-sm text-slate-300">
              Forging Line F-03 is the primary bottleneck. Recommend:
            </p>
            
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-slate-500">•</span>
                <span>Schedule overflow to F-01 and F-02</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-500">•</span>
                <span>Prioritize Runner dies for continuous operation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-500">•</span>
                <span>Defer non-critical Stranger jobs to next week</span>
              </li>
            </ul>

            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Updated</span>
                <span className="text-slate-300">{lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link to="/capacity-gantt" className="block">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer group h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Factory className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">View Capacity Plan</p>
                <p className="text-xs text-slate-400">Check line utilization</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/dies" className="block">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer group h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Manage Dies</p>
                <p className="text-xs text-slate-400">12 dies need attention</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/planning" className="block">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer group h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Run Optimization</p>
                <p className="text-xs text-slate-400">AI-powered scheduling</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-green-400 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/settings" className="block">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer group h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">System Settings</p>
                <p className="text-xs text-slate-400">Configure parameters</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
