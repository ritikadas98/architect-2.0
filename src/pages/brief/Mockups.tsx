import type { Direction } from '../../data/demo'

/* Colours in this file belong to the user's references and the *generated* app,
   not to Architect's own UI. That's why they are raw values, not tokens. */

/** Tiny drawings of the two screenshots the user attached. */
export function RefThumb({ name }: { name: string }) {
  if (name.includes('instagram')) {
    const tiles = ['#E9DFD0', '#D9CDB8', '#C8D0BE', '#EFE7DA', '#B9C2AE', '#E3D6C3', '#D2C6B0', '#EDE4D6', '#C4CCB8']
    return (
      <svg viewBox="0 0 96 72" width="96" height="72" aria-hidden="true">
        <rect width="96" height="72" fill="#FBF8F2" />
        <circle cx="12" cy="10" r="5" fill="#7C8B6F" />
        <rect x="21" y="7" width="26" height="3" rx="1.5" fill="#2E2A24" opacity=".7" />
        <rect x="21" y="12" width="16" height="2" rx="1" fill="#2E2A24" opacity=".3" />
        {tiles.map((c, i) => (
          <rect key={i} x={6 + (i % 3) * 29} y={20 + Math.floor(i / 3) * 17} width="27" height="15" fill={c} />
        ))}
        <circle cx="19.5" cy="30" r="4" fill="#FBF8F2" opacity=".8" />
        <rect x="71" y="42" width="6" height="10" rx="2" fill="#FBF8F2" opacity=".8" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 96 72" width="96" height="72" aria-hidden="true">
      <rect width="96" height="72" fill="#F4EDE2" />
      <rect x="8" y="7" width="18" height="2.5" rx="1" fill="#2E2A24" opacity=".6" />
      <rect x="62" y="7" width="8" height="2" rx="1" fill="#2E2A24" opacity=".35" />
      <rect x="74" y="7" width="8" height="2" rx="1" fill="#2E2A24" opacity=".35" />
      <text x="8" y="31" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="13" fill="#2E2A24">
        Slow skin.
      </text>
      <rect x="8" y="36" width="40" height="2" rx="1" fill="#2E2A24" opacity=".3" />
      <rect x="8" y="41" width="30" height="2" rx="1" fill="#2E2A24" opacity=".3" />
      <rect x="8" y="49" width="26" height="8" rx="4" fill="#7C8B6F" />
      <rect x="58" y="18" width="30" height="40" rx="2" fill="#E6DCCB" />
      <rect x="68" y="28" width="10" height="22" rx="3" fill="#C9D0BD" />
    </svg>
  )
}

/** A tiny Glow & Co. homepage plus chat bubble, drawn in one direction's look. */
export function DirectionMock({ d }: { d: Direction }) {
  const btnR = Math.min(d.radius, 999)
  const boxR = Math.min(d.radius, 12)
  const tint = d.ink + '14'
  return (
    <div
      className="bm-mock"
      style={{ background: d.bg, color: d.ink, fontFamily: d.body }}
      aria-label={`Preview of the ${d.name} direction`}
      role="img"
    >
      <div className="bm-nav">
        <span style={{ fontFamily: d.display, fontWeight: 600, fontSize: 12 }}>Glow &amp; Co.</span>
        <span className="bm-navlinks">
          <i style={{ background: d.ink }} />
          <i style={{ background: d.ink }} />
          <i style={{ background: d.ink }} />
        </span>
      </div>
      <div className="bm-hero">
        <div className="bm-copy">
          <div
            style={{
              fontFamily: d.display,
              fontSize: d.id === 'clinic' ? 17 : 21,
              fontWeight: d.id === 'clinic' ? 750 : 500,
              lineHeight: 1,
              letterSpacing: d.id === 'apothecary' ? '0.02em' : 0,
              fontStretch: d.id === 'clinic' ? '112%' : undefined,
            }}
          >
            {d.id === 'apothecary' ? 'No. 04 Night Oil' : d.id === 'clinic' ? 'Skin, measured.' : 'Slow skin.'}
          </div>
          <div style={{ fontSize: 8.5, opacity: 0.7, margin: '5px 0 8px' }}>Small-batch care for tired skin.</div>
          <span
            className="bm-btn"
            style={{
              background: d.accent,
              color: d.bg,
              borderRadius: btnR,
              textTransform: d.id === 'apothecary' ? 'uppercase' : undefined,
              letterSpacing: d.id === 'apothecary' ? '0.1em' : undefined,
            }}
          >
            Shop the ritual
          </span>
        </div>
        <div className="bm-product" style={{ background: tint, borderRadius: boxR }}>
          <span style={{ background: d.accent, borderRadius: Math.min(d.radius, 6), opacity: 0.55 }} />
        </div>
      </div>
      <div className="bm-chat" style={{ borderRadius: boxR, background: d.bg, borderColor: tint }}>
        <span className="bm-bub bm-bub-me" style={{ background: d.accent, color: d.bg, borderRadius: Math.min(d.radius, 10) }}>
          Where’s my order?
        </span>
        <span className="bm-bub" style={{ background: tint, borderRadius: Math.min(d.radius, 10) }}>
          Shipped today. Thursday.
        </span>
      </div>
    </div>
  )
}

/** The look I refuse to ship by default, drawn for real so you can see what I mean. */
export function GenericMock() {
  return (
    <div className="bm-mock bm-generic" role="img" aria-label="The generic AI app look, crossed out">
      <div className="bm-nav" style={{ color: '#E9E6FF' }}>
        <span style={{ fontWeight: 600, fontSize: 11, fontFamily: 'Inter, system-ui, sans-serif' }}>GlowAI</span>
        <span className="bm-gen-cta">Get started</span>
      </div>
      <div className="bm-gen-hero">
        <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.1 }}>Revolutionize your skincare</div>
        <div style={{ fontSize: 8, opacity: 0.8, marginTop: 3 }}>AI-powered. Seamless. Next-gen.</div>
      </div>
      <div className="bm-gen-cards">
        {['✨', '🚀', '💡'].map((e) => (
          <span key={e}>
            <b>{e}</b>
            <i />
          </span>
        ))}
      </div>
      <svg className="bm-strike" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1="3" y1="97" x2="97" y2="3" stroke="var(--red)" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
        <line x1="3" y1="3" x2="97" y2="97" stroke="var(--red)" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}
