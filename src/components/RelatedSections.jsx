import { useNav } from '../NavContext';
import { RELATED_BY_SECTION } from '../data/relatedSections';
import { SEC_LABEL } from '../secs';

export default function RelatedSections({ sectionId, title = '继续探索' }) {
  const navigate = useNav();
  const links = RELATED_BY_SECTION[sectionId];
  if (!links?.length) return null;

  return (
    <div className="reveal" style={{ maxWidth: 1100, margin: '36px auto 0', padding: '0 0 24px' }}>
      <h4 style={{
        font: 'bold 11px "Courier New",monospace',
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: 'var(--dim)',
        marginBottom: 14,
      }}>
        {title}
      </h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {links.map(l => (
          <button
            key={l.id}
            type="button"
            className="chip"
            onClick={() => navigate(l.id)}
          >
            {l.label || SEC_LABEL[l.id] || l.id} →
          </button>
        ))}
      </div>
    </div>
  );
}
