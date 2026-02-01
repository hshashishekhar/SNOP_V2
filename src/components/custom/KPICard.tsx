import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const kpiCardVariants = cva(
  "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
  {
    variants: {
      variant: {
        default: "border-l-4 border-l-bf-blue",
        success: "border-l-4 border-l-bf-green",
        warning: "border-l-4 border-l-bf-amber",
        danger: "border-l-4 border-l-bf-red",
        info: "border-l-4 border-l-bf-steel",
        orange: "border-l-4 border-l-bf-orange",
      },
      size: {
        default: "",
        compact: "",
        expanded: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface KPICardProps extends VariantProps<typeof kpiCardVariants> {
  title: string;
  value: number | string;
  unit?: string;
  target?: number;
  trend?: 'up' | 'down' | 'flat';
  changePercent?: number;
  changeLabel?: string;
  icon?: React.ElementType;
  className?: string;
  format?: 'number' | 'currency' | 'percentage' | 'decimal';
  showProgress?: boolean;
  alert?: boolean;
  alertMessage?: string;
  subtitle?: string;
  loading?: boolean;
  metric?: string;
}

export function KPICard({
  title,
  value,
  unit = '',
  target,
  trend = 'flat',
  changePercent,
  changeLabel,
  icon: Icon,
  className,
  variant = 'default',
  size = 'default',
  format = 'number',
  showProgress = false,
  alert = false,
  alertMessage,
  subtitle,
  loading = false,
}: KPICardProps) {
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'decimal':
        return val.toFixed(2);
      default:
        return new Intl.NumberFormat('en-IN').format(val);
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-bf-green';
      case 'down':
        return 'text-bf-red';
      default:
        return 'text-muted-foreground';
    }
  };

  const getProgressColor = () => {
    if (typeof value !== 'number' || target === undefined) return 'bg-bf-blue';
    const percentage = (value / target) * 100;
    if (percentage >= 100) return 'bg-bf-green';
    if (percentage >= 80) return 'bg-bf-amber';
    return 'bg-bf-red';
  };

  const progressValue = typeof value === 'number' && target !== undefined
    ? Math.min((value / target) * 100, 100)
    : 0;

  if (loading) {
    return (
      <Card className={cn(kpiCardVariants({ variant, size }), className)}>
        <CardHeader className="pb-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-32 bg-muted rounded animate-pulse mb-2" />
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(kpiCardVariants({ variant, size }), className)}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '16px 16px',
        }} />
      </div>

      <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {alert && (
            <AlertCircle className="w-4 h-4 text-bf-red animate-pulse" />
          )}
          {Icon && (
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              variant === 'success' && "bg-bf-green/10 text-bf-green",
              variant === 'warning' && "bg-bf-amber/10 text-bf-amber",
              variant === 'danger' && "bg-bf-red/10 text-bf-red",
              variant === 'orange' && "bg-bf-orange/10 text-bf-orange",
              variant === 'default' && "bg-bf-blue/10 text-bf-blue",
              variant === 'info' && "bg-bf-steel/10 text-bf-steel",
            )}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative">
        {/* Main Value */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className={cn(
            "font-bold tracking-tight",
            size === 'compact' ? "text-xl" : "text-2xl lg:text-3xl"
          )}>
            {formatValue(value)}
          </span>
          {unit && format !== 'currency' && format !== 'percentage' && (
            <span className="text-sm text-muted-foreground font-medium">{unit}</span>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}

        {/* Target & Progress */}
        {(target !== undefined || showProgress) && (
          <div className="mt-3 space-y-2">
            {target !== undefined && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Target</span>
                <span className="font-medium">{formatValue(target)}</span>
              </div>
            )}
            {showProgress && target !== undefined && (
              <div className="relative">
                <Progress 
                  value={progressValue} 
                  className="h-1.5"
                />
                <div 
                  className={cn("absolute top-0 left-0 h-full rounded-full transition-all duration-500", getProgressColor())}
                  style={{ width: `${progressValue}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Trend Indicator */}
        {(changePercent !== undefined || changeLabel) && (
          <div className={cn("mt-3 flex items-center gap-2 text-xs", getTrendColor())}>
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className="font-semibold">
                {changePercent !== undefined ? `${Math.abs(changePercent).toFixed(1)}%` : changeLabel}
              </span>
            </div>
            {changePercent !== undefined && (
              <span className="text-muted-foreground">vs last period</span>
            )}
          </div>
        )}

        {/* Alert Message */}
        {alert && alertMessage && (
          <div className="mt-3 flex items-start gap-2 text-xs text-bf-red">
            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>{alertMessage}</span>
          </div>
        )}

        {/* Status Indicator */}
        {target !== undefined && typeof value === 'number' && !alert && (
          <div className="mt-3 flex items-center gap-2">
            {value >= target ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-bf-green" />
                <span className="text-xs text-bf-green font-medium">On Target</span>
              </>
            ) : value >= target * 0.9 ? (
              <>
                <Clock className="w-3.5 h-3.5 text-bf-amber" />
                <span className="text-xs text-bf-amber font-medium">Near Target</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-bf-red" />
                <span className="text-xs text-bf-red font-medium">Below Target</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Specialized KPI Cards for Bharat Forge SNOP
export function OTIFCard({ value, target = 98, ...props }: Partial<KPICardProps>) {
  const variant = typeof value === 'number' && value >= (target || 98) ? 'success' : 
                  typeof value === 'number' && value >= 95 ? 'warning' : 'danger';
  
  return (
    <KPICard
      title="OTIF Performance"
      value={value ?? 0}
      target={target}
      unit="%"
      format="percentage"
      variant={variant}
      showProgress
      icon={CheckCircle2}
      {...props}
    />
  );
}

export function RevenueCard({ value, ...props }: Partial<KPICardProps>) {
  return (
    <KPICard
      title="Revenue"
      value={value ?? 0}
      format="currency"
      variant="orange"
      icon={TrendingUp}
      {...props}
    />
  );
}

export function UtilizationCard({ value, target = 85, ...props }: Partial<KPICardProps>) {
  const variant = typeof value === 'number' && value >= 85 ? 'success' : 
                  typeof value === 'number' && value >= 70 ? 'warning' : 'danger';
  
  return (
    <KPICard
      title="Overall Utilization"
      value={value ?? 0}
      target={target}
      format="percentage"
      variant={variant}
      showProgress
      icon={Clock}
      {...props}
    />
  );
}

export function BottleneckCard({ value, ...props }: Partial<KPICardProps>) {
  const hasBottlenecks = typeof value === 'number' && value > 0;
  
  return (
    <KPICard
      title="Active Bottlenecks"
      value={value ?? 0}
      variant={hasBottlenecks ? 'danger' : 'success'}
      icon={AlertCircle}
      alert={hasBottlenecks}
      alertMessage={hasBottlenecks ? `${value} critical bottlenecks detected` : undefined}
      {...props}
    />
  );
}
