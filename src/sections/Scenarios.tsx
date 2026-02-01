import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GitBranch,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Scenarios Data
const scenarios = [
  {
    id: 'base',
    name: 'Base Plan',
    description: 'Current approved SNOP plan',
    jobs: 8,
    date: '2/1/2026',
    isActive: true,
    metrics: {
      revenue: '₹1247.5 Cr',
      utilization: '84.3%',
      jobs: 8,
    },
  },
  {
    id: 'high-demand',
    name: 'High Demand Scenario',
    description: 'Increased demand from Tata Motors (+20%)',
    jobs: 8,
    date: '1/31/2026',
    isActive: false,
    metrics: {
      revenue: '₹1434.6 Cr',
      utilization: '84.3%',
      jobs: 8,
    },
  },
  {
    id: 'constraint',
    name: 'Constraint Scenario',
    description: 'F-03 under maintenance for 3 days',
    jobs: 6,
    date: '2/1/2026',
    isActive: false,
    metrics: {
      revenue: '₹1180.2 Cr',
      utilization: '78.5%',
      jobs: 6,
    },
  },
];

// Impact Calculation
const calculateImpact = (base: number, compare: number) => {
  const diff = ((compare - base) / base) * 100;
  return {
    value: Math.abs(diff).toFixed(1),
    isPositive: diff >= 0,
  };
};

export function Scenarios() {
  const [selectedScenario, setSelectedScenario] = useState('high-demand');
  const baseScenario = scenarios.find((s) => s.id === 'base')!;
  const compareScenario = scenarios.find((s) => s.id === selectedScenario)!;

  const revenueBase = parseFloat(baseScenario.metrics.revenue.replace('₹', '').replace(' Cr', ''));
  const revenueCompare = parseFloat(compareScenario.metrics.revenue.replace('₹', '').replace(' Cr', ''));
  const revenueImpact = calculateImpact(revenueBase, revenueCompare);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenarios List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-base font-semibold text-white">Scenarios</CardTitle>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario.id)}
                  className={cn(
                    'p-4 rounded-lg border cursor-pointer transition-all',
                    scenario.id === selectedScenario
                      ? 'bg-blue-500/10 border-blue-500/50'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={cn(
                      'font-medium',
                      scenario.id === selectedScenario ? 'text-blue-400' : 'text-white'
                    )}>
                      {scenario.name}
                    </h3>
                    {scenario.isActive && (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{scenario.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{scenario.jobs} jobs</span>
                    <span>•</span>
                    <span>{scenario.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Side-by-Side Comparison */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-semibold text-white">Side-by-Side Comparison</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {/* Base Scenario */}
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-400 mb-4">Base: {baseScenario.name}</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500">Revenue</p>
                    <p className="text-xl font-semibold text-white">{baseScenario.metrics.revenue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Utilization</p>
                    <p className="text-xl font-semibold text-white">{baseScenario.metrics.utilization}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Jobs</p>
                    <p className="text-xl font-semibold text-white">{baseScenario.metrics.jobs}</p>
                  </div>
                </div>
              </div>

              {/* Impact */}
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex flex-col items-center justify-center">
                <p className="text-sm text-slate-400 mb-4">Impact</p>
                <div className="space-y-4 text-center">
                  <div>
                    <div className={cn(
                      'flex items-center justify-center gap-1',
                      revenueImpact.isPositive ? 'text-green-400' : 'text-red-400'
                    )}>
                      {revenueImpact.isPositive ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                      <span className="text-2xl font-bold">
                        {revenueImpact.isPositive ? '+' : '-'}{revenueImpact.value}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Revenue</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-slate-400">
                      <Minus className="w-5 h-5" />
                      <span className="text-2xl font-bold">+0.0%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Utilization</p>
                  </div>
                </div>
              </div>

              {/* Compare Scenario */}
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-400 mb-4">Compare: {compareScenario.name}</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500">Revenue</p>
                    <p className="text-xl font-semibold text-white">{compareScenario.metrics.revenue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Utilization</p>
                    <p className="text-xl font-semibold text-white">{compareScenario.metrics.utilization}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Jobs</p>
                    <p className="text-xl font-semibold text-white">{compareScenario.metrics.jobs}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gantt Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white">Base: {baseScenario.name}</CardTitle>
              <Badge className="bg-slate-700 text-slate-300">{baseScenario.metrics.jobs} jobs</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['FD-8278', 'FD-8330', 'FD-8001', 'FD-8612'].map((job, index) => (
                <div key={job} className="flex items-center gap-2">
                  <div className="w-16 text-xs text-slate-400">{job}</div>
                  <div className="flex-1 h-8 bg-slate-700/50 rounded relative overflow-hidden">
                    <div
                      className={cn(
                        'absolute h-full rounded',
                        index % 2 === 0 ? 'bg-green-500' : 'bg-red-500'
                      )}
                      style={{
                        left: `${index * 15}%`,
                        width: `${20 + Math.random() * 30}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white">Compare: {compareScenario.name}</CardTitle>
              <Badge className="bg-slate-700 text-slate-300">{compareScenario.metrics.jobs} jobs</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['FD-8278', 'FD-8330', 'FD-8001', 'FD-8612'].map((job, index) => (
                <div key={job} className="flex items-center gap-2">
                  <div className="w-16 text-xs text-slate-400">{job}</div>
                  <div className="flex-1 h-8 bg-slate-700/50 rounded relative overflow-hidden">
                    <div
                      className={cn(
                        'absolute h-full rounded',
                        index % 2 === 0 ? 'bg-green-500' : 'bg-red-500'
                      )}
                      style={{
                        left: `${index * 12}%`,
                        width: `${25 + Math.random() * 25}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
