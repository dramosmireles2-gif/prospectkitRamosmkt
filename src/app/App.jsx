import { useEffect, useState, useCallback } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { useFollowUpNotifications } from "../hooks/useFollowUpNotifications";
import { Sidebar, Toast, EmptyState, Button } from "../components/Primitives";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { WorkspaceProvider, useWorkspace } from "../contexts/WorkspaceContext";
import { canUse, FEATURES } from "../services/featureFlags";
import {
  buildDashboardMetrics,
  createProspect,
  deleteProspect,
  ensureProspectAnalysis,
  ensureProspectKit,
  listProspects,
  regenerateProspectAnalysis,
  regenerateProspectKit,
  seedDemoWorkspace,
  updateProspect,
  updatePipelineStage,
  updateNextAction
} from "../services/prospects";
import { VIEWS, PROSPECT_VIEWS } from "./constants";
import { theme } from "./theme";
import { AnalysisScreen } from "../screens/AnalysisScreen";
import { AssetsScreen } from "../screens/AssetsScreen";
import { AuthScreen } from "../screens/AuthScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { DetailScreen } from "../screens/DetailScreen";
import { KitScreen } from "../screens/KitScreen";
import { PipelineScreen } from "../screens/PipelineScreen";
import { ROIScreen } from "../screens/ROIScreen";
import { LTVScreen } from "../screens/LTVScreen";
import { GapScreen } from "../screens/GapScreen";
import { AttackPlanScreen } from "../screens/AttackPlanScreen";
import { ProposalScreen } from "../screens/ProposalScreen";
import { ProspectsScreen } from "../screens/ProspectsScreen";
import { SetupScreen } from "../screens/SetupScreen";
import { ClientsScreen } from "../screens/ClientsScreen";
import { ClientDetailScreen } from "../screens/ClientDetailScreen";
import { PaymentsScreen } from "../screens/PaymentsScreen";
import { RenewalsScreen } from "../screens/RenewalsScreen";
import { TasksScreen } from "../screens/TasksScreen";
import { getActiveProposalMap, listProposals, listAllProposals, saveProposal } from "../services/proposals";
import {
  listClients, deleteClient, convertProspectToClient,
  listPayments, listRenewals, listTasks, buildClientMetrics
} from "../services/clients";

function FullscreenLoader({ label }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: theme.bg, gap: 12 }}>
      <div style={{ fontSize: 14, color: theme.muted }}>{label}</div>
      {slow ? (
        <div style={{ fontSize: 12, color: theme.red, maxWidth: 360, textAlign: "center", lineHeight: 1.6 }}>
          Está tardando más de lo normal. Verifica que{" "}
          <code style={{ color: theme.yellow }}>VITE_SUPABASE_URL</code> y{" "}
          <code style={{ color: theme.yellow }}>VITE_SUPABASE_ANON_KEY</code>{" "}
          estén correctas en Vercel y que hayas hecho redeploy.
        </div>
      ) : null}
    </div>
  );
}

function WorkspaceReadyScreen({ debugError, onRetry, onSignOut }) {
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
        {debugError ? (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 16, border: `1px solid ${theme.border}`, background: theme.s2, color: theme.muted, fontSize: 12, lineHeight: 1.5 }}>
            <strong style={{ color: theme.text }}>Diagnostico:</strong> {debugError}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function sortProspects(list) {
  return [...list].sort((left, right) => right.opportunityScore - left.opportunityScore || new Date(right.createdAt) - new Date(left.createdAt));
}

function AppContent() {
  const { hasConfig, session, profile, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { workspace, loading: workspaceLoading, refreshWorkspace, debugError } = useWorkspace();
  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [prospects, setProspects] = useState([]);
  const [selectedProspectId, setSelectedProspectId] = useState(null);
  const [openNewProspect, setOpenNewProspect] = useState(false);
  const [notice, setNotice] = useState("");
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState("");
  const [loadingProspects, setLoadingProspects] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [allProposals, setAllProposals] = useState([]);
  const [savingProposal, setSavingProposal] = useState(false);
  // Clients module state
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [payments, setPayments] = useState([]);
  const [renewals, setRenewals] = useState([]);
  const [tasks, setTasks] = useState([]);

  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

  const selectedProspect = prospects.find((prospect) => prospect.id === selectedProspectId) || null;
  const activeProposalMap = getActiveProposalMap(allProposals);
  const metrics = buildDashboardMetrics(prospects, activeProposalMap);

  useFollowUpNotifications(prospects);

  useEffect(() => {
    if (!workspace) {
      setProspects([]);
      setSelectedProspectId(null);
      setClients([]);
      setPayments([]);
      setRenewals([]);
      setTasks([]);
      return;
    }

    loadProspects().catch((error) => {
      console.error("Error loading prospects", error);
      setToast({ tone: "error", message: error.message || "No se pudieron cargar los prospectos." });
    });

    // Load clients module data
    Promise.all([
      listClients(workspace.id),
      listPayments(workspace.id),
      listRenewals(workspace.id),
      listTasks(workspace.id)
    ]).then(([cls, pays, renews, tsks]) => {
      setClients(cls);
      setPayments(pays);
      setRenewals(renews);
      setTasks(tsks);
    }).catch(console.error);
  }, [workspace?.id]);

  useEffect(() => {
    if (selectedProspectId && !selectedProspect) {
      setSelectedProspectId(null);
      setView(VIEWS.PROSPECTS);
    }
  }, [selectedProspectId, selectedProspect]);

  useEffect(() => {
    if (!selectedProspectId) { setProposals([]); return; }
    listProposals(selectedProspectId).then(setProposals).catch(() => setProposals([]));
  }, [selectedProspectId]);

  async function loadProspects() {
    if (!workspace) {
      return;
    }

    setLoadingProspects(true);
    const [{ prospects: rows }, allProps] = await Promise.all([
      listProspects(workspace.id),
      listAllProposals(workspace.id).catch(() => [])
    ]);
    setProspects(sortProspects(rows));
    setAllProposals(allProps);
    setLoadingProspects(false);
  }

  function upsertProspect(nextProspect) {
    setProspects((current) => sortProspects(current.some((item) => item.id === nextProspect.id) ? current.map((item) => (item.id === nextProspect.id ? nextProspect : item)) : [nextProspect, ...current]));
    setSelectedProspectId(nextProspect.id);
  }

  function navigate(nextView) {
    if (PROSPECT_VIEWS.includes(nextView) && !selectedProspect) {
      setView(VIEWS.PROSPECTS);
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
      setView(VIEWS.DETAIL);
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
      setView(VIEWS.ANALYSIS);
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
      setView(VIEWS.KIT);
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

  async function handleUpdateNotes(notes) {
    if (!selectedProspect) return;
    try {
      const nextProspect = await updateProspect({
        id: selectedProspect.id,
        notes,
        last_activity_at: new Date().toISOString()
      });
      upsertProspect(nextProspect);
      setToast({ tone: "success", message: "Notas actualizadas." });
    } catch (error) {
      setToast({ tone: "error", message: error.message || "No se pudieron guardar las notas." });
    }
  }

  async function handleUpdateProspect(fields) {
    if (!selectedProspect) return;
    try {
      const nextProspect = await updateProspect({
        id: selectedProspect.id,
        ...fields,
        last_activity_at: new Date().toISOString()
      });
      upsertProspect(nextProspect);
      setToast({ tone: "success", message: "Prospecto actualizado." });
    } catch (error) {
      setToast({ tone: "error", message: error.message || "No se pudo actualizar el prospecto." });
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

  async function handleDeleteProspect(prospect) {
    setBusy("delete");
    try {
      await deleteProspect(prospect.id);
      setProspects((current) => current.filter((item) => item.id !== prospect.id));
      if (selectedProspectId === prospect.id) {
        setSelectedProspectId(null);
        setView(VIEWS.PROSPECTS);
      }
      setToast({ tone: "success", message: `${prospect.name} eliminado.` });
    } catch (error) {
      setToast({ tone: "error", message: error.message || "No se pudo eliminar el prospecto." });
    } finally {
      setBusy("");
    }
  }

  async function handleRegenerateAnalysis(target = selectedProspect) {
    if (!target) return null;
    setBusy("analysis");
    try {
      const nextProspect = await regenerateProspectAnalysis(workspace.id, target);
      upsertProspect(nextProspect);
      setView(VIEWS.ANALYSIS);
      setToast({ tone: "success", message: "Análisis regenerado correctamente." });
      return nextProspect;
    } finally {
      setBusy("");
    }
  }

  async function handleUpdateNextAction({ type, date }) {
    if (!selectedProspect) return;
    try {
      const nextProspect = await updateNextAction(selectedProspect.id, { type, date });
      upsertProspect(nextProspect);
      setToast({ tone: "success", message: "Próxima acción guardada." });
    } catch (error) {
      setToast({ tone: "error", message: error.message || "No se pudo guardar la acción." });
    }
  }

  async function handleUpdatePipelineStage(prospectId, stage) {
    try {
      const nextProspect = await updatePipelineStage(prospectId, stage);
      upsertProspect(nextProspect);
    } catch (error) {
      setToast({ tone: "error", message: error.message || "No se pudo actualizar la etapa." });
    }
  }

  // Map proposal status → pipeline stage (only advance, never go back)
  const PROPOSAL_STAGE_MAP = {
    enviada:     "propuesta",
    negociacion: "negociacion",
    aceptada:    "ganado",
    rechazada:   "perdido"
  };
  const STAGE_ORDER = ["lead","contactado","respondio","reunion","propuesta","negociacion","ganado","perdido"];

  async function handleSaveProposal(payload) {
    if (!selectedProspect || !workspace) return;
    setSavingProposal(true);
    try {
      const existing = proposals.find((p) => p.version === payload.version && !payload.isNewVersion);
      const saved = await saveProposal(workspace.id, selectedProspect.id, { ...payload, id: existing?.id }, payload.isNewVersion);
      setProposals((prev) => {
        const without = prev.filter((p) => p.id !== saved.id);
        return [...without, saved].sort((a, b) => b.version - a.version);
      });
      setAllProposals((prev) => {
        const without = prev.filter((proposal) => proposal.id !== saved.id);
        return [saved, ...without].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
      });

      // Auto-advance pipeline stage based on proposal status
      const targetStage = PROPOSAL_STAGE_MAP[payload.status];
      if (targetStage) {
        const currentIdx = STAGE_ORDER.indexOf(selectedProspect.pipelineStage || "lead");
        const targetIdx  = STAGE_ORDER.indexOf(targetStage);
        if (targetIdx > currentIdx) {
          const updated = await updatePipelineStage(selectedProspect.id, targetStage);
          upsertProspect(updated);
          setToast({ tone: "success", message: `Propuesta guardada · Pipeline avanzó a "${targetStage}".` });
        } else {
          setToast({ tone: "success", message: payload.isNewVersion ? `Propuesta v${saved.version} guardada.` : "Propuesta actualizada." });
        }
      } else {
        setToast({ tone: "success", message: payload.isNewVersion ? `Propuesta v${saved.version} guardada.` : "Propuesta actualizada." });
      }
    } catch (error) {
      setToast({ tone: "error", message: error.message || "No se pudo guardar la propuesta." });
    } finally {
      setSavingProposal(false);
    }
  }

  async function handleRegenerateKit(target = selectedProspect) {
    if (!target) return null;
    setBusy("kit");
    try {
      const nextProspect = await regenerateProspectKit(workspace.id, target);
      upsertProspect(nextProspect);
      setView(VIEWS.KIT);
      setToast({ tone: "success", message: "Kit regenerado correctamente." });
      return nextProspect;
    } finally {
      setBusy("");
    }
  }

  const isMobile = useIsMobile();
  const dismissToast = useCallback(() => setToast(null), []);

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
    return <WorkspaceReadyScreen debugError={debugError} onRetry={refreshWorkspace} onSignOut={signOut} />;
  }

  const canAccessAssets = canUse(FEATURES.ASSET_EXPORT, workspace);

  let screen = (
    <DashboardScreen
      prospects={prospects}
      metrics={metrics}
      proposals={allProposals}
      activeProposalMap={activeProposalMap}
      onOpenView={navigate}
      onSelectProspect={(prospect) => setSelectedProspectId(prospect?.id || null)}
      onSeedDemo={handleSeedDemo}
      loading={busy === "demo"}
      onCreateProspect={() => { setOpenNewProspect(true); navigate(VIEWS.PROSPECTS); }}
      clients={clients}
      payments={payments}
      renewals={renewals}
      tasks={tasks}
    />
  );

  if (view === VIEWS.PROSPECTS) {
    screen = (
      <ProspectsScreen
        prospects={prospects}
        onCreate={handleCreateProspect}
        busy={busy === "create"}
        autoOpenModal={openNewProspect}
        onModalClose={() => setOpenNewProspect(false)}
        onOpenProspect={(prospect) => {
          setSelectedProspectId(prospect.id);
          setView(prospect.analysis ? VIEWS.ANALYSIS : VIEWS.DETAIL);
        }}
        onDeleteProspect={handleDeleteProspect}
      />
    );
  }

  if (view === VIEWS.DETAIL) {
    screen = (
      <DetailScreen
        prospect={selectedProspect}
        busy={Boolean(busy)}
        onOpenView={navigate}
        onGenerateAnalysis={() => handleGenerateAnalysis(selectedProspect)}
        onRegenerateAnalysis={() => handleRegenerateAnalysis(selectedProspect)}
        onGenerateKit={() => handleGenerateKit(selectedProspect)}
        onMarkContacted={handleMarkContacted}
        onDelete={() => selectedProspect && handleDeleteProspect(selectedProspect)}
        onUpdateNotes={handleUpdateNotes}
        onUpdateProspect={handleUpdateProspect}
        onUpdateNextAction={(action) => handleUpdateNextAction(action)}
      />
    );
  }

  if (view === VIEWS.ANALYSIS) {
    screen = (
      <AnalysisScreen
        prospect={selectedProspect}
        proposals={proposals}
        onGenerateAnalysis={() => handleGenerateAnalysis(selectedProspect)}
        onRegenerateAnalysis={() => handleRegenerateAnalysis(selectedProspect)}
        onGenerateKit={() => handleGenerateKit(selectedProspect)}
        onOpenAssets={() => navigate(VIEWS.ASSETS)}
        onOpenROI={() => navigate(VIEWS.ROI)}
        onOpenLTV={() => navigate(VIEWS.LTV)}
        onOpenGap={() => navigate(VIEWS.GAP)}
      />
    );
  }

  if (view === VIEWS.KIT) {
    screen = (
      <KitScreen
        prospect={selectedProspect}
        onGenerateKit={() => handleGenerateKit(selectedProspect)}
        onRegenerateKit={() => handleRegenerateKit(selectedProspect)}
        onOpenAssets={() => navigate(VIEWS.ASSETS)}
        onMarkContacted={async () => {
          if (!selectedProspect) return;
          const currentStage = selectedProspect.pipelineStage || "lead";
          if (currentStage === "lead" || currentStage === "nuevo") {
            await handleUpdatePipelineStage(selectedProspect.id, "contactado");
          }
        }}
      />
    );
  }

  if (view === VIEWS.PIPELINE) {
    screen = (
      <PipelineScreen
        prospects={prospects}
        activeProposalMap={activeProposalMap}
        onUpdateStage={handleUpdatePipelineStage}
        onSelectProspect={(prospect) => {
          setSelectedProspectId(prospect.id);
          setView(prospect.analysis ? VIEWS.ANALYSIS : VIEWS.DETAIL);
        }}
        onConvertToClient={async (prospect) => {
          try {
            const client = await convertProspectToClient(workspace.id, prospect);
            setClients((prev) => [client, ...prev]);
            setSelectedClientId(client.id);
            setView(VIEWS.CLIENT_DETAIL);
            setToast({ tone: "success", message: `${prospect.name} convertido a cliente ✓` });
          } catch (err) {
            setToast({ tone: "error", message: err.message || "No se pudo convertir el prospecto." });
          }
        }}
      />
    );
  }

  if (view === VIEWS.ASSETS) {
    screen = canAccessAssets ? <AssetsScreen prospect={selectedProspect} proposals={proposals} /> : <EmptyState title="Tu plan no incluye exportación" description="La estructura ya soporta feature gating por plan. En esta demo el plan Starter sí habilita assets, pero este mensaje protege el flujo." />;
  }

  if (view === VIEWS.ROI) {
    screen = (
      <ROIScreen
        prospect={selectedProspect}
        proposals={proposals}
        onBack={() => navigate(selectedProspect?.analysis ? VIEWS.ANALYSIS : VIEWS.DETAIL)}
      />
    );
  }

  if (view === VIEWS.LTV) {
    screen = (
      <LTVScreen
        prospect={selectedProspect}
        proposals={proposals}
        onBack={() => navigate(selectedProspect?.analysis ? VIEWS.ANALYSIS : VIEWS.DETAIL)}
      />
    );
  }

  if (view === VIEWS.GAP) {
    screen = (
      <GapScreen
        prospect={selectedProspect}
        onBack={() => navigate(selectedProspect?.analysis ? VIEWS.ANALYSIS : VIEWS.DETAIL)}
      />
    );
  }

  if (view === VIEWS.PROPOSAL) {
    screen = (
      <ProposalScreen
        prospect={selectedProspect}
        proposals={proposals}
        onSave={handleSaveProposal}
        onBack={() => navigate(selectedProspect?.analysis ? VIEWS.ANALYSIS : VIEWS.DETAIL)}
        saving={savingProposal}
        workspaceId={workspace?.id}
      />
    );
  }

  if (view === VIEWS.ATTACK) {
    screen = (
      <AttackPlanScreen
        prospects={prospects}
        activeProposalMap={activeProposalMap}
        onSelectProspect={(prospect) => {
          setSelectedProspectId(prospect.id);
          setView(prospect.analysis ? VIEWS.ANALYSIS : VIEWS.DETAIL);
        }}
      />
    );
  }

  // ─── Clients module ───────────────────────────────────────────────────────

  if (view === VIEWS.CLIENTS) {
    screen = (
      <ClientsScreen
        clients={clients}
        workspaceId={workspace?.id}
        onSelectClient={(client) => { setSelectedClientId(client.id); setView(VIEWS.CLIENT_DETAIL); }}
        onClientCreated={(client) => setClients((prev) => [client, ...prev])}
      />
    );
  }

  if (view === VIEWS.CLIENT_DETAIL) {
    screen = (
      <ClientDetailScreen
        client={selectedClient}
        workspaceId={workspace?.id}
        onBack={() => setView(VIEWS.CLIENTS)}
        onUpdate={(updated) => setClients((prev) => prev.map((c) => c.id === updated.id ? updated : c))}
        onDelete={async () => {
          if (selectedClient) {
            await deleteClient(selectedClient);
            setClients((prev) => prev.filter((c) => c.id !== selectedClient.id));
            setSelectedClientId(null);
            setView(VIEWS.CLIENTS);
          }
        }}
      />
    );
  }

  if (view === VIEWS.PAYMENTS) {
    screen = (
      <PaymentsScreen
        payments={payments}
        clients={clients}
        workspaceId={workspace?.id}
        onPaymentsChange={(updated) => setPayments((prev) => prev.map((p) => p.id === updated.id ? updated : p))}
      />
    );
  }

  if (view === VIEWS.RENEWALS) {
    screen = (
      <RenewalsScreen
        renewals={renewals}
        clients={clients}
        workspaceId={workspace?.id}
        onRenewalsChange={(action, item) => {
          if (action === "create") setRenewals((prev) => [...prev, item].sort((a, b) => (a.expires_at || "").localeCompare(b.expires_at || "")));
          if (action === "update") setRenewals((prev) => prev.map((r) => r.id === item.id ? item : r));
          if (action === "delete") setRenewals((prev) => prev.filter((r) => r.id !== item.id));
        }}
      />
    );
  }

  if (view === VIEWS.TASKS) {
    screen = (
      <TasksScreen
        tasks={tasks}
        clients={clients}
        workspaceId={workspace?.id}
        onTasksChange={(action, item) => {
          if (action === "update") setTasks((prev) => prev.map((t) => t.id === item.id ? item : t));
          if (action === "delete") setTasks((prev) => prev.filter((t) => t.id !== item.id));
        }}
      />
    );
  }

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: theme.bg, overflow: "hidden" }}>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minWidth: 0 }}>
          {loadingProspects ? <FullscreenLoader label="Cargando prospects..." /> : screen}
        </div>
        <Sidebar
          isMobile={true}
          view={view}
          setView={navigate}
          prospect={selectedProspect}
          profile={profile}
          workspace={workspace}
          onSignOut={signOut}
          prospects={prospects}
          clients={clients}
          onOpenProspect={(p) => {
            setSelectedProspectId(p.id);
            setView(p.analysis ? VIEWS.ANALYSIS : VIEWS.DETAIL);
          }}
        />
        {toast ? <Toast tone={toast.tone} message={toast.message} onClose={dismissToast} /> : null}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: theme.bg, overflow: "hidden" }}>
      <Sidebar
        isMobile={false}
        view={view}
        setView={navigate}
        prospect={selectedProspect}
        profile={profile}
        workspace={workspace}
        onSignOut={signOut}
        prospects={prospects}
        clients={clients}
        onOpenProspect={(p) => {
          setSelectedProspectId(p.id);
          setView(p.analysis ? VIEWS.ANALYSIS : VIEWS.DETAIL);
        }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>{loadingProspects ? <FullscreenLoader label="Cargando prospects..." /> : screen}</div>
      {toast ? <Toast tone={toast.tone} message={toast.message} onClose={dismissToast} /> : null}
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
