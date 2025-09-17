import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';

interface SignUpFormProps {
  onSignUpSuccess: () => void;
  onBackToLogin: () => void;
}

export function SignUpForm({ onSignUpSuccess, onBackToLogin }: SignUpFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.signUp({
        email: email.trim(),
        password,
        name: name.trim()
      });
      
      if (result.needsConfirmation) {
        setEmailSent(true);
        setSuccess(result.message);
        setError('');
      } else {
        // Si no necesita confirmación, redirigir directamente
        onSignUpSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await authService.resendConfirmation(email.trim());
      setSuccess('Email de verificación reenviado. Revisa tu bandeja de entrada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reenviar el email');
    } finally {
      setLoading(false);
    }
  };

  // Si el email ya fue enviado, mostrar pantalla de confirmación
  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-lg shadow-xl border-0">
          <CardHeader className="text-center pb-8 bg-green-50 rounded-t-lg">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-green-500 p-4 rounded-full">
                <Mail className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl mb-2 brand-title text-green-700">¡Revisa tu email!</CardTitle>
            <p className="text-muted-foreground text-lg body-text">
              Te hemos enviado un enlace de verificación
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {success && (
              <Alert className="p-4 bg-green-50 border-green-200">
                <AlertDescription className="text-base text-green-700">{success}</AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive" className="p-4">
                <AlertDescription className="text-base">{error}</AlertDescription>
              </Alert>
            )}

            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Hemos enviado un enlace de verificación a:<br />
                <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Si no ves el email, revisa tu carpeta de spam o correo no deseado.
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={handleResendEmail}
                variant="outline"
                className="w-full h-14 text-lg"
                disabled={loading}
              >
                {loading ? 'Reenviando...' : 'Reenviar email'}
              </Button>

              <Button 
                type="button" 
                variant="ghost"
                className="w-full h-14 text-lg"
                onClick={onBackToLogin}
                disabled={loading}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver al login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-xl border-0">
        <CardHeader className="text-center pb-8 bg-primary/5 rounded-t-lg">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary p-4 rounded-full">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl mb-2 brand-title">Crear Cuenta</CardTitle>
          <p className="text-muted-foreground text-lg body-text">
            Gestión de caja LBJ
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-base font-medium body-text">Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-12 h-14 text-lg"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-medium body-text">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 text-lg"
                  disabled={loading}
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
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 text-lg"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-base font-medium body-text">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirma tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12 h-14 text-lg"
                  disabled={loading}
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
                className="w-full h-14 text-lg"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>

              <Button 
                type="button" 
                variant="ghost"
                className="w-full h-14 text-lg"
                size="lg"
                onClick={onBackToLogin}
                disabled={loading}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver al login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
