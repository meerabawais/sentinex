import { cap } from '@/lib/utils';

export const SeverityPill = ({ severity }) => <span className={`pill sev-${severity}`}>{cap(severity)}</span>;
export const StatusPill = ({ status }) => <span className={`pill st-${status}`}>{cap(status)}</span>;

/* Up/down change badge. goodWhenDown: a decrease is good (e.g. violations). */
export function Delta({ value, goodWhenDown = false, unit = '%' }) {
  if (!value) return <span className="delta flat">0{unit}</span>;
  const good = goodWhenDown ? value < 0 : value > 0;
  return (
    <span className={`delta ${good ? 'good' : 'bad'}`}>
      <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor">
        <path d={value > 0 ? 'M5 1 9.5 8h-9L5 1Z' : 'M5 9 .5 2h9L5 9Z'} />
      </svg>
      {Math.abs(value)}{unit}
    </span>
  );
}
