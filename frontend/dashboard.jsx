// Dashboard page
const { useState: useStateDash, useEffect: useEffectDash } = React;

function Avatar({ name, size = 40, color = "var(--accent)", ring = false }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}, oklch(0.55 0.1 50))`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#14110d", fontWeight: 700, fontSize: size * 0.38,
      flexShrink: 0,
      boxShadow: ring ? "0 0 0 2px var(--bg), 0 0 0 4px var(--accent)" : "none",
    }}>{initials}</div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%",
      padding: "11px 14px", borderRadius: 10, textAlign: "left",
      color: active ? "var(--text)" : "var(--text-mute)",
      background: active ? "var(--bg-elev-3)" : "transparent",
      fontWeight: active ? 600 : 500, fontSize: 14.5,
      transition: "background 120ms ease, color 120ms ease",
      position: "relative",
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--bg-elev-2)"; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", color: active ? "var(--accent)" : "currentColor" }}>{icon}</span>
      {label}
      {active && <span style={{ position: "absolute", left: -16, top: 10, bottom: 10, width: 3, background: "var(--accent)", borderRadius: 2 }} />}
    </button>
  );
}

const I = {
  play: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 5v14l11-7L7 5Z" fill="currentColor"/></svg>,
  history: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/></svg>,
  leader: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M17 4h3v2a3 3 0 0 1-3 3"/><path d="M7 4H4v2a3 3 0 0 0 3 3"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9 1.7 1.7 0 0 0 4.3 7.2l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>,
  bot: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="12" rx="3"/><path d="M12 2v6"/><circle cx="9" cy="14" r="1.2" fill="currentColor"/><circle cx="15" cy="14" r="1.2" fill="currentColor"/><path d="M8 4h8"/></svg>,
  friend: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19a6 6 0 0 1 12 0"/><path d="M14.5 19a4.5 4.5 0 0 1 7-3.7"/></svg>,
  trophy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
};

function ResultPill({ result }) {
  const map = {
    W: { bg: "oklch(0.74 0.13 155 / 0.18)", fg: "oklch(0.82 0.15 155)", label: "Win" },
    L: { bg: "oklch(0.7 0.14 25 / 0.18)", fg: "oklch(0.78 0.14 25)", label: "Loss" },
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

function DashboardPage({ user, onPlay, onLogout }) {
  const [nav, setNav] = useStateDash("Play");
  const [recents, setRecents] = useStateDash([]);
  const [stats, setStats] = useStateDash({ wins: 0, losses: 0, total: 0 });
  const [botModal, setBotModal] = useStateDash(false);
  const [difficulty, setDifficulty] = useStateDash(800);
  const displayName = user?.user_metadata?.full_name || user?.email || "Player";

  useEffectDash(() => {
    if (!user?.id) return;
    fetch(`http://localhost:8000/user/${user.id}/history`)
      .then(res => res.json())
      .then(data => {
        const games = data.games || [];
        const mapped = games.map(g => ({
          opp: g.player2_id ? "vs Friend" : "vs AI",
          oppColor: "oklch(0.7 0.12 280)",
          result: g.winner === "BEIGE" ? "W" : "L",
          moves: g.moves ? g.moves.length : 0,
          when: new Date(g.created_at).toLocaleDateString(),
          mode: g.player2_id ? "vs Friend" : "vs AI",
        }));
        setRecents(mapped);

        const wins = games.filter(g => g.winner === "BEIGE").length;
        const losses = games.length - wins;
        setStats({ wins, losses, total: games.length });
      })
      .catch(() => {});
  }, [user]);

  const winRate = stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) + "%" : "—";
  const rankThresholds = [{ name: "Rookie", min: 0, max: 5 }, { name: "Bronze", min: 5, max: 10 }, { name: "Silver", min: 10, max: 20 }, { name: "Gold", min: 20, max: 20 }];
  const currentRankObj = rankThresholds.slice().reverse().find(r => stats.wins >= r.min) || rankThresholds[0];
  const nextRankObj = rankThresholds[rankThresholds.indexOf(currentRankObj) + 1];
  const rank = currentRankObj.name;
  const progressPct = nextRankObj ? Math.round(((stats.wins - currentRankObj.min) / (nextRankObj.min - currentRankObj.min)) * 100) : 100;

  return (
    <div className="page" data-screen-label="02 Dashboard" style={{
      minHeight: "100vh", display: "grid", gridTemplateColumns: "248px 1fr",
    }}>
      {/* Sidebar */}
      <aside style={{
        background: "var(--bg-elev-1)", borderRight: "1px solid var(--line-soft)",
        padding: "24px 16px", display: "flex", flexDirection: "column", gap: 24,
        position: "sticky", top: 0, height: "100vh",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 6px" }}>
          <Logo size={28} />
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em" }}>Checkers</span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.12em", padding: "4px 14px 6px", fontWeight: 600 }}>MENU</div>
          <NavItem icon={I.play} label="Play" active={nav === "Play"} onClick={() => setNav("Play")} />
          <NavItem icon={I.history} label="History" active={nav === "History"} onClick={() => setNav("History")} />
          <NavItem icon={I.leader} label="Leaderboard" active={nav === "Leaderboard"} onClick={() => setNav("Leaderboard")} />
          <NavItem icon={I.settings} label="Settings" active={nav === "Settings"} onClick={() => setNav("Settings")} />
        </nav>

        <div style={{ marginTop: "auto", padding: 14, background: "var(--bg-elev-2)", borderRadius: 12, border: "1px solid var(--line-soft)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name={displayName} size={36} color="oklch(0.7 0.1 65)" />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-dim)", fontFamily: "var(--mono)" }}>{user?.email || ""}</div>
            </div>
            <button onClick={onLogout} title="Sign out" style={{ color: "var(--text-dim)", padding: 4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ padding: "32px 40px 56px", maxWidth: 1100, width: "100%" }}>
        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar name={displayName} size={56} color="oklch(0.7 0.1 65)" ring />
            <div>
              <div style={{ fontSize: 13, color: "var(--text-mute)", marginBottom: 4 }}>Welcome back</div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>{displayName}</h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-elev-1)", border: "1px solid var(--line-soft)", padding: "9px 14px", borderRadius: 10, color: "var(--text-mute)", fontSize: 13 }}>
            {I.search}
            <span>Find a player or game…</span>
            <kbd style={{ marginLeft: 12, fontFamily: "var(--mono)", fontSize: 11, padding: "2px 6px", border: "1px solid var(--line)", borderRadius: 4, color: "var(--text-dim)" }}>⌘K</kbd>
          </div>
        </header>

        {/* Play cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 36 }}>
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
            sub="Local hotseat — pass the device. Online multiplayer coming soon."
            cta="Start game"
            icon={I.friend}
            tone="cool"
          />
        </div>

        {/* Recent + Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
          {/* Recent games */}
          <section style={{ background: "var(--bg-elev-1)", border: "1px solid var(--line-soft)", borderRadius: 16, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "0.02em" }}>Recent games</h2>
              <button style={{ color: "var(--text-mute)", fontSize: 12.5, fontWeight: 500 }}>View all →</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {recents.map((g, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "auto 1fr auto auto auto",
                  alignItems: "center", gap: 14, padding: "12px 6px",
                  borderTop: i === 0 ? "none" : "1px solid var(--line-soft)",
                }}>
                  <Avatar name={g.opp} size={32} color={g.oppColor} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{g.opp}</div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{g.mode}</div>
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--text-mute)" }}>{g.moves} moves</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-dim)", minWidth: 80, textAlign: "right" }}>{g.when}</div>
                  <ResultPill result={g.result} />
                </div>
              ))}
            </div>
          </section>

          {/* Stats */}
          <section style={{ background: "var(--bg-elev-1)", border: "1px solid var(--line-soft)", borderRadius: 16, padding: 22, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Rank & stats</h2>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--text-dim)" }}>SEASON 3</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0 18px", borderBottom: "1px solid var(--line-soft)" }}>
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: "linear-gradient(135deg, oklch(0.7 0.1 65), oklch(0.62 0.13 50))",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#1a1a2e",
              }}>{I.trophy}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--text-mute)" }}>Current rank</div>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>{rank}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 600, color: "var(--accent)" }}>{stats.total} games</div>
                <div style={{ fontSize: 11.5, color: "var(--text-dim)" }}>{stats.wins} wins</div>
              </div>
            </div>

            {/* progress to next */}
            <div style={{ paddingTop: 14, paddingBottom: 18, borderBottom: "1px solid var(--line-soft)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-mute)", marginBottom: 6 }}>
                <span>{nextRankObj ? `To ${nextRankObj.name}` : "Max rank"}</span>
                <span style={{ fontFamily: "var(--mono)" }}>{stats.wins} / {nextRankObj ? nextRankObj.min : stats.wins}</span>
              </div>
              <div style={{ height: 6, background: "var(--bg-elev-3)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${progressPct}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), oklch(0.72 0.12 50))", borderRadius: 999 }} />
              </div>
            </div>

            {/* numbers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", paddingTop: 16, gap: 8 }}>
              <Stat label="Wins" value={stats.wins} />
              <Stat label="Losses" value={stats.losses} />
              <Stat label="Win rate" value={winRate} accent />
            </div>
          </section>
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
    </div>
  );
}

const PRESETS = [
  { name: "Beginner", value: 250 },
  { name: "Casual", value: 800 },
  { name: "Intermediate", value: 1250 },
  { name: "Expert", value: 1650 },
  { name: "Master", value: 2000 },
];

function ratingLabel(v) {
  if (v < 500) return "Beginner";
  if (v < 1000) return "Casual";
  if (v < 1500) return "Intermediate";
  if (v < 1800) return "Expert";
  return "Master";
}

function DifficultyModal({ difficulty, onChange, onClose, onStart }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(10,8,6,0.7)",
      backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 50,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--bg-elev-1)", border: "1px solid var(--line)",
        borderRadius: 18, padding: 28, width: 460,
        boxShadow: "0 40px 80px -20px rgba(0,0,0,0.7)",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>Choose difficulty</h3>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-dim)", letterSpacing: "0.08em" }}>VS BOT</span>
        </div>
        <p style={{ margin: "0 0 22px", fontSize: 13, color: "var(--text-mute)" }}>
          Pick a preset or scrub the slider to fine-tune the bot's rating.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
          {PRESETS.map(p => {
            const active = difficulty === p.value;
            return (
              <button key={p.name} onClick={() => onChange(p.value)} style={{
                padding: "7px 12px", borderRadius: 999,
                background: active ? "var(--accent-soft)" : "var(--bg-elev-2)",
                border: `1px solid ${active ? "var(--accent)" : "var(--line-soft)"}`,
                color: active ? "var(--accent)" : "var(--text-mute)",
                fontSize: 12.5, fontWeight: 600, letterSpacing: "-0.005em",
                transition: "all 120ms ease",
              }}>{p.name}</button>
            );
          })}
        </div>

        <div style={{
          background: "var(--bg-elev-2)", border: "1px solid var(--line-soft)",
          borderRadius: 12, padding: "16px 18px", marginBottom: 22,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11.5, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Rating</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>{difficulty}</span>
              <span style={{ fontSize: 12, color: "var(--text-mute)" }}>· {ratingLabel(difficulty)}</span>
            </div>
          </div>
          <input
            type="range" min="0" max="2000" step="50" value={difficulty}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            style={{
              width: "100%", accentColor: "oklch(0.7 0.1 65)",
              cursor: "pointer",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--text-dim)", marginTop: 4 }}>
            <span>0</span><span>500</span><span>1000</span><span>1500</span><span>2000</span>
          </div>
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

function PlayCard({ title, sub, cta, icon, tone, onClick }) {
  const [hover, setHover] = useStateDash(false);
  const accentBg = tone === "warm"
    ? "radial-gradient(120% 80% at 0% 0%, oklch(0.7 0.1 65 / 0.18), transparent 60%)"
    : "radial-gradient(120% 80% at 100% 0%, oklch(0.7 0.1 230 / 0.18), transparent 60%)";
  const iconBg = tone === "warm" ? "oklch(0.7 0.1 65 / 0.18)" : "oklch(0.7 0.1 230 / 0.18)";
  const iconFg = tone === "warm" ? "var(--accent)" : "oklch(0.82 0.1 230)";
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative", textAlign: "left",
        background: "var(--bg-elev-1)", border: "1px solid var(--line-soft)",
        borderRadius: 16, padding: 22, overflow: "hidden",
        transition: "transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
        transform: hover ? "translateY(-2px)" : "none",
        borderColor: hover ? "var(--line)" : "var(--line-soft)",
        boxShadow: hover ? "0 12px 30px -10px rgba(0,0,0,0.5)" : "none",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: accentBg, pointerEvents: "none" }} />
      <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: iconBg, color: iconFg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{icon}</div>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: hover ? "var(--accent)" : "var(--bg-elev-3)",
          color: hover ? "#14110d" : "var(--text-mute)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 200ms ease",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13.5, color: "var(--text-mute)", lineHeight: 1.5, marginBottom: 14, maxWidth: 320 }}>{sub}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: hover ? "var(--accent)" : "var(--text)", transition: "color 200ms ease" }}>{cta} →</div>
      </div>
    </button>
  );
}

window.DashboardPage = DashboardPage;
window.Avatar = Avatar;
