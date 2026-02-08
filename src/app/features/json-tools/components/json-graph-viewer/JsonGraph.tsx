import React, { useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState, Controls, Background, MiniMap, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomNode from './CustomNode';
import { getLayoutedElements } from './layout-utils';

const nodeTypes = { custom: CustomNode };

interface JsonGraphProps {
  json: any;
}

const JsonGraph: React.FC<JsonGraphProps> = ({ json }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (!json) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(json, 'LR');
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

  }, [json, setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default JsonGraph;
