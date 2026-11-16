export default function StatTile({ label, value, foot, led }) {
  return (
    <div className="card stat">
      {led && <span className={`led ${led === 'ok' ? 'ok' : ''}`} />}
      <div className="l">{label}</div>
      <div className="v">{value}</div>
      <div className="f">{foot}</div>
    </div>
  );
}
