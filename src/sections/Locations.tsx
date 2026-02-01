import { useState } from 'react';
import { useLocations } from '@/hooks/useLocations';
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
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { ColumnDef } from '@tanstack/react-table';
import type { Location } from '@/types';

interface LocationFormData {
  code: string;
  name: string;
  address?: string;
  isActive: boolean;
}

export function Locations() {
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
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-orange-500" />
            Locations
          </h2>
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
