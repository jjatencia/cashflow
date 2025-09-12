import { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { SignUpForm } from './components/SignUpForm';
import { CashFlowDashboard } from './components/CashFlowDashboard';
import { ThemeProvider } from './components/ThemeProvider';
import { authService } from './services/authService';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
}

export default function App() {
  const [authState, setAuthState] = useState<AuthState>({ user: null, accessToken: null });
  const [loading, setLoading] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    // Check for existing session
    checkSession();

    // Listen to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((session) => {
      try {
        if (session) {
          setAuthState({ user: session.user, accessToken: session.accessToken });
        } else {
          setAuthState({ user: null, accessToken: null });
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        setAuthState({ user: null, accessToken: null });
      }
      setLoading(false);
    });

    return () => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing from auth state changes:', error);
      }
    };
  }, []);

  const checkSession = async () => {
    try {
      const session = await authService.getCurrentSession();
      if (session) {
        setAuthState({ user: session.user, accessToken: session.accessToken });
      } else {
        setAuthState({ user: null, accessToken: null });
      }
    } catch (error) {
      console.error('Error checking session:', error);
      // Clear auth state on session check error
      setAuthState({ user: null, accessToken: null });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user: User, accessToken: string) => {
    setAuthState({ user, accessToken });
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Error logging out:', error);
      // Continue with logout even if there's an error
    } finally {
      // Always clear the local auth state regardless of API response
      setAuthState({ user: null, accessToken: null });
    }
  };

  const handleSignUpSuccess = () => {
    setShowSignUp(false);
    // Show success message or redirect to login
    alert('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="barberia-theme">
      {loading ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground font-secondary">Cargando...</p>
          </div>
        </div>
      ) : !authState.user ? (
        showSignUp ? (
          <SignUpForm 
            onSignUpSuccess={handleSignUpSuccess}
            onBackToLogin={() => setShowSignUp(false)}
          />
        ) : (
          <LoginForm 
            onLogin={handleLogin}
            onShowSignUp={() => setShowSignUp(true)}
          />
        )
      ) : (
        <CashFlowDashboard 
          user={authState.user.name} 
          onLogout={handleLogout} 
        />
      )}
    </ThemeProvider>
  );
}
