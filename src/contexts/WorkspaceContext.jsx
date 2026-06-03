import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getCurrentWorkspace } from "../services/workspace";
import { useAuth } from "./AuthContext";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { user, hasConfig } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(Boolean(hasConfig));
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
    }, 15000);

    // Retry up to 3 times with 1.5s delay — handles cold starts and token refresh delays
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await getCurrentWorkspace(user.id);
        if (result?.workspace) {
          setWorkspace(result.workspace);
          setMembership(result.membership ?? null);
          clearTimeout(timeoutRef.current);
          setLoading(false);
          return result;
        }
      } catch (error) {
        console.error(`Workspace load attempt ${attempt + 1} failed`, error);
      }
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1500));
    }

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
    <WorkspaceContext.Provider value={{ workspace, membership, loading, refreshWorkspace }}>
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
