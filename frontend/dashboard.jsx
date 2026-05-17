// Dashboard page
const { useState: useStateDash, useEffect: useEffectDash, useRef: useRefDash } = React;

/* ─────────────────────────────────────────────────────────
   Icons + small primitives
   ───────────────────────────────────────────────────────── */

const I = {
  play: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 5v14l11-7L7 5Z" fill="currentColor"/></svg>,
  history: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/></svg>,
  leader: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M17 4h3v2a3 3 0 0 1-3 3"/><path d="M7 4H4v2a3 3 0 0 0 3 3"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9 1.7 1.7 0 0 0 4.3 7.2l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>,
  bot: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="12" rx="3"/><path d="M12 2v6"/><circle cx="9" cy="14" r="1.2" fill="currentColor"/><circle cx="15" cy="14" r="1.2" fill="currentColor"/><path d="M8 4h8"/></svg>,
  friend: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19a6 6 0 0 1 12 0"/><path d="M14.5 19a4.5 4.5 0 0 1 7-3.7"/></svg>,
  multi: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  trophy: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
};

function Avatar({ name, photoUrl, size = 40, color = "var(--accent)", ring = false }) {
  const initials = (name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: photoUrl
        ? `center/cover no-repeat url(${photoUrl})`
        : `linear-gradient(135deg, ${color}, oklch(0.55 0.1 50))`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#14110d", fontWeight: 700, fontSize: size * 0.38,
      flexShrink: 0,
      boxShadow: ring ? "0 0 0 2px var(--bg), 0 0 0 4px var(--accent)" : "none",
    }}>{!photoUrl && initials}</div>
  );
}

function ResultPill({ result }) {
  const map = {
    W: { bg: "oklch(0.74 0.15 155 / 0.28)", fg: "oklch(0.88 0.17 155)", label: "Win" },
    L: { bg: "oklch(0.7 0.16 25 / 0.28)", fg: "oklch(0.84 0.16 25)", label: "Loss" },
    D: { bg: "var(--bg-elev-3)", fg: "var(--text-mute)", label: "Draw" },
  };
  const m = map[result];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 9px",
      borderRadius: 999, background: m.bg, color: m.fg,
      fontSize: 11.5, fontWeight: 600, letterSpacing: "0.02em",
    }}>{m.label}</span>
  );
}

/* ─────────────────────────────────────────────────────────
   Sidebar
   • Active state = 2px vertical accent line on the left
     edge + a horizontal gradient fade behind the text.
   • All hovers transition in 140ms.
   ───────────────────────────────────────────────────────── */

function NavItem({ icon, label, active, onClick }) {
  const [hover, setHover] = useStateDash(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "flex", alignItems: "center", gap: 12, width: "100%",
        padding: "11px 14px", borderRadius: 8, textAlign: "left",
        color: active ? "var(--text)" : (hover ? "var(--text)" : "var(--text-mute)"),
        background: "transparent",
        fontWeight: 600, fontSize: 14.5,
        transition: "color 160ms ease",
        overflow: "hidden",
      }}
    >
      {/* gradient fade — visible when active, faint on hover */}
      <span style={{
        position: "absolute", inset: 0,
        background: active
          ? "linear-gradient(90deg, oklch(0.7 0.1 65 / 0.18), oklch(0.7 0.1 65 / 0.04) 55%, transparent)"
          : (hover ? "linear-gradient(90deg, oklch(0.7 0.1 65 / 0.06), transparent 70%)" : "transparent"),
        transition: "background 160ms ease",
        pointerEvents: "none",
      }} />
      {/* 2px vertical accent line on the left edge */}
      <span style={{
        position: "absolute", left: 0, top: 6, bottom: 6, width: 2,
        background: "var(--accent)",
        borderRadius: 2,
        opacity: active ? 1 : 0,
        transform: active ? "scaleY(1)" : "scaleY(0.4)",
        transformOrigin: "center",
        transition: "opacity 160ms ease, transform 160ms ease",
        boxShadow: active ? "0 0 12px oklch(0.7 0.1 65 / 0.7)" : "none",
        pointerEvents: "none",
      }} />
      <span style={{
        position: "relative",
        width: 18, height: 18, display: "inline-flex",
        alignItems: "center", justifyContent: "center",
        color: active ? "var(--accent)" : "currentColor",
        transition: "color 160ms ease",
      }}>{icon}</span>
      <span style={{ position: "relative" }}>{label}</span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   PlayCard
   • Ambient radial glow orb behind the card (positioned in
     <main> as a sibling, anchored to the card via offset).
   • Inner highlight via inset box-shadow on the top edge.
   • Abstract SVG motif fills the right side of the card.
   • Hover lifts -3px and brightens the border.
   ───────────────────────────────────────────────────────── */

function BotMotif() {
  // Stacked checker discs with concentric rings
  return (
    <svg width="210" height="190" viewBox="0 0 210 190" fill="none" style={{
      position: "absolute", right: -22, bottom: -28, pointerEvents: "none",
      opacity: 0.85,
    }}>
      <defs>
        <radialGradient id="bot-disc-a" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="oklch(0.78 0.11 65)" stopOpacity="0.55"/>
          <stop offset="1" stopColor="oklch(0.4 0.06 60)" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="bot-disc-b" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="oklch(0.7 0.1 65)" stopOpacity="0.35"/>
          <stop offset="1" stopColor="oklch(0.7 0.1 65)" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* big disc, back */}
      <circle cx="135" cy="118" r="78" stroke="oklch(0.7 0.1 65 / 0.16)" strokeWidth="1"/>
      <circle cx="135" cy="118" r="62" stroke="oklch(0.7 0.1 65 / 0.22)" strokeWidth="1"/>
      <circle cx="135" cy="118" r="46" stroke="oklch(0.7 0.1 65 / 0.32)" strokeWidth="1"/>
      <circle cx="135" cy="118" r="30" fill="url(#bot-disc-a)"/>
      <circle cx="135" cy="118" r="30" stroke="oklch(0.78 0.12 65 / 0.55)" strokeWidth="1"/>
      {/* small offset disc */}
      <circle cx="70" cy="60" r="22" stroke="oklch(0.7 0.1 65 / 0.45)" strokeWidth="1"/>
      <circle cx="70" cy="60" r="14" stroke="oklch(0.7 0.1 65 / 0.6)" strokeWidth="1"/>
      <circle cx="70" cy="60" r="8" fill="url(#bot-disc-b)"/>
      {/* scan tick — robotic accent */}
      <path d="M 24 96 L 50 96" stroke="oklch(0.78 0.12 65 / 0.5)" strokeWidth="1" strokeDasharray="2 3"/>
      <path d="M 24 104 L 38 104" stroke="oklch(0.78 0.12 65 / 0.3)" strokeWidth="1" strokeDasharray="2 3"/>
    </svg>
  );
}

function FriendMotif() {
  // Two overlapping discs (player + opponent) on a diagonal grid suggestion
  return (
    <svg width="210" height="190" viewBox="0 0 210 190" fill="none" style={{
      position: "absolute", right: -22, bottom: -28, pointerEvents: "none",
      opacity: 0.85,
    }}>
      <defs>
        <radialGradient id="fr-a" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="oklch(0.75 0.11 230)" stopOpacity="0.55"/>
          <stop offset="1" stopColor="oklch(0.4 0.06 230)" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="fr-b" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor="oklch(0.78 0.11 65)" stopOpacity="0.45"/>
          <stop offset="1" stopColor="oklch(0.5 0.07 60)" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* diagonal hatch grid suggestion */}
      <g stroke="oklch(0.75 0.1 230 / 0.18)" strokeWidth="1">
        <path d="M 0 40 L 210 40"/>
        <path d="M 0 70 L 210 70"/>
        <path d="M 0 100 L 210 100"/>
        <path d="M 0 130 L 210 130"/>
        <path d="M 0 160 L 210 160"/>
      </g>
      <g stroke="oklch(0.75 0.1 230 / 0.12)" strokeWidth="1">
        <path d="M 30 0 L 30 190"/>
        <path d="M 70 0 L 70 190"/>
        <path d="M 110 0 L 110 190"/>
        <path d="M 150 0 L 150 190"/>
        <path d="M 190 0 L 190 190"/>
      </g>
      {/* opponent disc (back) — warm */}
      <circle cx="105" cy="100" r="46" fill="url(#fr-b)" />
      <circle cx="105" cy="100" r="46" stroke="oklch(0.7 0.1 65 / 0.5)" strokeWidth="1"/>
      <circle cx="105" cy="100" r="34" stroke="oklch(0.7 0.1 65 / 0.35)" strokeWidth="1"/>
      {/* player disc (front) — cool */}
      <circle cx="150" cy="125" r="46" fill="url(#fr-a)"/>
      <circle cx="150" cy="125" r="46" stroke="oklch(0.75 0.11 230 / 0.6)" strokeWidth="1"/>
      <circle cx="150" cy="125" r="34" stroke="oklch(0.75 0.11 230 / 0.4)" strokeWidth="1"/>
      <circle cx="150" cy="125" r="22" stroke="oklch(0.75 0.11 230 / 0.6)" strokeWidth="1"/>
    </svg>
  );
}

function PlayCard({ title, sub, cta, icon, tone, onClick, footer }) {
  const [hover, setHover] = useStateDash(false);
  const isWarm = tone === "warm";
  const iconBg = isWarm ? "oklch(0.7 0.1 65 / 0.18)" : "oklch(0.7 0.1 230 / 0.18)";
  const iconFg = isWarm ? "var(--accent)" : "oklch(0.82 0.1 230)";
  const ctaColor = isWarm ? "var(--accent)" : "oklch(0.82 0.1 230)";
  return (
    <div style={{ position: "relative" }}>
      {/* ambient glow orb behind the card */}
      <div aria-hidden style={{
        position: "absolute",
        inset: -40,
        background: isWarm
          ? "radial-gradient(50% 60% at 20% 30%, oklch(0.7 0.1 65 / 0.18), transparent 70%)"
          : "radial-gradient(50% 60% at 80% 30%, oklch(0.7 0.1 230 / 0.16), transparent 70%)",
        filter: "blur(6px)",
        opacity: hover ? 1 : 0.7,
        transition: "opacity 200ms ease",
        pointerEvents: "none",
      }} />
      <div
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: "relative", textAlign: "left", width: "100%", cursor: "pointer",
          background: "linear-gradient(180deg, var(--bg-elev-2), var(--bg-elev-1))",
          border: `1px solid ${hover ? "var(--line)" : "var(--line-soft)"}`,
          borderRadius: 16, padding: 22, overflow: "hidden",
          minHeight: 232,
          transition: "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
          transform: hover ? "translateY(-3px)" : "none",
          boxShadow: hover
            ? "0 18px 40px -16px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 8px 18px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* inner top highlight */}
        <span aria-hidden style={{
          position: "absolute", left: 22, right: 22, top: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${isWarm ? "oklch(0.78 0.12 65 / 0.5)" : "oklch(0.8 0.11 230 / 0.5)"}, transparent)`,
          pointerEvents: "none",
        }} />
        {/* corner glow */}
        <span aria-hidden style={{
          position: "absolute", inset: 0,
          background: isWarm
            ? "radial-gradient(120% 80% at 0% 0%, oklch(0.7 0.1 65 / 0.16), transparent 55%)"
            : "radial-gradient(120% 80% at 100% 0%, oklch(0.7 0.1 230 / 0.16), transparent 55%)",
          pointerEvents: "none",
        }} />
        {/* abstract motif */}
        {isWarm ? <BotMotif /> : <FriendMotif />}

        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: iconBg, color: iconFg,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `inset 0 0 0 1px ${isWarm ? "oklch(0.7 0.1 65 / 0.3)" : "oklch(0.7 0.1 230 / 0.3)"}`,
          }}>{icon}</div>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: hover ? (isWarm ? "var(--accent)" : "oklch(0.7 0.1 230)") : "var(--bg-elev-3)",
            color: hover ? "#14110d" : "var(--text-mute)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 180ms ease",
            transform: hover ? "translateX(2px)" : "none",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
        </div>
        <div style={{ position: "relative", maxWidth: 280 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 13.5, color: "var(--text-mute)", lineHeight: 1.5, marginBottom: 14 }}>{sub}</div>
          {footer ? footer : (
            <div style={{
              fontSize: 13, fontWeight: 600,
              color: hover ? ctaColor : "var(--text)",
              transition: "color 180ms ease",
            }}>{cta} →</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Rank & Stats
   • Circular SVG progress ring for win rate
   • Rank badge with glow halo
   • Gradient progress bar to next rank with shimmer cap
   ───────────────────────────────────────────────────────── */

function WinRateRing({ pct, size = 96, stroke = 7 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ display: "block", transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="oklch(0.78 0.12 65)"/>
            <stop offset="1" stopColor="oklch(0.72 0.14 50)"/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--bg-elev-3)" strokeWidth={stroke} fill="none"/>
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          style={{ transition: "stroke-dasharray 600ms ease", filter: "drop-shadow(0 0 6px oklch(0.7 0.1 65 / 0.55))" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700,
          color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1,
        }}>{pct}%</div>
        <div style={{
          fontSize: 9.5, color: "var(--text-dim)",
          letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4, fontWeight: 600,
        }}>Win rate</div>
      </div>
    </div>
  );
}

function RankBadge({ icon }) {
  return (
    <div style={{ position: "relative", width: 56, height: 56 }}>
      {/* glow halo */}
      <div aria-hidden style={{
        position: "absolute", inset: -10,
        background: "radial-gradient(50% 50% at 50% 50%, oklch(0.7 0.1 65 / 0.55), transparent 70%)",
        filter: "blur(4px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "relative",
        width: 56, height: 56, borderRadius: 14,
        background: "linear-gradient(135deg, oklch(0.78 0.11 65), oklch(0.6 0.13 45))",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#1a1208",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 6px 16px -6px oklch(0.6 0.13 45 / 0.55)",
      }}>{icon}</div>
    </div>
  );
}

function ProgressBar({ pct }) {
  return (
    <div style={{
      position: "relative", height: 8, background: "var(--bg-elev-3)",
      borderRadius: 999, overflow: "hidden",
      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
    }}>
      <div style={{
        width: `${pct}%`, height: "100%",
        background: "linear-gradient(90deg, oklch(0.72 0.14 50), oklch(0.78 0.12 65), oklch(0.85 0.1 80))",
        borderRadius: 999,
        boxShadow: "0 0 8px oklch(0.7 0.1 65 / 0.6)",
        transition: "width 600ms ease",
      }} />
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div>
      <div style={{
        fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em",
        color: accent ? "var(--accent)" : "var(--text)",
        fontFamily: "var(--mono)",
      }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Dashboard page
   ───────────────────────────────────────────────────────── */

const BOT_CHIPS = [
  { name: "Beginner", value: 250 },
  { name: "Casual", value: 800 },
  { name: "Intermediate", value: 1250 },
  { name: "Expert", value: 1650 },
  { name: "Master", value: 2000 },
];

function DashboardPage({ user, profile, onProfileUpdate, onPlay, onLogout }) {
  const [nav, setNav] = useStateDash("Play");
  const [recents, setRecents] = useStateDash([]);
  const [stats, setStats] = useStateDash({ wins: 0, losses: 0, total: 0 });
  const [botModal, setBotModal] = useStateDash(false);
  const [mpModal, setMpModal] = useStateDash(false);
  const [difficulty, setDifficulty] = useStateDash(800);
  const [searchQuery, setSearchQuery] = useStateDash("");
  const [searchOpen, setSearchOpen] = useStateDash(false);
  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email || "Player";
  const avatarUrl = profile?.avatar_url || null;

  const [searchResults, setSearchResults] = useStateDash([]);
  useEffectDash(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.trim();
    const client = window.supabaseClient;
    if (!client) return;
    let cancelled = false;
    client.from("profiles")
      .select("id, display_name, avatar_url, region, wins, losses")
      .ilike("display_name", `%${q}%`)
      .neq("id", user?.id)
      .limit(6)
      .then(({ data }) => {
        if (!cancelled) setSearchResults(data || []);
      });
    return () => { cancelled = true; };
  }, [searchQuery]);

  useEffectDash(() => {
    if (!user?.id) return;
    fetch(`http://localhost:8000/user/${user.id}/history`)
      .then(res => res.json())
      .then(data => {
        const games = data.games || [];
        const mapped = games.map(g => ({
          opp: g.player2_id ? "vs Friend" : "vs AI",
          oppColor: "oklch(0.7 0.12 280)",
          result: g.winner === "BEIGE" ? "W" : (g.winner === "DRAW" ? "D" : "L"),
          moves: g.moves ? g.moves.length : 0,
          when: new Date(g.created_at).toLocaleDateString(),
          mode: g.player2_id ? "vs Friend" : "vs AI",
        }));
        setRecents(mapped);
        const wins = games.filter(g => g.winner === "BEIGE").length;
        const draws = games.filter(g => g.winner === "DRAW").length;
        const losses = games.length - wins - draws;
        setStats({ wins, losses, total: games.length });
      })
      .catch(() => {});
  }, [user]);

  const winRatePct = stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0;
  const streak = (() => {
    if (recents.length === 0) return { count: 0, kind: null };
    const first = recents[0].result;
    let n = 0;
    for (const g of recents) { if (g.result === first) n++; else break; }
    return { count: n, kind: first };
  })();
  const rankThresholds = [{ name: "Rookie", min: 0, max: 5 }, { name: "Bronze", min: 5, max: 10 }, { name: "Silver", min: 10, max: 20 }, { name: "Gold", min: 20, max: 20 }];
  const currentRankObj = rankThresholds.slice().reverse().find(r => stats.wins >= r.min) || rankThresholds[0];
  const nextRankObj = rankThresholds[rankThresholds.indexOf(currentRankObj) + 1];
  const rank = currentRankObj.name;
  const progressPct = nextRankObj ? Math.round(((stats.wins - currentRankObj.min) / (nextRankObj.min - currentRankObj.min)) * 100) : 100;

  return (
    <div className="page r-dash" data-screen-label="02 Dashboard" style={{
      minHeight: "100vh", display: "grid", gridTemplateColumns: "248px 1fr",
      position: "relative",
    }}>
      {/* Ambient page-level glow orbs */}
      <div aria-hidden style={{
        position: "fixed", pointerEvents: "none", inset: 0, overflow: "hidden", zIndex: 0,
      }}>
        <div style={{
          position: "absolute", top: "8%", left: "32%", width: 480, height: 480,
          background: "radial-gradient(circle, oklch(0.7 0.1 65 / 0.16), transparent 65%)",
          filter: "blur(20px)",
        }}/>
        <div style={{
          position: "absolute", top: "12%", right: "4%", width: 420, height: 420,
          background: "radial-gradient(circle, oklch(0.7 0.1 230 / 0.10), transparent 65%)",
          filter: "blur(20px)",
        }}/>
        <div style={{
          position: "absolute", bottom: "-10%", left: "38%", width: 520, height: 520,
          background: "radial-gradient(circle, oklch(0.7 0.1 65 / 0.08), transparent 65%)",
          filter: "blur(20px)",
        }}/>
      </div>

      {/* Sidebar */}
      <aside className="r-dash-sidebar" style={{
        position: "sticky", top: 0, height: "100vh", zIndex: 1,
        background: "var(--bg-elev-1)", borderRight: "1px solid var(--line-soft)",
        padding: "24px 16px", display: "flex", flexDirection: "column", gap: 24,
      }}>
        <div className="r-sidebar-brand" style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 6px" }}>
          <Logo size={28} />
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em" }}>Checkers</span>
        </div>

        <nav className="r-sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.12em", padding: "4px 14px 6px", fontWeight: 600 }}>MENU</div>
          <NavItem icon={I.play} label="Play" active={nav === "Play"} onClick={() => setNav("Play")} />
          <NavItem icon={I.history} label="History" active={nav === "History"} onClick={() => setNav("History")} />
          <NavItem icon={I.leader} label="Leaderboard" active={nav === "Leaderboard"} onClick={() => setNav("Leaderboard")} />
          <NavItem icon={I.settings} label="Settings" active={nav === "Settings"} onClick={() => setNav("Settings")} />
        </nav>

        <div className="r-sidebar-user" style={{ marginTop: "auto", padding: 14, background: "var(--bg-elev-2)", borderRadius: 12, border: "1px solid var(--line-soft)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name={displayName} photoUrl={avatarUrl} size={36} color="oklch(0.7 0.1 65)" />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
              <div title={user?.email || ""} style={{ fontSize: 11.5, color: "var(--text-dim)", fontFamily: "var(--mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email || ""}</div>
            </div>
            <button onClick={onLogout} title="Sign out" style={{ color: "var(--text-dim)", padding: 4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="r-dash-main" style={{ padding: "32px 40px 56px", width: "100%", position: "relative", zIndex: 1, minWidth: 0 }}>

        <style>{`
          @keyframes navSwap {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: none; }
          }
        `}</style>

        <div key={nav} style={{ animation: "navSwap 280ms cubic-bezier(0.22, 0.8, 0.3, 1) both" }}>

        {nav === "History"     && <HistoryView     user={user} />}
        {nav === "Leaderboard" && <LeaderboardView user={user} />}
        {nav === "Settings"    && <SettingsView    user={user} profile={profile} onProfileUpdate={onProfileUpdate} onLogout={onLogout} />}

        {nav === "Play" && <>
        {/* Header */}
        <header className="r-dash-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar name={displayName} photoUrl={avatarUrl} size={56} color="oklch(0.7 0.1 65)" ring />
            <div>
              <div style={{ fontSize: 13, color: "var(--text-mute)", marginBottom: 4 }}>Welcome back</div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>{displayName}</h1>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "var(--bg-elev-1)", border: `1px solid ${searchOpen ? "var(--accent)" : "var(--line-soft)"}`,
              padding: "9px 14px", borderRadius: 10, color: "var(--text-mute)", fontSize: 13,
              minWidth: 260, transition: "border-color 160ms ease",
            }}>
              {I.search}
              <input
                type="text"
                value={searchQuery}
                placeholder="Search players…"
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                style={{
                  flex: 1, minWidth: 0,
                  background: "transparent", border: "none", outline: "none",
                  color: "var(--text)", fontSize: 13, fontFamily: "inherit",
                }}
              />
            </div>
            {searchOpen && searchQuery.trim() && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", right: 0, left: 0,
                background: "var(--bg-elev-1)", border: "1px solid var(--line)",
                borderRadius: 10, padding: 6, zIndex: 20,
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.7)",
                maxHeight: 280, overflowY: "auto",
              }}>
                {searchResults.length === 0 ? (
                  <div style={{ padding: "12px 10px", color: "var(--text-dim)", fontSize: 12.5, textAlign: "center" }}>
                    No players match "{searchQuery}"
                  </div>
                ) : searchResults.map((p) => (
                  <button
                    key={p.id}
                    onMouseDown={(e) => { e.preventDefault(); setNav("Leaderboard"); setSearchQuery(""); setSearchOpen(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%",
                      padding: "8px 10px", borderRadius: 7, textAlign: "left",
                      cursor: "pointer", transition: "background 140ms ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "oklch(0.7 0.1 65 / 0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <Avatar name={p.display_name} photoUrl={p.avatar_url} size={28} color="oklch(0.7 0.12 200)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{p.display_name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--mono)" }}>{p.wins}W · {p.losses}L{p.region ? ` · ${p.region}` : ""}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Play cards */}
        <div className="r-play-cards" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginBottom: 36 }}>
          <PlayCard
            onClick={() => setBotModal(true)}
            title="Play vs Bot"
            sub="Sharpen your skills against bots from Beginner to Master."
            cta="Choose difficulty"
            icon={I.bot}
            tone="warm"
          />
          <PlayCard
            onClick={() => onPlay({ mode: "friend" })}
            title="Play vs Friend"
            sub="Local hotseat — pass the device and take turns."
            cta="Start game"
            icon={I.friend}
            tone="cool"
          />
          <PlayCard
            onClick={() => setMpModal(true)}
            title="Play Multiplayer"
            sub="Create a room or enter a code to play someone online."
            cta="Create or join"
            icon={I.multi}
            tone="warm"
          />
        </div>

        {/* Recent + Stats */}
        <div className="r-recent-stats" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
          {/* Recent games */}
          <section style={{
            background: "linear-gradient(180deg, var(--bg-elev-2), var(--bg-elev-1))",
            border: "1px solid var(--line-soft)",
            borderRadius: 16, padding: 22,
            boxShadow: "0 8px 22px -14px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "0.02em" }}>Recent games</h2>
              <button onClick={() => setNav("History")} style={{ color: "var(--text-mute)", fontSize: 12.5, fontWeight: 500, transition: "color 160ms ease", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-mute)"}
              >View all →</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {recents.map((g, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "auto 1fr auto auto",
                  alignItems: "center", gap: 14, padding: "12px 6px",
                  borderTop: i === 0 ? "none" : "1px solid var(--line-soft)",
                  transition: "background 160ms ease",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "oklch(0.7 0.1 65 / 0.03)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <Avatar name={g.opp} size={32} color={g.oppColor} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{g.opp}</div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{g.mode}</span>
                      <span style={{ color: "var(--text-dim)", opacity: 0.5 }}>·</span>
                      <span style={{ fontFamily: "var(--mono)" }}>{g.moves} moves</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-dim)", minWidth: 80, textAlign: "right" }}>{g.when}</div>
                  <ResultPill result={g.result} />
                </div>
              ))}
              {recents.length === 0 && (
                <div style={{ padding: "32px 6px", color: "var(--text-dim)", fontSize: 13, textAlign: "center" }}>
                  No games yet — your first match will show up here.
                </div>
              )}
            </div>
          </section>

          {/* Stats */}
          <section style={{
            position: "relative",
            background: "linear-gradient(180deg, var(--bg-elev-2), var(--bg-elev-1))",
            border: "1px solid var(--line-soft)",
            borderRadius: 16, padding: 22,
            display: "flex", flexDirection: "column",
            boxShadow: "0 8px 22px -14px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
            overflow: "hidden",
          }}>
            {/* subtle internal glow */}
            <div aria-hidden style={{
              position: "absolute", top: -40, right: -40, width: 220, height: 220,
              background: "radial-gradient(circle, oklch(0.7 0.1 65 / 0.18), transparent 70%)",
              filter: "blur(10px)", pointerEvents: "none",
            }}/>

            <div style={{ position: "relative", display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Rank & stats</h2>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--text-dim)" }}>SEASON 3</span>
            </div>

            {/* rank row: badge + name + ring */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16, padding: "8px 0 18px", borderBottom: "1px solid var(--line-soft)" }}>
              <RankBadge icon={I.trophy} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "var(--text-mute)", letterSpacing: "0.04em" }}>Current rank</div>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", marginTop: 2 }}>{rank}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-dim)", fontFamily: "var(--mono)", marginTop: 2 }}>
                  {stats.total} games · {stats.wins} wins
                </div>
              </div>
              <WinRateRing pct={winRatePct} />
            </div>

            {/* progress to next */}
            <div style={{ position: "relative", paddingTop: 14, paddingBottom: 18, borderBottom: "1px solid var(--line-soft)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-mute)", marginBottom: 8 }}>
                <span>{nextRankObj ? `To ${nextRankObj.name}` : "Max rank"}</span>
                <span style={{ fontFamily: "var(--mono)" }}>{stats.wins} / {nextRankObj ? nextRankObj.min : stats.wins}</span>
              </div>
              <ProgressBar pct={progressPct} />
            </div>

            {/* numbers */}
            <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", paddingTop: 16, gap: 8 }}>
              <Stat label="Wins" value={stats.wins} />
              <Stat label="Losses" value={stats.losses} />
              <Stat
                label={streak.kind === "L" ? "Loss streak" : (streak.kind === "D" ? "Draw streak" : "Win streak")}
                value={streak.count > 0 ? `${streak.kind === "L" ? "❄️" : (streak.kind === "D" ? "🤝" : "🔥")} ${streak.count}` : "—"}
                accent={streak.kind === "W"}
              />
            </div>
          </section>
        </div>
        </>}
        </div>
      </main>

      {botModal && (
        <DifficultyModal
          difficulty={difficulty}
          onChange={setDifficulty}
          onClose={() => setBotModal(false)}
          onStart={() => { setBotModal(false); onPlay({ mode: "bot", difficulty }); }}
        />
      )}

      {mpModal && (
        <MultiplayerModal
          user={user}
          onClose={() => setMpModal(false)}
          onStart={(cfg) => { setMpModal(false); onPlay(cfg); }}
        />
      )}
    </div>
  );
}

function DifficultyModal({ difficulty, onChange, onClose, onStart }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(10,8,6,0.7)",
      backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 50,
    }}>
      <div onClick={(e) => e.stopPropagation()} className="r-modal" style={{
        background: "var(--bg-elev-1)", border: "1px solid var(--line)",
        borderRadius: 18, padding: 28, width: 460,
        boxShadow: "0 40px 80px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>Choose difficulty</h3>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-dim)", letterSpacing: "0.08em" }}>VS BOT</span>
        </div>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-mute)" }}>
          Pick a difficulty level to play against.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {BOT_CHIPS.map(p => {
            const active = difficulty === p.value;
            return (
              <button key={p.name} onClick={() => onChange(p.value)} style={{
                padding: "10px 16px", borderRadius: 10,
                background: active ? "var(--accent-soft)" : "var(--bg-elev-2)",
                border: `1px solid ${active ? "var(--accent)" : "var(--line-soft)"}`,
                color: active ? "var(--accent)" : "var(--text-mute)",
                fontSize: 13, fontWeight: 600, letterSpacing: "-0.005em",
                transition: "all 140ms ease",
              }}>{p.name}</button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            padding: "10px 18px", borderRadius: 10,
            background: "var(--bg-elev-3)", color: "var(--text)",
            fontWeight: 600, fontSize: 13.5,
          }}>Cancel</button>
          <button onClick={onStart} style={{
            padding: "10px 20px", borderRadius: 10,
            background: "var(--accent)", color: "#14110d",
            fontWeight: 700, fontSize: 13.5,
          }}>Start game</button>
        </div>
      </div>
    </div>
  );
}

function MultiplayerModal({ user, onClose, onStart }) {
  const [tab, setTab] = useStateDash("create");
  const [code, setCode] = useStateDash(() => Math.random().toString(36).slice(2, 8).toUpperCase());
  const [joinCode, setJoinCode] = useStateDash("");
  const [status, setStatus] = useStateDash("idle"); // idle | waiting | joining | error
  const [errorMsg, setErrorMsg] = useStateDash("");
  const channelRef = useRefDash(null);

  // When hosting, register the room on the backend and wait for the guest to join the realtime channel.
  async function startHosting() {
    setStatus("waiting");
    setErrorMsg("");
    try {
      await fetch(`http://localhost:8000/game/new?game_id=${code}`, { method: "POST" });
    } catch (e) {
      setStatus("error");
      setErrorMsg("Could not reach server.");
      return;
    }
    const client = window.supabaseClient;
    if (!client) {
      setStatus("error");
      setErrorMsg("Realtime not available.");
      return;
    }
    const channel = client.channel(`room:${code}`, {
      config: { presence: { key: user?.id || `host-${code}` } },
    });
    channelRef.current = channel;
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const peers = Object.keys(state).length;
      if (peers >= 2) {
        onStart({ mode: "multiplayer", roomCode: code, role: "host" });
      }
    });
    channel.subscribe(async (s) => {
      if (s === "SUBSCRIBED") {
        await channel.track({ role: "host", at: Date.now() });
      }
    });
  }

  async function joinRoom() {
    const c = joinCode.trim().toUpperCase();
    if (c.length < 4) { setErrorMsg("Enter a valid code."); return; }
    setStatus("joining");
    setErrorMsg("");
    // Verify the room exists on the backend
    try {
      const res = await fetch(`http://localhost:8000/game/${c}/board`);
      if (!res.ok) {
        setStatus("idle");
        setErrorMsg("Room not found.");
        return;
      }
    } catch (e) {
      setStatus("idle");
      setErrorMsg("Could not reach server.");
      return;
    }
    // Track presence on the room channel so the host transitions to the game.
    const client = window.supabaseClient;
    if (client) {
      const channel = client.channel(`room:${c}`, {
        config: { presence: { key: user?.id || `guest-${c}` } },
      });
      channelRef.current = channel;
      channel.subscribe(async (s) => {
        if (s === "SUBSCRIBED") {
          await channel.track({ role: "guest", at: Date.now() });
          // Small delay so the host's sync fires before we navigate
          setTimeout(() => onStart({ mode: "multiplayer", roomCode: c, role: "guest" }), 250);
        }
      });
    } else {
      onStart({ mode: "multiplayer", roomCode: c, role: "guest" });
    }
  }

  useEffectDash(() => {
    return () => {
      if (channelRef.current) {
        try { channelRef.current.unsubscribe(); } catch (_) {}
      }
    };
  }, []);

  function copyCode() {
    try { navigator.clipboard.writeText(code); } catch (_) {}
  }

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(10,8,6,0.7)",
      backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 50,
    }}>
      <div onClick={(e) => e.stopPropagation()} className="r-modal" style={{
        background: "var(--bg-elev-1)", border: "1px solid var(--line)",
        borderRadius: 18, padding: 28, width: 460,
        boxShadow: "0 40px 80px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>Play multiplayer</h3>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-dim)", letterSpacing: "0.08em" }}>ONLINE</span>
        </div>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--text-mute)" }}>
          Create a room and share the code, or enter a friend's code to join.
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, background: "var(--bg-elev-2)", padding: 4, borderRadius: 10, marginBottom: 20, border: "1px solid var(--line-soft)" }}>
          {[{ id: "create", label: "Create room" }, { id: "join", label: "Join with code" }].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setErrorMsg(""); setStatus("idle"); }} style={{
              flex: 1, padding: "9px 12px", borderRadius: 8,
              background: tab === t.id ? "var(--bg-elev-1)" : "transparent",
              color: tab === t.id ? "var(--text)" : "var(--text-mute)",
              fontWeight: 600, fontSize: 13,
              border: `1px solid ${tab === t.id ? "var(--line-soft)" : "transparent"}`,
              transition: "all 140ms ease",
            }}>{t.label}</button>
          ))}
        </div>

        {tab === "create" ? (
          <div>
            <div style={{ fontSize: 11.5, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Room code</div>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px", borderRadius: 12,
              background: "var(--bg-elev-2)", border: "1px solid var(--line-soft)",
            }}>
              <span style={{
                flex: 1, fontFamily: "var(--mono)", fontSize: 26, fontWeight: 700,
                letterSpacing: "0.18em", color: "var(--accent)",
              }}>{code}</span>
              <button onClick={copyCode} title="Copy code" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 12px", borderRadius: 8,
                background: "var(--bg-elev-3)", color: "var(--text)",
                fontSize: 12.5, fontWeight: 600,
              }}>{I.copy} Copy</button>
            </div>
            {status === "waiting" && (
              <div style={{ marginTop: 14, fontSize: 13, color: "var(--text-mute)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: 999, background: "var(--accent)",
                  boxShadow: "0 0 10px var(--accent)", animation: "mpPulse 1.2s ease-in-out infinite",
                }}/>
                Waiting for an opponent to join…
              </div>
            )}
            {errorMsg && (
              <div style={{ marginTop: 12, fontSize: 12.5, color: "oklch(0.7 0.16 25)" }}>{errorMsg}</div>
            )}
            <style>{`@keyframes mpPulse { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }`}</style>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
              <button onClick={onClose} style={{
                padding: "10px 18px", borderRadius: 10,
                background: "var(--bg-elev-3)", color: "var(--text)",
                fontWeight: 600, fontSize: 13.5,
              }}>Cancel</button>
              <button onClick={startHosting} disabled={status === "waiting"} style={{
                padding: "10px 20px", borderRadius: 10,
                background: status === "waiting" ? "var(--bg-elev-3)" : "var(--accent)",
                color: status === "waiting" ? "var(--text-mute)" : "#14110d",
                fontWeight: 700, fontSize: 13.5,
                cursor: status === "waiting" ? "default" : "pointer",
              }}>{status === "waiting" ? "Waiting…" : "Create room"}</button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 11.5, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Enter code</div>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder="ABC123"
              maxLength={8}
              autoFocus
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12,
                background: "var(--bg-elev-2)", border: "1px solid var(--line-soft)",
                color: "var(--text)", fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700,
                letterSpacing: "0.18em", outline: "none", textTransform: "uppercase",
              }}
            />
            {errorMsg && (
              <div style={{ marginTop: 10, fontSize: 12.5, color: "oklch(0.7 0.16 25)" }}>{errorMsg}</div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
              <button onClick={onClose} style={{
                padding: "10px 18px", borderRadius: 10,
                background: "var(--bg-elev-3)", color: "var(--text)",
                fontWeight: 600, fontSize: 13.5,
              }}>Cancel</button>
              <button onClick={joinRoom} disabled={status === "joining"} style={{
                padding: "10px 20px", borderRadius: 10,
                background: "var(--accent)", color: "#14110d",
                fontWeight: 700, fontSize: 13.5,
              }}>{status === "joining" ? "Joining…" : "Join room"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

window.DashboardPage = DashboardPage;
window.Avatar = Avatar;
