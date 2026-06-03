import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getCurrentWorkspace } from "../services/workspace";
import { useAuth } from "./AuthContext";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { user, hasConfig } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(Boolean(hasConfig));
  const [lastError, setLastError] = useState(null);
  const timeoutRef = useRef(null);

  async function refreshWorkspace() {
    if (!hasConfig || !user) {
      setWorkspace(null);
      setMembership(null);
      setLoading(false);
      return null;
    }

    setLoading(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      console.error("Workspace load timeout");
      setLoading(false);
    }, 10000);

    try {
      const result = await getCurrentWorkspace(user.id);
      setWorkspace(result?.workspace ?? null);
      setMembership(result?.membership ?? null);
      setLastError(result ? null : "No se encontró workspace para este usuario.");
      return result;
    } catch (error) {
      console.error("Error loading workspace", error);
      setLastError(error?.message || JSON.stringify(error) || "Error desconocido");
      setWorkspace(null);
      setMembership(null);
      return null;
    } finally {
      clearTimeout(timeoutRef.current);
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshWorkspace();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [hasConfig, user?.id]);

  return (
    <WorkspaceContext.Provider value={{ workspace, membership, loading, lastError, refreshWorkspace }}>
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
