import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getCurrentWorkspace } from "../services/workspace";
import { supabase } from "../services/supabase";
import { useAuth } from "./AuthContext";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { user, hasConfig } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(Boolean(hasConfig));
  const [debugError, setDebugError] = useState("");
  const timeoutRef = useRef(null);

  async function refreshWorkspace() {
    if (!hasConfig || !user) {
      setWorkspace(null);
      setMembership(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    setDebugError("");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      console.error("Workspace load timeout");
      setLoading(false);
    }, 15000);

    const errors = [];
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        if (attempt === 2) {
          await supabase.auth.refreshSession();
        }
        const result = await getCurrentWorkspace(user.id);
        if (result?.workspace) {
          setWorkspace(result.workspace);
          setMembership(result.membership ?? null);
          clearTimeout(timeoutRef.current);
          setLoading(false);
          return result;
        }
        errors.push(`intento ${attempt + 1}: sin workspace (userId=${user.id})`);
      } catch (error) {
        errors.push(`intento ${attempt + 1}: ${error.message}`);
        console.error(`Workspace load attempt ${attempt + 1} failed`, error);
      }
      if (attempt < 3) await new Promise((r) => setTimeout(r, 1500));
    }

    setDebugError(errors.join(" | "));
    setWorkspace(null);
    setMembership(null);
    clearTimeout(timeoutRef.current);
    setLoading(false);
    return null;
  }

  useEffect(() => {
    refreshWorkspace();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [hasConfig, user?.id]);

  return (
    <WorkspaceContext.Provider value={{ workspace, membership, loading, refreshWorkspace, debugError }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return context;
}
