import { useEffect, useRef, useCallback } from 'react';

interface UseSessionTimeoutOptions {
  onTimeout: () => void;
  timeoutDuration?: number; // en milisegundos
  warningDuration?: number; // tiempo antes del timeout para mostrar warning
  onWarning?: () => void;
}

export const useSessionTimeout = ({
  onTimeout,
  timeoutDuration = 5 * 60 * 1000, // 5 minutos por defecto
  warningDuration = 1 * 60 * 1000, // 1 minuto de warning
  onWarning
}: UseSessionTimeoutOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    // Limpiar timers existentes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Timer de warning
    if (onWarning && warningDuration > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        onWarning();
      }, timeoutDuration - warningDuration);
    }

    // Timer principal de timeout
    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, timeoutDuration);
  }, [onTimeout, timeoutDuration, warningDuration, onWarning]);

  const handleUserActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // La pantalla se apagó o cambió de pestaña - solo pausar timer
      // onTimeout(); // Comentado temporalmente para evitar logout agresivo
    } else {
      // La pantalla volvió a estar visible - resetear timer
      resetTimer();
    }
  }, [onTimeout, resetTimer]);

  const handlePageBlur = useCallback(() => {
    // Cuando la ventana pierde el foco (iPad va a sleep, etc.)
    // onTimeout(); // Comentado temporalmente para evitar logout agresivo
  }, [onTimeout]);

  useEffect(() => {
    // Eventos de actividad del usuario
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown'
    ];

    // Agregar listeners de actividad
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Listener para cuando la página se oculta/muestra
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listener para cuando la ventana pierde el foco
    window.addEventListener('blur', handlePageBlur);

    // Iniciar el timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handlePageBlur);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [handleUserActivity, handleVisibilityChange, handlePageBlur, resetTimer]);

  return {
    resetTimer: handleUserActivity
  };
};