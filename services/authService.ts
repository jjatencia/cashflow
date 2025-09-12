import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-fac344bb`;

// Create Supabase client
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface User {
  id: string;
  email: string;
  name: string;
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
}

interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  // Sign up new user - ahora con verificación por email
  async signUp(userData: SignUpData): Promise<{ needsConfirmation: boolean; message: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name
          },
          emailRedirectTo: `${window.location.origin}/confirm.html`
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Si el usuario necesita confirmación por email
      if (data.user && !data.user.email_confirmed_at) {
        return {
          needsConfirmation: true,
          message: 'Te hemos enviado un email de verificación. Revisa tu bandeja de entrada y sigue las instrucciones para activar tu cuenta.'
        };
      }

      // Si por alguna razón el email ya está confirmado
      return {
        needsConfirmation: false,
        message: 'Cuenta creada exitosamente.'
      };
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  },

  // Sign in user
  async signIn(credentials: SignInData): Promise<{ user: User; accessToken: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.session || !data.user) {
        throw new Error('Error al iniciar sesión');
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata.name || data.user.email!
        },
        accessToken: data.session.access_token
      };
    } catch (error) {
      console.error('Error in signIn:', error);
      throw error;
    }
  },

  // Sign out user
  async signOut(): Promise<void> {
    try {
      // Check if there's an active session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // No active session, consider logout successful
        console.log('No active session found, logout completed');
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error && !error.message.includes('session missing')) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error in signOut:', error);
      // Don't throw the error if it's just about missing session
      if (error instanceof Error && error.message.includes('session missing')) {
        console.log('Session already cleared, logout completed');
        return;
      }
      throw error;
    }
  },

  // Get current session
  async getCurrentSession(): Promise<{ user: User; accessToken: string } | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session || !data.session.user) {
        return null;
      }

      return {
        user: {
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata.name || data.session.user.email!
        },
        accessToken: data.session.access_token
      };
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  },

  // Confirmar email con token
  async confirmEmail(token: string): Promise<{ user: User; accessToken: string }> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      });

      if (error) {
        throw new Error('Error al verificar el email: ' + error.message);
      }

      if (!data.session || !data.user) {
        throw new Error('Error al confirmar la cuenta');
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata.name || data.user.email!
        },
        accessToken: data.session.access_token
      };
    } catch (error) {
      console.error('Error in confirmEmail:', error);
      throw error;
    }
  },

  // Reenviar email de confirmación
  async resendConfirmation(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm.html`
        }
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error in resendConfirmation:', error);
      throw error;
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (session: { user: User; accessToken: string } | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        callback({
          user: {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.name || session.user.email!
          },
          accessToken: session.access_token
        });
      } else {
        callback(null);
      }
    });
  }
};
