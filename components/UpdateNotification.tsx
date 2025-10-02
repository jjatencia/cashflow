import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { RefreshCw, X } from 'lucide-react';

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verificar si hay una nueva versión
    const checkForUpdates = async () => {
      try {
        // Hacer un fetch al index.html con un timestamp para evitar caché
        const response = await fetch(`/index.html?t=${Date.now()}`, {
          method: 'HEAD',
          cache: 'no-cache'
        });

        // Obtener el ETag o Last-Modified del servidor
        const etag = response.headers.get('etag');
        const lastModified = response.headers.get('last-modified');

        // Obtener la versión guardada en localStorage
        const storedVersion = localStorage.getItem('app-version');
        const currentVersion = etag || lastModified || '';

        if (storedVersion === null) {
          // Primera vez que carga la app
          localStorage.setItem('app-version', currentVersion);
        } else if (storedVersion !== currentVersion && currentVersion !== '') {
          // Hay una nueva versión disponible
          setUpdateAvailable(true);
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    // Verificar inmediatamente al cargar la aplicación
    checkForUpdates();

    // Verificar cuando la pestaña vuelve a estar visible (después de estar oculta)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !updateAvailable) {
        checkForUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateAvailable]);

  const handleUpdate = () => {
    // Limpiar caché y recargar
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    window.location.reload();
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!updateAvailable || dismissed) {
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
