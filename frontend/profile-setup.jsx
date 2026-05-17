// Profile Setup — first-time onboarding screen after Google auth.
// Matches the Checkers design language: warm obsidian bg, amber accent,
// glassmorphic card with 1px borders, Manrope type, mono micro-labels.
// Reuses the visual vocabulary of GlassInput / Avatar / SettingsCard.

const { useState: useStatePS, useRef: useRefPS, useEffect: useEffectPS } = React;

/* ─────────────────────────────────────────────────────────
   Local icon set (kept inline so the file is self-contained)
   ───────────────────────────────────────────────────────── */
const PSI = {
  camera: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h3l2-3h4l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="3.5"/></svg>,
  chev:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
  arrow:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>,
  check:  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-12"/></svg>,
  globe:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></svg>,
};

const REGIONS = [
  { id: "na",  label: "North America", sub: "Servers · Dallas, Toronto" },
  { id: "eu",  label: "Europe",        sub: "Servers · Frankfurt, Dublin" },
  { id: "ap",  label: "Asia-Pacific",  sub: "Servers · Tokyo, Singapore" },
  { id: "ca",  label: "Central Asia",  sub: "Servers · Almaty, Tashkent" },
  { id: "sa",  label: "South America", sub: "Servers · São Paulo" },
];

/* ─────────────────────────────────────────────────────────
   Avatar with camera pill — independent of dashboard.jsx so
   this file can render standalone in profile-setup.html.
   ───────────────────────────────────────────────────────── */
function AvatarEditor({ name, photoUrl, onChange }) {
  const fileRef = useRefPS(null);
  const [hover, setHover] = useStatePS(false);

  const initials = (name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  function pick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    onChange?.({ file: f, previewUrl: URL.createObjectURL(f) });
  }

  return (
    <div style={{ position: "relative", width: 132, height: 132 }}>
      {/* outer amber halo */}
      <div aria-hidden style={{
        position: "absolute", inset: -22,
        background: "radial-gradient(circle, oklch(0.7 0.1 65 / 0.55), transparent 70%)",
        filter: "blur(14px)", pointerEvents: "none",
      }}/>

      {/* avatar disc */}
      <button
        onClick={() => fileRef.current?.click()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label="Change profile image"
        style={{
          position: "relative", width: 132, height: 132, borderRadius: "50%",
          padding: 0, overflow: "hidden",
          background: photoUrl
            ? `center/cover no-repeat url(${photoUrl})`
            : "linear-gradient(135deg, oklch(0.78 0.12 65), oklch(0.55 0.1 50))",
          color: "#14110d",
          fontWeight: 700, fontSize: 44, letterSpacing: "-0.02em",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: hover
            ? "0 0 0 2px oklch(0.7 0.1 65 / 0.9), 0 0 32px oklch(0.7 0.1 65 / 0.55), inset 0 1px 0 rgba(255,255,255,0.2)"
            : "0 0 0 1px oklch(0.7 0.1 65 / 0.5), 0 0 22px oklch(0.7 0.1 65 / 0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
          transition: "box-shadow 200ms ease",
          cursor: "pointer",
        }}
      >
        {!photoUrl && <span>{initials}</span>}

        {/* hover overlay */}
        <span aria-hidden style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(20,17,13,0.0), rgba(20,17,13,0.78))",
          color: "var(--text)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          paddingBottom: 22,
          fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
          textTransform: "uppercase", fontFamily: "var(--mono)",
          opacity: hover ? 1 : 0,
          transition: "opacity 180ms ease",
        }}>
          Change image
        </span>
      </button>

      {/* floating camera pill */}
      <button
        onClick={() => fileRef.current?.click()}
        aria-label="Upload photo"
        style={{
          position: "absolute", right: -4, bottom: -4,
          width: 38, height: 38, borderRadius: "50%",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, oklch(0.78 0.12 65), oklch(0.6 0.13 55))",
          color: "#14110d",
          border: "2px solid var(--bg)",
          boxShadow: "0 0 14px oklch(0.7 0.1 65 / 0.65), 0 6px 14px -6px rgba(0,0,0,0.65)",
          cursor: "pointer",
          transition: "transform 140ms ease",
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.94)"}
        onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        {PSI.camera}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={pick}
        style={{ display: "none" }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   GlassInput — same vocabulary as settings.jsx
   ───────────────────────────────────────────────────────── */
function PSGlassInput({ label, value, onChange, placeholder, hint }) {
  const [focus, setFocus] = useStatePS(false);
  return (
    <label style={{ display: "block" }}>
      <div style={{
        display: "flex", alignItems: "baseline", justifyContent: "space-between",
        marginBottom: 7,
      }}>
        <span style={{
          fontSize: 10.5, color: "var(--text-dim)", letterSpacing: "0.12em",
          textTransform: "uppercase", fontWeight: 700,
        }}>{label}</span>
        {hint && <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--mono)" }}>{hint}</span>}
      </div>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: "100%",
          padding: "13px 16px",
          fontSize: 14.5,
          color: "var(--text)",
          background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.55), oklch(0.18 0.012 55 / 0.4))",
          border: `1px solid ${focus ? "oklch(0.7 0.1 65 / 0.75)" : "var(--line-soft)"}`,
          borderRadius: 12,
          outline: "none",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxShadow: focus
            ? "0 0 0 3px oklch(0.7 0.1 65 / 0.14), 0 0 18px oklch(0.7 0.1 65 / 0.18), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "inset 0 1px 0 rgba(255,255,255,0.04)",
          transition: "border-color 160ms ease, box-shadow 160ms ease",
          fontFamily: "inherit",
        }}
      />
    </label>
  );
}

/* ─────────────────────────────────────────────────────────
   Region dropdown — matches settings card aesthetic
   ───────────────────────────────────────────────────────── */
function RegionSelect({ value, onChange }) {
  const [open, setOpen] = useStatePS(false);
  const [focus, setFocus] = useStatePS(false);
  const rootRef = useRefPS(null);

  const selected = REGIONS.find(r => r.id === value);

  useEffectPS(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <div style={{
        fontSize: 10.5, color: "var(--text-dim)", letterSpacing: "0.12em",
        textTransform: "uppercase", fontWeight: 700, marginBottom: 7,
      }}>Choose Region</div>

      <button
        onClick={() => setOpen(o => !o)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: "100%",
          padding: "13px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          fontSize: 14.5, color: "var(--text)",
          background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.55), oklch(0.18 0.012 55 / 0.4))",
          border: `1px solid ${open || focus ? "oklch(0.7 0.1 65 / 0.75)" : "var(--line-soft)"}`,
          borderRadius: 12,
          textAlign: "left",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxShadow: (open || focus)
            ? "0 0 0 3px oklch(0.7 0.1 65 / 0.14), 0 0 18px oklch(0.7 0.1 65 / 0.18), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "inset 0 1px 0 rgba(255,255,255,0.04)",
          transition: "border-color 160ms ease, box-shadow 160ms ease",
          cursor: "pointer",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span style={{ color: "var(--accent)", display: "inline-flex" }}>{PSI.globe}</span>
          <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ fontWeight: 600 }}>{selected?.label || "Select a region"}</span>
            {selected?.sub && (
              <span style={{
                fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--mono)",
                letterSpacing: "0.02em", marginTop: 1,
              }}>{selected.sub}</span>
            )}
          </span>
        </span>
        <span style={{
          color: "var(--text-mute)",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 180ms ease",
          display: "inline-flex",
        }}>{PSI.chev}</span>
      </button>

      {/* dropdown menu */}
      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
            zIndex: 20,
            background: "linear-gradient(180deg, oklch(0.24 0.015 60 / 0.95), oklch(0.18 0.012 55 / 0.92))",
            border: "1px solid var(--line)",
            borderRadius: 12,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 22px 50px -16px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.02)",
            padding: 6,
            animation: "psPop 160ms cubic-bezier(0.2, 0.8, 0.3, 1) both",
            overflow: "hidden",
          }}
        >
          {REGIONS.map((r) => {
            const active = r.id === value;
            return (
              <RegionOption
                key={r.id}
                region={r}
                active={active}
                onClick={() => { onChange(r.id); setOpen(false); }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function RegionOption({ region, active, onClick }) {
  const [hover, setHover] = useStatePS(false);
  return (
    <button
      role="option"
      aria-selected={active}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        width: "100%", textAlign: "left",
        padding: "10px 12px", borderRadius: 8,
        background: hover || active
          ? "linear-gradient(90deg, oklch(0.7 0.1 65 / 0.14), transparent 75%)"
          : "transparent",
        color: "var(--text)",
        cursor: "pointer",
        transition: "background 140ms ease",
      }}
    >
      <span aria-hidden style={{
        position: "absolute", left: 0, top: 8, bottom: 8, width: 2,
        background: "var(--accent)", borderRadius: 2,
        opacity: active ? 1 : 0,
        boxShadow: active ? "0 0 10px oklch(0.7 0.1 65 / 0.7)" : "none",
      }}/>
      <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{region.label}</span>
        <span style={{
          fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--mono)",
          marginTop: 1, letterSpacing: "0.02em",
        }}>{region.sub}</span>
      </span>
      {active && (
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 20, height: 20, borderRadius: "50%",
          background: "oklch(0.7 0.1 65 / 0.18)",
          color: "var(--accent)",
          boxShadow: "inset 0 0 0 1px oklch(0.7 0.1 65 / 0.5)",
        }}>{PSI.check}</span>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   Primary CTA — amber glow + particle burst on click
   ───────────────────────────────────────────────────────── */
function PrimaryButton({ children, onClick, loading }) {
  const [hover, setHover] = useStatePS(false);
  const [bursts, setBursts] = useStatePS([]);
  const idRef = useRefPS(0);

  function fire(e) {
    if (loading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const id = ++idRef.current;
    const parts = Array.from({ length: 14 }).map((_, i) => ({
      i, dx: Math.cos((i / 14) * Math.PI * 2) * (32 + Math.random() * 16),
      dy: Math.sin((i / 14) * Math.PI * 2) * (32 + Math.random() * 16),
      size: 3 + Math.random() * 3,
      delay: Math.random() * 60,
    }));
    setBursts((prev) => [...prev, { id, x: cx, y: cy, parts }]);
    setTimeout(() => setBursts((prev) => prev.filter(b => b.id !== id)), 800);
    onClick?.(e);
  }

  return (
    <button
      onClick={fire}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={loading}
      style={{
        position: "relative",
        width: "100%",
        padding: "16px 22px",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
        background: "linear-gradient(180deg, oklch(0.82 0.12 70), oklch(0.66 0.13 55))",
        color: "#14110d",
        fontWeight: 700, fontSize: 15.5, letterSpacing: "-0.005em",
        borderRadius: 12,
        border: "1px solid oklch(0.78 0.12 65 / 0.6)",
        boxShadow: hover
          ? "0 0 0 3px oklch(0.7 0.1 65 / 0.18), 0 18px 38px -14px oklch(0.7 0.1 65 / 0.7), 0 0 28px oklch(0.7 0.1 65 / 0.55), inset 0 1px 0 rgba(255,255,255,0.35)"
          : "0 12px 28px -14px oklch(0.7 0.1 65 / 0.6), 0 0 18px oklch(0.7 0.1 65 / 0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
        transform: hover ? "translateY(-1px)" : "translateY(0)",
        transition: "transform 160ms ease, box-shadow 200ms ease",
        cursor: loading ? "wait" : "pointer",
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      <span style={{ position: "relative", zIndex: 2 }}>{children}</span>
      <span style={{ position: "relative", zIndex: 2, display: "inline-flex" }}>{PSI.arrow}</span>

      {/* particle bursts */}
      {bursts.map((b) => (
        <span key={b.id} aria-hidden style={{
          position: "absolute", left: b.x, top: b.y,
          width: 0, height: 0, pointerEvents: "none", zIndex: 1,
        }}>
          {b.parts.map((p) => (
            <span key={p.i} style={{
              position: "absolute",
              left: -p.size / 2, top: -p.size / 2,
              width: p.size, height: p.size,
              borderRadius: "50%",
              background: "oklch(0.92 0.13 75)",
              boxShadow: "0 0 10px oklch(0.85 0.14 70 / 0.9)",
              animation: `psBurst 700ms cubic-bezier(0.18, 0.7, 0.3, 1) ${p.delay}ms both`,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
            }}/>
          ))}
        </span>
      ))}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   Main page
   ───────────────────────────────────────────────────────── */
function ProfileSetupPage({ user, supabase, onComplete }) {
  const defaultName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Gogo";
  const defaultPhoto =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;

  const [name, setName] = useStatePS(defaultName);
  const [photo, setPhoto] = useStatePS(defaultPhoto);
  const [photoFile, setPhotoFile] = useStatePS(null);
  const [region, setRegion] = useStatePS("ca");
  const [saving, setSaving] = useStatePS(false);

  function handlePhotoChange({ file, previewUrl }) {
    setPhotoFile(file);
    setPhoto(previewUrl);
  }

  function resizeToDataUrl(file, size = 200) {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
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

  async function submit() {
    if (!name.trim() || saving) return;
    setSaving(true);

    const avatarUrl = photoFile
      ? await resizeToDataUrl(photoFile)
      : defaultPhoto;

    const { data: { user: fresh } } = await supabase.auth.updateUser({
      data: { display_name: name.trim(), region, avatar_url: avatarUrl },
    });
    const profileData = { id: user.id, display_name: name.trim(), avatar_url: avatarUrl, region };
    await supabase.from("profiles").upsert(profileData);
    setSaving(false);
    onComplete?.(fresh, profileData);
  }

  return (
    <div
      className="page"
      data-screen-label="01 Profile Setup"
      style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "56px 24px",
        overflow: "hidden",
      }}
    >
      {/* keyframes scoped to page */}
      <style>{`
        @keyframes psPop {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes psBurst {
          0%   { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0.2); opacity: 0; }
        }
        @keyframes psCardIn {
          from { opacity: 0; transform: translateY(14px); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes psGlowPulse {
          0%, 100% { opacity: 0.85; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 1;    transform: translate(-50%, -50%) scale(1.06); }
        }
      `}</style>

      {/* Soft radial amber glow behind the card */}
      <div aria-hidden style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: "min(820px, 110vw)", height: "min(820px, 110vw)",
        background: "radial-gradient(closest-side, oklch(0.7 0.1 65 / 0.34), oklch(0.7 0.1 65 / 0.12) 45%, transparent 70%)",
        filter: "blur(20px)",
        pointerEvents: "none",
        animation: "psGlowPulse 7s ease-in-out infinite",
      }}/>

      {/* Faint grid texture — same warmth as boardbackdrop */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        backgroundImage:
          "linear-gradient(to right, oklch(0.7 0.1 65 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.7 0.1 65 / 0.05) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        maskImage: "radial-gradient(60% 60% at 50% 50%, black, transparent 80%)",
        WebkitMaskImage: "radial-gradient(60% 60% at 50% 50%, black, transparent 80%)",
        pointerEvents: "none",
        opacity: 0.55,
      }}/>

      {/* top brand mark — matches login.jsx */}
      <div style={{
        position: "absolute", top: 28, left: 32, display: "flex",
        alignItems: "center", gap: 10, color: "var(--text-mute)",
        fontSize: 12.5, letterSpacing: "0.14em", textTransform: "uppercase",
        fontWeight: 600,
      }}>
        <span style={{ width: 6, height: 6, background: "var(--accent)", borderRadius: 999,
          boxShadow: "0 0 10px oklch(0.7 0.1 65 / 0.75)" }} />
        <span>Crown Club</span>
      </div>

      {/* step counter — top right */}
      <div style={{
        position: "absolute", top: 28, right: 32,
        fontSize: 11, color: "var(--text-dim)",
        fontFamily: "var(--mono)", letterSpacing: "0.14em",
      }}>
        STEP 02 / 02
      </div>

      {/* The card */}
      <section style={{
        position: "relative",
        width: "100%", maxWidth: 480,
        padding: "38px 40px 32px",
        background: "linear-gradient(180deg, oklch(0.22 0.015 60 / 0.62), oklch(0.16 0.012 55 / 0.5))",
        border: "1px solid var(--line-soft)",
        borderRadius: 20,
        backdropFilter: "blur(18px) saturate(140%)",
        WebkitBackdropFilter: "blur(18px) saturate(140%)",
        boxShadow:
          "0 30px 80px -28px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.025), inset 0 1px 0 rgba(255,255,255,0.05)",
        animation: "psCardIn 460ms cubic-bezier(0.22, 0.8, 0.3, 1) both",
        overflow: "visible",
      }}>
        {/* corner amber wash inside card */}
        <div aria-hidden style={{
          position: "absolute", top: -60, right: -60, width: 260, height: 260,
          background: "radial-gradient(circle, oklch(0.7 0.1 65 / 0.22), transparent 70%)",
          filter: "blur(20px)", pointerEvents: "none", borderRadius: "50%",
        }}/>

        {/* Header */}
        <div style={{ position: "relative", textAlign: "center", marginBottom: 26 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 999,
            background: "oklch(0.7 0.1 65 / 0.12)",
            color: "var(--accent)",
            border: "1px solid oklch(0.7 0.1 65 / 0.35)",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
            fontFamily: "var(--mono)", textTransform: "uppercase",
            marginBottom: 16,
          }}>
            <span style={{ width: 5, height: 5, background: "var(--accent)", borderRadius: 999,
              boxShadow: "0 0 8px oklch(0.7 0.1 65 / 0.8)" }}/>
            Welcome aboard
          </div>
          <h1 style={{
            margin: 0,
            fontSize: 32, fontWeight: 700, letterSpacing: "-0.025em",
            lineHeight: 1.1,
          }}>
            Create Your Profile
          </h1>
          <p style={{
            margin: "10px 0 0",
            fontSize: 14, color: "var(--text-mute)",
            letterSpacing: "0.005em",
          }}>
            Let's personalize your checkerboard identity.
          </p>
        </div>

        {/* Avatar */}
        <div style={{
          position: "relative",
          display: "flex", justifyContent: "center",
          marginBottom: 30, marginTop: 6,
        }}>
          <AvatarEditor name={name} photoUrl={photo} onChange={handlePhotoChange}/>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
          <PSGlassInput
            label="Display Name"
            value={name}
            onChange={setName}
            placeholder="Gogo"
            hint={`${name.length}/24`}
          />
          <RegionSelect value={region} onChange={setRegion}/>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 26, position: "relative" }}>
          <PrimaryButton onClick={submit} loading={saving}>
            {saving ? "Setting up…" : "Enter Hub"}
          </PrimaryButton>
        </div>

        {/* footer micro-line */}
        <div style={{
          marginTop: 18, textAlign: "center",
          fontSize: 11.5, color: "var(--text-dim)",
          fontFamily: "var(--mono)", letterSpacing: "0.04em",
        }}>
          You can change these anytime in Settings · Account.
        </div>
      </section>
    </div>
  );
}

window.ProfileSetupPage = ProfileSetupPage;
