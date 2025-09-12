import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  name: string;
}

interface EmailConfirmationProps {
  token?: string;
  onConfirmationSuccess: (user: User, accessToken: string) => void;
  onBackToLogin: () => void;
}

export function EmailConfirmation({ token, onConfirmationSuccess, onBackToLogin }: EmailConfirmationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (token && !confirmed) {
      handleEmailConfirmation();
    }
  }, [token, confirmed]);

  const handleEmailConfirmation = async () => {
    if (!token) {
      setError('Token de verificación no encontrado');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.confirmEmail(token);
      setSuccess(true);
      setConfirmed(true);
      
      // Esperar un momento antes de redirigir para que el usuario vea el mensaje de éxito
      setTimeout(() => {
        onConfirmationSuccess(result.user, result.accessToken);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar el email');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryConfirmation = () => {
    if (token) {
      handleEmailConfirmation();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-xl border-0">
        <CardHeader className={`text-center pb-8 rounded-t-lg ${
          success ? 'bg-green-50' : error ? 'bg-red-50' : 'bg-blue-50'
        }`}>
          <div className="flex items-center justify-center mb-6">
            {loading ? (
              <div className="bg-blue-500 p-4 rounded-full">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            ) : success ? (
              <div className="bg-green-500 p-4 rounded-full">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            ) : error ? (
              <div className="bg-red-500 p-4 rounded-full">
                <XCircle className="w-10 h-10 text-white" />
              </div>
            ) : (
              <div className="bg-blue-500 p-4 rounded-full">
                <Mail className="w-10 h-10 text-white" />
              </div>
            )}
          </div>
          
          <CardTitle className={`text-3xl mb-2 brand-title ${
            success ? 'text-green-700' : error ? 'text-red-700' : 'text-blue-700'
          }`}>
            {loading ? 'Verificando...' : success ? '¡Cuenta Verificada!' : error ? 'Error de Verificación' : 'Verificación de Email'}
          </CardTitle>
          
          <p className="text-muted-foreground text-lg body-text">
            {loading ? 'Estamos verificando tu cuenta' : 
             success ? 'Tu cuenta ha sido activada exitosamente' :
             error ? 'Hubo un problema al verificar tu cuenta' :
             'Procesando verificación de email'}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {success && (
            <Alert className="p-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-base text-green-700">
                ¡Perfecto! Tu cuenta ha sido verificada. Serás redirigido automáticamente en unos segundos...
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="p-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="text-base">{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <Alert className="p-4 bg-blue-50 border-blue-200">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              <AlertDescription className="text-base text-blue-700">
                Verificando tu email, por favor espera...
              </AlertDescription>
            </Alert>
          )}

          {!token && !loading && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                No se encontró un token de verificación válido.
              </p>
              <p className="text-sm text-muted-foreground">
                Por favor, revisa el enlace del email o solicita un nuevo email de verificación.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {error && token && (
              <Button 
                onClick={handleRetryConfirmation}
                className="w-full h-14 text-lg"
                disabled={loading}
              >
                {loading ? 'Reintentando...' : 'Reintentar Verificación'}
              </Button>
            )}

            {!loading && !success && (
              <Button 
                type="button" 
                variant="ghost"
                className="w-full h-14 text-lg"
                onClick={onBackToLogin}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver al login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}