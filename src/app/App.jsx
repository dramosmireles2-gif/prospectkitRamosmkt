import { useEffect, useState } from "react";
import { Sidebar, Toast, EmptyState, Button } from "../components/Primitives";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { WorkspaceProvider, useWorkspace } from "../contexts/WorkspaceContext";
import { canUse, FEATURES } from "../services/featureFlags";
import { buildDashboardMetrics, createProspect, ensureProspectAnalysis, ensureProspectKit, listProspects, seedDemoWorkspace, updateProspect } from "../services/prospects";
import { theme } from "./theme";
import { AnalysisScreen } from "../screens/AnalysisScreen";
import { AssetsScreen } from "../screens/AssetsScreen";
import { AuthScreen } from "../screens/AuthScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { DetailScreen } from "../screens/DetailScreen";
import { KitScreen } from "../screens/KitScreen";
import { ProspectsScreen } from "../screens/ProspectsScreen";
import { SetupScreen } from "../screens/SetupScreen";

function FullscreenLoader({ label }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg }}>
      <div style={{ fontSize: 14, color: theme.muted }}>{label}</div>
    </div>
  );
}

function WorkspaceReadyScreen({ onRetry, onSignOut }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: theme.bg }}>
      <div style={{ width: "min(620px, 100%)" }}>
        <EmptyState
          title="La cuenta existe, pero el workspace aún no aparece"
          description="Esto suele pasar cuando todavía no corriste el SQL de Supabase o cuando el trigger de alta no terminó de crear profile, workspace y membership."
          actions={
            <>
              <Button variant="primary" onClick={onRetry}>
                Reintentar
              </Button>
              <Button variant="secondary" onClick={onSignOut}>
                Cerrar sesión
              </Button>
            </>
          }
        />
      </div>
    </div>
  );
}

function sortProspects(list) {
  return [...list].sort((left, right) => right.opportunityScore - left.opportunityScore || new Date(right.createdAt) - new Date(left.createdAt));
}

function AppContent() {
  const { hasConfig, session, profile, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { workspace, loading: workspaceLoading, refreshWorkspace } = useWorkspace();
  const [view, setView] = useState("dashboard");
  const [prospects, setProspects] = useState([]);
  const [selectedProspectId, setSelectedProspectId] = useState(null);
  const [notice, setNotice] = useState("");
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState("");
  const [loadingProspects, setLoadingProspects] = useState(false);

  const selectedProspect = prospects.find((prospect) => prospect.id === selectedProspectId) || null;
  const metrics = buildDashboardMetrics(prospects);

  useEffect(() => {
    if (!workspace) {
      setProspects([]);
      setSelectedProspectId(null);
      return;
    }

    loadProspects().catch((error) => {
      console.error("Error loading prospects", error);
      setToast({ tone: "error", message: error.message || "No se pudieron cargar los prospectos." });
    });
  }, [workspace?.id]);

  useEffect(() => {
    if (selectedProspectId && !selectedProspect) {
      setSelectedProspectId(null);
      setView("prospects");
    }
  }, [selectedProspectId, selectedProspect]);

  async function loadProspects() {
    if (!workspace) {
      return;
    }

    setLoadingProspects(true);
    const rows = await listProspects(workspace.id);
    setProspects(sortProspects(rows));
    setLoadingProspects(false);
  }

  function upsertProspect(nextProspect) {
    setProspects((current) => sortProspects(current.some((item) => item.id === nextProspect.id) ? current.map((item) => (item.id === nextProspect.id ? nextProspect : item)) : [nextProspect, ...current]));
    setSelectedProspectId(nextProspect.id);
  }

  function navigate(nextView) {
    if (["detail", "analysis", "kitgen", "assets"].includes(nextView) && !selectedProspect) {
      setView("prospects");
      return;
    }
    setView(nextView);
  }

  async function handleSignIn(form) {
    setBusy("auth");
    setNotice("");
    try {
      await signIn({ email: form.email, password: form.password });
    } finally {
      setBusy("");
    }
  }

  async function handleSignUp(form) {
    setBusy("auth");
    setNotice("");
    try {
      const result = await signUp({
        fullName: form.fullName,
        email: form.email,
        password: form.password
      });

      if (!result.session) {
        setNotice("Cuenta creada. Revisa tu correo para confirmar el acceso y luego inicia sesión.");
      }
    } finally {
      setBusy("");
    }
  }

  async function handleCreateProspect(form) {
    setBusy("create");
    try {
      const created = await createProspect(workspace.id, form);
      upsertProspect(created);
      setView("detail");
      setToast({ tone: "success", message: "Prospecto guardado en Supabase." });
    } finally {
      setBusy("");
    }
  }

  async function handleGenerateAnalysis(target = selectedProspect) {
    if (!target) return null;
    setBusy("analysis");
    try {
      const nextProspect = await ensureProspectAnalysis(workspace.id, target);
      upsertProspect(nextProspect);
      setView("analysis");
      setToast({ tone: "success", message: "Análisis persistido correctamente." });
      return nextProspect;
    } finally {
      setBusy("");
    }
  }

  async function handleGenerateKit(target = selectedProspect) {
    if (!target) return null;
    setBusy("kit");
    try {
      const nextProspect = await ensureProspectKit(workspace.id, target);
      upsertProspect(nextProspect);
      setView("kitgen");
      setToast({ tone: "success", message: "Kit guardado y listo para usar." });
      return nextProspect;
    } finally {
      setBusy("");
    }
  }

  async function handleMarkContacted() {
    if (!selectedProspect) {
      return;
    }

    setBusy("contacted");
    try {
      const nextProspect = await updateProspect({
        id: selectedProspect.id,
        status: "contacted",
        last_activity_at: new Date().toISOString()
      });
      upsertProspect(nextProspect);
      setToast({ tone: "success", message: "Prospecto marcado como contactado." });
    } finally {
      setBusy("");
    }
  }

  async function handleSeedDemo() {
    setBusy("demo");
    try {
      const rows = await seedDemoWorkspace(workspace.id);
      setProspects(sortProspects(rows));
      if (rows[0]) {
        setSelectedProspectId(rows[0].id);
      }
      setToast({ tone: "success", message: "Demo importada en el workspace." });
    } finally {
      setBusy("");
    }
  }

  if (!hasConfig) {
    return <SetupScreen />;
  }

  if (authLoading) {
    return <FullscreenLoader label="Conectando con Supabase..." />;
  }

  if (!session) {
    return <AuthScreen onSignIn={handleSignIn} onSignUp={handleSignUp} busy={busy === "auth"} notice={notice} />;
  }

  if (workspaceLoading) {
    return <FullscreenLoader label="Preparando tu workspace..." />;
  }

  if (!workspace) {
    return <WorkspaceReadyScreen onRetry={refreshWorkspace} onSignOut={signOut} />;
  }

  const canAccessAssets = canUse(FEATURES.ASSET_EXPORT, workspace);

  let screen = (
    <DashboardScreen
      prospects={prospects}
      metrics={metrics}
      onOpenView={navigate}
      onSelectProspect={(prospect) => setSelectedProspectId(prospect?.id || null)}
      onSeedDemo={handleSeedDemo}
      loading={busy === "demo"}
    />
  );

  if (view === "prospects") {
    screen = (
      <ProspectsScreen
        prospects={prospects}
        onCreate={handleCreateProspect}
        busy={busy === "create"}
        onOpenProspect={(prospect) => {
          setSelectedProspectId(prospect.id);
          setView(prospect.analysis ? "analysis" : "detail");
        }}
      />
    );
  }

  if (view === "detail") {
    screen = (
      <DetailScreen
        prospect={selectedProspect}
        busy={Boolean(busy)}
        onOpenView={navigate}
        onGenerateAnalysis={() => handleGenerateAnalysis(selectedProspect)}
        onGenerateKit={() => handleGenerateKit(selectedProspect)}
        onMarkContacted={handleMarkContacted}
      />
    );
  }

  if (view === "analysis") {
    screen = (
      <AnalysisScreen
        prospect={selectedProspect}
        onGenerateAnalysis={() => handleGenerateAnalysis(selectedProspect)}
        onGenerateKit={() => handleGenerateKit(selectedProspect)}
        onOpenAssets={() => navigate("assets")}
      />
    );
  }

  if (view === "kitgen") {
    screen = <KitScreen prospect={selectedProspect} onGenerateKit={() => handleGenerateKit(selectedProspect)} onOpenAssets={() => navigate("assets")} />;
  }

  if (view === "assets") {
    screen = canAccessAssets ? <AssetsScreen prospect={selectedProspect} /> : <EmptyState title="Tu plan no incluye exportación" description="La estructura ya soporta feature gating por plan. En esta demo el plan Starter sí habilita assets, pero este mensaje protege el flujo." />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: theme.bg, overflow: "hidden" }}>
      <Sidebar
        view={view}
        setView={navigate}
        prospect={selectedProspect}
        profile={profile}
        workspace={workspace}
        onSignOut={signOut}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>{loadingProspects ? <FullscreenLoader label="Cargando prospects..." /> : screen}</div>
      {toast ? <Toast tone={toast.tone} message={toast.message} onClose={() => setToast(null)} /> : null}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <AppContent />
      </WorkspaceProvider>
    </AuthProvider>
  );
}
