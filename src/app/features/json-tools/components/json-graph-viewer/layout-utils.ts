import { Node, Edge, Position } from '@xyflow/react';
import dagre from 'dagre';

const NODE_WIDTH = 280;
const ROW_HEIGHT = 28;
const HEADER_HEIGHT = 40;
const NODE_PADDING = 16;

// Helper to determine if value is primitive
const isPrimitive = (val: any) => {
  return val === null || (typeof val !== 'object' && typeof val !== 'function');
};

export const getLayoutedElements = (json: any, direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Recursion helper
  const traverse = (data: any, parentId: string | null, key: string | null) => {
    // Generate unique ID based on path or random?
    // Ideally path, but for simplicity let's use a random ID or increment.
    // Path-based ID is better for stability but harder with duplicates.
    // Let's use simple random for now to avoid collisions if same object reference.
    // Or better: parentId + key. But array indices change.

    const id = parentId ? `${parentId}-${key}` : 'root';

    const entries: { key: string; value: string }[] = [];
    const children: { key: string; value: any }[] = [];

    let label = key || 'Root';
    let typeLabel = '';

    if (Array.isArray(data)) {
        typeLabel = `[${data.length}]`;
        data.forEach((item, index) => {
            if (isPrimitive(item)) {
                entries.push({ key: `${index}`, value: String(item) });
            } else {
                children.push({ key: `${index}`, value: item });
            }
        });
    } else if (typeof data === 'object' && data !== null) {
        typeLabel = `{${Object.keys(data).length}}`;
        Object.entries(data).forEach(([k, v]) => {
            if (isPrimitive(v)) {
                entries.push({ key: k, value: String(v) });
            } else {
                children.push({ key: k, value: v });
            }
        });
    } else {
        // Primitive root? specific case
        entries.push({ key: 'Value', value: String(data) });
    }

    // Calculate dynamic height based on entries
    // Base height + (entries * row height)
    const contentHeight = HEADER_HEIGHT + (entries.length * ROW_HEIGHT) + NODE_PADDING;

    const node: Node = {
      id: id,
      type: 'custom', // We will use a custom node type
      data: {
        label: label,
        typeLabel: typeLabel,
        entries: entries
      },
      position: { x: 0, y: 0 },
      // We store dimensions in data or directly on node for dagre
      width: NODE_WIDTH,
      height: contentHeight,
    };

    nodes.push(node);

    if (parentId) {
      edges.push({
        id: `${parentId}-${id}`,
        source: parentId,
        target: id,
        type: 'smoothstep', // or 'bezier'
        animated: true,
        style: { stroke: '#5b5b5b' },
      });
    }

    // Recurse
    children.forEach((child) => {
      traverse(child.value, id, child.key);
    });
  };

  try {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json;
    traverse(parsed, null, null);
  } catch (e) {
    console.error("Invalid JSON for graph", e);
    return { nodes: [], edges: [] };
  }

  // Layout with Dagre
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    // dagre needs width/height
    dagreGraph.setNode(node.id, { width: node.width || NODE_WIDTH, height: node.height || 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // We are shifting the dagre node position (top left) to React Flow handle position?
    // React Flow nodes position is top-left by default.
    // Dagre nodes position is center by default.
    // So we need to subtract half width/height.

    return {
      ...node,
      targetPosition: direction === 'LR' ? Position.Left : Position.Top,
      sourcePosition: direction === 'LR' ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - (node.width || NODE_WIDTH) / 2,
        y: nodeWithPosition.y - (node.height || 100) / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
