// Bharat Forge SNOP System - SQLite Database Schema

export const CREATE_TABLES_SQL = `
-- ==================== ORGANIZATIONAL HIERARCHY ====================

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS divisions (
  id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id),
  UNIQUE(location_id, code)
);

CREATE TABLE IF NOT EXISTS lines (
  id TEXT PRIMARY KEY,
  division_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  press_tonnage REAL,
  shut_height_min REAL,
  shut_height_max REAL,
  is_continuous INTEGER DEFAULT 1,
  gross_hours_per_week REAL DEFAULT 168,
  absenteeism_factor REAL DEFAULT 0.05,
  unplanned_downtime_buffer REAL DEFAULT 0.10,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (division_id) REFERENCES divisions(id),
  UNIQUE(division_id, code)
);

-- ==================== SHIFT MANAGEMENT ====================

CREATE TABLE IF NOT EXISTS shifts (
  id TEXT PRIMARY KEY,
  line_id TEXT NOT NULL,
  name TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration REAL NOT NULL,
  crew_type TEXT DEFAULT 'standard',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (line_id) REFERENCES lines(id)
);

-- ==================== DIE MANAGEMENT ====================

CREATE TABLE IF NOT EXISTS dies (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  line_id TEXT NOT NULL,
  category TEXT DEFAULT 'repeater',
  total_life INTEGER NOT NULL,
  remaining_life INTEGER NOT NULL,
  shots_per_hour REAL NOT NULL,
  status TEXT DEFAULT 'active',
  geometric_compatibility TEXT,
  raw_material_code TEXT NOT NULL,
  raw_material_qty_per_shot REAL NOT NULL,
  raw_material_lead_time INTEGER DEFAULT 0,
  raw_material_moq REAL DEFAULT 0,
  alternate_raw_material_codes TEXT,
  last_refurbishment_date TEXT,
  next_refurbishment_due TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (line_id) REFERENCES lines(id)
);

CREATE TABLE IF NOT EXISTS die_unavailability (
  id TEXT PRIMARY KEY,
  die_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  start_date_time TEXT NOT NULL,
  end_date_time TEXT NOT NULL,
  duration REAL NOT NULL,
  duration_unit TEXT DEFAULT 'hours',
  recurrence TEXT,
  recurrence_end_date TEXT,
  impact_type TEXT DEFAULT 'full',
  efficiency_loss_percent REAL,
  notes TEXT,
  created_by TEXT NOT NULL,
  approved_by TEXT,
  status TEXT DEFAULT 'draft',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (die_id) REFERENCES dies(id)
);

-- ==================== PLANNED DOWNTIME ====================

CREATE TABLE IF NOT EXISTS line_downtime (
  id TEXT PRIMARY KEY,
  line_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  start_date_time TEXT NOT NULL,
  end_date_time TEXT NOT NULL,
  duration REAL NOT NULL,
  duration_unit TEXT DEFAULT 'hours',
  recurrence TEXT,
  recurrence_end_date TEXT,
  impact_type TEXT DEFAULT 'full',
  capacity_reduction_percent REAL,
  notes TEXT,
  created_by TEXT NOT NULL,
  approved_by TEXT,
  status TEXT DEFAULT 'draft',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (line_id) REFERENCES lines(id)
);

-- ==================== PART MASTER & ROUTES ====================

CREATE TABLE IF NOT EXISTS parts (
  id TEXT PRIMARY KEY,
  material_code TEXT UNIQUE NOT NULL,
  p_code TEXT,
  description TEXT NOT NULL,
  customer TEXT,
  division TEXT,
  route_type TEXT DEFAULT 'B',
  pieces_per_shot INTEGER DEFAULT 1,
  cycle_time_forging REAL DEFAULT 0,
  cycle_time_ht REAL,
  cycle_time_machining REAL,
  yield_factor REAL DEFAULT 0.95,
  scrap_factor REAL DEFAULT 0.05,
  safety_stock_days INTEGER DEFAULT 2,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS route_steps (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  operation_code TEXT NOT NULL,
  department TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  cycle_time REAL DEFAULT 0,
  queue_time REAL DEFAULT 0,
  transit_time REAL DEFAULT 0,
  yield_factor REAL DEFAULT 1.0,
  requires_approval INTEGER DEFAULT 0,
  requires_certification INTEGER DEFAULT 0,
  certification_type TEXT,
  FOREIGN KEY (part_id) REFERENCES parts(id),
  UNIQUE(part_id, sequence)
);

-- ==================== INVENTORY ====================

CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  part_id TEXT,
  die_id TEXT,
  raw_material_code TEXT,
  stage TEXT DEFAULT 'raw_material',
  status TEXT DEFAULT 'available',
  quantity REAL NOT NULL DEFAULT 0,
  location_id TEXT NOT NULL,
  division_id TEXT,
  line_id TEXT,
  lot_number TEXT,
  batch_number TEXT,
  expiry_date TEXT,
  valuation_rate REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES parts(id),
  FOREIGN KEY (die_id) REFERENCES dies(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  FOREIGN KEY (division_id) REFERENCES divisions(id),
  FOREIGN KEY (line_id) REFERENCES lines(id)
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id TEXT PRIMARY KEY,
  inventory_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  quantity REAL NOT NULL,
  from_status TEXT,
  to_status TEXT,
  from_stage TEXT,
  to_stage TEXT,
  reference_type TEXT,
  reference_id TEXT,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inventory_id) REFERENCES inventory(id)
);

-- ==================== DEMAND ====================

CREATE TABLE IF NOT EXISTS demand (
  id TEXT PRIMARY KEY,
  sap_order_number TEXT,
  schedule_line_number TEXT,
  material_code TEXT NOT NULL,
  part_id TEXT NOT NULL,
  customer TEXT,
  division_id TEXT NOT NULL,
  quantity REAL NOT NULL,
  requested_delivery_date TEXT NOT NULL,
  demand_type TEXT DEFAULT 'firm_order',
  priority INTEGER DEFAULT 3,
  indent_type TEXT,
  is_safety_stock INTEGER DEFAULT 0,
  is_npd INTEGER DEFAULT 0,
  net_quantity REAL,
  available_inventory REAL DEFAULT 0,
  wip_quantity REAL DEFAULT 0,
  in_transit_quantity REAL DEFAULT 0,
  status TEXT DEFAULT 'draft',
  feasibility_status TEXT DEFAULT 'executable',
  feasibility_reason TEXT,
  assigned_line_id TEXT,
  assigned_die_id TEXT,
  planned_start_date TEXT,
  planned_end_date TEXT,
  uploaded_by TEXT NOT NULL,
  uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
  approved_by TEXT,
  approved_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES parts(id),
  FOREIGN KEY (division_id) REFERENCES divisions(id),
  FOREIGN KEY (assigned_line_id) REFERENCES lines(id),
  FOREIGN KEY (assigned_die_id) REFERENCES dies(id)
);

CREATE TABLE IF NOT EXISTS demand_uploads (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
  total_rows INTEGER DEFAULT 0,
  valid_rows INTEGER DEFAULT 0,
  invalid_rows INTEGER DEFAULT 0,
  status TEXT DEFAULT 'uploading',
  notes TEXT
);

-- ==================== PRODUCTION SCHEDULE ====================

CREATE TABLE IF NOT EXISTS production_schedule (
  id TEXT PRIMARY KEY,
  demand_id TEXT NOT NULL,
  line_id TEXT NOT NULL,
  die_id TEXT NOT NULL,
  part_id TEXT NOT NULL,
  planned_quantity REAL NOT NULL,
  actual_quantity REAL,
  planned_start_date_time TEXT NOT NULL,
  planned_end_date_time TEXT NOT NULL,
  actual_start_date_time TEXT,
  actual_end_date_time TEXT,
  status TEXT DEFAULT 'planned',
  changeover_time REAL DEFAULT 0,
  shots_required INTEGER NOT NULL,
  shots_completed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (demand_id) REFERENCES demand(id),
  FOREIGN KEY (line_id) REFERENCES lines(id),
  FOREIGN KEY (die_id) REFERENCES dies(id),
  FOREIGN KEY (part_id) REFERENCES parts(id)
);

-- ==================== SCENARIO PLANNING ====================

CREATE TABLE IF NOT EXISTS scenarios (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_scenario_id TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  is_locked INTEGER DEFAULT 0,
  is_promoted INTEGER DEFAULT 0,
  promoted_at TEXT,
  promoted_by TEXT,
  projected_revenue REAL,
  projected_profit REAL,
  projected_utilization REAL,
  projected_otif REAL,
  FOREIGN KEY (base_scenario_id) REFERENCES scenarios(id)
);

CREATE TABLE IF NOT EXISTS scenario_changes (
  id TEXT PRIMARY KEY,
  scenario_id TEXT NOT NULL,
  change_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
);

-- ==================== SHOP FLOOR FEEDBACK ====================

CREATE TABLE IF NOT EXISTS production_confirmations (
  id TEXT PRIMARY KEY,
  schedule_id TEXT NOT NULL,
  production_order_id TEXT NOT NULL,
  line_id TEXT NOT NULL,
  die_id TEXT NOT NULL,
  part_id TEXT NOT NULL,
  confirmed_by TEXT NOT NULL,
  confirmed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  planned_quantity REAL NOT NULL,
  good_quantity REAL NOT NULL,
  defective_quantity REAL DEFAULT 0,
  rework_quantity REAL DEFAULT 0,
  shots_completed INTEGER NOT NULL,
  actual_cycle_time REAL,
  downtime_minutes INTEGER DEFAULT 0,
  downtime_reason TEXT,
  notes TEXT,
  status TEXT DEFAULT 'draft',
  FOREIGN KEY (schedule_id) REFERENCES production_schedule(id),
  FOREIGN KEY (line_id) REFERENCES lines(id),
  FOREIGN KEY (die_id) REFERENCES dies(id),
  FOREIGN KEY (part_id) REFERENCES parts(id)
);

CREATE TABLE IF NOT EXISTS die_life_updates (
  id TEXT PRIMARY KEY,
  die_id TEXT NOT NULL,
  production_confirmation_id TEXT NOT NULL,
  shots_used INTEGER NOT NULL,
  remaining_life_before INTEGER NOT NULL,
  remaining_life_after INTEGER NOT NULL,
  recorded_by TEXT NOT NULL,
  recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (die_id) REFERENCES dies(id),
  FOREIGN KEY (production_confirmation_id) REFERENCES production_confirmations(id)
);

CREATE TABLE IF NOT EXISTS quality_checks (
  id TEXT PRIMARY KEY,
  production_confirmation_id TEXT NOT NULL,
  check_type TEXT DEFAULT 'in_process',
  result TEXT DEFAULT 'pass',
  defect_code TEXT,
  defect_description TEXT,
  quantity_checked REAL NOT NULL,
  quantity_accepted REAL NOT NULL,
  quantity_rejected REAL DEFAULT 0,
  checked_by TEXT NOT NULL,
  checked_at TEXT DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (production_confirmation_id) REFERENCES production_confirmations(id)
);

-- ==================== USERS & SYSTEM ====================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  department TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_by TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ==================== AUDIT LOG ====================

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL,
  old_values TEXT,
  new_values TEXT,
  performed_by TEXT NOT NULL,
  performed_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_demand_status ON demand(status);
CREATE INDEX IF NOT EXISTS idx_demand_delivery_date ON demand(requested_delivery_date);
CREATE INDEX IF NOT EXISTS idx_demand_part ON demand(part_id);
CREATE INDEX IF NOT EXISTS idx_demand_line ON demand(assigned_line_id);
CREATE INDEX IF NOT EXISTS idx_schedule_dates ON production_schedule(planned_start_date_time, planned_end_date_time);
CREATE INDEX IF NOT EXISTS idx_schedule_line ON production_schedule(line_id);
CREATE INDEX IF NOT EXISTS idx_schedule_die ON production_schedule(die_id);
CREATE INDEX IF NOT EXISTS idx_inventory_part ON inventory(part_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_downtime_line ON line_downtime(line_id);
CREATE INDEX IF NOT EXISTS idx_downtime_dates ON line_downtime(start_date_time, end_date_time);
CREATE INDEX IF NOT EXISTS idx_die_unavailability_die ON die_unavailability(die_id);
CREATE INDEX IF NOT EXISTS idx_die_unavailability_dates ON die_unavailability(start_date_time, end_date_time);
`;

// ==================== SEED DATA ====================

export const SEED_DATA_SQL = `
-- Seed Locations
INSERT OR IGNORE INTO locations (id, code, name, address) VALUES
('loc_001', 'MUN', 'Mundhawa', 'Mundhawa, Pune'),
('loc_002', 'BAR', 'Baramati', 'Baramati, Maharashtra'),
('loc_003', 'IND', 'Indapur', 'Indapur, Maharashtra'),
('loc_004', 'CHAKAN', 'Chakan', 'Chakan, Pune');

-- Seed Divisions
INSERT OR IGNORE INTO divisions (id, location_id, code, name) VALUES
('div_001', 'loc_001', 'FMD', 'Forging & Manufacturing Division'),
('div_002', 'loc_001', 'MCD', 'Machining Component Division'),
('div_003', 'loc_001', 'DEF', 'Defence & Aerospace'),
('div_004', 'loc_001', 'CDFD', 'Commercial Vehicle & FD'),
('div_005', 'loc_002', 'FMD', 'Forging & Manufacturing Division'),
('div_006', 'loc_002', 'MCD', 'Machining Component Division'),
('div_007', 'loc_004', 'MCD', 'Machining Component Division');

-- Seed Lines
INSERT OR IGNORE INTO lines (id, division_id, code, name, press_tonnage, is_continuous, gross_hours_per_week) VALUES
('line_001', 'div_001', 'FMD1', 'FMD Line 1 - 1600T', 1600, 1, 168),
('line_002', 'div_001', 'FMD2', 'FMD Line 2 - 2500T', 2500, 1, 168),
('line_003', 'div_001', 'FMD3', 'FMD Line 3 - 4000T', 4000, 1, 168),
('line_004', 'div_001', 'FMD4', 'FMD Line 4 - 6300T', 6300, 1, 120),
('line_005', 'div_002', 'MCD7', 'MCD Line 7 - CNC Machining', NULL, 1, 168),
('line_006', 'div_002', 'MCD8', 'MCD Line 8 - CNC Machining', NULL, 1, 168),
('line_007', 'div_003', 'DEF1', 'Defence Line 1 - Precision', 1000, 0, 120),
('line_008', 'div_005', 'BAR1', 'Baramati Line 1 - 2000T', 2000, 1, 168),
('line_009', 'div_007', 'CHAKAN1', 'Chakan Machining Line 1', NULL, 1, 168);

-- Seed Shifts
INSERT OR IGNORE INTO shifts (id, line_id, name, start_time, end_time, duration, crew_type) VALUES
('shift_001', 'line_001', 'Shift A', '07:00', '15:00', 8, 'full'),
('shift_002', 'line_001', 'Shift B', '15:00', '00:00', 9, 'standard'),
('shift_003', 'line_001', 'Shift C', '00:00', '07:00', 7, 'skeleton'),
('shift_004', 'line_002', 'Shift A', '07:00', '15:00', 8, 'full'),
('shift_005', 'line_002', 'Shift B', '15:00', '00:00', 9, 'standard'),
('shift_006', 'line_002', 'Shift C', '00:00', '07:00', 7, 'skeleton');

-- Seed Dies
INSERT OR IGNORE INTO dies (id, code, name, line_id, category, total_life, remaining_life, shots_per_hour, raw_material_code, raw_material_qty_per_shot, raw_material_lead_time, raw_material_moq) VALUES
('die_001', 'D-1600-001', 'Crankshaft 4cyl Die', 'line_001', 'runner', 50000, 35000, 120, 'RM-EN8D-001', 8.5, 14, 1000),
('die_002', 'D-1600-002', 'Axle Beam Front Die', 'line_001', 'runner', 45000, 28000, 100, 'RM-EN19B-001', 12.0, 21, 500),
('die_003', 'D-2500-001', 'Connecting Rod Die', 'line_002', 'repeater', 60000, 52000, 150, 'RM-42CrMo4-001', 3.2, 30, 2000),
('die_004', 'D-2500-002', 'Gear Blank Die', 'line_002', 'runner', 55000, 41000, 180, 'RM-EN8D-002', 5.5, 14, 1500),
('die_005', 'D-4000-001', 'HCV Axle Beam Die', 'line_003', 'repeater', 40000, 32000, 80, 'RM-EN24-001', 25.0, 45, 500),
('die_006', 'D-6300-001', 'Marine Propeller Shaft Die', 'line_004', 'stranger', 30000, 28000, 45, 'RM-SS316-001', 45.0, 60, 100),
('die_007', 'D-DEF-001', 'Aerospace Bracket Die', 'line_007', 'stranger', 20000, 18500, 60, 'RM-Ti6Al4V-001', 2.5, 90, 50),
('die_008', 'D-BAR-001', 'Baramati Crankshaft Die', 'line_008', 'runner', 48000, 42000, 110, 'RM-EN8D-003', 9.0, 14, 1000);

-- Seed Parts
INSERT OR IGNORE INTO parts (id, material_code, p_code, description, customer, division, route_type, pieces_per_shot, cycle_time_forging, cycle_time_ht, cycle_time_machining, yield_factor, scrap_factor, safety_stock_days) VALUES
('part_001', 'MAT-CRK-001', 'P-1001', '4-Cylinder Crankshaft', 'Tata Motors', 'FMD', 'B', 1, 30, 4, 45, 0.95, 0.05, 2),
('part_002', 'MAT-AXL-001', 'P-1002', 'Front Axle Beam', 'Ashok Leyland', 'FMD', 'B', 1, 36, 6, 60, 0.93, 0.07, 3),
('part_003', 'MAT-CON-001', 'P-1003', 'Connecting Rod', 'Mahindra', 'FMD', 'B', 2, 24, 3, 30, 0.96, 0.04, 2),
('part_004', 'MAT-GRB-001', 'P-1004', 'Gear Blank 8inch', 'Bharat Benz', 'FMD', 'B', 4, 20, 4, 40, 0.94, 0.06, 2),
('part_005', 'MAT-HCV-001', 'P-1005', 'HCV Rear Axle Beam', 'Volvo Eicher', 'FMD', 'B', 1, 45, 8, 90, 0.92, 0.08, 5),
('part_006', 'MAT-MAR-001', 'P-2001', 'Marine Propeller Shaft', 'Wartsila', 'Defence', 'C', 1, 80, 12, 120, 0.90, 0.10, 10),
('part_007', 'MAT-AER-001', 'P-3001', 'Aerospace Mounting Bracket', 'HAL', 'Defence', 'C', 2, 60, 8, 180, 0.88, 0.12, 15),
('part_008', 'MAT-RAW-001', 'P-4001', 'Raw Forging - Crankshaft Blank', 'External Customer', 'FMD', 'A', 1, 30, 4, NULL, 0.95, 0.05, 0);

-- Seed Route Steps
INSERT OR IGNORE INTO route_steps (id, part_id, sequence, operation_code, department, resource_type, resource_id, cycle_time, queue_time, transit_time) VALUES
('rs_001', 'part_001', 1, 'FORGE', 'Forging', 'line', 'line_001', 30, 0, 2),
('rs_002', 'part_001', 2, 'HT', 'Heat Treatment', 'furnace', NULL, 240, 240, 4),
('rs_003', 'part_001', 3, 'MACH', 'Machining', 'machine', NULL, 45, 120, 1),
('rs_004', 'part_002', 1, 'FORGE', 'Forging', 'line', 'line_001', 36, 0, 2),
('rs_005', 'part_002', 2, 'HT', 'Heat Treatment', 'furnace', NULL, 360, 300, 4),
('rs_006', 'part_002', 3, 'MACH', 'Machining', 'machine', NULL, 60, 180, 1);

-- Seed Inventory
INSERT OR IGNORE INTO inventory (id, part_id, die_id, raw_material_code, stage, status, quantity, location_id, division_id, line_id, lot_number, valuation_rate) VALUES
('inv_001', 'part_001', NULL, NULL, 'finished_goods', 'available', 1250, 'loc_001', 'div_001', 'line_001', 'LOT-2024-001', 850.00),
('inv_002', 'part_002', NULL, NULL, 'finished_goods', 'available', 800, 'loc_001', 'div_001', 'line_001', 'LOT-2024-002', 1200.00),
('inv_003', NULL, 'die_001', 'RM-EN8D-001', 'raw_material', 'available', 5000, 'loc_001', 'div_001', 'line_001', 'RM-LOT-001', 65.00),
('inv_004', NULL, 'die_002', 'RM-EN19B-001', 'raw_material', 'available', 3200, 'loc_001', 'div_001', 'line_001', 'RM-LOT-002', 78.00),
('inv_005', 'part_001', NULL, NULL, 'forged', 'wip', 450, 'loc_001', 'div_001', 'line_001', 'WIP-2024-001', 425.00),
('inv_006', 'part_003', NULL, NULL, 'finished_goods', 'available', 2200, 'loc_001', 'div_001', 'line_002', 'LOT-2024-003', 380.00);

-- Seed Demand
INSERT OR IGNORE INTO demand (id, sap_order_number, material_code, part_id, customer, division_id, quantity, requested_delivery_date, demand_type, priority, is_safety_stock, is_npd, net_quantity, status, feasibility_status, uploaded_by) VALUES
('dem_001', 'SO-2024-0001', 'MAT-CRK-001', 'part_001', 'Tata Motors', 'div_001', 500, '2024-02-15', 'firm_order', 3, 0, 0, 500, 'approved', 'executable', 'admin'),
('dem_002', 'SO-2024-0002', 'MAT-AXL-001', 'part_002', 'Ashok Leyland', 'div_001', 300, '2024-02-20', 'firm_order', 3, 0, 0, 300, 'approved', 'executable', 'admin'),
('dem_003', 'SO-2024-0003', 'MAT-CON-001', 'part_003', 'Mahindra', 'div_001', 1000, '2024-02-18', 'firm_order', 2, 0, 0, 1000, 'approved', 'executable', 'admin'),
('dem_004', NULL, 'MAT-GRB-001', 'part_004', 'Bharat Benz', 'div_001', 800, '2024-03-01', 'forecast', 3, 0, 0, 800, 'draft', 'executable', 'admin'),
('dem_005', 'SO-2024-0005', 'MAT-HCV-001', 'part_005', 'Volvo Eicher', 'div_001', 150, '2024-02-25', 'firm_order', 2, 0, 0, 150, 'approved', 'executable', 'admin'),
('dem_006', 'SO-2024-0006', 'MAT-MAR-001', 'part_006', 'Wartsila', 'div_003', 50, '2024-03-15', 'firm_order', 1, 0, 0, 50, 'approved', 'executable', 'admin'),
('dem_007', 'SO-2024-0007', 'MAT-AER-001', 'part_007', 'HAL', 'div_003', 100, '2024-03-20', 'firm_order', 1, 0, 0, 100, 'approved', 'executable', 'admin');

-- Seed Production Schedule
INSERT OR IGNORE INTO production_schedule (id, demand_id, line_id, die_id, part_id, planned_quantity, planned_start_date_time, planned_end_date_time, status, changeover_time, shots_required) VALUES
('sched_001', 'dem_001', 'line_001', 'die_001', 'part_001', 500, '2024-02-05T07:00:00', '2024-02-08T15:00:00', 'planned', 30, 500),
('sched_002', 'dem_002', 'line_001', 'die_002', 'part_002', 300, '2024-02-10T07:00:00', '2024-02-12T20:00:00', 'planned', 45, 300),
('sched_003', 'dem_003', 'line_002', 'die_003', 'part_003', 1000, '2024-02-06T07:00:00', '2024-02-09T18:00:00', 'in_progress', 20, 500);

-- Seed Users
INSERT OR IGNORE INTO users (id, username, email, full_name, department) VALUES
('user_001', 'admin', 'admin@bharatforge.com', 'System Administrator', 'IT'),
('user_002', 'cppc.planner', 'cppc@bharatforge.com', 'CPPC Planner', 'Planning'),
('user_003', 'fmd.supervisor', 'fmd@bharatforge.com', 'FMD Supervisor', 'Production'),
('user_004', 'mcd.planner', 'mcd@bharatforge.com', 'MCD Planner', 'Planning'),
('user_005', 'plant.ppc', 'ppc@bharatforge.com', 'Plant PPC', 'Production');

-- Seed System Settings
INSERT OR IGNORE INTO system_settings (key, value, description, updated_by) VALUES
('company.name', 'Bharat Forge Limited', 'Company Name', 'admin'),
('planning.horizon.snop', '90', 'SNOP Planning Horizon in Days', 'admin'),
('planning.horizon.mps', '28', 'Master Production Schedule Horizon in Days', 'admin'),
('utilization.target.runner', '90', 'Target Utilization for Runner Dies (%)', 'admin'),
('utilization.target.repeater', '75', 'Target Utilization for Repeater Dies (%)', 'admin'),
('utilization.target.stranger', '50', 'Target Utilization for Stranger Dies (%)', 'admin'),
('safety_stock.runner_days', '2', 'Safety Stock Days for Runner Parts', 'admin'),
('safety_stock.repeater_days', '5', 'Safety Stock Days for Repeater Parts', 'admin'),
('safety_stock.stranger_days', '0', 'Safety Stock Days for Stranger Parts', 'admin'),
('approval.threshold.major', '5000000', 'Major Approval Threshold in INR', 'admin'),
('approval.threshold.minor', '1000000', 'Minor Approval Threshold in INR', 'admin');
`;
