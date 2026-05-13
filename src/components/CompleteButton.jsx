import { useState } from 'react';

export default function CompleteButton({ sectionId, isCompleted, onComplete }) {
  const [animating, setAnimating] = useState(false);
  const done = isCompleted(sectionId);

  const handleClick = () => {
    if (done) return;
    setAnimating(true);
    onComplete(sectionId);
    setTimeout(() => setAnimating(false), 600);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 28, marginBottom: 10 }}>
      <button
        onClick={handleClick}
        style={{
          padding: done ? '10px 28px' : '12px 32px',
          borderRadius: 24,
          border: `1.5px solid ${done ? 'rgba(0,230,118,.3)' : 'rgba(255,255,255,.12)'}`,
          background: done ? 'rgba(0,230,118,.1)' : 'rgba(255,255,255,.03)',
          color: done ? '#a5d6a7' : '#c8dce6',
          cursor: done ? 'default' : 'pointer',
          font: `${done ? 12 : 14}px/1 inherit`,
          fontWeight: 600,
          transition: 'all .3s ease',
          transform: animating ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        {done ? '✓ 已完成本节学习' : '✦ 标记为已学完'}
      </button>
    </div>
  );
}
