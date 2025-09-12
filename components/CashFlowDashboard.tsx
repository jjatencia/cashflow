import { ThemeProvider } from './ThemeProvider';
import { ThemeToggle } from './ThemeToggle';

interface CashFlowDashboardProps {
  user: string;
  onLogout: () => void;
}

export function CashFlowDashboard({ user, onLogout }: CashFlowDashboardProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="flex items-center justify-between border-b p-4">
          <h1 className="text-xl font-bold">Bienvenido, {user}</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-md border bg-card hover:bg-muted transition-colors"
            >
              Salir
            </button>
          </div>
        </header>
        <main className="p-4">
          <p className="text-muted-foreground">Próximamente: tablero de flujo de caja.</p>
        </main>
      </div>
    </ThemeProvider>
  );
}
