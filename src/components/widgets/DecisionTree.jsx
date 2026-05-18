import { useState } from 'react';

const TYPE_STYLE = {
  ok:   { border: 'rgba(0,230,118,.35)', bg: 'rgba(0,230,118,.1)',  color: '#00e676', icon: '✅' },
  warn: { border: 'rgba(255,23,68,.35)',  bg: 'rgba(255,23,68,.1)',  color: '#ff5252', icon: '⚠️' },
  tip:  { border: 'rgba(255,171,0,.35)',  bg: 'rgba(255,171,0,.1)', color: '#ffab00', icon: '💡' },
};

/**
 * @param {{ title: string, icon?: string, color?: string, root: string, nodes: Record<string, object> }} tree
 */
export default function DecisionTree({ tree }) {
  const [nodeId, setNodeId] = useState(tree.root);
  const [history, setHistory] = useState([]);

  const node = tree.nodes[nodeId];
  const accent = tree.color ?? '#ff6b35';

  const goYes = () => { setHistory(h => [...h, { id: nodeId, q: node.q, ans: '是' }]); setNodeId(node.yes); };
  const goNo  = () => { setHistory(h => [...h, { id: nodeId, q: node.q, ans: '否' }]); setNodeId(node.no); };
  const reset = () => { setNodeId(tree.root); setHistory([]); };

  if (!node) return null;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 28 }}>{tree.icon}</span>
        <div style={{ fontWeight: 700, color: accent, fontSize: 15 }}>{tree.title}</div>
      </div>

      {history.length > 0 && (
        <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 8,
          background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 6 }}>已答路径</div>
          {history.map((h, i) => (
            <div key={i} style={{ fontSize: 12, color: '#8aacb8', marginBottom: 4 }}>
              <span style={{ color: accent }}>{h.ans}</span> · {h.q}
            </div>
          ))}
        </div>
      )}

      {node.done ? (
        <div style={{
          padding: 20, borderRadius: 12,
          border: `1px solid ${(TYPE_STYLE[node.type] ?? TYPE_STYLE.tip).border}`,
          background: (TYPE_STYLE[node.type] ?? TYPE_STYLE.tip).bg,
        }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>{(TYPE_STYLE[node.type] ?? TYPE_STYLE.tip).icon}</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: (TYPE_STYLE[node.type] ?? TYPE_STYLE.tip).color, marginBottom: 8 }}>
            {node.t}
          </div>
          <div style={{ fontSize: 13.5, color: '#aabfc8', lineHeight: 1.75 }}>{node.d}</div>
          <button onClick={reset} style={{
            marginTop: 16, padding: '10px 24px', borderRadius: 10, cursor: 'pointer',
            border: `1px solid ${accent}55`, background: `${accent}18`, color: accent, fontWeight: 600,
          }}>↺ 重新诊断</button>
        </div>
      ) : (
        <>
          <div style={{
            padding: '18px 20px', borderRadius: 12, marginBottom: 16,
            border: `1px solid ${accent}33`, background: 'rgba(255,255,255,.04)',
            fontSize: 15, color: '#dde8ee', lineHeight: 1.6,
          }}>{node.q}</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={goYes} style={{
              flex: 1, padding: '14px 0', borderRadius: 10, cursor: 'pointer', fontWeight: 700,
              border: '1px solid rgba(0,230,118,.4)', background: 'rgba(0,230,118,.12)', color: '#00e676',
            }}>是</button>
            <button onClick={goNo} style={{
              flex: 1, padding: '14px 0', borderRadius: 10, cursor: 'pointer', fontWeight: 700,
              border: '1px solid rgba(255,82,82,.4)', background: 'rgba(255,82,82,.12)', color: '#ff5252',
            }}>否</button>
          </div>
          <button onClick={reset} style={{
            marginTop: 12, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
            border: '1px solid rgba(255,255,255,.1)', background: 'transparent', color: 'var(--dim)',
          }}>↺ 从头开始</button>
        </>
      )}
    </div>
  );
}
