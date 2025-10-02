import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { RefreshCw, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdateNotification() {
  const [dismissed, setDismissed] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('Service Worker registrado exitosamente');

      // Verificar actualizaciones cada hora
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // 1 hora
      }
    },
    onRegisterError(error) {
      console.error('Error al registrar Service Worker:', error);
    },
  });

  const handleUpdate = async () => {
    await updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setNeedRefresh(false);
  };

  if (!needRefresh || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <Card className="p-4 shadow-lg border-2 border-primary bg-card">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <RefreshCw className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base mb-1">
              Nueva actualización disponible
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Hay una nueva versión de la aplicación. Recarga la página para obtener las últimas mejoras y correcciones.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                size="sm"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar ahora
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
