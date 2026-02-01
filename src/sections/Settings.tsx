import { useState, useEffect } from 'react';
import { query, execute } from '@/db/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Settings2, Database, Bell, Shield, Save } from 'lucide-react';

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-orange-500" />
            System Settings
          </h2>
          <p className="text-gray-500">Configure system parameters and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="planning">
        <TabsList>
          <TabsTrigger value="planning" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Planning
          </TabsTrigger>
          <TabsTrigger value="utilization" className="flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Utilization
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="planning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Planning Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedSettings.planning?.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label className="font-medium">
                      {setting.key.split('.').slice(1).join(' ').replace(/_/g, ' ').toUpperCase()}
                    </Label>
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedSettings[setting.key] || ''}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="w-32"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSave(setting.key)}
                      disabled={editedSettings[setting.key] === setting.value}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utilization Targets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedSettings.utilization?.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label className="font-medium">
                      {setting.key.split('.').slice(1).join(' ').replace(/_/g, ' ').toUpperCase()}
                    </Label>
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedSettings[setting.key] || ''}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="w-32"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSave(setting.key)}
                      disabled={editedSettings[setting.key] === setting.value}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Safety Stock Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedSettings.safety_stock?.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label className="font-medium">
                      {setting.key.split('.').slice(1).join(' ').replace(/_/g, ' ').toUpperCase()}
                    </Label>
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedSettings[setting.key] || ''}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="w-32"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSave(setting.key)}
                      disabled={editedSettings[setting.key] === setting.value}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Email Alerts</Label>
                  <p className="text-sm text-gray-500">Receive email notifications for critical alerts</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Low Die Life Alert</Label>
                  <p className="text-sm text-gray-500">Notify when die life falls below 10%</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Capacity Threshold Alert</Label>
                  <p className="text-sm text-gray-500">Notify when utilization exceeds 95%</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval Thresholds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedSettings.approval?.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label className="font-medium">
                      {setting.key.split('.').slice(1).join(' ').replace(/_/g, ' ').toUpperCase()}
                    </Label>
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedSettings[setting.key] || ''}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="w-32"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSave(setting.key)}
                      disabled={editedSettings[setting.key] === setting.value}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
