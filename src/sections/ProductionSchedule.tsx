import { useState } from 'react';
import { query } from '@/db/database';
import { useLines } from '@/hooks/useLines';
import { useDies } from '@/hooks/useDies';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Factory, Calendar, Clock, Play, CheckCircle2, AlertCircle } from 'lucide-react';

interface ScheduleItem {
  id: string;
  demand_id: string;
  line_id: string;
  die_id: string;
  part_id: string;
  planned_quantity: number;
  actual_quantity?: number;
  planned_start_date_time: string;
  planned_end_date_time: string;
  actual_start_date_time?: string;
  actual_end_date_time?: string;
  status: string;
  changeover_time: number;
  shots_required: number;
  shots_completed?: number;
  line_name?: string;
  line_code?: string;
  die_code?: string;
  die_name?: string;
  material_code?: string;
  part_description?: string;
}

export function ProductionSchedule() {
  const { lines } = useLines();
  useDies();
  const [selectedLine, setSelectedLine] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  const fetchSchedule = () => {
    let sql = `
      SELECT ps.*, l.name as line_name, l.code as line_code,
             d.code as die_code, d.name as die_name,
             p.material_code, p.description as part_description
      FROM production_schedule ps
      LEFT JOIN lines l ON ps.line_id = l.id
      LEFT JOIN dies d ON ps.die_id = d.id
      LEFT JOIN parts p ON ps.part_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (selectedLine && selectedLine !== 'all') {
      sql += ' AND ps.line_id = ?';
      params.push(selectedLine);
    }
    if (selectedStatus && selectedStatus !== 'all') {
      sql += ' AND ps.status = ?';
      params.push(selectedStatus);
    }

    sql += ' ORDER BY ps.planned_start_date_time DESC LIMIT 100';

    const results = query(sql, params);
    setSchedule(results as ScheduleItem[]);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      planned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      delayed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={colors[status] || colors.planned} variant="secondary">
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getProgressPercent = (item: ScheduleItem) => {
    if (!item.shots_completed || !item.shots_required) return 0;
    return Math.min(100, (item.shots_completed / item.shots_required) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Factory className="w-6 h-6 text-orange-500" />
            Production Schedule
          </h2>
          <p className="text-gray-500">View and manage production schedules</p>
        </div>
        <Button onClick={fetchSchedule}>Refresh</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Line</label>
              <Select value={selectedLine} onValueChange={setSelectedLine}>
                <SelectTrigger>
                  <SelectValue placeholder="All Lines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lines</SelectItem>
                  {lines.map((line) => (
                    <SelectItem key={line.id} value={line.id}>
                      {line.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchSchedule} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="gantt" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Gantt View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {schedule.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No schedule items found</p>
                <p className="text-sm text-gray-500">Apply filters and click Refresh to load data</p>
              </CardContent>
            </Card>
          ) : (
            schedule.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">
                          {item.part_description || item.material_code}
                        </h3>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Factory className="w-4 h-4" />
                          {item.line_code}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {item.die_code}
                        </span>
                        <span>
                          Qty: {item.planned_quantity.toLocaleString()} pcs
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>
                          Start: {new Date(item.planned_start_date_time).toLocaleString()}
                        </span>
                        <span>
                          End: {new Date(item.planned_end_date_time).toLocaleString()}
                        </span>
                      </div>
                      {item.status === 'in_progress' && (
                        <div className="w-64">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{getProgressPercent(item).toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${getProgressPercent(item)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'planned' && (
                        <Button size="sm" variant="outline">
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {item.status === 'in_progress' && (
                        <Button size="sm" variant="outline">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="gantt">
          <Card>
            <CardContent className="py-8 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Gantt chart view coming soon</p>
              <p className="text-sm text-gray-500">Visual timeline of production schedules</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
