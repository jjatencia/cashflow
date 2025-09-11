import { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { SignUpForm } from './components/SignUpForm';
import { CashFlowDashboard } from './components/CashFlowDashboard';
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
      if (session) {
        setAuthState({ user: session.user, accessToken: session.accessToken });
      } else {
        setAuthState({ user: null, accessToken: null });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const session = await authService.getCurrentSession();
      if (session) {
        setAuthState({ user: session.user, accessToken: session.accessToken });
      }
    } catch (error) {
      console.error('Error checking session:', error);
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
      setAuthState({ user: null, accessToken: null });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSignUpSuccess = () => {
    setShowSignUp(false);
    // Show success message or redirect to login
    alert('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!authState.user) {
    if (showSignUp) {
      return (
        <SignUpForm 
          onSignUpSuccess={handleSignUpSuccess}
          onBackToLogin={() => setShowSignUp(false)}
        />
      );
    }
    
    return (
      <LoginForm 
        onLogin={handleLogin}
        onShowSignUp={() => setShowSignUp(true)}
      />
    );
  }

  return (
    <CashFlowDashboard 
      user={authState.user.name} 
      onLogout={handleLogout} 
    />
  );
}