// App shell — handles page routing
const { useState: useStateApp, useEffect: useEffectApp } = React;

const supabase = window.supabase.createClient(
  'https://ovqjtdohddwsxsikdtmb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92cWp0ZG9oZGR3c3hzaWtkdG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NTE1NjgsImV4cCI6MjA5NDUyNzU2OH0.u7V0o56vNPmGnzSvdcFHe78L-BUU9N225fQiTS0qeVw'
);

function App() {
  const [page, setPage] = useStateApp("login");
  const [user, setUser] = useStateApp(null);
  const [loading, setLoading] = useStateApp(true);
  const [gameConfig, setGameConfig] = useStateApp({ mode: "friend", difficulty: 800 });

  useEffectApp(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setPage("dashboard");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setPage("dashboard");
      } else {
        setUser(null);
        setPage("login");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setPage("login");
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-mute)", fontSize: 14 }}>
      Loading…
    </div>
  );

  if (page === "login") return <LoginPage supabase={supabase} />;
  if (page === "dashboard") return <DashboardPage user={user} onPlay={(cfg) => { setGameConfig(cfg || { mode: "friend" }); setPage("game"); }} onLogout={logout} />;
  if (page === "game") return <GamePage user={user} mode={gameConfig.mode} difficulty={gameConfig.difficulty} onExit={() => setPage("dashboard")} />;
  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
