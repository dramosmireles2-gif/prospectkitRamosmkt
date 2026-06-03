import { createContext, useContext, useEffect, useState } from "react";
import { getProfile, signInWithPassword, signOutCurrentUser, signUpWithPassword } from "../services/auth";
import { hasSupabaseConfig, supabase } from "../services/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(hasSupabaseConfig);

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setLoading(false);
      return undefined;
    }

    let isMounted = true;
    let resolved = false;

    const timeoutId = setTimeout(() => {
      if (isMounted && !resolved) {
        console.error("Auth bootstrap timeout — check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
        resolved = true;
        setLoading(false);
      }
    }, 10000);

    async function loadProfile(userId) {
      try {
        const nextProfile = await getProfile(userId);
        if (isMounted) setProfile(nextProfile);
      } catch (error) {
        console.error("Error loading profile", error);
      }
    }

    // Use onAuthStateChange as the single source of truth.
    // INITIAL_SESSION fires first with the refreshed token (never expired).
    // This avoids the race condition where getSession() returns a stale cached token.
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!isMounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        await loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }

      // Resolve loading on first event (INITIAL_SESSION, SIGNED_IN, etc.)
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  async function reloadProfile() {
    if (!user) {
      setProfile(null);
      return null;
    }

    const nextProfile = await getProfile(user.id);
    setProfile(nextProfile);
    return nextProfile;
  }

  const value = {
    hasConfig: hasSupabaseConfig,
    session,
    user,
    profile,
    loading,
    signIn: signInWithPassword,
    signUp: signUpWithPassword,
    signOut: signOutCurrentUser,
    reloadProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
