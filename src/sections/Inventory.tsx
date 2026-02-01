import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Package,
  Factory,
  Flame,
  Settings,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Inventory Stage Data
const inventoryStages = [
  { id: 'forged', name: 'Forged', quantity: '13.3K', value: '₹88L', icon: Factory, color: 'blue' },
  { id: 'ht', name: 'HT', quantity: '9.3K', value: '₹71L', icon: Flame, color: 'orange' },
  { id: 'processed', name: 'Processed', quantity: '5.8K', value: '₹50L', icon: Settings, color: 'purple' },
  { id: 'machined', name: 'Machined', quantity: '4.3K', value: '₹46L', icon: Settings, color: 'cyan' },
  { id: 'fg', name: 'FG', quantity: '7.8K', value: '₹117L', icon: CheckCircle2, color: 'green' },
];

// Stage Details
const stageDetails = [
  {
    id: 'forged',
    name: 'Forged',
    good: 12500,
    defective: 320,
    godown: 450,
  },
  {
    id: 'ht',
    name: 'HT',
    good: 8900,
    defective: 180,
    godown: 220,
  },
  {
    id: 'processed',
    name: 'Processed',
    good: 5600,
    defective: 95,
    godown: 120,
  },
  {
    id: 'machined',
    name: 'Machined',
    good: 4200,
    defective: 65,
    godown: 80,
  },
  {
    id: 'fg',
    name: 'Fg',
    good: 7800,
    defective: 0,
    godown: 0,
  },
];

// Safety Stock Alerts
const safetyStockAlerts = [
  {
    id: 'R-2234',
    name: 'runner',
    status: 'critical',
    daysCover: 1.2,
    targetDays: 5,
    recommendation: 'Auto-inflate to 5-day cover recommended',
  },
];

// WIP Turns Analysis
const wipTurnsData = [
  { from: 'Forged', to: 'HT', days: 1.2, target: 1, status: 'warning' },
  { from: 'HT', to: 'Processed', days: 0.8, target: 1, status: 'good' },
  { from: 'Processed', to: 'Machined', days: 1.5, target: 1, status: 'warning' },
  { from: 'Machined', to: 'FG', days: 0.5, target: 1, status: 'good' },
];

export function Inventory() {
  const totalUnits = 40530;
  const totalValue = '₹3.7 Cr';

  return (
    <div className="space-y-6">
      {/* 5-Stage Inventory Tracking */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-semibold text-white">5-Stage Inventory Tracking</CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-slate-700 text-slate-300">{totalUnits.toLocaleString()} units</Badge>
              <Badge className="bg-slate-700 text-slate-300">{totalValue}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stage Flow */}
          <div className="flex items-center justify-between mb-8 px-4">
            {inventoryStages.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <div key={stage.id} className="flex items-center">
                  <div className="text-center">
                    <div className={cn(
                      'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 border-2',
                      stage.color === 'blue' && 'bg-blue-500/20 border-blue-500',
                      stage.color === 'orange' && 'bg-orange-500/20 border-orange-500',
                      stage.color === 'purple' && 'bg-purple-500/20 border-purple-500',
                      stage.color === 'cyan' && 'bg-cyan-500/20 border-cyan-500',
                      stage.color === 'green' && 'bg-green-500/20 border-green-500',
                    )}>
                      <Icon className={cn(
                        'w-7 h-7',
                        stage.color === 'blue' && 'text-blue-400',
                        stage.color === 'orange' && 'text-orange-400',
                        stage.color === 'purple' && 'text-purple-400',
                        stage.color === 'cyan' && 'text-cyan-400',
                        stage.color === 'green' && 'text-green-400',
                      )} />
                    </div>
                    <div className={cn(
                      'text-lg font-bold',
                      stage.color === 'blue' && 'text-blue-400',
                      stage.color === 'orange' && 'text-orange-400',
                      stage.color === 'purple' && 'text-purple-400',
                      stage.color === 'cyan' && 'text-cyan-400',
                      stage.color === 'green' && 'text-green-400',
                    )}>
                      {stage.quantity}
                    </div>
                    <p className="text-sm text-white font-medium">{stage.name}</p>
                    <p className="text-xs text-slate-500">{stage.value}</p>
                  </div>
                  {index < inventoryStages.length - 1 && (
                    <div className="w-16 h-0.5 bg-slate-700 mx-2" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Stage Details Grid */}
          <div className="grid grid-cols-5 gap-4">
            {stageDetails.map((stage) => (
              <div key={stage.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h4 className="text-sm font-medium text-white mb-3">{stage.name}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Good:</span>
                    <span className="text-slate-300">{stage.good.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-400">Defective:</span>
                    <span className="text-slate-300">{stage.defective.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-400">Godown:</span>
                    <span className="text-slate-300">{stage.godown.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Quality Distribution */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-semibold text-white">Quality Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-300">Good</span>
                </div>
                <span className="text-sm text-white font-medium">39,000 <span className="text-slate-500">(96.2%)</span></span>
              </div>
              <Progress value={96.2} className="h-2 bg-slate-700" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-slate-300">Defective</span>
                </div>
                <span className="text-sm text-white font-medium">660 <span className="text-slate-500">(1.6%)</span></span>
              </div>
              <Progress value={1.6} className="h-2 bg-slate-700" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-slate-300">Godown</span>
                </div>
                <span className="text-sm text-white font-medium">870 <span className="text-slate-500">(2.2%)</span></span>
              </div>
              <Progress value={2.2} className="h-2 bg-slate-700" />
            </div>
          </CardContent>
        </Card>

        {/* Safety Stock Alerts */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-semibold text-white">Safety Stock Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {safetyStockAlerts.map((alert) => (
              <div key={alert.id} className="p-3 bg-red-950/30 border border-red-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-white">{alert.id}</span>
                  <Badge className="bg-slate-700 text-slate-300 text-xs">{alert.name}</Badge>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-xs">{alert.status}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm mb-2">
                  <span className="text-slate-400">Days Cover</span>
                  <span className="text-white">{alert.daysCover} / {alert.targetDays} days</span>
                </div>
                <p className="text-xs text-red-400">{alert.recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Real-time Valuation */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-semibold text-white">Real-time Valuation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button size="sm" className="bg-blue-600 text-white">By Grade</Button>
              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">By Plant</Button>
              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">By Profit</Button>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">₹10.0 Cr</p>
              <p className="text-sm text-slate-400">Total Inventory Value</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Grade A</span>
                <span className="text-slate-300">₹450L (45%)</span>
              </div>
              <Progress value={45} className="h-1.5 bg-slate-700" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Grade B</span>
                <span className="text-slate-300">₹320L (32%)</span>
              </div>
              <Progress value={32} className="h-1.5 bg-slate-700" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Grade C</span>
                <span className="text-slate-300">₹230L (23%)</span>
              </div>
              <Progress value={23} className="h-1.5 bg-slate-700" />
            </div>
          </CardContent>
        </Card>

        {/* WIP Turns Analysis */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-semibold text-white">WIP Turns Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wipTurnsData.map((turn, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">{turn.from}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span className="text-sm text-slate-400">{turn.to}</span>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      'text-sm font-medium',
                      turn.status === 'good' ? 'text-green-400' : 'text-yellow-400'
                    )}>
                      {turn.days}d
                    </span>
                    <p className="text-xs text-slate-500">Target: {turn.target} days</p>
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
