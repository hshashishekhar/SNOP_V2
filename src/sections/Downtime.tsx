import { useState } from 'react';
import { useLineDowntime } from '@/hooks/useDowntime';
import { useLines } from '@/hooks/useLines';
import { DataTable } from '@/components/custom/DataTable';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarX, Plus, Clock, TrendingDown, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { ColumnDef } from '@tanstack/react-table';
import type { LineDowntime } from '@/types';

interface DowntimeFormData {
  lineId: string;
  reason: string;
  category: 'maintenance' | 'overhaul' | 'holiday' | 'energy' | 'audit' | 'training' | 'other';
  startDateTime: string;
  endDateTime: string;
  duration: number;
  durationUnit: 'hours' | 'days' | 'weeks' | 'months';
  impactType: 'full' | 'partial';
  capacityReductionPercent?: number;
  notes?: string;
}

export function Downtime() {
  const { downtimeRecords, isLoading, createDowntime, approveDowntime, cancelDowntime } = useLineDowntime();
  const { lines } = useLines();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<DowntimeFormData>({
    defaultValues: {
      lineId: '',
      reason: '',
      category: 'maintenance',
      startDateTime: '',
      endDateTime: '',
      duration: 1,
      durationUnit: 'hours',
      impactType: 'full',
    },
  });

  const onSubmit = (data: DowntimeFormData) => {
    createDowntime({
      ...data,
      createdBy: 'admin',
      status: 'draft',
    });
    setIsDialogOpen(false);
    form.reset();
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      maintenance: 'bg-blue-100 text-blue-800',
      overhaul: 'bg-purple-100 text-purple-800',
      holiday: 'bg-green-100 text-green-800',
      energy: 'bg-yellow-100 text-yellow-800',
      audit: 'bg-orange-100 text-orange-800',
      training: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${colors[category] || colors.other}`}>
        {category}
      </span>
    );
  };

  const getImpactBadge = (impactType: string, reduction?: number) => {
    if (impactType === 'full') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Full Stop</span>;
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        {reduction || 0}% Reduction
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${colors[status] || colors.draft}`}>
        {status}
      </span>
    );
  };

  const columns: ColumnDef<LineDowntime>[] = [
    {
      accessorKey: 'lineId',
      header: 'Line',
      cell: ({ row }) => {
        const line = lines.find((l) => l.id === row.original.lineId);
        return line?.code || '-';
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => getCategoryBadge(row.original.category),
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.reason}>
          {row.original.reason}
        </div>
      ),
    },
    {
      accessorKey: 'startDateTime',
      header: 'Start',
      cell: ({ row }) => new Date(row.original.startDateTime).toLocaleString(),
    },
    {
      accessorKey: 'endDateTime',
      header: 'End',
      cell: ({ row }) => new Date(row.original.endDateTime).toLocaleString(),
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({ row }) => `${row.original.duration} ${row.original.durationUnit}`,
    },
    {
      accessorKey: 'impactType',
      header: 'Impact',
      cell: ({ row }) => getImpactBadge(row.original.impactType, row.original.capacityReductionPercent),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.status === 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => approveDowntime(row.original.id, 'admin')}
              className="text-green-600 hover:text-green-700"
            >
              Approve
            </Button>
          )}
          {row.original.status !== 'cancelled' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cancelDowntime(row.original.id)}
              className="text-red-600 hover:text-red-700"
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Calculate summary stats
  const totalDowntimeHours = downtimeRecords
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => {
      const multiplier = r.durationUnit === 'hours' ? 1 : 
                        r.durationUnit === 'days' ? 24 : 
                        r.durationUnit === 'weeks' ? 168 : 720;
      return sum + (r.duration * multiplier);
    }, 0);

  const pendingApprovals = downtimeRecords.filter(r => r.status === 'draft').length;
  const fullStoppages = downtimeRecords.filter(r => r.status === 'approved' && r.impactType === 'full').length;
  const partialReductions = downtimeRecords.filter(r => r.status === 'approved' && r.impactType === 'partial').length;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Total Downtime (Approved)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalDowntimeHours.toFixed(1)} hrs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{pendingApprovals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Full Stoppages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{fullStoppages}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CalendarX className="w-4 h-4" />
              Partial Reductions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{partialReductions}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarX className="w-6 h-6 text-orange-500" />
            Planned Downtime
          </h2>
          <p className="text-gray-500">Manage line downtime and maintenance schedules</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              form.reset();
              setIsDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Downtime
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Planned Downtime</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="lineId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Line</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select line" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lines.map((line) => (
                            <SelectItem key={line.id} value={line.id}>
                              {line.code} - {line.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="maintenance">Planned Maintenance</SelectItem>
                          <SelectItem value="overhaul">Major Overhaul</SelectItem>
                          <SelectItem value="holiday">Holiday/Shutdown</SelectItem>
                          <SelectItem value="energy">Energy Maintenance</SelectItem>
                          <SelectItem value="audit">Quality Audit</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="other">Others</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Detailed reason for downtime" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDateTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date/Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDateTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date/Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="durationUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                            <SelectItem value="weeks">Weeks</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="impactType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impact Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select impact type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full">Full Line Stoppage</SelectItem>
                          <SelectItem value="partial">Partial Capacity Reduction</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch('impactType') === 'partial' && (
                  <FormField
                    control={form.control}
                    name="capacityReductionPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity Reduction (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="99"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Optional notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Add Downtime
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={downtimeRecords} />
    </div>
  );
}
