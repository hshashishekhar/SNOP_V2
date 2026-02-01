import { useState, useEffect } from 'react';
import { query, execute } from '@/db/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Settings2, Database, Bell, Shield, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemSetting {
  key: string;
  value: string;
  description?: string;
}

export function Settings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = () => {
    const results = query('SELECT * FROM system_settings');
    setSettings(results as SystemSetting[]);
    const edited: Record<string, string> = {};
    results.forEach((s: SystemSetting) => {
      edited[s.key] = s.value;
    });
    setEditedSettings(edited);
  };

  const handleSave = (key: string) => {
    execute(
      'UPDATE system_settings SET value = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
      [editedSettings[key], 'admin', key]
    );
    fetchSettings();
  };

  const handleChange = (key: string, value: string) => {
    setEditedSettings((prev) => ({ ...prev, [key]: value }));
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    const category = setting.key.split('.')[0];
    if (!acc[category]) acc[category] = [];
    acc[category].push(setting);
    return acc;
  }, {} as Record<string, SystemSetting[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-blue-400" />
            System Settings
          </h2>
          <p className="text-slate-400">Configure system parameters and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="planning" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger
            value="planning"
            className={cn(
              'flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white',
              'text-slate-400 hover:text-slate-200'
            )}
          >
            <Database className="w-4 h-4" />
            Planning
          </TabsTrigger>
          <TabsTrigger
            value="utilization"
            className={cn(
              'flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white',
              'text-slate-400 hover:text-slate-200'
            )}
          >
            <Settings2 className="w-4 h-4" />
            Utilization
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className={cn(
              'flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white',
              'text-slate-400 hover:text-slate-200'
            )}
          >
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className={cn(
              'flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white',
              'text-slate-400 hover:text-slate-200'
            )}
          >
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="planning" className="space-y-4 mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Planning Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedSettings.planning?.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between gap-4 py-2 border-b border-slate-700/50 last:border-0">
                  <div className="flex-1">
                    <Label className="font-medium text-slate-200">
                      {setting.key.split('.').slice(1).join(' ').replace(/_/g, ' ').toUpperCase()}
                    </Label>
                    <p className="text-sm text-slate-400">{setting.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedSettings[setting.key] || ''}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="w-32 bg-slate-900/50 border-slate-600 text-slate-200 focus:border-blue-500"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSave(setting.key)}
                      disabled={editedSettings[setting.key] === setting.value}
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-700 disabled:text-slate-500"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!groupedSettings.planning?.length && (
                <p className="text-slate-500 text-center py-4">No planning settings found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilization" className="space-y-4 mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Utilization Targets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedSettings.utilization?.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between gap-4 py-2 border-b border-slate-700/50 last:border-0">
                  <div className="flex-1">
                    <Label className="font-medium text-slate-200">
                      {setting.key.split('.').slice(1).join(' ').replace(/_/g, ' ').toUpperCase()}
                    </Label>
                    <p className="text-sm text-slate-400">{setting.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedSettings[setting.key] || ''}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="w-32 bg-slate-900/50 border-slate-600 text-slate-200 focus:border-blue-500"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSave(setting.key)}
                      disabled={editedSettings[setting.key] === setting.value}
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-700 disabled:text-slate-500"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!groupedSettings.utilization?.length && (
                <p className="text-slate-500 text-center py-4">No utilization settings found</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Safety Stock Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedSettings.safety_stock?.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between gap-4 py-2 border-b border-slate-700/50 last:border-0">
                  <div className="flex-1">
                    <Label className="font-medium text-slate-200">
                      {setting.key.split('.').slice(1).join(' ').replace(/_/g, ' ').toUpperCase()}
                    </Label>
                    <p className="text-sm text-slate-400">{setting.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedSettings[setting.key] || ''}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="w-32 bg-slate-900/50 border-slate-600 text-slate-200 focus:border-blue-500"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSave(setting.key)}
                      disabled={editedSettings[setting.key] === setting.value}
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-700 disabled:text-slate-500"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!groupedSettings.safety_stock?.length && (
                <p className="text-slate-500 text-center py-4">No safety stock settings found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                <div>
                  <Label className="font-medium text-slate-200">Email Alerts</Label>
                  <p className="text-sm text-slate-400">Receive email notifications for critical alerts</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-blue-600" />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                <div>
                  <Label className="font-medium text-slate-200">Low Die Life Alert</Label>
                  <p className="text-sm text-slate-400">Notify when die life falls below 10%</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-blue-600" />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="font-medium text-slate-200">Capacity Threshold Alert</Label>
                  <p className="text-sm text-slate-400">Notify when utilization exceeds 95%</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-blue-600" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Approval Thresholds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedSettings.approval?.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between gap-4 py-2 border-b border-slate-700/50 last:border-0">
                  <div className="flex-1">
                    <Label className="font-medium text-slate-200">
                      {setting.key.split('.').slice(1).join(' ').replace(/_/g, ' ').toUpperCase()}
                    </Label>
                    <p className="text-sm text-slate-400">{setting.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedSettings[setting.key] || ''}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="w-32 bg-slate-900/50 border-slate-600 text-slate-200 focus:border-blue-500"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSave(setting.key)}
                      disabled={editedSettings[setting.key] === setting.value}
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-700 disabled:text-slate-500"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!groupedSettings.approval?.length && (
                <p className="text-slate-500 text-center py-4">No approval settings found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
