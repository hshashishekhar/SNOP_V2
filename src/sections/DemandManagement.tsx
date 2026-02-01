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
  FileText,
  Factory,
  FlaskConical,
  Shield,
  Plane,
  ArrowLeftRight,
  TrendingUp,
  AlertCircle,
  Users,
  Beaker,
  Search,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Demand Categories
const demandCategories = [
  {
    id: 'cdfd',
    name: 'CDFD Sales',
    value: '₹7.7 Cr',
    count: 2,
    icon: Factory,
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'npd',
    name: 'NPD',
    value: '₹0.5 Cr',
    count: 1,
    icon: FlaskConical,
    iconColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'defence',
    name: 'Defence',
    value: '₹1.8 Cr',
    count: 1,
    icon: Shield,
    iconColor: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  {
    id: 'aerospace',
    name: 'Aerospace',
    value: '₹2.5 Cr',
    count: 1,
    icon: Plane,
    iconColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
  },
  {
    id: 'internal',
    name: 'Internal Indents',
    value: '₹0.8 Cr',
    count: 1,
    icon: ArrowLeftRight,
    iconColor: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
];

// Priority Framework
const priorityFramework = [
  {
    id: 1,
    name: 'Aerospace / Defence',
    demands: 2,
    icon: Plane,
    color: 'red',
  },
  {
    id: 2,
    name: 'Critical CDFD',
    demands: 1,
    icon: AlertCircle,
    color: 'red',
  },
  {
    id: 3,
    name: 'Standard CDFD',
    demands: 1,
    icon: Factory,
    color: 'orange',
  },
  {
    id: 4,
    name: 'Internal / Indents',
    demands: 1,
    icon: ArrowLeftRight,
    color: 'orange',
  },
  {
    id: 5,
    name: 'NPD / Trials',
    demands: 1,
    icon: Beaker,
    color: 'slate',
  },
];

// Demand List Data
const demandList = [
  {
    id: 'SO-2024-001',
    customer: 'Tata Motors',
    partNumber: 'CR-2847-A',
    description: 'Crankshaft 4 Cylinder',
    quantity: 2500,
    value: '₹3.2 Cr',
    deliveryDate: '15 Feb 2026',
    priority: 'High',
    category: 'CDFD',
    status: 'confirmed',
  },
  {
    id: 'SO-2024-002',
    customer: 'Mahindra',
    partNumber: 'CR-3156-B',
    description: 'Connecting Rod Type X',
    quantity: 1800,
    value: '₹2.1 Cr',
    deliveryDate: '18 Feb 2026',
    priority: 'Medium',
    category: 'CDFD',
    status: 'confirmed',
  },
  {
    id: 'SO-2024-003',
    customer: 'Boeing',
    partNumber: 'AX-9921-C',
    description: 'Aerospace Component',
    quantity: 450,
    value: '₹2.5 Cr',
    deliveryDate: '20 Feb 2026',
    priority: 'Critical',
    category: 'Aerospace',
    status: 'confirmed',
  },
  {
    id: 'SO-2024-004',
    customer: 'DRDO',
    partNumber: 'DF-4455-D',
    description: 'Defence Equipment',
    quantity: 120,
    value: '₹1.8 Cr',
    deliveryDate: '25 Feb 2026',
    priority: 'Critical',
    category: 'Defence',
    status: 'confirmed',
  },
  {
    id: 'NPD-2024-001',
    customer: 'Internal R&D',
    partNumber: 'NPD-001',
    description: 'New Product Trial',
    quantity: 50,
    value: '₹0.5 Cr',
    deliveryDate: '28 Feb 2026',
    priority: 'Low',
    category: 'NPD',
    status: 'trial',
  },
];

export function DemandManagement() {
  const totalValue = demandCategories.reduce((acc, cat) => acc + parseFloat(cat.value.replace('₹', '').replace(' Cr', '')), 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'trial':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demand Categories */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-base font-semibold text-white">Demand Categories</CardTitle>
              </div>
              <Badge className="bg-slate-700 text-slate-300">₹{totalValue.toFixed(1)} Cr Total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {demandCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.id}
                    className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', category.bgColor)}>
                          <Icon className={cn('w-5 h-5', category.iconColor)} />
                        </div>
                        <Badge className="bg-slate-700 text-slate-300">{category.count}</Badge>
                      </div>
                      <h3 className="text-sm font-medium text-white">{category.name}</h3>
                      <p className="text-lg font-semibold text-slate-300 mt-1">{category.value}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Priority Framework */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-semibold text-white">Priority Framework</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorityFramework.map((priority) => {
                const Icon = priority.icon;
                return (
                  <div
                    key={priority.id}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                      priority.color === 'red' ? 'bg-red-500' :
                      priority.color === 'orange' ? 'bg-orange-500' : 'bg-slate-500'
                    )}>
                      <span className="text-white font-bold text-sm">{priority.id}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">{priority.name}</h4>
                    </div>
                    <Badge className="bg-slate-700 text-slate-300">{priority.demands} demands</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demand List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-semibold text-white">Demand List</CardTitle>
              <Badge className="bg-slate-700 text-slate-300">6 items</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search customer or part number..."
                className="pl-10 bg-slate-700/50 border-slate-600 text-slate-200"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-slate-200">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-slate-200">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="cdfd">CDFD</SelectItem>
                <SelectItem value="aerospace">Aerospace</SelectItem>
                <SelectItem value="defence">Defence</SelectItem>
                <SelectItem value="npd">NPD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Demand Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-700">
                  <th className="pb-3 text-sm font-medium text-slate-400">Order ID</th>
                  <th className="pb-3 text-sm font-medium text-slate-400">Customer</th>
                  <th className="pb-3 text-sm font-medium text-slate-400">Part Number</th>
                  <th className="pb-3 text-sm font-medium text-slate-400 text-right">Quantity</th>
                  <th className="pb-3 text-sm font-medium text-slate-400">Delivery Date</th>
                  <th className="pb-3 text-sm font-medium text-slate-400">Priority</th>
                  <th className="pb-3 text-sm font-medium text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {demandList.map((demand) => (
                  <tr key={demand.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                    <td className="py-3 text-sm text-white">{demand.id}</td>
                    <td className="py-3 text-sm text-slate-300">{demand.customer}</td>
                    <td className="py-3">
                      <div>
                        <p className="text-sm text-white">{demand.partNumber}</p>
                        <p className="text-xs text-slate-500">{demand.description}</p>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-right text-slate-300">{demand.quantity.toLocaleString()}</td>
                    <td className="py-3 text-sm text-slate-300">{demand.deliveryDate}</td>
                    <td className="py-3">
                      <Badge className={cn('border', getPriorityColor(demand.priority))}>
                        {demand.priority}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge className={cn('border', getStatusColor(demand.status))}>
                        {demand.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
