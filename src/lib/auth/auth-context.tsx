"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { createClient } from "@/lib/supabase/client";
import type { Session, User as SupabaseUser, SupabaseClient } from "@supabase/supabase-js";

type UserRole = "admin" | "client";

interface ConvexUser {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  orgId?: string;
  supabaseUserId: string;
  isActive: boolean;
  createdAt: number;
}

interface AuthContextValue {
  user: ConvexUser | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  role: UserRole | null;
  orgId: string | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  supabaseUser: null,
  session: null,
  role: null,
  orgId: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseRef = useRef<SupabaseClient | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabaseRef.current = supabase;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setSupabaseUser(s?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setSupabaseUser(s?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const convexUser = useQuery(
    api.users.getBySupabaseId,
    supabaseUser?.id ? { supabaseUserId: supabaseUser.id } : "skip"
  ) as ConvexUser | null | undefined;

  const recordLogin = useMutation(api.users.recordLogin);
  const loginRecordedRef = useRef<string | null>(null);

  useEffect(() => {
    if (convexUser && loginRecordedRef.current !== convexUser._id) {
      loginRecordedRef.current = convexUser._id;
      recordLogin({ userId: convexUser._id as never }).catch(() => {
        // silently ignore login tracking errors
      });
    }
  }, [convexUser, recordLogin]);

  const user = convexUser ?? null;
  const role = user?.role ?? null;
  const orgId = user?.orgId ?? null;

  const signOut = async () => {
    if (supabaseRef.current) {
      await supabaseRef.current.auth.signOut();
    }
    setSession(null);
    setSupabaseUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        role,
        orgId,
        isLoading: isLoading || (!!supabaseUser && convexUser === undefined),
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
