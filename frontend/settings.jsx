// Settings view — renders inside the dashboard frame when
// the "Settings" sidebar tab is active. Reuses Avatar from dashboard.jsx.
const { useState: useStateSet, useRef: useRefSet, useEffect: useEffectSet } = React;

/* ─────────────────────────────────────────────────────────
   Icons
   ───────────────────────────────────────────────────────── */
const SI = {
  visuals: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18"/><path d="M9 3v18"/></svg>,
  audio:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15 9a4 4 0 0 1 0 6"/><path d="M18 6a8 8 0 0 1 0 12"/></svg>,
  account: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>,
  camera:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h3l2-3h4l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="3.5"/></svg>,
  logout:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>,
  check:   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-12"/></svg>,
};

/* ─────────────────────────────────────────────────────────
   Sub-nav (left rail inside the page)
   ───────────────────────────────────────────────────────── */

const SECTIONS = [
  { id: "visuals", label: "Gameplay & Visuals", icon: SI.visuals },
  { id: "audio",   label: "Audio",              icon: SI.audio   },
  { id: "account", label: "Account",            icon: SI.account },
];

function SubNavItem({ icon, label, active, onClick }) {
  const [hover, setHover] = useStateSet(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "flex", alignItems: "center", gap: 10, width: "100%",
        padding: "10px 14px", borderRadius: 8,
        textAlign: "left",
        color: active ? "var(--text)" : (hover ? "var(--text)" : "var(--text-mute)"),
        background: "transparent",
        fontSize: 13.5, fontWeight: active ? 600 : 500,
        transition: "color 160ms ease",
        overflow: "hidden",
      }}
    >
      <span aria-hidden style={{
        position: "absolute", inset: 0,
        background: active
          ? "linear-gradient(90deg, oklch(0.7 0.1 65 / 0.16), transparent 70%)"
          : (hover ? "linear-gradient(90deg, oklch(0.7 0.1 65 / 0.05), transparent 80%)" : "transparent"),
        transition: "background 160ms ease",
        pointerEvents: "none",
      }}/>
      <span aria-hidden style={{
        position: "absolute", left: 0, top: 6, bottom: 6, width: 2,
        background: "var(--accent)", borderRadius: 2,
        opacity: active ? 1 : 0,
        transform: active ? "scaleY(1)" : "scaleY(0.4)",
        transition: "opacity 160ms ease, transform 160ms ease",
        boxShadow: active ? "0 0 10px oklch(0.7 0.1 65 / 0.65)" : "none",
        pointerEvents: "none",
      }}/>
      <span style={{
        position: "relative",
        color: active ? "var(--accent)" : "currentColor",
        transition: "color 160ms ease",
        display: "inline-flex",
      }}>{icon}</span>
      <span style={{ position: "relative" }}>{label}</span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   Reusable primitives: ToggleSwitch, Slider, GlassInput
   ───────────────────────────────────────────────────────── */

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        position: "relative", width: 40, height: 22, borderRadius: 999,
        background: checked
          ? "linear-gradient(90deg, oklch(0.72 0.14 50), oklch(0.78 0.12 65))"
          : "var(--bg-elev-3)",
        boxShadow: checked
          ? "inset 0 0 0 1px oklch(0.7 0.1 65 / 0.6), 0 0 12px oklch(0.7 0.1 65 / 0.35)"
          : "inset 0 0 0 1px var(--line-soft), inset 0 1px 2px rgba(0,0,0,0.4)",
        transition: "background 180ms ease, box-shadow 180ms ease",
        cursor: "pointer", padding: 0, border: "none",
      }}
    >
      <span aria-hidden style={{
        position: "absolute", top: 2, left: checked ? 20 : 2,
        width: 18, height: 18, borderRadius: "50%",
        background: checked ? "#fff8ec" : "var(--text-mute)",
        boxShadow: checked
          ? "0 0 8px oklch(0.85 0.1 70 / 0.7), 0 2px 4px rgba(0,0,0,0.4)"
          : "0 1px 3px rgba(0,0,0,0.4)",
        transition: "left 180ms cubic-bezier(0.3, 0.8, 0.3, 1), background 180ms ease",
      }}/>
    </button>
  );
}

function Slider({ value, onChange, min = 0, max = 100 }) {
  const trackRef = useRefSet(null);
  const [dragging, setDragging] = useStateSet(false);

  const pct = ((value - min) / (max - min)) * 100;

  function valueFromEvent(e) {
    const rect = trackRef.current.getBoundingClientRect();
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    return Math.round(min + ratio * (max - min));
  }

  useEffectSet(() => {
    if (!dragging) return;
    const onMove = (e) => onChange(valueFromEvent(e));
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging]);

  return (
    <div
      ref={trackRef}
      onPointerDown={(e) => { setDragging(true); onChange(valueFromEvent(e)); }}
      style={{
        position: "relative", height: 28,
        display: "flex", alignItems: "center",
        cursor: "pointer",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      {/* track */}
      <div style={{
        position: "relative", width: "100%", height: 6, borderRadius: 999,
        background: "linear-gradient(90deg, oklch(0.2 0.01 60), oklch(0.25 0.01 60))",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
        overflow: "hidden",
      }}>
        {/* fill */}
        <div style={{
          position: "absolute", top: 0, left: 0, height: "100%",
          width: `${pct}%`,
          background: "linear-gradient(90deg, oklch(0.55 0.1 50), oklch(0.78 0.12 65), oklch(0.85 0.1 80))",
          borderRadius: 999,
          boxShadow: "0 0 8px oklch(0.7 0.1 65 / 0.55)",
        }}/>
      </div>
      {/* thumb */}
      <div style={{
        position: "absolute", top: "50%", left: `calc(${pct}% - 9px)`,
        width: 18, height: 18, borderRadius: "50%",
        background: "linear-gradient(135deg, oklch(0.88 0.1 75), oklch(0.7 0.12 55))",
        transform: "translateY(-50%)",
        boxShadow: dragging
          ? "0 0 0 6px oklch(0.7 0.1 65 / 0.22), 0 0 14px oklch(0.7 0.1 65 / 0.6), inset 0 1px 0 rgba(255,255,255,0.35)"
          : "0 0 10px oklch(0.7 0.1 65 / 0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
        transition: "box-shadow 160ms ease",
        pointerEvents: "none",
      }}/>
    </div>
  );
}

function RegionSelect({ value, onChange }) {
  const [focus, setFocus] = useStateSet(false);
  return (
    <label style={{ display: "block" }}>
      <div style={{
        fontSize: 10.5, color: "var(--text-dim)", letterSpacing: "0.1em",
        textTransform: "uppercase", fontWeight: 700, marginBottom: 6,
      }}>Region</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: "100%",
          padding: "11px 14px",
          fontSize: 13.5, fontFamily: "inherit",
          color: value ? "var(--text)" : "var(--text-mute)",
          background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.55), oklch(0.18 0.012 55 / 0.4))",
          border: `1px solid ${focus ? "oklch(0.7 0.1 65 / 0.7)" : "var(--line-soft)"}`,
          borderRadius: 10,
          outline: "none", appearance: "none",
          backgroundImage: `linear-gradient(180deg, oklch(0.22 0.015 60 / 0.55), oklch(0.18 0.012 55 / 0.4)), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%239d9485' d='M6 8 0 0h12z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat, no-repeat",
          backgroundPosition: "0 0, right 14px center",
          backgroundSize: "auto, 10px",
          paddingRight: 36,
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxShadow: focus
            ? "0 0 0 3px oklch(0.7 0.1 65 / 0.12), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "inset 0 1px 0 rgba(255,255,255,0.04)",
          transition: "border-color 160ms ease, box-shadow 160ms ease",
          cursor: "pointer",
        }}
      >
        <option value="">Choose your region…</option>
        {REGIONS.map(r => (
          <option key={r.code} value={r.code}>{r.name}</option>
        ))}
      </select>
    </label>
  );
}

function GlassInput({ label, value, onChange, type = "text", placeholder }) {
  const [focus, setFocus] = useStateSet(false);
  return (
    <label style={{ display: "block" }}>
      <div style={{
        fontSize: 10.5, color: "var(--text-dim)", letterSpacing: "0.1em",
        textTransform: "uppercase", fontWeight: 700, marginBottom: 6,
      }}>{label}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: "100%",
          padding: "11px 14px",
          fontSize: 13.5,
          fontFamily: type === "email" ? "var(--mono)" : "inherit",
          color: "var(--text)",
          background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.55), oklch(0.18 0.012 55 / 0.4))",
          border: `1px solid ${focus ? "oklch(0.7 0.1 65 / 0.7)" : "var(--line-soft)"}`,
          borderRadius: 10,
          outline: "none",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxShadow: focus
            ? "0 0 0 3px oklch(0.7 0.1 65 / 0.12), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "inset 0 1px 0 rgba(255,255,255,0.04)",
          transition: "border-color 160ms ease, box-shadow 160ms ease",
        }}
      />
    </label>
  );
}

/* ─────────────────────────────────────────────────────────
   Settings rows + grouping
   ───────────────────────────────────────────────────────── */

function SettingsCard({ title, sub, children }) {
  return (
    <section style={{
      position: "relative",
      background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.55), oklch(0.18 0.012 55 / 0.4))",
      border: "1px solid var(--line-soft)",
      borderRadius: 14, padding: 22,
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      boxShadow: "0 8px 22px -14px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
      overflow: "hidden",
    }}>
      <div aria-hidden style={{
        position: "absolute", top: -40, right: -40, width: 200, height: 200,
        background: "radial-gradient(circle, oklch(0.7 0.1 65 / 0.14), transparent 70%)",
        filter: "blur(10px)", pointerEvents: "none",
      }}/>
      <div style={{ position: "relative" }}>
        {title && (
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "-0.005em" }}>{title}</h3>
            {sub && <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--text-mute)" }}>{sub}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function Row({ label, hint, children, last }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18,
      padding: "12px 0",
      borderBottom: last ? "none" : "1px solid var(--line-soft)",
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2, maxWidth: 380 }}>{hint}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Board theme picker
   ───────────────────────────────────────────────────────── */

const BOARD_THEMES = [
  {
    id: "wood", name: "Classic Wood",
    light: "oklch(0.72 0.06 70)", dark: "oklch(0.34 0.05 50)",
    glowHue: 60,
    player: "oklch(0.9 0.05 80)", opp: "oklch(0.45 0.13 25)",
  },
  {
    id: "neon", name: "Cyber Neon",
    light: "oklch(0.28 0.04 220)", dark: "oklch(0.18 0.03 280)",
    glowHue: 195,
    player: "oklch(0.85 0.18 195)", opp: "oklch(0.7 0.22 320)",
  },
  {
    id: "obsidian", name: "Minimal Obsidian",
    light: "oklch(0.32 0.005 250)", dark: "oklch(0.18 0.005 250)",
    glowHue: 250,
    player: "oklch(0.92 0.005 250)", opp: "oklch(0.4 0.01 250)",
  },
];

function MiniBoard({ theme }) {
  // 4x4 mini board
  const cells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      cells.push({ r, c, dark: (r + c) % 2 === 1 });
    }
  }
  const pieces = [
    { r: 0, c: 1, side: "opp" },
    { r: 1, c: 0, side: "opp" },
    { r: 2, c: 3, side: "player" },
    { r: 3, c: 2, side: "player" },
  ];
  return (
    <svg width="100%" viewBox="0 0 80 80" style={{ display: "block", borderRadius: 8 }}>
      {cells.map((cell, i) => (
        <rect key={i}
          x={cell.c * 20} y={cell.r * 20} width="20" height="20"
          fill={cell.dark ? theme.dark : theme.light}
        />
      ))}
      {pieces.map((p, i) => (
        <g key={i}>
          <circle cx={p.c * 20 + 10} cy={p.r * 20 + 10} r="7"
            fill={p.side === "player" ? theme.player : theme.opp}
            stroke="rgba(0,0,0,0.3)" strokeWidth="0.6"/>
          <circle cx={p.c * 20 + 10} cy={p.r * 20 + 10} r="4"
            fill="none" stroke={p.side === "player" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.18)"} strokeWidth="0.6"/>
        </g>
      ))}
    </svg>
  );
}

function BoardThemeCard({ theme, active, onClick }) {
  const [hover, setHover] = useStateSet(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative", textAlign: "left",
        padding: 12,
        background: "linear-gradient(180deg, var(--bg-elev-2), var(--bg-elev-1))",
        border: `1px solid ${active ? "var(--accent)" : "var(--line-soft)"}`,
        borderRadius: 12,
        cursor: "pointer",
        transform: hover && !active ? "translateY(-2px)" : "none",
        boxShadow: active
          ? "0 0 0 3px oklch(0.7 0.1 65 / 0.18), 0 0 22px oklch(0.7 0.1 65 / 0.35)"
          : (hover ? "0 10px 22px -14px rgba(0,0,0,0.55)" : "none"),
        transition: "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
        overflow: "hidden",
      }}
    >
      {/* mini board */}
      <div style={{ position: "relative", borderRadius: 8, overflow: "hidden",
        boxShadow: "inset 0 0 0 1px var(--line-soft)",
      }}>
        <MiniBoard theme={theme}/>
        {/* tonal wash */}
        <div aria-hidden style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(80% 60% at 20% 0%, oklch(0.7 0.1 ${theme.glowHue} / 0.18), transparent 70%)`,
          pointerEvents: "none",
        }}/>
      </div>
      {/* footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{theme.name}</div>
        {active ? (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 8px", borderRadius: 999,
            background: "oklch(0.7 0.1 65 / 0.16)",
            color: "var(--accent)",
            boxShadow: "inset 0 0 0 1px oklch(0.7 0.1 65 / 0.5)",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "var(--mono)",
          }}>{SI.check} ACTIVE</span>
        ) : (
          <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--mono)", letterSpacing: "0.04em" }}>
            Tap to apply
          </span>
        )}
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   Section panels
   ───────────────────────────────────────────────────────── */

function VisualsPanel({ s, set }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SettingsCard title="Board theme" sub="Choose the visual style of the playing board.">
        <div className="r-theme-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {BOARD_THEMES.map(t => (
            <BoardThemeCard key={t.id} theme={t}
              active={s.theme === t.id}
              onClick={() => set({ theme: t.id })}
            />
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Game helpers" sub="Quality-of-life tweaks for in-game feedback.">
        <Row label="Show move hints" hint="Highlight legal squares when you pick up a piece.">
          <ToggleSwitch checked={s.hints} onChange={(v) => set({ hints: v })}/>
        </Row>
        <Row label="Enable smooth animations" hint="Pieces glide between squares instead of snapping.">
          <ToggleSwitch checked={s.smooth} onChange={(v) => set({ smooth: v })}/>
        </Row>
        <Row label="Auto-flip board for opponent" hint="Rotate the board so each player faces their own side.">
          <ToggleSwitch checked={s.flip} onChange={(v) => set({ flip: v })}/>
        </Row>
        <Row last label="Show capture trail" hint="Briefly trace the path of a multi-jump.">
          <ToggleSwitch checked={s.trail} onChange={(v) => set({ trail: v })}/>
        </Row>
      </SettingsCard>
    </div>
  );
}

function AudioPanel({ s, set }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SettingsCard title="Volume" sub="Master and per-channel mix levels.">
        <div style={{ paddingTop: 4 }}>
          <SliderRow
            label="Master volume"
            value={s.master}
            onChange={(v) => set({ master: v })}
          />
          <SliderRow
            label="Sound effects"
            value={s.sfx}
            onChange={(v) => set({ sfx: v })}
          />
          <SliderRow
            label="Music"
            value={s.music}
            onChange={(v) => set({ music: v })}
            last
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Cues" sub="Audio feedback for in-game events.">
        <Row label="Move sound" hint="Play a soft click on every move.">
          <ToggleSwitch checked={s.moveSfx} onChange={(v) => set({ moveSfx: v })}/>
        </Row>
        <Row last label="Capture chime" hint="Distinct sound when a piece is captured.">
          <ToggleSwitch checked={s.captureSfx} onChange={(v) => set({ captureSfx: v })}/>
        </Row>
      </SettingsCard>
    </div>
  );
}

function SliderRow({ label, value, onChange, last }) {
  return (
    <div style={{
      padding: "10px 0",
      borderBottom: last ? "none" : "1px solid var(--line-soft)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</div>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent)",
          minWidth: 40, textAlign: "right",
        }}>{value}%</div>
      </div>
      <Slider value={value} onChange={onChange}/>
    </div>
  );
}

const REGIONS = [
  { code: "NA",  name: "North America" },
  { code: "SA",  name: "South America" },
  { code: "EU",  name: "Europe" },
  { code: "MENA", name: "Middle East & North Africa" },
  { code: "SSA", name: "Sub-Saharan Africa" },
  { code: "ASIA", name: "Asia" },
  { code: "OCE", name: "Oceania" },
];
window.CHECKERS_REGIONS = REGIONS;

function AccountPanel({ user, profile, onProfileUpdate, s, set, onLogout }) {
  const [pendingName, setPendingName] = useStateSet(profile?.display_name || s.displayName);
  const [pendingRegion, setPendingRegion] = useStateSet(profile?.region || "");
  const [pendingAvatarFile, setPendingAvatarFile] = useStateSet(null);
  const [pendingAvatarUrl, setPendingAvatarUrl] = useStateSet(profile?.avatar_url || null);
  const avatarInputRef = useRefSet(null);
  const [saveState, setSaveState] = useStateSet("idle"); // idle | saving | saved | error
  const currentRegion = profile?.region || "";
  const dirty = (pendingName.trim() !== (profile?.display_name || s.displayName) && pendingName.trim().length > 0)
             || pendingRegion !== currentRegion
             || pendingAvatarFile !== null;

  function handleAvatarPick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPendingAvatarFile(f);
    setPendingAvatarUrl(URL.createObjectURL(f));
  }

  async function saveProfile() {
    if (!dirty || saveState === "saving") return;
    setSaveState("saving");
    try {
      const updates = {};
      if (pendingName.trim() !== s.displayName.trim() && pendingName.trim().length > 0) {
        updates.display_name = pendingName.trim();
      }
      if (pendingRegion !== currentRegion) {
        updates.region = pendingRegion || null;
      }
      if (pendingAvatarFile) {
        updates.avatar_url = await new Promise((resolve) => {
          const img = new Image();
          const url = URL.createObjectURL(pendingAvatarFile);
          img.onload = () => {
            URL.revokeObjectURL(url);
            const size = 200;
            const canvas = document.createElement("canvas");
            canvas.width = size; canvas.height = size;
            const ctx = canvas.getContext("2d");
            const min = Math.min(img.width, img.height);
            const sx = (img.width - min) / 2, sy = (img.height - min) / 2;
            ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
            resolve(canvas.toDataURL("image/jpeg", 0.88));
          };
          img.src = url;
        });
      }
      const { data: { user: fresh }, error } = await window.supabaseClient.auth.updateUser({ data: updates });
      if (error) throw error;
      const profileUpdates = {
        id: user.id,
        ...(updates.display_name !== undefined && { display_name: updates.display_name }),
        ...(updates.avatar_url   !== undefined && { avatar_url:   updates.avatar_url   }),
        ...(updates.region       !== undefined && { region:       updates.region       }),
      };
      await window.supabaseClient.from("profiles").upsert(profileUpdates);
      onProfileUpdate?.({ ...profile, ...profileUpdates });
      if (pendingName.trim().length > 0) set({ displayName: pendingName.trim() });
      setPendingAvatarFile(null);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1800);
    } catch (e) {
      console.warn("Profile save failed:", e);
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 2500);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SettingsCard title="Profile" sub="How you appear to opponents and on the leaderboard.">
        <div className="r-profile-row" style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 22, flexWrap: "wrap" }}>
          {/* Big avatar with overlay */}
          <div style={{ position: "relative", width: 104, height: 104, flexShrink: 0 }}>
            <div aria-hidden style={{
              position: "absolute", inset: -10,
              background: "radial-gradient(circle, oklch(0.7 0.1 65 / 0.45), transparent 70%)",
              filter: "blur(8px)", pointerEvents: "none",
            }}/>
            <Avatar name={s.displayName} photoUrl={pendingAvatarUrl} size={104} color="oklch(0.7 0.12 65)" />
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarPick} style={{ display: "none" }} />
            <button
              onClick={() => avatarInputRef.current?.click()}
              style={{
                position: "absolute", bottom: -4, left: "50%",
                transform: "translateX(-50%)",
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 10px", borderRadius: 999,
                background: "var(--bg-elev-2)",
                border: "1px solid var(--line)",
                color: "var(--text-mute)",
                fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em",
                fontFamily: "var(--mono)", textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: "0 6px 14px -6px rgba(0,0,0,0.55)",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderColor = "oklch(0.7 0.1 65 / 0.6)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-mute)"; e.currentTarget.style.borderColor = "var(--line)"; }}
            >
              {SI.camera} Change
            </button>
          </div>

          {/* Inputs */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
            <GlassInput
              label="Display name"
              value={pendingName}
              onChange={setPendingName}
              placeholder="Your in-game name"
            />
            <RegionSelect value={pendingRegion} onChange={setPendingRegion} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, paddingTop: 12, borderTop: "1px solid var(--line-soft)" }}>
          {saveState === "saved" && (
            <span style={{ fontSize: 12, color: "var(--good)", fontWeight: 600, marginRight: "auto" }}>Saved ✓</span>
          )}
          {saveState === "error" && (
            <span style={{ fontSize: 12, color: "oklch(0.7 0.16 25)", fontWeight: 600, marginRight: "auto" }}>Couldn't save — try again</span>
          )}
          <button onClick={() => setPendingName(s.displayName)} disabled={!dirty} style={{
            padding: "9px 18px", borderRadius: 10,
            background: "var(--bg-elev-3)", color: "var(--text-mute)",
            fontWeight: 600, fontSize: 13,
            transition: "color 160ms ease",
            opacity: dirty ? 1 : 0.5, cursor: dirty ? "pointer" : "default",
          }}>Cancel</button>
          <button onClick={saveProfile} disabled={!dirty || saveState === "saving"} style={{
            padding: "9px 20px", borderRadius: 10,
            background: "var(--accent)", color: "#14110d",
            fontWeight: 700, fontSize: 13,
            boxShadow: "0 6px 14px -6px oklch(0.7 0.1 65 / 0.5)",
            opacity: (!dirty || saveState === "saving") ? 0.55 : 1,
            cursor: (!dirty || saveState === "saving") ? "default" : "pointer",
          }}>{saveState === "saving" ? "Saving…" : "Save changes"}</button>
        </div>
      </SettingsCard>

      <SettingsCard title="Preferences" sub="Notifications and visibility.">
        <Row label="Show me on the leaderboard" hint="Toggle off to hide your username from global rankings.">
          <ToggleSwitch checked={s.publicProfile} onChange={(v) => set({ publicProfile: v })}/>
        </Row>
        <Row last label="Email match summaries" hint="Get a weekly recap of your matches and stats.">
          <ToggleSwitch checked={s.emailDigest} onChange={(v) => set({ emailDigest: v })}/>
        </Row>
      </SettingsCard>

      {/* Danger / sign out */}
      <SettingsCard>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>Sign out</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2, maxWidth: 380 }}>
              You'll need to log back in to continue your season.
            </div>
          </div>
          <LogoutButton onClick={onLogout} />
        </div>
      </SettingsCard>
    </div>
  );
}

function LogoutButton({ onClick }) {
  const [hover, setHover] = useStateSet(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "9px 16px", borderRadius: 10,
        background: hover ? "oklch(0.65 0.18 25 / 0.16)" : "oklch(0.65 0.18 25 / 0.06)",
        border: `1px solid ${hover ? "oklch(0.7 0.18 25 / 0.7)" : "oklch(0.6 0.15 25 / 0.45)"}`,
        color: "oklch(0.82 0.15 25)",
        fontWeight: 700, fontSize: 13, letterSpacing: "0.02em",
        boxShadow: hover ? "0 0 18px oklch(0.65 0.18 25 / 0.35)" : "none",
        transition: "all 160ms ease",
      }}
    >
      {SI.logout} Log out
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   SettingsView — main export
   ───────────────────────────────────────────────────────── */

const SETTINGS_KEY = "checkers.settings";

const DEFAULT_SETTINGS = {
  theme: "wood",
  hints: true,
  smooth: true,
  flip: false,
  trail: true,
  master: 70,
  sfx: 85,
  music: 40,
  moveSfx: true,
  captureSfx: true,
  publicProfile: true,
  emailDigest: false,
};

function loadSavedSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

window.getCheckersSettings = function () {
  return { ...DEFAULT_SETTINGS, ...(loadSavedSettings() || {}) };
};

function SettingsView({ user, profile, onProfileUpdate, onLogout }) {
  const [section, setSection] = useStateSet("visuals");
  const [s, setS] = useStateSet(() => {
    const saved = loadSavedSettings() || {};
    return {
      ...DEFAULT_SETTINGS,
      displayName: user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You",
      email: user?.email || "",
      ...saved,
    };
  });

  useEffectSet(() => {
    const { displayName, email, ...persistable } = s;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(persistable));
      window.dispatchEvent(new CustomEvent("checkers:settings-changed", { detail: persistable }));
    } catch {}
  }, [s]);

  const update = (partial) => setS((prev) => ({ ...prev, ...partial }));

  return (
    <div key="settings" style={{ animation: "fade 320ms ease both" }}>
      {/* Heading */}
      <div className="r-page-head" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12.5, color: "var(--text-mute)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>Customize</div>
          <h2 style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>Settings &amp; preferences</h2>
        </div>
      </div>

      {/* Layout: sub-nav + main panel */}
      <div className="r-settings-grid" style={{
        display: "grid", gridTemplateColumns: "208px 1fr", gap: 22,
        animation: "settingsIn 380ms cubic-bezier(0.22, 0.8, 0.3, 1) both",
      }}>
        <style>{`
          @keyframes settingsIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: none; }
          }
        `}</style>

        {/* Sub-nav */}
        <aside className="r-settings-nav" style={{
          position: "sticky", top: 24, alignSelf: "start",
          background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.55), oklch(0.18 0.012 55 / 0.4))",
          border: "1px solid var(--line-soft)",
          borderRadius: 14, padding: 10,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          boxShadow: "0 8px 22px -14px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}>
          <div style={{
            fontSize: 10.5, color: "var(--text-dim)", letterSpacing: "0.12em",
            padding: "6px 14px 8px", fontWeight: 700, textTransform: "uppercase",
          }}>Categories</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {SECTIONS.map(sec => (
              <SubNavItem
                key={sec.id}
                icon={sec.icon}
                label={sec.label}
                active={section === sec.id}
                onClick={() => setSection(sec.id)}
              />
            ))}
          </nav>
        </aside>

        {/* Panel */}
        <div key={section} style={{ animation: "fade 240ms ease both", minWidth: 0 }}>
          {section === "visuals" && <VisualsPanel s={s} set={update} />}
          {section === "audio"   && <AudioPanel   s={s} set={update} />}
          {section === "account" && <AccountPanel user={user} profile={profile} onProfileUpdate={onProfileUpdate} s={s} set={update} onLogout={onLogout} />}
        </div>
      </div>
    </div>
  );
}

window.SettingsView = SettingsView;
