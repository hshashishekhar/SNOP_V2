import { useState } from 'react';
import { useLines } from '@/hooks/useLines';
import { useDivisions } from '@/hooks/useDivisions';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Factory } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { ColumnDef } from '@tanstack/react-table';
import type { Line } from '@/types';

interface LineFormData {
  divisionId: string;
  code: string;
  name: string;
  pressTonnage?: number;
  shutHeightMin?: number;
  shutHeightMax?: number;
  isContinuous: boolean;
  grossHoursPerWeek: number;
  absenteeismFactor: number;
  unplannedDowntimeBuffer: number;
  isActive: boolean;
}

export function Lines() {
  const { lines, isLoading, createLine, updateLine, deleteLine } = useLines();
  const { divisions } = useDivisions();
  const [editingLine, setEditingLine] = useState<Line | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<LineFormData>({
    defaultValues: {
      divisionId: '',
      code: '',
      name: '',
      isContinuous: true,
      grossHoursPerWeek: 168,
      absenteeismFactor: 0.05,
      unplannedDowntimeBuffer: 0.10,
      isActive: true,
    },
  });

  const onSubmit = (data: LineFormData) => {
    if (editingLine) {
      updateLine(editingLine.id, data);
    } else {
      createLine(data);
    }
    setIsDialogOpen(false);
    setEditingLine(null);
    form.reset();
  };

  const handleEdit = (line: Line) => {
    setEditingLine(line);
    form.reset({
      divisionId: line.divisionId,
      code: line.code,
      name: line.name,
      pressTonnage: line.pressTonnage,
      shutHeightMin: line.shutHeightMin,
      shutHeightMax: line.shutHeightMax,
      isContinuous: line.isContinuous,
      grossHoursPerWeek: line.grossHoursPerWeek,
      absenteeismFactor: line.absenteeismFactor,
      unplannedDowntimeBuffer: line.unplannedDowntimeBuffer,
      isActive: line.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingLine(null);
    form.reset({
      divisionId: '',
      code: '',
      name: '',
      isContinuous: true,
      grossHoursPerWeek: 168,
      absenteeismFactor: 0.05,
      unplannedDowntimeBuffer: 0.10,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const columns: ColumnDef<Line>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'divisionId',
      header: 'Division',
      cell: ({ row }) => {
        const division = divisions.find((d) => d.id === row.original.divisionId);
        return division?.name || '-';
      },
    },
    {
      accessorKey: 'pressTonnage',
      header: 'Tonnage',
      cell: ({ row }) => row.original.pressTonnage || '-',
    },
    {
      accessorKey: 'isContinuous',
      header: 'Operation',
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.isContinuous
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.original.isContinuous ? '24/7' : '5-Day'}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to delete this line?')) {
                deleteLine(row.original.id);
              }
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Factory className="w-6 h-6 text-orange-500" />
            Production Lines
          </h2>
          <p className="text-gray-500">Manage production lines and capacity settings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Line
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLine ? 'Edit Line' : 'Add Line'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="divisionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Division</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select division" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {divisions.map((division) => (
                            <SelectItem key={division.id} value={division.id}>
                              {division.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., FMD1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., FMD Line 1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="pressTonnage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Press Tonnage (T)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="e.g., 1600"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shutHeightMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Shut Height (mm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shutHeightMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Shut Height (mm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="grossHoursPerWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gross Hours/Week</FormLabel>
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
                    name="absenteeismFactor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Absenteeism Factor</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="unplannedDowntimeBuffer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unplanned Downtime Buffer</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
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
                    name="isContinuous"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between pt-8">
                        <FormLabel>Continuous Operation</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Active</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  {editingLine ? 'Update' : 'Create'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={lines} />
    </div>
  );
}
