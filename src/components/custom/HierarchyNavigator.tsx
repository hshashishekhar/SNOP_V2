import { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Building2, 
  Factory, 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical,
  Search,
  MoreHorizontal,
  Settings,
  CheckCircle2,
  XCircle,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Location, Division, Line } from '@/types';

// Tree Node Types
interface TreeNode {
  id: string;
  type: 'location' | 'division' | 'line';
  data: Location | Division | Line;
  children: TreeNode[];
  isExpanded: boolean;
  isSelected: boolean;
}

interface HierarchyNavigatorProps {
  locations: Location[];
  divisions: Division[];
  lines: Line[];
  onSelect?: (type: 'location' | 'division' | 'line', id: string) => void;
  onEdit?: (type: 'location' | 'division' | 'line', id: string) => void;
  onDelete?: (type: 'location' | 'division' | 'line', id: string) => void;
  onAdd?: (type: 'location' | 'division' | 'line', parentId?: string) => void;
  onReorder?: (type: 'location' | 'division' | 'line', id: string, newOrder: number) => void;
  selectedIds?: string[];
  showControls?: boolean;
  className?: string;
}

export function HierarchyNavigator({
  locations,
  divisions,
  lines,
  onSelect,
  onEdit,
  onDelete,
  onAdd,
  onReorder,
  selectedIds = [],
  showControls = true,
  className,
}: HierarchyNavigatorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [localSelectedIds, setLocalSelectedIds] = useState<Set<string>>(new Set(selectedIds));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'location' | 'division' | 'line'; id: string; name: string } | null>(null);

  // Build tree structure
  const treeData = useMemo(() => {
    const locationNodes: TreeNode[] = locations
      .filter(loc => loc.isActive)
      .map(loc => ({
        id: loc.id,
        type: 'location' as const,
        data: loc,
        children: [],
        isExpanded: expandedIds.has(loc.id),
        isSelected: localSelectedIds.has(loc.id),
      }));

    locationNodes.forEach(locNode => {
      const divisionNodes: TreeNode[] = divisions
        .filter(div => div.locationId === locNode.id && div.isActive)
        .map(div => ({
          id: div.id,
          type: 'division' as const,
          data: div,
          children: [],
          isExpanded: expandedIds.has(div.id),
          isSelected: localSelectedIds.has(div.id),
        }));

      divisionNodes.forEach(divNode => {
        const lineNodes: TreeNode[] = lines
          .filter(line => line.divisionId === divNode.id && line.isActive)
          .map(line => ({
            id: line.id,
            type: 'line' as const,
            data: line,
            children: [],
            isExpanded: false,
            isSelected: localSelectedIds.has(line.id),
          }));
        divNode.children = lineNodes;
      });

      locNode.children = divisionNodes;
    });

    return locationNodes;
  }, [locations, divisions, lines, expandedIds, localSelectedIds]);

  // Filter tree based on search
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return treeData;

    const query = searchQuery.toLowerCase();
    
    const filterNode = (node: TreeNode): TreeNode | null => {
      const matchesSearch = 
        ('name' in node.data && node.data.name.toLowerCase().includes(query)) ||
        ('code' in node.data && node.data.code.toLowerCase().includes(query));

      const filteredChildren = node.children
        .map(filterNode)
        .filter((n): n is TreeNode => n !== null);

      if (matchesSearch || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
          isExpanded: true,
        };
      }
      return null;
    };

    return treeData.map(filterNode).filter((n): n is TreeNode => n !== null);
  }, [treeData, searchQuery]);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelected = (id: string, type: 'location' | 'division' | 'line') => {
    setLocalSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    onSelect?.(type, id);
  };

  const handleDelete = (type: 'location' | 'division' | 'line', id: string, name: string) => {
    setItemToDelete({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete?.(itemToDelete.type, itemToDelete.id);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        allIds.add(node.id);
        collectIds(node.children);
      });
    };
    collectIds(treeData);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-bf-blue" />
            Organization Hierarchy
          </CardTitle>
          {showControls && (
            <Button 
              size="sm" 
              onClick={() => onAdd?.('location')}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Location
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search locations, divisions, lines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
          <div className="flex-1" />
          <Badge variant="secondary">
            {locations.length} Locations
          </Badge>
          <Badge variant="secondary">
            {divisions.length} Divisions
          </Badge>
          <Badge variant="secondary">
            {lines.length} Lines
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-0">
        <div className="px-4 pb-4">
          {filteredTree.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No items found</p>
              {searchQuery && (
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => setSearchQuery('')}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTree.map(node => (
                <TreeNodeComponent
                  key={node.id}
                  node={node}
                  level={0}
                  onToggleExpand={toggleExpanded}
                  onToggleSelect={toggleSelected}
                  onEdit={onEdit}
                  onDelete={handleDelete}
                  onAdd={onAdd}
                  showControls={showControls}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{itemToDelete?.name}</strong>?
              {itemToDelete?.type === 'location' && ' This will also delete all associated divisions and lines.'}
              {itemToDelete?.type === 'division' && ' This will also delete all associated lines.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Tree Node Component
interface TreeNodeComponentProps {
  node: TreeNode;
  level: number;
  onToggleExpand: (id: string) => void;
  onToggleSelect: (id: string, type: 'location' | 'division' | 'line') => void;
  onEdit?: (type: 'location' | 'division' | 'line', id: string) => void;
  onDelete?: (type: 'location' | 'division' | 'line', id: string, name: string) => void;
  onAdd?: (type: 'location' | 'division' | 'line', parentId?: string) => void;
  showControls?: boolean;
}

function TreeNodeComponent({
  node,
  level,
  onToggleExpand,
  onToggleSelect,
  onEdit,
  onDelete,
  onAdd,
  showControls,
}: TreeNodeComponentProps) {
  const hasChildren = node.children.length > 0;
  
  const getIcon = () => {
    switch (node.type) {
      case 'location':
        return <MapPin className="w-4 h-4 text-bf-blue" />;
      case 'division':
        return <Building2 className="w-4 h-4 text-bf-steel" />;
      case 'line':
        return <Factory className="w-4 h-4 text-bf-orange" />;
    }
  };

  const getNodeName = () => {
    const data = node.data as any;
    return data.name || data.code;
  };

  const getNodeCode = () => {
    const data = node.data as any;
    return data.code;
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-2 rounded-md group transition-colors",
          node.isSelected && "bg-bf-blue/10",
          !node.isSelected && "hover:bg-muted"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => hasChildren && onToggleExpand(node.id)}
          className={cn(
            "w-5 h-5 flex items-center justify-center rounded transition-colors",
            hasChildren ? "hover:bg-muted-foreground/10 cursor-pointer" : "invisible"
          )}
        >
          {node.isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Checkbox */}
        <Checkbox
          checked={node.isSelected}
          onCheckedChange={() => onToggleSelect(node.id, node.type)}
          className="data-[state=checked]:bg-bf-blue data-[state=checked]:border-bf-blue"
        />

        {/* Icon */}
        {getIcon()}

        {/* Node Content */}
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onToggleSelect(node.id, node.type)}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{getNodeName()}</span>
            <span className="text-xs text-muted-foreground">({getNodeCode()})</span>
          </div>
        </div>

        {/* Status Badge */}
        {'isActive' in node.data && (
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              node.data.isActive 
                ? "bg-bf-green/10 text-bf-green border-bf-green/20" 
                : "bg-bf-red/10 text-bf-red border-bf-red/20"
            )}
          >
            {node.data.isActive ? (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            ) : (
              <XCircle className="w-3 h-3 mr-1" />
            )}
            {node.data.isActive ? 'Active' : 'Inactive'}
          </Badge>
        )}

        {/* Actions */}
        {showControls && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(node.type, node.id)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {node.type !== 'line' && (
                <DropdownMenuItem onClick={() => onAdd?.(
                  node.type === 'location' ? 'division' : 'line',
                  node.id
                )}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add {node.type === 'location' ? 'Division' : 'Line'}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-bf-red"
                onClick={() => onDelete?.(node.type, node.id, getNodeName())}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Children */}
      {hasChildren && node.isExpanded && (
        <div className="mt-1">
          {node.children.map(child => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              onToggleExpand={onToggleExpand}
              onToggleSelect={onToggleSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onAdd={onAdd}
              showControls={showControls}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Compact Hierarchy Selector for Filters
interface HierarchySelectorProps {
  locations: Location[];
  divisions: Division[];
  lines: Line[];
  selectedLocationId?: string;
  selectedDivisionId?: string;
  selectedLineId?: string;
  onLocationChange?: (id: string | undefined) => void;
  onDivisionChange?: (id: string | undefined) => void;
  onLineChange?: (id: string | undefined) => void;
  className?: string;
}

export function HierarchySelector({
  locations,
  divisions,
  lines,
  selectedLocationId,
  selectedDivisionId,
  selectedLineId,
  onLocationChange,
  onDivisionChange,
  onLineChange,
  className,
}: HierarchySelectorProps) {
  const filteredDivisions = useMemo(() => 
    selectedLocationId 
      ? divisions.filter(d => d.locationId === selectedLocationId)
      : divisions,
    [divisions, selectedLocationId]
  );

  const filteredLines = useMemo(() => 
    selectedDivisionId 
      ? lines.filter(l => l.divisionId === selectedDivisionId)
      : selectedLocationId
        ? lines.filter(l => {
            const div = divisions.find(d => d.id === l.divisionId);
            return div?.locationId === selectedLocationId;
          })
        : lines,
    [lines, selectedDivisionId, selectedLocationId, divisions]
  );

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <select
          value={selectedLocationId || ''}
          onChange={(e) => {
            const value = e.target.value || undefined;
            onLocationChange?.(value);
            onDivisionChange?.(undefined);
            onLineChange?.(undefined);
          }}
          className="bg-transparent text-sm font-medium outline-none min-w-[120px]"
        >
          <option value="">All Locations</option>
          {locations.filter(l => l.isActive).map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </select>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground" />

      <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
        <Building2 className="w-4 h-4 text-muted-foreground" />
        <select
          value={selectedDivisionId || ''}
          onChange={(e) => {
            const value = e.target.value || undefined;
            onDivisionChange?.(value);
            onLineChange?.(undefined);
          }}
          disabled={!selectedLocationId}
          className="bg-transparent text-sm font-medium outline-none min-w-[120px] disabled:opacity-50"
        >
          <option value="">All Divisions</option>
          {filteredDivisions.filter(d => d.isActive).map(div => (
            <option key={div.id} value={div.id}>{div.name}</option>
          ))}
        </select>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground" />

      <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
        <Factory className="w-4 h-4 text-muted-foreground" />
        <select
          value={selectedLineId || ''}
          onChange={(e) => onLineChange?.(e.target.value || undefined)}
          disabled={!selectedDivisionId && !selectedLocationId}
          className="bg-transparent text-sm font-medium outline-none min-w-[120px] disabled:opacity-50"
        >
          <option value="">All Lines</option>
          {filteredLines.filter(l => l.isActive).map(line => (
            <option key={line.id} value={line.id}>{line.name}</option>
          ))}
        </select>
      </div>

      {(selectedLocationId || selectedDivisionId || selectedLineId) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onLocationChange?.(undefined);
            onDivisionChange?.(undefined);
            onLineChange?.(undefined);
          }}
          className="text-muted-foreground"
        >
          Clear
        </Button>
      )}
    </div>
  );
}
