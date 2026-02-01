import { useState, useRef } from 'react';
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
  Beaker,
  Search,
  Upload,
  Download,
  ChevronRight,
  Package,
  Clock,
  DollarSign,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Extended Demand Type with more details
type DemandRecord = {
  id: string;
  customer: string;
  partNumber: string;
  description: string;
  quantity: number;
  value: string;
  deliveryDate: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  category: string;
  status: 'confirmed' | 'pending' | 'trial';
  location?: string;
  division?: string;
  orderType?: string;
  uom?: string;
  unitPrice?: number;
  totalWeight?: string;
  heatCode?: string;
  machine?: string;
  operation?: string;
  routing?: string;
  dueDate?: string;
  promisedDate?: string;
  salesOrder?: string;
  itemNumber?: string;
  material?: string;
  revision?: string;
  shelfLife?: string;
  storageLocation?: string;
  shippingMethod?: string;
  incoterms?: string;
  notes?: string;
};

// Demand Categories with enhanced styling
const demandCategories = [
  {
    id: 'cdfd',
    name: 'CDFD Sales',
    value: '₹7.7 Cr',
    count: 2,
    icon: Factory,
    color: 'bg-bf-blue/10 text-bf-blue border-bf-blue/20',
  },
  {
    id: 'npd',
    name: 'NPD',
    value: '₹0.5 Cr',
    count: 1,
    icon: FlaskConical,
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  {
    id: 'defence',
    name: 'Defence',
    value: '₹1.8 Cr',
    count: 1,
    icon: Shield,
    color: 'bg-bf-green/10 text-bf-green border-bf-green/20',
  },
  {
    id: 'aerospace',
    name: 'Aerospace',
    value: '₹2.5 Cr',
    count: 1,
    icon: Plane,
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  {
    id: 'internal',
    name: 'Internal',
    value: '₹0.8 Cr',
    count: 1,
    icon: ArrowLeftRight,
    color: 'bg-bf-orange/10 text-bf-orange border-bf-orange/20',
  },
];

// Priority Framework
const priorityFramework = [
  { id: 1, name: 'Aerospace / Defence', demands: 2, color: 'bg-bf-red' },
  { id: 2, name: 'Critical CDFD', demands: 1, color: 'bg-bf-red' },
  { id: 3, name: 'Standard CDFD', demands: 1, color: 'bg-bf-amber' },
  { id: 4, name: 'Internal / Indents', demands: 1, color: 'bg-bf-amber' },
  { id: 5, name: 'NPD / Trials', demands: 1, color: 'bg-slate-500' },
];

// Extended Demand List Data with more details
const demandList: DemandRecord[] = [
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
    location: 'Pune',
    division: 'Automotive',
    orderType: 'Regular',
    uom: 'PCS',
    unitPrice: 12800,
    totalWeight: '12500 kg',
    heatCode: 'HC-2024-001',
    machine: 'F-01',
    operation: 'Forging',
    routing: 'R-CRN-001',
    dueDate: '15 Feb 2026',
    promisedDate: '15 Feb 2026',
    salesOrder: 'SO-2024-001',
    itemNumber: '10',
    material: 'C45 Steel',
    revision: 'A',
    shelfLife: 'N/A',
    storageLocation: 'WH-01',
    shippingMethod: 'Road',
    incoterms: 'EXW',
    notes: 'Strict quality requirements',
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
    location: 'Mumbai',
    division: 'Automotive',
    orderType: 'Regular',
    uom: 'PCS',
    unitPrice: 11666,
    totalWeight: '7200 kg',
    heatCode: 'HC-2024-002',
    machine: 'F-02',
    operation: 'Forging',
    routing: 'R-ROD-001',
    dueDate: '18 Feb 2026',
    promisedDate: '18 Feb 2026',
    salesOrder: 'SO-2024-002',
    itemNumber: '15',
    material: '40Cr Steel',
    revision: 'B',
    shelfLife: 'N/A',
    storageLocation: 'WH-02',
    shippingMethod: 'Road',
    incoterms: 'FOB',
    notes: 'Standard specifications',
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
    location: 'Bangalore',
    division: 'Aerospace',
    orderType: 'Export',
    uom: 'PCS',
    unitPrice: 55555,
    totalWeight: '2250 kg',
    heatCode: 'HC-2024-003',
    machine: 'HT-01',
    operation: 'Heat Treatment',
    routing: 'R-AER-001',
    dueDate: '20 Feb 2026',
    promisedDate: '20 Feb 2026',
    salesOrder: 'SO-2024-003',
    itemNumber: '20',
    material: 'Titanium Alloy',
    revision: 'C',
    shelfLife: '24 months',
    storageLocation: 'WH-03',
    shippingMethod: 'Air',
    incoterms: 'DDP',
    notes: 'Aerospace grade - strict compliance',
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
    location: 'Delhi',
    division: 'Defence',
    orderType: 'Government',
    uom: 'PCS',
    unitPrice: 150000,
    totalWeight: '3600 kg',
    heatCode: 'HC-2024-004',
    machine: 'F-03',
    operation: 'Forging',
    routing: 'R-DEF-001',
    dueDate: '25 Feb 2026',
    promisedDate: '25 Feb 2026',
    salesOrder: 'SO-2024-004',
    itemNumber: '25',
    material: 'Special Alloy Steel',
    revision: 'D',
    shelfLife: 'N/A',
    storageLocation: 'WH-04',
    shippingMethod: 'Secure Transport',
    incoterms: 'DAP',
    notes: 'Classified - security clearance required',
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
    location: 'Satara',
    division: 'R&D',
    orderType: 'Trial',
    uom: 'PCS',
    unitPrice: 100000,
    totalWeight: '250 kg',
    heatCode: 'HC-2024-005',
    machine: 'M-01',
    operation: 'Machining',
    routing: 'R-NPD-001',
    dueDate: '28 Feb 2026',
    promisedDate: '28 Feb 2026',
    salesOrder: 'NPD-2024-001',
    itemNumber: '30',
    material: 'Aluminum 7075',
    revision: 'Proto',
    shelfLife: '6 months',
    storageLocation: 'WH-05',
    shippingMethod: 'Internal',
    incoterms: 'N/A',
    notes: 'Trial batch - data collection required',
  },
];

export function DemandManagement() {
  const [demands, setDemands] = useState<DemandRecord[]>(demandList);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const totalValue = demandCategories.reduce((acc, cat) => acc + parseFloat(cat.value.replace('₹', '').replace(' Cr', '')), 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-bf-red/20 text-bf-red border-bf-red/30';
      case 'High':
        return 'bg-bf-orange/20 text-bf-orange border-bf-orange/30';
      case 'Medium':
        return 'bg-bf-amber/20 text-bf-amber border-bf-amber/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-bf-green/20 text-bf-green border-bf-green/30';
      case 'trial':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // Handle file input change
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data = parseCSV(text);
      if (data.length > 0) {
        const newDemands = data.map((row: Record<string, string>, index: number) => ({
          id: row['Order ID'] || row['id'] || `SO-2024-${String(demands.length + index + 1).padStart(3, '0')}`,
          customer: row['Customer'] || row['customer'] || 'Unknown',
          partNumber: row['Part Number'] || row['partNumber'] || 'N/A',
          description: row['Description'] || row['description'] || 'No description',
          quantity: parseInt(row['Quantity'] || row['quantity'] || '0', 10),
          value: row['Value'] || row['value'] || '₹0',
          deliveryDate: row['Delivery Date'] || row['deliveryDate'] || 'TBD',
          priority: (row['Priority'] || row['priority'] || 'Medium') as 'Critical' | 'High' | 'Medium' | 'Low',
          category: row['Category'] || row['category'] || 'CDFD',
          status: (row['Status'] || row['status'] || 'pending') as 'confirmed' | 'pending' | 'trial',
          location: row['Location'] || row['location'] || '',
          division: row['Division'] || row['division'] || '',
          orderType: row['Order Type'] || row['orderType'] || '',
          uom: row['UOM'] || row['uom'] || '',
          unitPrice: parseFloat(row['Unit Price'] || row['unitPrice'] || '0'),
          totalWeight: row['Total Weight'] || row['totalWeight'] || '',
          heatCode: row['Heat Code'] || row['heatCode'] || '',
          machine: row['Machine'] || row['machine'] || '',
          operation: row['Operation'] || row['operation'] || '',
          routing: row['Routing'] || row['routing'] || '',
          dueDate: row['Due Date'] || row['dueDate'] || '',
          promisedDate: row['Promised Date'] || row['promisedDate'] || '',
          salesOrder: row['Sales Order'] || row['salesOrder'] || '',
          itemNumber: row['Item Number'] || row['itemNumber'] || '',
          material: row['Material'] || row['material'] || '',
          revision: row['Revision'] || row['revision'] || '',
          shelfLife: row['Shelf Life'] || row['shelfLife'] || '',
          storageLocation: row['Storage Location'] || row['storageLocation'] || '',
          shippingMethod: row['Shipping Method'] || row['shippingMethod'] || '',
          incoterms: row['Incoterms'] || row['incoterms'] || '',
          notes: row['Notes'] || row['notes'] || '',
        }));
        setDemands([...demands, ...newDemands]);
      }
    } catch (error) {
      console.error('Error parsing file:', error);
    }
    setImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Simple CSV parser
  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data: Record<string, string>[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
    
    return data;
  };

  // Download sample template
  const downloadTemplate = () => {
    const template = `Order ID,Customer,Part Number,Description,Quantity,Value,Delivery Date,Priority,Category,Status,Location,Division,Order Type,UOM,Unit Price,Total Weight,Heat Code,Machine,Operation,Routing,Due Date,Promised Date,Sales Order,Item Number,Material,Revision,Shelf Life,Storage Location,Shipping Method,Incoterms,Notes
SO-2024-XXX,Customer Name,PART-001,Description,100,₹1.0 Cr,15 Mar 2026,Medium,CDFD,confirmed,Mumbai,Automotive,Regular,PCS,10000,500 kg,HC-2024-XXX,F-01,Forging,R-CRN-001,15 Mar 2026,15 Mar 2026,SO-2024-XXX,10,Steel,A,N/A,WH-01,Road,EXW,Notes here`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demand_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Categories and Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demand Categories - Enhanced Cards */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-bf-blue/10">
                  <FileText className="w-5 h-5 text-bf-blue" />
                </div>
                <CardTitle className="text-base font-semibold text-white">Demand Overview</CardTitle>
              </div>
              <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600">
                <DollarSign className="w-3 h-3 mr-1" />
                ₹{totalValue.toFixed(1)} Cr Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {demandCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.id}
                    className={cn(
                      'relative p-4 rounded-xl border transition-all duration-200 hover:shadow-lg cursor-pointer',
                      category.color,
                      'border'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 rounded-lg bg-slate-800/50">
                        <Icon className="w-4 h-4" />
                      </div>
                      <Badge variant="secondary" className="bg-slate-800/50 text-slate-300">
                        {category.count}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-medium text-slate-200">{category.name}</h3>
                    <p className="text-lg font-bold text-white mt-1">{category.value}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Priority Framework - Compact List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-bf-amber/10">
                <Target className="w-5 h-5 text-bf-amber" />
              </div>
              <CardTitle className="text-base font-semibold text-white">Priority Queue</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {priorityFramework.map((priority) => (
              <div
                key={priority.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                  priority.color
                )}>
                  <span className="text-white font-bold text-xs">{priority.id}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{priority.name}</p>
                </div>
                <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 text-xs">
                  {priority.demands}
                </Badge>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Demand List Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-bf-blue/10">
                <Package className="w-5 h-5 text-bf-blue" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-white">Demand Records</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">{demands.length} active demands</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                onClick={downloadTemplate}
              >
                <Download className="w-4 h-4 mr-1.5" />
                Template
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-bf-blue hover:bg-bf-blue/90 text-white"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
              >
                <Upload className={cn("w-4 h-4 mr-1.5", importing && "animate-pulse")} />
                {importing ? 'Importing...' : 'Import Excel'}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search demands..."
                className="pl-10 bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-500 focus:border-bf-blue focus:ring-bf-blue/20"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] bg-slate-700/50 border-slate-600 text-slate-200 focus:border-bf-blue">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] bg-slate-700/50 border-slate-600 text-slate-200 focus:border-bf-blue">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="cdfd">CDFD</SelectItem>
                <SelectItem value="aerospace">Aerospace</SelectItem>
                <SelectItem value="defence">Defence</SelectItem>
                <SelectItem value="npd">NPD</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] bg-slate-700/50 border-slate-600 text-slate-200 focus:border-bf-blue">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Demand Table */}
          <div className="border rounded-lg border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/80 border-b border-slate-700">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Part Number</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 inline mr-1" />
                      Delivery
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Division</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Machine</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Material</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Sales Order</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {demands.map((demand) => (
                    <tr key={demand.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-white font-medium">{demand.id}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{demand.customer}</td>
                      <td className="px-4 py-3 text-sm text-bf-blue font-medium">{demand.partNumber}</td>
                      <td className="px-4 py-3 text-sm text-slate-400 max-w-[200px] truncate">{demand.description}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-300 font-mono">{demand.quantity.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-slate-300 font-medium">{demand.value}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{demand.deliveryDate}</td>
                      <td className="px-4 py-3">
                        <Badge className={cn('text-xs border', getPriorityColor(demand.priority))}>
                          {demand.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={cn('text-xs border capitalize', getStatusColor(demand.status))}>
                          {demand.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">{demand.category}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{demand.location || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{demand.division || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{demand.machine || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{demand.material || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{demand.salesOrder || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 max-w-[150px] truncate">{demand.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>Showing {demands.length} of {demands.length} records</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-400" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-400" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
