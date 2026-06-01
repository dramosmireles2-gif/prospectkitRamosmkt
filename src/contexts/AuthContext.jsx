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

    async function bootstrap() {
      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        try {
          const nextProfile = await getProfile(currentSession.user.id);
          if (isMounted) {
            setProfile(nextProfile);
          }
        } catch (error) {
          console.error("Error loading profile", error);
        }
      }

      if (isMounted) {
        setLoading(false);
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
