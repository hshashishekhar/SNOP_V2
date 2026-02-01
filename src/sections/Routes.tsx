import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Route,
  Factory,
  Flame,
  Settings,
  Package,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Manufacturing Routes Data
const manufacturingRoutes = [
  {
    id: 'path-a',
    name: 'Path A: Forging → HT → Dispatch',
    stages: 2,
    steps: [
      {
        id: 'forging',
        name: 'Forging',
        status: 'operational',
        wip: 12500,
        utilization: 88,
        icon: Factory,
      },
      {
        id: 'ht',
        name: 'Heat Treatment',
        status: 'constrained',
        wip: 8900,
        utilization: 79,
        icon: Flame,
        isConstraint: true,
      },
      {
        id: 'dispatch',
        name: 'Dispatch',
        status: 'operational',
        icon: Package,
      },
    ],
  },
  {
    id: 'path-b',
    name: 'Path B: Forging → HT → Machining → Dispatch',
    stages: 3,
    steps: [
      {
        id: 'forging',
        name: 'Forging',
        status: 'operational',
        wip: 12500,
        utilization: 88,
        icon: Factory,
      },
      {
        id: 'ht',
        name: 'Heat Treatment',
        status: 'constrained',
        wip: 8900,
        utilization: 79,
        icon: Flame,
        isConstraint: true,
      },
      {
        id: 'machining',
        name: 'Machining',
        status: 'operational',
        wip: 4200,
        utilization: 85,
        icon: Settings,
      },
      {
        id: 'dispatch',
        name: 'Dispatch',
        status: 'operational',
        icon: Package,
      },
    ],
  },
  {
    id: 'path-c',
    name: 'Path C: Forging → HT → Processing → Machining → Dispatch',
    stages: 4,
    steps: [
      {
        id: 'forging',
        name: 'Forging',
        status: 'operational',
        wip: 12500,
        utilization: 88,
        icon: Factory,
      },
      {
        id: 'ht',
        name: 'Heat Treatment',
        status: 'constrained',
        wip: 8900,
        utilization: 79,
        icon: Flame,
        isConstraint: true,
      },
      {
        id: 'processing',
        name: 'Processing',
        status: 'operational',
        wip: 5600,
        utilization: 72,
        icon: Settings,
      },
      {
        id: 'machining',
        name: 'Machining',
        status: 'operational',
        wip: 4200,
        utilization: 85,
        icon: Settings,
      },
      {
        id: 'dispatch',
        name: 'Dispatch',
        status: 'operational',
        icon: Package,
      },
    ],
  },
];

// Route Step Component
interface RouteStepProps {
  step: {
    id: string;
    name: string;
    status: string;
    wip?: number;
    utilization?: number;
    icon: React.ElementType;
    isConstraint?: boolean;
  };
  isLast: boolean;
}

function RouteStep({ step, isLast }: RouteStepProps) {
  const Icon = step.icon;
  
  return (
    <div className="flex items-center">
      <div
        className={cn(
          'relative p-4 rounded-xl min-w-[140px]',
          step.isConstraint
            ? 'bg-yellow-500/10 border-2 border-yellow-500/50'
            : 'bg-slate-800/50 border border-slate-700'
        )}
      >
        {/* Status Badge */}
        <div className="absolute -top-2 left-3">
          <Badge
            className={cn(
              'text-xs',
              step.status === 'operational'
                ? 'bg-blue-500 text-white'
                : 'bg-yellow-500 text-yellow-950'
            )}
          >
            {step.status}
          </Badge>
        </div>

        {/* Icon */}
        <div className="mt-2 mb-2">
          {step.isConstraint ? (
            <Flame className="w-6 h-6 text-yellow-500" />
          ) : (
            <Icon className={cn(
              'w-6 h-6',
              step.status === 'operational' ? 'text-green-400' : 'text-slate-400'
            )} />
          )}
        </div>

        {/* Name */}
        <h4 className="text-sm font-medium text-white">{step.name}</h4>

        {/* WIP & Utilization */}
        {step.wip !== undefined && (
          <div className="mt-2 space-y-1">
            <p className="text-xs text-slate-400">WIP: <span className="text-slate-300">{step.wip.toLocaleString()}</span></p>
            {step.utilization !== undefined && (
              <p className="text-xs text-slate-400">
                Util: <span className={cn(
                  step.utilization > 85 ? 'text-red-400' :
                  step.utilization > 70 ? 'text-yellow-400' : 'text-green-400'
                )}>{step.utilization}%</span>
              </p>
            )}
          </div>
        )}
      </div>

      {!isLast && (
        <div className="flex items-center px-2">
          <ArrowRight className="w-5 h-5 text-slate-600" />
        </div>
      )}
    </div>
  );
}

export function Routes() {
  const [backwardScheduling, setBackwardScheduling] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-semibold text-white">Manufacturing Routes</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">Backward Scheduling</span>
              <Switch
                checked={backwardScheduling}
                onCheckedChange={setBackwardScheduling}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Route Paths */}
      <div className="space-y-6">
        {manufacturingRoutes.map((route) => (
          <Card key={route.id} className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-white">{route.name}</CardTitle>
                <Badge className="bg-slate-700 text-slate-300">{route.stages} stages</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2">
                {route.steps.map((step, index) => (
                  <RouteStep
                    key={step.id}
                    step={step}
                    isLast={index === route.steps.length - 1}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Route Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Operational</p>
                <p className="text-xl font-semibold text-white">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Constrained</p>
                <p className="text-xl font-semibold text-white">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Factory className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total WIP</p>
                <p className="text-xl font-semibold text-white">45,600</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Route className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Active Routes</p>
                <p className="text-xl font-semibold text-white">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
