import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const CustomNode = ({ data }: any) => {
  return (
    <div className="custom-node">
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />

      <div className="node-header">
        <span className="node-key">{data.label}</span>
        {data.typeLabel && <span className="node-type">{data.typeLabel}</span>}
      </div>

      <div className="node-body">
        {data.entries.map((entry: any, index: number) => (
          <div className="node-row" key={index}>
            <span className="prop-key">{entry.key}</span>
            <span className="prop-sep">: </span>
            <span className="prop-value" title={entry.value}>{entry.value}</span>
          </div>
        ))}
        {data.entries.length === 0 && <div className="node-empty">Wait, no primitives?</div>}
      </div>

      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </div>
  );
};

export default memo(CustomNode);
