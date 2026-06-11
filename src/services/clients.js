// Servicio de Clientes — localStorage primary, Supabase-ready
import { supabase } from "./supabase";

function uid() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ─── LocalStorage helpers ───────────────────────────────────────────────────

function lsGet(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}

function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function lsKey(table, workspaceId) {
  return `rmkt_${table}_${workspaceId}`;
}

// ─── Clients ────────────────────────────────────────────────────────────────

export async function listClients(workspaceId) {
  if (supabase) {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (!error) return data || [];
  }
  return lsGet(lsKey("clients", workspaceId));
}

export async function createClient(workspaceId, fields) {
  const record = {
    id: uid(),
    workspace_id: workspaceId,
    prospect_id: null,
    status: "activo",
    started_at: today(),
    created_at: now(),
    updated_at: now(),
    ...fields
  };
  if (supabase) {
    const { data, error } = await supabase.from("clients").insert(record).select().single();
    if (!error) return data;
  }
  const list = lsGet(lsKey("clients", workspaceId));
  list.unshift(record);
  lsSet(lsKey("clients", workspaceId), list);
  return record;
}

export async function updateClient(client) {
  const record = { ...client, updated_at: now() };
  if (supabase) {
    const { data, error } = await supabase.from("clients").update(record).eq("id", record.id).select().single();
    if (!error) return data;
  }
  const list = lsGet(lsKey("clients", record.workspace_id));
  const idx = list.findIndex((c) => c.id === record.id);
  if (idx !== -1) list[idx] = record;
  lsSet(lsKey("clients", record.workspace_id), list);
  return record;
}

export async function deleteClient(client) {
  if (supabase) {
    await supabase.from("clients").delete().eq("id", client.id);
    return;
  }
  const list = lsGet(lsKey("clients", client.workspace_id)).filter((c) => c.id !== client.id);
  lsSet(lsKey("clients", client.workspace_id), list);
}

// Convert a prospect to a client
export async function convertProspectToClient(workspaceId, prospect) {
  const fields = {
    prospect_id: prospect.id,
    name: prospect.name,
    contact_name: prospect.contactName || "",
    whatsapp: prospect.whatsapp || "",
    email: prospect.email || "",
    city: prospect.city || "",
    notes: prospect.notes || ""
  };
  return createClient(workspaceId, fields);
}

// ─── Client Services ─────────────────────────────────────────────────────────

export async function listClientServices(workspaceId, clientId) {
  if (supabase) {
    const { data, error } = await supabase
      .from("client_services")
      .select("*")
      .eq("client_id", clientId)
      .order("contracted_at", { ascending: false });
    if (!error) return data || [];
  }
  return lsGet(lsKey("client_services", workspaceId)).filter((s) => s.client_id === clientId);
}

export async function listAllClientServices(workspaceId) {
  if (supabase) {
    const { data, error } = await supabase
      .from("client_services")
      .select("*")
      .eq("workspace_id", workspaceId);
    if (!error) return data || [];
  }
  return lsGet(lsKey("client_services", workspaceId));
}

export async function createClientService(workspaceId, clientId, fields) {
  const record = {
    id: uid(),
    workspace_id: workspaceId,
    client_id: clientId,
    status: "activo",
    contracted_at: today(),
    created_at: now(),
    updated_at: now(),
    ...fields
  };
  if (supabase) {
    const { data, error } = await supabase.from("client_services").insert(record).select().single();
    if (!error) return data;
  }
  const list = lsGet(lsKey("client_services", workspaceId));
  list.unshift(record);
  lsSet(lsKey("client_services", workspaceId), list);
  return record;
}

export async function updateClientService(workspaceId, svc) {
  const record = { ...svc, updated_at: now() };
  if (supabase) {
    const { data, error } = await supabase.from("client_services").update(record).eq("id", record.id).select().single();
    if (!error) return data;
  }
  const list = lsGet(lsKey("client_services", workspaceId));
  const idx = list.findIndex((s) => s.id === record.id);
  if (idx !== -1) list[idx] = record;
  lsSet(lsKey("client_services", workspaceId), list);
  return record;
}

export async function deleteClientService(workspaceId, svcId) {
  if (supabase) { await supabase.from("client_services").delete().eq("id", svcId); return; }
  const list = lsGet(lsKey("client_services", workspaceId)).filter((s) => s.id !== svcId);
  lsSet(lsKey("client_services", workspaceId), list);
}

// ─── Payments ────────────────────────────────────────────────────────────────

export async function listPayments(workspaceId, clientId = null) {
  if (supabase) {
    let q = supabase.from("payments").select("*").eq("workspace_id", workspaceId).order("due_date");
    if (clientId) q = q.eq("client_id", clientId);
    const { data, error } = await q;
    if (!error) return data || [];
  }
  const all = lsGet(lsKey("payments", workspaceId));
  return clientId ? all.filter((p) => p.client_id === clientId) : all;
}

export async function createPayment(workspaceId, clientId, fields) {
  const record = {
    id: uid(),
    workspace_id: workspaceId,
    client_id: clientId,
    status: "pendiente",
    payment_type: "unico",
    created_at: now(),
    updated_at: now(),
    ...fields
  };
  if (supabase) {
    const { data, error } = await supabase.from("payments").insert(record).select().single();
    if (!error) return data;
  }
  const list = lsGet(lsKey("payments", workspaceId));
  list.push(record);
  lsSet(lsKey("payments", workspaceId), list);
  return record;
}

export async function updatePayment(workspaceId, payment) {
  const record = { ...payment, updated_at: now() };
  if (supabase) {
    const { data, error } = await supabase.from("payments").update(record).eq("id", record.id).select().single();
    if (!error) return data;
  }
  const list = lsGet(lsKey("payments", workspaceId));
  const idx = list.findIndex((p) => p.id === record.id);
  if (idx !== -1) list[idx] = record;
  lsSet(lsKey("payments", workspaceId), list);
  return record;
}

export async function deletePayment(workspaceId, paymentId) {
  if (supabase) { await supabase.from("payments").delete().eq("id", paymentId); return; }
  const list = lsGet(lsKey("payments", workspaceId)).filter((p) => p.id !== paymentId);
  lsSet(lsKey("payments", workspaceId), list);
}

// ─── Renewals ────────────────────────────────────────────────────────────────

export async function listRenewals(workspaceId) {
  if (supabase) {
    const { data, error } = await supabase
      .from("renewals")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("expires_at");
    if (!error) return data || [];
  }
  return lsGet(lsKey("renewals", workspaceId)).sort((a, b) => (a.expires_at || "").localeCompare(b.expires_at || ""));
}

export async function createRenewal(workspaceId, fields) {
  const record = {
    id: uid(),
    workspace_id: workspaceId,
    status: "activo",
    created_at: now(),
    updated_at: now(),
    ...fields
  };
  if (supabase) {
    const { data, error } = await supabase.from("renewals").insert(record).select().single();
    if (!error) return data;
  }
  const list = lsGet(lsKey("renewals", workspaceId));
  list.push(record);
  lsSet(lsKey("renewals", workspaceId), list);
  return record;
}

export async function updateRenewal(workspaceId, renewal) {
  const record = { ...renewal, updated_at: now() };
  if (supabase) {
    const { data, error } = await supabase.from("renewals").update(record).eq("id", record.id).select().single();
    if (!error) return data;
  }
  const list = lsGet(lsKey("renewals", workspaceId));
  const idx = list.findIndex((r) => r.id === record.id);
  if (idx !== -1) list[idx] = record;
  lsSet(lsKey("renewals", workspaceId), list);
  return record;
}

export async function deleteRenewal(workspaceId, renewalId) {
  if (supabase) { await supabase.from("renewals").delete().eq("id", renewalId); return; }
  const list = lsGet(lsKey("renewals", workspaceId)).filter((r) => r.id !== renewalId);
  lsSet(lsKey("renewals", workspaceId), list);
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export async function listTasks(workspaceId, clientId = null) {
  if (supabase) {
    let q = supabase.from("tasks").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
    if (clientId) q = q.eq("client_id", clientId);
    const { data, error } = await q;
    if (!error) return data || [];
  }
  const all = lsGet(lsKey("tasks", workspaceId));
  return clientId ? all.filter((t) => t.client_id === clientId) : all;
}

export async function createTask(workspaceId, clientId, fields) {
  const record = {
    id: uid(),
    workspace_id: workspaceId,
    client_id: clientId,
    status: "pendiente",
    priority: "media",
    created_at: now(),
    updated_at: now(),
    ...fields
  };
  if (supabase) {
    const { data, error } = await supabase.from("tasks").insert(record).select().single();
    if (!error) return data;
  }
  const list = lsGet(lsKey("tasks", workspaceId));
  list.unshift(record);
  lsSet(lsKey("tasks", workspaceId), list);
  return record;
}

export async function updateTask(workspaceId, task) {
  const record = { ...task, updated_at: now() };
  if (supabase) {
    const { data, error } = await supabase.from("tasks").update(record).eq("id", record.id).select().single();
    if (!error) return data;
  }
  const list = lsGet(lsKey("tasks", workspaceId));
  const idx = list.findIndex((t) => t.id === record.id);
  if (idx !== -1) list[idx] = record;
  lsSet(lsKey("tasks", workspaceId), list);
  return record;
}

export async function deleteTask(workspaceId, taskId) {
  if (supabase) { await supabase.from("tasks").delete().eq("id", taskId); return; }
  const list = lsGet(lsKey("tasks", workspaceId)).filter((t) => t.id !== taskId);
  lsSet(lsKey("tasks", workspaceId), list);
}

// ─── Activity Logs ───────────────────────────────────────────────────────────

export async function listActivityLogs(workspaceId, clientId) {
  if (supabase) {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("client_id", clientId)
      .order("happened_at", { ascending: false });
    if (!error) return data || [];
  }
  return lsGet(lsKey("activity_logs", workspaceId))
    .filter((l) => l.client_id === clientId)
    .sort((a, b) => b.happened_at.localeCompare(a.happened_at));
}

export async function createActivityLog(workspaceId, clientId, fields) {
  const record = {
    id: uid(),
    workspace_id: workspaceId,
    client_id: clientId,
    happened_at: now(),
    created_at: now(),
    type: "nota",
    ...fields
  };
  if (supabase) {
    const { data, error } = await supabase.from("activity_logs").insert(record).select().single();
    if (!error) return data;
  }
  const list = lsGet(lsKey("activity_logs", workspaceId));
  list.unshift(record);
  lsSet(lsKey("activity_logs", workspaceId), list);
  return record;
}

// ─── Dashboard metrics ───────────────────────────────────────────────────────

export function buildClientMetrics({ clients, payments, renewals, tasks }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);

  const activeClients = clients.filter((c) => c.status === "activo").length;

  // MRR from recurring payments
  const mrr = payments
    .filter((p) => p.status !== "vencido" && p.payment_type === "mensual")
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const pendingPayments = payments.filter((p) => p.status === "pendiente" && p.due_date <= todayStr);
  const overduePayments = payments.filter((p) => p.status === "pendiente" && p.due_date < todayStr);
  const monthPayments = payments.filter((p) => p.status === "pagado" && (p.paid_at || "").slice(0, 7) === todayStr.slice(0, 7));

  const upcomingRenewals = renewals.filter((r) => r.status === "activo" && r.expires_at && r.expires_at <= in30);
  const openTasks = tasks.filter((t) => t.status !== "terminado");

  return { activeClients, mrr, pendingPayments, overduePayments, monthPayments, upcomingRenewals, openTasks };
}
