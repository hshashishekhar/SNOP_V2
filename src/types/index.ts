// Bharat Forge SNOP System - Type Definitions

// ==================== ORGANIZATIONAL HIERARCHY ====================

export interface Location {
  id: string;
  code: string;
  name: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Division {
  id: string;
  locationId: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Line {
  id: string;
  divisionId: string;
  code: string;
  name: string;
  pressTonnage?: number;
  shutHeightMin?: number;
  shutHeightMax?: number;
  isContinuous: boolean;
  grossHoursPerWeek: number; // 168 for 7-day, 120 for 5-day
  absenteeismFactor: number; // default 0.05
  unplannedDowntimeBuffer: number; // default 0.10
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== SHIFT MANAGEMENT ====================

export interface Shift {
  id: string;
  lineId: string;
  name: string; // Shift A, B, C
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  duration: number; // in hours
  crewType: 'full' | 'standard' | 'skeleton';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== DIE MANAGEMENT ====================

export type DieCategory = 'runner' | 'repeater' | 'stranger';
export type DieStatus = 'active' | 'inactive' | 'refurbishment' | 'repair' | 'storage';

export interface Die {
  id: string;
  code: string;
  name: string;
  lineId: string;
  category: DieCategory;
  totalLife: number; // in shots
  remainingLife: number; // in shots
  shotsPerHour: number;
  status: DieStatus;
  geometricCompatibility?: string;
  rawMaterialCode: string;
  rawMaterialQtyPerShot: number;
  rawMaterialLeadTime: number; // in days
  rawMaterialMOQ: number;
  alternateRawMaterialCodes?: string;
  lastRefurbishmentDate?: string;
  nextRefurbishmentDue?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DieUnavailability {
  id: string;
  dieId: string;
  reason: string;
  category: 'refurbishment' | 'repair' | 'inspection' | 'trial' | 'coating' | 'storage' | 'other';
  startDateTime: string;
  endDateTime: string;
  duration: number;
  durationUnit: 'hours' | 'days' | 'weeks' | 'months';
  recurrence?: 'one-time' | 'daily' | 'weekly' | 'monthly';
  recurrenceEndDate?: string;
  impactType: 'full' | 'partial';
  efficiencyLossPercent?: number;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  status: 'draft' | 'approved' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// ==================== PLANNED DOWNTIME ====================

export interface LineDowntime {
  id: string;
  lineId: string;
  reason: string;
  category: 'maintenance' | 'overhaul' | 'holiday' | 'energy' | 'audit' | 'training' | 'other';
  startDateTime: string;
  endDateTime: string;
  duration: number;
  durationUnit: 'hours' | 'days' | 'weeks' | 'months';
  recurrence?: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrenceEndDate?: string;
  impactType: 'full' | 'partial';
  capacityReductionPercent?: number;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  status: 'draft' | 'approved' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// ==================== PART MASTER & ROUTES ====================

export type RouteType = 'A' | 'B' | 'C' | 'D' | 'E';

export interface Part {
  id: string;
  materialCode: string;
  pCode?: string;
  description: string;
  customer?: string;
  division?: string;
  routeType: RouteType;
  piecesPerShot: number;
  cycleTimeForging: number; // in seconds
  cycleTimeHT?: number; // in hours
  cycleTimeMachining?: number; // in minutes
  yieldFactor: number; // e.g., 0.95 for 95% yield
  scrapFactor: number; // e.g., 0.05 for 5% scrap
  safetyStockDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RouteStep {
  id: string;
  partId: string;
  sequence: number;
  operationCode: string;
  department: string;
  resourceType: 'line' | 'furnace' | 'machine';
  resourceId?: string;
  cycleTime: number;
  queueTime: number;
  transitTime: number;
  yieldFactor: number;
  requiresApproval: boolean;
  requiresCertification: boolean;
  certificationType?: string;
}

// ==================== INVENTORY ====================

export type InventoryStage = 'raw_material' | 'forged' | 'heat_treated' | 'processed' | 'machined' | 'finished_goods';
export type InventoryStatus = 'available' | 'allocated' | 'in_transit' | 'inspection' | 'consumed' | 'defective' | 'godown' | 'mrb';

export interface Inventory {
  id: string;
  partId?: string;
  dieId?: string;
  rawMaterialCode?: string;
  stage: InventoryStage;
  status: InventoryStatus;
  quantity: number;
  locationId: string;
  divisionId?: string;
  lineId?: string;
  lotNumber?: string;
  batchNumber?: string;
  expiryDate?: string;
  valuationRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  inventoryId: string;
  transactionType: 'receipt' | 'issue' | 'transfer' | 'adjustment' | 'consumption';
  quantity: number;
  fromStatus?: InventoryStatus;
  toStatus?: InventoryStatus;
  fromStage?: InventoryStage;
  toStage?: InventoryStage;
  referenceType?: 'demand' | 'production' | 'die' | 'manual';
  referenceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// ==================== DEMAND ====================

export type DemandType = 'firm_order' | 'forecast' | 'internal_indent' | 'safety_stock' | 'npd_trial';
export type DemandPriority = 1 | 2 | 3 | 4 | 5; // 1 = highest (Aerospace/Defence)
export type DemandStatus = 'draft' | 'approved' | 'scheduled' | 'in_production' | 'completed' | 'cancelled';

export interface Demand {
  id: string;
  sapOrderNumber?: string;
  scheduleLineNumber?: string;
  materialCode: string;
  partId: string;
  customer?: string;
  divisionId: string;
  quantity: number;
  requestedDeliveryDate: string; // CDD
  demandType: DemandType;
  priority: DemandPriority;
  indentType?: 'machining' | 'processing' | 'transfer';
  isSafetyStock: boolean;
  isNPD: boolean;
  netQuantity: number;
  availableInventory: number;
  wipQuantity: number;
  inTransitQuantity: number;
  status: DemandStatus;
  feasibilityStatus: 'executable' | 'partial' | 'blocked';
  feasibilityReason?: string;
  assignedLineId?: string;
  assignedDieId?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  uploadedBy: string;
  uploadedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DemandUpload {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  status: 'uploading' | 'validating' | 'staging' | 'approved' | 'rejected';
  notes?: string;
}

// ==================== PRODUCTION SCHEDULE ====================

export interface ProductionSchedule {
  id: string;
  demandId: string;
  lineId: string;
  dieId: string;
  partId: string;
  plannedQuantity: number;
  actualQuantity?: number;
  plannedStartDateTime: string;
  plannedEndDateTime: string;
  actualStartDateTime?: string;
  actualEndDateTime?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  changeoverTime: number;
  shotsRequired: number;
  shotsCompleted?: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== SCENARIO PLANNING ====================

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  baseScenarioId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isLocked: boolean;
  isPromoted: boolean;
  promotedAt?: string;
  promotedBy?: string;
  // KPI snapshot
  projectedRevenue?: number;
  projectedProfit?: number;
  projectedUtilization?: number;
  projectedOTIF?: number;
}

export interface ScenarioChange {
  id: string;
  scenarioId: string;
  changeType: 'demand_qty' | 'demand_date' | 'line_downtime' | 'die_downtime' | 'priority' | 'route' | 'capacity';
  entityType: 'demand' | 'line' | 'die' | 'part';
  entityId: string;
  oldValue: string;
  newValue: string;
  createdAt: string;
}

// ==================== SHOP FLOOR FEEDBACK ====================

export interface ProductionConfirmation {
  id: string;
  scheduleId: string;
  productionOrderId: string;
  lineId: string;
  dieId: string;
  partId: string;
  confirmedBy: string;
  confirmedAt: string;
  plannedQuantity: number;
  goodQuantity: number;
  defectiveQuantity: number;
  reworkQuantity: number;
  shotsCompleted: number;
  actualCycleTime: number;
  downtimeMinutes: number;
  downtimeReason?: string;
  notes?: string;
  status: 'draft' | 'submitted' | 'approved';
}

export interface DieLifeUpdate {
  id: string;
  dieId: string;
  productionConfirmationId: string;
  shotsUsed: number;
  remainingLifeBefore: number;
  remainingLifeAfter: number;
  recordedBy: string;
  recordedAt: string;
  notes?: string;
}

export interface QualityCheck {
  id: string;
  productionConfirmationId: string;
  checkType: 'in_process' | 'final' | 'customer_specific';
  result: 'pass' | 'fail' | 'conditional';
  defectCode?: string;
  defectDescription?: string;
  quantityChecked: number;
  quantityAccepted: number;
  quantityRejected: number;
  checkedBy: string;
  checkedAt: string;
  notes?: string;
}

// ==================== CAPACITY & UTILIZATION ====================

export interface CapacityCalculation {
  lineId: string;
  weekStartDate: string;
  grossHours: number;
  plannedDowntimeHours: number;
  changeoverOverheadHours: number;
  absenteeismHours: number;
  effectiveHours: number;
  utilizedHours: number;
  utilizationPercent: number;
  availableCapacity: number; // in tons or shots
  plannedLoad: number;
  remainingCapacity: number;
}

// ==================== USER & SYSTEM ====================

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface SystemSetting {
  key: string;
  value: string;
  description?: string;
  updatedBy: string;
  updatedAt: string;
}

// ==================== DASHBOARD & REPORTING ====================

export interface DashboardKPI {
  metric: string;
  value: number;
  target?: number;
  unit: string;
  trend: 'up' | 'down' | 'flat';
  changePercent?: number;
  period: string;
}

export interface BottleneckAlert {
  id: string;
  type: 'line' | 'die' | 'furnace' | 'material' | 'system';
  entityId: string;
  entityName: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  suggestedAction?: string;
  detectedAt: string;
  resolvedAt?: string;
  isResolved: boolean;
  location?: string;
  division?: string;
  line?: string;
  affectedOrders?: string[];
}

// ==================== GANTT CHART ====================

export interface GanttTask {
  id: string;
  name: string;
  resourceId: string;
  resourceName: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  type: 'production' | 'changeover' | 'downtime' | 'maintenance' | 'die_unavailable';
  status: string;
  color: string;
  details?: Record<string, any>;
}

export interface GanttResource {
  id: string;
  name: string;
  type: 'line' | 'die' | 'furnace';
  group?: string;
}
