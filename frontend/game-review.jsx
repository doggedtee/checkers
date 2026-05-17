// Game Review — post-game AI Coach panel.
// 40% static final board on the left, 60% chat panel on the right.
// Matches the project's obsidian + amber system. No Tailwind anywhere —
// inline-style React like the rest of the codebase.

const { useState: useStateGR, useEffect: useEffectGR, useRef: useRefGR, useMemo: useMemoGR } = React;

/* ─────────────────────────────────────────────────────────
   Icons (kept inline so this file is standalone)
   ───────────────────────────────────────────────────────── */
const GRI = {
  send: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>,
  spark: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3"/><path d="M12 18v3"/><path d="M3 12h3"/><path d="M18 12h3"/><path d="m5.6 5.6 2.1 2.1"/><path d="m16.3 16.3 2.1 2.1"/><path d="m5.6 18.4 2.1-2.1"/><path d="m16.3 7.7 2.1-2.1"/></svg>,
  bot:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="12" rx="3"/><path d="M12 2v6"/><circle cx="9" cy="14" r="1.2" fill="currentColor"/><circle cx="15" cy="14" r="1.2" fill="currentColor"/></svg>,
  close: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12"/><path d="M18 6 6 18"/></svg>,
  flag:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4"/><path d="M4 4h13l-2 5 2 5H4"/></svg>,
  target:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>,
  clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  cap:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="5"/><circle cx="15" cy="15" r="5"/></svg>,
  rating:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="m5 10 7-7 7 7"/></svg>,
};

/* ─────────────────────────────────────────────────────────
   Mock data (the host page would normally pass this in)
   ───────────────────────────────────────────────────────── */

// 0 empty · 1 player · 2 opp · 3 player king · 4 opp king
const FINAL_BOARD = [
  [0, 0, 0, 0, 0, 2, 0, 0],
  [0, 0, 2, 0, 0, 0, 0, 0],
  [0, 0, 0, 4, 0, 0, 0, 2],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 2, 0, 0],
  [0, 0, 0, 0, 3, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0],
];

// last move trail (highlight final winning capture for narrative)
const LAST_MOVE_TRAIL = [
  { r: 1, c: 4 },  // from
  { r: 2, c: 3 },  // to (the king landing square)
];

const MATCH = {
  player:   { name: "Gogo",  rating: 842,  color: "oklch(0.78 0.12 65)" },
  opponent: { name: "Bot difficulty level", rating: 1100, color: "oklch(0.45 0.13 25)" },
  accuracy: 73,
  captured: 4,           // pieces YOU captured
  lost:     6,           // pieces YOU lost
  duration: "12:34",
  moves:    24,
  result:   "loss",      // win | loss | draw
  ratingDelta: -14,
  blunderMove: 18,
};

const PROMPT_CHIPS = [
  { id: "blunder", icon: GRI.flag,   label: "Where did I blunder?" },
  { id: "opening", icon: GRI.spark,  label: "Show me a better opening" },
  { id: "counter", icon: GRI.target, label: "How do I counter this strategy?" },
  { id: "drill",   icon: GRI.rating, label: "Drill me on endgame kings" },
];

/* ─────────────────────────────────────────────────────────
   Static piece — same look as game.jsx Piece but no
   interactivity. Smaller stroke shadows so it scales.
   ───────────────────────────────────────────────────────── */
function StaticPiece({ kind, dim }) {
  const isPlayer = kind === 1 || kind === 3;
  const isKing = kind === 3 || kind === 4;
  const base = isPlayer
    ? { fill: "radial-gradient(circle at 35% 30%, #f7eccd 0%, #d9c290 45%, #9a7a45 100%)", ring: "#6e5526", dot: "#4d3a18", inner: "#a07c44", crown: "#5a4520" }
    : { fill: "radial-gradient(circle at 35% 30%, #8a2c26 0%, #5a1a16 50%, #2a0c0a 100%)", ring: "#1a0807", dot: "#1a0807", inner: "#3a1311", crown: "#1a0807" };
  return (
    <div style={{
      width: "78%", aspectRatio: "1 / 1", borderRadius: "50%",
      background: base.fill,
      boxShadow: `inset 0 -3px 0 ${base.ring}, inset 0 2px 1px rgba(255,255,255,0.18), 0 3px 8px rgba(0,0,0,0.55)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative",
      opacity: dim ? 0.85 : 1,
    }}>
      <div style={{
        width: "64%", aspectRatio: "1 / 1", borderRadius: "50%",
        border: `1px solid ${base.dot}`, opacity: 0.35,
        boxShadow: `inset 0 0 6px ${base.inner}`,
      }}/>
      {isKing && (
        <svg style={{ position: "absolute", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}
          width="42%" viewBox="0 0 24 24" fill={base.crown}>
          <path d="M3 8l4 4 5-7 5 7 4-4-2 10H5z"/>
        </svg>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Final board card — left column
   ───────────────────────────────────────────────────────── */
function FinalBoardCard({ result, match, board, trail }) {
  const files = ["a","b","c","d","e","f","g","h"];
  const ranks = [8,7,6,5,4,3,2,1];

  const resultMap = {
    win:  { tag: "Victory",       color: "oklch(0.82 0.15 155)", glow: "oklch(0.66 0.1 155 / 0.4)" },
    loss: { tag: "Defeat",        color: "oklch(0.78 0.14 25)",  glow: "oklch(0.65 0.18 25 / 0.4)" },
    draw: { tag: "Draw",          color: "var(--text-mute)",     glow: "transparent" },
  };
  const r = resultMap[result];

  return (
    <aside style={{
      display: "flex", flexDirection: "column", gap: 16,
      height: "100%", minHeight: 0,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{
            fontSize: 10.5, color: "var(--text-dim)", letterSpacing: "0.14em",
            textTransform: "uppercase", fontWeight: 700, fontFamily: "var(--mono)",
          }}>Final Position</div>
          <div style={{ marginTop: 4, fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>
            {match.player.name} <span style={{ color: "var(--text-dim)", fontWeight: 500, margin: "0 6px" }}>vs</span> {match.opponent.name}
          </div>
        </div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 10px", borderRadius: 999,
          background: result === "loss" ? "oklch(0.65 0.18 25 / 0.12)" :
                      result === "win"  ? "oklch(0.66 0.1 155 / 0.16)" : "var(--bg-elev-3)",
          color: r.color,
          border: `1px solid ${r.color}`,
          fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em",
          fontFamily: "var(--mono)", textTransform: "uppercase",
          boxShadow: `0 0 18px ${r.glow}`,
        }}>
          <span style={{ width: 5, height: 5, background: r.color, borderRadius: 999,
            boxShadow: `0 0 8px ${r.color}` }}/>
          {r.tag}
        </span>
      </div>

      {/* Board */}
      <div style={{
        position: "relative",
        flex: 1, minHeight: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 8,
      }}>
        {/* Files top */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(8, 1fr)",
          width: "min(100%, 480px)", padding: "0 10px",
          fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--text-dim)",
        }}>
          {files.map(f => <div key={`ft-${f}`} style={{ textAlign: "center" }}>{f}</div>)}
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "16px auto 16px",
          alignItems: "center", justifyItems: "center", gap: 6,
          width: "min(100%, 480px)",
        }}>
          {/* Ranks left */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around",
            height: "100%", fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--text-dim)" }}>
            {ranks.map(rk => <div key={`rl-${rk}`}>{rk}</div>)}
          </div>

          {/* Board frame */}
          <div style={{
            width: "100%", aspectRatio: "1 / 1",
            background: "linear-gradient(145deg, #2a1f15, #1a120c)",
            padding: 10, borderRadius: 8,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.6), 0 18px 40px -16px rgba(0,0,0,0.7)",
            position: "relative",
          }}>
            <div style={{
              width: "100%", height: "100%",
              display: "grid", gridTemplateColumns: "repeat(8, 1fr)",
              gridTemplateRows: "repeat(8, 1fr)",
              borderRadius: 3, overflow: "hidden",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.5)",
            }}>
              {board.map((row, ri) => row.map((cell, ci) => {
                const dark = (ri + ci) % 2 === 1;
                const inTrail = trail && trail.length > 0 && trail.some(t => t.r === ri && t.c === ci);
                const lastT = trail && trail.length > 0 ? trail[trail.length - 1] : null;
                const isLast = !!(lastT && lastT.r === ri && lastT.c === ci);
                return (
                  <div key={`${ri}-${ci}`} style={{
                    position: "relative",
                    background: dark ? "var(--board-dark)" : "var(--board-light)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {inTrail && (
                      <span aria-hidden style={{
                        position: "absolute", inset: 3, borderRadius: 4,
                        border: "1.5px solid oklch(0.7 0.1 65 / 0.85)",
                        boxShadow: isLast
                          ? "0 0 18px oklch(0.7 0.1 65 / 0.7), inset 0 0 12px oklch(0.7 0.1 65 / 0.35)"
                          : "inset 0 0 10px oklch(0.7 0.1 65 / 0.2)",
                        pointerEvents: "none",
                      }}/>
                    )}
                    {cell !== 0 && <StaticPiece kind={cell} dim={!isLast && trail && !inTrail}/>}
                  </div>
                );
              }))}
            </div>

            {/* faint wash over the board to signal "non-interactive" */}
            <div aria-hidden style={{
              position: "absolute", inset: 10,
              background: "linear-gradient(180deg, transparent 60%, rgba(20,17,13,0.18))",
              pointerEvents: "none", borderRadius: 3,
            }}/>
          </div>

          {/* Ranks right (spacer for symmetry) */}
          <div/>
        </div>

        {/* Files bottom */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(8, 1fr)",
          width: "min(100%, 480px)", padding: "0 10px",
          fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--text-dim)",
        }}>
          {files.map(f => <div key={`fb-${f}`} style={{ textAlign: "center" }}>{f}</div>)}
        </div>
      </div>

      {/* Meta footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 14px", borderRadius: 12,
        background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.4), oklch(0.18 0.012 55 / 0.3))",
        border: "1px solid var(--line-soft)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--text-mute)",
        letterSpacing: "0.04em",
      }}>
        <span>{match.moves} moves · {match.duration}</span>
        <span style={{
          color: match.ratingDelta < 0 ? "oklch(0.78 0.14 25)" :
                 match.ratingDelta > 0 ? "oklch(0.82 0.15 155)" : "var(--text-mute)",
          fontWeight: 600,
        }}>
          {match.ratingDelta > 0 ? "+" : ""}{match.ratingDelta} rating
        </span>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────
   Report card — the AI's opening message
   ───────────────────────────────────────────────────────── */
function StatTile({ icon, label, value, sub, tone = "neutral" }) {
  const toneColor =
    tone === "good" ? "oklch(0.82 0.15 155)" :
    tone === "warn" ? "oklch(0.78 0.14 25)"  :
    "var(--accent)";
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 6,
      padding: "12px 14px", borderRadius: 10,
      background: "linear-gradient(180deg, oklch(0.18 0.012 55 / 0.6), oklch(0.14 0.01 55 / 0.5))",
      border: "1px solid var(--line-soft)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
      minWidth: 0,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em",
        textTransform: "uppercase", fontWeight: 700, fontFamily: "var(--mono)",
      }}>
        <span style={{ color: toneColor, display: "inline-flex" }}>{icon}</span>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{
          fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em",
          color: toneColor,
        }}>{value}</span>
        {sub && <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--mono)" }}>{sub}</span>}
      </div>
    </div>
  );
}

function ReportCard({ match }) {
  const accTone = match.accuracy >= 85 ? "good" : match.accuracy >= 70 ? "neutral" : "warn";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* headline */}
      <div>
        <div style={{
          fontSize: 10.5, color: "var(--accent)", letterSpacing: "0.16em",
          textTransform: "uppercase", fontWeight: 700, fontFamily: "var(--mono)",
          marginBottom: 4,
        }}>Report · Match #08412</div>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.015em" }}>
          Match Analysis: {match.player.name} vs {match.opponent.name}
        </div>
      </div>

      {/* stat micro-grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 8,
      }}>
        <StatTile icon={GRI.target} label="Accuracy" value={`${match.accuracy}%`} tone={accTone}/>
        <StatTile icon={GRI.cap}    label="Captured" value={match.captured} sub={`/ ${match.lost} lost`}/>
        <StatTile icon={GRI.clock}  label="Duration" value={match.duration} sub="MM:SS"/>
      </div>

      {/* feedback paragraph */}
      <div style={{
        fontSize: 13.5, color: "var(--text)", lineHeight: 1.55,
        letterSpacing: "0.005em",
      }}>
        Solid first ten moves — your center control was patient.{" "}
        <strong style={{ color: "var(--accent)", fontWeight: 700 }}>
          Move {match.blunderMove} (c3 → b4)
        </strong>{" "}
        is the inflection point: it opened a two-step capture corridor on the dark diagonal and your king on d6 couldn't pivot back in time. From there, the engine just kept the pressure on your back rank.
      </div>

      {/* mini-bar: where the game turned */}
      <SwingBar accuracy={match.accuracy} blunderAt={match.blunderMove} totalMoves={match.moves}/>
    </div>
  );
}

function SwingBar({ accuracy, blunderAt, totalMoves }) {
  const blunderPct = (blunderAt / totalMoves) * 100;
  return (
    <div style={{
      padding: "10px 12px", borderRadius: 10,
      background: "oklch(0.12 0.008 55 / 0.55)",
      border: "1px solid var(--line-soft)",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 10, fontFamily: "var(--mono)", letterSpacing: "0.12em",
        textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 700,
        marginBottom: 6,
      }}>
        <span>Game swing</span>
        <span>{totalMoves} moves</span>
      </div>
      <div style={{
        position: "relative", height: 8, borderRadius: 999,
        background: "linear-gradient(90deg, oklch(0.66 0.1 155 / 0.5) 0%, oklch(0.7 0.1 65 / 0.5) 55%, oklch(0.65 0.18 25 / 0.6) 100%)",
        overflow: "visible",
      }}>
        <div style={{
          position: "absolute", top: -4, bottom: -4,
          left: `calc(${blunderPct}% - 1px)`,
          width: 2, background: "oklch(0.95 0.05 70)",
          boxShadow: "0 0 12px oklch(0.85 0.13 70 / 0.9)",
          borderRadius: 2,
        }}/>
        <div style={{
          position: "absolute", top: -22, left: `calc(${blunderPct}% - 26px)`,
          fontSize: 9.5, fontFamily: "var(--mono)", color: "var(--accent)",
          letterSpacing: "0.08em", whiteSpace: "nowrap", fontWeight: 700,
        }}>BLUNDER · m{blunderAt}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Chat bubbles
   ───────────────────────────────────────────────────────── */
function AIBubble({ children }) {
  return (
    <div style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      animation: "grBubbleIn 320ms cubic-bezier(0.22, 0.8, 0.3, 1) both",
    }}>
      <div style={{
        flexShrink: 0, width: 32, height: 32, borderRadius: "50%",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, oklch(0.78 0.12 65), oklch(0.55 0.1 50))",
        color: "#14110d",
        boxShadow: "0 0 0 1px oklch(0.7 0.1 65 / 0.5), 0 0 16px oklch(0.7 0.1 65 / 0.35)",
      }}>{GRI.bot}</div>
      <div style={{
        flex: 1, minWidth: 0,
        position: "relative",
        padding: 18,
        background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.62), oklch(0.16 0.012 55 / 0.5))",
        border: "1px solid var(--line-soft)",
        borderRadius: 16,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 12px 28px -18px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)",
        overflow: "hidden",
      }}>
        <div aria-hidden style={{
          position: "absolute", top: -40, right: -40, width: 180, height: 180,
          background: "radial-gradient(circle, oklch(0.7 0.1 65 / 0.16), transparent 70%)",
          filter: "blur(14px)", pointerEvents: "none",
        }}/>
        <div style={{ position: "relative" }}>{children}</div>
      </div>
    </div>
  );
}

function UserBubble({ children, avatarName }) {
  const initials = (avatarName || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      flexDirection: "row-reverse",
      animation: "grBubbleIn 320ms cubic-bezier(0.22, 0.8, 0.3, 1) both",
    }}>
      <div style={{
        flexShrink: 0, width: 32, height: 32, borderRadius: "50%",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg-elev-3)",
        color: "var(--text-mute)",
        fontWeight: 700, fontSize: 12, letterSpacing: "-0.01em",
        border: "1px solid var(--line-soft)",
      }}>{initials}</div>
      <div style={{
        maxWidth: "78%",
        padding: "12px 16px",
        background: "var(--bg-elev-2)",
        border: "1px solid var(--line-soft)",
        borderRadius: 16, borderTopRightRadius: 4,
        fontSize: 13.5, color: "var(--text)", lineHeight: 1.5,
      }}>{children}</div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{
        flexShrink: 0, width: 32, height: 32, borderRadius: "50%",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, oklch(0.78 0.12 65), oklch(0.55 0.1 50))",
        color: "#14110d",
        boxShadow: "0 0 0 1px oklch(0.7 0.1 65 / 0.5), 0 0 16px oklch(0.7 0.1 65 / 0.35)",
      }}>{GRI.bot}</div>
      <div style={{
        padding: "14px 18px",
        background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.55), oklch(0.16 0.012 55 / 0.45))",
        border: "1px solid var(--line-soft)",
        borderRadius: 16,
        display: "inline-flex", alignItems: "center", gap: 6,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: 999,
            background: "var(--accent)",
            opacity: 0.7,
            animation: `grDot 1.1s ease-in-out ${i * 0.18}s infinite`,
          }}/>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Prompt chips
   ───────────────────────────────────────────────────────── */
function PromptChip({ icon, label, onClick }) {
  const [hover, setHover] = useStateGR(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "8px 14px",
        background: hover
          ? "linear-gradient(180deg, oklch(0.7 0.1 65 / 0.12), oklch(0.7 0.1 65 / 0.04))"
          : "oklch(0.18 0.012 55 / 0.55)",
        color: hover ? "var(--text)" : "var(--text-mute)",
        border: `1px solid ${hover ? "oklch(0.7 0.1 65 / 0.7)" : "var(--line-soft)"}`,
        borderRadius: 999,
        fontSize: 12.5, fontWeight: 600,
        letterSpacing: "-0.005em",
        boxShadow: hover
          ? "0 0 0 3px oklch(0.7 0.1 65 / 0.12), 0 0 18px oklch(0.7 0.1 65 / 0.25)"
          : "none",
        transition: "all 160ms ease",
        cursor: "pointer",
        whiteSpace: "nowrap",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <span style={{
        color: hover ? "var(--accent)" : "var(--text-dim)",
        display: "inline-flex",
        transition: "color 160ms ease",
      }}>{icon}</span>
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   Chat input — glassmorphic with circular send
   ───────────────────────────────────────────────────────── */
function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useStateGR("");
  const [focus, setFocus] = useStateGR(false);
  const taRef = useRefGR(null);
  const canSend = value.trim().length > 0 && !disabled;

  // auto-grow
  useEffectGR(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(160, el.scrollHeight) + "px";
  }, [value]);

  function submit() {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
  }

  return (
    <div style={{
      position: "relative",
      padding: "12px 12px 12px 18px",
      display: "flex", alignItems: "flex-end", gap: 10,
      background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.65), oklch(0.16 0.012 55 / 0.55))",
      border: `1px solid ${focus ? "oklch(0.7 0.1 65 / 0.75)" : "var(--line-soft)"}`,
      borderRadius: 18,
      backdropFilter: "blur(16px) saturate(140%)",
      WebkitBackdropFilter: "blur(16px) saturate(140%)",
      boxShadow: focus
        ? "0 0 0 3px oklch(0.7 0.1 65 / 0.14), 0 18px 40px -20px rgba(0,0,0,0.7), 0 0 26px oklch(0.7 0.1 65 / 0.22), inset 0 1px 0 rgba(255,255,255,0.04)"
        : "0 18px 40px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
      transition: "border-color 180ms ease, box-shadow 180ms ease",
    }}>
      <textarea
        ref={taRef}
        rows={1}
        value={value}
        placeholder="Ask your AI Coach anything…"
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        style={{
          flex: 1,
          padding: "10px 4px",
          background: "transparent",
          border: "none", outline: "none",
          color: "var(--text)",
          fontSize: 14.5, lineHeight: 1.5,
          fontFamily: "inherit",
          resize: "none",
          minHeight: 24, maxHeight: 160,
        }}
      />
      <button
        onClick={submit}
        disabled={!canSend}
        aria-label="Send"
        style={{
          flexShrink: 0,
          width: 40, height: 40, borderRadius: "50%",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: canSend
            ? "linear-gradient(180deg, oklch(0.82 0.12 70), oklch(0.62 0.13 55))"
            : "var(--bg-elev-3)",
          color: canSend ? "#14110d" : "var(--text-dim)",
          border: `1px solid ${canSend ? "oklch(0.78 0.12 65 / 0.6)" : "var(--line-soft)"}`,
          boxShadow: canSend
            ? "0 0 18px oklch(0.7 0.1 65 / 0.55), 0 6px 14px -6px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.3)"
            : "none",
          cursor: canSend ? "pointer" : "not-allowed",
          transition: "background 200ms ease, box-shadow 200ms ease, color 200ms ease",
        }}
      >
        {GRI.send}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main page
   ───────────────────────────────────────────────────────── */
function GameReviewPage({ match = MATCH, board = FINAL_BOARD, trail = LAST_MOVE_TRAIL, onClose, onRematch }) {
  const [messages, setMessages] = useStateGR([]); // user/ai exchanges only
  const [thinking, setThinking] = useStateGR(false);
  const scrollRef = useRefGR(null);

  // System prompt baked from the match facts.
  const systemContext = useMemoGR(() => {
    return [
      "You are an expert AI checkers coach speaking to a player who just finished a match.",
      `Match facts you may reference: player=${match.player.name} (rating ${match.player.rating}), opponent=${match.opponent.name} (rating ${match.opponent.rating}).`,
      `Result for the player: ${match.result}. Pieces captured by player: ${match.captured}. Pieces lost: ${match.lost}. Duration: ${match.duration}. Total moves: ${match.moves}. Accuracy: ${match.accuracy}%.`,
      `Key blunder was on move ${match.blunderMove} (c3 -> b4), which opened a two-step capture corridor on the dark diagonal; the player's king on d6 couldn't pivot back in time.`,
      "Style: concise, encouraging, expert. 2-4 short paragraphs MAX. Use plain prose — no markdown headings, no bullet asterisks. Reference squares like c3, b4 when useful.",
    ].join(" ");
  }, [match]);

  // Auto-scroll on new messages
  useEffectGR(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function ask(text) {
    if (!text || thinking) return;
    const next = [...messages, { who: "user", text }];
    setMessages(next);
    setThinking(true);

    let reply = "";
    try {
      if (window.claude?.complete) {
        const history = next.map(m =>
          ({ role: m.who === "user" ? "user" : "assistant", content: m.text })
        );
        reply = await window.claude.complete({
          messages: [
            { role: "user", content: `${systemContext}\n\nPlayer message: ${text}` },
            ...history.slice(0, -1), // exclude the message we just added (it's in the system context)
          ],
        });
      } else {
        reply = "(Coach offline in preview — wire window.claude.complete to enable replies.)";
      }
    } catch (e) {
      reply = "Hmm, I lost the thread there. Try again in a moment.";
    }

    setMessages((prev) => [...prev, { who: "ai", text: reply }]);
    setThinking(false);
  }

  return (
    <div
      data-screen-label="01 Game Review"
      style={{
        minHeight: "100vh",
        position: "relative",
        padding: "20px 24px",
        overflow: "hidden",
      }}
    >
      {/* keyframes */}
      <style>{`
        @keyframes grBubbleIn {
          from { opacity: 0; transform: translateY(8px); filter: blur(3px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes grDot {
          0%, 80%, 100% { transform: translateY(0);   opacity: 0.45; }
          40%           { transform: translateY(-3px); opacity: 1; }
        }
        @keyframes grGlow {
          0%, 100% { opacity: 0.85; }
          50%      { opacity: 1; }
        }
        .gr-scroll::-webkit-scrollbar { width: 8px; }
        .gr-scroll::-webkit-scrollbar-track { background: transparent; }
        .gr-scroll::-webkit-scrollbar-thumb {
          background: var(--line-soft);
          border-radius: 999px;
        }
        .gr-scroll::-webkit-scrollbar-thumb:hover { background: var(--line); }
      `}</style>

      {/* ambient glow */}
      <div aria-hidden style={{
        position: "absolute",
        left: "70%", top: "40%",
        width: 720, height: 720,
        background: "radial-gradient(closest-side, oklch(0.7 0.1 65 / 0.22), transparent 70%)",
        filter: "blur(28px)",
        pointerEvents: "none",
        animation: "grGlow 8s ease-in-out infinite",
      }}/>
      <div aria-hidden style={{
        position: "absolute",
        left: "-10%", top: "60%",
        width: 520, height: 520,
        background: "radial-gradient(closest-side, oklch(0.55 0.1 50 / 0.18), transparent 70%)",
        filter: "blur(28px)",
        pointerEvents: "none",
      }}/>

      {/* Top bar */}
      <header style={{
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "4px 6px 18px",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 6, height: 6, background: "var(--accent)", borderRadius: 999,
            boxShadow: "0 0 10px oklch(0.7 0.1 65 / 0.75)" }} />
          <span style={{
            color: "var(--text-mute)", fontSize: 12.5,
            letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600,
          }}>Crown Club · Review</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={onClose}
            aria-label="Close review"
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "var(--bg-elev-2)",
              border: "1px solid var(--line-soft)",
              color: "var(--text-mute)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              transition: "all 160ms ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--line)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-mute)"; e.currentTarget.style.borderColor = "var(--line-soft)"; }}
          >{GRI.close}</button>
        </div>
      </header>

      {/* Split layout */}
      <div className="r-review-split" style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr)", // ~40 / 60
        gap: 22,
        height: "calc(100vh - 80px)",
        minHeight: 600,
      }}>
        {/* LEFT — Final board card */}
        <div style={{
          padding: 22,
          background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.45), oklch(0.16 0.012 55 / 0.35))",
          border: "1px solid var(--line-soft)",
          borderRadius: 20,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 24px 60px -28px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.03)",
          minHeight: 0,
          overflow: "hidden",
        }}>
          <FinalBoardCard result={match.result} match={match} board={board} trail={trail}/>
        </div>

        {/* RIGHT — Chat panel */}
        <div style={{
          position: "relative",
          display: "grid",
          gridTemplateRows: "1fr auto",
          gap: 12,
          padding: 22,
          background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.55), oklch(0.16 0.012 55 / 0.45))",
          border: "1px solid var(--line-soft)",
          borderRadius: 20,
          backdropFilter: "blur(16px) saturate(140%)",
          WebkitBackdropFilter: "blur(16px) saturate(140%)",
          boxShadow: "0 24px 60px -28px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
          minHeight: 0,
        }}>
          {/* Header */}
          <div style={{ position: "absolute", top: 18, left: 22, right: 22, display: "flex",
            alignItems: "center", justifyContent: "space-between", pointerEvents: "none" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 10px", borderRadius: 999,
              background: "oklch(0.7 0.1 65 / 0.12)",
              border: "1px solid oklch(0.7 0.1 65 / 0.35)",
              color: "var(--accent)",
              fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em",
              fontFamily: "var(--mono)", textTransform: "uppercase",
            }}>
              <span style={{ color: "var(--accent)", display: "inline-flex" }}>{GRI.spark}</span>
              AI Coach
            </div>
            <span style={{
              fontSize: 10.5, color: "var(--text-dim)",
              fontFamily: "var(--mono)", letterSpacing: "0.12em",
            }}>SONNET 4.6 · LIVE</span>
          </div>

          {/* Scrollable thread */}
          <div
            ref={scrollRef}
            className="gr-scroll"
            style={{
              overflowY: "auto",
              minHeight: 0,
              paddingTop: 52,
              paddingRight: 6,
              marginRight: -6,
              display: "flex", flexDirection: "column", gap: 14,
            }}
          >
            {/* Opening report bubble */}
            <AIBubble>
              <ReportCard match={match}/>
            </AIBubble>

            {/* Prompt chips row */}
            <div style={{
              display: "flex", gap: 8, flexWrap: "wrap",
              paddingLeft: 44,
            }}>
              {PROMPT_CHIPS.map(c => (
                <PromptChip key={c.id} icon={c.icon} label={c.label}
                  onClick={() => ask(c.label)}/>
              ))}
            </div>

            {/* History */}
            {messages.map((m, i) => (
              m.who === "user"
                ? <UserBubble key={i} avatarName={match.player.name}>{m.text}</UserBubble>
                : <AIBubble key={i}>
                    <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--text)", whiteSpace: "pre-wrap" }}>
                      {m.text}
                    </div>
                  </AIBubble>
            ))}

            {thinking && <TypingBubble/>}

            {/* spacer so the last bubble breathes above the input */}
            <div style={{ height: 4 }}/>
          </div>

          {/* Input pinned bottom */}
          <ChatInput onSend={ask} disabled={thinking}/>
        </div>
      </div>
    </div>
  );
}

window.GameReviewPage = GameReviewPage;
