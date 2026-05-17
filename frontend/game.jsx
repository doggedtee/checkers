// Game page — interactive checkers board
const { useState: useStateGame, useMemo: useMemoGame, useEffect: useEffectGame, useRef: useRefGame } = React;

const API = 'http://localhost:8000';
const GAME_ID = 'game1';

async function apiNewGame() {
  const res = await fetch(`${API}/game/new?game_id=${GAME_ID}`, { method: 'POST' });
  return res.json();
}

async function apiGetValidMoves(row, col) {
  const res = await fetch(`${API}/game/${GAME_ID}/valid-moves?row=${row}&col=${col}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.moves.map(m => m.length === 4
    ? { to: [m[0], m[1]], capture: [m[2], m[3]] }
    : { to: [m[0], m[1]], capture: null }
  );
}

async function apiMakeMove(pieceRow, pieceCol, toRow, toCol, userId = null) {
  const res = await fetch(`${API}/game/${GAME_ID}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ piece_row: pieceRow, piece_col: pieceCol, to_row: toRow, to_col: toCol, user_id: userId }),
  });
  if (!res.ok) return null;
  return res.json();
}

async function apiBotMove(difficulty, userId = null) {
  const params = new URLSearchParams({ difficulty: String(difficulty) });
  if (userId) params.append("user_id", userId);
  const res = await fetch(`${API}/game/${GAME_ID}/bot-move?${params.toString()}`, { method: 'POST' });
  if (!res.ok) return null;
  return res.json();
}

function Piece({ kind, selected, ghost }) {
  // kind: 1 player, 2 opp, 3 player-king, 4 opp-king
  const isPlayer = kind === 1 || kind === 3;
  const isKing = kind === 3 || kind === 4;
  const base = isPlayer
    ? { fill: "radial-gradient(circle at 35% 30%, #f7eccd 0%, #d9c290 45%, #9a7a45 100%)", ring: "#6e5526", dot: "#4d3a18", inner: "#a07c44" }
    : { fill: "radial-gradient(circle at 35% 30%, #8a2c26 0%, #5a1a16 50%, #2a0c0a 100%)", ring: "#1a0807", dot: "#1a0807", inner: "#3a1311" };
  return (
    <div style={{
      width: "78%", aspectRatio: "1 / 1", borderRadius: "50%",
      background: base.fill,
      boxShadow: `inset 0 -4px 0 ${base.ring}, inset 0 2px 1px rgba(255,255,255,0.18), 0 5px 14px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.04)${selected ? ", 0 0 0 2px var(--accent), 0 0 28px oklch(0.7 0.1 65 / 0.5)" : ""}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative",
      transition: "box-shadow 160ms ease, transform 160ms ease",
      transform: selected ? "translateY(-2px)" : "none",
      opacity: ghost ? 0.4 : 1,
    }}>
      <div style={{ width: "64%", aspectRatio: "1 / 1", borderRadius: "50%", border: `1px solid ${base.dot}`, opacity: 0.35, boxShadow: `inset 0 0 8px ${base.inner}` }} />
      {isKing && (
        <svg style={{ position: "absolute", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }} width="42%" viewBox="0 0 24 24" fill={isPlayer ? "#5a4520" : "#1a0807"}>
          <path d="M3 8l4 4 5-7 5 7 4-4-2 10H5z" />
        </svg>
      )}
    </div>
  );
}

function PlayerCard({ side, name, rating, country, color, active, captured, time }) {
  return (
    <div style={{
      background: "var(--bg-elev-1)",
      border: `1px solid ${active ? "var(--accent)" : "var(--line-soft)"}`,
      borderRadius: 16, padding: 18,
      display: "flex", flexDirection: "column", gap: 14,
      minWidth: 220, position: "relative",
      transition: "border-color 200ms ease, box-shadow 200ms ease",
      boxShadow: active ? "0 0 0 1px var(--accent), 0 8px 30px -10px oklch(0.7 0.1 65 / 0.4)" : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={name} size={42} color={color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--mono)" }}>
            <span>{rating}</span>
            <span>·</span>
            <span>{country}</span>
          </div>
        </div>
        {active && <span style={{ width: 8, height: 8, background: "var(--accent)", borderRadius: 999, boxShadow: "0 0 10px var(--accent)" }} />}
      </div>

      {/* timer */}
      <div style={{
        display: "flex", alignItems: "baseline", justifyContent: "space-between",
        padding: "10px 12px", borderRadius: 10,
        background: active ? "var(--accent-soft)" : "var(--bg-elev-2)",
        border: "1px solid var(--line-soft)",
      }}>
        <span style={{ fontSize: 11, color: "var(--text-mute)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Time</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 600, color: active ? "var(--accent)" : "var(--text)", letterSpacing: "0.02em" }}>{time}</span>
      </div>

      {/* captured row */}
      <div>
        <div style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Captured · {captured.length}</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", minHeight: 22 }}>
          {captured.map((_, i) => (
            <span key={i} style={{
              width: 18, height: 18, borderRadius: "50%",
              background: side === "player"
                ? "radial-gradient(circle at 35% 30%, #8a2c26, #3a1311)"
                : "radial-gradient(circle at 35% 30%, #f7eccd, #9a7a45)",
              boxShadow: "inset 0 -1.5px 0 rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
            }} />
          ))}
          {captured.length === 0 && <span style={{ fontSize: 12, color: "var(--text-dim)" }}>—</span>}
        </div>
      </div>
    </div>
  );
}

function GamePage({ user, mode = "friend", difficulty = 800, onExit }) {
  const [board, setBoard] = useStateGame(Array.from({ length: 8 }, () => Array(8).fill(0)));
  const [turn, setTurn] = useStateGame(1);
  const [selected, setSelected] = useStateGame(null);
  const [moves, setMoves] = useStateGame([]);
  const [moveHistory, setMoveHistory] = useStateGame([]);
  const [hintFlash, setHintFlash] = useStateGame(null);
  const [showResign, setShowResign] = useStateGame(false);
  const [playerTime, setPlayerTime] = useStateGame(587);
  const [oppTime, setOppTime] = useStateGame(612);
  const [winner, setWinner] = useStateGame(null);
  const [botThinking, setBotThinking] = useStateGame(false);
  const isBotMode = mode === "bot";

  useEffectGame(() => {
    apiNewGame().then(data => {
      setBoard(data.board);
      setTurn(data.turn);
    });
  }, []);

  useEffectGame(() => {
    const id = setInterval(() => {
      if (turn === 1) setPlayerTime(t => Math.max(0, t - 1));
      else setOppTime(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [turn]);

  useEffectGame(() => {
    if (!isBotMode || turn !== 2 || winner || botThinking) return;
    setBotThinking(true);
    const minDelay = new Promise(r => setTimeout(r, 350));
    Promise.all([apiBotMove(difficulty, user?.id), minDelay]).then(([data]) => {
      setBotThinking(false);
      if (!data) return;
      setBoard(data.board);
      setTurn(data.turn);
      if (data.winner) setWinner(data.winner);
      if (data.moves && data.moves.length) {
        setMoveHistory(h => [...h, ...data.moves.map(m => ({ from: m.from, to: m.to, capture: m.capture, player: 2 }))]);
      }
    });
  }, [turn, isBotMode, winner]);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const captured = useMemoGame(() => {
    let pn = 0, on = 0;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      if (board[r][c] === 1 || board[r][c] === 3) pn++;
      if (board[r][c] === 2 || board[r][c] === 4) on++;
    }
    return { playerLost: 12 - pn, oppLost: 12 - on };
  }, [board]);

  async function anyCapureExists() {
    const beige = [1, 3], black = [2, 4];
    const currentColor = turn === 1 ? beige : black;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (!currentColor.includes(board[r][c])) continue;
        const ms = await apiGetValidMoves(r, c);
        if (ms.some(m => m.capture)) return true;
      }
    }
    return false;
  }

  async function clickSquare(r, c) {
    if (winner) return;
    if (isBotMode && (turn === 2 || botThinking)) return;

    if (selected) {
      const move = moves.find(m => m.to[0] === r && m.to[1] === c);
      if (move) {
        const data = await apiMakeMove(selected[0], selected[1], r, c, user?.id);
        if (data) {
          setBoard(data.board);
          setTurn(data.turn);
          setMoveHistory(h => [...h, { from: selected, to: [r, c], capture: !!move.capture, player: turn }]);
          if (data.winner) setWinner(data.winner);
          const nextMoves = await apiGetValidMoves(r, c);
          const hasMoreCaptures = nextMoves.some(m => m.capture);
          if (hasMoreCaptures) {
            setSelected([r, c]);
            setMoves(nextMoves);
          } else {
            setSelected(null);
            setMoves([]);
          }
        }
        return;
      }
    }

    const validMoves = await apiGetValidMoves(r, c);
    if (validMoves.length === 0) {
      setSelected(null);
      setMoves([]);
      return;
    }

    const captureRequired = await anyCapureExists();
    if (captureRequired && !validMoves.some(m => m.capture)) {
      setSelected(null);
      setMoves([]);
      return;
    }

    setSelected([r, c]);
    setMoves(validMoves);
  }

  async function showHint() {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const v = board[r][c];
        const owner = v === 0 ? 0 : (v === 1 || v === 3 ? 1 : 2);
        if (owner !== turn) continue;
        const ms = await apiGetValidMoves(r, c);
        if (ms.length > 0) {
          setSelected([r, c]);
          setMoves(ms);
          setHintFlash([r, c]);
          setTimeout(() => setHintFlash(null), 1200);
          return;
        }
      }
    }
  }

  // file/rank labels
  const files = ["a","b","c","d","e","f","g","h"];
  const ranks = [8,7,6,5,4,3,2,1];

  return (
    <div className="page" data-screen-label="03 Game" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 28px", borderBottom: "1px solid var(--line-soft)",
      }}>
        <button onClick={onExit} style={{
          display: "flex", alignItems: "center", gap: 8,
          color: "var(--text-mute)", fontSize: 14, fontWeight: 500,
          padding: "8px 12px", borderRadius: 8,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-elev-1)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-mute)"; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Exit game
        </button>

        {/* Turn indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          background: "var(--bg-elev-1)", border: "1px solid var(--line-soft)",
          padding: "8px 18px 8px 12px", borderRadius: 999,
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: "50%",
            background: turn === 1 ? "radial-gradient(circle at 35% 30%, #f7eccd, #9a7a45)" : "radial-gradient(circle at 35% 30%, #8a2c26, #3a1311)",
            boxShadow: "inset 0 -1.5px 0 rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
            transition: "background 240ms ease",
          }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>Turn</span>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>
              {turn === 1 ? "Your move" : (isBotMode ? (botThinking ? "Bot thinking…" : "Bot’s move") : "Opponent’s move")}
            </span>
          </div>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-dim)", paddingLeft: 12, borderLeft: "1px solid var(--line-soft)" }}>
            Move {moveHistory.length + 1}
          </span>
        </div>

        <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-dim)", letterSpacing: "0.08em" }}>
          {isBotMode ? `VS BOT · ${difficulty}` : "LOCAL HOTSEAT"}
        </div>
      </div>

      {/* Body */}
      <div style={{
        flex: 1, display: "grid", gridTemplateColumns: "1fr auto 1fr",
        gap: 32, padding: "32px 40px 24px", alignItems: "center", justifyItems: "center",
      }}>
        {/* Left = current player (you) */}
        <div style={{ justifySelf: "end" }}>
          <PlayerCard
            side="player"
            name={user?.user_metadata?.full_name || user?.email || "You"}
            rating=""
            country="You"
            color="oklch(0.7 0.1 65)"
            active={turn === 1}
            captured={Array(captured.oppLost).fill(0)}
            time={fmt(playerTime)}
          />
        </div>

        {/* Board */}
        <div style={{
          display: "grid", gridTemplateColumns: "20px auto 20px", gridTemplateRows: "20px auto 20px",
          gap: 6, alignItems: "center", justifyItems: "center",
        }}>
          <div />
          <FileLabels files={files} />
          <div />

          <RankLabels ranks={ranks} />
          <div style={{
            width: "min(72vh, 560px)", aspectRatio: "1 / 1",
            background: "linear-gradient(145deg, #2a1f15, #1a120c)",
            padding: 14, borderRadius: 8,
            border: "1px solid #3a2c20",
            boxShadow: "0 40px 100px -30px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,220,160,0.04) inset, 0 1px 0 rgba(255,220,160,0.08) inset",
          }}>
            <div style={{
              width: "100%", height: "100%",
              display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gridTemplateRows: "repeat(8, 1fr)",
              borderRadius: 3, overflow: "hidden",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.5)",
            }}>
              {board.map((row, r) => row.map((cell, c) => {
                const dark = (r + c) % 2 === 1;
                const isSel = selected && selected[0] === r && selected[1] === c;
                const moveHere = moves.find(m => m.to[0] === r && m.to[1] === c);
                const isHint = hintFlash && hintFlash[0] === r && hintFlash[1] === c;
                return (
                  <button key={`${r}-${c}`} onClick={() => clickSquare(r, c)} style={{
                    background: dark
                      ? "linear-gradient(135deg, #5a3820 0%, #3e2614 100%)"
                      : "linear-gradient(135deg, #c69968 0%, #a47b48 100%)",
                    position: "relative", padding: 0, border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: dark ? "pointer" : "default",
                    outline: isHint ? "2px solid var(--accent)" : "none",
                    outlineOffset: -2,
                    boxShadow: dark ? "inset 0 0 12px rgba(0,0,0,0.35)" : "inset 0 0 8px rgba(255,220,160,0.08)",
                  }}>
                    {/* move/cap indicator */}
                    {moveHere && (
                      <span style={{
                        position: "absolute", inset: 0, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        pointerEvents: "none",
                      }}>
                        {moveHere.capture ? (
                          <span style={{
                            width: "78%", aspectRatio: "1 / 1", borderRadius: "50%",
                            border: "3px solid var(--accent)",
                            boxShadow: "0 0 18px oklch(0.7 0.1 65 / 0.55)",
                          }} />
                        ) : (
                          <span style={{
                            width: "26%", aspectRatio: "1 / 1", borderRadius: "50%",
                            background: "var(--accent)", opacity: 0.55,
                          }} />
                        )}
                      </span>
                    )}
                    {cell !== 0 && <Piece kind={cell} selected={isSel} />}
                  </button>
                );
              }))}
            </div>
          </div>
          <RankLabels ranks={ranks} />

          <div />
          <FileLabels files={files} />
          <div />
        </div>

        {/* Right = opponent */}
        <div style={{ justifySelf: "start" }}>
          <PlayerCard
            side="opp"
            name={isBotMode ? `Bot · ${ratingTier(difficulty)}` : "Player 2"}
            rating={isBotMode ? String(difficulty) : ""}
            country={isBotMode ? "Bot" : "Local"}
            color="oklch(0.55 0.14 25)"
            active={turn === 2}
            captured={Array(captured.playerLost).fill(0)}
            time={fmt(oppTime)}
          />
        </div>
      </div>

      {/* Bottom action bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 12, padding: "20px 32px 28px",
      }}>
        <ActionButton onClick={showHint} kind="primary"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M2 12h2"/><path d="m17.66 6.34 1.41-1.41"/><path d="M20 12h2"/><path d="M12 6a6 6 0 0 0-3 11.2V20a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2.8A6 6 0 0 0 12 6Z"/></svg>}
        >
          Hint
          <kbd style={{ fontFamily: "var(--mono)", fontSize: 10.5, padding: "1.5px 5px", border: "1px solid currentColor", borderRadius: 4, opacity: 0.6, marginLeft: 4 }}>H</kbd>
        </ActionButton>
        <ActionButton onClick={() => {}} kind="ghost"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/></svg>}
        >Undo</ActionButton>
        <ActionButton onClick={() => {}} kind="ghost"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5l7 7-7 7v-4H3V9z"/></svg>}
        >Offer draw</ActionButton>
        <ActionButton onClick={() => setShowResign(true)} kind="danger"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4"/><path d="M4 4h13l-2 5 2 5H4"/></svg>}
        >Resign</ActionButton>
      </div>

      {/* Resign confirmation */}
      {showResign && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(10,10,20,0.6)",
          backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 50,
        }} onClick={() => setShowResign(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "var(--bg-elev-1)", border: "1px solid var(--line)",
            borderRadius: 18, padding: 28, width: 380,
            boxShadow: "0 40px 80px -20px rgba(0,0,0,0.6)",
          }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em" }}>Resign this game?</h3>
            <p style={{ margin: "0 0 22px", fontSize: 13.5, color: "var(--text-mute)", lineHeight: 1.55 }}>
              You'll forfeit the match and lose 12 rating points. This can't be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowResign(false)} style={{
                padding: "10px 16px", borderRadius: 10,
                background: "var(--bg-elev-3)", color: "var(--text)",
                fontWeight: 600, fontSize: 13.5,
              }}>Keep playing</button>
              <button onClick={onExit} style={{
                padding: "10px 16px", borderRadius: 10,
                background: "oklch(0.6 0.18 25)", color: "#fff",
                fontWeight: 600, fontSize: 13.5,
              }}>Resign</button>
            </div>
          </div>
        </div>
      )}

      {/* Winner overlay */}
      {winner && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(10,10,20,0.7)",
          backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 50,
        }}>
          <div style={{
            background: "var(--bg-elev-1)", border: "1px solid var(--line)",
            borderRadius: 20, padding: 40, width: 400, textAlign: "center",
            boxShadow: "0 40px 80px -20px rgba(0,0,0,0.7)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {winner === "BEIGE" ? "♛" : "♚"}
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>
              {winner === "BEIGE" ? "Ivory Wins" : "Crimson Wins"}
            </h2>
            <p style={{ margin: "0 0 28px", color: "var(--text-mute)", fontSize: 14 }}>
              Game over
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={async () => {
                const data = await apiNewGame();
                setBoard(data.board);
                setTurn(data.turn);
                setWinner(null);
                setSelected(null);
                setMoves([]);
                setMoveHistory([]);
                setPlayerTime(587);
                setOppTime(612);
                setBotThinking(false);
              }} style={{
                padding: "12px 24px", borderRadius: 12,
                background: "var(--accent)", color: "#14110d",
                fontWeight: 700, fontSize: 14,
              }}>Play again</button>
              <button onClick={onExit} style={{
                padding: "12px 24px", borderRadius: 12,
                background: "var(--bg-elev-3)", color: "var(--text)",
                fontWeight: 600, fontSize: 14,
              }}>Exit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FileLabels({ files }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", width: "min(72vh, 560px)", padding: "0 10px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-dim)" }}>
      {files.map(f => <div key={f} style={{ textAlign: "center" }}>{f}</div>)}
    </div>
  );
}
function RankLabels({ ranks }) {
  return (
    <div style={{ display: "grid", gridTemplateRows: "repeat(8, 1fr)", height: "min(72vh, 560px)", padding: "10px 0", fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-dim)", alignItems: "center", justifyItems: "center" }}>
      {ranks.map(r => <div key={r}>{r}</div>)}
    </div>
  );
}

function ActionButton({ children, icon, onClick, kind }) {
  const styles = {
    primary: { bg: "var(--accent)", color: "#14110d", border: "transparent" },
    ghost: { bg: "var(--bg-elev-1)", color: "var(--text)", border: "var(--line-soft)" },
    danger: { bg: "transparent", color: "oklch(0.78 0.14 25)", border: "oklch(0.78 0.14 25 / 0.4)" },
  }[kind];
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "11px 18px", borderRadius: 12,
      background: styles.bg, color: styles.color,
      border: `1px solid ${styles.border}`,
      fontWeight: 600, fontSize: 13.5, letterSpacing: "-0.005em",
      transition: "transform 120ms ease, filter 120ms ease",
    }}
      onMouseDown={e => e.currentTarget.style.transform = "translateY(1px)"}
      onMouseUp={e => e.currentTarget.style.transform = "translateY(0)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
      onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
    >
      {icon}
      {children}
    </button>
  );
}

function ratingTier(v) {
  if (v < 500) return "Beginner";
  if (v < 1000) return "Casual";
  if (v < 1500) return "Intermediate";
  if (v < 1800) return "Expert";
  return "Master";
}

window.GamePage = GamePage;
