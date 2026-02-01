import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Shield,
  UserCog,
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';

// Mock data for users
const mockUsers = [
  {
    id: 'user-1',
    name: 'John Smith',
    email: 'john.smith@bharatforge.com',
    username: 'jsmith',
    role: 'admin',
    department: 'IT',
    isActive: true,
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    permissions: ['full_access'],
  },
  {
    id: 'user-2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@bharatforge.com',
    username: 'sjohnson',
    role: 'planner',
    department: 'Production Planning',
    isActive: true,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    permissions: ['planning', 'view_reports'],
  },
  {
    id: 'user-3',
    name: 'Mike Chen',
    email: 'mike.chen@bharatforge.com',
    username: 'mchen',
    role: 'operator',
    department: 'Shop Floor',
    isActive: true,
    lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    permissions: ['shop_floor', 'view_schedule'],
  },
  {
    id: 'user-4',
    name: 'Priya Patel',
    email: 'priya.patel@bharatforge.com',
    username: 'ppatel',
    role: 'supervisor',
    department: 'Quality Control',
    isActive: false,
    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ['quality', 'view_reports', 'approve_changes'],
  },
];

// Mock data for roles
const mockRoles = [
  {
    id: 'role-1',
    name: 'Admin',
    description: 'Full system access and user management',
    userCount: 2,
    permissions: ['full_access', 'user_management', 'system_settings'],
  },
  {
    id: 'role-2',
    name: 'Planner',
    description: 'Production planning and scheduling',
    userCount: 5,
    permissions: ['planning', 'scheduling', 'view_reports'],
  },
  {
    id: 'role-3',
    name: 'Supervisor',
    description: 'Supervise production and approve changes',
    userCount: 8,
    permissions: ['supervise', 'approve_changes', 'view_reports', 'shop_floor'],
  },
  {
    id: 'role-4',
    name: 'Operator',
    description: 'Shop floor operations and confirmations',
    userCount: 45,
    permissions: ['shop_floor', 'view_schedule'],
  },
];

// Available permissions
const availablePermissions = [
  { id: 'full_access', label: 'Full Access', description: 'Complete system access' },
  { id: 'user_management', label: 'User Management', description: 'Manage users and roles' },
  { id: 'system_settings', label: 'System Settings', description: 'Configure system settings' },
  { id: 'planning', label: 'Planning', description: 'Access planning module' },
  { id: 'scheduling', label: 'Scheduling', description: 'Create and modify schedules' },
  { id: 'supervise', label: 'Supervision', description: 'Supervise production activities' },
  { id: 'approve_changes', label: 'Approve Changes', description: 'Approve production changes' },
  { id: 'shop_floor', label: 'Shop Floor', description: 'Access shop floor module' },
  { id: 'view_schedule', label: 'View Schedule', description: 'View production schedules' },
  { id: 'view_reports', label: 'View Reports', description: 'Access reports and analytics' },
  { id: 'quality', label: 'Quality Control', description: 'Access quality control module' },
];

interface UserFormData {
  name: string;
  email: string;
  username: string;
  role: string;
  department: string;
  isActive: boolean;
}

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

export function UserManagement() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof mockUsers[0] | null>(null);
  const [editingRole, setEditingRole] = useState<typeof mockRoles[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const userForm = useForm<UserFormData>({
    defaultValues: {
      name: '',
      email: '',
      username: '',
      role: '',
      department: '',
      isActive: true,
    },
  });

  const roleForm = useForm<RoleFormData>({
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  });

  const handleAddUser = () => {
    setEditingUser(null);
    userForm.reset({
      name: '',
      email: '',
      username: '',
      role: '',
      department: '',
      isActive: true,
    });
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: typeof mockUsers[0]) => {
    setEditingUser(user);
    userForm.reset({
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      department: user.department,
      isActive: user.isActive,
    });
    setIsUserDialogOpen(true);
  };

  const handleAddRole = () => {
    setEditingRole(null);
    roleForm.reset({
      name: '',
      description: '',
      permissions: [],
    });
    setIsRoleDialogOpen(true);
  };

  const handleEditRole = (role: typeof mockRoles[0]) => {
    setEditingRole(role);
    roleForm.reset({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setIsRoleDialogOpen(true);
  };

  const onSubmitUser = (data: UserFormData) => {
    console.log('User data:', data);
    setIsUserDialogOpen(false);
  };

  const onSubmitRole = (data: RoleFormData) => {
    console.log('Role data:', data);
    setIsRoleDialogOpen(false);
  };

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'planner':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'supervisor':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'operator':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-500" />
            User Management
          </h1>
          <p className="text-slate-400 text-sm">
            Manage users, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'users' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('users')}
            className={activeTab === 'users' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600 text-slate-300 hover:bg-slate-800'}
          >
            <Users className="w-4 h-4 mr-2" />
            Users
          </Button>
          <Button
            variant={activeTab === 'roles' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('roles')}
            className={activeTab === 'roles' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600 text-slate-300 hover:bg-slate-800'}
          >
            <Shield className="w-4 h-4 mr-2" />
            Roles
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-slate-200">{mockUsers.length}</p>
                <p className="text-xs text-slate-400">Total Users</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-700/50 text-blue-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-green-400">
                  {mockUsers.filter((u) => u.isActive).length}
                </p>
                <p className="text-xs text-slate-400">Active Users</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-700/50 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-slate-200">{mockRoles.length}</p>
                <p className="text-xs text-slate-400">Roles</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-700/50 text-purple-400">
                <Shield className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-slate-200">{availablePermissions.length}</p>
                <p className="text-xs text-slate-400">Permissions</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-700/50 text-amber-400">
                <UserCog className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
              />
            </div>
            <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-800/50">
                      <TableHead className="text-slate-300">User</TableHead>
                      <TableHead className="text-slate-300">Username</TableHead>
                      <TableHead className="text-slate-300">Role</TableHead>
                      <TableHead className="text-slate-300">Department</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Last Login</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-slate-700 hover:bg-slate-800/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                              {user.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium text-slate-200">{user.name}</p>
                              <p className="text-xs text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">{user.username}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(getRoleBadgeColor(user.role))}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">{user.department}</TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <div className="flex items-center gap-1 text-green-400">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-sm">Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-400">
                              <XCircle className="w-4 h-4" />
                              <span className="text-sm">Inactive</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {new Date(user.lastLogin).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="text-slate-400 hover:text-slate-200"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this user?')) {
                                  console.log('Delete user:', user.id);
                                }
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <Button onClick={handleAddRole} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockRoles.map((role) => (
              <Card key={role.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-slate-100">
                      {role.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this role?')) {
                            console.log('Delete role:', role.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">{role.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-400">Users with this role:</span>
                    <span className="text-lg font-bold text-slate-200">{role.userCount}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Permissions</span>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission) => (
                        <Badge
                          key={permission}
                          variant="outline"
                          className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs"
                        >
                          {permission.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-lg bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-100">
              {editingUser ? 'Edit User' : 'Add User'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingUser ? 'Update user details and permissions' : 'Create a new user account'}
            </DialogDescription>
          </DialogHeader>
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(onSubmitUser)} className="space-y-4">
              <FormField
                control={userForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., John Smith" className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={userForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="user@bharatforge.com" className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Username</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="username" className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={userForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {mockRoles.map((role) => (
                            <SelectItem key={role.id} value={role.name.toLowerCase()} className="text-slate-200 focus:bg-slate-700 focus:text-slate-100">
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Department</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Production" className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={userForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-slate-700 p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-slate-300">Active Account</FormLabel>
                      <p className="text-xs text-slate-400">User can log in and access the system</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUserDialogOpen(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-lg bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-100">
              {editingRole ? 'Edit Role' : 'Add Role'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingRole ? 'Update role details and permissions' : 'Create a new role with permissions'}
            </DialogDescription>
          </DialogHeader>
          <Form {...roleForm}>
            <form onSubmit={roleForm.handleSubmit(onSubmitRole)} className="space-y-4">
              <FormField
                control={roleForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Role Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Production Manager" className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={roleForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Description</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Brief description of this role" className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={roleForm.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Permissions</FormLabel>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-700 rounded-md p-3">
                      {availablePermissions.map((permission) => (
                        <FormField
                          key={permission.id}
                          control={roleForm.control}
                          name="permissions"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={permission.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value?.includes(permission.id)}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      const value = field.value || [];
                                      const newValue = checked
                                        ? [...value, permission.id]
                                        : value.filter((v) => v !== permission.id);
                                      field.onChange(newValue);
                                    }}
                                    className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-600"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm text-slate-300">
                                    {permission.label}
                                  </FormLabel>
                                  <p className="text-xs text-slate-500">{permission.description}</p>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRoleDialogOpen(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingRole ? 'Update Role' : 'Create Role'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
