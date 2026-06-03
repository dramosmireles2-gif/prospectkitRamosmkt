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

    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.error("Auth bootstrap timeout — check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
        setLoading(false);
      }
    }, 8000);

    async function bootstrap() {
      try {
        const {
          data: { session: currentSession }
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          try {
            const nextProfile = await getProfile(currentSession.user.id);
            if (isMounted) setProfile(nextProfile);
          } catch (error) {
            console.error("Error loading profile", error);
          }
        }
      } catch (error) {
        console.error("Auth bootstrap failed", error);
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) setLoading(false);
      }
    }

    bootstrap();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        try {
          const nextProfile = await getProfile(nextSession.user.id);
          setProfile(nextProfile);
        } catch (error) {
          console.error("Error refreshing profile", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
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
