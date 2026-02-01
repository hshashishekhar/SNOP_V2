import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  GanttChart,
  Cog,
  FileText,
  Route,
  Package,
  GitBranch,
  Activity,
  Settings,
  Bell,
  Search,
  Sun,
  ChevronDown,
  Zap,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Command Center', path: '/', icon: LayoutDashboard },
  { label: 'Planning', path: '/planning', icon: CalendarDays },
  { label: 'Capacity Gantt', path: '/capacity-gantt', icon: GanttChart },
  { label: 'Die Management', path: '/dies', icon: Cog },
  { label: 'Demand', path: '/demand', icon: FileText },
  { label: 'Routes', path: '/routes', icon: Route },
  { label: 'Inventory', path: '/inventory', icon: Package },
  { label: 'Scenarios', path: '/scenarios', icon: GitBranch },
  { label: 'KPIs', path: '/kpis', icon: Activity },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0f1c] flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-[#0d1321] border-r border-slate-800 transition-all duration-300',
          isSidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight text-white">Bharat Forge</span>
                <span className="text-xs text-slate-400">SNOP System</span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <Zap className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-16rem)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Active Alerts Section */}
        {isSidebarOpen && (
          <div className="mx-3 mb-3 p-4 bg-gradient-to-br from-red-950/50 to-red-900/30 rounded-xl border border-red-800/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-semibold text-red-300">Active Alerts</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-red-500">4</span>
              <span className="text-xs text-red-400">unacknowledged</span>
            </div>
            <div className="mt-1 text-xs text-red-400">
              <span className="text-red-500 font-semibold">2</span> critical
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          isSidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        {/* Header */}
        <header className="h-16 bg-[#0d1321] border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">
                {navItems.find((item) => item.path === location.pathname)?.label || 'Command Center'}
              </h1>
              <p className="text-xs text-slate-400">
                Bharat Forge SNOP System • <span className="text-blue-400">SNOP (13 Weeks)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search jobs, dies..."
                className="w-64 pl-10 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
              />
            </div>

            {/* SAP Sync Status */}
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>SAP Sync: Live</span>
            </div>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <Sun className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                4
              </Badge>
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <Settings className="w-5 h-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-slate-200 hover:text-white">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    PP
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-medium">Plant Planner</div>
                    <div className="text-xs text-slate-400">Pune Plant</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                <DropdownMenuItem className="text-slate-200 hover:bg-slate-700">Profile</DropdownMenuItem>
                <DropdownMenuItem className="text-slate-200 hover:bg-slate-700">Preferences</DropdownMenuItem>
                <DropdownMenuItem className="text-red-400 hover:bg-slate-700">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto bg-[#0a0f1c]">
          {children}
        </main>
      </div>
    </div>
  );
}
