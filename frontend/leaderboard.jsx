// Leaderboard view — renders inside the dashboard frame when
// the "Leaderboard" sidebar tab is active. Reuses Avatar from dashboard.jsx.
const { useState: useStateLb, useMemo: useMemoLb, useRef: useRefLb, useEffect: useEffectLb } = React;

function tierFromScore(score) {
  if (score >= 2400) return "Master";
  if (score >= 2000) return "Diamond";
  if (score >= 1600) return "Platinum";
  if (score >= 1200) return "Gold";
  if (score >= 800)  return "Silver";
  return "Bronze";
}

/* ─────────────────────────────────────────────────────────
   Mock data
   ───────────────────────────────────────────────────────── */

const TIERS = {
  Master:   { fg: "oklch(0.78 0.13 305)", bg: "oklch(0.78 0.13 305 / 0.14)", ring: "oklch(0.78 0.13 305 / 0.45)" },
  Diamond:  { fg: "oklch(0.82 0.1 210)",  bg: "oklch(0.82 0.1 210 / 0.14)",  ring: "oklch(0.82 0.1 210 / 0.45)"  },
  Platinum: { fg: "oklch(0.82 0.08 180)", bg: "oklch(0.82 0.08 180 / 0.14)", ring: "oklch(0.82 0.08 180 / 0.4)"  },
  Gold:     { fg: "oklch(0.84 0.13 80)",  bg: "oklch(0.84 0.13 80 / 0.14)",  ring: "oklch(0.84 0.13 80 / 0.45)"  },
  Silver:   { fg: "oklch(0.85 0.02 250)", bg: "oklch(0.85 0.02 250 / 0.1)",  ring: "oklch(0.85 0.02 250 / 0.35)" },
  Bronze:   { fg: "oklch(0.74 0.1 50)",   bg: "oklch(0.74 0.1 50 / 0.14)",   bring: "oklch(0.74 0.1 50 / 0.45)"  },
};

const PLAYERS = [
  { id: 1,  name: "Kestrel",     tier: "Master",   wins: 412, rate: 78, score: 2840 },
  { id: 2,  name: "Volkov",      tier: "Master",   wins: 388, rate: 74, score: 2715 },
  { id: 3,  name: "Aria",        tier: "Master",   wins: 360, rate: 71, score: 2602 },
  { id: 4,  name: "Mendoza",     tier: "Master",   wins: 341, rate: 69, score: 2510 },
  { id: 5,  name: "Noor",        tier: "Diamond",  wins: 318, rate: 68, score: 2434 },
  { id: 6,  name: "Hideo",       tier: "Diamond",  wins: 302, rate: 67, score: 2381 },
  { id: 7,  name: "Tariq",       tier: "Diamond",  wins: 289, rate: 66, score: 2320 },
  { id: 8,  name: "Lumen",       tier: "Diamond",  wins: 276, rate: 64, score: 2266 },
  { id: 9,  name: "Vega",        tier: "Diamond",  wins: 264, rate: 63, score: 2210 },
  { id: 10, name: "Echo",        tier: "Platinum", wins: 248, rate: 62, score: 2148 },
  { id: 11, name: "Sable",       tier: "Platinum", wins: 233, rate: 61, score: 2090 },
  { id: 12, name: "Rune",        tier: "Platinum", wins: 219, rate: 60, score: 2042 },
  { id: 13, name: "Pax",         tier: "Platinum", wins: 207, rate: 59, score: 1988 },
  { id: 14, name: "Indigo",      tier: "Platinum", wins: 196, rate: 58, score: 1930 },
  { id: 15, name: "Otso",        tier: "Gold",     wins: 184, rate: 57, score: 1874 },
  { id: 16, name: "Lyra",        tier: "Gold",     wins: 172, rate: 56, score: 1820 },
  { id: 17, name: "Nyx",         tier: "Gold",     wins: 161, rate: 55, score: 1768 },
  { id: 18, name: "Zaire",       tier: "Gold",     wins: 150, rate: 54, score: 1712 },
  { id: 19, name: "Pixel",       tier: "Gold",     wins: 142, rate: 53, score: 1660 },
  { id: 20, name: "Quill",       tier: "Gold",     wins: 134, rate: 53, score: 1612 },
  { id: 21, name: "Birch",       tier: "Gold",     wins: 126, rate: 52, score: 1565 },
  { id: 22, name: "Onyx",        tier: "Silver",   wins: 118, rate: 51, score: 1518 },
  { id: 23, name: "Mira",        tier: "Silver",   wins: 110, rate: 50, score: 1472 },
  { id: 24, name: "Hex",         tier: "Silver",   wins: 102, rate: 49, score: 1428 },
];

const AVATAR_HUES = [65, 28, 280, 200, 155, 320, 50, 250];

function hueFor(id) { return AVATAR_HUES[id % AVATAR_HUES.length]; }
function colorFor(id) { return `oklch(0.7 0.12 ${hueFor(id)})`; }

/* ─────────────────────────────────────────────────────────
   Podium tile (rank 1 / 2 / 3)
   ───────────────────────────────────────────────────────── */

function Crown() {
  return (
    <svg width="22" height="18" viewBox="0 0 28 22" fill="none" style={{ display: "block" }}>
      <path d="M2 6 L8 13 L14 3 L20 13 L26 6 L23 19 L5 19 Z"
        fill="oklch(0.86 0.13 80)" stroke="oklch(0.6 0.13 60)" strokeWidth="1" strokeLinejoin="round"/>
      <circle cx="2" cy="6" r="1.6" fill="oklch(0.86 0.13 80)"/>
      <circle cx="14" cy="3" r="1.8" fill="oklch(0.9 0.14 85)"/>
      <circle cx="26" cy="6" r="1.6" fill="oklch(0.86 0.13 80)"/>
    </svg>
  );
}

function PodiumAvatar({ name, rank, id }) {
  // Rank-themed colors
  const themes = {
    1: { ring: "oklch(0.86 0.13 80)",   halo: "oklch(0.86 0.13 80 / 0.6)",  size: 92, inner: 84 },
    2: { ring: "oklch(0.82 0.015 250)", halo: "oklch(0.82 0.015 250 / 0.4)", size: 72, inner: 64 },
    3: { ring: "oklch(0.7 0.11 45)",    halo: "oklch(0.7 0.11 45 / 0.45)",  size: 72, inner: 64 },
  };
  const t = themes[rank];
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{ position: "relative", width: t.size, height: t.size, marginBottom: 12 }}>
      {/* halo */}
      <div aria-hidden style={{
        position: "absolute", inset: rank === 1 ? -22 : -14,
        background: `radial-gradient(circle, ${t.halo}, transparent 70%)`,
        filter: "blur(8px)", pointerEvents: "none",
      }}/>
      {/* outer ring */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        border: `2px solid ${t.ring}`,
        boxShadow: rank === 1
          ? `0 0 22px oklch(0.86 0.13 80 / 0.7), inset 0 0 8px oklch(0.86 0.13 80 / 0.25)`
          : `0 0 10px ${t.halo}`,
      }}/>
      {/* inner avatar */}
      <div style={{
        position: "absolute", top: (t.size - t.inner)/2, left: (t.size - t.inner)/2,
        width: t.inner, height: t.inner, borderRadius: "50%",
        background: `linear-gradient(135deg, ${colorFor(id)}, oklch(0.5 0.08 ${hueFor(id)}))`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#14110d", fontWeight: 700, fontSize: t.inner * 0.36,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
      }}>{initials}</div>
      {/* crown for rank 1 */}
      {rank === 1 && (
        <div style={{
          position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)",
          filter: "drop-shadow(0 0 6px oklch(0.86 0.13 80 / 0.7))",
        }}><Crown/></div>
      )}
      {/* rank chip on bottom */}
      <div style={{
        position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
        width: 24, height: 24, borderRadius: "50%",
        background: rank === 1 ? t.ring : "var(--bg-elev-2)",
        color: rank === 1 ? "#1a1208" : t.ring,
        border: `1px solid ${t.ring}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 800, fontFamily: "var(--mono)",
        boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
      }}>{rank}</div>
    </div>
  );
}

function PodiumTile({ player, rank, height, delay }) {
  const theme = rank === 1
    ? { ringHue: 80, accent: "oklch(0.86 0.13 80)", label: "Champion" }
    : rank === 2
    ? { ringHue: 250, accent: "oklch(0.82 0.015 250)", label: "Runner-up" }
    : { ringHue: 45, accent: "oklch(0.74 0.1 45)", label: "Third place" };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      animation: `lbRise 480ms ${delay}ms cubic-bezier(0.22, 0.8, 0.3, 1) both`,
    }}>
      <PodiumAvatar name={player.name} rank={rank} id={player.id} />
      <div style={{ fontSize: rank === 1 ? 17 : 15, fontWeight: 700, letterSpacing: "-0.01em" }}>{player.name}</div>
      <div style={{
        marginTop: 3, fontFamily: "var(--mono)", fontSize: 12,
        color: theme.accent, fontWeight: 600,
      }}>{player.score.toLocaleString()} RP</div>
      <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginTop: 4 }}>
        {theme.label}
      </div>

      {/* Pedestal */}
      <div style={{
        position: "relative",
        marginTop: 14, width: "100%", height,
        background: "linear-gradient(180deg, var(--bg-elev-2), var(--bg-elev-1))",
        borderTop: `2px solid ${theme.accent}`,
        borderLeft: "1px solid var(--line-soft)",
        borderRight: "1px solid var(--line-soft)",
        borderRadius: "10px 10px 0 0",
        overflow: "hidden",
        boxShadow: `0 -1px 0 ${theme.accent} inset, 0 14px 30px -20px rgba(0,0,0,0.6)`,
      }}>
        {/* halo behind pedestal */}
        <div aria-hidden style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(80% 100% at 50% 0%, oklch(0.7 0.1 ${theme.ringHue} / 0.18), transparent 65%)`,
          pointerEvents: "none",
        }}/>
        {/* rank numeral */}
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--mono)", fontSize: rank === 1 ? 64 : 52, fontWeight: 800,
          color: "transparent",
          WebkitTextStroke: `1px ${theme.accent}`,
          opacity: 0.32, letterSpacing: "-0.04em",
        }}>{rank}</div>
      </div>
    </div>
  );
}

function Podium({ players }) {
  // players is array of length 3, sorted by rank (1, 2, 3)
  const [p1, p2, p3] = players;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
      alignItems: "end", gap: 18,
      padding: "8px 24px 0",
    }}>
      <PodiumTile player={p2} rank={2} height={108} delay={60}/>
      <PodiumTile player={p1} rank={1} height={148} delay={0}/>
      <PodiumTile player={p3} rank={3} height={90}  delay={120}/>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Standings rows
   ───────────────────────────────────────────────────────── */

function TierBadge({ tier }) {
  const t = TIERS[tier] || TIERS.Silver;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 10px",
      borderRadius: 999, background: t.bg, color: t.fg,
      boxShadow: `inset 0 0 0 1px ${t.ring}`,
      fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em",
      fontFamily: "var(--mono)", textTransform: "uppercase",
    }}>{tier}</span>
  );
}

const ROW_COLS = "44px minmax(0,1.5fr) 84px 64px 64px 80px";

function StandingsRow({ rank, player, highlight = false, pinned = false }) {
  const [hover, setHover] = useStateLb(false);
  const accent = pinned ? "oklch(0.7 0.1 65)" : null;
  return (
    <div
      className="r-standings-row"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: ROW_COLS,
        alignItems: "center", gap: 14,
        padding: "12px 16px",
        borderBottom: pinned ? "none" : "1px solid var(--line-soft)",
        background: pinned
          ? "linear-gradient(180deg, oklch(0.7 0.1 65 / 0.08), oklch(0.7 0.1 65 / 0.14))"
          : (hover ? "oklch(0.7 0.1 65 / 0.05)" : "transparent"),
        transform: hover && !pinned ? "scale(1.005)" : "none",
        transformOrigin: "left center",
        transition: "background 160ms ease, transform 180ms ease",
        boxShadow: pinned
          ? "inset 0 0 0 1px oklch(0.7 0.1 65 / 0.5), 0 -8px 18px -10px oklch(0.7 0.1 65 / 0.35)"
          : "none",
      }}
    >
      {pinned && (
        <span aria-hidden style={{
          position: "absolute", left: 0, top: 6, bottom: 6, width: 2,
          background: accent, borderRadius: 2,
          boxShadow: "0 0 12px oklch(0.7 0.1 65 / 0.7)",
        }}/>
      )}
      {/* rank */}
      <div style={{
        fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700,
        color: pinned ? "var(--accent)" : "var(--text-mute)",
        textAlign: "right",
      }}>
        {pinned ? <span style={{ fontSize: 11, marginRight: 2, color: "var(--text-dim)" }}>#</span> : null}
        {rank}
      </div>

      {/* avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <Avatar name={player.name} size={32} color={colorFor(player.id)} />
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 13.5, fontWeight: 600,
            color: pinned ? "var(--text)" : "var(--text)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {player.name}
            {pinned && <span style={{
              marginLeft: 8, fontSize: 10, fontWeight: 700, fontFamily: "var(--mono)",
              padding: "2px 6px", borderRadius: 4,
              background: "oklch(0.7 0.1 65 / 0.18)", color: "var(--accent)",
              boxShadow: "inset 0 0 0 1px oklch(0.7 0.1 65 / 0.45)",
              letterSpacing: "0.06em",
            }}>YOU</span>}
          </div>
          {pinned && (
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 1, fontFamily: "var(--mono)" }}>
              your position
            </div>
          )}
        </div>
      </div>

      {/* tier */}
      <TierBadge tier={player.tier} />

      {/* wins */}
      <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text)", textAlign: "right" }}>
        {player.wins}
      </div>

      {/* win rate */}
      <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text-mute)", textAlign: "right" }}>
        {player.rate}%
      </div>

      {/* score */}
      <div style={{
        fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700,
        color: pinned ? "var(--accent)" : "var(--text)",
        textAlign: "right",
      }}>
        {player.score.toLocaleString()}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   LeaderboardView — main export
   ───────────────────────────────────────────────────────── */

function LeaderboardView({ user }) {
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You";
  const userRegion = user?.user_metadata?.region || null;
  const [tab, setTab] = useStateLb("Global");
  const [players, setPlayers] = useStateLb(null); // null = loading, [] = empty
  const [regionPlayers, setRegionPlayers] = useStateLb(null);
  const [meRank, setMeRank] = useStateLb(null);
  const [meRegionRank, setMeRegionRank] = useStateLb(null);

  function mapEntries(raw) {
    return raw.map((p, i) => {
      const isMe = user?.id && p.player_id === user.id;
      return {
        id: p.player_id,
        name: isMe ? displayName : `Player ${String(p.player_id).slice(0, 6)}`,
        isMe,
        tier: tierFromScore(p.score),
        wins: p.wins,
        rate: p.rate,
        score: p.score,
        rank: i + 1,
      };
    });
  }

  useEffectLb(() => {
    fetch("http://localhost:8000/leaderboard")
      .then(res => res.json())
      .then(data => {
        const mapped = mapEntries(data.players || []);
        setPlayers(mapped);
        const idx = mapped.findIndex(p => p.isMe);
        setMeRank(idx >= 0 ? idx + 1 : null);
        window.LEADERBOARD_PLAYERS = mapped;
      })
      .catch(() => {
        setPlayers([]);
        window.LEADERBOARD_PLAYERS = [];
      });
  }, [user]);

  useEffectLb(() => {
    if (tab !== "Regional" || !userRegion) return;
    setRegionPlayers(null);
    fetch(`http://localhost:8000/leaderboard?region=${encodeURIComponent(userRegion)}`)
      .then(res => res.json())
      .then(data => {
        const mapped = mapEntries(data.players || []);
        setRegionPlayers(mapped);
        const idx = mapped.findIndex(p => p.isMe);
        setMeRegionRank(idx >= 0 ? idx + 1 : null);
      })
      .catch(() => setRegionPlayers([]));
  }, [tab, userRegion, user]);

  const regionName = (window.CHECKERS_REGIONS || []).find(r => r.code === userRegion)?.name || userRegion;

  const top3 = (players || []).slice(0, 3);
  const rest = (players || []).slice(3);
  const me = players?.find(p => p.isMe);

  return (
    <div key="leaderboard" style={{ animation: "fade 320ms ease both" }}>
      {/* injected keyframes for staggered rise */}
      <style>{`
        @keyframes lbRise {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes lbListIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>

      {/* Heading */}
      <div className="r-page-head" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12.5, color: "var(--text-mute)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>Season 3</div>
          <h2 style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>Leaderboard &amp; rankings</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: 3, background: "var(--bg-elev-1)", border: "1px solid var(--line-soft)", borderRadius: 8 }}>
          {["Global", "Friends", "Regional"].map((f) => {
            const active = tab === f;
            return (
              <button key={f} onClick={() => setTab(f)} style={{
                padding: "6px 11px", borderRadius: 6,
                background: active ? "oklch(0.7 0.1 65 / 0.16)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-mute)",
                fontSize: 12, fontWeight: 600,
                boxShadow: active ? "inset 0 0 0 1px oklch(0.7 0.1 65 / 0.45)" : "none",
                transition: "all 140ms ease", cursor: "pointer",
              }}>{f}</button>
            );
          })}
        </div>
      </div>

      {tab === "Global" && players === null && (
        <EmptyLeaderboard title="Loading rankings…" message="Fetching the latest standings." />
      )}

      {tab === "Global" && players && players.length === 0 && (
        <EmptyLeaderboard
          title="No rankings yet"
          message="Play a few games to start the season — the first standings will appear here once games are recorded."
        />
      )}

      {tab === "Friends" && (
        <EmptyLeaderboard
          title="No friends yet"
          message="The friend system is on the way. Once it's live, you'll be able to track rankings among players you've added."
        />
      )}

      {tab === "Regional" && !userRegion && (
        <EmptyLeaderboard
          title="Pick your region first"
          message="Open Settings → Account and choose a region to see how you stack up against players in your area."
        />
      )}

      {tab === "Regional" && userRegion && regionPlayers === null && (
        <EmptyLeaderboard title={`Loading ${regionName} rankings…`} message="Crunching numbers for your region." />
      )}

      {tab === "Regional" && userRegion && regionPlayers && regionPlayers.length === 0 && (
        <EmptyLeaderboard
          title={`No ${regionName} rankings yet`}
          message="Be the first — finish a game and your region's leaderboard starts with you."
        />
      )}

      {tab === "Regional" && userRegion && regionPlayers && regionPlayers.length > 0 && (
        <RegionalRanks
          regionName={regionName}
          top3={regionPlayers.slice(0, 3)}
          rest={regionPlayers.slice(3)}
          me={regionPlayers.find(p => p.isMe)}
          meRank={meRegionRank}
        />
      )}

      {tab === "Global" && players && players.length > 0 && (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <section style={{
              position: "relative",
              background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.55), oklch(0.18 0.012 55 / 0.4))",
              border: "1px solid var(--line-soft)",
              borderRadius: 16,
              padding: "26px 22px 0",
              marginBottom: 22,
              overflow: "hidden",
              boxShadow: "0 12px 28px -16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}>
              <div aria-hidden style={{
                position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
                width: 360, height: 240,
                background: "radial-gradient(50% 60% at 50% 50%, oklch(0.86 0.13 80 / 0.22), transparent 70%)",
                filter: "blur(12px)", pointerEvents: "none",
              }}/>
              <div style={{ position: "relative" }}>
                <Podium players={padPodium(top3)} />
              </div>
            </section>
          )}

          {/* Standings */}
          <section style={{
            position: "relative",
            background: "linear-gradient(180deg, var(--bg-elev-2), var(--bg-elev-1))",
            border: "1px solid var(--line-soft)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 10px 26px -16px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}>
            <div className="r-standings-head" style={{
              display: "grid",
              gridTemplateColumns: ROW_COLS,
              alignItems: "center", gap: 14,
              padding: "13px 16px",
              borderBottom: "1px solid var(--line-soft)",
              background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.5), transparent)",
              fontSize: 10.5, color: "var(--text-dim)", letterSpacing: "0.1em",
              textTransform: "uppercase", fontWeight: 700,
            }}>
              <span style={{ textAlign: "right" }}>Rank</span>
              <span>Player</span>
              <span>Tier</span>
              <span style={{ textAlign: "right" }}>Wins</span>
              <span style={{ textAlign: "right" }}>Win rate</span>
              <span style={{ textAlign: "right" }}>Score</span>
            </div>

            <div style={{
              maxHeight: 360, overflowY: "auto",
              animation: "lbListIn 380ms 180ms cubic-bezier(0.22, 0.8, 0.3, 1) both",
              scrollbarWidth: "thin",
              scrollbarColor: "var(--line) transparent",
            }}>
              {rest.map((p, i) => (
                <StandingsRow key={p.id} rank={i + 4} player={p} />
              ))}
              {rest.length === 0 && (
                <div style={{ padding: "20px 16px", color: "var(--text-dim)", fontSize: 13, textAlign: "center" }}>
                  Top 3 are the entire ladder right now — invite a friend to climb higher.
                </div>
              )}
            </div>

            {me && meRank && meRank > 3 && (
              <div style={{ position: "relative" }}>
                <div aria-hidden style={{
                  position: "absolute", left: 0, right: 0, top: -24, height: 24,
                  background: "linear-gradient(180deg, transparent, var(--bg-elev-1))",
                  pointerEvents: "none",
                }}/>
                <StandingsRow rank={meRank} player={me} pinned />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function padPodium(top) {
  const placeholder = (rank) => ({ id: `placeholder-${rank}`, name: "—", tier: "Bronze", wins: 0, rate: 0, score: 0 });
  const arr = [...top];
  while (arr.length < 3) arr.push(placeholder(arr.length + 1));
  return arr;
}

function RegionalRanks({ regionName, top3, rest, me, meRank }) {
  return (
    <>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "6px 12px", borderRadius: 999,
        background: "oklch(0.7 0.1 65 / 0.12)",
        border: "1px solid oklch(0.7 0.1 65 / 0.4)",
        color: "var(--accent)", fontSize: 12, fontWeight: 700,
        letterSpacing: "0.06em", textTransform: "uppercase",
        fontFamily: "var(--mono)", marginBottom: 16,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>
        {regionName}
      </div>

      {top3.length > 0 && (
        <section style={{
          position: "relative",
          background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.55), oklch(0.18 0.012 55 / 0.4))",
          border: "1px solid var(--line-soft)",
          borderRadius: 16,
          padding: "26px 22px 0",
          marginBottom: 22,
          overflow: "hidden",
          boxShadow: "0 12px 28px -16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}>
          <div aria-hidden style={{
            position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
            width: 360, height: 240,
            background: "radial-gradient(50% 60% at 50% 50%, oklch(0.86 0.13 80 / 0.22), transparent 70%)",
            filter: "blur(12px)", pointerEvents: "none",
          }}/>
          <div style={{ position: "relative" }}>
            <Podium players={padPodium(top3)} />
          </div>
        </section>
      )}

      <section style={{
        position: "relative",
        background: "linear-gradient(180deg, var(--bg-elev-2), var(--bg-elev-1))",
        border: "1px solid var(--line-soft)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 10px 26px -16px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}>
        <div className="r-standings-head" style={{
          display: "grid",
          gridTemplateColumns: ROW_COLS,
          alignItems: "center", gap: 14,
          padding: "13px 16px",
          borderBottom: "1px solid var(--line-soft)",
          background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.5), transparent)",
          fontSize: 10.5, color: "var(--text-dim)", letterSpacing: "0.1em",
          textTransform: "uppercase", fontWeight: 700,
        }}>
          <span style={{ textAlign: "right" }}>Rank</span>
          <span>Player</span>
          <span>Tier</span>
          <span style={{ textAlign: "right" }}>Wins</span>
          <span style={{ textAlign: "right" }}>Win rate</span>
          <span style={{ textAlign: "right" }}>Score</span>
        </div>
        <div style={{
          maxHeight: 360, overflowY: "auto",
          animation: "lbListIn 380ms 180ms cubic-bezier(0.22, 0.8, 0.3, 1) both",
          scrollbarWidth: "thin", scrollbarColor: "var(--line) transparent",
        }}>
          {rest.map((p, i) => (
            <StandingsRow key={p.id} rank={i + 4} player={p} />
          ))}
          {rest.length === 0 && (
            <div style={{ padding: "20px 16px", color: "var(--text-dim)", fontSize: 13, textAlign: "center" }}>
              Top 3 are the entire ladder right now — invite a friend in your region.
            </div>
          )}
        </div>
        {me && meRank && meRank > 3 && (
          <div style={{ position: "relative" }}>
            <div aria-hidden style={{
              position: "absolute", left: 0, right: 0, top: -24, height: 24,
              background: "linear-gradient(180deg, transparent, var(--bg-elev-1))",
              pointerEvents: "none",
            }}/>
            <StandingsRow rank={meRank} player={me} pinned />
          </div>
        )}
      </section>
    </>
  );
}

function EmptyLeaderboard({ title, message }) {
  return (
    <section style={{
      position: "relative",
      background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.55), oklch(0.18 0.012 55 / 0.4))",
      border: "1px solid var(--line-soft)",
      borderRadius: 16,
      padding: "60px 28px",
      textAlign: "center",
      boxShadow: "0 10px 26px -16px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      overflow: "hidden",
    }}>
      <div aria-hidden style={{
        position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)",
        width: 280, height: 180,
        background: "radial-gradient(50% 60% at 50% 50%, oklch(0.7 0.1 65 / 0.15), transparent 70%)",
        filter: "blur(14px)", pointerEvents: "none",
      }}/>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "var(--bg-elev-2)", border: "1px solid var(--line-soft)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--accent)", marginBottom: 6,
          boxShadow: "0 0 22px oklch(0.7 0.1 65 / 0.25)",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/></svg>
        </div>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-mute)", maxWidth: 380, lineHeight: 1.55 }}>{message}</p>
      </div>
    </section>
  );
}

window.LeaderboardView = LeaderboardView;
