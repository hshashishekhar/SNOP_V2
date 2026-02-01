import { useState } from 'react';
import { useLocations } from '@/hooks/useLocations';
import { useDivisions } from '@/hooks/useDivisions';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Building2, Layers, Factory } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { ColumnDef } from '@tanstack/react-table';
import type { Location, Division, Line } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Location Form
interface LocationFormData {
  code: string;
  name: string;
  address?: string;
  isActive: boolean;
}

// Division Form
interface DivisionFormData {
  locationId: string;
  code: string;
  name: string;
  isActive: boolean;
}

// Line Form
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

function LocationsTab() {
  const { locations, isLoading, createLocation, updateLocation, deleteLocation } = useLocations();
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<LocationFormData>({
    defaultValues: {
      code: '',
      name: '',
      address: '',
      isActive: true,
    },
  });

  const onSubmit = (data: LocationFormData) => {
    if (editingLocation) {
      updateLocation(editingLocation.id, data);
    } else {
      createLocation(data);
    }
    setIsDialogOpen(false);
    setEditingLocation(null);
    form.reset();
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    form.reset({
      code: location.code,
      name: location.name,
      address: location.address || '',
      isActive: location.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingLocation(null);
    form.reset({
      code: '',
      name: '',
      address: '',
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const columns: ColumnDef<Location>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => row.original.address || '-',
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
              if (confirm('Are you sure you want to delete this location?')) {
                deleteLocation(row.original.id);
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
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-500" />
            Locations
          </h3>
          <p className="text-gray-500">Manage manufacturing locations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? 'Edit Location' : 'Add Location'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., MUN" />
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
                        <Input {...field} placeholder="e.g., Mundhawa" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Full address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  {editingLocation ? 'Update' : 'Create'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={locations} />
    </div>
  );
}

function DivisionsTab() {
  const { divisions, isLoading, createDivision, updateDivision, deleteDivision } = useDivisions();
  const { locations } = useLocations();
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<DivisionFormData>({
    defaultValues: {
      locationId: '',
      code: '',
      name: '',
      isActive: true,
    },
  });

  const onSubmit = (data: DivisionFormData) => {
    if (editingDivision) {
      updateDivision(editingDivision.id, data);
    } else {
      createDivision(data);
    }
    setIsDialogOpen(false);
    setEditingDivision(null);
    form.reset();
  };

  const handleEdit = (division: Division) => {
    setEditingDivision(division);
    form.reset({
      locationId: division.locationId,
      code: division.code,
      name: division.name,
      isActive: division.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingDivision(null);
    form.reset({
      locationId: '',
      code: '',
      name: '',
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const columns: ColumnDef<Division>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'locationId',
      header: 'Location',
      cell: ({ row }) => {
        const location = locations.find((l) => l.id === row.original.locationId);
        return location?.name || '-';
      },
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
              if (confirm('Are you sure you want to delete this division?')) {
                deleteDivision(row.original.id);
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
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-500" />
            Divisions
          </h3>
          <p className="text-gray-500">Manage divisions within locations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Division
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDivision ? 'Edit Division' : 'Add Division'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
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
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., FMD" />
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
                        <Input {...field} placeholder="e.g., Forging Division" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  {editingDivision ? 'Update' : 'Create'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={divisions} />
    </div>
  );
}

function LinesTab() {
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
      header: 'Press Tonnage',
      cell: ({ row }) => row.original.pressTonnage || '-',
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
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Factory className="w-5 h-5 text-orange-500" />
            Production Lines
          </h3>
          <p className="text-gray-500">Manage production lines within divisions</p>
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
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., L01" />
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
                        <Input {...field} placeholder="e.g., Press Line 1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="pressTonnage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Press Tonnage</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="e.g., 1000" />
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
                        <FormLabel>Min Shut Height</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="e.g., 200" />
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
                        <FormLabel>Max Shut Height</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="e.g., 500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="isContinuous"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
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
                <FormField
                  control={form.control}
                  name="grossHoursPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gross Hours Per Week</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="e.g., 168" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="absenteeismFactor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Absenteeism Factor</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="e.g., 0.05" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unplannedDowntimeBuffer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Downtime Buffer</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="e.g., 0.10" />
                        </FormControl>
                        <FormMessage />
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

export function Organizations() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-orange-500" />
          Organizations
        </h2>
        <p className="text-gray-500">Manage organizational hierarchy - Locations, Divisions, and Production Lines</p>
      </div>

      <Tabs defaultValue="locations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="divisions">Divisions</TabsTrigger>
          <TabsTrigger value="lines">Production Lines</TabsTrigger>
        </TabsList>
        <TabsContent value="locations">
          <LocationsTab />
        </TabsContent>
        <TabsContent value="divisions">
          <DivisionsTab />
        </TabsContent>
        <TabsContent value="lines">
          <LinesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
