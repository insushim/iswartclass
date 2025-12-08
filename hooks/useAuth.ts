'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const authState: AuthState = {
    user: session?.user ? {
      id: session.user.id as string,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      image: session.user.image ?? null,
    } : null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const handleSignInWithGoogle = async (callbackUrl?: string) => {
    try {
      await signIn('google', {
        callbackUrl: callbackUrl || '/dashboard',
      });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/login');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return {
    ...authState,
    signIn: handleSignIn,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    session,
  };
}
