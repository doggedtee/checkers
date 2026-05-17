// Game page — interactive checkers board
const { useState: useStateGame, useMemo: useMemoGame, useEffect: useEffectGame, useRef: useRefGame } = React;

const API = window.API_BASE || window.location.origin;
const DEFAULT_GAME_ID = 'game1';

async function apiNewGame(gameId = DEFAULT_GAME_ID) {
  const res = await fetch(`${API}/game/new?game_id=${gameId}`, { method: 'POST' });
  return res.json();
}

async function apiGetBoard(gameId = DEFAULT_GAME_ID) {
  const res = await fetch(`${API}/game/${gameId}/board`);
  if (!res.ok) return null;
  return res.json();
}

async function apiGetValidMoves(row, col, gameId = DEFAULT_GAME_ID) {
  const res = await fetch(`${API}/game/${gameId}/valid-moves?row=${row}&col=${col}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.moves.map(m => m.length === 4
    ? { to: [m[0], m[1]], capture: [m[2], m[3]] }
    : { to: [m[0], m[1]], capture: null }
  );
}

async function apiMakeMove(pieceRow, pieceCol, toRow, toCol, userId = null, region = null, gameId = DEFAULT_GAME_ID) {
  const res = await fetch(`${API}/game/${gameId}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ piece_row: pieceRow, piece_col: pieceCol, to_row: toRow, to_col: toCol, user_id: userId, region }),
  });
  if (!res.ok) return null;
  return res.json();
}

async function apiBotMove(difficulty, userId = null, region = null, gameId = DEFAULT_GAME_ID) {
  const params = new URLSearchParams({ difficulty: String(difficulty) });
  if (userId) params.append("user_id", userId);
  if (region) params.append("region", region);
  const res = await fetch(`${API}/game/${gameId}/bot-move?${params.toString()}`, { method: 'POST' });
  if (!res.ok) return null;
  return res.json();
}

async function apiUndo(steps = 1, gameId = DEFAULT_GAME_ID) {
  const res = await fetch(`${API}/game/${gameId}/undo?steps=${steps}`, { method: 'POST' });
  if (!res.ok) return null;
  return res.json();
}

async function apiEndGame(winner, userId = null, region = null, gameId = DEFAULT_GAME_ID) {
  const res = await fetch(`${API}/game/${gameId}/end`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ winner, user_id: userId, region }),
  });
  if (!res.ok) return null;
  return res.json();
}

function Piece({ kind, selected, ghost, palette, smooth = true, playerAvatarUrl }) {
  // kind: 1 player, 2 opp, 3 player-king, 4 opp-king
  const isPlayer = kind === 1 || kind === 3;
  const isKing = kind === 3 || kind === 4;
  const p = palette || BOARD_THEMES_GAME.wood;
  const base = isPlayer ? p.player : p.opp;
  const useAvatar = isPlayer && playerAvatarUrl;
  return (
    <div style={{
      width: "78%", aspectRatio: "1 / 1", borderRadius: "50%",
      background: useAvatar
        ? `center/cover no-repeat url(${playerAvatarUrl})`
        : `radial-gradient(circle at 35% 30%, ${base.hi} 0%, ${base.mid} 45%, ${base.low} 100%)`,
      boxShadow: `inset 0 -4px 0 ${base.ring}, inset 0 2px 1px rgba(255,255,255,0.18), 0 5px 14px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.04)${selected ? ", 0 0 0 2px var(--accent), 0 0 28px oklch(0.7 0.1 65 / 0.5)" : ""}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative",
      transition: smooth ? "box-shadow 160ms ease, transform 160ms ease" : "none",
      transform: selected ? "translateY(-2px)" : "none",
      opacity: ghost ? 0.4 : 1,
      overflow: "hidden",
    }}>
      {useAvatar
        ? <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(0,0,0,0.25) 100%)", borderRadius: "50%" }} />
        : <div style={{ width: "64%", aspectRatio: "1 / 1", borderRadius: "50%", border: `1px solid ${base.dot}`, opacity: 0.35, boxShadow: `inset 0 0 8px ${base.inner}` }} />
      }
      {isKing && (
        <svg style={{ position: "absolute", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} width="42%" viewBox="0 0 24 24" fill={useAvatar ? "rgba(255,220,100,0.95)" : base.kingFill}>
          <path d="M3 8l4 4 5-7 5 7 4-4-2 10H5z" />
        </svg>
      )}
    </div>
  );
}

function PlayerCard({ side, name, rating, country, color, active, captured, time, showTimer = true, palette }) {
  const p = palette || BOARD_THEMES_GAME.wood;
  const capPiece = side === "player" ? p.opp : p.player;
  return (
    <div className="r-player-card" style={{
      background: active
        ? "linear-gradient(160deg, oklch(0.22 0.04 65) 0%, var(--bg-elev-1) 60%)"
        : "var(--bg-elev-1)",
      border: `1px solid ${active ? "var(--accent)" : "var(--line-soft)"}`,
      borderRadius: 16, padding: 18,
      display: "flex", flexDirection: "column", gap: 14,
      minWidth: 220, position: "relative",
      transition: "background 240ms ease, border-color 200ms ease, box-shadow 200ms ease",
      boxShadow: active
        ? "0 0 0 1px var(--accent), 0 8px 30px -10px oklch(0.7 0.1 65 / 0.4), inset 0 0 40px oklch(0.7 0.1 65 / 0.06)"
        : "none",
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
      {showTimer && (
        <div style={{
          display: "flex", alignItems: "baseline", justifyContent: "space-between",
          padding: "10px 12px", borderRadius: 10,
          background: active ? "var(--accent-soft)" : "var(--bg-elev-2)",
          border: "1px solid var(--line-soft)",
        }}>
          <span style={{ fontSize: 11, color: "var(--text-mute)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Time</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 600, color: active ? "var(--accent)" : "var(--text)", letterSpacing: "0.02em" }}>{time}</span>
        </div>
      )}

      {/* captured row */}
      <div>
        <div style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Captured · {captured.length}</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", minHeight: 22 }}>
          {captured.map((_, i) => (
            <span key={i} style={{
              width: 18, height: 18, borderRadius: "50%",
              background: `radial-gradient(circle at 35% 30%, ${capPiece.hi}, ${capPiece.low})`,
              boxShadow: "inset 0 -1.5px 0 rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
            }} />
          ))}
          {captured.length === 0 && <span style={{ fontSize: 12, color: "var(--text-dim)" }}>—</span>}
        </div>
      </div>
    </div>
  );
}

const BOARD_THEMES_GAME = {
  wood: {
    light: "#c69968", lightDark: "#a47b48", dark: "#5a3820", darkDark: "#3e2614",
    player: { hi: "#f7eccd", mid: "#d9c290", low: "#9a7a45", ring: "#6e5526", dot: "#4d3a18", inner: "#a07c44", kingFill: "#5a4520" },
    opp:    { hi: "#8a2c26", mid: "#5a1a16", low: "#2a0c0a", ring: "#1a0807", dot: "#1a0807", inner: "#3a1311", kingFill: "#1a0807" },
  },
  neon: {
    light: "#3a3580", lightDark: "#2a2566", dark: "#1a1340", darkDark: "#0e0a2a",
    player: { hi: "#a8fffb", mid: "#3df0ea", low: "#0a8a85", ring: "#076a66", dot: "#03403e", inner: "#1aa19c", kingFill: "#0a3b39" },
    opp:    { hi: "#ffb1ff", mid: "#d44dff", low: "#7a13ad", ring: "#530a78", dot: "#2a043e", inner: "#9a1fd0", kingFill: "#3a0855" },
  },
  obsidian: {
    light: "#3a3a44", lightDark: "#2a2a32", dark: "#16161c", darkDark: "#0c0c10",
    player: { hi: "#f4f4f6", mid: "#cfcfd4", low: "#7a7a82", ring: "#5a5a62", dot: "#3a3a40", inner: "#8a8a92", kingFill: "#5a5a62" },
    opp:    { hi: "#5a5a64", mid: "#3a3a42", low: "#1a1a20", ring: "#0e0e12", dot: "#0a0a0e", inner: "#26262c", kingFill: "#0a0a0e" },
  },
};

function GamePage({ user, profile, mode = "friend", difficulty = 800, roomCode = null, role = null, onExit, onReview }) {
  const isBotMode = mode === "bot";
  const isMpMode = mode === "multiplayer";
  const [gameId] = useStateGame(() =>
    isMpMode && roomCode ? roomCode : `game_${(user?.id || 'anon').replace(/-/g, '').slice(0, 12)}_${Date.now()}`
  );
  const myColor = isMpMode ? (role === "host" ? 1 : 2) : null; // 1=BEIGE, 2=BLACK
  const mpChannelRef = useRefGame(null);
  const [settings, setSettings] = useStateGame(() =>
    (typeof window !== "undefined" && window.getCheckersSettings)
      ? window.getCheckersSettings()
      : { theme: "wood", hints: true, smooth: true, flip: false }
  );

  useEffectGame(() => {
    const onChange = (e) => setSettings(prev => ({ ...prev, ...e.detail }));
    window.addEventListener("checkers:settings-changed", onChange);
    return () => window.removeEventListener("checkers:settings-changed", onChange);
  }, []);

  const theme = BOARD_THEMES_GAME[settings.theme] || BOARD_THEMES_GAME.wood;
  const userRegion = user?.user_metadata?.region || null;

  const [board, setBoard] = useStateGame(Array.from({ length: 8 }, () => Array(8).fill(0)));
  const [turn, setTurn] = useStateGame(1);
  const [selected, setSelected] = useStateGame(null);
  const [moves, setMoves] = useStateGame([]);
  const [moveHistory, setMoveHistory] = useStateGame([]);
  const [hintFlash, setHintFlash] = useStateGame(null);
  const [captureTrail, setCaptureTrail] = useStateGame([]);
  const trailTimeoutRef = useRefGame(null);
  const [showResign, setShowResign] = useStateGame(false);
  const [playerTime, setPlayerTime] = useStateGame(isBotMode ? 0 : 180);
  const [oppTime, setOppTime] = useStateGame(isBotMode ? 0 : 180);
  const [winner, setWinner] = useStateGame(null);
  const [botThinking, setBotThinking] = useStateGame(false);

  useEffectGame(() => {
    if (isMpMode) {
      // Host already created the room via the modal. Guest just fetches state.
      apiGetBoard(gameId).then(data => {
        if (data) { setBoard(data.board); setTurn(data.turn); }
      });
    } else {
      apiNewGame(gameId).then(data => {
        setBoard(data.board);
        setTurn(data.turn);
      });
    }
  }, []);

  // Multiplayer realtime sync: subscribe to the room channel and listen for the
  // opponent's moves. When we receive a "move" broadcast we refetch the board
  // from the canonical server state.
  useEffectGame(() => {
    if (!isMpMode || !roomCode) return;
    const client = window.supabaseClient;
    if (!client) return;
    const channel = client.channel(`room:${roomCode}`, {
      config: { presence: { key: user?.id || `${role}-${roomCode}` } },
    });
    mpChannelRef.current = channel;
    channel.on("broadcast", { event: "move" }, () => {
      apiGetBoard(gameId).then(data => {
        if (!data) return;
        setBoard(data.board);
        setTurn(data.turn);
        if (data.winner) setWinner(data.winner);
        setSelected(null);
        setMoves([]);
      });
    });
    channel.on("broadcast", { event: "end" }, ({ payload }) => {
      setWinner(payload?.winner || "DRAW");
    });
    channel.subscribe(async (s) => {
      if (s === "SUBSCRIBED") {
        await channel.track({ role, at: Date.now() });
      }
    });
    return () => { try { channel.unsubscribe(); } catch (_) {} };
  }, [isMpMode, roomCode]);

  useEffectGame(() => {
    if (window.checkersAudio) {
      window.checkersAudio.refresh();
      window.checkersAudio.startMusic();
    }
    return () => {
      if (window.checkersAudio) window.checkersAudio.stopMusic();
    };
  }, []);

  useEffectGame(() => {
    if (!winner || !window.checkersAudio) return;
    if (winner === "BEIGE") window.checkersAudio.playWin();
    else if (winner === "BLACK") window.checkersAudio.playLoss();
  }, [winner]);

  useEffectGame(() => {
    if (isBotMode || winner) return;
    // In multiplayer the "player" timer is the one for myColor; in local hotseat
    // it's whichever side is currently moving.
    const myTurnIsActive = isMpMode ? (turn === myColor) : (turn === 1);
    const id = setInterval(() => {
      if (myTurnIsActive) {
        setPlayerTime(t => {
          const next = Math.max(0, t - 1);
          if (next === 0) setWinner(isMpMode ? (myColor === 1 ? "BLACK" : "BEIGE") : "BLACK");
          return next;
        });
      } else {
        setOppTime(t => {
          const next = Math.max(0, t - 1);
          if (next === 0) setWinner(isMpMode ? (myColor === 1 ? "BEIGE" : "BLACK") : "BEIGE");
          return next;
        });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [turn, isBotMode, winner, isMpMode, myColor]);

  useEffectGame(() => {
    if (!isBotMode || turn !== 2 || winner || botThinking) return;
    setBotThinking(true);
    const minDelay = new Promise(r => setTimeout(r, 350));
    Promise.all([apiBotMove(difficulty, user?.id, userRegion, gameId), minDelay]).then(([data]) => {
      setBotThinking(false);
      if (!data) return;
      if (window.checkersAudio && data.moves && data.moves.length) {
        const anyCapture = data.moves.some(m => m.capture);
        if (anyCapture) window.checkersAudio.playCapture();
        else window.checkersAudio.playMove();
      }
      if (settings.trail && data.moves && data.moves.length) {
        const squares = [];
        data.moves.forEach(m => {
          if (m.capture && m.from && m.to) {
            const cr = Math.round((m.from[0] + m.to[0]) / 2);
            const cc = Math.round((m.from[1] + m.to[1]) / 2);
            squares.push(m.from, [cr, cc], m.to);
          }
        });
        if (squares.length) {
          setCaptureTrail(squares);
          if (trailTimeoutRef.current) clearTimeout(trailTimeoutRef.current);
          trailTimeoutRef.current = setTimeout(() => setCaptureTrail([]), 1600);
        }
      }
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
        const ms = await apiGetValidMoves(r, c, gameId);
        if (ms.some(m => m.capture)) return true;
      }
    }
    return false;
  }

  function broadcastMove() {
    const ch = mpChannelRef.current;
    if (!ch) return;
    try { ch.send({ type: "broadcast", event: "move", payload: { at: Date.now() } }); } catch (_) {}
  }

  async function clickSquare(r, c) {
    if (winner) return;
    if (isBotMode && (turn === 2 || botThinking)) return;
    if (isMpMode && turn !== myColor) return;

    if (selected) {
      const move = moves.find(m => m.to[0] === r && m.to[1] === c);
      if (move) {
        const data = await apiMakeMove(selected[0], selected[1], r, c, user?.id, userRegion, gameId);
        if (data) {
          if (window.checkersAudio) {
            if (move.capture) window.checkersAudio.playCapture();
            else window.checkersAudio.playMove();
          }
          if (settings.trail && move.capture) {
            const cr = Math.round((selected[0] + r) / 2);
            const cc = Math.round((selected[1] + c) / 2);
            const newSquares = [selected, [cr, cc], [r, c]];
            setCaptureTrail(prev => [...prev, ...newSquares]);
            if (trailTimeoutRef.current) clearTimeout(trailTimeoutRef.current);
            trailTimeoutRef.current = setTimeout(() => setCaptureTrail([]), 1600);
          }
          setBoard(data.board);
          setTurn(data.turn);
          setMoveHistory(h => [...h, { from: selected, to: [r, c], capture: !!move.capture, player: turn }]);
          if (data.winner) setWinner(data.winner);
          const nextMoves = await apiGetValidMoves(r, c, gameId);
          const hasMoreCaptures = nextMoves.some(m => m.capture);
          if (hasMoreCaptures) {
            setSelected([r, c]);
            setMoves(nextMoves);
          } else {
            setSelected(null);
            setMoves([]);
            if (isMpMode) broadcastMove();
          }
        }
        return;
      }
    }

    const validMoves = await apiGetValidMoves(r, c, gameId);
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

  async function handleUndo() {
    if (winner || botThinking) return;
    if (isMpMode) return; // undo disabled in multiplayer
    // In bot mode, undo both bot's reply + player's last move so player can re-play
    const steps = isBotMode && turn === 1 ? 2 : 1;
    const data = await apiUndo(steps, gameId);
    if (!data || !data.ok) return;
    setBoard(data.board);
    setTurn(data.turn);
    setSelected(null);
    setMoves([]);
    setMoveHistory(h => h.slice(0, Math.max(0, h.length - steps)));
  }

  function broadcastEnd(winnerCode) {
    const ch = mpChannelRef.current;
    if (!ch) return;
    try { ch.send({ type: "broadcast", event: "end", payload: { winner: winnerCode } }); } catch (_) {}
  }

  function handleOfferDraw() {
    if (winner) return;
    setWinner("DRAW");
    apiEndGame("DRAW", user?.id, userRegion, gameId);
    if (isMpMode) broadcastEnd("DRAW");
  }

  function handleResign() {
    if (winner) return;
    // In MP, my color loses; in local/bot, beige loses (player POV)
    const losingColor = isMpMode ? (myColor === 1 ? "BLACK" : "BEIGE") : "BLACK";
    setWinner(losingColor);
    apiEndGame(losingColor, user?.id, userRegion, gameId);
    if (isMpMode) broadcastEnd(losingColor);
  }

  async function showHint() {
    const myTurnColor = isMpMode ? myColor : turn;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const v = board[r][c];
        const owner = v === 0 ? 0 : (v === 1 || v === 3 ? 1 : 2);
        if (owner !== myTurnColor) continue;
        const ms = await apiGetValidMoves(r, c, gameId);
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
    <div className="page r-game" data-screen-label="03 Game" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      <style>{`
        @keyframes trailFade {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
      {/* Top bar */}
      <div className="r-game-topbar" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 28px", borderBottom: "1px solid var(--line-soft)", gap: 12, flexWrap: "wrap",
      }}>
        <div className="r-game-spacer" style={{ width: 120 }} />

        {/* Turn indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          background: "var(--bg-elev-1)", border: "1px solid var(--line-soft)",
          padding: "8px 18px 8px 12px", borderRadius: 999,
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: "50%",
            background: `radial-gradient(circle at 35% 30%, ${(turn === 1 ? theme.player : theme.opp).hi} 0%, ${(turn === 1 ? theme.player : theme.opp).mid} 45%, ${(turn === 1 ? theme.player : theme.opp).low} 100%)`,
            boxShadow: `inset 0 -2.5px 0 ${(turn === 1 ? theme.player : theme.opp).ring}, inset 0 1.5px 1px rgba(255,255,255,0.18), 0 3px 8px rgba(0,0,0,0.55)`,
            transition: "background 240ms ease, box-shadow 240ms ease",
          }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>Turn</span>
            <span style={{
              fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em",
              color: turn === 1 ? "var(--accent)" : "var(--text)",
              textShadow: turn === 1 ? "0 0 16px oklch(0.7 0.1 65 / 0.5)" : "none",
              transition: "color 240ms ease",
            }}>
              {isMpMode
                ? (turn === myColor ? "Your move" : "Opponent’s move")
                : (turn === 1
                  ? `${(user?.user_metadata?.full_name || user?.email || "Your").split(" ")[0].split("@")[0]}'s move`
                  : (isBotMode ? (botThinking ? "Bot thinking…" : "Bot’s move") : "Opponent’s move"))}
            </span>
          </div>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-dim)", paddingLeft: 12, borderLeft: "1px solid var(--line-soft)" }}>
            Move {moveHistory.length + 1}
          </span>
        </div>

        <div className="r-game-mode" style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-dim)", letterSpacing: "0.08em" }}>
          {isBotMode ? `VS BOT · ${difficulty}` : (isMpMode ? `ROOM · ${roomCode}` : "LOCAL HOTSEAT")}
        </div>
      </div>

      {/* Body */}
      <div className="r-game-body" style={{
        flex: 1, display: "grid", gridTemplateColumns: "1fr auto 1fr",
        gap: 32, padding: "32px 40px 24px", alignItems: "center", justifyItems: "center",
      }}>
        {/* Left = local player (you) */}
        <div className="r-player-left" style={{ justifySelf: "end" }}>
          <PlayerCard
            side={isMpMode && myColor === 2 ? "opp" : "player"}
            name={user?.user_metadata?.full_name || user?.email || "You"}
            rating=""
            country="You"
            color="oklch(0.7 0.1 65)"
            active={isMpMode ? (turn === myColor) : (turn === 1)}
            captured={Array(isMpMode && myColor === 2 ? captured.playerLost : captured.oppLost).fill(0)}
            time={fmt(playerTime)}
            showTimer={!isBotMode}
            palette={theme}
          />
        </div>

        {/* Board */}
        <div className="r-board-wrap" style={{
          display: "grid", gridTemplateColumns: "20px auto 20px", gridTemplateRows: "20px auto 20px",
          gap: 10, alignItems: "center", justifyItems: "center",
        }}>
          <div />
          <FileLabels files={files} />
          <div />

          <RankLabels ranks={ranks} />
          <div className="r-board" style={{
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
              {(() => {
                const flipForOpp = (isMpMode && myColor === 2) || (settings.flip && !isBotMode && !isMpMode && turn === 2);
                const rowOrder = flipForOpp ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];
                const colOrder = flipForOpp ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];
                return rowOrder.map(r => colOrder.map(c => {
                  const cell = board[r][c];
                const dark = (r + c) % 2 === 1;
                const isSel = selected && selected[0] === r && selected[1] === c;
                const moveHere = moves.find(m => m.to[0] === r && m.to[1] === c);
                const isHint = hintFlash && hintFlash[0] === r && hintFlash[1] === c;
                const onTrail = settings.trail && captureTrail.some(([tr, tc]) => tr === r && tc === c);
                return (
                  <button key={`${r}-${c}`} onClick={() => clickSquare(r, c)} style={{
                    background: dark
                      ? `linear-gradient(135deg, ${theme.dark} 0%, ${theme.darkDark} 100%)`
                      : `linear-gradient(135deg, ${theme.light} 0%, ${theme.lightDark} 100%)`,
                    position: "relative", padding: 0, border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: dark ? "pointer" : "default",
                    outline: isHint ? "2px solid var(--accent)" : "none",
                    outlineOffset: -2,
                    boxShadow: dark ? "inset 0 0 12px rgba(0,0,0,0.35)" : "inset 0 0 8px rgba(255,220,160,0.08)",
                  }}>
                    {/* move/cap indicator */}
                    {moveHere && settings.hints && (
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
                    {onTrail && (
                      <span aria-hidden style={{
                        position: "absolute", inset: 0,
                        background: "radial-gradient(circle, oklch(0.7 0.1 65 / 0.4) 0%, transparent 65%)",
                        animation: "trailFade 1600ms ease-out both",
                        pointerEvents: "none",
                      }}/>
                    )}
                    {cell !== 0 && <Piece kind={cell} selected={isSel} palette={theme} smooth={settings.smooth} playerAvatarUrl={profile?.avatar_url || null} />}
                  </button>
                );
                }));
              })()}
            </div>
          </div>
          <RankLabels ranks={ranks} />

          <div />
          <FileLabels files={files} />
          <div />
        </div>

        {/* Right = opponent */}
        <div className="r-player-right" style={{ justifySelf: "start" }}>
          <PlayerCard
            side={isMpMode && myColor === 2 ? "player" : "opp"}
            name={isBotMode ? `Bot · ${ratingTier(difficulty)}` : (isMpMode ? "Opponent" : "Player 2")}
            rating={isBotMode ? String(difficulty) : ""}
            country={isBotMode ? "Bot" : (isMpMode ? `Room ${roomCode}` : "Local")}
            color="oklch(0.55 0.14 25)"
            active={isMpMode ? (turn !== myColor) : (turn === 2)}
            captured={Array(isMpMode && myColor === 2 ? captured.oppLost : captured.playerLost).fill(0)}
            time={fmt(oppTime)}
            showTimer={!isBotMode}
            palette={theme}
          />
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="r-game-actions" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 12, padding: "20px 32px 28px", flexWrap: "wrap",
      }}>
        {settings.hints && (
          <ActionButton onClick={showHint} kind="hint"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M2 12h2"/><path d="m17.66 6.34 1.41-1.41"/><path d="M20 12h2"/><path d="M12 6a6 6 0 0 0-3 11.2V20a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2.8A6 6 0 0 0 12 6Z"/></svg>}
          >
            Hint
            <kbd style={{ fontFamily: "var(--mono)", fontSize: 10.5, padding: "1.5px 5px", border: "1px solid currentColor", borderRadius: 4, opacity: 0.6, marginLeft: 4 }}>H</kbd>
          </ActionButton>
        )}
        {!isMpMode && <ActionButton onClick={handleUndo} kind="ghost"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/></svg>}
        >Undo</ActionButton>}
        <ActionButton onClick={handleOfferDraw} kind="ghost"
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
          <div onClick={(e) => e.stopPropagation()} className="r-modal" style={{
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
              <button onClick={() => { setShowResign(false); handleResign(); }} style={{
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
          <div className="r-modal" style={{
            background: "var(--bg-elev-1)", border: "1px solid var(--line)",
            borderRadius: 20, padding: 40, width: 400, textAlign: "center",
            boxShadow: "0 40px 80px -20px rgba(0,0,0,0.7)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {winner === "DRAW" ? "🤝" : (winner === "BEIGE" ? "♛" : "♚")}
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>
              {winner === "DRAW"
                ? "Draw"
                : (isMpMode
                  ? ((winner === "BEIGE" && myColor === 1) || (winner === "BLACK" && myColor === 2) ? "You win" : "You lost")
                  : (winner === "BEIGE" ? "Ivory Wins" : "Crimson Wins"))}
            </h2>
            <p style={{ margin: "0 0 28px", color: "var(--text-mute)", fontSize: 14 }}>
              {winner === "DRAW" ? "Game ended by agreement" : "Game over"}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {!isMpMode && <button onClick={async () => {
                const data = await apiNewGame(gameId);
                setBoard(data.board);
                setTurn(data.turn);
                setWinner(null);
                setSelected(null);
                setMoves([]);
                setMoveHistory([]);
                setPlayerTime(isBotMode ? 0 : 180);
                setOppTime(isBotMode ? 0 : 180);
                setBotThinking(false);
              }} style={{
                padding: "12px 24px", borderRadius: 12,
                background: "var(--accent)", color: "#14110d",
                fontWeight: 700, fontSize: 14,
              }}>Play again</button>}
              <button onClick={() => {
                if (!onReview) return;
                const playerName = user?.user_metadata?.full_name || profile?.display_name || user?.email?.split("@")[0] || "You";
                const oppName = isBotMode ? `Bot · ${ratingTier(difficulty)}` : (isMpMode ? "Opponent" : "Player 2");
                const myWon = isMpMode
                  ? ((winner === "BEIGE" && myColor === 1) || (winner === "BLACK" && myColor === 2))
                  : (winner === "BEIGE");
                const result = winner === "DRAW" ? "draw" : (myWon ? "win" : "loss");
                const lastMove = moveHistory[moveHistory.length - 1];
                const trail = lastMove ? [
                  { r: lastMove.from[0], c: lastMove.from[1] },
                  { r: lastMove.to[0],   c: lastMove.to[1]   },
                ] : [];
                // Map our 1=player/2=opp board into the review's same scheme;
                // for MP guests our pieces are color 2, so swap so player == 1 in the review.
                const reviewBoard = (isMpMode && myColor === 2)
                  ? board.map(row => row.map(v => v === 0 ? 0 : (v === 1 ? 2 : v === 2 ? 1 : v === 3 ? 4 : 3)))
                  : board;
                const totalMoves = moveHistory.length;
                const myCaps  = isMpMode && myColor === 2 ? captured.playerLost : captured.oppLost;
                const myLost  = isMpMode && myColor === 2 ? captured.oppLost    : captured.playerLost;
                onReview({
                  board: reviewBoard,
                  trail,
                  match: {
                    player:   { name: playerName, rating: 842, color: "oklch(0.78 0.12 65)" },
                    opponent: { name: oppName,    rating: isBotMode ? difficulty : 1000, color: "oklch(0.45 0.13 25)" },
                    accuracy: Math.max(40, 100 - myLost * 6),
                    captured: myCaps,
                    lost:     myLost,
                    duration: fmt(Math.max(0, 180 - playerTime + 180 - oppTime)),
                    moves:    totalMoves || 1,
                    result,
                    ratingDelta: result === "win" ? 12 : (result === "loss" ? -14 : 0),
                    blunderMove: Math.max(1, Math.floor(totalMoves * 0.7)),
                  },
                });
              }} style={{
                padding: "12px 24px", borderRadius: 12,
                background: "var(--accent)", color: "#14110d",
                fontWeight: 700, fontSize: 14,
              }}>Review game</button>
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
    <div className="r-files" style={{
      display: "grid", gridTemplateColumns: "repeat(8, 1fr)",
      width: "min(72vh, 560px)", padding: "0 10px",
      fontFamily: "var(--mono)", fontSize: 10.5,
      color: "var(--text-mute)", fontWeight: 600,
      letterSpacing: "0.06em", textTransform: "lowercase",
    }}>
      {files.map(f => <div key={f} style={{ textAlign: "center" }}>{f}</div>)}
    </div>
  );
}
function RankLabels({ ranks }) {
  return (
    <div className="r-ranks" style={{
      display: "grid", gridTemplateRows: "repeat(8, 1fr)",
      height: "min(72vh, 560px)", padding: "10px 0",
      fontFamily: "var(--mono)", fontSize: 10.5,
      color: "var(--text-mute)", fontWeight: 600,
      letterSpacing: "0.06em",
      alignItems: "center", justifyItems: "center",
    }}>
      {ranks.map(r => <div key={r}>{r}</div>)}
    </div>
  );
}

function ActionButton({ children, icon, onClick, kind }) {
  const styles = {
    hint:   { bg: "var(--bg-elev-1)", color: "var(--accent)",       border: "oklch(0.7 0.1 65 / 0.4)", iconGlow: "drop-shadow(0 0 6px oklch(0.7 0.1 65 / 0.7))" },
    ghost:  { bg: "var(--bg-elev-1)", color: "var(--text)",         border: "var(--line-soft)",        iconGlow: "none" },
    danger: { bg: "transparent",      color: "oklch(0.65 0.12 25)", border: "oklch(0.6 0.12 25 / 0.3)", iconGlow: "none" },
  }[kind];
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "11px 18px", borderRadius: 12,
      background: styles.bg, color: styles.color,
      border: `1px solid ${styles.border}`,
      fontWeight: 600, fontSize: 13.5, letterSpacing: "-0.005em",
      transition: "transform 120ms ease, filter 120ms ease, background 160ms ease",
    }}
      onMouseDown={e => e.currentTarget.style.transform = "translateY(1px)"}
      onMouseUp={e => e.currentTarget.style.transform = "translateY(0)"}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "none"; }}
      onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.15)"}
    >
      <span style={{ display: "inline-flex", alignItems: "center", filter: styles.iconGlow }}>{icon}</span>
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
