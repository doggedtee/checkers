// Login / landing page
const { useState } = React;

function Logo({ size = 56 }) {
  // Stylized checkers crown: two stacked discs with a king crown notch
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="lgDiscA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1e3c6" />
          <stop offset="1" stopColor="#c9b388" />
        </linearGradient>
        <linearGradient id="lgDiscB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c84a52" />
          <stop offset="1" stopColor="#7d262d" />
        </linearGradient>
      </defs>
      {/* bottom disc */}
      <ellipse cx="32" cy="44" rx="22" ry="7" fill="#0e0e1c" opacity="0.45" />
      <ellipse cx="32" cy="40" rx="22" ry="8" fill="url(#lgDiscB)" />
      <ellipse cx="32" cy="37" rx="22" ry="7" fill="#b8434a" />
      <ellipse cx="32" cy="37" rx="18" ry="5.5" fill="none" stroke="#7d262d" strokeWidth="1" opacity="0.6" />
      {/* top disc (king) */}
      <ellipse cx="32" cy="26" rx="20" ry="6.5" fill="#7a6a4a" />
      <ellipse cx="32" cy="23" rx="20" ry="6.5" fill="url(#lgDiscA)" />
      <ellipse cx="32" cy="23" rx="16" ry="4.5" fill="none" stroke="#a88e62" strokeWidth="1" opacity="0.7" />
      {/* crown notch */}
      <path d="M22 22 L26 16 L30 21 L34 15 L38 21 L42 16 L46 22 Z" fill="#d4a574" opacity="0.9" />
    </svg>
  );
}

function GoogleMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.9 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7C33.9 6.1 29.2 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41 35 44 30 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}

function BoardBackdrop() {
  // Subtle isometric board fade in the background
  const cells = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const dark = (r + c) % 2 === 1;
    cells.push(<rect key={`${r}-${c}`} x={c * 40} y={r * 40} width="40" height="40" fill={dark ? "#3a261a" : "#5a3e26"} />);
  }
  return (
    <div style={{
      position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
      maskImage: "radial-gradient(60% 50% at 50% 60%, black 0%, transparent 75%)",
      WebkitMaskImage: "radial-gradient(60% 50% at 50% 60%, black 0%, transparent 75%)",
      opacity: 0.45,
    }}>
      <svg viewBox="0 0 320 320" style={{
        position: "absolute", left: "50%", top: "62%",
        width: "min(800px, 90vw)", height: "min(800px, 90vw)",
        transform: "translate(-50%, -50%) rotateX(58deg) rotateZ(0deg)",
        transformStyle: "preserve-3d",
      }}>
        {cells}
      </svg>
    </div>
  );
}

function LoginPage({ supabase }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handle = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href }
    });
    if (error) {
      setError("Failed to sign in. Try again.");
      setLoading(false);
    }
  };
  return (
    <div className="page" data-screen-label="01 Login" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", position: "relative",
      padding: "48px 24px",
    }}>
      <BoardBackdrop />

      {/* top brand mark */}
      <div style={{
        position: "absolute", top: 28, left: 32, display: "flex",
        alignItems: "center", gap: 10, color: "var(--text-mute)",
        fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase",
        fontWeight: 600,
      }}>
        <span style={{ width: 6, height: 6, background: "var(--accent)", borderRadius: 999 }} />
        <span>Crown Club</span>
      </div>

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 440, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <Logo size={64} />
        </div>
        <h1 style={{
          fontSize: 84, fontWeight: 800, letterSpacing: "-0.04em",
          margin: "0 0 14px", lineHeight: 1,
        }}>
          Checkers
        </h1>
        <p style={{
          fontSize: 17, color: "var(--text-mute)", margin: "0 0 56px",
          letterSpacing: "0.02em",
        }}>
          Play. Learn. Win.
        </p>

        <button
          onClick={handle}
          disabled={loading}
          style={{
            width: "100%", padding: "16px 20px", borderRadius: 14,
            background: loading ? "#ece6d4" : "#f5efdd", color: "#14110d",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            fontWeight: 600, fontSize: 16, letterSpacing: "-0.005em",
            transition: "transform 120ms ease, background 120ms ease, box-shadow 200ms ease",
            boxShadow: "0 8px 28px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(0,0,0,0.05)",
            cursor: loading ? "wait" : "pointer",
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = "translateY(1px)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          <GoogleMark size={20} />
          {loading ? "Signing in…" : "Continue with Google"}
        </button>

        {error && (
          <div style={{ marginTop: 14, color: "oklch(0.78 0.14 25)", fontSize: 13, textAlign: "center" }}>
            {error}
          </div>
        )}

        <div style={{
          marginTop: 22, display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, color: "var(--text-dim)", fontSize: 13,
        }}>
          <span style={{ height: 1, width: 28, background: "var(--line)" }} />
          <span>Free to play · No ads</span>
          <span style={{ height: 1, width: 28, background: "var(--line)" }} />
        </div>
      </div>

      {/* footer */}
      <div style={{
        position: "absolute", bottom: 28, left: 0, right: 0, textAlign: "center",
        color: "var(--text-dim)", fontSize: 12, fontFamily: "var(--mono)",
        letterSpacing: "0.05em",
      }}>
        v1.0 · 14,238 games played today
      </div>
    </div>
  );
}

window.LoginPage = LoginPage;
window.Logo = Logo;
