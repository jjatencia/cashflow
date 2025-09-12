import { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { SignUpForm } from './components/SignUpForm';
import { EmailConfirmation } from './components/EmailConfirmation';
import { CashFlowDashboard } from './components/CashFlowDashboard';
import { SessionTimeoutWarning } from './components/SessionTimeoutWarning';
import { ThemeProvider } from './components/ThemeProvider';
import { ThemeToggle } from './components/ThemeToggle';
import { authService } from './services/authService';
import { useSessionTimeout } from './hooks/useSessionTimeout';

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
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [confirmationToken, setConfirmationToken] = useState<string | undefined>();

  useEffect(() => {
    // Check for email confirmation token in URL
    checkForEmailConfirmation();
    
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

  const checkForEmailConfirmation = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || urlParams.get('token_hash');
    const type = urlParams.get('type');
    
    console.log('Checking URL params:', { token, type, fullURL: window.location.href });
    
    if (token && type === 'signup') {
      console.log('Email confirmation detected, token:', token);
      setConfirmationToken(token);
      setShowEmailConfirmation(true);
      // Limpiar la URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

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
    // Ya no mostramos alert, el usuario verá la pantalla de verificación
  };

  const handleEmailConfirmationSuccess = (user: User, accessToken: string) => {
    setAuthState({ user, accessToken });
    setShowEmailConfirmation(false);
    setShowTimeoutWarning(false);
  };

  // Configurar auto-logout solo cuando hay usuario autenticado
  const sessionTimeoutActive = !!authState.user && !loading;
  
  useSessionTimeout({
    onTimeout: sessionTimeoutActive ? handleLogout : () => {},
    timeoutDuration: 3 * 60 * 1000, // 3 minutos de inactividad
    warningDuration: 30 * 1000, // 30 segundos de warning
    onWarning: sessionTimeoutActive ? () => setShowTimeoutWarning(true) : () => {}
  });
  return (
    <ThemeProvider defaultTheme="system" storageKey="barberia-theme">
      {!authState.user && !loading && (
        <div className="fixed top-4 right-4">
          <ThemeToggle />
        </div>
      )}
      {loading ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground font-secondary">Cargando...</p>
          </div>
        </div>
      ) : !authState.user ? (
        showEmailConfirmation ? (
          <EmailConfirmation 
            token={confirmationToken}
            onConfirmationSuccess={handleEmailConfirmationSuccess}
            onBackToLogin={() => {
              setShowEmailConfirmation(false);
              setShowSignUp(false);
            }}
          />
        ) : showSignUp ? (
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
        <>
          <CashFlowDashboard
            user={authState.user.name}
            onLogout={handleLogout}
          />
          <SessionTimeoutWarning 
            isOpen={showTimeoutWarning}
            onExtendSession={() => setShowTimeoutWarning(false)}
            onLogout={handleLogout}
            countdown={30}
          />
        </>
      )}
    </ThemeProvider>
  );
}
