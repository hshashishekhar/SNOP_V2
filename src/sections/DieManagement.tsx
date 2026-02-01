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
import { Progress } from '@/components/ui/progress';
import {
  Settings,
  Search,
  Wrench,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Die Classification Types
const dieClassifications = [
  {
    id: 'runner',
    name: 'Runner',
    description: 'Daily/Weekly production',
    count: 5,
    color: 'green',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    textColor: 'text-green-400',
    iconColor: 'bg-green-500',
  },
  {
    id: 'repeater',
    name: 'Repeater',
    description: 'Monthly/Quarterly',
    count: 4,
    color: 'yellow',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    textColor: 'text-yellow-400',
    iconColor: 'bg-yellow-500',
  },
  {
    id: 'stranger',
    name: 'Stranger',
    description: '1-2x per year',
    count: 3,
    color: 'red',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/50',
    textColor: 'text-red-400',
    iconColor: 'bg-red-500',
  },
];

// Die Master Data
const dieMasterData = [
  {
    id: 'FD-7842',
    name: 'Crankshaft Die A',
    category: 'runner',
    lifeRemaining: 850,
    lifeTotal: 50000,
    status: 'active',
    lines: ['F-01', 'F-02'],
  },
  {
    id: 'FD-7843',
    name: 'Crankshaft Die B',
    category: 'runner',
    lifeRemaining: 42300,
    lifeTotal: 50000,
    status: 'active',
    lines: ['F-01', 'F-02'],
  },
  {
    id: 'FD-8856',
    name: 'Connecting Rod Die',
    category: 'repeater',
    lifeRemaining: 18750,
    lifeTotal: 35000,
    status: 'active',
    lines: ['F-02', 'F-03'],
  },
  {
    id: 'FD-9921',
    name: 'Axle Beam Die',
    category: 'stranger',
    lifeRemaining: 5200,
    lifeTotal: 25000,
    status: 'maintenance',
    lines: ['F-01'],
  },
];

// Die Selection Rules
const selectionRules = [
  {
    id: 1,
    title: 'Highest Remaining Life',
    description: 'Prioritize dies with maximum shots remaining',
    icon: 'trophy',
  },
  {
    id: 2,
    title: 'Lowest Changeover Time',
    description: 'Minimize setup time between similar dies',
    icon: 'clock',
  },
  {
    id: 3,
    title: 'Proximity to Reorder',
    description: 'Schedule dies approaching reorder point',
    icon: 'alert',
  },
];

export function DieManagement() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getCategoryBadge = (category: string) => {
    const cat = dieClassifications.find((c) => c.id === category);
    if (!cat) return null;
    return (
      <Badge className={cn('border', cat.bgColor, cat.borderColor, cat.textColor)}>
        {cat.name.toLowerCase()}
      </Badge>
    );
  };

  const getLifeProgress = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage > 80) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Die Classification Matrix */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-base font-semibold text-white">Die Classification Matrix</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dieClassifications.map((classification) => (
              <Card
                key={classification.id}
                className={cn(
                  'bg-slate-800/50 border-2 cursor-pointer transition-all hover:brightness-110',
                  selectedCategory === classification.id ? classification.borderColor : 'border-slate-700',
                  classification.bgColor
                )}
                onClick={() => setSelectedCategory(classification.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-full', classification.iconColor)} />
                      <div>
                        <h3 className={cn('text-lg font-semibold', classification.textColor)}>
                          {classification.name}
                        </h3>
                        <p className="text-sm text-slate-400">{classification.description}</p>
                      </div>
                    </div>
                    <Badge className={cn('bg-slate-700 text-white')}>{classification.count} dies</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Die Master Grid */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-base font-semibold text-white">Die Master Grid</CardTitle>
                <Badge className="bg-slate-700 text-slate-300">12 of 12</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Search die code or name..."
                  className="pl-10 bg-slate-700/50 border-slate-600 text-slate-200"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-slate-200">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="runner">Runner</SelectItem>
                  <SelectItem value="repeater">Repeater</SelectItem>
                  <SelectItem value="stranger">Stranger</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-slate-200">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Die List */}
            <div className="space-y-3">
              {dieMasterData.map((die) => (
                <div
                  key={die.id}
                  className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-medium text-white">{die.id}</span>
                      {getCategoryBadge(die.category)}
                    </div>
                    <p className="text-sm text-slate-400">{die.name}</p>
                  </div>
                  <div className="w-32">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Life Remaining</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-sm font-medium',
                        (die.lifeRemaining / die.lifeTotal) > 0.8 ? 'text-green-400' :
                        (die.lifeRemaining / die.lifeTotal) > 0.3 ? 'text-yellow-400' : 'text-red-400'
                      )}>
                        {die.lifeRemaining.toLocaleString()}
                      </span>
                      <span className="text-slate-500">/</span>
                      <span className="text-slate-400">{die.lifeTotal.toLocaleString()}</span>
                    </div>
                    <Progress
                      value={(die.lifeRemaining / die.lifeTotal) * 100}
                      className="h-1.5 mt-1 bg-slate-700"
                    />
                  </div>
                  <div>
                    <Badge className={cn(
                      die.status === 'active' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                    )}>
                      {die.status}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    {die.lines.map((line) => (
                      <Badge key={line} variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600">
                        {line}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Die Selection Rules */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-semibold text-white">Die Selection Rules</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectionRules.map((rule, index) => (
                <div key={rule.id} className="flex gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{rule.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{rule.description}</p>
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
