// App shell — handles page routing
const { useState: useStateApp, useEffect: useEffectApp } = React;

const supabase = window.supabase.createClient(
  'https://ovqjtdohddwsxsikdtmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92cWp0ZG9oZGR3c3hzaWtkdG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NTE1NjgsImV4cCI6MjA5NDUyNzU2OH0.u7V0o56vNPmGnzSvdcFHe78L-BUU9N225fQiTS0qeVw'
);
window.supabaseClient = supabase;

function App() {
  const [page, setPage] = useStateApp("login");
  const [user, setUser] = useStateApp(null);
  const [profile, setProfile] = useStateApp(null);
  const [loading, setLoading] = useStateApp(true);
  const [gameConfig, setGameConfig] = useStateApp({ mode: "friend", difficulty: 800 });
  const [reviewData, setReviewData] = useStateApp(null);

  async function loadProfile(sessionUser) {
    const meta = sessionUser.user_metadata || {};
    const { data } = await supabase.from("profiles").select("*").eq("id", sessionUser.id).single();
    if (data) {
      setProfile(data);
    } else {
      // First time — create the row
      const row = {
        id: sessionUser.id,
        display_name: meta.display_name || meta.full_name || sessionUser.email?.split("@")[0] || "Player",
        avatar_url: meta.avatar_url || null,
        region: meta.region || null,
      };
      await supabase.from("profiles").insert(row);
      setProfile(row);
    }
  }

  useEffectApp(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        if (_event === "SIGNED_IN" || _event === "INITIAL_SESSION") {
          loadProfile(session.user);
        }
        if (_event === "SIGNED_IN" || _event === "INITIAL_SESSION") {
          setPage("dashboard");
        }
      } else if (_event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setPage("login");
      }
      if (_event === "INITIAL_SESSION") {
        const hasCode = new URLSearchParams(window.location.search).has("code");
        if (!hasCode) setLoading(false);
      }
      if (_event === "SIGNED_IN") setLoading(false);
    });

    const t = setTimeout(() => setLoading(false), 5000);
    return () => { subscription.unsubscribe(); clearTimeout(t); };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    // Clear PKCE verifier so the next OAuth login starts fresh
    Object.keys(sessionStorage).forEach(k => {
      if (k.startsWith("supabase") || k.startsWith("sb-")) sessionStorage.removeItem(k);
    });
    setUser(null);
    setPage("login");
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-mute)", fontSize: 14 }}>
      Loading…
    </div>
  );

  if (page === "login") return <LoginPage supabase={supabase} />;
  if (page === "dashboard") return <DashboardPage user={user} profile={profile} onProfileUpdate={setProfile} onPlay={(cfg) => { setGameConfig(cfg || { mode: "friend" }); setPage("game"); }} onLogout={logout} />;
  if (page === "game") return <GamePage user={user} profile={profile} mode={gameConfig.mode} difficulty={gameConfig.difficulty} roomCode={gameConfig.roomCode} role={gameConfig.role}
    onReview={(data) => { setReviewData(data); setPage("review"); }}
    onExit={() => setPage("dashboard")} />;
  if (page === "review") return <GameReviewPage
    match={reviewData?.match}
    board={reviewData?.board}
    trail={reviewData?.trail}
    onClose={() => setPage("dashboard")}
  />;
  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
