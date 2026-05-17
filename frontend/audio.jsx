// Tiny WebAudio engine for in-game SFX and ambient music.
// Exposes window.checkersAudio with playMove/playCapture/playWin/playLoss
// and an ambient music loop. Reads settings live via the
// "checkers:settings-changed" event and on first init.

(function () {
  let ctx = null;
  let masterGain = null;
  let sfxGain = null;
  let musicGain = null;
  let musicNodes = null;

  let settings = {
    master: 70,
    sfx: 85,
    music: 40,
    moveSfx: true,
    captureSfx: true,
  };

  function pct(v) { return Math.max(0, Math.min(1, (v ?? 0) / 100)); }

  function ensureCtx() {
    if (ctx) return ctx;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    masterGain = ctx.createGain();
    sfxGain = ctx.createGain();
    musicGain = ctx.createGain();
    sfxGain.connect(masterGain);
    musicGain.connect(masterGain);
    masterGain.connect(ctx.destination);
    applyGains();
    return ctx;
  }

  function applyGains() {
    if (!ctx) return;
    const m = pct(settings.master);
    masterGain.gain.setTargetAtTime(m, ctx.currentTime, 0.02);
    sfxGain.gain.setTargetAtTime(pct(settings.sfx), ctx.currentTime, 0.02);
    musicGain.gain.setTargetAtTime(pct(settings.music) * 0.35, ctx.currentTime, 0.05);
  }

  function loadSettings() {
    try {
      const fn = window.getCheckersSettings;
      if (fn) settings = { ...settings, ...fn() };
    } catch {}
  }

  function resumeIfNeeded() {
    if (ctx && ctx.state === "suspended") ctx.resume();
  }

  function playMove() {
    if (!settings.moveSfx) return;
    const c = ensureCtx();
    if (!c) return;
    resumeIfNeeded();
    const t = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.07);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    osc.connect(g).connect(sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  function playCapture() {
    if (!settings.captureSfx) return;
    const c = ensureCtx();
    if (!c) return;
    resumeIfNeeded();
    const t = c.currentTime;
    const freqs = [523.25, 783.99]; // C5 + G5
    freqs.forEach((f, i) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, t + i * 0.04);
      g.gain.setValueAtTime(0.0001, t + i * 0.04);
      g.gain.exponentialRampToValueAtTime(0.28, t + i * 0.04 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.04 + 0.45);
      osc.connect(g).connect(sfxGain);
      osc.start(t + i * 0.04);
      osc.stop(t + i * 0.04 + 0.5);
    });
  }

  function playWin() {
    const c = ensureCtx();
    if (!c) return;
    resumeIfNeeded();
    const t = c.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((f, i) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, t + i * 0.09);
      g.gain.setValueAtTime(0.0001, t + i * 0.09);
      g.gain.exponentialRampToValueAtTime(0.3, t + i * 0.09 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.5);
      osc.connect(g).connect(sfxGain);
      osc.start(t + i * 0.09);
      osc.stop(t + i * 0.09 + 0.55);
    });
  }

  function playLoss() {
    const c = ensureCtx();
    if (!c) return;
    resumeIfNeeded();
    const t = c.currentTime;
    const notes = [392, 311, 233]; // G4 Eb4 Bb3
    notes.forEach((f, i) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, t + i * 0.12);
      g.gain.setValueAtTime(0.0001, t + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.28, t + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + 0.55);
      osc.connect(g).connect(sfxGain);
      osc.start(t + i * 0.12);
      osc.stop(t + i * 0.12 + 0.6);
    });
  }

  // Ambient music: slow, gentle pad made of layered sine oscillators
  // detuned slightly for a soft chorus effect.
  function startMusic() {
    const c = ensureCtx();
    if (!c) return;
    if (musicNodes) return; // already playing
    resumeIfNeeded();

    const t = c.currentTime;
    const base = c.createGain();
    base.gain.setValueAtTime(0.0001, t);
    base.gain.exponentialRampToValueAtTime(1, t + 4);
    base.connect(musicGain);

    // Three layered sines at A2/E3/A3 with slow LFO for movement
    const tones = [];
    [110, 164.81, 220].forEach((f, i) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.15 - i * 0.03, t);

      // gentle pitch drift
      const lfo = c.createOscillator();
      const lfoGain = c.createGain();
      lfo.frequency.setValueAtTime(0.05 + i * 0.02, t);
      lfoGain.gain.setValueAtTime(1.2, t);
      lfo.connect(lfoGain).connect(osc.frequency);

      osc.connect(g).connect(base);
      osc.start(t);
      lfo.start(t);
      tones.push({ osc, lfo, g });
    });

    musicNodes = { base, tones };
  }

  function stopMusic() {
    if (!musicNodes || !ctx) return;
    const t = ctx.currentTime;
    musicNodes.base.gain.cancelScheduledValues(t);
    musicNodes.base.gain.setValueAtTime(musicNodes.base.gain.value, t);
    musicNodes.base.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    const toStop = musicNodes;
    musicNodes = null;
    setTimeout(() => {
      try {
        toStop.tones.forEach(({ osc, lfo }) => { osc.stop(); lfo.stop(); });
      } catch {}
    }, 1400);
  }

  // ── public API ─────────────────────────────────────────────
  window.checkersAudio = {
    playMove,
    playCapture,
    playWin,
    playLoss,
    startMusic,
    stopMusic,
    refresh() {
      loadSettings();
      applyGains();
    },
  };

  loadSettings();

  window.addEventListener("checkers:settings-changed", (e) => {
    if (e.detail) settings = { ...settings, ...e.detail };
    applyGains();
  });

  // Resume context on first interaction (browsers gate audio behind user gesture)
  ["pointerdown", "keydown"].forEach(ev =>
    window.addEventListener(ev, function once() {
      ensureCtx();
      resumeIfNeeded();
      window.removeEventListener(ev, once);
    })
  );
})();
