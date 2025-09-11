import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, Lock, UserPlus } from 'lucide-react';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  name: string;
}

interface LoginFormProps {
  onLogin: (user: User, accessToken: string) => void;
  onShowSignUp: () => void;
}

export function LoginForm({ onLogin, onShowSignUp }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { user, accessToken } = await authService.signIn({
        email: email.trim(),
        password
      });
      
      onLogin(user, accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-xl border-0">
        <CardHeader className="text-center pb-8 bg-primary/5 rounded-t-lg">
          <CardTitle className="text-3xl text-primary mb-2 brand-title">
            Gestión de caja LBJ
          </CardTitle>
          <p className="text-muted-foreground text-lg body-text">Accede a tu panel de control</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-medium body-text">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="pl-12 h-14 text-lg"
                  disabled={loading}
                  required
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-medium body-text">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  className="pl-12 h-14 text-lg"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="p-4">
                <AlertDescription className="text-base">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 pt-4">
              <Button 
                type="submit" 
                className="w-full h-14 text-lg button-text"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>

              <Button 
                type="button" 
                variant="outline"
                className="w-full h-14 text-lg button-text"
                size="lg"
                onClick={onShowSignUp}
                disabled={loading}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Crear nueva cuenta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}