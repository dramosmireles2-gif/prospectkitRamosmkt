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
        console.error("Auth bootstrap timeout");
        setLoading(false);
      }
    }, 10000);

    // getSession() reads from localStorage immediately — no network needed if token is fresh.
    // onAuthStateChange handles token refreshes after that.
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!isMounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      clearTimeout(timeoutId);
      setLoading(false);
      if (s?.user) {
        getProfile(s.user.id).then((p) => { if (isMounted) setProfile(p); }).catch(() => {});
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
      clearTimeout(timeoutId);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) {
        getProfile(nextSession.user.id).then((p) => { if (isMounted) setProfile(p); }).catch(() => {});
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
    if (!user) { setProfile(null); return null; }
    const p = await getProfile(user.id);
    setProfile(p);
    return p;
  }

  return (
    <AuthContext.Provider value={{ hasConfig: hasSupabaseConfig, session, user, profile, loading, signIn: signInWithPassword, signUp: signUpWithPassword, signOut: signOutCurrentUser, reloadProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
