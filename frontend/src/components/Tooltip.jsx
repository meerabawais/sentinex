'use client';
import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from 'react';

const TooltipContext = createContext({ show() {}, hide() {} });
export const useTooltip = () => useContext(TooltipContext);

/* One floating tooltip shared by every chart. Charts call show(event, content) / hide(). */
export function TooltipProvider({ children }) {
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: null });
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const ref = useRef(null);

  const show = useCallback((e, content) => setTip({ visible: true, x: e.clientX, y: e.clientY, content }), []);
  const hide = useCallback(() => setTip((t) => ({ ...t, visible: false })), []);

  useLayoutEffect(() => {
    if (!tip.visible || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    let x = tip.x + 14, y = tip.y + 14;
    if (x + r.width > window.innerWidth - 8) x = tip.x - r.width - 14;
    if (y + r.height > window.innerHeight - 8) y = tip.y - r.height - 14;
    setPos({ left: Math.max(8, x), top: Math.max(8, y) });
  }, [tip]);

  return (
    <TooltipContext.Provider value={{ show, hide }}>
      {children}
      <div ref={ref} className="tip" style={{ opacity: tip.visible ? 1 : 0, left: pos.left, top: pos.top }}>{tip.content}</div>
    </TooltipContext.Provider>
  );
}

/* Standard tooltip layout: a title, colored rows and an optional total. */
export function TipBody({ title, rows = [], total }) {
  return (
    <>
      <b>{title}</b>
      {rows.map((r, i) => (
        <div className="tr" key={i}>
          {r.color && <span className="sw" style={{ background: r.color }} />}
          {r.label}<i>{r.value}</i>
        </div>
      ))}
      {total != null && (
        <div className="tr" style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border)' }}>Total<i>{total}</i></div>
      )}
    </>
  );
}
