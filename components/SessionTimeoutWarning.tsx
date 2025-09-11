import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Clock, Shield } from 'lucide-react';

interface SessionTimeoutWarningProps {
  isOpen: boolean;
  onExtendSession: () => void;
  onLogout: () => void;
  countdown?: number; // segundos restantes
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  isOpen,
  onExtendSession,
  onLogout,
  countdown = 60
}) => {
  const [timeLeft, setTimeLeft] = useState(countdown);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(countdown);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, countdown, onLogout]);

  useEffect(() => {
    setTimeLeft(countdown);
  }, [countdown]);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
            <Shield className="h-5 w-5" />
            Sesión por expirar
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="h-4 w-4" />
              <span>
                Tu sesión expirará automáticamente en{' '}
                <span className="font-bold text-orange-600">
                  {timeLeft} segundo{timeLeft !== 1 ? 's' : ''}
                </span>{' '}
                por seguridad.
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Esto protege la información de tu caja en caso de que olvides cerrar sesión.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="flex-1"
          >
            Cerrar Sesión
          </Button>
          <Button 
            onClick={onExtendSession}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Continuar Trabajando
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};