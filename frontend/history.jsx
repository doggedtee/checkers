// History view — renders inside the dashboard frame when the
// "History" sidebar tab is active. Reuses Avatar from dashboard.jsx.
const { useState: useStateHist, useEffect: useEffectHist, useMemo: useMemoHist } = React;

/* ─────────────────────────────────────────────────────────
   Icons specific to history view
   ───────────────────────────────────────────────────────── */
const HI = {
  clock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  capture: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1" opacity="0.45"/>
    </svg>
  ),
  spark: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4L12 2Z"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  filter: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18"/><path d="M6 12h12"/><path d="M10 19h4"/></svg>,
};

/* ─────────────────────────────────────────────────────────
   Top analytics cards
   ───────────────────────────────────────────────────────── */

function GlassCard({ children, glowHue = 65, style }) {
  return (
    <div style={{
      position: "relative",
      background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.6), oklch(0.18 0.012 55 / 0.45))",
      border: "1px solid var(--line-soft)",
      borderRadius: 14,
      padding: 18,
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      boxShadow: "0 8px 22px -14px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
      overflow: "hidden",
      ...style,
    }}>
      {/* internal corner glow */}
      <div aria-hidden style={{
        position: "absolute", top: -30, right: -30, width: 150, height: 150,
        background: `radial-gradient(circle, oklch(0.7 0.1 ${glowHue} / 0.18), transparent 70%)`,
        filter: "blur(8px)", pointerEvents: "none",
      }}/>
      {/* top highlight */}
      <div aria-hidden style={{
        position: "absolute", left: 18, right: 18, top: 0, height: 1,
        background: `linear-gradient(90deg, transparent, oklch(0.78 0.1 ${glowHue} / 0.35), transparent)`,
        pointerEvents: "none",
      }}/>
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}

function AnalyticCard({ icon, label, value, sub, glowHue = 65 }) {
  return (
    <GlassCard glowHue={glowHue}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `oklch(0.7 0.1 ${glowHue} / 0.14)`,
          color: `oklch(0.78 0.12 ${glowHue})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `inset 0 0 0 1px oklch(0.7 0.1 ${glowHue} / 0.3)`,
          flexShrink: 0,
        }}>{icon}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11.5, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)", marginTop: 4, whiteSpace: "nowrap" }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>}
        </div>
      </div>
    </GlassCard>
  );
}

function FormPills({ form }) {
  // form is array of "W" | "L" | "D"; oldest → newest left → right
  return (
    <GlassCard glowHue={55}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11.5, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>Recent form</div>
          <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 6, fontFamily: "var(--mono)" }}>last 5 matches</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {form.map((r, i) => {
            const c = r === "W"
              ? { bg: "oklch(0.74 0.13 155 / 0.22)", ring: "oklch(0.74 0.13 155 / 0.55)", glow: "oklch(0.74 0.13 155 / 0.5)", fg: "oklch(0.85 0.15 155)" }
              : r === "L"
              ? { bg: "oklch(0.7 0.14 25 / 0.22)",  ring: "oklch(0.7 0.14 25 / 0.55)",  glow: "oklch(0.7 0.14 25 / 0.45)",  fg: "oklch(0.82 0.14 25)" }
              : { bg: "var(--bg-elev-3)",            ring: "var(--line)",                  glow: "transparent",                  fg: "var(--text-mute)" };
            return (
              <div key={i} style={{
                width: 22, height: 28, borderRadius: 6,
                background: c.bg,
                boxShadow: `inset 0 0 0 1px ${c.ring}, 0 0 10px ${c.glow}`,
                color: c.fg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, fontFamily: "var(--mono)",
                letterSpacing: "0.04em",
              }}>{r}</div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}

/* ─────────────────────────────────────────────────────────
   Match row + table
   ───────────────────────────────────────────────────────── */

function OutcomePill({ result }) {
  const isWin = result === "W";
  const isDraw = result === "D";
  const c = isDraw
    ? { bg: "var(--bg-elev-3)", fg: "var(--text-mute)", ring: "var(--line)", glow: "transparent", label: "DRAW" }
    : isWin
    ? { bg: "oklch(0.74 0.13 155 / 0.18)", fg: "oklch(0.85 0.15 155)", ring: "oklch(0.74 0.13 155 / 0.45)", glow: "oklch(0.74 0.13 155 / 0.35)", label: "WIN" }
    : { bg: "oklch(0.7 0.14 25 / 0.18)",  fg: "oklch(0.82 0.14 25)",  ring: "oklch(0.7 0.14 25 / 0.45)",  glow: "oklch(0.7 0.14 25 / 0.3)",   label: "LOSS" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "4px 10px", minWidth: 56,
      borderRadius: 999,
      background: c.bg, color: c.fg,
      boxShadow: `inset 0 0 0 1px ${c.ring}, 0 0 14px ${c.glow}`,
      fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em",
      fontFamily: "var(--mono)",
    }}>{c.label}</span>
  );
}

function ReviewButton({ onClick }) {
  const [hover, setHover] = useStateHist(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "7px 12px", borderRadius: 8,
        background: hover ? "oklch(0.7 0.1 65 / 0.14)" : "var(--bg-elev-2)",
        border: `1px solid ${hover ? "oklch(0.7 0.1 65 / 0.6)" : "var(--line-soft)"}`,
        color: hover ? "var(--accent)" : "var(--text-mute)",
        fontSize: 12, fontWeight: 600, letterSpacing: "-0.005em",
        boxShadow: hover ? "0 0 16px oklch(0.7 0.1 65 / 0.28)" : "none",
        transform: hover ? "translateX(2px)" : "none",
        transition: "all 160ms ease",
      }}
    >
      Review board {HI.arrow}
    </button>
  );
}

function MatchRow({ match, onReview }) {
  const [hover, setHover] = useStateHist(false);
  return (
    <div
      className="r-match-row"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "auto minmax(0,1fr) auto auto auto",
        alignItems: "center", gap: 22,
        padding: "14px 16px",
        borderBottom: "1px solid var(--line-soft)",
        background: hover ? "oklch(0.7 0.1 65 / 0.04)" : "transparent",
        transition: "background 160ms ease",
      }}
    >
      {/* opponent */}
      <Avatar name={match.opp} size={36} color={match.color} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{match.opp}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 2 }}>{match.tag}</div>
      </div>

      {/* outcome */}
      <OutcomePill result={match.result} />

      {/* stats */}
      <div style={{
        display: "flex", gap: 22,
        fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-mute)",
        whiteSpace: "nowrap",
      }}>
        <StatMini label="Date" value={match.date} width={84} />
        <StatMini label="Duration" value={match.duration} width={64} />
        <StatMini label="Moves" value={match.moves} width={48} />
      </div>

      <ReviewButton onClick={() => onReview && onReview(match)} />
    </div>
  );
}

function StatMini({ label, value, width }) {
  return (
    <div style={{ minWidth: width, flexShrink: 0 }}>
      <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={{ color: "var(--text)" }}>{value}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   HistoryView — main export
   ───────────────────────────────────────────────────────── */

function HistoryView({ user }) {
  const [matches, setMatches] = useStateHist(null);
  const [filter, setFilter] = useStateHist("All");
  const [reviewing, setReviewing] = useStateHist(null);

  useEffectHist(() => {
    if (!user?.id) {
      setMatches(MOCK_MATCHES);
      return;
    }
    fetch(`${window.API_BASE}/user/${user.id}/history`)
      .then(res => res.json())
      .then(data => {
        const games = data.games || [];
        if (!games.length) {
          setMatches(MOCK_MATCHES);
          return;
        }
        setMatches(games.map((g, i) => ({
          id: g.id || i,
          opp: g.player2_id ? "Friend" : "Bot",
          tag: g.player2_id ? "Local hotseat" : "vs AI",
          color: g.player2_id ? "oklch(0.7 0.12 280)" : "oklch(0.7 0.12 65)",
          result: g.winner === "BEIGE" ? "W" : (g.winner ? "L" : "D"),
          moves: g.moves ? g.moves.length : 0,
          rawMoves: g.moves || [],
          duration: g.duration || formatDur(g.moves ? g.moves.length * 7 : 0),
          date: new Date(g.created_at).toLocaleDateString(),
        })));
      })
      .catch(() => setMatches(MOCK_MATCHES));
  }, [user]);

  const filtered = useMemoHist(() => {
    if (!matches) return [];
    if (filter === "All") return matches;
    if (filter === "Wins") return matches.filter(m => m.result === "W");
    if (filter === "Losses") return matches.filter(m => m.result === "L");
    if (filter === "vs Bot") return matches.filter(m => m.tag.includes("AI"));
    if (filter === "vs Friend") return matches.filter(m => m.tag.includes("hotseat"));
    return matches;
  }, [matches, filter]);

  const summary = useMemoHist(() => {
    const ms = matches || [];
    const totalMoves = ms.reduce((s, m) => s + (m.moves || 0), 0);
    // ballpark: ~7s/move avg
    const totalSeconds = totalMoves * 7;
    const hrs = (totalSeconds / 3600).toFixed(1);
    // ballpark captures: 30% of moves
    const captures = Math.round(totalMoves * 0.32);
    const recent = ms.slice(0, 5).map(m => m.result).reverse(); // oldest left → newest right
    while (recent.length < 5) recent.unshift("D");
    return { playtime: `${hrs} hrs`, captures, recent };
  }, [matches]);

  const filters = ["All", "Wins", "Losses", "vs Bot", "vs Friend"];

  return (
    <div key="history" style={{ animation: "fade 320ms ease both" }}>
      {/* Page heading */}
      <div className="r-page-head" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12.5, color: "var(--text-mute)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>Match log</div>
          <h2 style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>History &amp; analytics</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-mute)", fontSize: 12 }}>
          {HI.filter}
          <div style={{ display: "flex", gap: 4, padding: 3, background: "var(--bg-elev-1)", border: "1px solid var(--line-soft)", borderRadius: 8 }}>
            {filters.map(f => {
              const active = filter === f;
              return (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "6px 11px", borderRadius: 6,
                  background: active ? "oklch(0.7 0.1 65 / 0.16)" : "transparent",
                  color: active ? "var(--accent)" : "var(--text-mute)",
                  fontSize: 12, fontWeight: 600,
                  boxShadow: active ? "inset 0 0 0 1px oklch(0.7 0.1 65 / 0.45)" : "none",
                  transition: "all 140ms ease",
                }}>{f}</button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top analytics row */}
      <div className="r-analytics" style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1.3fr", gap: 14,
        marginBottom: 22,
      }}>
        <AnalyticCard
          icon={HI.clock}
          label="Total playtime"
          value={summary.playtime}
          sub="across all modes"
          glowHue={65}
        />
        <AnalyticCard
          icon={HI.capture}
          label="Pieces captured"
          value={summary.captures}
          sub="lifetime"
          glowHue={48}
        />
        <FormPills form={summary.recent} />
      </div>

      {/* Match table */}
      <section style={{
        position: "relative",
        background: "linear-gradient(180deg, var(--bg-elev-2), var(--bg-elev-1))",
        border: "1px solid var(--line-soft)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 10px 26px -16px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}>
        {/* table header */}
        <div className="r-match-head" style={{
          display: "grid",
          gridTemplateColumns: "auto minmax(0,1fr) auto auto auto",
          alignItems: "center", gap: 22,
          padding: "13px 16px",
          borderBottom: "1px solid var(--line-soft)",
          background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.5), transparent)",
          fontSize: 10.5, color: "var(--text-dim)", letterSpacing: "0.1em",
          textTransform: "uppercase", fontWeight: 700,
        }}>
          <span style={{ width: 36 }} />
          <span>Opponent</span>
          <span style={{ minWidth: 56, textAlign: "center" }}>Result</span>
          <span style={{ width: 84 + 64 + 48 + 44, whiteSpace: "nowrap" }}>Match stats</span>
          <span style={{ width: 132, textAlign: "right" }}>Action</span>
        </div>

        {/* rows */}
        {matches === null ? (
          <div style={{ padding: "44px 16px", textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
            Loading match history…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "44px 16px", textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
            No matches match this filter.
          </div>
        ) : (
          filtered.map((m, i) => <MatchRow key={m.id ?? i} match={m} onReview={setReviewing} />)
        )}

        {/* footer */}
        <div style={{
          display: "flex", alignItems: "center",
          padding: "12px 16px", borderTop: "1px solid var(--line-soft)",
          fontSize: 12, color: "var(--text-dim)",
        }}>
          <span style={{ fontFamily: "var(--mono)" }}>
            {filtered.length} of {matches?.length || 0} matches
          </span>
        </div>
      </section>

      {reviewing && <ReviewModal match={reviewing} onClose={() => setReviewing(null)} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ReviewModal — replay the game move-by-move
   ───────────────────────────────────────────────────────── */

function buildInitialBoard() {
  const b = Array.from({ length: 8 }, () => Array(8).fill(0));
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 8; c++)
      if ((r + c) % 2 === 1) b[r][c] = 1;
  for (let r = 5; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if ((r + c) % 2 === 1) b[r][c] = 2;
  return b;
}

function replayBoard(moves, upToIdx) {
  const board = buildInitialBoard();
  for (let i = 0; i < upToIdx && i < moves.length; i++) {
    const m = moves[i];
    if (!m.from || !m.to) continue;
    const [fr, fc] = m.from;
    const [tr, tc] = m.to;
    const piece = board[fr][fc];
    board[fr][fc] = 0;
    if (m.capture) {
      const cr = Math.round((fr + tr) / 2);
      const cc = Math.round((fc + tc) / 2);
      board[cr][cc] = 0;
    }
    let promoted = piece;
    if (piece === 1 && tr === 7) promoted = 3;
    if (piece === 2 && tr === 0) promoted = 4;
    board[tr][tc] = promoted;
  }
  return board;
}

function ReviewModal({ match, onClose }) {
  const moves = match.rawMoves || [];
  const [step, setStep] = useStateHist(moves.length);
  const board = useMemoHist(() => replayBoard(moves, step), [moves, step]);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(10,8,6,0.78)",
      backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 60, padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--bg-elev-1)", border: "1px solid var(--line)",
        borderRadius: 18, padding: 22, width: "min(640px, 100%)",
        boxShadow: "0 40px 80px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
        maxHeight: "92vh", overflowY: "auto",
      }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
              Match replay
            </div>
            <h3 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>
              vs {match.opp}
            </h3>
            <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 4, fontFamily: "var(--mono)" }}>
              {match.date} · {match.moves} moves · {match.duration}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <OutcomePill result={match.result} />
            <button onClick={onClose} style={{
              width: 30, height: 30, borderRadius: 8,
              background: "var(--bg-elev-2)", border: "1px solid var(--line-soft)",
              color: "var(--text-mute)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
            </button>
          </div>
        </div>

        {/* board */}
        <div style={{
          width: "100%", aspectRatio: "1 / 1", maxWidth: 460, margin: "0 auto",
          background: "linear-gradient(145deg, #2a1f15, #1a120c)",
          padding: 10, borderRadius: 8,
          border: "1px solid #3a2c20",
          boxShadow: "0 20px 60px -20px rgba(0,0,0,0.7)",
        }}>
          <div style={{
            width: "100%", height: "100%",
            display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gridTemplateRows: "repeat(8, 1fr)",
            borderRadius: 3, overflow: "hidden",
          }}>
            {[7,6,5,4,3,2,1,0].map(r => board[r].map((cell, c) => {
              const dark = (r + c) % 2 === 1;
              const lastMove = step > 0 ? moves[step - 1] : null;
              const isFrom = lastMove && lastMove.from && lastMove.from[0] === r && lastMove.from[1] === c;
              const isTo = lastMove && lastMove.to && lastMove.to[0] === r && lastMove.to[1] === c;
              return (
                <div key={`${r}-${c}`} style={{
                  background: dark
                    ? "linear-gradient(135deg, #5a3820, #3e2614)"
                    : "linear-gradient(135deg, #c69968, #a47b48)",
                  position: "relative",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: (isFrom || isTo) ? "inset 0 0 0 2px var(--accent)" : "none",
                }}>
                  {cell !== 0 && <ReplayPiece kind={cell} />}
                </div>
              );
            }))}
          </div>
        </div>

        {/* controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
          <button onClick={() => setStep(0)} disabled={step === 0} style={replayBtnStyle(step === 0)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 20 9 12l10-8v16zM5 19V5"/></svg>
          </button>
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={replayBtnStyle(step === 0)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div style={{
            flex: 1, textAlign: "center", fontFamily: "var(--mono)", fontSize: 13,
            color: "var(--text-mute)",
          }}>
            Move <span style={{ color: "var(--accent)", fontWeight: 700 }}>{step}</span> / {moves.length}
          </div>
          <button onClick={() => setStep(s => Math.min(moves.length, s + 1))} disabled={step === moves.length} style={replayBtnStyle(step === moves.length)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m9 6 6 6-6 6"/></svg>
          </button>
          <button onClick={() => setStep(moves.length)} disabled={step === moves.length} style={replayBtnStyle(step === moves.length)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m5 4 10 8-10 8V4zM19 5v14"/></svg>
          </button>
        </div>

        {moves.length === 0 && (
          <div style={{ marginTop: 14, padding: 12, textAlign: "center", color: "var(--text-dim)", fontSize: 12.5, background: "var(--bg-elev-2)", borderRadius: 8 }}>
            No move data saved for this match.
          </div>
        )}
      </div>
    </div>
  );
}

function replayBtnStyle(disabled) {
  return {
    width: 36, height: 36, borderRadius: 8,
    background: disabled ? "var(--bg-elev-2)" : "var(--bg-elev-3)",
    border: "1px solid var(--line-soft)",
    color: disabled ? "var(--text-dim)" : "var(--text)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "all 140ms ease",
  };
}

function ReplayPiece({ kind }) {
  const isPlayer = kind === 1 || kind === 3;
  const isKing = kind === 3 || kind === 4;
  return (
    <div style={{
      width: "76%", aspectRatio: "1 / 1", borderRadius: "50%",
      background: isPlayer
        ? "radial-gradient(circle at 35% 30%, #f7eccd, #d9c290 45%, #9a7a45)"
        : "radial-gradient(circle at 35% 30%, #8a2c26, #5a1a16 50%, #2a0c0a)",
      boxShadow: isPlayer
        ? "inset 0 -2px 0 #6e5526, 0 2px 4px rgba(0,0,0,0.4)"
        : "inset 0 -2px 0 #1a0807, 0 2px 4px rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {isKing && (
        <svg width="44%" viewBox="0 0 24 24" fill={isPlayer ? "#5a4520" : "#1a0807"}>
          <path d="M3 8l4 4 5-7 5 7 4-4-2 10H5z"/>
        </svg>
      )}
    </div>
  );
}

function formatDur(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

const MOCK_MATCHES = [
  { id: 1, opp: "Bot — Master",       tag: "vs AI · 2000 elo",    color: "oklch(0.7 0.12 65)",  result: "L", date: "5/16/2026", duration: "12:08", moves: 78, rawMoves: [] },
  { id: 2, opp: "Bot — Expert",       tag: "vs AI · 1650 elo",    color: "oklch(0.7 0.12 65)",  result: "W", date: "5/16/2026", duration: "06:42", moves: 32, rawMoves: [] },
  { id: 3, opp: "Friend",             tag: "Local hotseat",        color: "oklch(0.7 0.12 280)", result: "W", date: "5/15/2026", duration: "08:32", moves: 40, rawMoves: [] },
  { id: 4, opp: "Bot — Intermediate", tag: "vs AI · 1250 elo",    color: "oklch(0.7 0.12 65)",  result: "W", date: "5/14/2026", duration: "10:11", moves: 55, rawMoves: [] },
  { id: 5, opp: "Bot — Hard",         tag: "vs AI · 1500 elo",    color: "oklch(0.7 0.12 65)",  result: "L", date: "5/13/2026", duration: "09:24", moves: 48, rawMoves: [] },
  { id: 6, opp: "Friend",             tag: "Local hotseat",        color: "oklch(0.7 0.12 280)", result: "D", date: "5/12/2026", duration: "14:50", moves: 86, rawMoves: [] },
  { id: 7, opp: "Bot — Casual",       tag: "vs AI · 800 elo",     color: "oklch(0.7 0.12 65)",  result: "W", date: "5/11/2026", duration: "05:18", moves: 28, rawMoves: [] },
];

window.HistoryView = HistoryView;
