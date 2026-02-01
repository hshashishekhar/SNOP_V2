import { AlertTriangle, AlertCircle, Info, CheckCircle2, X, Clock, MapPin, Factory, Wrench, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BottleneckAlert } from '@/types';
import { cva, type VariantProps } from 'class-variance-authority';

const alertCardVariants = cva(
  "border-l-4 transition-all duration-200 hover:shadow-md",
  {
    variants: {
      severity: {
        critical: "border-l-bf-red bg-red-50/80 dark:bg-red-950/20",
        high: "border-l-bf-orange bg-orange-50/80 dark:bg-orange-950/20",
        medium: "border-l-bf-amber bg-yellow-50/80 dark:bg-yellow-950/20",
        low: "border-l-bf-blue bg-blue-50/80 dark:bg-blue-950/20",
      },
    },
    defaultVariants: {
      severity: "low",
    },
  }
);

interface AlertCardProps extends VariantProps<typeof alertCardVariants> {
  alert: BottleneckAlert;
  onResolve?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onClick?: (alert: BottleneckAlert) => void;
  compact?: boolean;
  showActions?: boolean;
}

export function AlertCard({ 
  alert, 
  onResolve, 
  onDismiss, 
  onClick,
  compact = false,
  showActions = true,
}: AlertCardProps) {
  const getSeverityIcon = () => {
    switch (alert.severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-bf-red" />;
      case 'high':
        return <AlertCircle className="w-5 h-5 text-bf-orange" />;
      case 'medium':
        return <Info className="w-5 h-5 text-bf-amber" />;
      default:
        return <Info className="w-5 h-5 text-bf-blue" />;
    }
  };

  const getTypeIcon = () => {
    switch (alert.type) {
      case 'line':
        return <Factory className="w-4 h-4" />;
      case 'die':
        return <Wrench className="w-4 h-4" />;
      case 'furnace':
        return <Package className="w-4 h-4" />;
      case 'material':
        return <Package className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityBadge = () => {
    const variants = {
      critical: "bg-bf-red/10 text-bf-red border-bf-red/20",
      high: "bg-bf-orange/10 text-bf-orange border-bf-orange/20",
      medium: "bg-bf-amber/10 text-bf-amber border-bf-amber/20",
      low: "bg-bf-blue/10 text-bf-blue border-bf-blue/20",
    };

    return (
      <Badge variant="outline" className={cn("text-xs font-medium", variants[alert.severity])}>
        {alert.severity.toUpperCase()}
      </Badge>
    );
  };

  const getTypeLabel = () => {
    const labels: Record<string, string> = {
      line: 'Line',
      die: 'Die',
      furnace: 'Furnace',
      material: 'Material',
      system: 'System',
    };
    return labels[alert.type] || 'System';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg cursor-pointer",
          alertCardVariants({ severity: alert.severity }),
          "hover:bg-opacity-100"
        )}
        onClick={() => onClick?.(alert)}
      >
        <div className="flex-shrink-0 mt-0.5">
          {getSeverityIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm truncate">{alert.entityName}</span>
            {getSeverityBadge()}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{alert.description}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatTime(alert.detectedAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(alertCardVariants({ severity: alert.severity }))}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {getSeverityIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-sm font-semibold">
                  {getTypeLabel()} Alert: {alert.entityName}
                </CardTitle>
                {getSeverityBadge()}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(alert.detectedAt)}
                </span>
                {alert.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {alert.location}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {onResolve && !alert.isResolved && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onResolve(alert.id);
                  }}
                  className="h-8 w-8 p-0 text-bf-green hover:text-bf-green hover:bg-bf-green/10"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              )}
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(alert.id);
                  }}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-foreground mb-3">{alert.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs">
            <span className="text-muted-foreground font-medium flex-shrink-0">Impact:</span>
            <span className="text-foreground">{alert.impact}</span>
          </div>
          
          {alert.suggestedAction && (
            <div className="flex items-start gap-2 text-xs">
              <span className="text-muted-foreground font-medium flex-shrink-0">Suggested:</span>
              <span className="text-foreground">{alert.suggestedAction}</span>
            </div>
          )}
          
          {alert.affectedOrders && alert.affectedOrders.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <span className="text-xs text-muted-foreground font-medium">
                Affected Orders ({alert.affectedOrders.length}):
              </span>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {alert.affectedOrders.slice(0, 5).map((order, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {order}
                  </Badge>
                ))}
                {alert.affectedOrders.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{alert.affectedOrders.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Alert Summary Component for Dashboard
interface AlertSummaryProps {
  alerts: BottleneckAlert[];
  onViewAll?: () => void;
  maxDisplay?: number;
}

export function AlertSummary({ alerts, onViewAll, maxDisplay = 5 }: AlertSummaryProps) {
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;
  const mediumCount = alerts.filter(a => a.severity === 'medium').length;
  
  const displayedAlerts = alerts.slice(0, maxDisplay);

  return (
    <div className="space-y-3">
      {/* Summary Stats */}
      <div className="flex items-center gap-2">
        {criticalCount > 0 && (
          <Badge className="bg-bf-red/10 text-bf-red border-bf-red/20">
            {criticalCount} Critical
          </Badge>
        )}
        {highCount > 0 && (
          <Badge className="bg-bf-orange/10 text-bf-orange border-bf-orange/20">
            {highCount} High
          </Badge>
        )}
        {mediumCount > 0 && (
          <Badge className="bg-bf-amber/10 text-bf-amber border-bf-amber/20">
            {mediumCount} Medium
          </Badge>
        )}
        {alerts.length === 0 && (
          <Badge variant="outline" className="bg-bf-green/10 text-bf-green border-bf-green/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            All Clear
          </Badge>
        )}
      </div>

      {/* Alert List */}
      <div className="space-y-2">
        {displayedAlerts.map((alert) => (
          <AlertCard 
            key={alert.id} 
            alert={alert} 
            compact 
            showActions={false}
          />
        ))}
      </div>

      {/* View All Link */}
      {alerts.length > maxDisplay && onViewAll && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-xs"
          onClick={onViewAll}
        >
          View all {alerts.length} alerts
        </Button>
      )}
    </div>
  );
}
