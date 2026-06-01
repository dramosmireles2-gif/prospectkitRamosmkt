import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentWorkspace } from "../services/workspace";
import { useAuth } from "./AuthContext";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { user, hasConfig } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(Boolean(hasConfig));

  async function refreshWorkspace() {
    if (!hasConfig || !user) {
      setWorkspace(null);
      setMembership(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    const result = await getCurrentWorkspace(user.id);
    setWorkspace(result?.workspace ?? null);
    setMembership(result?.membership ?? null);
    setLoading(false);
    return result;
  }

  useEffect(() => {
    refreshWorkspace().catch((error) => {
      console.error("Error loading workspace", error);
      setWorkspace(null);
      setMembership(null);
      setLoading(false);
    });
  }, [hasConfig, user?.id]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        membership,
        loading,
        refreshWorkspace
      }}
    >
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
